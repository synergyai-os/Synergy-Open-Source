# Convex Core Domains

## What Goes Here

Core domains are **foundational entities** that:

1. Other modules depend on
2. Are stable and well-tested
3. Don't depend on modules or application layer

## Current Core Domains

| Domain       | Purpose                                               |
| ------------ | ----------------------------------------------------- |
| `authority/` | Circle authority calculation                          |
| `roles/`     | Pure role business logic (lead detection, validation) |

## Import Rules

- ✅ Modules CAN import from core
- ❌ Core CANNOT import from modules
- ❌ Core CANNOT import from application layer

## Adding New Core Domains

1. Create directory under `convex/core/`
2. Create `index.ts` with exports
3. Add re-export to `convex/core/index.ts`
4. Add tests for all exported functions
