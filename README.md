# Gardner

A portfolio-quality, native Shopify Online Store 2.0 theme for a garden-tools storefront. Gardner recreates the layout rhythm, hierarchy, and editorial character of the Lavandula Webflow reference while using an original implementation, original copy, and Shopify-native commerce features.

**Status:** Development / portfolio project. The store and theme are **unpublished**. Nothing in this repository is a live business, and no real orders are fulfilled.

## What is included

- Native Dawn-based Shopify theme with an original brand layer
- Custom homepage: hero, bestsellers, six category cards, brand story, trust/benefits, labelled demo reviews, guides, editorial gallery
- Mega menu (7 collections), hide-on-scroll sticky header, predictive search, faceted filters, and sorting
- Collection listing/detail pages, product pages with lightbox gallery, available/low-stock/sold-out states, trust strip, and related products
- Functional cart drawer and cart page fallback
- Browser-local wishlist with persistence, empty state, and PDP/card toggles
- About, Contact, Wishlist, Guides/blog, article, Shipping, Returns, Privacy, Terms, 404, and policy draft pages
- 32 researched products across hand tools, pruning, digging/planting, watering, soil care, accessories, and power tools
- Accessible interaction patterns, responsive layouts, SEO metadata, Product/Breadcrumb/Organization/WebSite/Article JSON-LD, and demo-inventory controls

## Requirements

- Node.js 20+ (verified with Node 26.8.1)
- Shopify CLI 4.x (verified with 4.9.4)
- A Shopify development store and an unpublished theme
- A store-scoped Admin API token for catalog/content scripts (stored only in `.env`)

## Local setup

```powershell
npm install
Copy-Item .env.example .env
# Fill in SHOPIFY_STORE, SHOPIFY_ADMIN_TOKEN, SHOPIFY_API_VERSION, SHOPIFY_STOREFRONT_PASSWORD
```

`.env` is gitignored. Never commit it. The token needs products, files, themes, content, navigation, inventory, markets, translations, and orders read/write scopes for the scripts in this repository.

## Commands

```powershell
# Lint the theme (0 errors expected; inherited Dawn warnings remain)
npm run lint

# Push the unpublished theme
$env:SHOPIFY_CLI_THEME_TOKEN = ((Get-Content .env | Where-Object { $_ -like 'SHOPIFY_ADMIN_TOKEN=*' }) -split '=',2)[1]
shopify theme push --theme 191259083065 --path . --store gardner-dev-zwlohenx.myshopify.com

# Functional, accessibility, SEO, and performance checks
npm run qa
npm run qa:a11y
npm run qa:seo
$env:CHROME_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"
node scripts/perf.mjs

# Demo inventory (sold out + low stock)
node scripts/set-stock.mjs

# Catalog research regeneration
node scripts/gen-catalog-doc.mjs
```

## Preview

- **Theme editor (recommended):** `https://admin.shopify.com/store/gardner-dev-zwlohenx/themes/191259083065/editor`
- **Storefront preview:** `https://gardner-dev-zwlohenx.myshopify.com/?preview_theme_id=191259083065`
- The development storefront is password-protected. The password is stored only in `.env`.

**Do not publish the theme or store.** The published theme remains Horizon and was not modified.

## Key documentation

- [`docs/PROJECT-PLAN.md`](docs/PROJECT-PLAN.md) — milestones and current state
- [`docs/THEME-DECISION.md`](docs/THEME-DECISION.md) — why Dawn
- [`docs/REFERENCE-INVENTORY.md`](docs/REFERENCE-INVENTORY.md) — Lavandula observations and screenshots
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — theme structure, data, and settings
- [`docs/catalog-research.md`](docs/catalog-research.md) — 32 products, sources, pricing, rights
- [`docs/TEST-REPORT.md`](docs/TEST-REPORT.md) — actual functional, a11y, SEO, and performance results
- [`docs/VISUAL-QA.md`](docs/VISUAL-QA.md) — matched-viewport comparisons
- [`docs/KNOWN-LIMITATIONS.md`](docs/KNOWN-LIMITATIONS.md) — unresolved issues and owner actions
- [`docs/CASE-STUDY.md`](docs/CASE-STUDY.md) — portfolio case study
- [`docs/qa/`](docs/qa/) — screenshots, axe report, Lighthouse reports, functional/SEO JSON evidence

## Important limitations

- Product images are sourced from brand/retailer listings and **usage rights are not licensed**. Replace them before any commercial use.
- Prices are plausible retail/demonstration prices from research, not supplier quotes.
- Gardner is **not** an authorized reseller of any brand.
- Reviews are visibly labelled demonstration content, not real customer feedback.
- Newsletter submission is blocked in automation by Shopify's invisible hCaptcha; see the test report.
- GitHub remote creation is blocked until `gh auth login` is completed by the owner. The local repository is prepared for handoff.

See [`docs/KNOWN-LIMITATIONS.md`](docs/KNOWN-LIMITATIONS.md) for the full list.
