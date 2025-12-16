# Circle Type & Decision Model Constants Migration

## Problem Statement

**You were RIGHT** - we had hardcoded string literals scattered across 100+ files with no single source of truth. This created:

1. **Type Safety Risk**: Multiple type definitions that could drift apart
2. **Maintenance Burden**: Adding/modifying values required updates in many places
3. **Runtime Errors**: Easy to miss a file, causing silent failures

## Solution: Single Source of Truth

### Backend (Convex) - `convex/core/circles/constants.ts`

**NEW FILE**: Single source of truth for backend code.

```typescript
export const CIRCLE_TYPES = {
  HIERARCHY: 'hierarchy',
  EMPOWERED_TEAM: 'empowered_team',
  GUILD: 'guild',
  HYBRID: 'hybrid'
} as const;

export type CircleType = (typeof CIRCLE_TYPES)[keyof typeof CIRCLE_TYPES];

export const DECISION_MODELS = {
  MANAGER_DECIDES: 'manager_decides',
  TEAM_CONSENSUS: 'team_consensus',
  CONSENT: 'consent',
  COORDINATION_ONLY: 'coordination_only'
} as const;

export type DecisionModel = (typeof DECISION_MODELS)[keyof typeof DECISION_MODELS];
```

### Usage Pattern

**✅ CORRECT**: Use constants and types from constants.ts

```typescript
import { CIRCLE_TYPES, type CircleType } from './constants';

const circleType: CircleType = CIRCLE_TYPES.HIERARCHY;
```

**❌ WRONG**: Hardcoded strings

```typescript
const circleType: 'hierarchy' | 'empowered_team' | 'guild' | 'hybrid' = 'hierarchy';
```

### Schema Limitation

**Note**: Convex `v.literal()` requires literal values, not constants. So `tables.ts` still has literals, but:

1. Added runtime check to ensure literals match constants
2. Added comment linking to constants.ts
3. All other code uses constants

## Migration Status

### ✅ Completed

- [x] Created `convex/core/circles/constants.ts`
- [x] Updated `convex/core/circles/schema.ts` to re-export types
- [x] Updated `convex/core/circles/index.ts` to export constants
- [x] Updated `convex/core/circles/circleList.ts` to use types
- [x] Added runtime check in `tables.ts` to ensure schema matches constants

### 🔄 Remaining Work

**High Priority** (affects type safety):

1. **Update all backend files** to import from `constants.ts`:
   - `circleLifecycle.ts` - Replace hardcoded types
   - `circleCoreRoles.ts` - Replace hardcoded strings
   - `queries.ts` - Replace hardcoded types
   - `authority/policies.ts` - Replace hardcoded strings
   - Any other files with hardcoded `'hierarchy' | 'empowered_team' | ...`

2. **Update frontend constants** to import types from Convex:
   - `src/lib/infrastructure/organizational-model/constants.ts`
   - Import `CircleType` and `DecisionModel` from Convex (via generated types)
   - Ensure frontend constants match backend constants

**Medium Priority** (improves maintainability):

3. **Replace hardcoded strings** with constants:
   - Search for: `'hierarchy'`, `'empowered_team'`, `'guild'`, `'hybrid'`
   - Search for: `'manager_decides'`, `'team_consensus'`, `'consent'`, `'coordination_only'`
   - Replace with `CIRCLE_TYPES.*` or `DECISION_MODELS.*`

## How to Add/Modify Values

**If you need to add a new circle type or decision model:**

1. **Update constants.ts**:
   ```typescript
   export const CIRCLE_TYPES = {
     // ... existing
     NEW_TYPE: 'new_type'
   } as const;
   ```

2. **Update schema (tables.ts)**:
   ```typescript
   circleType: v.optional(
     v.union(
       // ... existing literals
       v.literal('new_type')
     )
   )
   ```

3. **TypeScript will catch** any mismatches via the runtime check in tables.ts

4. **Update frontend constants** to match

5. **Search codebase** for hardcoded strings and replace with constants

## Benefits

✅ **Type Safety**: Single type definition, TypeScript enforces consistency  
✅ **Maintainability**: Change once, update everywhere  
✅ **Developer Experience**: Autocomplete, refactoring support  
✅ **Runtime Safety**: Runtime check ensures schema matches constants  

## Next Steps

1. Run migration script (or manual search/replace) to update all backend files
2. Update frontend constants to import Convex types
3. Add ESLint rule to prevent hardcoded strings (optional)

