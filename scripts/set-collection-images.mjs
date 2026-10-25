import fs from 'node:fs';

const raw = fs.readFileSync('.env', 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/\r$/, '');
}
const base = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-10'}`;
const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN, 'Content-Type': 'application/json' };

const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));
const imgByHandle = new Map(data.products.filter(p => p.image).map(p => [p.handle, p.image]));

const map = {
  'hand-tools': 'dewit-rock-n-root-trowel',
  'pruning-cutting': 'felco-2-classic-pruner',
  'digging-planting': 'fiskars-steel-d-handle-digging-shovel-46',
  'watering-irrigation': 'brass-adjustable-water-nozzle-by-dramm',
  'garden-accessories': 'leepa-garden-glove',
  'soil-care': 'soil-scoop',
  'power-tools': 'felco-2e',
  'bestsellers': 'felco-2-classic-pruner',
  'new-arrivals': 'sneeboer-greenhouse-trowel',
  'premium-picks': 'sneeboer-hand-leaf-rake'
};

const cols = await (await fetch(`${base}/custom_collections.json?limit=250`, { headers })).json();
for (const c of cols.custom_collections) {
  const productHandle = map[c.handle];
  if (!productHandle) continue;
  const src = imgByHandle.get(productHandle);
  if (!src) { console.log('no image for', productHandle); continue; }
  const res = await fetch(`${base}/custom_collections/${c.id}.json`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ custom_collection: { id: c.id, image: { src, alt: c.title } } })
  });
  const text = await res.text();
  console.log(c.handle, '->', res.status, res.status === 200 ? 'image set' : text.slice(0, 160));
}
