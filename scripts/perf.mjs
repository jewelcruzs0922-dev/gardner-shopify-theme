import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';

const raw = fs.readFileSync('.env', 'utf8').replace(/^\uFEFF/, '');
const env = Object.fromEntries(raw.split(/\r?\n/).map((line) => line.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/\r$/, '')]));
const base = `https://${env.SHOPIFY_STORE}`;
const preview = '191259083065';

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
await page.goto(`${base}/password`, { waitUntil: 'domcontentloaded' });
await page.locator('input[name="password"]').fill(env.SHOPIFY_STOREFRONT_PASSWORD);
await Promise.all([page.waitForNavigation(), page.locator('button[type="submit"]').first().click()]);
await page.goto(`${base}/?preview_theme_id=${preview}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);
const cookies = await context.cookies();
const cookieHeader = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');
await browser.close();

const outputDir = path.join(process.cwd(), 'docs', 'qa');
fs.mkdirSync(outputDir, { recursive: true });

const median = (values) => {
  const sorted = values.filter((value) => typeof value === 'number').sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

function runLighthouse({ name, targetPath, form, blocked = [], suffix = '' }) {
  const reportPath = path.join('.tmp', `lh-${name}${suffix}.json`);
  const args = [
    'node_modules/lighthouse/cli/index.js',
    `${base}${targetPath}`,
    `--extra-headers=${JSON.stringify({ Cookie: cookieHeader })}`,
    '--output=json',
    `--output-path=${reportPath}`,
    '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
    '--only-categories=performance,accessibility,best-practices,seo',
    '--quiet'
  ];
  if (form === 'desktop') args.push('--preset=desktop');
  else args.push('--form-factor=mobile', '--screenEmulation.mobile=true');
  for (const pattern of blocked) args.push(`--blocked-url-patterns=${pattern}`);
  const result = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 180000 });
  if (result.status !== 0) {
    console.error(name, suffix, 'failed', result.stderr?.slice(0, 300));
    return null;
  }
  const json = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const audit = (id) => json.audits[id]?.numericValue ?? null;
  return {
    finalUrl: json.finalUrl,
    categories: Object.fromEntries(Object.entries(json.categories).map(([key, value]) => [key, Math.round(value.score * 100)])),
    metrics: {
      fcp: audit('first-contentful-paint'),
      lcp: audit('largest-contentful-paint'),
      tbt: audit('total-blocking-time'),
      cls: audit('cumulative-layout-shift'),
      speedIndex: audit('speed-index'),
      interactive: audit('interactive')
    },
    raw: json
  };
}

function summarizeRuns(name, form, runs) {
  const categories = {};
  for (const key of Object.keys(runs[0].categories)) categories[key] = median(runs.map((run) => run.categories[key]));
  const metrics = {};
  for (const key of Object.keys(runs[0].metrics)) metrics[key] = median(runs.map((run) => run.metrics[key]));
  const representative = runs
    .slice()
    .sort((a, b) => Math.abs((a.categories.performance || 0) - (categories.performance || 0)) - Math.abs((b.categories.performance || 0) - (categories.performance || 0)))[0];
  fs.writeFileSync(path.join(outputDir, `lighthouse-${name}.json`), JSON.stringify(representative.raw, null, 2));
  return {
    name,
    formFactor: form,
    runs: runs.length,
    categories,
    metrics,
    ranges: Object.fromEntries(Object.keys(metrics).map((key) => [key, {
      min: Math.min(...runs.map((run) => run.metrics[key]).filter((value) => typeof value === 'number')),
      max: Math.max(...runs.map((run) => run.metrics[key]).filter((value) => typeof value === 'number'))
    }])),
    file: `docs/qa/lighthouse-${name}.json`
  };
}

const targets = [
  { name: 'home-mobile', path: '/', form: 'mobile', runs: 3 },
  { name: 'home-desktop', path: '/', form: 'desktop', runs: 3 },
  { name: 'collection-mobile', path: '/collections/hand-tools', form: 'mobile', runs: 2 },
  { name: 'product-mobile', path: '/products/felco-2-classic-pruner', form: 'mobile', runs: 2 }
];

const summary = [];
for (const target of targets) {
  const runs = [];
  for (let index = 0; index < target.runs; index++) {
    const run = runLighthouse({ name: target.name, targetPath: target.path, form: target.form, suffix: `-${index}` });
    if (run) runs.push(run);
  }
  if (!runs.length) continue;
  const entry = summarizeRuns(target.name, target.form, runs);
  summary.push(entry);
  console.log(target.name, JSON.stringify(entry.categories), 'LCP', Math.round(entry.metrics.lcp || 0), `(${Math.round(entry.ranges.lcp.min)}-${Math.round(entry.ranges.lcp.max)})`, 'TBT', Math.round(entry.metrics.tbt || 0), 'CLS', Number(entry.metrics.cls || 0).toFixed(3));
}

const blockedPatterns = ['*preview-bar*', '*shop-js*', '*checkout-web*', '*shop.app*', '*web-pixel*', '*trekkie*', '*perf-kit*'];
const diagnostics = [];
for (const target of [{ name: 'home-mobile', path: '/' }, { name: 'product-mobile', path: '/products/felco-2-classic-pruner' }]) {
  const run = runLighthouse({ name: `theme-only-${target.name}`, targetPath: target.path, form: 'mobile', blocked: blockedPatterns, suffix: '-blocked' });
  if (!run) continue;
  fs.writeFileSync(path.join(outputDir, `lighthouse-theme-only-${target.name}.json`), JSON.stringify(run.raw, null, 2));
  const entry = {
    name: `theme-only-${target.name}`,
    formFactor: 'mobile',
    categories: run.categories,
    metrics: run.metrics,
    blockedPatterns,
    note: 'Diagnostic only: Shopify preview bar, Shop Pay/cart-sync, checkout assets, web pixels, analytics, and perf-kit were blocked to estimate the theme contribution. Not the storefront score.',
    file: `docs/qa/lighthouse-theme-only-${target.name}.json`
  };
  diagnostics.push(entry);
  console.log(entry.name, JSON.stringify(entry.categories), 'LCP', Math.round(entry.metrics.lcp || 0), 'TBT', Math.round(entry.metrics.tbt || 0), 'CLS', Number(entry.metrics.cls || 0).toFixed(3));
}

fs.writeFileSync(path.join(outputDir, 'lighthouse-summary.json'), JSON.stringify({
  generated: new Date().toISOString(),
  note: 'Median of repeated Lighthouse runs against the password-protected preview theme. The preview bar and Shopify platform scripts are present in the primary runs.',
  runs: summary,
  diagnostics
}, null, 2));
console.log('saved');
