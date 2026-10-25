# Gardner Test Report

- **Executed:** 2026-10-25 (UTC)
- **Store:** Gardner Dev, `gardner-dev-zwlohenx.myshopify.com` (development store, unpublished)
- **Preview theme:** `#191259083065` ("Gardner Dawn Baseline"), unpublished
- **Environment:** Windows 11, Node 26.8.1, npm 11.19.0, Shopify CLI 4.9.4, Playwright 1.64.1 (Chromium headless), Lighthouse 13.5.0, Chrome installed locally
- **Viewports:** 1440×900 desktop, 768×1024 tablet, 390×844 mobile
- **Reference:** https://lavandula.webflow.io/ (rendered output only)

Only checks that were actually executed are reported as passed. Blocked and unrun checks are listed explicitly.

## 1. Summary

| Area | Result | Evidence |
|---|---|---|
| Theme Check | **0 errors, 9 warnings** (inherited Dawn warnings) | `docs/theme-check-final.log`, `docs/theme-check-final.json` |
| Functional QA | **31 pass, 0 fail, 1 blocked** | `docs/qa/functional-report.json` |
| Automated accessibility (axe) | **0 violations** across 13 pages + 5 interactive states, with Shopify preview-bar iframe excluded | `docs/qa/axe-report.json` |
| SEO / structured data | **20/20 pass** | `docs/qa/seo-report.json` |
| Performance | Desktop Lighthouse **99**; mobile **53–61** with platform/preview overhead; theme-only diagnostic **72–77** | `docs/qa/lighthouse-summary.json` |
| Browser coverage | Chromium only | Safari, Firefox, and Edge were **not** tested |
| Newsletter end-to-end | **Blocked** by Shopify invisible hCaptcha | See §6 |
| GitHub remote | **Blocked** by unauthenticated `gh` | See §10 |

## 2. Theme Check

```powershell
shopify theme check --path . --fail-level error
```

- 168 files inspected
- 0 errors
- 9 warnings (Dawn-inherited: `LiquidComplexity`, `UnusedAssign`, `UndefinedObject`, `OrphanedSnippet`, `VariableName`)
- Exit code 0

## 3. Functional QA

Command: `npm run qa` (Playwright, authenticated preview, desktop + tablet + mobile).

**31 passed, 0 failed, 1 blocked.**

Verified:

- Homepage has one h1 and the eight planned sections in order; no announcement bar
- Demo review and editorial gallery disclosures are visible
- All homepage images load; 6 category cards and 4 bestseller cards render
- Sticky header hides on scroll down and returns on scroll up
- Mega menu opens by keyboard, lists 7 collections plus 2 featured products, and closes on Escape
- Predictive search returns 10 product thumbnails; search results page renders; empty search state renders
- Collection price filter reduces 15 → 5 products through the UI, shows an active chip, and reset returns to 15
- Price sort low-to-high puts the $8.99 trowel first
- PDP: title, $86.71 price, 4 related products, 3 trust items, Gallery lightbox open/close, quantity accessible name
- PDP inventory states: sold out (DeWit Bio Onion Hoe), low stock 2 (BoronGreen Dibber), in stock (FELCO 2)
- Wishlist add, reload persistence, header count, saved card, remove, empty state
- Cart: add, drawer opens, $86.71 subtotal, quantity 1 → 2, $173.42 subtotal, remove, empty state; `/cart` fallback
- Content pages return 200: about, contact, guides, article, shipping, returns, privacy, terms
- 404 returns status 404 with useful copy
- Newsletter markup: visible label, `type=email`, `required`, invalid empty state
- Contact form: Name, Email *, Phone number, Comment labels; required email
- Visible 2px keyboard focus indicator
- JSON-LD: Organization, Product, BreadcrumbList on PDP; Organization + WebSite on home
- No theme console errors during primary flows (one known Shopify preview artifact filtered)

Screenshots: `docs/qa/home-1440.png`, `collection-1440.png`, `product-1440.png`, `cart-drawer-1440.png`, `wishlist-1440.png`, `search-1440.png`, `mega-menu-1440.png`, `product-sold-out-1440.png`, `product-low-stock-1440.png`, plus 768/390 variants and `mobile-menu-390.png`.

## 4. Accessibility

Command: `npm run qa:a11y` (axe-core via `@axe-core/playwright`).

- Pages: home, collection, product, search, empty search, cart, wishlist, about, contact, guides, article, privacy, 404
- States: mega menu open, search modal open, cart drawer open, saved wishlist, mobile menu open
- Result: **0 violations** after fixing:
  - Quantity input accessible name
  - Wishlist PDP accessible-name mismatch
  - Cart-drawer small-label contrast
  - Offscreen scroll-animation contrast false positives (scroll-reveal disabled)
- The Shopify preview-bar iframe is excluded: it is platform UI injected only in preview, not part of the theme. Lighthouse’s primary run still reports its missing iframe title (accessibility 97); with platform scripts blocked, the theme scores 100.
- Manual checks performed: keyboard Tab focus ring, Enter/Escape on mega menu and search, Escape on gallery lightbox and mobile menu, quantity/wishlist accessible names, visible form labels.
- **Not performed:** screen-reader testing with NVDA/JAWS/VoiceOver; automated scans are not a WCAG conformance claim.

## 5. SEO and structured data

Command: `npm run qa:seo`.

**20/20 passed:**

