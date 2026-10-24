import fs from 'node:fs';

const raw = fs.readFileSync('.env', 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/\r$/, '');
}
const base = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-10'}`;
const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN, 'Content-Type': 'application/json' };

const product = await (await fetch(`${base}/products.json?handle=felco-2-classic-pruner&fields=id,title`, { headers })).json();
const p = product.products[0];
const cols = await (await fetch(`${base}/custom_collections.json?limit=250`, { headers })).json();
const best = cols.custom_collections.find(c => c.handle === 'bestsellers');

const res = await fetch(`${base}/collects.json`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ collect: { product_id: p.id, collection_id: best.id } })
});
const text = await res.text();
console.log('collect:', res.status, text.slice(0, 240));
