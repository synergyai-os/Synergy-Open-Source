# Compound Components Validation Checklist

**Date**: 2025-01-27  
**Purpose**: Validate all production usage of migrated compound components

---

## 🔍 Production Usage Found

### ✅ Already Fixed

- **ScrollArea** - `meetings/+page.svelte` ✅ (recipes applied)
- **ToggleGroup** - `RecurrenceField.svelte` ✅ (recipes applied)

### ⚠️ Needs Fixing

- **Tabs** - `ActionItemsList.svelte` ❌ (manual classes, no recipes)
- **Tabs** - `admin/feature-flags/+page.svelte` ❌ (manual classes, no recipes)

### ✅ Not Affected (import from bits-ui directly)

- **Tooltip** - `ReadwiseDetail.svelte` (imports from `bits-ui`)
- **ScrollArea** - `WorkspaceSwitcher.svelte` (imports from `bits-ui`)
- **Switch** - `settings/+page.svelte` (imports from `bits-ui`)
- **ToggleGroup, RadioGroup** - `SyncReadwiseConfig.svelte` (imports from `bits-ui`)

---

## 📋 Validation Strategy

### Phase 1: Fix Production Issues (HIGH PRIORITY)

1. ✅ Check `ActionItemsList.svelte` - Apply `tabsListRecipe`, `tabsTriggerRecipe`, `tabsContentRecipe`
2. ✅ Check `admin/feature-flags/+page.svelte` - Apply `tabsListRecipe`, `tabsTriggerRecipe`, `tabsContentRecipe`

### Phase 2: Visual Testing

1. Navigate to `/dashboard` → Check Action Items tabs
2. Navigate to `/admin/feature-flags` → Check Flags/Impact/Debug tabs
3. Navigate to `/meetings` → Check ScrollArea scrolling
4. Navigate to meeting creation → Check ToggleGroup (days of week)

### Phase 3: Storybook Validation (LOW PRIORITY)

- All Storybook stories should work (they're already updated)

---

## 🛠️ How to Fix Tabs Usage

**Current Pattern (WRONG):**

```svelte
<Tabs.List class="mb-content-section size-tab rounded-tab-container border-border-base flex gap-2 border-b">
  <Tabs.Trigger class="py-nav-item text-small text-text-secondary ...">
```

**Correct Pattern:**

```svelte
<script>
  import { Tabs } from '$lib/components/atoms';
  import { tabsListRecipe, tabsTriggerRecipe, tabsContentRecipe } from '$lib/design-system/recipes';
</script>

<Tabs.List class={[tabsListRecipe(), 'mb-content-section']}>
  <Tabs.Trigger value="all" class={[tabsTriggerRecipe({ active: activeFilter === 'all' })]}>
```

---

## ✅ Validation Checklist

- [ ] Fix `ActionItemsList.svelte` Tabs usage
- [ ] Fix `admin/feature-flags/+page.svelte` Tabs usage
- [ ] Test `/dashboard` page visually
- [ ] Test `/admin/feature-flags` page visually
- [ ] Test `/meetings` page (ScrollArea)
- [ ] Test meeting creation (ToggleGroup)

---

## 📝 Notes

- Files importing directly from `bits-ui` are NOT affected (they bypass our atoms)
- Only files importing from `$lib/components/atoms` need recipe application
- Storybook stories are already updated and should work
