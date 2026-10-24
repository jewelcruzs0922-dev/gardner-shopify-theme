import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));
const products = data.products;

const rows = products.map((p, i) => {
  const cols = (p.collections || []).join(', ');
  const image = p.image ? 'Official store image' : 'No image yet';
  return `| ${i + 1} | ${p.title} | ${p.vendor} | ${cols} | $${Number(p.price).toFixed(2)} | [source](${p.source_url}) | ${image} |`;
}).join('\n');

const md = `# Gardner Catalog Research

- **Researched:** 2026-10-25 (UTC)
- **Scope:** 32 products across hand tools, pruning/cutting, digging/planting, watering, soil care, accessories, and one power tool. The brief's minimum was 30; two soil-care products were added to cover that category rather than removing existing products.
- **Method:** Product names, variants, official prices, and images were read from each brand's official Shopify storefront product feed (\`/products.json\`) and/or product pages. Descriptions in the store are original summaries, not copied manufacturer copy.
- **Price status:** prices are the brands' own USD retail prices at research time, used as **portfolio demonstration prices**. They are not supplier quotes or wholesale prices.
- **Reseller status:** Gardner is **not** an authorized reseller of any brand listed here. No supplier or wholesale relationship is implied.

## Image rights status

All product images are brand-owned or retailer-hosted product photos referenced from the cited source. **Usage rights are NOT confirmed or licensed.** They are used here only for a non-commercial portfolio demonstration and must be replaced with licensed assets or used with permission before any commercial launch. Fiskars product pages migrated during research; the Fiskars pruner image matches the Softgrip model (392791-1001) that the listing now describes.

## Products

| # | Product | Vendor | Collections | Price (USD) | Source | Image |
|---|---|---|---|---|---|---|
${rows}

## Collection taxonomy

${data.collections.map(c => `- **${c.title}** (\`${c.handle}\`): ${c.description}`).join('\n')}

## Known uncertainties and gaps

- Fiskars canonical product URLs returned 404 during research (site migration). Specifications were verified from Fiskars product information and the cuix-prod mirror; links need owner verification.
- Power tools are represented by a single premium battery pruner (FELCO 2e); a broader budget power-tool range needs further sourcing.
- The Garden Soil pH Testing Meter source listing showed Sold Out at research time. It is included as a demonstration listing with sample inventory only.
- The soil-care range is deliberately small (soil scoop and pH meter plus existing cultivating tools) and does not include fertilizers, compost, or soil amendments.
- Availability, current pricing, and variant stock can change at any time; re-verify before publishing.

## Source list

${[...new Set(products.map(p => p.source_url))].map(u => `- ${u}`).join('\n')}
`;

fs.writeFileSync('docs/catalog-research.md', md);
console.log(`wrote docs/catalog-research.md (${products.length} products)`);
