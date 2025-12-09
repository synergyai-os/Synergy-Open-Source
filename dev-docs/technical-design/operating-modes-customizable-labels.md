# Operating Modes: Customizable Labels Design

**Created**: 2025-01-27  
**Status**: Design Phase  
**Related**: SYOS-646 (Operating Modes Implementation)

---

## Problem Statement

Operating mode values (`hierarchy`, `empowered_team`, `guild`, `hybrid`, `manager_decides`, etc.) are hardcoded throughout the codebase. While the **values** must remain fixed for type safety and permission logic, the **labels** (display names) should be customizable per workspace to match organizational terminology.

**Example**: A workspace might want to call "Hierarchy" → "Traditional Structure" or "Empowered Team" → "Self-Managing Team".

---

## Design Principles

### ✅ Values Stay Hardcoded
- **Why**: Type safety, permission logic depends on exact values, prevents breaking changes
- **Where**: Schema, backend validation, permission checks
- **Pattern**: Similar to RBAC permission slugs (system-defined)

### ✅ Labels Are Customizable
- **Why**: Better UX, matches organizational terminology, no breaking changes
- **Where**: UI components, display text, descriptions
- **Pattern**: Similar to role templates (user-defined labels)

### ✅ Default Labels Provided
- **Why**: Works out of the box, no configuration required
- **Where**: Constants file, fallback when workspace labels not set

---

## Architecture

### 1. Constants File (System-Defined Values)

**File**: `src/lib/infrastructure/organizational-model/constants.ts`

**Rationale**: Operating modes are part of the core organizational model infrastructure, not a module feature. They're:
- Part of the circle entity (like `name`, `purpose`) - defined in schema
- Used in backend permission logic (`convex/orgChartPermissions.ts`)
- Used in infrastructure types (`CircleSummary` includes `circleType` and `decisionModel`)
- Org-chart module is just one consumer (visualization UI)

**Pattern Match**: Similar to how `CircleSummary` type is in `infrastructure/organizational-model/` - core data types/constants belong in infrastructure, not modules.

```typescript
/**
 * Operating Mode Constants
 * 
 * System-defined values that must remain fixed for type safety and permission logic.
 * Labels are customizable per workspace via workspaceOrgSettings.
 * 
 * Location: Infrastructure layer (core organizational model data)
 * - Used in backend: schema, permissions, mutations
 * - Used in infrastructure: types (CircleSummary)
 * - Used in modules: org-chart visualization UI (one consumer)
 */

export const CIRCLE_TYPES = {
  HIERARCHY: 'hierarchy',
  EMPOWERED_TEAM: 'empowered_team',
  GUILD: 'guild',
  HYBRID: 'hybrid'
} as const;

export const DECISION_MODELS = {
  MANAGER_DECIDES: 'manager_decides',
  TEAM_CONSENSUS: 'team_consensus',
  CONSENT: 'consent',
  COORDINATION_ONLY: 'coordination_only'
} as const;

// Default labels (used when workspace labels not configured)
export const DEFAULT_CIRCLE_TYPE_LABELS = {
  [CIRCLE_TYPES.HIERARCHY]: 'Hierarchy',
  [CIRCLE_TYPES.EMPOWERED_TEAM]: 'Empowered Team',
  [CIRCLE_TYPES.GUILD]: 'Guild',
  [CIRCLE_TYPES.HYBRID]: 'Hybrid'
} as const;

export const DEFAULT_DECISION_MODEL_LABELS = {
  [DECISION_MODELS.MANAGER_DECIDES]: 'Manager Decides',
  [DECISION_MODELS.TEAM_CONSENSUS]: 'Team Consensus',
  [DECISION_MODELS.CONSENT]: 'Consent',
  [DECISION_MODELS.COORDINATION_ONLY]: 'Coordination Only'
} as const;

export const DEFAULT_CIRCLE_TYPE_DESCRIPTIONS = {
  [CIRCLE_TYPES.HIERARCHY]: 'Traditional: manager decides',
  [CIRCLE_TYPES.EMPOWERED_TEAM]: 'Agile: team consensus',
  [CIRCLE_TYPES.GUILD]: 'Coordination only, no authority',
  [CIRCLE_TYPES.HYBRID]: 'Mixed: depends on decision type'
} as const;

export const DEFAULT_DECISION_MODEL_DESCRIPTIONS = {
  [DECISION_MODELS.MANAGER_DECIDES]: 'Single approver (manager/lead)',
  [DECISION_MODELS.TEAM_CONSENSUS]: 'All members must agree',
  [DECISION_MODELS.CONSENT]: 'No valid objections (IDM)',
  [DECISION_MODELS.COORDINATION_ONLY]: 'Guild: must approve in home circle'
} as const;

// Type exports
export type CircleType = typeof CIRCLE_TYPES[keyof typeof CIRCLE_TYPES];
export type DecisionModel = typeof DECISION_MODELS[keyof typeof DECISION_MODELS];
```

