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

## 2026-10-27 — Second client secret rotated; Admin token reissued

- A second, distinct client secret was found in the 2026-10-24 Playwright snapshot; the earlier note covered only the first secret.
- Both previously exposed client secrets were revoked in Dev Dashboard. A fresh secret was generated and was not recorded or printed.
- Revoking the client secrets invalidated the store-scoped Admin API token. A new OAuth token was issued through the same app and stored only in gitignored `.env`; a read-only `shop { name currencyCode }` query returned HTTP 200.
- The two affected Playwright snapshots were redacted to remove `shpss_` values. No credential values are recorded in this note.
- `.env` and `.playwright-mcp` remain untracked/ignored, with local ACL access limited to the current user, SYSTEM, and Administrators.
