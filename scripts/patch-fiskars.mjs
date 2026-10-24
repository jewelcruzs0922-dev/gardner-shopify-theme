import fs from 'node:fs';

const raw = fs.readFileSync('.env', 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/\r$/, '');
}
const base = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-10'}`;
const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN, 'Content-Type': 'application/json' };
const id = '15417227936057';

const body_html = '<p>A geared bypass pruner from the PowerGear2 Softgrip line, built for tougher stems and light branches. The cam mechanism multiplies leverage through the middle of the cut, where resistance is highest.</p><ul><li>Bypass cutting action for clean, precise cuts</li><li>3/4 in (19 mm) cutting capacity</li><li>Fully hardened steel blade with a low-friction coating</li><li>Softgrip handle</li><li>Limited lifetime warranty from Fiskars</li></ul><p><em>Specifications summarized from Fiskars product information (model 392791-1001). Demonstration listing — not an authorized Fiskars reseller.</em></p>';

const upd = await fetch(`${base}/products/${id}.json`, {
  method: 'PUT',
  headers,
  body: JSON.stringify({ product: { id, title: 'Fiskars PowerGear2 Softgrip Pruner', body_html, tags: 'Pruning & Cutting,Hand Tools,Bestsellers,Pruning' } })
});
console.log('update:', upd.status, (await upd.text()).slice(0, 120));

const img = await fetch(`${base}/products/${id}/images.json`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    image: {
      src: 'https://cuix-prod.fiskars.com/-/media/products/2019/10/03/13/48/resource_fiskarsamericas_392791-1001.jpg?q=100&iw=1288&ih=1288&crop=1',
      alt: 'Fiskars PowerGear2 Softgrip Pruner'
    }
  })
});
console.log('image:', img.status);

// keep the research data in sync
const p = 'data/products.json';
const j = JSON.parse(fs.readFileSync(p, 'utf8'));
const prod = j.products.find(x => x.handle === 'fiskars-powergear2-pruner');
if (prod) {
  prod.title = 'Fiskars PowerGear2 Softgrip Pruner';
  prod.source_url = 'https://cuix-prod.fiskars.com/en-us/gardening-and-yard-care/products/pruning-shears/powergear2-softgrip-pruner-392791-1001';
  prod.image = 'https://cuix-prod.fiskars.com/-/media/products/2019/10/03/13/48/resource_fiskarsamericas_392791-1001.jpg';
  prod.specs = 'Bypass pruner, model 392791-1001; 3/4 in cut capacity; hardened steel blade with low-friction coating; Softgrip handle; limited lifetime warranty.';
  prod.body_html = body_html;
}
fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
console.log('data synced');
