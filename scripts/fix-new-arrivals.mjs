import fs from 'node:fs';
import path from 'node:path';

const raw = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/\r$/, '');
}
const base = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-10'}`;
const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN, 'Content-Type': 'application/json' };

async function api(endpoint, options = {}) {
  const res = await fetch(`${base}${endpoint}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: res.status, body };
}

const collections = await api('/custom_collections.json?limit=250');
const home = collections.body.custom_collections.find(c => c.handle === 'home-page' || c.title === 'Home page');
if (home) {
  const upd = await api(`/custom_collections/${home.id}.json`, {
    method: 'PUT',
    body: JSON.stringify({
      custom_collection: {
        id: home.id,
        title: 'New Arrivals',
        handle: 'new-arrivals',
        body_html: '<p>The latest additions to the Gardner demo catalog.</p>'
      }
    })
  });
  console.log('renamed Home page ->', upd.status, upd.body?.custom_collection?.title);
} else {
  console.log('Home page collection not found');
}

const target = collections.body.custom_collections.find(c => c.handle === 'new-arrivals') || home;
const wanted = [
  'sneeboer-greenhouse-trowel',
  'felco-2e',
  'fanno-tri-edge-folding-pruning-saw',
  'dramm-professional-watering-wand',
  'shovel',
  'dewit-bio-3-tine-cultivator'
];

for (const handle of wanted) {
  const prod = await api(`/products.json?handle=${handle}&fields=id,title`);
  const p = prod.body?.products?.[0];
  if (!p) { console.log('missing product', handle); continue; }
  const r = await api('/collects.json', {
    method: 'POST',
    body: JSON.stringify({ collect: { product_id: p.id, collection_id: target.id } })
  });
  console.log(handle, r.status === 201 ? 'added' : r.status === 422 ? 'already' : `failed ${r.status}`);
}
