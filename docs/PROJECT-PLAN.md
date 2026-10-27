# Gardner — Project Plan and Status

- **Created:** 2026-10-23 (UTC)
- **Last updated:** 2026-10-28
- **Store:** Gardner Dev — `gardner-dev-zwlohenx.myshopify.com` (Basic / Development store, unpublished)
- **Admin:** `https://admin.shopify.com/store/gardner-dev-zwlohenx`
- **Preview theme:** `#191259083065` ("Gardner Dawn Baseline", unpublished)
- **Reference:** https://lavandula.webflow.io/ (layout/hierarchy inspiration only; no asset or code reuse)

## Confirmed decisions

| Decision | Choice | Evidence / basis |
|---|---|---|
| Environment | Free Shopify development store | `docs/ACCESS-VERIFICATION.md` |
| Currency/market | USD + US market (storefront currency USD per Admin API) | User decision; market presentation still needs owner verification |
| Brand palette | Cream `#F7F1E3`, apple green `#8DBF39`, orange `#F28C28` (60/30/10) | Brief + user decision |
| Theme foundation | Dawn 16.0.0 | `docs/THEME-DECISION.md` |
| Fonts | Josefin Sans + Nunito Sans via Shopify font CDN | Performance/consistency |
| Catalog | 32 products (30 minimum + 2 soil-care additions) | `docs/catalog-research.md` |
| Publishing | Never publish to a live store | Brief §2.1 |

## Milestones

| # | Milestone | Status | Evidence |
|---|---|---|---|
| M0 | Scaffold + baseline | **Complete** | Dawn 16.0.0; baseline theme-check; unpublished push |
| M1 | Design tokens + shell | **Complete** | Brand tokens, botanical lockup, mega menu, sticky header, editorial footer, responsive 1440/768/390 |
| M2 | Catalog data | **Complete with caveats** | 32 active products, 10 collections, 32/32 images, sources/prices documented; image rights unlicensed |
| M3 | Homepage | **Complete** | Hero, bestsellers, 6 categories, story, Why Gardner, labelled reviews, 3 guides, gallery, footer |
| M4 | Collection + product | **Complete** | Filters/sort, cards, gallery lightbox, inventory states, trust strip, related products |
| M5 | Cart, search, wishlist | **Complete** | Drawer/cart page, predictive search + empty state, localStorage wishlist |
| M6 | Content + policies | **Complete with owner review pending** | About, Contact, Guides + 3 articles, Shipping/Returns/Privacy/Terms drafts, 404; policies are not legal advice |
| M7 | Quality pass | **Complete within available tools** | Theme Check 0 errors; functional 31 pass/1 blocked; axe 0; SEO 20/20; Lighthouse desktop 95/mobile platform-limited |
| M8 | Handoff | **Complete** | README, architecture, catalog, test report, visual QA, case study, asset inventory, screenshots, readiness checklist |
| M9 | GitHub repo/push | **Complete** | Private repository `jewelcruzs0922-dev/gardner-shopify-theme`; `master` pushed at `493ce40` |

## Repository layout

```
Gardner/
├─ assets/            theme CSS/JS, responsive editorial images, icons
├─ config/            settings schema/data, brand tokens
├─ data/              catalog seed + research candidates
├─ docs/              access, reference, decisions, QA, case study
├─ layout/            theme.liquid, password.liquid
├─ locales/           en.default + schema translations
├─ sections/          header/footer, homepage, product/collection/cart sections
├─ snippets/          cards, facets, media, meta, breadcrumbs, wishlist helpers
├─ scripts/           seeding, inventory, menus, QA, performance
├─ templates/         JSON templates for all page types
├─ package.json       local QA tooling
└─ README.md
```

## Test plan and actual status

| Area | Method | Status |
|---|---|---|
| Theme lint | `shopify theme check --fail-level error` | Pass, 0 errors / 9 inherited warnings |
| Functional | Playwright authenticated preview | 31 pass, 1 blocked (hCaptcha) |
| Accessibility | axe-core + manual keyboard checks | 0 axe violations; manual keyboard pass; screen reader not run |
| SEO / JSON-LD | Rendered DOM inspection + local parse | 20/20 checks pass; public validator unavailable |
| Responsive | 1440×900, 768×1024, 390×844 | Pass, no horizontal overflow; screenshots captured |
| Visual vs reference | Side-by-side crops | Complete with documented differences |
| Performance | Lighthouse 13.5, repeated medians | Desktop 95; mobile platform-limited; theme-only 67–72 |
| Browsers | Chromium only | Safari/Firefox/Edge not tested |
| GitHub | `gh` CLI | Pass — private repository created and `master` pushed |

## Ownership / blockers

| Item | Owner | Needed for |
|---|---|---|
| Product image licensing | Owner | Commercial use |
| Policy/legal review | Owner | Real storefront operation |
| US market/currency presentation review | Owner | Checkout presentation |
| Newsletter manual submit + subscriber check | Owner | Confirming delivery |
| Public staging URL (optional) | Owner | Rich-results validation and clean Lighthouse |

## Explicit non-goals

- No live publishing, paid apps, real payments, or real customer data
- No invented reviews presented as genuine
- No invented business address, legal entity, return address, support details, certifications, warranties, or supplier relationships
- No copying of Lavandula/Webflow code, copy, fonts, or assets
