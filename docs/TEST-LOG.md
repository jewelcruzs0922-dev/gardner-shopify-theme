# Test Log

Only actual, executed checks are recorded here. Nothing is pre-marked as passing.

## 2026-10-23 â€” M0 baseline (Dawn 16.0.0 scaffold)

**Command**
```
shopify theme check --path . --output json
```

**Environment**
- Shopify CLI 4.9.4, Node v26.8.1, Windows 11 (win32), PowerShell 5.1
- Theme: Dawn 16.0.0 (cloned from https://github.com/Shopify/dawn, depth 1)
- Raw output: `docs/theme-check-baseline.json`

**Result**
- Exit code: 0
- Errors: 0
- Warnings: 9
  - `OrphanedSnippet` â€” 1
  - `VariableName` â€” 2 (`moduloResult`, `anchorId`)
  - `UnusedAssign` â€” 2 (`product_settings`, `seo_media`)
  - `LiquidComplexity` â€” 1 (complexity 136 > 120 limit)
  - `UndefinedObject` â€” 3 (`continue`, `scheme_classes` Ã—2)

**Interpretation**
- Baseline scaffold is lint-clean at error level; all 9 findings are warnings inherited from Dawn. They will be triaged during implementation rather than pre-emptively "fixed," to avoid changing upstream behavior without evidence.

**Not run yet**
- Any browser/functional/responsive/accessibility/performance test.

## 2026-10-23 â€” Theme push + preview render (M0)

**Command**
```
shopify theme push --unpublished --theme "Gardner Dawn Baseline" --path . --store gardner-dev-zwlohenx.myshopify.com
```
Authenticated with `SHOPIFY_CLI_THEME_TOKEN` sourced from `.env` (token not printed).

**Result**
- Exit code 0
- Output: "The theme 'Gardner Dawn Baseline' (#191258853689) was pushed successfully."
- Theme is **unpublished**; store remains in development mode.
- Push log: `docs/theme-push-baseline.log`

**Preview verification**
- Opened the authenticated theme editor: `admin.shopify.com/store/gardner-dev-zwlohenx/themes/191258853689/editor`
- Storefront preview frame rendered with text: "Welcome to our store", nav Home/Catalog/Contact, Cart, featured products at `$19.99 USD`.
- **Screenshot limitation:** screenshots of the cross-origin storefront iframe (and the editor page containing it) came back blank through this browser-extension automation setup. Direct top-level preview URLs redirect to `/password` because development stores force private mode.
- Evidence of the password gate: `docs/reference/gardner-storefront-password-gate-1440.png`
- Visual screenshot QA of the storefront is **blocked** until a testable login/preview screenshot method is confirmed. Text/DOM verification succeeded.

**Not run yet**
- Storefront screenshot QA, interaction tests (cart, search, filters), responsive QA, accessibility audit, performance measurement.



## 2026-10-24 â€” M1 brand layer (partial)

**Theme Check**
```
shopify theme check --path . --fail-level error
=> 155 files, 0 errors, 12 warnings, exit 0
```

**Push**
```
shopify theme push --unpublished --theme "Gardner Dawn Baseline" --store gardner-dev-zwlohenx.myshopify.com
=> success, theme #191259083065
```

**Verified in the storefront preview (1440x900, authenticated session)**
- Wordmark: "Gardner" (new `brand_name` setting, Josefin Sans)
- Body font: Nunito Sans; body background: `rgb(247, 241, 227)` = `#F7F1E3`
- Primary CTA renders as apple-green pill; announcement bar removed
- Soft card corners (12px) and 8px buttons
- Hero heading: "Good tools. Better gardens."
- Screenshots: `docs/reference/gardner-m1-1440.png`, `docs/reference/gardner-m1-390.png`

**Known gaps for M1**
- Footer is still Dawn default; mega-menu content needs the collection taxonomy (M2).
- Hero imagery is still Dawn's default illustration.
- Two unpublished themes now exist (#191258853689 duplicate, #191259083065 canonical). Old duplicate left untouched.

## 2026-10-24 â€” M2 catalog seed

**Result**
- 30 products created via Admin REST API (scripts/seed-products.mjs), all status \ctive\ in the unpublished dev store.
- 9 collections: Hand Tools, Pruning & Cutting, Digging & Planting, Watering & Irrigation, Garden Accessories, Bestsellers, Premium Picks, Power Tools, New Arrivals (repurposed from Dawn's empty "Home page" collection).
- Images: 30/30 products now have a product image. The Fiskars listing was aligned to the Softgrip model (392791-1001) so its image and copy match.
- Research file: `docs/catalog-research.md` (sources, prices, rights status, uncertainties).
- Audit: `scripts/audit-catalog.mjs` -> total 30, active 30, without image 1.

**Verified in the storefront (1440x900)**
- Collections page renders 9 collection cards with real product imagery.
- Product page for FELCO 2 renders gallery, price, related products.
- Screenshots: `docs/reference/gardner-m2-home-1440.png`, `gardner-m2-collections-1440.png`, `gardner-m2-product-1440.png`.

**Not done / limitations**
- Inventory-state demo (sold-out / low-stock) could not be set: the app token lacks `read_locations`; `/locations.json` returned no data. Add the scope or set stock manually.
- Image usage rights are not licensed (documented in the catalog research file).
- Prices are official brand retail at research time, not supplier quotes.


## 2026-10-24 — M1 shell + M3 hero/footer (partial)

**Built**
- Custom `sections/gardner-hero.liquid` (theme-editor settings: eyebrow, heading, text, two CTAs, overlay, height, alignment).
- Custom `sections/gardner-footer.liquid` (brand story, footer menu, newsletter form, policy links, editorial image band).
- Mega menu: main-menu rebuilt via Admin API with a Shop parent and six collection children; footer menu created.
- AI editorial photography generated with Gemini 3 Pro Image and optimized into theme assets (hero 2400×1340, footer 1600×893).
- Header logo h1 removed so the homepage hero is the single h1.

**Verified (1440×900, authenticated preview)**
- Hero renders with AI image (naturalWidth 2400), one h1, headline, subcopy, green + outline CTAs.
- Mega menu opens (details open/aria-expanded=true) and lists Hand Tools, Pruning & Cutting, Digging & Planting, Watering & Irrigation, Garden Accessories, Power Tools.
- Footer renders brand story, 9 links, newsletter form, and AI image band (naturalWidth 1600).
- Theme Check: 0 errors, 12 warnings.
- Screenshots: `docs/reference/gardner-m3-hero-1440.png`, `gardner-m3-hero-390.png`, `gardner-m3-megamenu-1440.png`, `gardner-m3-footer-1440.png`.

**Not done**
- Remaining homepage sections: categories, brand story, guides, social gallery, reviews.
- Sticky-header behavior and mobile menu QA not explicitly tested.
- Footer/header links point to pages that do not exist yet (About, Contact, Guides, Shipping, Returns, Privacy).

**Push verification note (same session)**
- A push appeared to succeed but 	emplates/index.json was rejected server-side: `Setting 'overlay_opacity' must be a step in the range` (value 32 with step 5).
- Fixed to 30 and re-pushed; verified server-side asset value = 30 via the Admin API.
- Lesson recorded: always verify the uploaded template value, not just the CLI success banner.

## 2026-10-24 — M3 homepage sections + M6 content pages

**Built**
- Homepage order: Gardner hero → Bestsellers → Shop by category (6 collection cards) → Gardner story → Why Gardner (3 columns) → Garden guides → footer.
- Custom `gardner-story` section with a third AI image (hands planting in a raised bed).
- Collection images set for all 9 collections (hand tools, pruning, digging, watering, accessories, power tools, bestsellers, new arrivals, premium picks).
- Content pages created: About, Shipping, Returns, Privacy (draft templates with explicit placeholders); Contact uses Dawn's contact template.
- Guides blog renamed from "News"; 3 original articles with AI images and clean summaries.

**Verified (1440×900, authenticated preview)**
- Homepage height 5,248px; all sections render; 6 category cards with images; story image naturalWidth 1200; 3 guide cards with images and clean excerpts.
- Pages return 200: /pages/about, /pages/contact, /blogs/news, /pages/shipping.
- Screenshots: `gardner-m3-home-full-1440.png`, `gardner-m3-categories-1440.png`, `gardner-m3-story-1440.png`, `gardner-m3-why-1440.png`, `gardner-m3-guides-1440.png`, `gardner-page-*.png`.

**Fixes**
- Story image would not lazy-load because its container had no intrinsic height; added `aspect-ratio: 4/5` and removed lazy loading.
- Collection images and article summaries/images were missing; added via Admin API.
- Removed the stray default "Button label" from the Why Gardner multicolumn.

**Not done**
- Reviews (needs a clearly labeled demo treatment), editorial social gallery.
- Wishlist, cart/search/filter functional QA, mobile menu and sticky-header QA.
- Policy pages need owner review; they are draft templates only.

## 2026-10-24 — Functional QA (Chrome, authenticated preview)

**Environment:** Chrome via Playwright extension, 1440×900 and 390×844, preview theme #191259083065.

| Check | Result | Evidence |
|---|---|---|
| Cart add | **Pass** | Add to cart created 1 item; drawer class ctive; item "FELCO 2 Classic Pruning Shears" |
| Cart quantity update | **Pass** | Drawer plus button → cart item_count 2, qty input 2 |
| Predictive search | **Pass** | Search "pruner" → 10 product results with prices |
| Collection filters | **Pass (URL)** | ilter.v.price.gte=40 reduced Hand Tools 15 → 5; active chip ".00 - .71". UI checkbox change did not trigger Dawn's AJAX in automation — recorded as an automation limitation, not confirmed broken |
| Mega menu | **Pass** | details[open]; six collection links |
| Mobile menu | **Pass** | Opens at 390px; Home, New Arrivals, Bestsellers, Guides, About, Contact |
| Sticky header | **Pass** | Hidden after scrolling down; on scroll up .shopify-section-header-sticky applied, top = 0 |
| Content pages | **Pass** | /pages/about, /pages/contact, /blogs/news, /pages/shipping → 200 |

**Screenshots:** gardner-qa-cart-1440.png, gardner-qa-search-1440.png, gardner-qa-filters-1440.png, gardner-qa-mobile-menu-390.png, gardner-qa-sticky-1440.png

**Code note:** seeded headerBounds from getBoundingClientRect() in sections/header.liquid so sticky logic does not depend on a late IntersectionObserver callback.

**Not run yet:** keyboard-only pass, screen-reader pass, Safari/Firefox/Edge, Lighthouse/Core Web Vitals, structured-data validation.

## 2026-10-25 — Final QA pass

**Theme Check**
```
shopify theme check --path . --fail-level error
=> 178 files, 0 errors, 9 warnings, exit 0
```
Evidence: `docs/theme-check-final.log`, `docs/theme-check-final.json`.

**Functional QA** (`npm run qa`)
- 31 passed, 0 failed, 1 blocked.
- Added: inventory states (sold out, low stock 2, in stock); 7-collection mega menu; contact email required; account entry point changed to native `/account`.
- Blocked: newsletter submission by Shopify invisible hCaptcha.
- Evidence: `docs/qa/functional-report.json`.

**Accessibility** (`npm run qa:a11y`)
- 0 violations across 13 pages and 5 interactive states (Shopify preview-bar iframe excluded).
- Fixed quantity accessible name, wishlist accessible-name mismatch, cart column-label contrast, and offscreen scroll-animation contrast false positives.
- Evidence: `docs/qa/axe-report.json`.

**SEO** (`npm run qa:seo`)
- 20/20 checks passed: titles/descriptions, canonicals, one h1, OG data, alt text, JSON-LD parse/types, Product price/currency/availability, BreadcrumbList, Article, noindex behavior, sitemap/robots reachability, internal links.
- Evidence: `docs/qa/seo-report.json`.

**Performance** (`node scripts/perf.mjs`)
- Home desktop median: perf 95, a11y 97, best-practices 96, SEO 100, LCP 1.41 s, TBT 10.5 ms.
- Home mobile median: perf 53, LCP 11.14 s, TBT 322.5 ms; platform/preview scripts dominate first paint.
- Collection mobile: perf 47.5; product mobile: perf 52.
- Theme-only diagnostic (platform requests blocked): home 67 / product 72, a11y 100.
- Evidence: `docs/qa/lighthouse-summary.json` and raw reports.

**Other**
- Catalog audit: 32 total, 32 active, 0 without image.
- Theme audit: published theme remains Horizon; two unpublished Gardner themes (#191259083065 canonical, #191258853689 earlier duplicate).
- Visual comparisons and screenshots added under `docs/qa/`.
- GitHub private repository created and `master` pushed: `jewelcruzs0922-dev/gardner-shopify-theme` at `493ce40`.
