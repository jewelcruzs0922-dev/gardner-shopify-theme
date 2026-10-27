# Gardner — Access & Capability Verification

- **Verified:** 2026-10-23, 21:12–21:40 UTC (2026-10-24 ~05:12–05:40 Asia/Manila)
- **Method:** Shopify admin inspected in the user's Chrome session via the Playwright MCP browser tool; local toolchain checked with PowerShell.
- **Scope:** Read-only verification plus creation of a free Shopify development store (no publishing, no purchases, no paid apps, no secrets recorded).

## 0. Canonical environment (decision)

Two stores now exist in the **Gardner** organization:

| Store | Domain | Plan | Role |
|---|---|---|---|
| Gardner Dev | `gardner-dev-zwlohenx.myshopify.com` | **Basic — Development store** (verified) | **Canonical build target** |
| Gardner | `gardnerofficial.myshopify.com` | Trial, 3 days remaining | Earlier trial store; **not** the build target |

`dev.shopify.com/dashboard` → "Create a dev store" was used to create the free development store (no payment method, no expiry, "Not ready to sell"). The storefront brand will be **Gardner**; the admin display name is **Gardner Dev** to avoid duplicate names in the store switcher.

Rationale: the brief requires an authorized development environment with no cost and no publishing. A Partner development store satisfies this; a paid trial would expire.

## 1. Verified available

| Capability | Evidence | Status |
|---|---|---|
| Shopify admin access to Gardner Dev | `admin.shopify.com/store/gardner-dev-zwlohenx` → "Gardner Dev · Home · Shopify"; Settings shows "Basic · Development store" | Verified |
| Store name | Dev store created as **Gardner Dev**; storefront brand will be **Gardner** | Verified |
| Primary domain | Settings → Plan header: `gardner-dev-zwlohenx.myshopify.com` | Verified (domains page not separately opened) |
| Legacy domain (trial store) | On `gardnerofficial`: `mcm2i0-gt.myshopify.com` still listed as Connected (technical/legacy) | Verified on trial store |
| Store visibility (trial store) | Online Store → Themes: **Private** badge, "Preview store", "Select a plan to launch store" | Verified — not published |
| Store visibility (dev store) | Home shows **"Not ready to sell"**; dev store created via Dev Dashboard | Verified — not published |
| Theme library (trial store) | Themes page: current theme **Horizon** (Shopify), "Import themes" and "Edit theme" controls present | Verified on trial store; dev-store theme library not yet opened |
| Product admin | Trial-store Products page loads with 0 products and "Add product"/"Import" | Verified on trial store; dev store not yet inspected |
| Settings (trial store) | General, Domains, Plan reachable | Verified on trial store |
| Currency / locale (dev store) | Settings → General showed country **Philippines** and “Philippine Piso (PHP ₱)” in the currency display; **Admin API (`shop.currencyCode`) reports `USD`** | Mixed — currency config needs final verification |
| Admin API access | Dev Dashboard app **Gardner Admin** created, scopes applied, installed on Gardner Dev via OAuth; token stored only in `.env` (verified with a `shop { name currencyCode }` query) | Verified |
| Theme deployment | `shopify theme push --unpublished` succeeded with `SHOPIFY_CLI_THEME_TOKEN`; theme `#191258853689` uploaded | Verified |
| Plan (dev store) | Settings → Plan: **Basic · Development store** | Verified |
| Local toolchain | Node v26.8.1, npm 11.19.0, git 2.55.0, Shopify CLI 4.9.4, gh 2.102.0 | Verified |
| Browser automation | Playwright extension connected; can navigate, inspect DOM/computed styles, and screenshot | Verified |

## 2. Blocked or requiring owner action

| Item | Evidence | Impact | Owner action |
|---|---|---|---|
| ~~GitHub CLI not authenticated~~ | **Resolved:** `gh auth status` shows `jewelcruzs0922-dev`; private repository created and `master` pushed | — | — |
| **Shopify CLI OAuth unavailable in this shell** | `shopify auth login` → “--alias is required in non-interactive terminal environments” | CLI `theme dev/push` cannot OAuth normally | **Worked around:** use `SHOPIFY_CLI_THEME_TOKEN` from `.env`; `theme push` verified working |
| **Composio Shopify connection targets FurBuddies, not Gardner** | Active account: `pet-pantry-test.myshopify.com` (FurBuddies) | Composio product/collection tools would write to the wrong store | Use the store-scoped Admin API token instead |
| **Composio could not install on the trial store** | Connection for `gardnerofficial` reached Shopify app-grant; **Install disabled** (“distribution method”) | No Composio access to Gardner | Superseded by the Dev Dashboard app + token |
| ~~Trial store~~ | **Resolved:** free dev store “Gardner Dev” created | — | — |
| **Market/currency mismatch** | Dev store country PH; Settings shows PHP display; Admin API reports USD | Storefront currency presentation not yet confirmed | Verify markets/currency presentation before pricing QA |

## 3. Not yet verified

- Storefront currency **presentation** for US visitors (base `currencyCode` is USD per Admin API; Settings display showed PHP).
- Markets configuration for a US market (not configured).
- Theme functional QA (cart, search, filters, variants) — no theme implementation yet.
- App version editing (“Create version” returned a generic failure); not required for the current token/theme workflow.

## 4. Credential handling

- The Admin API token is stored only in gitignored `.env` and was never printed, committed, or screenshotted.
- Two credential values were accidentally returned in tool output during setup (app client secret and dev storefront password). Both were **rotated immediately**; the exposed values are invalid. Details: `docs/SECURITY-NOTES.md`.
- No credential values are recorded in this document.


## 2026-10-28 follow-up

- GitHub CLI authenticated as `jewelcruzs0922-dev`; private repository `jewelcruzs0922-dev/gardner-shopify-theme` created and `master` pushed at `493ce40`.
- Final functional, axe, SEO, and Lighthouse evidence is under `docs/qa/`.
- Catalog expanded to 32 products (2 soil-care additions); see `docs/catalog-research.md`.
- Newsletter automation remains blocked by Shopify invisible hCaptcha.
