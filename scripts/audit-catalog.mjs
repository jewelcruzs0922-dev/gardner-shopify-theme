import fs from 'node:fs';

const raw = fs.readFileSync('.env', 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/\r$/, '');
}
const base = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-10'}`;
const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN };

let all = [];
let url = `${base}/products.json?limit=250&fields=id,title,handle,images,variants,status`;
while (url) {
  const res = await fetch(url, { headers });
  const data = await res.json();
  all = all.concat(data.products || []);
  const link = res.headers.get('link');
  const next = link && link.match(/<([^>]+)>;\s*rel="next"/);
  url = next ? next[1] : null;
}
const noImage = all.filter(p => !p.images || p.images.length === 0);
console.log('total products:', all.length);
console.log('active:', all.filter(p => p.status === 'active').length);
console.log('without image:', noImage.length, '->', noImage.map(p => p.title).join(' | '));
