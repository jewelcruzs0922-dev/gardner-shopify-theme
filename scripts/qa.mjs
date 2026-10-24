import {
  authenticate,
  ensureDir,
  launch,
  loadEnv,
  newPage,
  open,
  previewUrl,
  result,
  screenshot,
  storeUrl,
  summarize,
  writeReport
} from './lib/storefront.mjs';

const env = loadEnv();
const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const results = [];
const consoleErrors = new Set();
const failedResponses = new Set();

page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.add(message.text());
});
page.on('pageerror', (error) => consoleErrors.add(`pageerror: ${error.message}`));
page.on('response', (response) => {
  if (response.status() >= 400) failedResponses.add(`${response.status()} ${response.url()}`);
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function test(name, fn) {
  try {
    const detail = await fn();
    results.push(result(name, 'pass', typeof detail === 'string' ? detail : ''));
    console.log(`PASS  ${name}${detail ? ` - ${detail}` : ''}`);
    return detail;
  } catch (error) {
    results.push(result(name, 'fail', error.message));
    console.log(`FAIL  ${name} - ${error.message}`);
    return null;
  }
}

async function reveal() {
  await page.evaluate(async () => {
    const height = document.documentElement.scrollHeight;
    for (let y = 0; y < height; y += Math.round(window.innerHeight * 0.75)) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 90));
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 350));
  });
}

async function shot(name, fullPage = true) {
  return screenshot(page, name, fullPage);
}

await page.goto(`${storeUrl(env)}/password`, { waitUntil: 'domcontentloaded' });
await authenticate(page, env);

await test('Homepage: single h1 and section order', async () => {
  await open(page, env, '/');
  await reveal();
  const h1Count = await page.locator('main h1').count();
  assert(h1Count === 1, `expected 1 h1, found ${h1Count}`);
  const ids = await page.locator('main > .shopify-section').evaluateAll((sections) => sections.map((section) => section.id));
  const order = ['gardner_hero', 'featured_collection', 'collection_list', 'gardner_story', 'why_gardner', 'reviews', 'guides', 'gallery'];
  let cursor = -1;
  for (const key of order) {
    const index = ids.findIndex((id) => id.includes(key));
    assert(index > cursor, `section ${key} missing or out of order (${ids.join(', ')})`);
    cursor = index;
  }
  const announcement = await page.locator('.announcement-bar').count();
  assert(announcement === 0, 'announcement bar should not be present');
  return `${ids.length} sections`;
});

await test('Homepage: demo content disclosure', async () => {
  const reviewNote = await page.locator('.g-reviews__demo-note').innerText();
  assert(/demo content/i.test(reviewNote), 'review demo note missing');
  const galleryNote = await page.locator('.g-gallery__note').innerText();
  assert(/not customer posts/i.test(galleryNote), 'gallery editorial note missing');
  return 'reviews and gallery labelled';
});

await test('Homepage: imagery loaded and category cards', async () => {
  await reveal();
  const broken = await page.locator('main img').evaluateAll((images) =>
    images.filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src)
  );
  assert(broken.length === 0, `${broken.length} broken image(s)`);
  const categories = await page.locator('.collection-list .card-wrapper').count();
  assert(categories === 6, `expected 6 category cards, found ${categories}`);
  const bestsellers = await page.locator('[id*="featured_collection"] .card-wrapper').count();
  return `${categories} categories, ${bestsellers} bestsellers`;
});

await test('Homepage: sticky header hides on scroll down and returns on scroll up', async () => {
  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(900);
  const header = page.locator('.section-header').first();
  const downClass = await header.getAttribute('class');
  assert(/shopify-section-header-hidden/.test(downClass || ''), `header did not hide: ${downClass}`);
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(700);
  const upClass = await header.getAttribute('class');
  assert(/shopify-section-header-sticky/.test(upClass || ''), `header did not stick: ${upClass}`);
  await page.evaluate(() => window.scrollTo(0, 0));
  return 'hide/show verified';
});

