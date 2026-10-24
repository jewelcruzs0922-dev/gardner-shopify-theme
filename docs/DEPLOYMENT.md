# Deployment & Preview Workflow (Development Only)

**Never publish. Never run `shopify theme publish` or `theme push --publish`.**

## Target

| Item | Value |
|---|---|
| Store | Gardner Dev (`gardner-dev-zwlohenx.myshopify.com`) |
| Plan | Basic Â· Development store |
| Published theme | Horizon (untouched) |
| Project theme | **Gardner Dawn Baseline**, canonical ID `191259083065`, unpublished (a duplicate `191258853689` also exists from the first push) |
| Admin | https://admin.shopify.com/store/gardner-dev-zwlohenx |

## Authentication

Shopify CLI browser OAuth cannot complete in this non-interactive shell (`--alias` required). Instead, a store-scoped Admin API token is used with the CLI's documented `--password` / `SHOPIFY_CLI_THEME_TOKEN` support.

- Token source: Dev Dashboard app **Gardner Admin** (org Gardner), installed on Gardner Dev.
- Scopes: products, files, themes, content, online-store navigation, inventory, markets, metaobjects, translations, orders (read/write).
- Storage: `.env` only (gitignored). Never printed, committed, or screenshotted.

## Commands

Push the local theme as an unpublished theme:

```powershell
$env:SHOPIFY_CLI_THEME_TOKEN = ((Get-Content .env | Where-Object { $_ -like 'SHOPIFY_ADMIN_TOKEN=*' }) -split '=',2)[1]
shopify theme push --theme 191259083065 --path . --store gardner-dev-zwlohenx.myshopify.com
```

Pull remote changes:

```powershell
shopify theme pull --theme 191259083065 --path . --store gardner-dev-zwlohenx.myshopify.com
```

Lint:

```powershell
shopify theme check --path .
```

## Preview

- **Best for QA:** Shopify theme editor (authenticated, bypasses storefront password):
  `https://admin.shopify.com/store/gardner-dev-zwlohenx/themes/191259083065/editor`
- **Direct storefront preview** requires the development-store password (stored in `.env`). The storefront is in private mode, and the private-mode toggle is locked on for dev stores.
- Screenshots of the editor preview are captured by clipping the `oseid` preview iframe.

## Constraints observed

- Development stores force private/password-protected storefronts; the "Private mode" switch is disabled.
- Direct top-level preview URLs redirect to `/password`.
- Shopify CLI OAuth is unavailable in this shell; token-based auth is used instead.
- Do not publish the theme, the storefront, or the store.


## 2026-10-25 status

- Canonical unpublished theme: `#191259083065` (Gardner Dawn Baseline).
- Earlier duplicate unpublished theme `#191258853689` remains untouched.
- Published theme: Horizon, untouched.
- Store remains in development mode; no publish operation was run.
- Catalog: 32 active products, 10 collections, 32/32 images.
- Demo inventory: DeWit Bio Onion Hoe 0 (sold out), BoronGreen Dibber 2 (low stock); reset with `node scripts/set-stock.mjs`.
- Customer account entry point is a native `/account` link in the header.