**Benefits**:
- Single source of truth for values
- Type-safe constants throughout codebase
- Easy to refactor (change value in one place)
- Default labels available everywhere

---

### 2. Schema Extension

**File**: `convex/schema.ts` (update `workspaceOrgSettings` table)

```typescript
workspaceOrgSettings: defineTable({
  workspaceId: v.id('workspaces'),
  requireCircleLeadRole: v.boolean(),
  coreRoleTemplateIds: v.array(v.id('roleTemplates')),
  allowQuickChanges: v.boolean(),
  
  // NEW: Customizable labels (optional - defaults used if not set)
  circleTypeLabels: v.optional(v.object({
    hierarchy: v.string(),
    empowered_team: v.string(),
    guild: v.string(),
    hybrid: v.string()
  })),
  circleTypeDescriptions: v.optional(v.object({
    hierarchy: v.string(),
    empowered_team: v.string(),
    guild: v.string(),
    hybrid: v.string()
  })),
  decisionModelLabels: v.optional(v.object({
    manager_decides: v.string(),
    team_consensus: v.string(),
    consent: v.string(),
    coordination_only: v.string()
  })),
  decisionModelDescriptions: v.optional(v.object({
    manager_decides: v.string(),
    team_consensus: v.string(),
    consent: v.string(),
    coordination_only: v.string()
  })),
  
  createdAt: v.number(),
  updatedAt: v.number()
}).index('by_workspace', ['workspaceId'])
```

**Migration**: Existing workspaces get `null` → defaults used automatically.

---

### 3. Helper Functions

**File**: `src/lib/infrastructure/organizational-model/utils/labels.ts`

**Rationale**: Label helpers are part of the organizational model infrastructure, used by any module that displays operating modes.