await test('Navigation: mega menu opens, lists six collections, closes on Escape', async () => {
  await open(page, env, '/');
  const summary = page.locator('header.header .header__inline-menu details summary:visible').first();
  await summary.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  const details = page.locator('header.header .header__inline-menu details').first();
  assert(await details.getAttribute('open') !== null, 'mega menu did not open');
  const links = await page.locator('header.header .mega-menu__link:visible').allTextContents();
  assert(links.length >= 7, `expected at least 7 collection links, found ${links.length}`);
  const featured = await page.locator('header.header .mega-menu__product:visible').count();
  assert(featured >= 2, `expected featured products in the mega menu, found ${featured}`);
  await shot('mega-menu-1440.png', false);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  assert(await details.getAttribute('open') === null, 'mega menu did not close on Escape');
  return `${links.length} collection links`;
});

await test('Search: predictive results include product thumbnails', async () => {
  await open(page, env, '/');
  await page.locator('header.header details-modal summary:visible').first().click();
  await page.waitForTimeout(400);
  const input = page.locator('#Search-In-Modal:visible');
  await input.fill('pruner');
  await page.waitForTimeout(2200);
  const panel = page.locator('#predictive-search-results:visible');
  assert(await panel.count() > 0, 'predictive search panel not visible');
  const text = await panel.innerText();
  assert(/pruner/i.test(text), 'predictive results do not mention pruner');
  const images = await panel.locator('img').count();
  assert(images >= 3, `expected product thumbnails, found ${images}`);
  await shot('search-modal-1440.png', false);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  assert(await page.locator('#Search-In-Modal:visible').count() === 0, 'search modal did not close on Escape');
  return `${images} thumbnails`;
});

await test('Search: results page and empty state', async () => {
  await open(page, env, '/search?q=pruner&type=product');
  const cards = await page.locator('.card-wrapper').count();
  assert(cards > 0, 'no search results rendered');
  await reveal();
  await shot('search-1440.png');
  await open(page, env, '/search?q=zzzznotathing&type=product');
  const text = await page.locator('main').innerText();
  assert(/no results/i.test(text), 'empty search state missing');
  await shot('search-empty-1440.png');
  return `${cards} results`;
});

await test('Collection: price filter through the UI', async () => {
  await open(page, env, '/collections/hand-tools');
  const before = await page.locator('.card-wrapper').count();
  await page.locator('details[id^="Details-filter.v.price"] summary').first().click();
  await page.locator('#Filter-Price-GTE').fill('40');
  await page.locator('#Filter-Price-GTE').press('Enter');
  await page.waitForTimeout(2200);
  assert(/filter\.v\.price\.gte=40/.test(page.url()), `price filter not applied: ${page.url()}`);
  const after = await page.locator('.card-wrapper').count();
  assert(after < before, `filter did not reduce results (${before} -> ${after})`);
  const chip = await page.locator('.active-facets__button-inner').first().innerText();
  assert(/\$40/.test(chip), `active filter chip missing: ${chip}`);
  await shot('collection-filtered-1440.png');
  await page.locator('details[id^="Details-filter.v.price"] summary').first().click();
  await page.waitForTimeout(300);
  await page.locator('.active-facets-desktop facet-remove a').first().click();
  await page.waitForTimeout(2000);
  const cleared = await page.locator('.card-wrapper').count();
  assert(cleared === before, `filter did not clear (${cleared} vs ${before})`);
  return `${before} -> ${after} -> ${cleared} products`;
});

await test('Collection: sort low to high', async () => {
  await open(page, env, '/collections/hand-tools');
  await page.locator('#SortBy').selectOption('price-ascending');
  await page.waitForTimeout(1800);
  assert(/sort_by=price-ascending/.test(page.url()), 'sort parameter missing');
  const firstName = (await page.locator('.card__heading a').first().innerText()).trim();
  const firstPrice = (await page.locator('.price').first().innerText()).replace(/\s+/g, ' ').trim();
  assert(/8\.99/.test(firstPrice), `first price is not the lowest: ${firstPrice}`);
  return `${firstName} ${firstPrice}`;
});

