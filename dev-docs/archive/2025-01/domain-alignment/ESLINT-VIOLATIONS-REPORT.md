# ESLint Violations Report: no-hardcoded-circle-constants

**Generated**: After migrating high-priority files  
**Rule**: `synergyos/no-hardcoded-circle-constants`  
**Status**: Active and catching violations ✅

## Summary

**Total violations found**: ~100+ across backend and frontend

### High Priority Files (Already Migrated ✅)
- ✅ `convex/core/authority/policies.ts` - Migrated
- ✅ `convex/core/authority/calculator.ts` - Migrated  
- ✅ `convex/core/circles/circleLifecycle.ts` - Migrated
- ✅ `convex/core/circles/circleCoreRoles.ts` - Migrated

## Remaining Violations by File

### Backend (convex/)

#### 1. `convex/admin/invariants/authority.ts`
- **Line 240**: Hardcoded `'hierarchy'`
- **Fix**: Import `CIRCLE_TYPES` from `../../core/circles`

#### 2. `convex/admin/invariants/organization.ts`
- **Line 4**: Multiple violations in union type
  - `'hierarchy'`, `'empowered_team'`, `'guild'`, `'hybrid'`
- **Fix**: Replace union type with `type CircleType` from `../../core/circles`

#### 3. `convex/admin/orgStructureImport.ts`
- **Line 237**: Hardcoded `'hierarchy'`
- **Line 238**: Hardcoded `'manager_decides'`
- **Line 252**: Hardcoded `'hierarchy'`
- **Fix**: Import `CIRCLE_TYPES, DECISION_MODELS` from `../core/circles`

#### 4. `convex/admin/seed/bootstrap.ts`
- **Line 66**: Hardcoded `'hierarchy'`
- **Fix**: Import `CIRCLE_TYPES` from `../core/circles`

#### 5. `convex/admin/seed/index.ts`
- **Line 54**: Hardcoded `'hierarchy'`
- **Fix**: Import `CIRCLE_TYPES` from `./core/circles`

#### 6. `convex/admin/seed/roleTemplates.ts` ⚠️ **Many violations**
- **Line 28**: Union type with all 4 circle types
- **Lines 44, 54, 67, 79, 91, 104, 116, 129, 141, 153**: Hardcoded `appliesTo` values
- **Fix**: 
  - Replace union type with `type CircleType`
  - Replace all `appliesTo: 'hierarchy'` with `appliesTo: CIRCLE_TYPES.HIERARCHY`
  - Same for other types

#### 7. `convex/core/circles/queries.ts` ⚠️ **Many violations**
- **Lines 21, 25, 29, 33**: Hardcoded circle types in array
- **Lines 47, 51, 55, 59**: Hardcoded circle types in comparisons
- **Lines 69, 73, 77, 81**: Hardcoded circle types in comparisons
- **Lines 91, 95, 99, 103**: Hardcoded circle types in comparisons
- **Lines 113, 123**: Hardcoded circle types in union types
- **Fix**: Import `CIRCLE_TYPES` and replace all hardcoded values

#### 8. `convex/core/history/schema.ts` ⚠️ **Many violations**
- **Lines 29-32**: Hardcoded circle types in array
- **Lines 42-45**: Hardcoded decision models in array
- **Lines 94-97**: Hardcoded circle types in union type
- **Lines 102-105**: Hardcoded decision models in union type
- **Lines 137-140**: Hardcoded circle types in union type
- **Lines 145-148**: Hardcoded decision models in union type
- **Fix**: Import `CIRCLE_TYPES, DECISION_MODELS` and replace union types

#### 9. `convex/core/roles/tables.ts` ⚠️ **Many violations**
- **Line 28**: Union type with all 4 circle types
- **Lines 44, 54, 67, 79, 91, 104, 116, 129, 141, 153**: Hardcoded `appliesTo` values
- **Fix**: Similar to `roleTemplates.ts`

#### 10. `convex/core/roles/templates/mutations.ts` ⚠️ **Many violations**
- **Lines 11, 45**: Hardcoded values
- **Lines 262**: Hardcoded `'empowered_team'`
- **Fix**: Import `CIRCLE_TYPES` and replace

#### 11. `convex/infrastructure/rbac/orgChart.ts`
- **Lines 21, 25, 29, 33**: Hardcoded circle types
- **Lines 47, 51, 55, 59**: Hardcoded circle types
- **Fix**: Import `CIRCLE_TYPES` from `../../core/circles`

### Frontend (src/)

#### 12. `src/routes/(authenticated)/onboarding/circle/+page.svelte`
- **Lines 29-32**: Hardcoded circle types in array
- **Lines 42-45**: Hardcoded decision models
- **Fix**: Import from `$lib/infrastructure/organizational-model/constants`

#### 13. `src/lib/modules/org-chart/components/DecisionModelSelector.svelte`
- **Lines 24, 29, 33, 35**: Hardcoded decision models
- **Lines 44, 46, 48, 50**: Hardcoded circle types in comparisons
- **Fix**: Import constants from frontend constants file

#### 14. `src/lib/modules/org-chart/components/CircleTypeSelector.svelte`
- **Lines 21, 25, 29, 33**: Hardcoded circle types
- **Fix**: Import constants

#### 15. `src/lib/infrastructure/organizational-model/composables/useCircles.svelte.ts`
- **Line 17**: Union type with hardcoded decision models
- **Fix**: Import `type DecisionModel` from constants

## Migration Pattern

### Backend Pattern
```typescript
// Before
import type { CircleType } from '../circles';
const type: CircleType = 'hierarchy';
const appliesTo: 'hierarchy' | 'empowered_team' | 'guild' | 'hybrid' = 'hierarchy';

// After
import { CIRCLE_TYPES, type CircleType } from '../circles';
const type: CircleType = CIRCLE_TYPES.HIERARCHY;
const appliesTo: CircleType = CIRCLE_TYPES.HIERARCHY;
```

### Frontend Pattern
```typescript
// Before
const CIRCLE_TYPES = [
  { value: 'hierarchy' as const, ... },
  { value: 'empowered_team' as const, ... }
];

// After
import { CIRCLE_TYPES as BACKEND_CIRCLE_TYPES } from '$lib/infrastructure/organizational-model/constants';
const CIRCLE_TYPES = [
  { value: BACKEND_CIRCLE_TYPES.HIERARCHY, ... },
  { value: BACKEND_CIRCLE_TYPES.EMPOWERED_TEAM, ... }
];
```

## Next Steps

1. **Medium Priority**: Migrate `queries.ts`, `history/schema.ts`, `roles/tables.ts`
2. **Low Priority**: Migrate admin/seed files
3. **Frontend**: Migrate UI components to use frontend constants (which should match backend)

## Notes

- Schema literals in `tables.ts` are **exempt** (required by Convex)
- Test files are **included** in enforcement (strict approach)
- Documentation files (`.md`, `.mdx`) are **exempt**

