# Patterns & Lessons

Running log of patterns discovered and lessons learned during development.

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

