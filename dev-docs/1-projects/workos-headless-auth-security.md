# WorkOS Headless Auth Security Decisions

## Summary
- Keep WorkOS in “headless” mode so all user-facing UX (login, registration, account linking) lives inside SvelteKit.
- Derive and store session material using a single `SYOS_SESSION_SECRET`; encrypt access/refresh tokens before writing to Convex.
- Maintain PKCE + state verification on every auth redirect, and revoke upstream WorkOS sessions during logout.
- Support SYOS-7 (account linking & switching) by reissuing secure session cookies when a user selects a linked account; no silent cookie rewrites on the client.
- Document every required environment variable and redirect so we can reproduce the configuration across environments.

## Goals & Threat Model
- **Integrity**: prevent session fixation or hijacking while we move to custom login/register flows.
- **Confidentiality**: keep access/refresh tokens and CSRF secrets encrypted at rest; never expose secrets to the browser.
- **Availability**: allow multi-device sessions and rapid account switching without forcing users through WorkOS every time.
- **Compatibility**: align with SvelteKit 5 + Convex patterns and the upcoming account-linking slice (SYOS-7).

## Authentication Flow Decisions
1. **PKCE + State**  
   - Continue generating random state + PKCE verifier in `/auth/start` and storing the hashed state through `createLoginState`.  
   - `/auth/callback` must consume and delete the stored state, rejecting mismatches to block replay.
2. **Custom UI Entrypoints**  
   - `/login` and `/register` become real Svelte pages that collect inputs, call `/auth/start`, and show loading/errors.  
   - `/auth/start` accepts `mode=sign-in|sign-up` (and optional `linkAccount` flag) so we control the WorkOS `screen_hint` and preserve redirect targets.
3. **Redirect URIs**  
   - Only `/auth/callback` is registered with WorkOS for headless flows. All internal navigation happens after we reissue our own session cookie.  
   - When we add account linking routes (e.g., `/auth/link-account`), they must funnel through `/auth/start` so we never bypass PKCE/state.

## Secrets, Cookies, and Storage
- **Environment**: `WORKOS_CLIENT_ID`, `WORKOS_API_KEY`, `WORKOS_REDIRECT_URI`, `SYOS_SESSION_SECRET` (≥32 chars), optional `SYOS_SESSION_TTL_DAYS`, plus existing Convex keys. WorkOS recommends strong random values for cookie/session secrets and registering redirect URIs explicitly.[^authkit-env]
- **Cookie policy**: keep `httpOnly`, `secure`, `sameSite=lax`, and align names with `syos_session` / `syos_csrf` as a follow-up.  
- **Encryption**: we already derive AES-GCM/HMAC keys from `SYOS_SESSION_SECRET`; continue encrypting access/refresh tokens and hashing CSRF tokens before writing to `authSessions`.  
- **Session refresh & revocation**: rotate tokens via `refreshWorkOSSession` and call `revokeWorkOSSession` during logout to stay consistent with WorkOS session guidance.[^workos-node]

## Account Linking & SYOS-7 Support
- Validate the `accountLinks` table + queries (from prior SYOS slices); add a secured mutation/route to switch the active account.  
- Session switching should call a server endpoint that:
  1. Verifies the selected account is linked to the current Convex user.
  2. Calls `establishSession` with the linked account’s Convex/WorkOS IDs, issuing a fresh cookie.
  3. Optionally revokes (or marks inactive) the previous session if we want single-session semantics per browser.  
- Frontend: update the organization/account switcher to POST to the new endpoint and refresh `useAuthSession` state.  
- Ensure CSRF tokens are rotated when switching accounts so the browser never reuses a stale value.

## Logging & Monitoring
- Log WorkOS callback errors, refresh failures, and logout revocation issues (without tokens or PII).  
- Consider adding basic metrics around session creation/switching to spot abuse or failed link attempts.

## Implementation Checklist
1. Extend `/auth/start` to accept `mode`, `linkAccount`, and sanitize redirect targets.
2. Rebuild `/login` + `/register` pages with first-party forms and error/loading states.
3. Implement server route for account switching, reusing `establishSession`.
4. Update cookies (`syos_session` / `syos_csrf`) and mirror changes in `useAuthSession`.
5. Document required WorkOS dashboard settings (redirect URI, allowed origins).
6. Update docs and onboarding scripts to use `SYOS_SESSION_SECRET` exclusively.

[^authkit-env]: [WorkOS AuthKit environment & secret requirements](https://github.com/workos/authkit/blob/main/src/app/using-hosted-authkit/README.md)
[^workos-node]: [WorkOS session management (sealed cookies, refresh, revoke)](https://context7.com/workos/workos-node/llms.txt)

