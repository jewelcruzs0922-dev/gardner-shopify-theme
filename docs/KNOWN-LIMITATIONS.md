# Known Limitations and Owner Actions

This file separates verified facts from blockers, unverified assumptions, and items that require an owner decision. Nothing here should be read as a claim that an unavailable capability works.

## Blockers requiring owner action

| Item | Impact | Exact action |
|---|---|---|
| **GitHub repository visibility** | The repository is private by owner choice: `jewelcruzs0922-dev/gardner-shopify-theme`. | Do not change it to public or transfer ownership without explicit approval. |
| **Newsletter submission not verified end-to-end** | Label/validation/captcha injection verified; delivery and subscriber management unverified. | Submit once manually in a browser, solve the invisible hCaptcha, and confirm the subscriber appears in Shopify admin. |
| **Product image rights unlicensed** | Cannot be used commercially. | Replace product photos with licensed assets or obtain written permission from each brand/retailer. Keep source notes in `docs/catalog-research.md`. |
| **Policy pages are drafts** | Shipping, Returns, Privacy, and Terms are placeholder templates, not legal advice or final policy. | Owner/legal review before any real use; complete business name, address, support details, timelines, tax treatment, and privacy practices. |
| **No public URL for rich-results validation** | Structured data was parsed and field-checked locally, not validated by Google Rich Results Test. | After an authorized launch/preview with public access, run the Rich Results Test and Schema Markup Validator. |

## Unverified or incomplete

- **Customer accounts:** an `/account` link is present and native. No customer login, account dashboard, or order history was exercised.
- **Checkout:** native Shopify checkout was not entered; no payment, tax, shipping-rate, or order test was performed. Dynamic checkout (Shop Pay) was disabled on the product template.
- **Variants:** all 32 researched products have one verified variant. The variant picker is implemented but not exercised with a multi-variant product.
- **Search suggestions:** product thumbnail search was verified, but no collection/page/article suggestions were separately tested.
- **Wishlist:** browser-local only; not synced across devices/accounts. `localStorage` failure falls back to an in-memory/empty state but was not exhaustively tested in private browsing modes.
- **Newsletter:** hCaptcha blocked automated submission.
- **Forms:** contact form submission was not executed to avoid creating customer data.
- **Reviews:** demo content, visibly labelled; no review app is installed.
- **Gallery:** editorial imagery, not customer posts or a live Instagram feed. No social account exists for Gardner.
- **Inventory:** quantities are demonstration data, not supplier stock. Reset by editing `scripts/set-stock.mjs` and rerunning it.
- **Power tools:** only one premium battery pruner (FELCO 2e); no budget power-tool range.
- **Soil care:** two soil-care products plus existing cultivating tools; no fertilizers, compost, or amendments.
- **Fiskars links:** canonical product URLs were unstable during research; specifications/images were verified from the available Fiskars pages/mirror. Re-verify before publishing.
- **pH meter:** the source listing was marked Sold Out at research time; the Gardner listing is a demonstration with sample inventory.

## Platform limitations observed

- Development stores force a password-protected storefront; direct public preview is not possible.
- Shopify injects a preview bar and platform scripts (preview bar, shop.js/cart-sync, checkout assets, pixels, analytics) into the preview. These dominate mobile Lighthouse under throttling and add a third-party cookie.
- Shopify’s platform `robots.txt` does not include a `Sitemap:` directive, although `/sitemap.xml` is served at the standard path.
- The preview bar iframe lacks a title; it is platform UI, not theme markup. The theme-only diagnostic scores 100 accessibility.
- Admin API token lacks `read_locations`, so `/locations.json` fails. Inventory demo uses `/inventory_levels.json` via `inventory_item_ids` instead.
- The store’s admin country remains the Philippines while the Admin API reports USD; the brief’s US-market currency presentation was not verified in checkout. Owner may need to configure/verify Markets.

## Not tested

- Safari, Firefox, or Edge rendering.
- Screen readers (NVDA/JAWS/VoiceOver).
- Real devices/touch hardware.
- WebPageTest/field Core Web Vitals.
- Public rich-results validation.
- Customer account login, real checkout, payments, taxes, shipping rates.
- Multi-variant selection, bundle/volume pricing, or back-in-stock flows.
- Email deliverability, newsletter subscriber management, or marketing automation.

## Assumptions recorded

- Brand name "Gardner" is a storefront brand; Shopify admin display name "Gardner Dev" is intentionally different and is not used in customer-facing titles or schema.
- The brief's palette is used as specified; contrast was validated for the tested text/control combinations.
- Demo prices are plausible retail/demonstration prices from research, not supplier quotes.
- AI-generated imagery is editorial only and is not evidence of real customers, locations, tests, or Gardner operations.
- The July 2026 Dawn 16.0.0 baseline is used under Shopify's theme license; Lavandula code/assets were not copied.
