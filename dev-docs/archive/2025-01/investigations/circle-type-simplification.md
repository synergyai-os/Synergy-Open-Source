# Circle Type Simplification Impact Analysis

**Created:** 2026-01-06  
**Ticket:** SYOS-1067  
**Status:** Complete  
**Author:** AI Agent (Opus 4.5)

## Executive Summary

The proposed change from 4 `circleType` values to 3 `leadAuthority` values affects **45+ files** across the codebase. The change is conceptually simpler (user-focused mental model) but touches schema, role templates, authority calculation, invariants, and frontend components. Given **pre-production status**, a clean migration (delete/recreate) is feasible. **Estimated effort: 3-4 days** for a senior developer. **Recommendation: Proceed with simplification** — the simpler model better matches user needs and removes the confusing `hybrid` type entirely.

---

## Migration Complexity by Area

| Area | Files Affected | Complexity | Effort |
|------|----------------|------------|--------|
| Schema | 3 files | moderate | 2h |
| Role Templates | 3 files | moderate | 3h |
| Circle CRUD | 4 files | moderate | 2h |
| Authority Calculation | 4 files | significant | 4h |
| Governance Invariants | 4 files | moderate | 2h |
| Proposals/Governance | 1 file | trivial | 0.5h |
| Frontend Constants | 1 file | moderate | 1h |
| Frontend Components | 8 files | moderate | 3h |
| Onboarding Flow | 2 files | trivial | 0.5h |
| Documentation | 5 files | moderate | 2h |
| Tests | 3 files | moderate | 2h |
| Seed/Migration | 2 files | moderate | 2h |
| **Total** | **~45 files** | | **~24h (3-4 days)** |

---

## Proposed Model Mapping

```typescript
// Current (4 types)
circleType: 'hierarchy' | 'empowered_team' | 'guild' | 'hybrid'

// Proposed (3 values)
leadAuthority: 'decides' | 'facilitates' | 'convenes'
```

| User Mental Model | leadAuthority | Old circleType |
|-------------------|---------------|----------------|
| "Manager runs this team" | `decides` | hierarchy |
| "Team decides together" | `facilitates` | empowered_team |
| "Community of practice" | `convenes` | guild |

**Note:** `hybrid` is removed entirely — consent process is meeting facilitation, not system config.

---

## Detailed Findings

### 1. Schema Impact

#### 1.1 `convex/core/circles/tables.ts` (Lines 30-37)

Current `circleType` field definition:

```typescript
circleType: v.optional(
  v.union(
    v.literal('hierarchy'),
    v.literal('empowered_team'),
    v.literal('guild'),
    v.literal('hybrid')
  )
)
```

**Required Change:**
- Rename field `circleType` → `leadAuthority`
- Change values from 4 to 3: `'decides' | 'facilitates' | 'convenes'`
- Update default value logic (currently defaults to `hierarchy`)

**Complexity:** Moderate — straightforward schema change

#### 1.2 `convex/core/circles/constants.ts` (Lines 28-36)

Current constants:

```typescript
export const CIRCLE_TYPES = {
  HIERARCHY: 'hierarchy',
  EMPOWERED_TEAM: 'empowered_team',
  GUILD: 'guild',
  HYBRID: 'hybrid'
} as const;
```

**Required Change:**
- Rename to `LEAD_AUTHORITY` or similar
- Change to 3 values: `{ DECIDES: 'decides', FACILITATES: 'facilitates', CONVENES: 'convenes' }`
- Update type guard `isCircleType()` → `isLeadAuthority()`

**Complexity:** Moderate — find/replace with semantic changes

#### 1.3 `convex/core/roles/tables.ts` (Lines 13-18)

Current `appliesTo` field:

```typescript
appliesTo: v.union(
  v.literal('hierarchy'),
  v.literal('empowered_team'),
  v.literal('guild'),
  v.literal('hybrid')
)
```

**Required Change:**
- Same value changes: 4 → 3 values
- Field might stay `appliesTo` (good generic name)

**Complexity:** Moderate

#### 1.4 Indexes

No indexes directly reference `circleType`. The field is stored and queried via filters, not indexed.

**Impact:** None — no index changes required

#### 1.5 Schema Migration Requirements

**Pre-production advantage:** Can delete all data and recreate, or run a simple data migration:

