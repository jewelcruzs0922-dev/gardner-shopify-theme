import fs from 'node:fs';

const raw = fs.readFileSync('.env', 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/\r$/, '');
}
const base = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-10'}`;
const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN };

const themes = await (await fetch(`${base}/themes.json`, { headers })).json();
for (const t of themes.themes) {
  console.log(t.id, '|', t.name, '| role:', t.role);
}

for (const id of themes.themes.filter(t => t.name.includes('Gardner')).map(t => t.id)) {
  const asset = await (await fetch(`${base}/themes/${id}/assets.json?asset[key]=templates/index.json`, { headers })).json();
  const content = asset.asset?.value || '';
  const m = content.match(/"overlay_opacity":\s*(\d+)/);
  console.log('theme', id, 'overlay:', m ? m[1] : 'n/a', 'bytes:', content.length);
}
