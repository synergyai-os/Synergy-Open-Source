# Test Organization Strategy

**Status**: ✅ **Migration Complete**  
**Last Updated**: 2025-11-20  
**Related**: 
- [SYOS-319](https://linear.app/younghumanclub/issue/SYOS-319) - Reorganize Codebase for Team Ownership & Module Structure
- [SYOS-343](https://linear.app/younghumanclub/issue/SYOS-343) - Implement Test Organization Strategy
- [SYOS-349](https://linear.app/younghumanclub/issue/SYOS-349) - Update Vitest Config for Colocated Tests
- [SYOS-350](https://linear.app/younghumanclub/issue/SYOS-350) - Update Test Organization Documentation

---

## Executive Summary

**Recommendation**: **Hybrid approach** - Colocate module-specific tests with modules, keep cross-module tests centralized.

**Why**: Enables team ownership (each team owns their module + tests) while maintaining shared test infrastructure for integration/E2E tests.

---

## Current State

**✅ Migration Status**: Complete - Tests are now colocated with modules, Vitest config updated.

### Test Structure (Before SYOS-319)

```
SynergyOS/
├── tests/
│   ├── composables/          # Composables unit tests
│   └── convex/
│       ├── integration/      # Convex integration tests
│       └── *.test.ts         # Convex unit tests
├── e2e/                      # E2E tests (Playwright)
└── src/lib/modules/          # Modules (being reorganized)
```

**Issues**:
- ❌ Tests centralized, unclear ownership
- ❌ Module-specific tests scattered across `tests/` folder
- ❌ Hard to find tests for a specific module
- ❌ Teams can't independently own their test suite

---

## Current Structure (✅ Implemented)

### Hybrid Approach: Colocated + Centralized

**Status**: ✅ **Fully Implemented** - All module-specific tests colocated, cross-module tests centralized.

```
SynergyOS/
├── src/lib/modules/
│   ├── core/
│   │   └── organizations/
│   │       └── __tests__/
│   │           └── organizations.integration.test.ts    # ✅ Colocated
│   ├── flashcards/
│   │   └── __tests__/
│   │       └── flashcards.integration.test.ts           # ✅ Colocated
│   ├── meetings/
│   │   └── __tests__/
│   │       ├── meetings.integration.test.ts            # ✅ Colocated
│   │       ├── meetingActionItems.integration.test.ts   # ✅ Colocated
│   │       ├── meetingAgendaItems.integration.test.ts   # ✅ Colocated
│   │       ├── meetingDecisions.integration.test.ts     # ✅ Colocated
│   │       └── meetingTemplates.integration.test.ts     # ✅ Colocated
│   └── org-chart/
│       └── __tests__/
│           ├── circles.integration.test.ts               # ✅ Colocated
│           └── circleRoles.integration.test.ts           # ✅ Colocated
├── tests/
│   └── convex/
│       └── integration/                                 # ✅ Centralized (cross-module)
│           ├── setup.ts                                 # Shared test helpers
│           └── test.setup.ts                            # Test configuration
├── e2e/                                                  # ✅ Centralized (user flows)
│   ├── inbox-workflow.spec.ts
│   ├── quick-create.spec.ts
│   └── settings-security.spec.ts
└── convex/                                              # ✅ Colocated with source
    └── *.test.ts                                         # Convex unit tests
```

**Note**: Component and composable unit tests can be colocated next to their source files (e.g., `InboxCard.svelte.test.ts`), but currently most tests are integration tests in `__tests__/` folders.

---

## Test Organization Principles

### 1. **Colocate Module-Specific Tests** ✅

**What**: Unit tests, component tests, and module-specific integration tests live **inside the module folder**.

**Why**:
- ✅ **Team Ownership**: Each team owns their module + tests
- ✅ **Discoverability**: Tests next to code = easier to find
- ✅ **Co-location**: Change code → see tests immediately
- ✅ **Module Independence**: Teams can work independently

**Pattern**:
```typescript
// ✅ CORRECT: Colocated with component
src/lib/modules/inbox/components/InboxCard.svelte
src/lib/modules/inbox/components/InboxCard.svelte.test.ts

// ✅ CORRECT: Colocated with composable
src/lib/modules/inbox/composables/useInboxItems.svelte.ts
src/lib/modules/inbox/composables/useInboxItems.svelte.test.ts

// ✅ CORRECT: Module test suite
src/lib/modules/inbox/__tests__/inbox.integration.test.ts
```

### 2. **Centralize Cross-Module Tests** ✅

**What**: Integration tests that span multiple modules, E2E tests, and infrastructure tests stay **centralized**.

**Why**:
- ✅ **Shared Infrastructure**: Test helpers, fixtures, setup
- ✅ **Cross-Module Concerns**: Tests that verify module interactions
- ✅ **E2E Flows**: User workflows that span multiple modules
- ✅ **CI/CD**: Easier to run all cross-module tests together

**Pattern**:
```typescript
// ✅ CORRECT: Cross-module integration test
tests/convex/integration/tags.integration.test.ts  // Tests tags + inbox + notes

// ✅ CORRECT: E2E test (spans multiple modules)
e2e/inbox-workflow.spec.ts  // Tests inbox + notes + tags

// ✅ CORRECT: Infrastructure test
tests/convex/sessionValidation.test.ts  // Tests auth infrastructure
```

### 3. **Colocate Convex Unit Tests** ✅

**What**: Convex function unit tests live **next to the source file**.

**Why**:
- ✅ **Convex Convention**: Matches Convex best practices
- ✅ **Discoverability**: Find tests immediately when reading code
- ✅ **Type Safety**: Tests import from same directory

**Pattern**:
```typescript
// ✅ CORRECT: Colocated with Convex function
convex/tags.ts
convex/tags.test.ts

// ✅ CORRECT: Colocated with Convex function
convex/inbox.ts
convex/inbox.test.ts
```

---

## Test Types & Locations

| Test Type | Location | Example | Why |
|-----------|----------|---------|-----|
| **Component Tests** | Colocated with component | `InboxCard.svelte.test.ts` | Module-specific, team-owned |
| **Composable Tests** | Colocated with composable | `useInboxItems.svelte.test.ts` | Module-specific, team-owned |
| **Module Integration** | Module `__tests__/` folder | `inbox/__tests__/inbox.integration.test.ts` | Module-specific, team-owned |
| **Cross-Module Integration** | `tests/convex/integration/` | `tags.integration.test.ts` | Shared infrastructure |
| **E2E Tests** | `e2e/` folder | `inbox-workflow.spec.ts` | User flows span modules |
| **Infrastructure Tests** | `tests/convex/` or `tests/` | `sessionValidation.test.ts` | Shared infrastructure |
| **Convex Unit Tests** | Colocated with source | `convex/tags.test.ts` | Convex convention |

---

## Vitest Configuration

### ✅ Current Setup (Implemented)

```typescript
// vite.config.ts
test: {
  projects: [
    {
      name: 'client',
      include: [
        'src/**/*.svelte.{test,spec}.{js,ts}',  // ✅ Colocated component tests
        'tests/**/*.svelte.{test,spec}.{js,ts}'  // ✅ Legacy centralized tests
      ],
    },
    {
      name: 'server',
      include: [
        'src/**/*.{test,spec}.{js,ts}',         // ✅ Colocated composable tests
        'src/**/__tests__/**/*.{test,spec}.{js,ts}', // ✅ Module test suites
        'tests/**/*.{test,spec}.{js,ts}',        // ✅ Centralized tests
        'convex/**/*.test.ts'                     // ✅ Convex unit tests
      ],
    }
  ]
}
```

**Note**: Vitest automatically discovers tests matching these patterns. No manual configuration needed per module.

**Validation**: ✅ All test patterns verified working - 200+ tests discovered across all patterns.

---

## Migration Status

### ✅ Phase 1: Module-Specific Tests (Complete)

**Status**: ✅ **Complete** - Module-specific tests are now colocated with modules.

**Examples of Colocated Tests**:

- ✅ `src/lib/modules/core/organizations/__tests__/organizations.integration.test.ts`
- ✅ `src/lib/modules/meetings/__tests__/meetings.integration.test.ts`
- ✅ `src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts`
- ✅ `src/lib/modules/flashcards/__tests__/flashcards.integration.test.ts`
- ✅ `src/lib/modules/org-chart/__tests__/circles.integration.test.ts`

**Pattern**: All module integration tests are in `src/lib/modules/{module}/__tests__/` folders.

### ✅ Phase 2: Update Vitest Config (Complete)

**Status**: ✅ **Complete** - Vitest config updated to discover colocated tests.

**Validation**: All test patterns verified working - 200+ tests discovered across all patterns.

### ✅ Phase 3: Documentation & Training (Complete)

**Status**: ✅ **Complete** - Documentation updated with new structure and examples.

**Updated Documents**:
- ✅ `test-organization-strategy.md` (this document)
- ✅ `testing-workflow.md` (colocated test patterns added)
- ✅ Module READMEs (testing sections added)

---

## Benefits

### ✅ Team Ownership

- **Clear Boundaries**: Each team owns `src/lib/modules/{module}/` + tests
- **Independent Development**: Teams can work without conflicts
- **Ownership Clarity**: Tests next to code = obvious ownership

### ✅ Discoverability

- **Co-location**: Change code → see tests immediately
- **Module Structure**: Tests follow module organization
- **Easier Onboarding**: New developers find tests faster

### ✅ Maintainability

- **Shared Infrastructure**: Cross-module tests centralized
- **Test Helpers**: Shared utilities in `tests/composables/test-utils/`
- **CI/CD**: Still runs all tests together

### ✅ Scalability

- **Module Growth**: New modules = new test folders (no central folder bloat)
- **Team Scaling**: Each team owns their test suite
- **Test Organization**: Clear separation of concerns

---

## Examples

### Module Component Test (Colocated)

```typescript
// src/lib/modules/inbox/components/InboxCard.svelte.test.ts
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import InboxCard from './InboxCard.svelte';

describe('InboxCard', () => {
  it('should render inbox item', () => {
    const { container } = render(InboxCard, {
      item: { _id: '123', type: 'note', title: 'Test' }
    });
    expect(container.textContent).toContain('Test');
  });
});
```

### Module Composable Test (Colocated)

```typescript
// src/lib/modules/inbox/composables/useInboxItems.svelte.test.ts
import { describe, it, expect } from 'vitest';
import { useInboxItems } from './useInboxItems.svelte';

describe('useInboxItems', () => {
  it('should filter items by type', () => {
    // Test implementation
  });
});
```

### Module Integration Test (Module `__tests__/`) ✅ Real Example

```typescript
// src/lib/modules/core/organizations/__tests__/organizations.integration.test.ts
import { describe, it, expect, afterEach } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '../../../../../../convex/_generated/api';
import schema from '../../../../../../convex/schema';
import { modules } from '../../../../../../tests/convex/integration/test.setup';
import {
  createTestSession,
  createTestOrganization,
  createTestOrganizationMember,
  cleanupTestData,
  cleanupTestOrganization
} from '../../../../../../tests/convex/integration/setup';

describe('Organizations Integration Tests', () => {
  const cleanupQueue: Array<{ userId?: any; orgId?: any }> = [];

  afterEach(async () => {
    const t = convexTest(schema, modules);
    for (const item of cleanupQueue) {
      if (item.userId) {
        await cleanupTestData(t, item.userId);
      }
      if (item.orgId) {
        await cleanupTestOrganization(t, item.orgId);
      }
    }
    cleanupQueue.length = 0;
  });

  it('should list user organizations with sessionId validation', async () => {
    const t = convexTest(schema, modules);
    const { sessionId, userId } = await createTestSession(t);
    const orgId = await createTestOrganization(t, 'Test Org');
    await createTestOrganizationMember(t, orgId, userId, 'owner');
    cleanupQueue.push({ userId, orgId });

    const orgs = await t.query(api.organizations.listOrganizations, { sessionId });

    expect(orgs).toBeDefined();
    expect(Array.isArray(orgs)).toBe(true);
    expect(orgs.length).toBe(1);
    expect(orgs[0].name).toBe('Test Org');
    expect(orgs[0].role).toBe('owner');
  });
});
```

**Key Pattern**: Import paths use relative paths from module location (`../../../../../../convex/_generated/api`).

### Cross-Module Integration Test (Centralized)

```typescript
// tests/convex/integration/tags.integration.test.ts
import { describe, it, expect } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '../../../convex/_generated/api';
import { createTestSession } from './setup';

describe('Tags Integration (Cross-Module)', () => {
  it('should create tag and link to inbox item', async () => {
    // Tests tags + inbox interaction
  });
});
```

---

## FAQ

### Q: Why not colocate ALL tests?

**A**: Cross-module tests need shared infrastructure (test helpers, fixtures, setup). Centralizing them:
- Reduces duplication
- Makes shared utilities easier to find
- Enables consistent test patterns

### Q: What about E2E tests?

**A**: E2E tests stay centralized because:
- They test **user flows** that span multiple modules
- They need shared fixtures (auth, test data)
- They're run together in CI/CD

### Q: Can teams run their own test suite?

**A**: Yes! Teams can run module-specific tests:

```bash
# Run all tests for a specific module (component, composable, and integration tests)
npm run test:unit:server -- src/lib/modules/meetings

# Run only module integration tests
npm run test:integration -- src/lib/modules/core/organizations/__tests__/organizations.integration.test.ts

# Run all tests matching a pattern (useful for watch mode)
npm run test:unit:server -- src/lib/modules --watch

# Run specific test file
npm run test:unit:server -- src/lib/modules/meetings/__tests__/meetings.integration.test.ts
```

**Example Output**:
```
✓ src/lib/modules/meetings/__tests__/meetings.integration.test.ts (5 tests)
✓ src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts (3 tests)
✓ src/lib/modules/meetings/__tests__/meetingDecisions.integration.test.ts (2 tests)
```

**Benefits**:
- ✅ Fast feedback - Only run tests for your module
- ✅ Clear ownership - Tests colocated with code
- ✅ Independent development - Teams don't block each other

### Q: What about Convex tests?

**A**: Convex unit tests stay colocated with source (`convex/tags.test.ts`) following Convex conventions. Integration tests stay centralized (`tests/convex/integration/`) for shared infrastructure.

### Q: How do we prevent test duplication?

**A**: 
- **Shared Utilities**: `tests/composables/test-utils/` for common helpers
- **Test Helpers**: `tests/convex/integration/setup.ts` for Convex test setup
- **Documentation**: Clear patterns in `dev-docs/testing-strategy.md`

---

## References

- [SYOS-319](https://linear.app/younghumanclub/issue/SYOS-319) - Reorganize Codebase for Team Ownership
- [Testing Strategy](./testing-strategy.md) - Complete testing strategy
- [Testing Workflow](./testing-workflow.md) - Testing workflow and practices
- [Vitest Documentation](https://vitest.dev/guide/projects.html) - Vitest project configuration
- [System Architecture](../architecture/system-architecture.md) - Module system architecture

---

## Decision Record

**Decision**: Hybrid approach - Colocate module-specific tests, centralize cross-module tests.

**Rationale**: 
- Enables team ownership (colocated tests)
- Maintains shared infrastructure (centralized tests)
- Follows industry best practices (Vitest, React Testing Library patterns)

**Alternatives Considered**:
1. **Fully Centralized**: ❌ Doesn't enable team ownership
2. **Fully Colocated**: ❌ Duplicates shared infrastructure
3. **Hybrid**: ✅ Best of both worlds

**Status**: ✅ **Implementation Complete** - Migration finished, tests colocated, Vitest config updated.

**Migration Completed**: 2025-11-20  
**Related Tickets**: 
- [SYOS-343](https://linear.app/younghumanclub/issue/SYOS-343) - Implement Test Organization Strategy
- [SYOS-349](https://linear.app/younghumanclub/issue/SYOS-349) - Update Vitest Config (Complete)
- [SYOS-350](https://linear.app/younghumanclub/issue/SYOS-350) - Update Documentation (Complete)

---

**Last Updated**: 2025-11-20  
**Next Review**: As needed when new modules are added