```typescript
import {
  CIRCLE_TYPES,
  DECISION_MODELS,
  DEFAULT_CIRCLE_TYPE_LABELS,
  DEFAULT_DECISION_MODEL_LABELS,
  DEFAULT_CIRCLE_TYPE_DESCRIPTIONS,
  DEFAULT_DECISION_MODEL_DESCRIPTIONS,
  type CircleType,
  type DecisionModel
} from '../constants'; // Same directory (infrastructure/organizational-model/)

export interface WorkspaceLabels {
  circleTypeLabels?: Record<CircleType, string>;
  circleTypeDescriptions?: Record<CircleType, string>;
  decisionModelLabels?: Record<DecisionModel, string>;
  decisionModelDescriptions?: Record<DecisionModel, string>;
}

/**
 * Get label for circle type (workspace custom or default)
 */
export function getCircleTypeLabel(
  circleType: CircleType,
  workspaceLabels?: WorkspaceLabels
): string {
  return workspaceLabels?.circleTypeLabels?.[circleType] 
    ?? DEFAULT_CIRCLE_TYPE_LABELS[circleType];
}

/**
 * Get description for circle type (workspace custom or default)
 */
export function getCircleTypeDescription(
  circleType: CircleType,
  workspaceLabels?: WorkspaceLabels
): string {
  return workspaceLabels?.circleTypeDescriptions?.[circleType]
    ?? DEFAULT_CIRCLE_TYPE_DESCRIPTIONS[circleType];
}

/**
 * Get label for decision model (workspace custom or default)
 */
export function getDecisionModelLabel(
  decisionModel: DecisionModel,
  workspaceLabels?: WorkspaceLabels
): string {
  return workspaceLabels?.decisionModelLabels?.[decisionModel]
    ?? DEFAULT_DECISION_MODEL_LABELS[decisionModel];
}

/**
 * Get description for decision model (workspace custom or default)
 */
export function getDecisionModelDescription(
  decisionModel: DecisionModel,
  workspaceLabels?: WorkspaceLabels
): string {
  return workspaceLabels?.decisionModelDescriptions?.[decisionModel]
    ?? DEFAULT_DECISION_MODEL_DESCRIPTIONS[decisionModel];
}

/**
 * Get all circle type options with labels/descriptions
 */
export function getCircleTypeOptions(workspaceLabels?: WorkspaceLabels) {
  return Object.values(CIRCLE_TYPES).map((value) => ({
    value,
    label: getCircleTypeLabel(value, workspaceLabels),
    description: getCircleTypeDescription(value, workspaceLabels)
  }));
}

/**
 * Get all decision model options with labels/descriptions
 */
export function getDecisionModelOptions(
  circleType: CircleType,
  workspaceLabels?: WorkspaceLabels
) {
  // Filter based on circle type (existing logic)
  const allOptions = Object.values(DECISION_MODELS).map((value) => ({
    value,
    label: getDecisionModelLabel(value, workspaceLabels),
    description: getDecisionModelDescription(value, workspaceLabels)
  }));

  // Apply filtering logic based on circle type
  switch (circleType) {
    case CIRCLE_TYPES.HIERARCHY:
      return allOptions.filter((o) => o.value === DECISION_MODELS.MANAGER_DECIDES);
    case CIRCLE_TYPES.EMPOWERED_TEAM:
    case CIRCLE_TYPES.HYBRID:
      return allOptions.filter((o) => o.value !== DECISION_MODELS.COORDINATION_ONLY);
    case CIRCLE_TYPES.GUILD:
      return allOptions.filter((o) => o.value === DECISION_MODELS.COORDINATION_ONLY);
    default:
      return allOptions;
  }
}
```

---

### 4. Backend Mutations

**File**: `convex/workspaceSettings.ts` (extend existing)

```typescript
export const updateOrgSettings = mutation({
  args: {
    sessionId: v.string(),
    workspaceId: v.id('workspaces'),
    allowQuickChanges: v.optional(v.boolean()),
    requireCircleLeadRole: v.optional(v.boolean()),
    coreRoleTemplateIds: v.optional(v.array(v.id('roleTemplates'))),
    // NEW: Label customization
    circleTypeLabels: v.optional(v.object({
      hierarchy: v.string(),
      empowered_team: v.string(),
      guild: v.string(),
      hybrid: v.string()
    })),
    circleTypeDescriptions: v.optional(v.object({
      hierarchy: v.string(),
      empowered_team: v.string(),
      guild: v.string(),
      hybrid: v.string()
    })),
    decisionModelLabels: v.optional(v.object({
      manager_decides: v.string(),
      team_consensus: v.string(),
      consent: v.string(),
      coordination_only: v.string()
    })),
    decisionModelDescriptions: v.optional(v.object({
      manager_decides: v.string(),
      team_consensus: v.string(),
      consent: v.string(),
      coordination_only: v.string()
    }))
  },
  handler: async (ctx, args) => {
    // ... existing admin check ...
    
    const updateData: any = { updatedAt: Date.now() };
    
    // Add label fields if provided
    if (args.circleTypeLabels !== undefined) updateData.circleTypeLabels = args.circleTypeLabels;
    if (args.circleTypeDescriptions !== undefined) updateData.circleTypeDescriptions = args.circleTypeDescriptions;
    if (args.decisionModelLabels !== undefined) updateData.decisionModelLabels = args.decisionModelLabels;
    if (args.decisionModelDescriptions !== undefined) updateData.decisionModelDescriptions = args.decisionModelDescriptions;
    
    // ... rest of existing logic ...
  }
});
```

---

### 5. UI Settings Page

**File**: `src/routes/(authenticated)/w/[slug]/settings/org-chart/+page.svelte`

Add new section after "Allow Quick Changes":

