import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

export const PREVIEW_THEME_ID = process.env.GARDNER_PREVIEW_THEME_ID || '191259083065';

export function loadEnv() {
  const file = path.join(process.cwd(), '.env');
  if (!fs.existsSync(file)) {
    throw new Error('Missing .env. Copy .env.example and fill in local values.');
  }
  const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2].replace(/\r$/, '');
  }
  for (const key of ['SHOPIFY_STORE', 'SHOPIFY_STOREFRONT_PASSWORD']) {
    if (!env[key]) throw new Error(`Missing ${key} in .env`);
  }
  return env;
}

export function storeUrl(env) {
  return `https://${env.SHOPIFY_STORE}`;
}

export function previewUrl(env, pathname = '/') {
  const url = new URL(pathname, storeUrl(env));
  url.searchParams.set('preview_theme_id', PREVIEW_THEME_ID);
  return url.toString();
}

export async function launch() {
  return chromium.launch();
}

export async function newPage(browser, options = {}) {
  const context = await browser.newContext({
    viewport: options.viewport || { width: 1440, height: 900 },
    reducedMotion: options.reducedMotion || 'no-preference',
    baseURL: options.baseURL
  });
  const page = await context.newPage();
  page.on('console', (message) => {
    if (message.type() === 'error') page.__consoleErrors = (page.__consoleErrors || []).concat(message.text());
  });
  page.on('pageerror', (error) => {
    page.__pageErrors = (page.__pageErrors || []).concat(error.message);
  });
  page.on('requestfailed', (request) => {
    page.__requestFailures = (page.__requestFailures || []).concat(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`);
  });
  return page;
}

export async function authenticate(page, env) {
  if (await page.locator('input[name="password"]').count()) {
    await page.locator('input[name="password"]').fill(env.SHOPIFY_STOREFRONT_PASSWORD);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.locator('button[type="submit"]').first().click()
    ]);
  }
}

export async function open(page, env, pathname = '/', options = {}) {
  const response = await page.goto(previewUrl(env, pathname), { waitUntil: 'domcontentloaded' });
  await authenticate(page, env);
  const wanted = new URL(previewUrl(env, pathname));
  if (new URL(page.url()).pathname !== wanted.pathname) {
    await page.goto(wanted.toString(), { waitUntil: 'domcontentloaded' });
  }
  await page.waitForTimeout(options.wait ?? 700);
  return response;
}

export function ensureDir(dir) {
  fs.mkdirSync(path.join(process.cwd(), dir), { recursive: true });
  return path.join(process.cwd(), dir);
}

export async function screenshot(page, name, fullPage = true) {
  const dir = ensureDir('docs/qa');
  const file = path.join(dir, name);
  await page.screenshot({ path: file, fullPage, animations: 'disabled' });
  return file;
}

export function result(name, status, detail = '') {
  return { name, status, detail };
}

export function summarize(results) {
  return {
    passed: results.filter((r) => r.status === 'pass').length,
    failed: results.filter((r) => r.status === 'fail').length,
    blocked: results.filter((r) => r.status === 'blocked').length,
    info: results.filter((r) => r.status === 'info').length,
    total: results.length
  };
}

export function writeReport(name, payload) {
  const dir = ensureDir('docs/qa');
  const file = path.join(dir, name);
  fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return file;
}
