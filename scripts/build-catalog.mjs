import fs from 'node:fs';

const existing = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));
const candidates = JSON.parse(fs.readFileSync('data/candidates.json', 'utf8'));
const byHandle = new Map(candidates.map(c => [c.handle, c]));

const collections = [
  ...existing.collections,
  { handle: 'power-tools', title: 'Power Tools', description: 'Battery and electric tools for bigger garden jobs.' }
];

const editorial = {
  'pruning-cutting': 'clean cuts, healthy growth, and comfortable daily use',
  'digging-planting': 'durable edges and comfortable control in real soil',
  'watering-irrigation': 'gentle, controllable watering that saves time',
  'garden-accessories': 'small upgrades that make garden work easier',
  'hand-tools': 'forged strength and everyday ergonomics',
  'power-tools': 'less effort on repetitive cutting tasks'
};

const typeLabels = {
  'pruning-cutting': 'Pruning & Cutting',
  'digging-planting': 'Digging & Planting',
  'watering-irrigation': 'Watering & Irrigation',
  'garden-accessories': 'Garden Accessories',
  'hand-tools': 'Hand Tools',
  'power-tools': 'Power Tools'
};

const selection = [
  ['borongreen-hand-trowel-rhs-endorsed', ['hand-tools', 'digging-planting']],
  ['borongreen-hand-fork-rhs-endorsed', ['hand-tools', 'digging-planting']],
  ['borongreen-dibber-rhs-endorsed', ['hand-tools', 'garden-accessories']],
  ['florabrite-pink-garden-gloves-m-l', ['garden-accessories']],
  ['dewit-rock-n-root-trowel', ['digging-planting', 'hand-tools']],
  ['dewit-dutch-hand-fork', ['hand-tools']],
  ['dewit-bio-onion-hoe', ['hand-tools']],
  ['dewit-bio-3-tine-cultivator', ['hand-tools']],
  ['sneeboer-greenhouse-trowel', ['digging-planting', 'premium-picks']],
  ['sneeboer-hand-leaf-rake', ['hand-tools', 'premium-picks']],
  ['sneeboer-wrotter-garden-weeder', ['hand-tools', 'premium-picks']],
  ['spade', ['digging-planting']],
  ['shovel', ['digging-planting']],
  ['japanese-weeding-hoe', ['hand-tools']],
  ['triangle-hoe', ['hand-tools']],
  ['artisan-shears', ['pruning-cutting']],
  ['leepa-garden-glove', ['garden-accessories']],
  ['cape-cod-weeder-by-red-pig-garden-tools', ['hand-tools']],
  ['pointed-thinning-shears-by-okatsune', ['pruning-cutting']],
  ['harvesting-pruner-by-ars', ['pruning-cutting']],
  ['felco-5', ['pruning-cutting', 'premium-picks']],
  ['felco-2e', ['power-tools', 'premium-picks']],
  ['fanno-tri-edge-folding-pruning-saw', ['pruning-cutting']],
  ['professional-water-breakers-by-dramm', ['watering-irrigation']],
  ['brass-adjustable-water-nozzle-by-dramm', ['watering-irrigation']],
  ['dramm-professional-watering-wand', ['watering-irrigation']]
];

function cleanTitle(title) {
  return title
    .replace(/\s+(by|from)\s+[A-Za-z0-9&'’. ]+$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const additions = [];
for (const [handle, cols] of selection) {
  const c = byHandle.get(handle);
  if (!c) {
    console.log(`missing candidate: ${handle}`);
    continue;
  }
  const primary = cols[0];
  const title = cleanTitle(c.title);
  const body = `<p>${title} from ${c.vendor}.</p><p>Part of our ${typeLabels[primary]} selection, chosen for ${editorial[primary]}.</p><p><em>Demonstration listing. Product details and pricing are summarized from the official ${c.vendor} store on 2026-10-24; verify before purchase. Gardner is not an authorized reseller.</em></p>`;
  additions.push({
    handle,
    title,
    vendor: c.vendor,
    product_type: typeLabels[primary],
    price: c.price,
    sku: `${c.vendor.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 6)}-${handle.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 28)}`,
    inventory_quantity: 6 + (additions.length * 7) % 35,
    tags: [...new Set([...cols.map(x => typeLabels[x] || x), c.vendor, 'Demo Catalog'])].join(','),
    collections: cols,
    source_url: c.source,
    image: c.image,
    body_html: body
  });
}

const merged = [...existing.products, ...additions].filter(
  (p, i, arr) => arr.findIndex(x => x.handle === p.handle) === i
);
const out = {
  ...existing,
  collections,
  products: merged
};
fs.writeFileSync('data/products.json', JSON.stringify(out, null, 2));
console.log(`catalog products: ${merged.length}`);
console.log(additions.map(a => `${a.vendor} | ${a.title} | $${a.price}`).join('\n'));