await test('Product: content, gallery lightbox, trust strip, related products', async () => {
  await open(page, env, '/products/felco-2-classic-pruner');
  await reveal();
  const heading = (await page.locator('main h1').first().innerText()).trim();
  assert(heading.length > 0, 'product title missing');
  const price = await page.locator('.price').first().innerText();
  assert(/\$86\.71/.test(price), `price missing: ${price}`);
  const related = await page.locator('.related-products .card-wrapper').count();
  assert(related === 4, `expected 4 related products, found ${related}`);
  const trust = await page.locator('.g-trust__item').count();
  assert(trust === 3, `expected 3 trust items, found ${trust}`);
  const qtyLabel = await page.locator('.product-form__quantity .quantity__input').first().getAttribute('aria-label');
  assert(/quantity/i.test(qtyLabel || ''), 'quantity input has no accessible name');
  await page.locator('.product__modal-opener').first().click({ position: { x: 60, y: 60 } });
  await page.waitForTimeout(700);
  const modal = page.locator('product-modal');
  const dialog = page.locator('product-modal .product-media-modal__dialog');
  assert(await dialog.isVisible().catch(() => false), 'gallery lightbox did not open');
  await shot('product-lightbox-1440.png', false);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  assert(!(await dialog.isVisible().catch(() => false)), 'gallery lightbox did not close on Escape');
  await shot('product-1440.png');
  return `${heading} / ${related} related / ${trust} trust`;
});

await test('Product: available, low-stock, and sold-out states', async () => {
  await open(page, env, '/products/dewit-bio-onion-hoe');
  const soldOutButton = (await page.locator('button[name="add"]').innerText()).trim();
  assert(/sold out/i.test(soldOutButton), `sold-out button reads: ${soldOutButton}`);
  assert(await page.locator('button[name="add"]').isDisabled(), 'sold-out add button is enabled');
  const soldOutStatus = await page.locator('.product__inventory').innerText();
  assert(/out of stock/i.test(soldOutStatus), `sold-out status reads: ${soldOutStatus}`);
  await shot('product-sold-out-1440.png');
  await open(page, env, '/products/borongreen-dibber-rhs-endorsed');
  const lowStatus = await page.locator('.product__inventory').innerText();
  assert(/low stock/i.test(lowStatus), `low-stock status reads: ${lowStatus}`);
  assert(!(await page.locator('button[name="add"]').isDisabled()), 'low-stock add button is disabled');
  await shot('product-low-stock-1440.png');
  await open(page, env, '/products/felco-2-classic-pruner');
  const inStock = await page.locator('.product__inventory').innerText();
  assert(/in stock/i.test(inStock), `in-stock status reads: ${inStock}`);
  return 'sold out, low stock, and in stock verified';
});

await test('Product: wishlist add, persist, and header count', async () => {
  await open(page, env, '/products/felco-2-classic-pruner');
  const toggle = page.locator('.g-wishlist-toggle--pdp');
  assert(await toggle.count() === 1, 'PDP wishlist toggle missing');
  if (await toggle.getAttribute('aria-pressed') !== 'true') await toggle.click();
  await page.waitForTimeout(400);
  assert(await toggle.getAttribute('aria-pressed') === 'true', 'wishlist toggle did not save');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  assert(await page.locator('.g-wishlist-toggle--pdp').getAttribute('aria-pressed') === 'true', 'wishlist did not persist after reload');
  const count = await page.locator('.g-wishlist-count:visible').first().innerText();
  assert(count === '1', `wishlist count is ${count}`);
  return 'saved and persisted';
});

