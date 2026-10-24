import fs from 'node:fs';

const raw = fs.readFileSync('.env', 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/\r$/, '');
}
const base = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-10'}`;
const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN };

const cols = await (await fetch(`${base}/custom_collections.json?limit=250`, { headers })).json();
const best = cols.custom_collections.find(c => c.handle === 'bestsellers');
console.log('bestsellers id:', best?.id);

const collects = await (await fetch(`${base}/collects.json?collection_id=${best.id}&limit=250`, { headers })).json();
const ids = (collects.collects || []).map(c => c.product_id);
console.log('collects:', ids.length);

for (const id of ids) {
  const p = await (await fetch(`${base}/products/${id}.json?fields=id,title,status,published_at`, { headers })).json();
  console.log(id, p.product?.title, '| status:', p.product?.status, '| published_at:', p.product?.published_at);
}