```typescript
// Migration mapping
'hierarchy' → 'decides'
'empowered_team' → 'facilitates'
'guild' → 'convenes'
'hybrid' → 'decides'  // Or 'facilitates' — design decision needed
```

---

### 2. Role Templates System

#### 2.1 `convex/admin/seed/roleTemplates.ts` (Lines 42-157)

Currently **10 templates** across 4 circle types:

| Template | Current `appliesTo` | Count |
|----------|---------------------|-------|
| Circle Lead (hierarchy) | hierarchy | 1 |
| Circle Lead (empowered_team) | empowered_team | 1 |
| Circle Lead (hybrid) | hybrid | 1 |
| Steward | guild | 1 |
| Facilitator (empowered_team) | empowered_team | 1 |
| Facilitator (hybrid) | hybrid | 1 |
| Secretary (hierarchy) | hierarchy | 1 |
| Secretary (empowered_team) | empowered_team | 1 |
| Secretary (guild) | guild | 1 |
| Secretary (hybrid) | hybrid | 1 |

**Proposed consolidation → 7 templates:**

| Template | New `appliesTo` |
|----------|-----------------|
| Circle Lead | decides |
| Team Lead | facilitates |
| Steward | convenes |
| Facilitator | facilitates |
| Secretary (decides) | decides |
| Secretary (facilitates) | facilitates |
| Secretary (convenes) | convenes |

**Complexity:** Moderate — template consolidation requires careful mapping

#### 2.2 `convex/core/circles/autoCreateRoles.ts` (Full file)

**Key functions affected:**
- `getSystemTemplateByRoleType()` (Line 29-60) — queries templates by `appliesTo`
- `getAllSystemTemplatesForCircleType()` (Line 70-96) — queries templates by `appliesTo`
- `createCoreRolesForCircle()` (Line 123-207) — uses circleType parameter
- `transformLeadRoleOnCircleTypeChange()` (Line 229-313) — handles type changes

**Line-by-line impact:**

| Function | Lines | Change Required |
|----------|-------|-----------------|
| `getSystemTemplateByRoleType` | 29-60 | Rename parameter, update filter |
| `getAllSystemTemplatesForCircleType` | 70-96 | Rename function, update filter |
| `createCoreRolesForCircle` | 123-207 | Rename parameter, update default |
| `transformLeadRoleOnCircleTypeChange` | 229-313 | Significant — simplify guild ↔ non-guild logic |

**Key logic change:**
- Current: Checks `isToGuild || isFromGuild` for lead role transformation
- Proposed: Checks `isToConvenes || isFromConvenes` — simpler

**Complexity:** Moderate — mostly renames with simplified transformation logic

#### 2.3 `convex/core/roles/templates/mutations.ts`

Template update mutations reference `appliesTo` field.

**Impact:** Update value references when templates change

---

### 3. Circle CRUD Operations

#### 3.1 `convex/core/circles/mutations.ts` (Lines 15-43, 58-86)

Current create mutation args:

```typescript
circleType: v.optional(
  v.union(
    v.literal(CIRCLE_TYPES.HIERARCHY),
    v.literal(CIRCLE_TYPES.EMPOWERED_TEAM),
    v.literal(CIRCLE_TYPES.GUILD),
    v.literal(CIRCLE_TYPES.HYBRID)
  )
)
```

**Required Change:**
- Rename arg `circleType` → `leadAuthority`
- Update union to 3 values
- Update updateInline mutation similarly

**Complexity:** Trivial — straightforward arg changes

#### 3.2 `convex/core/circles/circleLifecycle.ts` (Full file)

**Key functions:**
- `createCircleInternal()` (Lines 17-114) — sets default circleType
- `updateInlineCircle()` (Lines 191-300) — handles circleType changes

**Line-by-line impact:**

| Line | Current | Required Change |
|------|---------|-----------------|
| 25 | `circleType?: CircleType` | `leadAuthority?: LeadAuthority` |
| 80 | `const circleType = args.circleType ?? CIRCLE_TYPES.HIERARCHY` | Update constant |
| 90 | `circleType,` | Rename field |
| 103 | `await createCoreRolesForCircle(..., circleType)` | Rename parameter |
| 199 | `circleType?: CircleType` | `leadAuthority?: LeadAuthority` |
| 256-286 | Circle type change handling | Update field name, simplify logic |

**Complexity:** Moderate — systematic renames