- Expected HTTP status on 14 sampled URLs
- Titles and meta descriptions on every page; unique titles on canonical pages
- Brand-aware titles (no "Gardner Dev" leakage)
- Absolute canonicals; filtered collection canonical points to the clean collection
- Exactly one h1 per page
- Open Graph title/description/image present (default editorial OG image fallback)
- Alt attribute on every image; product image alt text descriptive
- JSON-LD parses on every page; one Organization, one WebSite on home only, one Product, BreadcrumbList on PDP, Article on article
- Product offer price `86.71 USD`, availability `InStock`
- `noindex` on search/cart/wishlist; indexable content pages
- `sitemap.xml` 200 and `robots.txt` 200. Shopify’s platform `robots.txt` does not include a `Sitemap:` directive; `sitemap.xml` is still served at the standard path.
- 78 internal links on home, 86 on collection

Not performed: Google Rich Results Test / Schema Markup Validator against a public URL (the store is password-protected; no public URL exists). JSON-LD was parsed and field-checked locally instead.

## 6. Newsletter and contact forms

- Newsletter uses Shopify’s native `{% form 'customer' %}`. Label, `type=email`, and `required` were verified.
- Automated submission did **not** complete: Shopify injects an invisible hCaptcha challenge (`h-captcha`), and the success message did not appear.
- **Status: blocked.** This is documented rather than claimed as working. A human can complete the captcha in a browser; delivery/subscriber management was not verified.
- Contact form labels and required email were verified. Submission was **not** executed to avoid creating customer data.

## 7. Performance

Command: `node scripts/perf.mjs` (Lighthouse 13.5.0, authenticated preview, medians of repeated runs).

| Target | Perf | A11y | Best practices | SEO | Median LCP | LCP range | Median TBT | Median CLS |
|---|---|---|---|---|---|---|---|---|
| Home, mobile | 61 | 97 | 96 | 100 | 8.08 s | 2.79–8.40 s | 200 ms | 0.002 |
| Home, desktop | 99 | 97 | 96 | 100 | 0.97 s | 0.86–1.01 s | 23 ms | 0.000 |
| Collection, mobile | 53.5 | 97 | 96 | 100 | 7.61 s | 7.53–7.68 s | 431 ms | 0.002 |
| Product, mobile | 53 | 97 | 96 | 100 | 7.74 s | 7.68–7.80 s | 399 ms | 0.025 |

**Why mobile is low despite a fast theme:** the preview environment loads Shopify’s full preview bar plus shop.js/cart-sync, checkout-web chunks, web pixels, analytics, and perf-kit. In one run, 309 requests / ~2.18 MB were recorded, with ~253 requests to the shop domain. Under Lighthouse’s 4× mobile CPU throttle, FCP is delayed to ~4.7–4.9 s and the hero image (already downloaded by ~180 ms) cannot paint until the main thread frees up.

**Theme-only diagnostic** (same Lighthouse mobile settings, blocking `*preview-bar*`, `*shop-js*`, `*checkout-web*`, `*shop.app*`, `*web-pixel*`, `*trekkie*`, `*perf-kit*`):

| Target | Perf | A11y | LCP | TBT |
|---|---|---|---|---|
| Home | 72 | 100 | 5.06 s | 149 ms |
| Product | 77 | 100 | 4.58 s | 92 ms |

This diagnostic is **not** a storefront score; it estimates theme contribution.

Positive findings:

- Desktop Lighthouse performance 99, LCP ~1.0 s
- Hero image downloads as 800w/53 KB on mobile and is preloaded with `fetchpriority=high`
- CLS in a real browser navigation measured 0.000; Lighthouse reports 0.002–0.025 (preview bar/platform)
- Accessibility 100 in the theme-only diagnostic, SEO 100 in all runs
- Responsive image `sizes` fixed for the two-column mobile collection grid
- Wishlist JS forced-reflow/MutationObserver hotspot removed

**Not performed:** WebPageTest, field Core Web Vitals, or a published-store Lighthouse run.

## 8. Responsive and visual QA

A later screenshot-led correction pass fixed the mobile wordmark/header, product media stages, mobile wishlist pill, and category palette. See docs/VISUAL-CORRECTION-REPORT.md and the refreshed docs/audit/ set.

- Automated overflow check at 1440, 768, 390: no horizontal overflow on home, collection, or product.
- Mobile menu opens and closes on Escape at 390.
- Screenshots at all three widths are in `docs/qa/`.
- Side-by-side reference comparisons: `docs/qa/compare-home-1440.jpg`, `compare-collection-1440.jpg`, `compare-product-1440.jpg`.
- Full observations: `docs/VISUAL-QA.md`.

## 9. Reference fidelity limitations

- Only rendered output was inspected; no Webflow project, fonts, or assets were available.
- No Lavandula markup, copy, or assets were reused.
- The reference is a landscaping-services template with a 6-product shop; Gardner is a 32-product tool store. Layout rhythm/hierarchy are borrowed, not the service content model.
- Matched viewports: 1440×900, 768×1024, 390×844, Chromium only.

## 10. Blocked and unrun

| Item | Status | Reason / next action |
|---|---|---|
| GitHub repository creation/push | **Blocked** | `gh auth status` reports no login. Run `gh auth login`, then create/push the local repo. |
| Newsletter delivery | **Blocked** | Shopify invisible hCaptcha in automation; complete manually in a browser if needed. |
| Shop Pay / accelerated checkout | Not tested | Dynamic checkout disabled on the product template; native checkout not exercised. |
| Real checkout, payments, taxes, shipping rates | Not tested | Development store; brief forbids real transactions. |
| Customer account login | Entry point only | `/account` link verified by markup; no customer login performed. |
| Safari, Firefox, Edge | Not tested | Chromium-only environment. |
| Screen reader | Not tested | No NVDA/JAWS/VoiceOver session. |
| Public rich-results validation | Not possible | Store is password-protected/unpublished. |
| Product image licensing | Not resolved | Rights unconfirmed; replace before commercial use. |
| Variant selection | Not exercised | Researched products have a single verified variant each. |
