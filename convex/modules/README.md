# Convex Modules Layer

Modules are feature-specific Convex functions that sit **on top of** the core domains. They can depend on `convex/core/*` but must never be depended on by core. Keep business logic pure and authorization checks close to the mutations/queries.

## Rules

- ✅ Modules can import from `convex/core/**` and shared utilities (validation, auth, feature flags).
- ❌ Core cannot import from `convex/modules/**`.
- ❌ Modules should not reach into other modules directly; share via core or explicit contracts.
- Keep files small and focused; prefer pure helpers where possible.

## Structure

- `meetings/` — Meeting lifecycle (templates, invitations, agenda items, presence).
  - `index.ts` exports module surface
  - `README.md` documents module responsibilities and dependencies
