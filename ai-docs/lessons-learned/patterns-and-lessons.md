# Patterns & Lessons (Auth Redirect + Telemetry)

## Patterns
- **Workspace-scoped redirects only:** Never redirect to plain `/inbox`. When slug is unknown, route through `/auth/redirect`; when known, use `/w/{slug}/...`.
- **Resolver fallback path:** If workspace resolution fails, redirect to onboarding with a reason code (`auth_fallback=...`) and log context server-side.
- **Dual-mode redirect endpoint:** `/auth/redirect` returns JSON only when explicitly requested (`Accept: application/json` or `?format=json`); otherwise performs the redirect to avoid surfacing JSON in browsers.

## Lessons
- **Surface failure reasons for telemetry:** Add query-string reason codes on fallback redirects so the client can emit analytics and aid debugging.
- **Client capture tied to navigation:** Hook PostHog capture on navigation to read fallback reasons from the URL; avoids scattering capture calls in individual components.
- **Remove silent fallbacks early:** Purging legacy fallback targets (`/inbox`) prevents loops and hides fewer errors; combine with structured logging and telemetry.

