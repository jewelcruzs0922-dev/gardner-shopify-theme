# Security Notes

This file records credential-handling incidents and remediations without storing any credential values.

## 2026-10-23 — Client secret exposed in session output, then rotated

- While inspecting Dev Dashboard app credentials, the app's **client secret** was returned in tool output and therefore appeared in this session's transcript.
- **Remediation:** the client secret was rotated immediately in Dev Dashboard. The exposed value is invalid.
- No client secret is stored in the repo; `.env` holds only the store-scoped Admin API token.

## 2026-10-23 — Dev storefront password exposed in session output, then rotated

- While finding the "Private mode" toggle, the storefront password field value was returned in tool output.
- **Remediation:** a new random password was generated in-browser, saved, and stored only in gitignored `.env`. The exposed value is invalid.
- The dev storefront remains in private mode (dev stores lock this setting on).

## Admin API token

- Created via OAuth for the org-owned Dev Dashboard app and stored only in `.env` (gitignored).
- Never printed, committed, or screenshotted.
- **Handoff action:** rotate the token and delete the "Gardner Admin" app after the project is archived.

## Repository hygiene

- `.env`, `.env.*`, keys, Shopify CLI state, and Playwright artifacts are excluded via `.gitignore`.
- `.env.example` contains placeholders only.
