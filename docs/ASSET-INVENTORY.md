# Asset Inventory & Licensing

## Theme photography (used in the storefront)

| Asset | Used in | Source | Rights status |
|---|---|---|---|
| `assets/gardner-hero.jpg` + `-800/-1200/-1800` | Homepage hero, gallery | **AI-generated** with Gemini 3 Pro Image (Nano Banana Pro) via the authorized Gemini integration | Original generated asset; no third-party rights. Editorial imagery only — not evidence of real customers, locations, tests, or Gardner operations. |
| `assets/gardner-footer.jpg` + `-800/-1200/-1600` | Footer editorial band, gallery | **AI-generated** with Gemini 3 Pro Image | Original generated asset; same editorial caveat. |
| `assets/gardner-story.jpg` + `-600/-900/-1200` | Homepage brand story, gallery | **AI-generated** with Gemini 3 Pro Image | Original generated asset; same editorial caveat. |

**Generation notes**
- Hero prompt: photorealistic raised vegetable garden at golden hour, lettuce/herbs/tomatoes in weathered wooden beds, copper watering can, cream/sage/earth palette, no people, no text, 16:9.
- Footer prompt: photorealistic overhead potting-bench still life with forged trowel, hand fork, red-handled pruners, twine, seedlings, and soil, soft window light, cream/sage/wood palette, no text, 16:9.
- Story prompt: photorealistic gardener in a green apron planting a seedling in a raised bed, face out of frame, soft late-afternoon light, cream/sage/earth palette, 4:5.
- Responsive JPEG variants were generated from the originals with Sharp (quality 78, mozjpeg, progressive). Original sizes: hero 2400×1340 ~431 KB, footer 1600×893 ~285 KB, story 1200×1490 ~249 KB. Mobile variants are ~53–106 KB. No text or product claims are depicted.
- Alt text: decorative hero/story/footer images use empty `alt`; gallery images carry descriptive alt text.

## Brand assets

| Asset | Status |
|---|---|
| Botanical mark | Original inline SVG sprout/leaf mark in the header and footer lockup; no third-party logo asset |
| Wordmark "Gardner" | Text wordmark set in Josefin Sans via theme settings/CSS |
| Color tokens | Cream `#F7F1E3`, apple green `#8DBF39`, orange `#F28C28`, ink `#1E2A16`; supporting `#EFEBCD`, `#4A5540`, `#3F4A35` |
| Typography | Josefin Sans 500 + Nunito Sans 400/700, loaded from Shopify's font CDN. Both families are SIL Open Font License. No external Google Fonts request is made. |

## Product photography

Product images are brand-owned or retailer-hosted images sourced from official brand storefronts/retail pages. **Usage rights are not licensed.** See `docs/catalog-research.md` for the per-product source list. Replace with licensed assets or obtain permission before commercial use.

- 32/32 active products have an image (audited 2026-10-25).
- Product images are stored in Shopify Files/CDN and delivered with Shopify-generated responsive variants.
- No manufacturer packaging, accessories, or claims are fabricated beyond the cited listing.

## Icons and third-party code

- Dawn theme © Shopify Inc., used under Shopify's theme license (`LICENSE.md`).
- Dawn icon SVGs are part of the Dawn theme distribution.
- No Lavandula/Webflow code, copy, fonts, or assets were copied.
- `shopify-account` web component was removed from the header in favor of a native `/account` link; no third-party account UI is bundled.
- Demo inventory, prices, reviews, and gallery content are clearly identified as demonstration data.
