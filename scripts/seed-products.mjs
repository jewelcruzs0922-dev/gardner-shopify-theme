import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function loadEnv() {
  const file = path.join(root, '.env');
  const env = {};
  const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/\r$/, '');
  }
  return env;
}

const env = loadEnv();
const store = env.SHOPIFY_STORE;
const token = env.SHOPIFY_ADMIN_TOKEN;
const apiVersion = env.SHOPIFY_API_VERSION || '2026-10';
const base = `https://${store}/admin/api/${apiVersion}`;

if (!store || !token) {
  console.error('Missing SHOPIFY_STORE or SHOPIFY_ADMIN_TOKEN in .env');
  process.exit(1);
}

async function api(endpoint, options = {}) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${base}${endpoint}`, {
      ...options,
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (res.status === 429) {
      const wait = Number(res.headers.get('retry-after') || 2) * 1000;
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    return { status: res.status, body, link: res.headers.get('link') };
  }
  return { status: 429, body: { error: 'rate limited' } };
}

async function findImage(sourceUrl) {
  if (!sourceUrl) return null;
  try {
    const res = await fetch(sourceUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GardnerPortfolio/1.0)' },
      redirect: 'follow'
    });
    const html = await res.text();
    const patterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m) return m[1].replace(/&amp;/g, '&');
    }
  } catch (err) {
    return null;
  }
  return null;
}

const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'products.json'), 'utf8'));

// 1. Collections
const collectionIds = new Map();
for (const collection of data.collections) {
  const existing = await api(`/custom_collections.json?handle=${encodeURIComponent(collection.handle)}`);
  const found = existing.body?.custom_collections?.[0];
  if (found) {
    collectionIds.set(collection.handle, found.id);
    console.log(`collection exists: ${collection.title} (#${found.id})`);
    continue;
  }
  const created = await api('/custom_collections.json', {
    method: 'POST',
    body: JSON.stringify({
      custom_collection: {
        title: collection.title,
        handle: collection.handle,
        body_html: `<p>${collection.description}</p>`,
        published: true,
        sort_order: 'best-selling'
      }
    })
  });
  if (created.status === 201) {
    collectionIds.set(collection.handle, created.body.custom_collection.id);
    console.log(`collection created: ${collection.title} (#${created.body.custom_collection.id})`);
  } else {
    console.log(`collection FAILED: ${collection.title} -> ${created.status} ${JSON.stringify(created.body).slice(0, 200)}`);
  }
}

// 2. Products
for (const p of data.products) {
  const existing = await api(`/products.json?handle=${encodeURIComponent(p.handle)}&fields=id,title`);
  const found = existing.body?.products?.[0];
  let productId = found?.id || null;

  if (!productId) {
    let image = p.image || null;
    if (!image) image = await findImage(p.source_url);

    const payload = {
      product: {
        title: p.title,
        handle: p.handle,
        body_html: p.body_html,
        vendor: p.vendor,
        product_type: p.product_type,
        tags: p.tags,
        status: 'active',
        variants: [
          {
            price: p.price,
            ...(p.compare_at_price ? { compare_at_price: p.compare_at_price } : {}),
            sku: p.sku,
            inventory_management: 'shopify',
            inventory_policy: 'deny',
            inventory_quantity: p.inventory_quantity ?? 10,
            requires_shipping: true,
            weight: 500,
            weight_unit: 'g'
          }
        ],
        ...(image ? { images: [{ src: image, alt: p.title }] } : {})
      }
    };

    const created = await api('/products.json', { method: 'POST', body: JSON.stringify(payload) });
    if (created.status !== 201) {
      console.log(`product FAILED: ${p.title} -> ${created.status} ${JSON.stringify(created.body).slice(0, 300)}`);
      continue;
    }
    productId = created.body.product.id;
    console.log(`product created: ${p.title} (#${productId}) image=${image ? 'yes' : 'no'}`);
  } else {
    console.log(`product exists: ${p.title} (#${productId})`);
  }

  for (const handle of p.collections || []) {
    const collectionId = collectionIds.get(handle);
    if (!collectionId) continue;
    const collect = await api('/collects.json', {
      method: 'POST',
      body: JSON.stringify({ collect: { product_id: productId, collection_id: collectionId } })
    });
    if (collect.status === 201) {
      console.log(`  added to ${handle}`);
    } else if (collect.status === 422) {
      console.log(`  already in ${handle}`);
    } else {
      console.log(`  collect FAILED ${handle}: ${collect.status}`);
    }
  }
}

console.log('done');
