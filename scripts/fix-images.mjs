import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const raw = fs.readFileSync(path.join(root, '.env'), 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/\r$/, '');
}
const base = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-10'}`;

const jobs = [
  {
    id: '15417227968825',
    alt: 'Fiskars Steel D-Handle Digging Shovel, 46 inch',
    src: 'https://cuix-prod.fiskars.com/-/media/products/2022/04/08/01/00/resource_fiskarsamericas_396690-1001.jpg?q=100&iw=1288&ih=1288&crop=1'
  },
  {
    id: '15417228067129',
    alt: 'Dramm ColorStorm Premium Pistol Spray Nozzle',
    src: 'https://mobileimages.lowes.com/productimages/313b9987-f577-44de-8c16-4a099779596b/72549184.jpeg?size=pdhism'
  }
];

for (const job of jobs) {
  const res = await fetch(`${base}/products/${job.id}/images.json`, {
    method: 'POST',
    headers: { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: { src: job.src, alt: job.alt } })
  });
  const text = await res.text();
  console.log(job.id, res.status, text.slice(0, 160).replace(/https?:\/\/[^\"]+/g, '[url]'));
}
