# Lavandula Reference Inventory

- **Reference:** https://lavandula.webflow.io/ (public rendered site only)
- **Inspected:** 2026-10-23, 21:16–21:35 UTC
- **Method:** Chrome via Playwright MCP; DOM + computed styles extracted; full-page screenshots at matched viewports.
- **Access limitation:** The original Webflow project, source files, fonts, and asset licenses are **not** available. Only rendered output was observed. Do not copy reference markup, copy, or assets; use it for layout, hierarchy, and interaction character only.

## 1. Evidence captured

| File | Viewport | Page | Document height |
|---|---|---|---|
| `docs/reference/lavandula-home-1440-full.png` | 1440×900 | Home | 13,363 px |
| `docs/reference/lavandula-home-1440-hero.png` | 1440×900 | Home (above the fold) | — |
| `docs/reference/lavandula-home-768-full.png` | 768×1024 | Home | 12,318 px |
| `docs/reference/lavandula-home-390-full.png` | 390×844 | Home | 17,097 px |
| `docs/reference/lavandula-products-1440-full.png` | 1440×900 | Products listing | — |
| `docs/reference/lavandula-product-1440-full.png` | 1440×900 | Product detail | — |
| `docs/reference/lavandula-about-1440-full.png` | 1440×900 | About A | — |
| `docs/reference/lavandula-blog-1440-full.png` | 1440×900 | Blog listing | — |
| `docs/reference/lavandula-contact-1440-full.png` | 1440×900 | Contact A | — |

At 768 px the desktop `<nav>` is hidden (`display: none`) and a hamburger ("menu") is used. At 390 px the same mobile pattern applies.

## 2. Observed page types

Home (`/`), home variations (`/home-variations/home-a|b|c`), about (`/about-variations/about-a|b|c`), contact (`/contact-variations/contact-a|b|c`), blog (`/blog`), blog post (`/post/<slug>`), products (`/products`), product detail (`/product/<slug>`), category (`/category/garden-tools`), checkout (`/checkout`), style guide, licensing, changelog, privacy policy, password (401), 404.

**Fit note:** Lavandula is a *landscaping-services* template with a small 6-product shop. Gardner is a *garden-tools product store*. Use Lavandula for section rhythm, hierarchy, typography scale, card patterns, and interaction character — not its service-business content model.

## 3. Homepage structure (desktop 1440)

Observed section order and rendered heights:

1. **Hero** — 682 px. H1 "Landscape & Gardening products and services". Transparent 64 px navbar over hero (`div.navbar.w-nav`, `position: relative`).
2. **Products / bestsellers** — 1,280 px. 6 product cards; "DISCOVER ALL PRODUCTS" link.
3. **Value proposition** — 847 px. H2 "An upgrade to your garden will bring relaxation and connection".
4. **Showcase** — 576 px. H2 "See Our Work".
5. **Services** — 1,341 px. H2 "Our Landscaping & Gardening Services"; 6 items: Tree & Shrub Care, Seasonal Cleanups, Lawn Maintenance, Garden Design, Irrigation Systems, Planting & Flower Beds.
6. **Benefits ("Why Choose Us")** — 924 px. 3 items: Personalized Service, Eco-Friendly Practices, Experienced Professionals.
7. **Gallery showcase** — 1,018 px. H2 "Client work gallery".
8. **Process steps** — 741 px. H2 "How We Transform Your Outdoors"; 4 steps: First Consultation, Customized Plan, Execution & Care, Ongoing Support.
9. **Final CTA** — 650 px. "Get 15% Off and premium on-sight assessment".
10. **Testimonials** — 682 px. "What are clients have shared".
11. **Blog** — 1,457 px. "Latest Gardening News"; 3 cards.
12. **FAQ** — 1,097 px. "Most common questions"; 7 questions.
13. **Footer** — brand blurb, Social Channels, Main Pages, Ecommerce, Utility Pages; newsletter form.

## 4. Design tokens (computed)

