import fs from 'node:fs';
import path from 'node:path';

const raw = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8').replace(/^\uFEFF/, '');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/\r$/, '');
}
const base = `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION || '2026-10'}`;
const headers = { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_TOKEN, 'Content-Type': 'application/json' };

async function api(endpoint, options = {}) {
  const res = await fetch(`${base}${endpoint}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: res.status, body };
}

const targets = [
  ['dewit-bio-onion-hoe', 0],
  ['borongreen-dibber-rhs-endorsed', 2]
];

for (const [handle, available] of targets) {
  const prod = await api(`/products.json?handle=${handle}&fields=id,title,variants`);
  const product = prod.body?.products?.[0];
  if (!product) {
    console.log('missing', handle);
    continue;
  }
  const variant = product.variants[0];
  const levels = await api(`/inventory_levels.json?inventory_item_ids=${variant.inventory_item_id}`);
  const level = levels.body?.inventory_levels?.[0];
  if (!level) {
    console.log(handle, '-> no inventory level; add read_locations scope or set stock manually');
    continue;
  }
  const set = await api('/inventory_levels/set.json', {
    method: 'POST',
    body: JSON.stringify({
      location_id: level.location_id,
      inventory_item_id: variant.inventory_item_id,
      available
    })
  });
  console.log(handle, '->', available, set.status);
}
