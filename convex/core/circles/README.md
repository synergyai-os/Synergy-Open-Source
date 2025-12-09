# Circles Core Module

Pure business logic functions for the circles domain. This module contains no database dependencies and focuses on testable, isolated business logic.

## Purpose

Circles represent work workspace units (not people grouping). Examples include value streams, functions, and coordination contexts. Circles can be nested (parent-child relationships).

## Architecture

This module follows the core domain pattern established in `/convex/core/authority/`:

- **Pure functions only** - No side effects, no database dependencies
- **Isolated files** - Each file focuses on a specific concern
- **Index exports** - Clean public API via `index.ts`
- **Unit tested** - All pure functions have comprehensive tests

## Module Structure

```
circles/
├── slug.ts          # Slug generation and uniqueness logic
├── validation.ts    # Circle data validation rules
├── index.ts         # Public API exports
├── README.md        # This file
└── slug.test.ts     # Unit tests for slug functions
```

## Usage

### In Application Layer (convex/circles.ts)

```typescript
import { slugifyName, ensureUniqueSlug, validateCircleName } from './core/circles';

// Use pure functions for business logic
const slugBase = slugifyName(circleName);
const existingSlugs = new Set(existingCircles.map((c) => c.slug));
const uniqueSlug = ensureUniqueSlug(slugBase, existingSlugs);

// Validate before DB operations
const validationError = validateCircleName(name);
if (validationError) {
	throw new Error(validationError);
}
```

### In Other Modules

```typescript
import { slugifyName } from '../core/circles';

// Use in any context without DB dependencies
const slug = slugifyName('Engineering Team'); // 'engineering-team'
```

## Functions

### Slug Functions (`slug.ts`)

- `slugifyName(name: string): string` - Convert name to URL-friendly slug
- `ensureUniqueSlug(baseSlug: string, existingSlugs: Set<string>): string` - Generate unique slug

### Validation Functions (`validation.ts`)

- `validateCircleName(name: string | undefined | null): string | null` - Validate circle name (for creation)
- `validateCircleNameUpdate(name: string | undefined): string | null` - Validate circle name (for updates)

## Testing

All functions are unit tested without database mocking. Tests verify:

- Edge cases (empty strings, special characters, length limits)
- Business rules (slug uniqueness, validation rules)
- Consistency (mutually exclusive validation states)

See `slug.test.ts` for examples.

## Design Decisions

1. **Pure functions** - No DB dependencies enables isolated testing
2. **Separation of concerns** - Business logic separate from data access
3. **Domain language** - Functions use circle domain terminology
4. **Idempotent operations** - Slug generation is deterministic

## Related Modules

- `/convex/circles.ts` - Application layer (DB operations, mutations/queries)
- `/convex/core/authority/` - Authority calculation (similar pattern)
