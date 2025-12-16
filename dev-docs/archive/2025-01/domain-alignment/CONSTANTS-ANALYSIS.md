# Constants Usage Analysis & Protection Strategy

## 1. Hardcoded Value Counts

### Backend (convex/)

- **Circle Types**: ~120 matches across 26 files
- **Decision Models**: ~41 matches across 9 files

**Breakdown by file type:**

- `tables.ts`: Schema literals (required by Convex, runtime-checked)
- `policies.ts`: Record keys using hardcoded values
- `circleLifecycle.ts`: Default values, comparisons
- `circleCoreRoles.ts`: Switch statements, comparisons
- `queries.ts`: Type definitions, filters
- Test files: Test data, assertions

### Frontend (src/)

- **Circle Types**: ~53 matches across 7 files
- Most in UI components (selectors, badges, forms)

**Note**: These counts include:

- ✅ Legitimate uses (schema literals, Record keys)
- ❌ Should be migrated (comparisons, defaults, type definitions)

## 2. Cross-Domain Usage Pattern

### Current Pattern (Good!)

Other domains import **types** from circles:

```typescript
// ✅ CORRECT: Import type
import type { CircleType } from '../circles';
```

### Problem: Still Using Hardcoded Values

```typescript
// ❌ WRONG: Hardcoded values in Record keys
export const circlePolicies: Record<CircleType, CirclePolicy> = {
  hierarchy: { ... },        // Should use CIRCLE_TYPES.HIERARCHY
  empowered_team: { ... },   // Should use CIRCLE_TYPES.EMPOWERED_TEAM
  guild: { ... },             // Should use CIRCLE_TYPES.GUILD
  hybrid: { ... }            // Should use CIRCLE_TYPES.HYBRID
};
```

### Solution: Import Constants Too

```typescript
// ✅ CORRECT: Import both type and constants
import { CIRCLE_TYPES, type CircleType } from '../circles';

export const circlePolicies: Record<CircleType, CirclePolicy> = {
  [CIRCLE_TYPES.HIERARCHY]: { ... },
  [CIRCLE_TYPES.EMPOWERED_TEAM]: { ... },
  [CIRCLE_TYPES.GUILD]: { ... },
  [CIRCLE_TYPES.HYBRID]: { ... }
};
```

### Architecture Rule

**When other domains need circle constants:**

1. Import from `convex/core/circles` (via `index.ts` exports)
2. Import both TYPE and CONSTANTS: `import { CIRCLE_TYPES, type CircleType } from '../circles'`
3. Use computed property names `[CIRCLE_TYPES.HIERARCHY]` for Record keys
4. Use constants for comparisons, defaults, switch cases

**Example domains using circle types:**

- `convex/core/authority/` - Policies, calculator
- `convex/core/roles/` - Lead role detection
- `convex/core/history/` - History schema
- `convex/infrastructure/rbac/` - Permission checks

## 3. ESLint Protection Strategy

### Option A: Custom ESLint Rule (Recommended)

Create `eslint-rules/no-hardcoded-circle-constants.js` similar to `no-hardcoded-design-values.js`.

**What to block:**

- String literals: `'hierarchy'`, `'empowered_team'`, `'guild'`, `'hybrid'`
- String literals: `'manager_decides'`, `'team_consensus'`, `'consent'`, `'coordination_only'`
- Inline union types: `'hierarchy' | 'empowered_team' | ...`

**What to allow:**

- Schema literals in `tables.ts` (required by Convex)
- Record keys using computed properties: `[CIRCLE_TYPES.HIERARCHY]`
- Import statements
- Documentation files (`.md`, `.mdx`)

**Implementation approach:**

```javascript
// Check for hardcoded circle type/decision model strings
const CIRCLE_TYPE_VALUES = ['hierarchy', 'empowered_team', 'guild', 'hybrid'];
const DECISION_MODEL_VALUES = ['manager_decides', 'team_consensus', 'consent', 'coordination_only'];

// In Literal node handler:
if (typeof node.value === 'string') {
	if (CIRCLE_TYPE_VALUES.includes(node.value) || DECISION_MODEL_VALUES.includes(node.value)) {
		// Check if parent is schema literal (tables.ts) - allow
		// Check if parent is computed property [value] - allow
		// Otherwise - block
	}
}
```

### Option B: TypeScript Type-Only Enforcement

**Limitation**: TypeScript can't enforce runtime constants, only types.

**What we can do:**

- Use `satisfies` operator to ensure Record keys match constants
- Use type-only imports to prevent accidental hardcoded values

```typescript
import { CIRCLE_TYPES, type CircleType } from '../circles';

// TypeScript ensures all keys exist
const policies = {
  [CIRCLE_TYPES.HIERARCHY]: { ... },
  [CIRCLE_TYPES.EMPOWERED_TEAM]: { ... },
  // Missing CIRCLE_TYPES.GUILD? TypeScript error!
} satisfies Record<CircleType, CirclePolicy>;
```

### Option C: Runtime Validation (Already Implemented)

We already have runtime check in `tables.ts`:

```typescript
const _schemaCheck = {
  circleTypes: Object.values(CIRCLE_TYPES) as [...],
  decisionModels: Object.values(DECISION_MODELS) as [...]
};
```

This catches schema mismatches at startup.

### Recommended Approach: Hybrid

1. **ESLint rule** for development-time protection (catches 90% of cases)
2. **TypeScript `satisfies`** for Record completeness (catches missing keys)
3. **Runtime check** for schema validation (catches schema mismatches)

## Migration Priority

### High Priority (Type Safety)

1. `convex/core/authority/policies.ts` - Record keys
2. `convex/core/authority/calculator.ts` - Record keys, comparisons
3. `convex/core/circles/circleLifecycle.ts` - Defaults, comparisons
4. `convex/core/circles/circleCoreRoles.ts` - Switch statements

### Medium Priority (Maintainability)

5. `convex/core/circles/queries.ts` - Type definitions
6. `convex/admin/seed/roleTemplates.ts` - Template definitions
7. Frontend components - UI selectors, badges

### Low Priority (Documentation)

8. Test files - **Should use constants** (if constant changes, tests auto-update, better coverage)
9. Documentation files - Markdown examples (can keep hardcoded)

## Next Steps

1. ✅ Create constants.ts (DONE)
2. ⏳ Create ESLint rule `no-hardcoded-circle-constants`
3. ⏳ Migrate high-priority files to use constants
4. ⏳ Update architecture.md with cross-domain import pattern
5. ⏳ Add ESLint rule to CI pipeline
