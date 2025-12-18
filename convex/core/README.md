# Convex Core Domains

## What Goes Here

Core domains are **foundational entities** that:

1. Other modules depend on
2. Are stable and well-tested
3. Don't depend on modules or application layer

## Current Core Domains

The 10 foundational domains that form the organizational truth kernel:

| Domain         | Status | Purpose                                                            |
| -------------- | ------ | ------------------------------------------------------------------ |
| `users/`       | FROZEN | Global auth identity (`userId`)                                    |
| `people/`      | FROZEN | Workspace-scoped org identity (`personId`)                         |
| `circles/`     | FROZEN | Organizational units with hierarchy                                |
| `roles/`       | FROZEN | Authority distribution units (`roleId`)                            |
| `assignments/` | FROZEN | Person filling role in circle (`personId` + `roleId` + `circleId`) |
| `authority/`   | FROZEN | Permission calculation (computed from roles)                       |
| `history/`     | FROZEN | Immutable audit log (`changedByPersonId`)                          |
| `workspaces/`  | STABLE | Multi-tenant container (`workspaceId`)                             |
| `proposals/`   | STABLE | Change mechanism (`createdByPersonId`)                             |
| `policies/`    | STABLE | Circle-level rules (scaffolded, not yet implemented)               |

## Import Rules

- ✅ Modules CAN import from core
- ❌ Core CANNOT import from modules
- ❌ Core CANNOT import from application layer

## Adding New Core Domains

1. Create directory under `convex/core/`
2. Create `index.ts` with exports
3. Add re-export to `convex/core/index.ts`
4. Add tests for all exported functions
