# Patterns & Lessons

## 2025-12-07 — Foundation hardening (SYOS-706)
- Favor functional factories over classes (Principle #11). Example: `logger` built via `createLogger()` to preserve API while staying class-free.
- Use typed error factories plus type guards instead of subclasses. Example: `createWorkOSError` + `isWorkOSError` keeps status codes and names without relying on `instanceof`.
- Remove localhost fallbacks for app URLs (Principle #20). Require `PUBLIC_APP_URL` and surface a clear error; build invite links via a helper (`getPublicAppUrl`) rather than `|| 'http://localhost:5173'`.
- Enforce Convex layering scaffolds: keep `convex/features/` and `convex/infrastructure/` directories present even if empty, to guide dependency flow (Principle #5).

## 2025-12-21 — PersonSelector/RoleCard re-assign bug (Bits UI Combobox + Svelte 5 $state proxies)
- **Symptom**: After removing a person from a RoleCard and re-adding the same person (without refreshing), the selection UI shows the person but assignment doesn’t happen; later it “works” but requires two clicks.
- **Root cause**: Bits UI Combobox can emit a “clear” change (value becomes `undefined` / empty) depending on controlled-value timing. In Svelte 5, `selectedPersonIds` can be a `$state` proxy; passing that proxy across callbacks and/or immediately clearing a bound value can produce confusing “empty selection” calls.
- **Fix pattern**:
  - Prefer **`bind:value`** (function binding when bridging types) over manually controlling via `value=` + ad-hoc state writes.
  - In single-select mode, treat `onValueChange(value)` as authoritative and **only emit selection callbacks on truthy `value`** (don’t propagate “clear” as “select”).
  - When emitting selection callbacks, **pass fresh arrays** (e.g. `[value]`, `[...next]`) instead of `$state` proxy arrays to avoid proxy aliasing/snapshot issues.
