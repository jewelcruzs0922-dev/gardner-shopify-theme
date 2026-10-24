import fs from 'node:fs';

const raw = fs.readFileSync('.env', 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/\r$/, '');
}
const base = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-10'}`;
const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN, 'Content-Type': 'application/json' };

const prod = await (await fetch(`${base}/products/15417228034361.json?fields=id,title,images`, { headers })).json();
const src = prod.product?.images?.[0]?.src;
console.log('felco image:', src ? 'found' : 'missing');
if (!src) process.exit(0);

const cols = await (await fetch(`${base}/custom_collections.json?limit=250`, { headers })).json();
for (const handle of ['pruning-cutting', 'bestsellers']) {
  const c = cols.custom_collections.find(x => x.handle === handle);
  if (!c) continue;
  const res = await fetch(`${base}/custom_collections/${c.id}.json`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ custom_collection: { id: c.id, image: { src, alt: c.title } } })
  });
  console.log(handle, '->', res.status);
}

const p = 'data/products.json';
const j = JSON.parse(fs.readFileSync(p, 'utf8'));
const felco = j.products.find(x => x.handle === 'felco-2-classic-pruner');
if (felco) { felco.image = src; fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n'); console.log('data updated'); }
