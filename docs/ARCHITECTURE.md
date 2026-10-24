# Gardner Theme Architecture

- **Foundation:** Shopify Dawn 16.0.0 (Online Store 2.0), restyled and extended with original sections, CSS, JavaScript, and copy.
- **Target:** Gardner Dev, `gardner-dev-zwlohenx.myshopify.com`, unpublished theme `#191259083065`.
- **Approach:** reuse Dawn's accessible commerce primitives (predictive search, facets, cart drawer, product forms, responsive images) and replace the visual shell and homepage/editorial sections.

## Directory map

```
assets/
  base.css, component-*.css, section-*.css   Dawn component styles
  gardner.css                                brand tokens, hero, footer, story,
                                             reviews, gallery, wishlist, trust strip
  gardner-wishlist.js                        localStorage wishlist
  gardner-hero.jpg / -800 / -1200 / -1800    responsive hero image
  gardner-story.jpg / -600 / -900 / -1200    responsive story image
  gardner-footer.jpg / -800 / -1200 / -1600  responsive footer image
  icon-*.svg                                 Dawn + brand icons
config/
  settings_schema.json                       Dawn settings + brand_name
  settings_data.json                         palette, type, radius, colors
layout/
  theme.liquid                               head, fonts, SEO defaults, header/footer groups
  password.liquid                            development-store password page
sections/
  header.liquid                              mega menu, sticky header, search, account link
  gardner-hero.liquid                        homepage hero
  gardner-story.liquid                       brand story split section
  gardner-reviews.liquid                     labelled demonstration reviews
  gardner-gallery.liquid                     editorial gallery
  gardner-footer.liquid                      editorial footer + newsletter
  gardner-product-trust.liquid               product trust strip
  gardner-wishlist.liquid                    wishlist page template
  main-product.liquid                        PDP, gallery, variants, quantity, buy buttons
  main-collection-*.liquid                   collection banner + filtered grid
  main-cart-*.liquid                         cart page fallback
  ...
snippets/
  card-product.liquid, card-collection.liquid
  header-mega-menu.liquid, header-drawer.liquid, header-search.liquid
  facets.liquid, price-facet.liquid
  product-breadcrumbs.liquid                 BreadcrumbList JSON-LD
  meta-tags.liquid                           Open Graph/Twitter + default OG image
  product-media-gallery.liquid, product-media-modal.liquid
  ...
templates/
  index.json                                 homepage section order
  product.json                               PDP blocks incl. inventory + trust strip
  collection.json, list-collections.json
  cart.json, search.json
  page.json, page.contact.json, page.wishlist.json
  blog.json, article.json, 404.json
scripts/
  seed-products.mjs, set-stock.mjs
  setup-menus.mjs, set-collection-images.mjs
  qa.mjs, qa-a11y.mjs, qa-seo.mjs, perf.mjs
  audit-catalog.mjs, audit-theme.mjs
```

## Brand tokens

`assets/gardner.css` defines:

| Token | Value |
|---|---|
| Cream | `#F7F1E3` |
| Apple green | `#8DBF39` |
| Orange | `#F28C28` |
| Ink | `#1E2A16` |
| Ink soft | `#4A5540` (plus darker `#3F4A35` for small cart labels) |
| Radii | 8px controls, 12px cards/media, 999px pills |
| Container | 1400px |
| Section space | `clamp(3.2rem, 6vw, 7rem)` |

The 60/30/10 palette ratio is carried through cream page surfaces, apple-green primary actions and accents, and restrained orange badges/highlights. Fonts are loaded from Shopify's font CDN: Josefin Sans 500 (headings) and Nunito Sans 400/700 (body). No external Google Fonts request is made.

## Homepage composition

`templates/index.json` order:

1. `gardner-hero` — full-bleed AI editorial image, overlay, eyebrow, h1, two CTAs
2. `featured-collection` — Bestsellers (8 products)
3. `collection-list` — 6 category cards
4. `gardner-story` — split image/story with CTA
5. `multicolumn` — Why Gardner (3 columns)
6. `gardner-reviews` — 3 sample reviews with visible "Demo content" disclaimer and "Sample" badges
7. `featured-blog` — 3 gardener guides
8. `gardner-gallery` — 3-image editorial gallery with note that it is not a social feed

No announcement bar is rendered.

## Header and navigation

