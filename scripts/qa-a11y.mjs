import { AxeBuilder } from '@axe-core/playwright';
import {
  authenticate,
  ensureDir,
  launch,
  loadEnv,
  newPage,
  open,
  previewUrl,
  storeUrl,
  writeReport
} from './lib/storefront.mjs';
import path from 'node:path';

const env = loadEnv();
const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const pages = [
  { name: 'home', path: '/' },
  { name: 'collection', path: '/collections/hand-tools' },
  { name: 'product', path: '/products/felco-2-classic-pruner' },
  { name: 'search', path: '/search?q=pruner&type=product' },
  { name: 'search-empty', path: '/search?q=zzzznotathing&type=product' },
  { name: 'cart', path: '/cart' },
  { name: 'wishlist', path: '/pages/wishlist' },
  { name: 'about', path: '/pages/about' },
  { name: 'contact', path: '/pages/contact' },
  { name: 'guides', path: '/blogs/news' },
  { name: 'article', path: '/blogs/news/choosing-pruning-shears' },
  { name: 'policies', path: '/pages/privacy' },
  { name: '404', path: '/this-page-does-not-exist-qa' }
];

const report = { generated: new Date().toISOString(), viewport: '1440x900', pages: [], states: [] };

async function scan(label, include) {
  const builder = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .exclude('#PBarNextFrame');
  if (include) builder.include(include);
  const results = await builder.analyze();
  return {
    label,
    url: page.url(),
    violations: results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      nodes: violation.nodes.map((node) => ({
        target: node.target,
        html: node.html.slice(0, 300),
        failureSummary: node.failureSummary
      }))
    })),
    passes: results.passes.length,
    incomplete: results.incomplete.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length }))
  };
}

await page.goto(`${storeUrl(env)}/password`, { waitUntil: 'domcontentloaded' });
await authenticate(page, env);

async function revealPage() {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 400));
  });
}

for (const entry of pages) {
  await open(page, env, entry.path);
  await revealPage();
  const scanResult = await scan(entry.name);
  report.pages.push(scanResult);
  const count = scanResult.violations.length;
  console.log(`${entry.name}: ${count} violation types`);
}

await open(page, env, '/');
await revealPage();
await page.locator('header.header .header__inline-menu details summary:visible').first().click();
await page.waitForTimeout(400);
report.states.push(await scan('mega-menu-open'));

await open(page, env, '/');
await revealPage();
await page.locator('header.header details-modal summary:visible').first().click();
await page.waitForTimeout(400);
report.states.push(await scan('search-modal-open'));

await open(page, env, '/products/felco-2-classic-pruner');
await revealPage();
await page.locator('button[name="add"]').click();
await page.waitForTimeout(2500);
report.states.push(await scan('cart-drawer-open'));

await open(page, env, '/products/felco-2-classic-pruner');
await revealPage();
await page.locator('.g-wishlist-toggle--pdp').click();
await page.waitForTimeout(300);
report.states.push(await scan('wishlist-saved'));

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const mobilePage = await mobile.newPage();
await mobilePage.goto(`${storeUrl(env)}/password`, { waitUntil: 'domcontentloaded' });
await authenticate(mobilePage, env);
await mobilePage.goto(previewUrl(env, '/'), { waitUntil: 'domcontentloaded' });
await mobilePage.waitForTimeout(800);
const mobileHeight = await mobilePage.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < mobileHeight; y += 500) {
  await mobilePage.evaluate((value) => window.scrollTo(0, value), y);
  await mobilePage.waitForTimeout(100);
}
await mobilePage.evaluate(() => window.scrollTo(0, 0));
await mobilePage.waitForTimeout(300);
await mobilePage.locator('header.header summary[aria-controls="menu-drawer"]').click();
await mobilePage.waitForTimeout(500);
const mobileBuilder = new AxeBuilder({ page: mobilePage })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
  .exclude('#PBarNextFrame');
const mobileResults = await mobileBuilder.analyze();
report.states.push({
  label: 'mobile-menu-open',
  url: mobilePage.url(),
  viewport: '390x844',
  violations: mobileResults.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    help: violation.help,
    nodes: violation.nodes.map((node) => ({
      target: node.target,
      html: node.html.slice(0, 300),
      failureSummary: node.failureSummary
    }))
  })),
  passes: mobileResults.passes.length,
  incomplete: mobileResults.incomplete.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length }))
});

const all = [...report.pages, ...report.states];
const totals = {};
for (const entry of all) {
  for (const violation of entry.violations) {
    const key = violation.id;
    totals[key] = totals[key] || { id: key, impact: violation.impact, pages: [], nodes: 0 };
    totals[key].pages.push(entry.label);
    totals[key].nodes += violation.nodes.length;
  }
}
report.totals = Object.values(totals).sort((a, b) => b.nodes - a.nodes);

const dir = ensureDir('docs/qa');
const file = path.join(dir, 'axe-report.json');
report.file = file;
writeReport('axe-report.json', report);

console.log('\nTotals');
for (const item of report.totals) {
  console.log(`${item.id} (${item.impact}) x${item.nodes} on ${[...new Set(item.pages)].join(', ')}`);
}
console.log(`\nSaved ${file}`);

await browser.close();
