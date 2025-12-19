# Patterns & Lessons

Running log of patterns discovered and lessons learned during development.

---

## 2025-12-19 — Stacked Navigation Cross-Module Reuse (SYOS-1022)

### Pattern: Reusing Module Panels in Different Contexts

**Problem**: Activation page needed to open circle/role edit panels without duplicating UI code or navigating away from the current page.

**Solution**: Initialize the module's composable (`useOrgChart`) in the new context and reuse existing panel components:

```svelte
<!-- ✅ CORRECT: Reuse existing panels with their composable -->
<script lang="ts">
  import { useOrgChart } from '$lib/modules/org-chart/composables/useOrgChart.svelte';
  import CircleDetailPanel from '$lib/modules/org-chart/components/CircleDetailPanel.svelte';
  import RoleDetailPanel from '$lib/modules/org-chart/components/RoleDetailPanel.svelte';
  
  // Initialize composable (provides required context)
  const orgChart = browser
    ? useOrgChart({
        sessionId: () => data.sessionId,
        workspaceId: () => data.workspaceId
      })
    : null;
    
  // Open panels via composable methods
  function handleFixIssue(issue) {
    if (issue.circleId) {
      orgChart.selectCircle(issue.circleId);
    } else if (issue.roleId) {
      orgChart.selectRole(issue.roleId);
    }
  }
</script>

<!-- Panels render automatically when selection changes -->
{#if orgChart}
  <CircleDetailPanel {orgChart} />
  <RoleDetailPanel {orgChart} />
{/if}
```

**Benefits**:
- ✅ Consistent UI/UX across contexts (same edit experience)
- ✅ No code duplication
- ✅ Automatic features (edit protection, breadcrumbs, mobile support)
- ✅ URL sync works (shareable deep links)

**Trade-offs**:
- Adds dependency on module composable
- Loads full panel features (may be heavier than needed)

**When to create standalone panels instead**:
- Need simplified behavior (fewer features)
- Performance critical (minimize bundle size)
- Significantly different UX requirements

**Architecture Reference**: See `stacked-navigation.md` Pattern 2 (consuming navigation) and Pattern 3 (checking visibility).

---

## 2025-12-19 — Convex Schema-Query Validator Sync

### Lesson: Query Return Validators Must Match Schema Validators

**Problem**: Added `circleId` and `roleId` to `ActivationIssueValidator` schema, but query threw validation error:
```
ReturnsValidationError: Object contains extra field `circleId` that is not in the validator.
```

**Root Cause**: Updated schema validator but forgot to update query's `returns` validator.

**Fix Pattern**:
```typescript
// ✅ Step 1: Update schema validator
export const ActivationIssueValidator = v.object({
  // ... existing fields
  circleId: v.optional(v.string()),
  roleId: v.optional(v.string())
});

// ✅ Step 2: Update query's returns validator (DON'T FORGET!)
export const getActivationIssues = query({
  args: { /* ... */ },
  returns: v.array(v.object({
    // ... existing fields (must match schema)
    circleId: v.optional(v.string()),
    roleId: v.optional(v.string())
  })),
  handler: async (ctx, args) => { /* ... */ }
});
```

**Prevention Checklist**:
- [ ] Update schema validator (`SomethingValidator`)
- [ ] Update corresponding TypeScript type (`Something`)
- [ ] Update query `returns` validator (if query returns this type)
- [ ] Update mutation `args` validator (if mutation accepts this type)

**Why This Happens**: Convex validates query return values at runtime to ensure frontend receives correct shape. Schema validator alone doesn't enforce query returns.

---

## 2025-12-19 — Structured Action Data Over URLs (Backend Logic Principle)

### Pattern: Return Structured Data, Not Presentation Layer Concerns

**Problem**: Backend was returning `actionUrl: '/w/slug/chart'` for fixing issues. This mixes presentation logic (URL structure) into business logic.

