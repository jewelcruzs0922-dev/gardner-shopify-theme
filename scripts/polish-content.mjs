import fs from 'node:fs';

const raw = fs.readFileSync('.env', 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/\r$/, '');
}
const base = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-10'}`;
const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN, 'Content-Type': 'application/json' };

const articles = [
  { id: 691596001593, summary: 'A calm, practical way to plan the garden year without overbuying or overplanting.' },
  { id: 691596034361, summary: 'Bypass or anvil, budget or premium — what actually matters for a first pair of pruners.' },
  { id: 691596067129, summary: 'Why fewer, deeper waterings usually beat daily sprinkling.' }
];

for (const a of articles) {
  const res = await fetch(`${base}/articles/${a.id}.json`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ article: { id: a.id, summary_html: `<p>${a.summary}</p>` } })
  });
  console.log('article', a.id, '->', res.status);
}

const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));
const src = data.products.find(p => p.handle === 'leepa-garden-glove')?.image;
if (src) {
  const cols = await (await fetch(`${base}/custom_collections.json?limit=250`, { headers })).json();
  const c = cols.custom_collections.find(x => x.handle === 'garden-accessories');
  const res = await fetch(`${base}/custom_collections/${c.id}.json`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ custom_collection: { id: c.id, image: { src, alt: 'Garden Accessories' } } })
  });
  console.log('garden-accessories image ->', res.status);
}
