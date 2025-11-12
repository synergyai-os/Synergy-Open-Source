## Headless WorkOS Auth – Implementation Plan

### Summary

- Replace the ad hoc WorkOS callback flow with a fully headless, server-owned auth pipeline.
- Prioritise security (PKCE, CSRF, HTTP-only cookies) and allow multiple concurrent sessions per user/device.
- Minimise bandwidth by decoupling browser-to-WorkOS chatter from routine app traffic.

### Current Pain Points

- Access tokens are written to cookies (`wos-session`) without rotation or audience checks.
- No PKCE/state validation → vulnerable to code injection/replay.
- Session info is duplicated in cookies; logout relies on client-side JWT parsing.
- Single cookie model cannot differentiate concurrent sessions across browsers/devices.
- Each request implicitly trusts cookies without verifying freshness against WorkOS or a server-side session store.

### Requirements

- **Security-first:** PKCE + state per login, CSRF protection for all auth endpoints, signed & HTTP-only cookies only.
- **Concurrent sessions:** Multiple active sessions per WorkOS user (different browsers/devices) without clobbering.
- **Minimal roundtrips:** Only call WorkOS on login, refresh, and explicit logout; avoid per-request validation calls.
- **Svelte 5 compatible:** Provide runes-based composables/stores for UI, no third-party auth wrappers.
- **Observability:** Log notable auth events (login, refresh, logout, failure) without leaking sensitive data.

### Proposed Architecture

1. **Session bootstrap (`/auth/start` GET)**
   - Generates PKCE verifier/challenge + state token.
   - Stores hashed verifier + metadata (tenant hint, redirect target) in a short-lived `auth_login_state` record (Convex or encrypted cookie).
   - Redirects browser to WorkOS `/authorize` with query params.

2. **Callback handler (`/auth/callback` GET)**
   - Validates state, swaps authorization code for tokens with WorkOS `authenticate`.
   - Creates/updates Convex `users` entry.
   - Writes a new `auth_sessions` record:
     - Fields: `sessionId` (UUID), `workosSessionId`, `workosUserId`, `convexUserId`, `refreshToken`, `accessToken`, `expiresAt`, `ip`, `userAgent`, `createdAt`, `lastSeenAt`.
     - Allows multiple sessions per user by not reusing `sessionId`.
   - Sets `syos_session` cookie => signed, HTTP-only, `Secure`, `SameSite=Lax`, stores only opaque `sessionId`.
   - Returns 302 → original redirect target (fallback `/inbox`).

3. **Session validation (`hooks.server.ts`)**
   - Reads `syos_session` cookie.
   - Looks up `auth_sessions` by `sessionId`, verifies expiry + integrity (HMAC signature).
   - Refreshes tokens when `expiresAt` < now + 5 minutes (server-to-WorkOS call, writes new tokens). Refreshes happen at most once per request cycle, then cached for subsequent requests.
   - Populates `event.locals.auth = { sessionId, user, workosUserId, accessToken }`. Access token stays server-side only.

4. **Logout (`/auth/logout` POST)**
   - Requires CSRF token.
   - Deletes `auth_sessions` record, revokes WorkOS session (`/sessions/logout`).
   - Clears `syos_session` cookie and returns 303 to `/login`.

5. **Session introspection (`/auth/session` GET)**
   - Returns minimal JSON (user info, expiry, needsReauth flag) for client hydration.
   - Uses ETag + `Cache-Control: no-store` to reduce payload without caching sensitive data.

6. **Client integration**
   - New composable `useAuthSession.svelte.ts` exposes `$state` getters (`user`, `isAuthenticated`, `isRefreshing`, `logout()`).
   - Login actions redirect to `/auth/start?redirect=` to keep the client stateless.
   - Route guard utilities rely on `event.locals.auth`.

### Data Model Changes (Convex)

- Add table `auth_login_state` (ephemeral):
  - `id`, `codeVerifierHash`, `stateHash`, `redirectTo`, `createdAt`, `expiresAt`, `ip`, `userAgent`.
  - TTL index (15 min) for automatic purge.
- Add table `auth_sessions`:
  - `sessionId` (string, unique), `convexUserId`, `workosUserId`, `workosSessionId`, `accessToken`, `refreshToken`, `expiresAt`, `createdAt`, `lastRefreshedAt`, `ip`, `userAgent`, `valid` (boolean).
  - Index by `convexUserId` and `workosSessionId` for auditing and concurrent session management.

### Security Controls

- **PKCE + state:** Stored hashed; compare constant-time.
- **Cookie hardening:** Signed with server secret (HMAC), rotation on refresh, 30-day max age (configurable).
- **Refresh token storage:** Encrypted at rest (Convex secrets) or at least base64 + server-side encryption via WorkOS-provided libs.
- **Session rotation:** On refresh or IP/UA change, issue new `sessionId` + cookie to defend against session fixation.
- **Brute-force mitigation:** Rate-limit `/auth/start` and `/auth/callback` per IP + user.
- **Audit trail:** Log to structured logger (no tokens) for SOC review.

### Performance & Bandwidth

- Authorisation redirect happens once per login.
- Routine page loads use Convex lookup + cached session (no WorkOS HTTP call).
- Token refresh occurs server-side only when necessary (time skew window).
- `/auth/session` payload kept <1 KB, optional ETag to prevent redundant JSON.

### SvelteKit Integration Points

- Update `hooks.server.ts` to delegate to new `validateSession` util using Convex client.
- Provide `src/lib/server/auth/session.ts` with helpers (`createSession`, `getSession`, `refreshSession`, `clearSession`).
- Update protected layouts to read `locals.auth.user`.
- Replace direct cookie parsing in routes with server utilities.

### Environment Variables

- `WORKOS_CLIENT_ID`, `WORKOS_API_KEY`, `WORKOS_REDIRECT_URI`.
- `WORKOS_PROJECT_ID` (needed for some API calls).
- `SYOS_SESSION_SECRET` (cookie signing).
- `SYOS_SESSION_TTL_DAYS` (optional override).

### Open Questions / Assumptions

- Assume concurrent sessions mean “multiple browsers/devices per user” rather than multi-account login within one tab; we’ll design for both but UI for account switching is out of scope.
- Need confirmation whether to store session records in Convex or a dedicated KV (e.g., Upstash). Current plan uses Convex for consistency.
- MFA / passwordless flows are deferred; WorkOS handles upstream if enabled.

### Next Steps

1. Finalise data model updates in `convex/schema.ts`.
2. Scaffold server utilities and routes (`/auth/start`, `/auth/callback`, `/auth/logout`, `/auth/session`).
3. Replace `hooks.server.ts` auth logic with new session validation.
4. Implement client composables + UI wiring.
5. Add tests + docs updates (`dev-docs/2-areas/workos-convex-auth-architecture.md`).
