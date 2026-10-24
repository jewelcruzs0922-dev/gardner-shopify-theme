import fs from 'node:fs';

const stores = [
  { base: 'https://america.felco.com', vendor: 'FELCO' },
  { base: 'https://www.barebonesliving.com', vendor: 'Barebones' },
  { base: 'https://www.burgonandball.com', vendor: 'Burgon & Ball' },
  { base: 'https://www.gardentoolcompany.com', vendor: null },
  { base: 'https://www.hosstools.com', vendor: 'Hoss' }
];

const include = /prun|shear|trowel|fork|spade|shovel|hoe|rake|water|hose|nozzle|glove|kneel|saw|lopper|sickle|cultivat|weeder|dibber|transplant|scoop|edger|brush|broom|tool/i;
const exclude = /spare|replacement|seed|plant|bulb|bundle|gift|book|apparel|shirt|hat|sticker|mug|toy|food|supplement|soap|candle|lantern|audio|speaker|knife|axe|hatchet|saw blade/i;

const out = [];
for (const store of stores) {
  let page = 1;
  let fetched = 0;
  while (page <= 2) {
    const res = await fetch(`${store.base}/products.json?limit=250&page=${page}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36' }
    });
    if (!res.ok) break;
    const data = await res.json();
    const products = data.products || [];
    fetched += products.length;
    for (const p of products) {
      const type = p.product_type || '';
      if (!include.test(`${p.title} ${type}`)) continue;
      if (exclude.test(`${p.title} ${type}`)) continue;
      const firstVariant = p.variants?.[0];
      const image = p.images?.[0]?.src || null;
      if (!firstVariant || !image) continue;
      out.push({
        store: store.base,
        vendor: store.vendor || p.vendor,
        handle: p.handle,
        title: p.title,
        type,
        price: firstVariant.price,
        image,
        source: `${store.base}/products/${p.handle}`,
        tags: p.tags
      });
    }
    if (products.length < 250) break;
    page += 1;
  }
  console.log(`${store.base} scanned: ${fetched}`);
}

fs.mkdirSync('data', { recursive: true });
fs.writeFileSync('data/candidates.json', JSON.stringify(out, null, 2));
console.log(`candidates: ${out.length}`);
const counts = {};
for (const c of out) counts[c.vendor] = (counts[c.vendor] || 0) + 1;
console.log(counts);
