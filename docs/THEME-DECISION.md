# Theme Foundation Decision

- **Decision:** build Gardner on **Dawn**, Shopify's Online Store 2.0 reference theme, heavily restyled with original sections/assets.
- **Decided:** 2026-10-23 (UTC). Sources accessed 2026-10-23.
- **Target store:** Gardner Dev (development store, unpublished).

## Options evaluated

Sources:
- Shopify "Create a theme" (recommends Skeleton, dev store, `shopify theme init`, `theme dev/push`): https://shopify.dev/docs/storefronts/themes/getting-started/create
- Shopify Skeleton theme: https://github.com/Shopify/skeleton-theme
- Shopify Horizon theme + README: https://github.com/Shopify/horizon
- Shopify Dawn: https://github.com/Shopify/dawn
- Horizon launch context: https://www.shopify.com/case-studies/dermalogica-horizon-theme

| Criterion | Skeleton | Dawn | Horizon |
|---|---|---|---|
| Official role | Recommended starting point for theme development; only approved base for Theme Store submissions | OS 2.0 reference theme | New flagship foundation (2025), theme blocks / nested blocks, web components |
| Fidelity to a bespoke Lavandula-like design | Highest control, but everything is built from scratch | High — plain Liquid markup is easy to restyle | Medium — opinionated components and web components can constrain custom layout |
| Theme-editor flexibility | Low out of the box | Medium-high (sections/blocks on all templates) | Highest (nested blocks) |
| Performance / a11y baseline | Lean, but a11y must be built | Strong, documented a11y and performance patterns | Shopify-built, newer; less third-party documentation |
| Native features we need (predictive search, faceted filters, cart drawer, quick add, mega menu, sticky header) | None — all custom | **Most already implemented and accessible** | Most implemented, new architecture |
| Maintainability / effort | High effort, maximal originality | **Lowest effort with proven patterns** | Medium effort; new mental model, `main` may contain unreleased APIs |

## Rationale for Dawn

1. The brief requires a broad, working storefront (filters, predictive search, cart drawer, quick add, variants, a11y). Dawn ships these as accessible, battle-tested components, which reduces delivery risk versus rebuilding them on Skeleton.
2. Dawn's Liquid/HTML/CSS structure is the most documented and the easiest to restyle toward the Lavandula layout without fighting an opinionated component system.
3. Performance and accessibility patterns are already established; we can meet the WCAG 2.2 AA target with targeted fixes rather than inventing foundations.
4. The project is a bespoke portfolio build, not a Theme Store submission, so Horizon's Theme Store restriction is irrelevant — but Horizon's newer architecture and unreleased-API warning add avoidable risk.
5. The decision is reversible: sections/snippets are portable, and the store can host multiple unpublished themes during development.

## What we will reuse vs replace

- **Reuse patterns:** predictive search markup/behavior, faceted filtering, cart drawer mechanics, variant picker logic, responsive image snippet, a11y focus handling.
- **Replace/restyle:** all visual design (color, type, spacing, radii), header/mega menu, homepage sections, product/collection templates, footer, editorial sections.
- **Remove:** Dawn demo content and any Dawn branding; no Dawn demo copy in shipped pages.
- **Do not:** copy Lavandula markup, copy, or assets.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Dawn's default look leaks through | Full design-token pass; visual QA against reference screenshots at 1440/768/390 |
| Heavy overrides make CSS brittle | Token-driven CSS, section-scoped styles, minimal `!important` |
| Asset/font licensing | Use licensed/self-hosted fonts with recorded licenses; original or licensed imagery only |
| Theme Store rules | Not applicable (development/portfolio project); still avoid claiming Theme Store readiness |

## Follow-up

- Scaffold with `shopify theme init --clone-url https://github.com/Shopify/dawn.git` once Shopify CLI auth is approved.
- Run `shopify theme check` before each milestone.