```svelte
<!-- Custom Labels Section -->
<div class="rounded-card border border-default bg-surface p-card-padding">
  <Heading level={3} class="mb-header">Custom Labels</Heading>
  <Text variant="body" size="sm" color="secondary" class="mb-form">
    Customize display names for operating modes to match your organization's terminology.
    Values remain fixed for system compatibility.
  </Text>
  
  <!-- Circle Type Labels -->
  <div class="mb-form">
    <Heading level={4} class="mb-fieldGroup">Circle Types</Heading>
    {#each circleTypeOptions as option}
      <div class="mb-fieldGroup">
        <FormInput
          label={option.value}
          bind:value={option.customLabel}
          placeholder={option.defaultLabel}
        />
        <FormTextarea
          label="Description"
          bind:value={option.customDescription}
          placeholder={option.defaultDescription}
        />
      </div>
    {/each}
  </div>
  
  <!-- Decision Model Labels -->
  <div class="mb-form">
    <Heading level={4} class="mb-fieldGroup">Decision Models</Heading>
    {#each decisionModelOptions as option}
      <div class="mb-fieldGroup">
        <FormInput
          label={option.value}
          bind:value={option.customLabel}
          placeholder={option.defaultLabel}
        />
        <FormTextarea
          label="Description"
          bind:value={option.customDescription}
          placeholder={option.defaultDescription}
        />
      </div>
    {/each}
  </div>
  
  <Button onclick={handleSaveLabels}>Save Labels</Button>
</div>
```

---

## Migration Strategy

### Phase 1: Add Constants (No Breaking Changes)
1. Create `constants.ts` with system values
2. Update components to use constants (gradual migration)
3. Schema stays the same (no migration needed)

### Phase 2: Add Label Customization
1. Extend schema with optional label fields
2. Add backend mutations/queries
3. Add UI settings page
4. Update components to use label helpers

### Phase 3: Gradual Component Migration
1. Update `CircleTypeSelector` to use label helpers
2. Update `DecisionModelSelector` to use label helpers
3. Update `CircleTypeBadge` to use label helpers
4. Update any other components displaying labels

---

## Benefits

### ✅ Type Safety
- Constants ensure values are always valid
- TypeScript catches invalid values at compile time

### ✅ Scalability
- Single source of truth for values
- Easy to add new operating modes (if needed)
- Consistent patterns across codebase

### ✅ Flexibility
- Workspaces can customize terminology
- No breaking changes (values stay fixed)
- Defaults work out of the box

### ✅ Maintainability
- Clear separation: values vs labels
- Easy to find where values are used
- Centralized label logic

---

## Comparison with Existing Patterns

| Feature | Values | Labels | Pattern Match |
|---------|--------|--------|---------------|
| RBAC Permissions | Hardcoded | Hardcoded | ✅ Same (system-defined) |
| Role Templates | Configurable | Configurable | ❌ Different (user-defined) |
| Circle Types | Hardcoded | **Customizable** | ✅ Hybrid (system values + custom labels) |
| Decision Models | Hardcoded | **Customizable** | ✅ Hybrid (system values + custom labels) |

---

## Implementation Checklist

- [ ] Create `src/lib/infrastructure/organizational-model/constants.ts` ✅ (Location validated: infrastructure layer)
- [ ] Create `src/lib/infrastructure/organizational-model/utils/labels.ts`
- [ ] Update `convex/schema.ts` (add label fields)
- [ ] Update `convex/workspaceSettings.ts` (add label mutations)
- [ ] Update `src/routes/(authenticated)/w/[slug]/settings/org-chart/+page.svelte`
- [ ] Update `CircleTypeSelector.svelte` to use label helpers
- [ ] Update `DecisionModelSelector.svelte` to use label helpers
- [ ] Update `CircleTypeBadge.svelte` to use label helpers
- [ ] Test: Default labels work without configuration
- [ ] Test: Custom labels override defaults
- [ ] Test: Invalid values still rejected (type safety)

---

## Future Considerations

### Potential Enhancements
1. **Validation**: Min/max length for labels, character restrictions
2. **Localization**: Multi-language support (if needed)
3. **Templates**: Pre-defined label sets (e.g., "Holacracy", "SAFe")
4. **History**: Track label changes over time

### Not Included (By Design)
- ❌ Custom values (only labels customizable)
- ❌ Adding/removing operating modes (requires schema changes)
- ❌ Per-circle label overrides (workspace-level only)

---

**Last Updated**: 2025-01-27

