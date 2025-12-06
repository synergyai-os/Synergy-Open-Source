# Roles Core Domain

Pure business logic for circle roles. Keeps Convex-specific I/O in the application layer (`convex/circleRoles.ts`) while enabling isolated unit tests.

## Included

- Lead detection based on role templates
- Duplicate name validation (trimmed, case-insensitive)
- Lead counting and lead requirement rules (by circle type)

## Import Rules

- ✅ Application and modules can import from here
- ❌ No imports from Convex server/runtime layers
- ❌ No database or side effects

## Testing

- See `detection.test.ts`, `validation.test.ts`, `lead.test.ts`