**Before** (❌ Backend controls frontend navigation):
```typescript
// Backend
return {
  actionType: 'edit_role',
  actionUrl: `/w/${workspaceSlug}/chart`  // ❌ Backend knows URL structure
};

// Frontend
<Button href={issue.actionUrl}>Fix</Button>  // ❌ Direct navigation
```

**After** (✅ Backend provides semantic data):
```typescript
// Backend
return {
  actionType: 'edit_role',
  circleId: circle._id,      // ✅ Semantic data
  roleId: role._id,          // ✅ Semantic data
  actionUrl: '/w/.../chart'  // Kept for backward compatibility
};

// Frontend
function handleFix(issue) {
  if (issue.roleId) {
    orgChart.selectRole(issue.roleId);  // ✅ Frontend controls presentation
  }
}
```

**Principle**: Backend provides **what** needs to happen (semantic actions). Frontend decides **how** to present it (navigation strategy).

**Benefits**:
- Backend doesn't need to know about stacked panels vs page navigation
- Easier to change presentation layer without backend changes
- More testable (can test action logic without URL structure)

**Architecture Reference**: Principle #10 (business logic in Convex) + Principle #12 (thin components).

---

## 2025-12-19 — DB-Driven Custom Field Rendering (SYOS-1049)

### Pattern: Iterate Over DB-Driven Field Definitions (Frontend Complement to convex-integration.md#L540)

**Problem**: Hardcoded field names and category mappings in Svelte templates prevent:
- Admin-added custom fields from appearing automatically
- Display name customization per workspace
- Proper ordering from database

**Example of broken code**:
```svelte
<!-- ❌ BROKEN: Hardcoded field names -->
<h4>Domains</h4>
<CategoryItemsList
  categoryName="Domains"
  items={ctx.getItemsForCategory('Domains')}
/>

<h4>Accountabilities</h4>
<CategoryItemsList
  categoryName="Accountabilities"
  items={ctx.getItemsForCategory('Accountabilities')}
/>
```

**Fix**: Iterate over `customFields.fields` from the composable:
```svelte
<!-- ✅ CORRECT: DB-driven field rendering -->
{#each customFields.fields as field (field.definition._id)}
  <CustomFieldSection
    {field}
    {canEdit}
    {editReason}
    onSave={(value) => customFields.setFieldValue(field.definition._id, value)}
    onDelete={() => customFields.deleteFieldValue(field.definition._id)}
  />
{/each}
```

**Key Components**:
1. **Shared Composable** (`$lib/composables/useCustomFields.svelte.ts`):
   - 2 queries: definitions + values
   - Returns `fields` array ordered by `definition.order`
   - Provides `setFieldValue` and `deleteFieldValue` mutations

2. **Reusable Molecule** (`CustomFieldSection.svelte`):
   - Auto-renders based on `field.definition.fieldType`
   - Uses `field.definition.name` for display (admin-configurable)
   - Handles single values (text, longText) and lists (textList)

**Benefits**:
- New fields appear automatically when admin adds them
- Display names are workspace-configurable
- Ordering controlled by database
- Only 2 queries regardless of field count

**Architecture Reference**: This is the frontend complement to "Database-Driven Configuration" (convex-integration.md#L540).

---

## 2025-12-07 — Foundation hardening (SYOS-706)
- Favor functional factories over classes (Principle #11). Example: `logger` built via `createLogger()` to preserve API while staying class-free.
- Use typed error factories plus type guards instead of subclasses. Example: `createWorkOSError` + `isWorkOSError` keeps status codes and names without relying on `instanceof`.
- Remove localhost fallbacks for app URLs (Principle #20). Require `PUBLIC_APP_URL` and surface a clear error; build invite links via a helper (`getPublicAppUrl`) rather than `|| 'http://localhost:5173'`.
- Enforce Convex layering scaffolds: keep `convex/features/` and `convex/infrastructure/` directories present even if empty, to guide dependency flow (Principle #5).