**Typography**
- Body: `Nunito Sans` 16 px / 24 px, weight 400, color `#1B3F22` on `#FFFCF6`.
- H1: `Josefin Sans` 66 px / 66 px, weight 500, tracking −1.98 px, cream `#F3EFDF`.
- H2: `Josefin Sans` 50 px / 60 px, weight 400, tracking −2.5 px, `#1B3F22`.
- H3: `Josefin Sans` 16 px / 19.2 px, weight 500, uppercase, tracking −0.16 px, `#1B3F22`.
- Nav links: `Nunito Sans` 16 px, olive `#8A7512`.

**Layout**
- Content max-width: **1,350 px** (nested content block ~940 px).
- Standard section padding: **~142 px** top/bottom (some sections 67–71 px).
- Navbar height: **64 px**; transparent over the hero.

**Color swatches observed**
- `#FFFCF6` page background
- `#F3EFDF` cream text / cream surfaces
- `#1B3F22` ink green
- `#8A7512` olive accent (nav links)
- `#A39240` gold/olive block
- `#C5CBA5` sage
- `#FFDEDE` blush
- `#DAE4FF` periwinkle
- `rgba(15,48,18,0.1)` subtle tint
- `#FFFFFF`

**Shape**
- Pills: `border-radius: 999px` / `100px`; small surfaces `8px`. Brief calls for soft/rounded — consistent.

## 5. Catalog pattern observed on the reference

The reference demo shop contains 6 products (demo copy/prices, not Gardner data):

| Product | Price |
|---|---|
| Solar-Powered Garden Lights (Pack of 8) | $29.99 |
| Expandable Garden Hose (50ft) | $34.95 |
| Heavy-Duty Garden Kneeler & Seat | $39.99 |
| Organic All-Purpose Plant Fertilizer (2lb) | $14.50 |
| Raised Garden Bed Kit (Wooden, 4x2ft) | $69.00 |
| Premium Pruning Shears | $19.99 |

A category link `/category/garden-tools` exists. Product detail layout: label "PRODUCT", title, paragraph description, category tag ("GARDEN TOOLS"), quantity input, price with "/ per unit", 4-image gallery, "Related Products" (4 cards).

## 6. Blog and contact patterns

- Blog: categories Seasonal Tips, Lawn Care, Gardening Basics, Sustainable Practices, Outdoor Design; 3 post cards.
- Contact: three contact cards (email, phone, address), a "How can we assist you?" form (Name, Last Name, Email Address, Message), social links, map link.
- **Do not reuse** the reference's demo contact details (`contact@greenscaping.com`, `(307) 555-1948`, Buffalo WY address) as Gardner data.

## 7. Interaction observations

- Sticky/hide-on-scroll behavior: **not confirmed**. No `<header>` element; the navbar is `div.navbar.w-nav` with `position: relative` and transparent background. The brief asks for smart sticky behavior "if consistent with the reference" — verify again before implementing; record as uncertain.
- Mobile navigation collapses to a "menu" control at 768 px and 390 px.
- Cart is a slide-out drawer ("Your Cart", "Close cart", "Continue to Checkout").
- Sliders exist on the page ("previous slide" / "next slide" controls in the mobile DOM).

## 8. Uncertainties / limitations

- Exact reference font files and licenses unknown; Josefin Sans and Nunito Sans are Google Fonts and are used here only as a fidelity reference, subject to license verification before shipping.
- Hover, focus, and mega-menu states were only partially observed; the demo nav is a template page list ("All Pages"), not a commerce IA.
- Measurements limited to 1440×900, 768×1024, 390×844 in Chrome. Safari/Firefox not tested.
- No access to the Webflow project, CMS data, or original image assets.
- The brief's brand palette (cream `#F7F1E3`, apple green `#8DBF39`, orange `#F28C28`, 60/30/10) differs from the reference palette (cream/green/olive/gold). **Unresolved decision:** use the brief palette for brand compliance while borrowing the reference's layout and type hierarchy.

## 2026-10-25 resolution

- Palette decision resolved in favor of the brief: cream `#F7F1E3`, apple green `#8DBF39`, orange `#F28C28`, with the reference's layout/type hierarchy only.
- Sticky behavior was implemented as hide-on-scroll-down / reveal-on-scroll-up and verified at 1440.
- Matched comparison screenshots are in `docs/qa/compare-*.jpg`; notes in `docs/VISUAL-QA.md`.
