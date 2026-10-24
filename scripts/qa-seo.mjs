import {
  authenticate,
  launch,
  loadEnv,
  newPage,
  open,
  previewUrl,
  result,
  storeUrl,
  summarize,
  writeReport
} from './lib/storefront.mjs';

const env = loadEnv();
const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

await page.goto(`${storeUrl(env)}/password`, { waitUntil: 'domcontentloaded' });
await authenticate(page, env);

const results = [];
function check(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then((detail) => {
      results.push(result(name, 'pass', detail || ''));
      console.log(`PASS  ${name}${detail ? ` - ${detail}` : ''}`);
    })
    .catch((error) => {
      results.push(result(name, 'fail', error.message));
      console.log(`FAIL  ${name} - ${error.message}`);
    });
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const pages = [
  { name: 'home', path: '/', status: 200 },
  { name: 'collection', path: '/collections/hand-tools', status: 200 },
  { name: 'collection-filtered', path: '/collections/hand-tools?filter.v.price.gte=40&sort_by=price-ascending', status: 200 },
  { name: 'product', path: '/products/felco-2-classic-pruner', status: 200 },
  { name: 'search', path: '/search?q=pruner&type=product', status: 200 },
  { name: 'search-empty', path: '/search?q=zzzznotathing&type=product', status: 200 },
  { name: 'cart', path: '/cart', status: 200 },
  { name: 'wishlist', path: '/pages/wishlist', status: 200 },
  { name: 'about', path: '/pages/about', status: 200 },
  { name: 'contact', path: '/pages/contact', status: 200 },
  { name: 'guides', path: '/blogs/news', status: 200 },
  { name: 'article', path: '/blogs/news/choosing-pruning-shears', status: 200 },
  { name: 'privacy', path: '/pages/privacy', status: 200 },
  { name: 'terms', path: '/pages/terms', status: 200 },
  { name: '404', path: '/this-page-does-not-exist-qa', status: 404 }
];

const snapshots = [];

for (const entry of pages) {
  const response = await open(page, env, entry.path);
  const status = response ? response.status() : 0;
  const snapshot = await page.evaluate(() => {
    const meta = (selector) => document.querySelector(selector)?.getAttribute('content') || '';
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => {
      try { return JSON.parse(script.textContent); } catch { return { parseError: true, raw: script.textContent.slice(0, 100) }; }
    });
    return {
      url: location.href,
      title: document.title,
      description: meta('meta[name="description"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      robots: meta('meta[name="robots"]'),
      ogTitle: meta('meta[property="og:title"]'),
      ogDescription: meta('meta[property="og:description"]'),
      ogImage: meta('meta[property="og:image"]'),
      h1: [...document.querySelectorAll('h1')].map((heading) => heading.textContent.trim()),
      jsonLd,
      images: [...document.querySelectorAll('img')].map((image) => ({
        src: image.currentSrc || image.src,
        alt: image.getAttribute('alt'),
        hasAlt: image.hasAttribute('alt')
      })),
      internalLinks: [...document.querySelectorAll('a[href]')].filter((link) => {
        const href = link.getAttribute('href');
        return href.startsWith('/') || href.includes(location.hostname);
      }).length
    };
  });
  snapshots.push({ entry, status, ...snapshot });
}

await check('All sampled pages return the expected HTTP status', async () => {
  const failures = snapshots.filter((snapshot) => snapshot.status !== snapshot.entry.status);
  assert(failures.length === 0, failures.map((failure) => `${failure.entry.path}:${failure.status}`).join(', '));
  return `${snapshots.length} pages`;
});

await check('Every page has a non-empty title and meta description', async () => {
  const failures = snapshots.filter((snapshot) => !snapshot.title || !snapshot.description);
  assert(failures.length === 0, failures.map((failure) => failure.entry.path).join(', '));
  const short = snapshots.filter((snapshot) => snapshot.description.length < 50).map((snapshot) => snapshot.entry.path);
  return short.length ? `short descriptions: ${short.join(', ')}` : 'titles and descriptions present';
});

await check('Titles are unique across canonical pages', async () => {
  const counts = new Map();
  const canonicalPages = snapshots.filter((snapshot) => snapshot.entry.name !== 'collection-filtered');
  for (const snapshot of canonicalPages) counts.set(snapshot.title, (counts.get(snapshot.title) || 0) + 1);
  const duplicates = [...counts.entries()].filter(([, count]) => count > 1);
  assert(duplicates.length === 0, duplicates.map(([title, count]) => `${title} x${count}`).join(' | '));
  return `${counts.size} unique titles`;
});

await check('Titles use the storefront brand, not the admin store name', async () => {
  const stale = snapshots.filter((snapshot) => /Gardner Dev/.test(snapshot.title));
  assert(stale.length === 0, stale.map((snapshot) => `${snapshot.entry.path}: ${snapshot.title}`).join(' | '));
  return 'Gardner brand used';
});

await check('Canonical URLs are present and absolute', async () => {
  const failures = snapshots.filter((snapshot) => !/^https:\/\//.test(snapshot.canonical));
  assert(failures.length === 0, failures.map((failure) => `${failure.entry.path}: ${failure.canonical}`).join(', '));
  return 'absolute canonicals';
});

await check('Filtered collection canonical points at the clean collection URL', async () => {
  const snapshot = snapshots.find((entry) => entry.entry.name === 'collection-filtered');
  assert(/\/collections\/hand-tools$/.test(snapshot.canonical), `canonical is ${snapshot.canonical}`);
  return snapshot.canonical;
});

await check('Each page has exactly one h1', async () => {
  const failures = snapshots.filter((snapshot) => snapshot.h1.length !== 1);
  assert(failures.length === 0, failures.map((failure) => `${failure.entry.path}: ${failure.h1.length}`).join(', '));
  return 'one h1 per page';
});

await check('Open Graph title, description, and image are present', async () => {
  const failures = snapshots.filter((snapshot) => !snapshot.ogTitle || !snapshot.ogDescription || !snapshot.ogImage);
  assert(failures.length === 0, failures.map((failure) => failure.entry.path).join(', '));
  return 'og metadata complete';
});

await check('All images expose an alt attribute', async () => {
  const failures = snapshots.flatMap((snapshot) =>
    snapshot.images.filter((image) => !image.hasAlt).map((image) => `${snapshot.entry.path}: ${image.src.slice(0, 80)}`)
  );
  assert(failures.length === 0, failures.slice(0, 3).join(' | '));
  return 'alt attribute present on every image';
});

await check('Product images have descriptive alt text', async () => {
  const snapshot = snapshots.find((entry) => entry.entry.name === 'product');
  const productImages = snapshot.images.filter((image) => /cdn\/shop\/files/.test(image.src));
  const failures = productImages.filter((image) => !image.alt || image.alt.length < 3);
  assert(failures.length === 0, `${failures.length} product image(s) have weak alt text`);
  return `${productImages.length} product images`;
});

await check('JSON-LD parses on every page', async () => {
  const failures = snapshots.flatMap((snapshot) =>
    snapshot.jsonLd.filter((block) => block.parseError).map(() => snapshot.entry.path)
  );
  assert(failures.length === 0, failures.join(', '));
  return `${snapshots.reduce((total, snapshot) => total + snapshot.jsonLd.length, 0)} blocks parsed`;
});

await check('Organization schema appears once per page', async () => {
  const failures = snapshots.filter((snapshot) => snapshot.jsonLd.filter((block) => block['@type'] === 'Organization').length !== 1);
  assert(failures.length === 0, failures.map((failure) => failure.entry.path).join(', '));
  return 'one Organization block per page';
});

await check('WebSite schema appears once on the homepage only', async () => {
  const home = snapshots.find((entry) => entry.entry.name === 'home');
  const others = snapshots.filter((entry) => entry.entry.name !== 'home');
  assert(home.jsonLd.filter((block) => block['@type'] === 'WebSite').length === 1, 'homepage is missing WebSite schema');
  const extra = others.filter((snapshot) => snapshot.jsonLd.some((block) => block['@type'] === 'WebSite'));
  assert(extra.length === 0, extra.map((entry) => entry.entry.path).join(', '));
  return 'homepage only';
});

await check('Product schema is present and matches the displayed price', async () => {
  const snapshot = snapshots.find((entry) => entry.entry.name === 'product');
  const product = snapshot.jsonLd.find((block) => block['@type'] === 'Product');
  assert(product, 'Product JSON-LD missing');
  assert(product.name, 'Product name missing');
  assert(product.image, 'Product image missing');
  assert(product.offers, 'Product offers missing');
  const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
  assert(offer.price && String(offer.price).includes('86.71'), `offer price is ${offer.price}`);
  assert(offer.priceCurrency === 'USD', `currency is ${offer.priceCurrency}`);
  assert(offer.availability, 'availability missing');
  assert(!snapshot.jsonLd.filter((block) => block['@type'] === 'Product').slice(1).length, 'duplicate Product schema');
  return `${product.name} / ${offer.price} ${offer.priceCurrency} / ${offer.availability}`;
});

await check('Breadcrumb schema is present on product pages', async () => {
  const snapshot = snapshots.find((entry) => entry.entry.name === 'product');
  const breadcrumb = snapshot.jsonLd.find((block) => block['@type'] === 'BreadcrumbList');
  assert(breadcrumb, 'BreadcrumbList missing');
  const items = breadcrumb.itemListElement || [];
  assert(items.length >= 2, 'BreadcrumbList has too few items');
  return `${items.length} breadcrumb items`;
});

await check('Article schema is present on the article template', async () => {
  const snapshot = snapshots.find((entry) => entry.entry.name === 'article');
  const article = snapshot.jsonLd.find((block) => block['@type'] === 'Article' || block['@type'] === 'BlogPosting');
  assert(article, 'Article/BlogPosting schema missing');
  assert(article.headline, 'article headline missing');
  return article['@type'];
});

await check('Search, cart, and wishlist pages are marked noindex', async () => {
  const expected = ['search', 'cart', 'wishlist'];
  const failures = snapshots.filter((snapshot) => expected.includes(snapshot.entry.name) && !/noindex/i.test(snapshot.robots));
  assert(failures.length === 0, failures.map((failure) => `${failure.entry.path}: robots=${failure.robots}`).join(', '));
  return 'noindex present';
});

await check('Content pages are indexable', async () => {
  const expected = ['home', 'collection', 'product', 'about', 'contact', 'guides', 'article', 'privacy', 'terms'];
  const failures = snapshots.filter((snapshot) => expected.includes(snapshot.entry.name) && /noindex/i.test(snapshot.robots));
  assert(failures.length === 0, failures.map((failure) => failure.entry.path).join(', '));
  return 'no unexpected noindex';
});

await check('Sitemap and robots.txt are reachable', async () => {
  const sitemap = await page.goto(`${storeUrl(env)}/sitemap.xml`, { waitUntil: 'domcontentloaded' });
  const robots = await page.goto(`${storeUrl(env)}/robots.txt`, { waitUntil: 'domcontentloaded' });
  assert(sitemap && sitemap.status() === 200, `sitemap status ${sitemap ? sitemap.status() : 0}`);
  assert(robots && robots.status() === 200, `robots status ${robots ? robots.status() : 0}`);
  const robotsText = await page.locator('body').innerText();
  assert(/User-agent:/i.test(robotsText), 'robots.txt is not a valid robots file');
  assert(/Disallow: \/\*?\?.*preview_theme_id/i.test(robotsText), 'robots.txt does not exclude theme previews');
  const sitemapDirective = /Sitemap:/i.test(robotsText);
  return sitemapDirective ? 'sitemap 200 / robots 200 / Sitemap directive present' : 'sitemap 200 / robots 200 / platform robots.txt omits Sitemap directive';
});

await check('Homepage and collection expose crawlable internal links', async () => {
  const home = snapshots.find((entry) => entry.entry.name === 'home');
  const collection = snapshots.find((entry) => entry.entry.name === 'collection');
  assert(home.internalLinks > 20, `homepage has only ${home.internalLinks} internal links`);
  assert(collection.internalLinks > 20, `collection has only ${collection.internalLinks} internal links`);
  return `${home.internalLinks} home / ${collection.internalLinks} collection`;
});

const summary = summarize(results);
const report = {
  generated: new Date().toISOString(),
  store: env.SHOPIFY_STORE,
  previewThemeId: '191259083065',
  summary,
  results,
  snapshots: snapshots.map((snapshot) => ({
    page: snapshot.entry.name,
    path: snapshot.entry.path,
    status: snapshot.status,
    url: snapshot.url.replace(env.SHOPIFY_STOREFRONT_PASSWORD, '[redacted]'),
    title: snapshot.title,
    description: snapshot.description,
    canonical: snapshot.canonical,
    robots: snapshot.robots,
    h1: snapshot.h1,
    jsonLdTypes: snapshot.jsonLd.map((block) => block['@type'] || 'parse-error'),
    imageCount: snapshot.images.length,
    imagesMissingAlt: snapshot.images.filter((image) => !image.hasAlt).length,
    internalLinks: snapshot.internalLinks
  }))
};

writeReport('seo-report.json', report);
console.log('\nSummary', JSON.stringify(summary));
if (summary.failed) {
  for (const item of results.filter((entry) => entry.status === 'fail')) console.log(`- ${item.name}: ${item.detail}`);
}
console.log('Saved docs/qa/seo-report.json');
await browser.close();