#### 3.3 `convex/core/circles/rules.ts`

Circle validation rules. Minimal circleType usage.

**Complexity:** Trivial

#### 3.4 `convex/core/circles/queries.ts`

Returns circleType in query results.

**Complexity:** Trivial — field rename in return types

---

### 4. Authority Calculation

#### 4.1 `convex/core/authority/calculator.ts` (Full file)

**Core function:**

```typescript
export function calculateAuthorityLevel(circleType: CircleType | null | undefined): AuthorityLevel {
  const mapping: Record<CircleType, AuthorityLevel> = {
    [CIRCLE_TYPES.HIERARCHY]: 'authority',
    [CIRCLE_TYPES.EMPOWERED_TEAM]: 'facilitative',
    [CIRCLE_TYPES.GUILD]: 'convening',
    [CIRCLE_TYPES.HYBRID]: 'authority'
  };
  return mapping[effectiveType];
}
```

**Key insight:** Current `AuthorityLevel` type already maps well!

| Current AuthorityLevel | Proposed leadAuthority |
|------------------------|------------------------|
| `'authority'` | `'decides'` |
| `'facilitative'` | `'facilitates'` |
| `'convening'` | `'convenes'` |

**This is the key simplification:** `leadAuthority` IS the authority level, no calculation needed!

**Required Change:**
- `calculateAuthorityLevel()` becomes trivial (or removed)
- Parameter `circleType` → `leadAuthority`
- Remove mapping logic — value is already the answer

**Complexity:** Significant conceptually, trivial implementation

#### 4.2 `convex/core/authority/policies.ts` (Full file)

Current policy lookup:

```typescript
export const circlePolicies: Record<CircleType, CirclePolicy> = {
  [CIRCLE_TYPES.HIERARCHY]: { ... canLeadApproveUnilaterally: true ... },
  [CIRCLE_TYPES.EMPOWERED_TEAM]: { ... decisionModel: 'consent' ... },
  [CIRCLE_TYPES.GUILD]: { ... decisionModel: 'consensus' ... },
  [CIRCLE_TYPES.HYBRID]: { ... canLeadApproveUnilaterally: false ... }
};
```

**Required Change:**
- Update key from 4 CircleTypes to 3 LeadAuthority values
- Consolidate `hierarchy` and `hybrid` → `decides`
- `empowered_team` → `facilitates`
- `guild` → `convenes`

**Complexity:** Moderate — policy consolidation

#### 4.3 `convex/core/authority/types.ts` (Lines 21-25, 51-57)

**Types affected:**

```typescript
export interface AuthorityContext {
  circleType: CircleType;  // → leadAuthority: LeadAuthority
  ...
}

export type AuthorityLevel = 'authority' | 'facilitative' | 'convening';
// Consider: Align with leadAuthority values for consistency
```

**Complexity:** Trivial — type renames

#### 4.4 `convex/core/authority/context.ts`

Builds AuthorityContext from database.

**Complexity:** Trivial — field rename

---

### 5. Governance Invariants

#### 5.1 `convex/admin/invariants/INVARIANTS.md` (Lines referencing circleType)

**Affected invariants:**

| ID | Current | Proposed |
|----|---------|----------|
| GOV-08 | "Circle type is explicit, never null for active circles" | "Lead authority is explicit..." |
| ORG-06 | "Circle circleType is valid enum value" | "Circle leadAuthority is valid enum value" |
| ORG-10 | "Root circle type must not be 'guild'" | "Root circle leadAuthority must not be 'convenes'" |

**Complexity:** Moderate — semantic updates throughout

#### 5.2 `convex/admin/invariants/organization.ts` (Lines 5-11, 171-194)

**Current validation:**

```typescript
const VALID_CIRCLE_TYPES = new Set([
  CIRCLE_TYPES.HIERARCHY,
  CIRCLE_TYPES.EMPOWERED_TEAM,
  CIRCLE_TYPES.GUILD,
  CIRCLE_TYPES.HYBRID
]);
```

**Required Change:**
- Rename to `VALID_LEAD_AUTHORITY`
- Update to 3 values
- Update `checkORG06()` function
- Update `checkORG10()` — check for `'convenes'` instead of `'guild'`

**Complexity:** Moderate

#### 5.3 `convex/admin/invariants/authority.ts`

References circleType in authority checks.

