# Gardner Visual Correction Report

- **Date:** 2026-10-25
- **Theme:** `Gardner Dawn Baseline`, unpublished theme `#191259083065`
- **Store:** Gardner Dev, unpublished development store
- **Scope:** screenshot-led visual correction pass using the supplied 39-image audit set, the theme source, and the Lavandula reference

## 1. Executive summary

The main visual defects were in the mobile shell, product photography treatment, and a broken mobile wishlist control. The mobile wordmark was wrapping to 2–7 lines (header height 91–213 px depending on width), product photos had inconsistent white/cream stages across cards, and the PDP wishlist button collapsed to a 38 px circle with a zero-width icon inside.

These were corrected with focused CSS/markup changes. Mobile header height is now **64 px at 320/360/390**, the wordmark is one line with no horizontal overflow, product photography uses a consistent warm-white stage with `object-fit: contain`, and the wishlist control is a normal 156×40 pill. The store remains private; no password, access, checkout, or publishing settings were changed.

## 2. Issues fixed, ranked by severity

| Severity | Issue | Correction |
|---|---|---|
| **P1** | Mobile wordmark wrapped/clipped: 2 lines at 390, 3 at 360, 7 at 320; header 91–213 px tall. | Wordmark now one line at 19 px with a 28 px botanical mark. Header grid whitespace row collapsed; header is 64 px at all tested mobile widths. |
| **P1** | PDP wishlist button broken on mobile: computed 38 px wide, SVG width 0, label wrapped outside the pill. | Restored intrinsic pill sizing (`fit-content`, `max-content`), non-shrinking icon, nowrap label. Now 156×40 px with an 18 px heart. |
| **P1** | Product photographs had inconsistent white/cream stages across collection cards, bestsellers, related products, search, PDP, and wishlist. | Unified warm-white media stage, `object-fit: contain`, and inset padding. Category tiles use the same treatment with larger padding. |
| **P2** | Desktop/tablet header had an accidental 27 px empty grid row from anonymous whitespace, making it 112 px tall. | Collapsed with header font-size reset; desktop is 87 px, tablet 67 px, mobile 64 px. |
| **P2** | Mobile account/wishlist icons made the header crowded and contributed to wordmark wrapping. | Account and wishlist icons are hidden below 750 px; both are available in the mobile drawer utility row along with Search. Search and cart remain in the header. |
| **P2** | Category tiles were a patchwork of pink gloves, red/black nozzle, and white backgrounds, fighting the cream/green/orange palette. | Swapped category images to the neutral leather Leepa glove and brass Dramm nozzle; kept the underlying products. |
| **P2** | Mobile gallery zoom icon looked like a search icon at the top-left of the product image. | Moved to the bottom-right of the image stage on mobile. |
| **P3** | Product trust strip text was small and the third column wrapped awkwardly. | Raised title to 15 px and body to 14 px with retained column layout; verified at 1440. |
| **P3** | Wishlist card media used a sage stage that no longer matched the product cards. | Matched the warm-white stage and contained image treatment. |
| **P3** | Mega menu had collection links but no featured products. | Added a featured-products column with two live Shopify products, images, and prices (desktop mega menu). |

## 3. Files changed and why

| File | Change |
|---|---|
| `assets/gardner.css` | Mobile header reset, wordmark sizing, account/wishlist visibility, drawer utility styles, unified media stages, wishlist PDP pill fix, trust-strip typography, mobile zoom icon placement |
| `snippets/header-drawer.liquid` | Added Search / Wishlist / Log in utility links for mobile |
| `snippets/header-mega-menu.liquid` | Added featured products (bestsellers, limit 2) |
| `sections/header.liquid` | Account entry point changed from the heavy `shopify-account` component to a native `/account` link (earlier change retained) |
| `scripts/set-collection-images.mjs` | Category images switched to `brass-adjustable-water-nozzle-by-dramm` and `leepa-garden-glove` |
| `scripts/screenshots.mjs` | Repeatable authenticated screenshot capture with the preview bar removed |
| Store data | Watering & Irrigation and Garden Accessories collection images updated through the Admin API |

No Liquid templates were replaced, no sections were deleted, and no checkout/payment/account/domain/password settings were changed.

## 4. AI-generated assets

**None were generated in this pass.** The existing original AI editorial assets (`gardner-hero`, `gardner-story`, `gardner-footer` and responsive variants) remain in use. Category imagery uses existing product photography from the documented catalog sources. No synthetic image is presented as a real customer, garden project, review, or product test.

Product-image rights remain unlicensed; see `docs/catalog-research.md` and `docs/KNOWN-LIMITATIONS.md`.

## 5. Desktop/mobile checks completed

Browser: Chromium via Playwright 1.64.1, authenticated preview. Viewports: 320×800, 390×844, 768×1024, 1024×900, 1440×900.

- No horizontal overflow on home, collection, or product at any tested width.
- Header heights: **64 px** mobile (320/360/390), **67 px** tablet (768), **87 px** desktop (1024/1440).
- Mobile wordmark: one line at every tested width; no clipping.
- Mobile drawer: menu opens; utility links (Search, Wishlist, Log in) present; menu items remain 18 px; Escape closes.
- Collection grid: 2 columns on mobile, 4 on desktop; consistent white image stages.
- PDP: white gallery stage, mobile zoom control bottom-right, wishlist pill 156×40, add-to-cart flow unchanged.
- Wishlist page: saved card and empty state both render with the new media treatment.
- Category section: brass nozzle and neutral glove improve palette coherence.
- Updated audit screenshots: `docs/audit/desktop/`, `docs/audit/mobile/`, `docs/audit/states/`.

Not performed: Safari, Firefox, Edge, real devices, screen readers.

## 6. Functionality/regression checks completed

- `shopify theme check`: **0 errors, 9 inherited Dawn warnings**
- Functional QA: **31 passed, 0 failed, 1 blocked** (newsletter hCaptcha)
- axe-core: **0 violations** across 13 pages and 5 interactive states
- SEO: **20/20** checks pass (unchanged from prior pass)
- Verified: mega menu + featured products, predictive search, filters, sort, PDP lightbox, inventory states, cart drawer/cart page, wishlist add/persist/remove, forms, 404, content pages.
- No theme console errors in primary flows (known Shopify preview/expected 404 artifacts filtered).

## 7. Known limitations / approvals needed

- The live preview remains password-protected; ChatGPT cannot access it. Use the theme ZIP + screenshot pack.
- Product image rights are unlicensed; replace before commercial use.
- Shipping/Returns/Privacy/Terms remain draft templates requiring owner/legal review.
- Newsletter end-to-end submission is blocked by Shopify invisible hCaptcha in automation.
- Variant selection is not exercised because the researched catalog has single-variant products.
- No new AI imagery was generated; no authorized image-generation tool was used in this pass.
- Mobile account/wishlist access intentionally moved to the drawer; confirm this UX is acceptable.

## 8. Publishing confirmation

The development store was **not published**. The password was **not removed**, and access visibility, domains, billing, payments, checkout, and account settings were **not changed**.