- `sections/header.liquid` keeps Dawn's sticky-header custom element and adds:
  - A verified hidden-down / reveal-up sticky mode (`sticky_header_type: on-scroll-up`).
  - Mega menu with seven collection links and two featured products (Hand Tools, Pruning & Cutting, Digging & Planting, Watering & Irrigation, Soil Care, Garden Accessories, Power Tools).
  - Search modal with predictive results.
  - Account entry point is a native link to Shopify's `/account` route rather than the heavy `shopify-account` web component; this keeps the customer-account entry point native and avoids loading the Shop login/checkout bundle on every page.
  - Wishlist icon/link injected by `gardner-wishlist.js` next to the cart, with a live saved count.

## Catalog and data sources

- 32 active products, 10 collections. Products, variants, prices, inventory, images, pages, blog, and menus live in Shopify; `data/products.json` is the reproducible seed source.
- Collections: Hand Tools, Pruning & Cutting, Digging & Planting, Watering & Irrigation, Soil Care, Garden Accessories, Bestsellers, Premium Picks, Power Tools, New Arrivals.
- Every product has one variant (no verified multi-variant products in the researched range). Variant-picker markup is present and functional but not exercised by test data.
- Source URLs, research dates, price rationale, and image-rights caveats are in `docs/catalog-research.md`.

## Inventory demonstration

`scripts/set-stock.mjs` uses `inventory_levels.json` + `/inventory_levels/set.json` (no `read_locations` scope needed) to set:

| Product | Demo quantity | Storefront state |
|---|---|---|
| DeWit Bio Onion Hoe | 0 | Out of stock / Sold out |
| BoronGreen Dibber | 2 | Low stock: 2 left |
| FELCO 2 and most others | 8–24 | In stock |

The PDP inventory block is enabled in `templates/product.json` (threshold 5).

## Cart, search, filters, wishlist

- Cart: Dawn drawer + `/cart` fallback; custom CSS only. Add, quantity, remove, subtotal, empty state verified.
- Search: Dawn predictive search + `/search` template; thumbnails and prices verified; empty state verified.
- Filters: Dawn faceted filtering (availability, price) + sorting; price filter UI, active chip, reset, and sort verified.
- Wishlist: `assets/gardner-wishlist.js` stores product handles in `localStorage` under `gardner:wishlist`. Header badge, card/PDP toggles, wishlist page, remove, and empty state are implemented. It is browser-local and not synced across devices/accounts.
  - Card injection is incremental: a `WeakSet` avoids re-scanning processed cards, and the MutationObserver only inspects added nodes. This removed a measurable forced-reflow hotspot.

## SEO and structured data

- `layout/theme.liquid` provides brand-aware titles, per-template meta descriptions (homepage, search, cart, 404, blog, pages), default OG copy, and `noindex, follow` on search/cart/wishlist/404.
- `snippets/meta-tags.liquid` emits Open Graph/Twitter metadata and falls back to the hero image for pages without a featured image.
- JSON-LD:
  - Organization + WebSite from `header.liquid`
  - Product from Shopify's `product | structured_data`
  - BreadcrumbList from `snippets/product-breadcrumbs.liquid`
  - Article from `main-article.liquid`
- Filtered collection canonicals point at the clean collection URL. Product and collection titles, descriptions, images, and internal links are populated.

## Performance choices

- Responsive hero/story/footer images with `srcset`/`sizes` and a hero preload on the homepage.
- Shopify-hosted Josefin Sans/Nunito Sans instead of duplicating Google Fonts + Dawn's Assistant load.
- Scroll-reveal animations disabled; reduced-motion rules remain.
- Collection card `sizes` corrected for the two-column mobile grid.
- Wishlist observer optimized.
- Dynamic checkout (Shop Pay) disabled on the product template to avoid loading the accelerated-checkout bundle.
- Remaining platform cost: Shopify preview bar, shop.js/cart sync, web pixels, and analytics are injected by the platform and dominate mobile Lighthouse under throttling.

## Merchant editability

- Global colors, fonts, radii, card styles, and page width are in the theme editor.
- Hero, story, reviews, gallery, trust strip, footer, and wishlist sections expose editable headings, text, images, links, and disclaimers.
- Homepage sections can be reordered/removed in the editor; product blocks (vendor, title, price, inventory, variant picker, quantity, buy buttons, description, share) are editable.
- Collection template exposes filters, sorting, columns, image ratio, and product count.