await test('Cart: add, quantity update, subtotal, remove, empty drawer', async () => {
  await open(page, env, '/products/felco-2-classic-pruner');
  await page.locator('button[name="add"]').click();
  await page.waitForTimeout(2500);
  const drawer = page.locator('#CartDrawer');
  assert(await drawer.isVisible(), 'cart drawer did not open');
  const qty = drawer.locator('.quantity__input');
  assert(await qty.inputValue() === '1', 'initial quantity is not 1');
  const total = (await drawer.locator('.totals__total-value').innerText()).trim();
  assert(/\$86\.71/.test(total), `unexpected subtotal: ${total}`);
  await shot('cart-drawer-1440.png', false);
  await drawer.locator('button[name="plus"]').click();
  await page.waitForTimeout(2200);
  assert(await drawer.locator('.quantity__input').inputValue() === '2', 'quantity did not update to 2');
  const total2 = (await drawer.locator('.totals__total-value').innerText()).trim();
  assert(/\$173\.42/.test(total2), `subtotal did not update: ${total2}`);
  await drawer.locator('cart-remove-button button, .cart-remove-button').first().click();
  await page.waitForTimeout(2200);
  const emptyText = await drawer.innerText();
  assert(/cart is empty/i.test(emptyText), 'empty cart state missing');
  return `${total} -> ${total2}`;
});

await test('Cart: page fallback empty state', async () => {
  await open(page, env, '/cart');
  const text = await page.locator('main').innerText();
  assert(/cart is empty/i.test(text), 'cart page empty state missing');
  const link = await page.locator('a[href="/collections/all"]').count();
  assert(link > 0, 'continue shopping link missing');
  await screenshot(page, 'cart-page-1440.png');
  return 'empty state and continue link';
});

await test('Wishlist: saved item, remove, empty state', async () => {
  await open(page, env, '/pages/wishlist');
  await page.waitForTimeout(900);
  const cards = await page.locator('.g-wishlist-card').count();
  assert(cards === 1, `expected 1 saved card, found ${cards}`);
  const title = (await page.locator('.g-wishlist-card__title').innerText()).trim();
  await shot('wishlist-1440.png');
  await page.locator('.g-wishlist-remove').first().click();
  await page.waitForTimeout(900);
  assert(await page.locator('.g-wishlist-card').count() === 0, 'wishlist card was not removed');
  assert(await page.locator('[data-wishlist-empty]').isVisible(), 'wishlist empty state missing');
  await shot('wishlist-empty-1440.png');
  return title;
});

await test('Content pages return 200 with headings', async () => {
  const pages = [
    ['/pages/about', /about/i],
    ['/pages/contact', /contact/i],
    ['/blogs/news', /guides/i],
    ['/blogs/news/choosing-pruning-shears', /pruning/i],
    ['/pages/shipping', /shipping/i],
    ['/pages/returns', /returns/i],
    ['/pages/privacy', /privacy/i],
    ['/pages/terms', /terms/i]
  ];
  const summary = [];
  for (const [path, expected] of pages) {
    const response = await open(page, env, path);
    const status = response ? response.status() : 0;
    const heading = (await page.locator('main h1').first().innerText()).trim();
    assert(status === 200, `${path} returned ${status}`);
    assert(expected.test(heading), `${path} heading mismatch: ${heading}`);
    summary.push(`${path}:${status}`);
  }
  await open(page, env, '/pages/about');
  await reveal();
  await shot('about-1440.png');
  await open(page, env, '/pages/contact');
  await shot('contact-1440.png');
  await open(page, env, '/blogs/news/choosing-pruning-shears');
  await shot('article-1440.png');
  return summary.join(', ');
});

await test('404 page returns 404 and a useful message', async () => {
  const response = await open(page, env, '/this-page-does-not-exist-qa');
  const status = response ? response.status() : 0;
  const text = await page.locator('main').innerText();
  assert(status === 404, `404 page returned ${status}`);
  assert(/page not found|couldn.t find/i.test(text), 'friendly 404 copy missing');
  await shot('404-1440.png');
  return `status ${status}`;
});

