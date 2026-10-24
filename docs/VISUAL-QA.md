# Visual QA and Reference Comparison

- **Compared:** 2026-10-25
- **Reference:** https://lavandula.webflow.io/ (public rendered site)
- **Implementation:** unpublished Gardner preview theme `#191259083065`
- **Method:** Chromium via Playwright; matched viewport sizes; full-page and above-the-fold screenshots; side-by-side crops. No pixel-diff percentage is claimed because the reference and Gardner use different content models, imagery, and fonts.

## Evidence

| Comparison | File |
|---|---|
| Home, 1440 (top 1700 px, reference left / Gardner right) | `docs/qa/compare-home-1440.jpg` |
| Collection, 1440 (top 1500 px) | `docs/qa/compare-collection-1440.jpg` |
| Product, 1440 (top 1500 px) | `docs/qa/compare-product-1440.jpg` |
| Gardner home 1440 full page | `docs/qa/home-1440.png` (1440×6564) |
| Gardner collection 1440 | `docs/qa/collection-1440.png` (1440×2944) |
| Gardner product 1440 | `docs/qa/product-1440.png` (1440×2755) |
| Tablet 768 screenshots | `docs/qa/home-768.png`, `collection-768.png`, `product-768.png` |
| Mobile 390 screenshots | `docs/qa/home-390.png`, `collection-390.png`, `product-390.png`, `mobile-menu-390.png` |
| Interactive states | `mega-menu-1440.png`, `search-modal-1440.png`, `search-1440.png`, `search-empty-1440.png`, `collection-filtered-1440.png`, `product-lightbox-1440.png`, `cart-drawer-1440.png`, `wishlist-1440.png`, `wishlist-empty-1440.png`, `product-sold-out-1440.png`, `product-low-stock-1440.png` |

Reference baselines remain in `docs/reference/` (Lavandula home/product/products/blog/about/contact, plus earlier Gardner captures).

## Homepage

### Aligned

- Full-bleed hero with cream/oversized display heading, short supporting line, and pill/rounded CTAs.
- Editorial section rhythm: large vertical spacing, 1400px container, image-led cards, soft 12px media corners.
- Warm cream background with restrained green/orange accents rather than aggressive sale banners.
- Image-led category cards and product cards with vendor/name/price hierarchy.
- Separate brand-story, guide, and gallery blocks; editorial footer with newsletter.
- Typography hierarchy: condensed display headings (Josefin Sans) over a humanist sans body (Nunito Sans), matching the reference's display/body contrast.

### Intentional differences

- **Brand palette:** Gardner uses the brief's cream/apple-green/orange tokens (`#F7F1E3`, `#8DBF39`, `#F28C28`) rather than Lavandula's olive/gold/sage palette.
- **Content model:** Lavandula is a landscaping-services template with services, process steps, FAQ, and a 6-product shop. Gardner is a product store; its homepage has category navigation, bestsellers, guides, a clearly labelled demo review block, and a product trust strip on PDPs instead of service sections.
- **Height:** Gardner home is ~6,564 px at 1440 vs the reference's ~13,398 px because there are fewer sections and no services/process/FAQ blocks. The brief's planned homepage areas are all present.
- **Imagery:** original AI-generated editorial photography is used for hero/story/footer; product photography comes from brand/retailer listings. The reference's own images/fonts were not reused.
- **Menu:** Gardner uses a commerce mega menu with 7 collection links; the reference's demo nav is a template page list.

### Fidelity limits

- No access to the Webflow project, source CSS, font files, or licensed assets. Measurements come from rendered output only.
- Hover/focus states on the reference were only partially observable; Gardner prioritizes visible keyboard focus and accessible menus over exact hover mimicry.
- The reference's hairlines, letter-spacing, and image crops cannot be matched exactly without its assets and font files.

## Collection page

- **Aligned:** full-width collection heading area, 4-column product grid on desktop, 2-column on mobile, image-forward cards, faceted filters above the grid, simple sorting control.
- **Differences:** Gardner's filter labels and chip styling follow Dawn's native controls with brand tokens; product prices/vendors are real researched data rather than the reference's six demo products. Gardner cards do not show star ratings (no review app installed).
- **Fix made during QA:** collection-card `sizes` now accounts for the 2-column mobile grid, preventing a 1500 px image from being downloaded for a ~178 px card.

## Product page

- **Aligned:** left gallery / right product info split, large media, title-first hierarchy, price, quantity controls, related products below, soft surfaces and rounded media.
- **Differences:** Gardner uses a stacked single-image gallery (one verified image per product) with a lightbox; the reference shows four gallery images. Related products are 4 cards in both. Gardner adds a product trust strip (secure Shopify checkout, portfolio-demo note, contact link) and inventory state, which the reference does not have.
- **Trust wording:** no invented shipping times, warranties, review counts, or certifications. The trust strip states only verifiable platform/demo facts.

## Header, menus, and footer

- Mega menu opens on click/Enter, uses a 3-column list, and closes on Escape. Mobile uses a drawer.
- Sticky header hides on scroll down and returns on scroll up; verified at 1440.
- Footer is editorial: botanical lockup, brand story, menu, newsletter, policy links, and a full-width image band.
- **Difference:** no announcement bar (per brief). Social icons are only rendered when URLs exist in theme settings; none were invented.

## Responsive observations

- 1440: 4-column product grids, 3-column categories, 2-column story.
- 768: filters remain usable; cards reflow to 3/2 columns; footer becomes 2 columns.
- 390: single-column hero content with large but readable type; 2-column product/collection cards; footer stacks; mobile menu and cart drawer are usable; no horizontal overflow measured on home, collection, or product.
- Touch targets on primary CTAs are ≥ 44 px tall; icon-only header controls have accessible names.

## Differences caused by Shopify/platform

- Development-store preview bar overlays the top of the viewport; it is not part of the theme.
- Password gate and admin preview mean screenshots are authenticated and not publicly reproducible.
- Native Shopify checkout, dynamic checkout (disabled), and account flows are platform-owned and not restyled.
- Product/collection imagery comes from Shopify CDN with platform-generated responsive variants; theme assets use manually generated responsive JPEGs.

## What was not compared

- Safari/Firefox/Edge rendering.
- Reference hover/micro-interaction timing in detail.
- Pixel-difference percentage or perceptual diff scoring.
- Logged-in customer/account states.
