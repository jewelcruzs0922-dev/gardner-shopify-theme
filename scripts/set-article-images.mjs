import fs from 'node:fs';

const raw = fs.readFileSync('.env', 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/\r$/, '');
}
const base = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-10'}`;
const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN, 'Content-Type': 'application/json' };
const cdn = `https://${env.SHOPIFY_STORE}/cdn/shop/t/3/assets`;

const jobs = [
  { id: 691596001593, src: `${cdn}/gardner-hero.jpg`, alt: 'Raised vegetable beds in warm evening light' },
  { id: 691596034361, src: `${cdn}/gardner-footer.jpg`, alt: 'Garden hand tools on a potting bench' },
  { id: 691596067129, src: `${cdn}/gardner-story.jpg`, alt: 'Hands planting a seedling in a raised bed' }
];

for (const job of jobs) {
  const res = await fetch(`${base}/articles/${job.id}.json`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ article: { id: job.id, image: { src: job.src, alt: job.alt } } })
  });
  const text = await res.text();
  console.log(job.id, '->', res.status, res.status === 200 ? 'image set' : text.slice(0, 160));
}