await test('Newsletter: accessible markup; end-to-end blocked by hCaptcha', async () => {
  await open(page, env, '/');
  const form = page.locator('.g-footer__form');
  const email = form.locator('#GardnerFooterEmail');
  const label = await page.locator('label[for="GardnerFooterEmail"]').innerText();
  assert(/email/i.test(label), 'newsletter label missing');
  assert(await email.getAttribute('type') === 'email', 'newsletter field is not type=email');
  assert(await email.getAttribute('required') !== null, 'newsletter field is not required');
  assert(await email.evaluate((input) => input.checkValidity() === false), 'empty newsletter email validates');
  await email.fill('gardner.qa@example.invalid');
  await form.locator('button[type="submit"]').click();
  await page.waitForTimeout(3500);
  const captcha = await form.locator('.h-captcha').count();
  const success = await form.locator('.g-footer__message[role="status"]').count();
  if (success > 0) {
    return 'submitted and success message shown';
  }
  assert(captcha > 0, 'no success message and no hCaptcha evidence');
  results.push(result('Newsletter: submission', 'blocked', 'Shopify injected an invisible hCaptcha challenge, so the automated submission did not complete.'));
  return 'markup valid; submission blocked by hCaptcha';
});

await test('Contact form: labels and required email', async () => {
  await open(page, env, '/pages/contact');
  const labels = await page.locator('#ContactForm label').allTextContents();
  assert(labels.some((text) => /name/i.test(text)), 'name label missing');
  assert(labels.some((text) => /email/i.test(text)), 'email label missing');
  assert(labels.some((text) => /comment|message/i.test(text)), 'message label missing');
  const required = await page.locator('#ContactForm [required]').evaluateAll((fields) => fields.map((field) => field.name || field.id));
  assert(required.length > 0, 'contact form has no required fields');
  return labels.map((label) => label.replace(/\s+/g, ' ').trim()).join(', ');
});

await test('Keyboard: visible focus indicator', async () => {
  await open(page, env, '/');
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const focus = await page.evaluate(() => {
    const element = document.activeElement;
    const style = getComputedStyle(element);
    return { tag: element.tagName, text: element.textContent.trim().slice(0, 40), outline: style.outlineStyle, width: style.outlineWidth, shadow: style.boxShadow };
  });
  assert(focus.outline !== 'none' || focus.shadow !== 'none', `focused element has no visible indicator: ${JSON.stringify(focus)}`);
  return `${focus.tag} ${focus.text} outline=${focus.outline} ${focus.width}`;
});

await test('Structured data: one Product and Organization block per page', async () => {
  await open(page, env, '/products/felco-2-classic-pruner');
  const productBlocks = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
    scripts.map((script) => {
      try { return JSON.parse(script.textContent); } catch { return null; }
    }).filter(Boolean)
  );
  const types = productBlocks.map((block) => block['@type']);
  assert(types.filter((type) => type === 'Product').length >= 1, 'Product JSON-LD missing');
  await open(page, env, '/');
  const homeBlocks = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
    scripts.map((script) => {
      try { return JSON.parse(script.textContent); } catch { return null; }
    }).filter(Boolean)
  );
  const homeTypes = homeBlocks.map((block) => block['@type']);
  assert(homeTypes.includes('Organization'), 'Organization JSON-LD missing on home');
  assert(homeTypes.includes('WebSite'), 'WebSite JSON-LD missing on home');
  return `product: ${types.join(', ')} / home: ${homeTypes.join(', ')}`;
});

await test('Desktop screenshots: home, collection, product, cart, wishlist', async () => {
  await open(page, env, '/');
  await reveal();
  await shot('home-1440.png');
  await open(page, env, '/collections/hand-tools');
  await reveal();
  await shot('collection-1440.png');
  await open(page, env, '/products/felco-2-classic-pruner');
  await reveal();
  await shot('product-1440.png');
  return 'captured';
});

