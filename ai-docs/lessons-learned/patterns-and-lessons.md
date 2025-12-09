# Patterns & Lessons

## 2025-12-07 — Foundation hardening (SYOS-706)
- Favor functional factories over classes (Principle #11). Example: `logger` built via `createLogger()` to preserve API while staying class-free.
- Use typed error factories plus type guards instead of subclasses. Example: `createWorkOSError` + `isWorkOSError` keeps status codes and names without relying on `instanceof`.
- Remove localhost fallbacks for app URLs (Principle #20). Require `PUBLIC_APP_URL` and surface a clear error; build invite links via a helper (`getPublicAppUrl`) rather than `|| 'http://localhost:5173'`.
- Enforce Convex layering scaffolds: keep `convex/features/` and `convex/infrastructure/` directories present even if empty, to guide dependency flow (Principle #5).

