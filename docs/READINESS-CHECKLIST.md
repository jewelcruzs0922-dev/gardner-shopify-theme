# Gardner Readiness Checklist

- **Last updated:** 2026-10-28
- **Current decision:** Portfolio handoff is **READY WITH LIMITATIONS**. Commercial production is **NOT READY**.
- **Scope:** Unpublished development storefront and portfolio handoff. This is not a commercial launch checklist sign-off.

## Completed

- [x] Theme Check passes with **0 errors / 9 inherited warnings**.
- [x] Functional QA passes **31 / 0 failed / 1 blocked** (`docs/qa/functional-report.json`).
- [x] Axe reports **0 automated violations** across 13 pages and 5 interactive states (`docs/qa/axe-report.json`).
- [x] SEO and structured data pass **20/20** (`docs/qa/seo-report.json`).
- [x] Responsive checks pass at 1440, 768, and 390 with no horizontal overflow on home, collection, or product.
- [x] Theme-only diagnostic scores **100 accessibility / 100 SEO**; Lighthouse performance remains documented and platform-limited.
- [x] Prior security remediation remains in place: exposed credentials revoked, Admin token reissued, Playwright snapshots redacted, `.env` ignored.
- [x] QA full-page screenshot capture is repaired without storefront source changes. Home `1440`, `768`, and `390` captures now include the hero content.
- [x] Handoff archive prepared as `Gardner-Portfolio-Handoff-2026-10-28.zip` with `.env.example` placeholders only and no `.env`, Playwright state, reference images, or verbose CLI log.

## Remaining owner and approval-gated work

### Commercial launch blockers

- [ ] Replace all product images with licensed assets, or obtain written permission for each brand/retailer image. All current product-image rights remain unlicensed.
- [ ] Finalize Shipping, Returns, Privacy, and Terms policies with owner/legal review. Add the real business identity, address, support details, timelines, tax treatment, and privacy practices.
- [ ] Confirm product prices, inventory, reviews, and gallery content are appropriate for any public use. Reviews and gallery entries are visibly labelled demonstration/editorial content.
- [ ] Verify the US market and currency presentation in checkout. The store's admin country remains the Philippines while the Admin API reports USD.
- [ ] Complete a test-mode checkout covering payments, taxes, shipping rates, and order confirmation. Do not process a real transaction.
- [ ] Manually submit the newsletter form, solve the invisible hCaptcha, and confirm subscriber delivery/management in Shopify admin.
- [ ] Decide whether to test the contact form end to end. Automated submission was intentionally not executed to avoid creating customer data.
- [ ] Authorize any publish action. The theme remains unpublished (`191259083065`); the published theme remains Horizon.

### Verification gaps

- [ ] Test Safari, Firefox, and Edge.
- [ ] Test on physical iOS and Android devices, including touch interactions.
- [ ] Run screen-reader checks with NVDA, JAWS, or VoiceOver.
- [ ] Manually review axe incompletes: **70 color-contrast nodes**, **3 `aria-prohibited-attr` nodes**, and **3 `aria-valid-attr-value` nodes**. These are not confirmed violations, but they are not cleared.
- [ ] Exercise customer account login, multi-variant selection, and account/order history flows.
- [ ] Run Google Rich Results Test and Schema Markup Validator after an authorized public URL exists.
- [ ] Re-run Lighthouse on a published-like staging URL and decide whether to optimize the hero/LCP path, render-blocking CSS, and scroll-effect JavaScript. Current mobile scores include Shopify preview/platform overhead.

### Repository and handoff

- [ ] Run `gh auth login`, create the chosen private repository, and push the local history.
- [ ] Decide whether to keep, archive, or delete duplicate unpublished theme `191258853689`. Do not delete it without approval.
- [ ] Rotate the Admin API token and delete the temporary "Gardner Admin" app after the project is archived.
- [ ] Review the handoff ZIP contents and confirm the deliberate exclusions: `.env`, `.playwright-mcp/`, `.git/`, `.tmp/`, `node_modules/`, `.shopify/`, `docs/reference/`, `docs/theme-push-verbose.log`, and existing ZIPs.

## Evidence references

- `docs/qa/functional-report.json`
- `docs/qa/axe-report.json`
- `docs/qa/seo-report.json`
- `docs/qa/lighthouse-summary.json`
- `docs/qa/home-1440.png`
- `docs/qa/home-768.png`
- `docs/qa/home-390.png`
- `docs/KNOWN-LIMITATIONS.md`
- `docs/SECURITY-NOTES.md`
- `docs/TEST-REPORT.md`