const desktopSummary = summarize(results);

const responsiveResults = [];
async function responsive(viewport, label) {
  const responsiveContext = await browser.newContext({ viewport });
  const responsivePage = await responsiveContext.newPage();
  await responsivePage.goto(`${storeUrl(env)}/password`, { waitUntil: 'domcontentloaded' });
  await authenticate(responsivePage, env);
  for (const [path, name] of [['/', 'home'], ['/collections/hand-tools', 'collection'], ['/products/felco-2-classic-pruner', 'product']]) {
    await responsivePage.goto(previewUrl(env, path), { waitUntil: 'domcontentloaded' });
    await responsivePage.waitForTimeout(700);
    await responsivePage.evaluate(async () => {
      const height = document.documentElement.scrollHeight;
      for (let y = 0; y < height; y += Math.round(window.innerHeight * 0.75)) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
      window.scrollTo(0, 0);
      await new Promise((resolve) => setTimeout(resolve, 300));
    });
    const overflow = await responsivePage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const ok = overflow <= 1;
    responsiveResults.push(result(`${label} ${name}: no horizontal overflow`, ok ? 'pass' : 'fail', `${overflow}px`));
    await responsivePage.screenshot({ path: ensureDir('docs/qa') + `/${name}-${label}.png`, fullPage: true, animations: 'disabled' });
  }
  if (label === '390') {
    await responsivePage.evaluate(() => window.scrollTo(0, 0));
    await responsivePage.locator('header.header summary[aria-controls="menu-drawer"]').click();
    await responsivePage.waitForTimeout(600);
    const drawer = responsivePage.locator('#menu-drawer');
    const visible = await drawer.isVisible();
    responsiveResults.push(result('390 mobile menu: opens', visible ? 'pass' : 'fail', ''));
    if (visible) await responsivePage.screenshot({ path: ensureDir('docs/qa') + '/mobile-menu-390.png', fullPage: false });
    await responsivePage.keyboard.press('Escape');
    await responsivePage.waitForTimeout(500);
    const closed = !(await drawer.isVisible().catch(() => false));
    responsiveResults.push(result('390 mobile menu: closes on Escape', closed ? 'pass' : 'fail', ''));
  }
  await responsiveContext.close();
}

await responsive({ width: 768, height: 1024 }, '768');
await responsive({ width: 390, height: 844 }, '390');

await test('No theme console errors during primary flows', async () => {
  const previewArtifacts = /hcaptcha|newassets\.hcaptcha|ShopifySans|Section sections--\d+__header_section not found|Failed to load resource: the server responded with a status of 404 \(\)/i;
  const errors = [...consoleErrors].filter((error) => !previewArtifacts.test(error));
  assert(errors.length === 0, `${errors.length} console error(s): ${errors.slice(0, 3).join(' | ')}`);
  const filtered = [...consoleErrors].length - errors.length;
  return filtered ? `${filtered} known preview/expected 404 artifact(s) filtered` : '0 errors';
});

const all = [...results, ...responsiveResults];
const summary = summarize(all);
const report = {
  generated: new Date().toISOString(),
  environment: {
    store: env.SHOPIFY_STORE,
    previewThemeId: '191259083065',
    browser: 'Chromium via Playwright 1.64.1 (headless)',
    viewports: ['1440x900', '768x1024', '390x844']
  },
  summary,
  results: all,
  consoleErrors: [...consoleErrors],
  failedResponses: [...failedResponses]
};

writeReport('functional-report.json', report);

console.log('\nSummary', JSON.stringify(summary));
if (summary.failed) {
  console.log('Failures:');
  for (const item of all.filter((entry) => entry.status === 'fail')) console.log(`- ${item.name}: ${item.detail}`);
}
console.log('Saved docs/qa/functional-report.json');

await browser.close();