**Complexity:** Trivial — field references

#### 5.4 `convex/admin/invariants/governance.ts`

GOV-08 check for circleType.

**Complexity:** Trivial — field rename

---

### 6. Proposals & Governance Flows

#### 6.1 `convex/core/proposals/mutations.ts`

Minimal direct circleType usage. Proposal approval logic uses authority calculation, not circleType directly.

**Impact:** Indirect — changes flow through authority calculation

**Complexity:** Trivial

#### 6.2 Meeting facilitation

The `hybrid` type's consent process is actually meeting facilitation behavior, not circle configuration. Removing `hybrid` simplifies this — consent process is a meeting feature, not a circle type.

**Complexity:** None — conceptually cleaner

---

### 7. Frontend Impact

#### 7.1 `src/lib/infrastructure/organizational-model/constants.ts` (Full file)

**Major changes required:**

| Current | Proposed |
|---------|----------|
| `CIRCLE_TYPES` | `LEAD_AUTHORITY` |
| `DEFAULT_CIRCLE_TYPE_LABELS` | `DEFAULT_LEAD_AUTHORITY_LABELS` |
| `DEFAULT_CIRCLE_TYPE_DESCRIPTIONS` | `DEFAULT_LEAD_AUTHORITY_DESCRIPTIONS` |
| `CIRCLE_TYPE_LEAD_AUTHORITY` | Remove (no longer needed) |
| `getLeadAuthorityLevel()` | Simplify to identity function |

**Lines affected:** ~80 lines of constants and helpers

**Complexity:** Moderate — significant but mechanical changes

#### 7.2 Frontend Components (8 files)

| File | Impact |
|------|--------|
| `src/lib/modules/org-chart/components/CircleTypeSelector.svelte` | Full rewrite — simplify to 3 options |
| `src/lib/modules/org-chart/components/CircleTypeBadge.svelte` | Update labels and values |
| `src/lib/modules/org-chart/components/DecisionModelSelector.svelte` | May be removed or simplified |
| `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` | Field name changes |
| `src/lib/modules/org-chart/components/CircleTitleBadges.svelte` | Badge display updates |
| `src/lib/modules/org-chart/components/AddCircleDialog.svelte` | Form field changes |
| `src/lib/modules/org-chart/components/circleDetailEditHandlers.ts` | Handler updates |
| `src/lib/modules/org-chart/components/CircleDetailContext.svelte.ts` | Context type updates |

**Complexity:** Moderate — ~8 components need updates

#### 7.3 Composables

`src/lib/infrastructure/organizational-model/composables/useCircles.svelte.ts` — type updates

**Complexity:** Trivial

---

### 8. Workspace Setup & Onboarding

#### 8.1 Onboarding Flow

`src/routes/(authenticated)/onboarding/circle/+page.svelte` (Lines 56, 67, 76, 100, 164-175)

**Current behavior:**
- Prevents `guild` selection for root circle
- Defaults to `hierarchy`

**Required Changes:**
- Prevent `convenes` selection for root circle
- Default to `decides`
- Update UI labels (3 options instead of 4)

**Complexity:** Trivial

#### 8.2 Default Circle Type

Current: `CIRCLE_TYPES.HIERARCHY`
Proposed: `LEAD_AUTHORITY.DECIDES`

**Impact:** ~5 locations where default is set

---

### 9. Documentation Impact

| Document | Changes Required |
|----------|------------------|
| `dev-docs/master-docs/architecture.md` | Update Governance Foundation section (~20 references) |
| `dev-docs/master-docs/architecture/governance-design.md` | Complete rewrite of §5 Circle Types |
| `dev-docs/master-docs/architecture/circle-types.md` | Delete or archive (already marked SUPERSEDED) |
| `convex/admin/invariants/INVARIANTS.md` | Update GOV-08, ORG-06, ORG-10 |
| `convex/core/circles/README.md` | Update circle creation documentation |

**Complexity:** Moderate — documentation is extensive but straightforward

---

### 10. Test Impact

#### 10.1 Unit Tests

| File | Tests Affected |
|------|----------------|
| `convex/core/authority/authority.test.ts` | 9 test cases with hardcoded circleType values |
| `convex/core/authority/calculator.test.ts` | Authority calculation tests |
| `convex/core/roles/roles.test.ts` | Role template tests |

