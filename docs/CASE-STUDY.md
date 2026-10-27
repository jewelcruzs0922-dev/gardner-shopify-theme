# Gardner — Portfolio Case Study

## Brief

Build a polished, accessible, native Shopify storefront for a budget-friendly US garden-tools brand. The visual character should follow the published Lavandula Webflow reference — editorial spacing, oversized type, warm surfaces, image-led cards, quiet interactions — without copying its code or assets. The storefront had to remain an unpublished development store and use real Shopify data for products, collections, inventory, search, filters, cart, and wishlist.

## Outcome

A complete Dawn-based Shopify theme with:

- An original brand layer: cream `#F7F1E3`, apple green `#8DBF39`, orange `#F28C28`, Josefin Sans display type, Nunito Sans body type, soft radii.
- A homepage with hero, bestsellers, six category cards, brand story, trust/benefits, visibly labelled demo reviews, guides, and editorial gallery.
- A commerce header with a seven-collection mega menu, featured products, predictive search, hide-on-scroll sticky behavior, wishlist, and native account/cart links.
- A 32-product catalog across hand tools, pruning, digging/planting, watering, soil care, accessories, and one power tool, with documented sources and demonstration pricing.
- Functional faceted filtering, sorting, PDP gallery lightbox, available/low-stock/sold-out inventory states, related products, a cart drawer, cart fallback, and a persistent browser-local wishlist.
- About, contact, guides, article, shipping, returns, privacy, terms, wishlist, 404, and empty-state pages.
- SEO metadata, canonical handling, Product/Breadcrumb/Organization/WebSite/Article JSON-LD, and a responsive image strategy.

## Design approach

### Reference translation, not reproduction

The Lavandula reference is a landscaping-services template; Gardner is a product store. I translated the parts that transfer:

- Full-bleed hero with a large display headline and a short supporting line
- Generous vertical section spacing and a 1400px content frame
- Image-led cards with soft corners and restrained hover states
- A cream-dominant palette with green as the action color and orange reserved for small emphasis
- Editorial footer with brand story, navigation, newsletter, and a full-width lifestyle image

I did not recreate service sections, service pricing, FAQ, or the reference's demo contact details. I did not use its Webflow markup, copy, fonts, or images.

### Brand decisions

- **Logo:** an original botanical sprout mark paired with the Gardner wordmark (inline SVG, no third-party logo asset).
- **Color contrast:** the brief's apple green is used with dark ink labels; small cart labels were darkened to clear 4.5:1. Orange is used sparingly for wishlist/sample badges.
- **Typography:** Shopify-hosted Josefin Sans and Nunito Sans replace the initial Google Fonts + Dawn Assistant duplication. This cut an external stylesheet and an unused font family.
- **Honesty:** reviews are labelled "Sample" with a visible demo disclaimer; the gallery states it is not a social feed; the PDP trust strip says the catalog is a portfolio demo. No invented reviews, certifications, warranties, or shipping promises.

## Implementation highlights

### Commerce on Shopify primitives

Rather than fake commerce UI, the theme uses Dawn's predictive search, faceted filters, product forms, cart drawer, and responsive image pipeline. The custom work is the shell (header/footer/hero/story/reviews/gallery), brand tokens, product trust strip, wishlist, and the content/SEO layer.

### Inventory states

The demo shows all three states through real Shopify inventory:

- DeWit Bio Onion Hoe → 0 → "Out of stock" / disabled "Sold out"
- BoronGreen Dibber → 2 → "Low stock: 2 left" / add enabled
- FELCO 2 → in stock

The inventory script uses `inventory_levels.json` with `inventory_item_ids`, avoiding the missing `read_locations` scope.

### Wishlist that behaves like a product feature

`gardner-wishlist.js` adds a header icon with count, card hearts, a PDP toggle, a wishlist page with live product data from `/products/{handle}.js`, remove controls, empty state, cross-tab sync via the `storage` event, and screen-reader announcements. It is explicitly browser-local.

### Accessibility

- Visible `:focus-visible` ring across controls
- Keyboard-operable mega menu, mobile drawer, search modal, gallery lightbox, cart drawer, and wishlist
- Escape handling and focus management inherited from Dawn where applicable
- Accessible quantity names and wishlist labels
- Reduced-motion support; scroll reveal animations disabled
- axe: 0 violations across 13 pages and 5 interactive states (preview bar excluded)
- Lighthouse theme-only accessibility: 100

### SEO

- Brand-aware titles and per-template meta descriptions
- Canonicals, including clean collection canonical for filtered URLs
- `noindex, follow` on search/cart/wishlist/404
- Product + Breadcrumb + Organization + WebSite + Article JSON-LD, parsed and field-checked
- Default OG image when a page has no featured image
- Descriptive alt text and crawlable collection navigation

### Performance

- Responsive JPEG variants for hero/story/footer, with `srcset`, `sizes`, and a homepage hero preload
- Shopify font CDN instead of duplicate font sources
- Collection-card `sizes` corrected for the two-column mobile grid
- Wishlist MutationObserver optimized to inspect only added cards (removed a 1.5 s scripting/forced-reflow hotspot)
- Dynamic checkout disabled to avoid loading the Shop Pay checkout bundle on every PDP
- Desktop Lighthouse: **95 performance**, LCP ~1.4 s
- Mobile Lighthouse is dominated by Shopify preview/platform scripts; the theme-only diagnostic is 67–72, with accessibility 100 and SEO 100

## Verification

- Theme Check: 0 errors, 9 inherited Dawn warnings
- Functional: 31 passed, 1 blocked (newsletter hCaptcha)
- axe: 0 violations
- SEO: 20/20 checks passed
- Responsive: 1440/768/390, no horizontal overflow
- Visual: matched-viewport side-by-sides for home, collection, product
- Browser coverage: Chromium only (not Safari/Firefox/Edge)
- No public rich-results test; the store is password-protected/unpublished

## Challenges and resolutions

| Challenge | Resolution |
|---|---|
| Password-protected dev store blocks normal screenshot/Lighthouse access | Authenticated Playwright session; cookie/headers for Lighthouse; preview-bar artifacts documented and excluded from axe |
| Mobile Lighthouse LCP ~8 s despite a 53 KB hero | Traced to platform scripts blocking first paint; separated primary and theme-only diagnostics instead of misreporting a score |
| Initial scroll-reveal opacity produced contrast false positives | Disabled scroll-reveal animations; real browser CLS measured 0.000 |
| Wishlist injected toggles caused a 1.5 s scripting hotspot | WeakSet + added-node-only observer + CSS positioning instead of per-card `getComputedStyle` |
| Product images downloaded at 1500 px for 178 px cards | Corrected `sizes` for the 2-column mobile collection grid |
| No multi-variant product in the researched range | Kept the variant picker functional; documented that variant selection was not exercised rather than inventing variants |
| GitHub delivery | Created the private repository after owner-authenticated GitHub CLI access, then pushed and verified `master` |

## What I would do next

1. Obtain licensed product photography and replace the demonstration image URLs.
2. Add multi-variant products with verified options and test the picker end-to-end.
3. Run a real checkout/payment test in an authorized test environment, then document shipping/tax behavior.
4. Complete policy/legal review and owner business details.
5. Run Safari/Firefox/Edge and screen-reader passes.
6. Move performance measurement to a public staging URL without the Shopify preview bar.
7. Add a review integration only if the owner approves a free/native path; keep demo labels until then.
