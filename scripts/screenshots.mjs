import fs from 'node:fs';
import path from 'node:path';
import {
  authenticate,
  ensureDir,
  launch,
  loadEnv,
  open,
  storeUrl
} from './lib/storefront.mjs';

const env = loadEnv();
const root = ensureDir('docs/audit');
const dirs = {
  desktop: ensureDir('docs/audit/desktop'),
  mobile: ensureDir('docs/audit/mobile'),
  states: ensureDir('docs/audit/states')
};

const browser = await launch();

async function prepare(page) {
  await page.evaluate(() => {
    document.querySelectorAll('#PBarNextFrameWrapper, #PBarNextFrame, .shopify-preview-bar').forEach((node) => node.remove());
    const style = document.createElement('style');
    style.textContent = '#PBarNextFrameWrapper, #PBarNextFrame, .shopify-preview-bar { display: none !important; }';
    document.head.appendChild(style);
  });
  await page.evaluate(async () => {
    const height = document.documentElement.scrollHeight;
    for (let y = 0; y < height; y += Math.round(window.innerHeight * 0.8)) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 70));
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 250));
  });
  await page.waitForTimeout(800);
}

async function capture(page, file, options = {}) {
  console.log('Capturing', path.basename(file));
  await prepare(page);
  await page.screenshot({
    path: file,
    fullPage: options.fullPage !== false,
    type: 'jpeg',
    quality: 86,
    animations: 'disabled'
  });
  console.log(path.relative(process.cwd(), file));
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const desktopPage = await desktop.newPage();
await desktopPage.goto(`${storeUrl(env)}/password`, { waitUntil: 'domcontentloaded' });
await authenticate(desktopPage, env);

const desktopPages = [
  ['01-home', '/'],
  ['02-collections', '/collections'],
  ['03-collection-hand-tools', '/collections/hand-tools'],
  ['04-collection-soil-care', '/collections/soil-care'],
  ['05-product-in-stock', '/products/felco-2-classic-pruner'],
  ['06-product-low-stock', '/products/borongreen-dibber-rhs-endorsed'],
  ['07-product-sold-out', '/products/dewit-bio-onion-hoe'],
  ['08-search-results', '/search?q=pruner&type=product'],
  ['09-search-empty', '/search?q=zzzznotathing&type=product'],
  ['10-cart-empty', '/cart'],
  ['11-wishlist-empty', '/pages/wishlist'],
  ['12-about', '/pages/about'],
  ['13-contact', '/pages/contact'],
  ['14-guides', '/blogs/news'],
  ['15-article', '/blogs/news/choosing-pruning-shears'],
  ['16-shipping', '/pages/shipping'],
  ['17-returns', '/pages/returns'],
  ['18-privacy', '/pages/privacy'],
  ['19-terms', '/pages/terms'],
  ['20-404', '/this-page-does-not-exist-qa']
];

const manifest = [];

for (const [name, urlPath] of desktopPages) {
  await open(desktopPage, env, urlPath);
  await capture(desktopPage, path.join(dirs.desktop, `${name}.jpg`));
  manifest.push({ viewport: '1440x900', file: `desktop/${name}.jpg`, path: urlPath });
}

// Saved wishlist
await open(desktopPage, env, '/pages/wishlist');
await desktopPage.evaluate(() => localStorage.setItem('gardner:wishlist', JSON.stringify(['felco-2-classic-pruner'])));
await desktopPage.reload({ waitUntil: 'domcontentloaded' });
await desktopPage.waitForTimeout(900);
await capture(desktopPage, path.join(dirs.desktop, '21-wishlist-saved.jpg'));
manifest.push({ viewport: '1440x900', file: 'desktop/21-wishlist-saved.jpg', path: '/pages/wishlist (saved item)' });

// Cart with an item
await open(desktopPage, env, '/products/felco-2-classic-pruner');
await desktopPage.locator('button[name="add"]').click();
await desktopPage.waitForTimeout(2200);
await open(desktopPage, env, '/cart');
await capture(desktopPage, path.join(dirs.desktop, '22-cart-with-item.jpg'));
manifest.push({ viewport: '1440x900', file: 'desktop/22-cart-with-item.jpg', path: '/cart (one item)' });
await desktopPage.request.post(`${storeUrl(env)}/cart/clear.js`);
await desktopPage.evaluate(() => localStorage.removeItem('gardner:wishlist'));

// Desktop states
await open(desktopPage, env, '/');
await prepare(desktopPage);
await desktopPage.locator('header.header .header__inline-menu details summary:visible').first().click();
await desktopPage.waitForTimeout(500);
await desktopPage.screenshot({ path: path.join(dirs.states, 'desktop-mega-menu.jpg'), fullPage: false, type: 'jpeg', quality: 86 });
manifest.push({ viewport: '1440x900', file: 'states/desktop-mega-menu.jpg', path: '/ (mega menu open)' });
await desktopPage.keyboard.press('Escape');

await prepare(desktopPage);
await desktopPage.locator('header.header details-modal summary:visible').first().click();
await desktopPage.waitForTimeout(300);
await desktopPage.locator('#Search-In-Modal:visible').fill('pruner');
await desktopPage.waitForTimeout(1800);
await desktopPage.screenshot({ path: path.join(dirs.states, 'desktop-predictive-search.jpg'), fullPage: false, type: 'jpeg', quality: 86 });
manifest.push({ viewport: '1440x900', file: 'states/desktop-predictive-search.jpg', path: '/ (predictive search)' });
await desktopPage.keyboard.press('Escape');

await open(desktopPage, env, '/collections/hand-tools');
await prepare(desktopPage);
await desktopPage.locator('details[id^="Details-filter.v.price"] summary').first().click();
await desktopPage.waitForTimeout(300);
await desktopPage.screenshot({ path: path.join(dirs.states, 'desktop-filters-open.jpg'), fullPage: false, type: 'jpeg', quality: 86 });
manifest.push({ viewport: '1440x900', file: 'states/desktop-filters-open.jpg', path: '/collections/hand-tools (price filter open)' });

await open(desktopPage, env, '/products/felco-2-classic-pruner');
await prepare(desktopPage);
await desktopPage.locator('.product__modal-opener').first().click({ position: { x: 60, y: 60 } });
await desktopPage.waitForTimeout(600);
await desktopPage.screenshot({ path: path.join(dirs.states, 'desktop-gallery-lightbox.jpg'), fullPage: false, type: 'jpeg', quality: 86 });
manifest.push({ viewport: '1440x900', file: 'states/desktop-gallery-lightbox.jpg', path: '/products/felco-2-classic-pruner (lightbox)' });
await desktopPage.keyboard.press('Escape');

await open(desktopPage, env, '/products/felco-2-classic-pruner');
await prepare(desktopPage);
await desktopPage.locator('button[name="add"]').click();
await desktopPage.waitForTimeout(2200);
await desktopPage.screenshot({ path: path.join(dirs.states, 'desktop-cart-drawer.jpg'), fullPage: false, type: 'jpeg', quality: 86 });
manifest.push({ viewport: '1440x900', file: 'states/desktop-cart-drawer.jpg', path: 'PDP (cart drawer open)' });
await desktopPage.request.post(`${storeUrl(env)}/cart/clear.js`);
await desktop.close();

// Mobile
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const mobilePage = await mobile.newPage();
await mobilePage.goto(`${storeUrl(env)}/password`, { waitUntil: 'domcontentloaded' });
await authenticate(mobilePage, env);

const mobilePages = [
  ['01-home', '/'],
  ['02-collections', '/collections'],
  ['03-collection-hand-tools', '/collections/hand-tools'],
  ['04-product', '/products/felco-2-classic-pruner'],
  ['05-cart-empty', '/cart'],
  ['06-wishlist-empty', '/pages/wishlist'],
  ['07-about', '/pages/about'],
  ['08-contact', '/pages/contact'],
  ['09-guides', '/blogs/news'],
  ['10-article', '/blogs/news/choosing-pruning-shears'],
  ['11-404', '/this-page-does-not-exist-qa']
];

for (const [name, urlPath] of mobilePages) {
  await open(mobilePage, env, urlPath);
  await capture(mobilePage, path.join(dirs.mobile, `${name}.jpg`));
  manifest.push({ viewport: '390x844', file: `mobile/${name}.jpg`, path: urlPath });
}

await open(mobilePage, env, '/');
await prepare(mobilePage);
await mobilePage.locator('header.header summary[aria-controls="menu-drawer"]').click();
await mobilePage.waitForTimeout(500);
await mobilePage.screenshot({ path: path.join(dirs.states, 'mobile-menu.jpg'), fullPage: false, type: 'jpeg', quality: 86 });
manifest.push({ viewport: '390x844', file: 'states/mobile-menu.jpg', path: '/ (mobile menu open)' });
await mobilePage.keyboard.press('Escape');

await mobile.close();
await browser.close();

const readme = `Gardner Visual Audit Screenshot Set

Captured: ${new Date().toISOString()}
Store: ${env.SHOPIFY_STORE}
Preview theme: 191259083065 (unpublished development store)
Viewports: desktop 1440x900, mobile 390x844 (DSF 2)
Format: JPEG quality 86; full-page except the state screenshots.

Important context for the reviewer:
- This is a demonstration storefront. Prices, inventory, reviews, and policies are demo content.
- Reviews are visibly labeled "Sample"/"Demo content"; there are no real customer reviews.
- The store is password-protected; screenshots were taken from an authenticated preview.
- The Shopify preview bar was removed from these captures so it does not obscure the design.
- Product photography is sourced from brand/retailer listings; usage rights are not licensed.
- Some pages are intentionally editorial/minimal (About, Shipping, Returns, Privacy, Terms are drafts).
- Mobile screenshots are full-page and therefore very tall; the state screenshots are viewport-sized.

Manifest:
${manifest.map((item) => `- ${item.viewport} | ${item.file} | ${item.path}`).join('\n')}
`;

fs.writeFileSync(path.join(root, 'README.txt'), readme, 'utf8');
fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify({ captured: new Date().toISOString(), viewports: ['1440x900', '390x844'], manifest }, null, 2), 'utf8');
console.log(`\nSaved ${manifest.length} screenshots to docs/audit`);