**Required Changes:**
- Update test fixtures from 4 types to 3
- Update expected values in authority assertions
- Add/remove test cases for removed `hybrid` type

**Complexity:** Moderate — ~20 test cases to update

#### 10.2 Integration Tests

Various integration tests in `tests/convex/` may reference circleType.

**Complexity:** Moderate

---

### 11. Migration Considerations

#### 11.1 Pre-Production Status

**Advantage:** No production data to migrate. Options:

1. **Clean migration:** Delete all circles/roles, update schema, recreate
2. **Data migration:** Transform existing values (`hierarchy` → `decides`, etc.)

**Recommendation:** Clean migration — simpler and ensures fresh start

#### 11.2 Data Transformation Mapping

```typescript
const MIGRATION_MAP = {
  'hierarchy': 'decides',
  'empowered_team': 'facilitates',
  'guild': 'convenes',
  'hybrid': 'decides'  // Design decision: hybrid → decides
};
```

**Design decision needed:** What happens to `hybrid` circles?
- Option A: Map to `decides` (full authority)
- Option B: Map to `facilitates` (consent process)
- **Recommendation:** `decides` — hybrid was "full authority + consent process"

#### 11.3 Template Consolidation Strategy

**Current: 10 templates**
**Proposed: 7 templates**

Consolidation:
- `Circle Lead (hierarchy)` + `Circle Lead (hybrid)` → `Circle Lead (decides)`
- `Facilitator (empowered_team)` + `Facilitator (hybrid)` → `Facilitator (facilitates)`
- `Secretary` templates: 4 → 3 (remove hybrid-specific)

#### 11.4 Breaking API Changes

| Endpoint | Breaking Change |
|----------|-----------------|
| `circles.create` | `circleType` arg renamed to `leadAuthority` |
| `circles.updateInline` | `circleType` in updates renamed |
| All circle queries | Response field renamed |

**Mitigation:** Pre-production, so no backwards compatibility needed

---

## Risks & Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Large changeset** | ~45 files, higher merge conflict risk | Do in single focused sprint, feature flag if needed |
| **Test coverage gaps** | May miss edge cases | Run full test suite, add integration tests |
| **Documentation drift** | Docs may reference old terms | Comprehensive doc sweep in same PR |
| **Mental model shift** | Team needs to learn new terminology | Clear communication, update dev guides |
| **Loss of hybrid flexibility** | Some users may want per-decision configuration | Can add back as meeting-level feature if needed |

---

## Benefits

| Benefit | Description |
|---------|-------------|
| **Simpler mental model** | "How does the lead decide?" vs "What governance philosophy?" |
| **Fewer options** | 3 choices easier than 4 for users |
| **Clearer terminology** | `leadAuthority: 'decides'` is self-documenting |
| **Reduced code complexity** | Authority calculation simplifies dramatically |
| **Template consolidation** | 10 → 7 templates (30% reduction) |
| **Removed ambiguity** | `hybrid` type was confusing — what does it mean? |

---

## Recommendation

**Go: Proceed with simplification**

### Rationale:

1. **Pre-production window** — Now is the ideal time to make breaking changes
2. **User-centric model** — The question "How does the lead decide?" matches user mental models
3. **Technical simplification** — Authority calculation becomes trivial
4. **Removes confusion** — `hybrid` was poorly understood
5. **Manageable scope** — 3-4 days of focused work

### Suggested Implementation Order:

1. **Day 1:** Schema + constants (backend + frontend)
2. **Day 2:** Authority calculation + policies + invariants
3. **Day 3:** Role templates + auto-creation logic
4. **Day 4:** Frontend components + tests + documentation

### Prerequisites:

- [ ] Decision on `hybrid` → `decides` vs `facilitates` mapping
- [ ] Decision on keeping `decisionModel` field (orthogonal concern?)
- [ ] Review with product stakeholder for terminology approval

---

## Questions for Human Review

1. **Hybrid mapping:** Should `hybrid` map to `decides` or `facilitates`?
2. **decisionModel field:** Is this still needed? It seems redundant with the simplified model.
3. **Terminology:** Is `leadAuthority` the right field name? Alternatives: `governanceMode`, `decisionStyle`
4. **Timeline:** Is 3-4 days acceptable, or should this be broken into smaller tickets?

---

**Ready for human review.** Reply with go/no-go decision and answers to questions above.

