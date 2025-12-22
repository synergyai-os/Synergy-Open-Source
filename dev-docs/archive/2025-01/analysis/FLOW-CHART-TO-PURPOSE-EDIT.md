# Flow: Chart Page → Editing Purpose Field

This document traces the complete flow from the org chart page to editing the first "Purpose" field shown in the detail panel.

## Overview Flow

```
+page.svelte (Chart Route)
  ↓
OrgChart Component (D3 Visualization)
  ↓ [User clicks circle]
useOrgChart.selectCircle()
  ↓
CircleDetailPanel (Always rendered, conditionally shown)
  ↓
TabbedPanel → Overview Tab (default)
  ↓
CircleOverviewTab
  ↓
CustomFieldSection (for Purpose field)
  ↓ [User clicks Purpose]
Edit Mode → Input Field
  ↓ [User saves]
useCustomFields.setFieldValue()
  ↓
Convex Mutation → Database
```

## Detailed Step-by-Step Flow

### 1. **Page Load** (`src/routes/(authenticated)/w/[slug]/chart/+page.svelte`)

**Lines 57-63**: Initializes the org chart composable:

```typescript
const orgChart =
	browser && getSessionId() && getWorkspaceId()
		? orgChartAPI.useOrgChart({
				sessionId: getSessionId,
				workspaceId: getWorkspaceId
			})
		: null;
```

**Lines 112-114**: Always renders `CircleDetailPanel` (conditionally shown based on selection):

```svelte
{#if browser && orgChart}
	<CircleDetailPanel {orgChart} />
	<RoleDetailPanel {orgChart} />
{/if}
```

**Key Point**: The detail panel is always in the DOM but only visible when `orgChart.selectedCircleId !== null`.

---

### 2. **User Clicks Circle** (`src/lib/modules/org-chart/components/OrgChart.svelte`)

**Lines 209-233**: `handleCircleClick` function:

```typescript
function handleCircleClick(event: MouseEvent, node: CircleHierarchyNode) {
	event.stopPropagation();

	// Check if this circle is already active
	const isActive = zoom.focusNode?.data.circleId === node.data.circleId;

	if (isActive) {
		// Click on active circle → open modal
		orgChart.selectCircle(node.data.circleId);
	} else {
		// Click on non-active circle → make it active and zoom to it
		if (node.depth === 0) {
			zoom.zoomToRoot();
		} else {
			zoom.zoomToNode(node);
		}
	}
}
```

**Line 391**: Circle click handler attached:

```svelte
<g onclick={(e) => handleCircleClick(e, node)}>
```

**Flow**: Click → `orgChart.selectCircle(circleId)` → Sets `selectedCircleId` → Triggers panel visibility

---

### 3. **Circle Selection** (`src/lib/modules/org-chart/composables/useOrgChart.svelte.ts`)

**Lines 547-563**: `selectCircle` method:

```typescript
selectCircle: (circleId: Id<'circles'> | null, options?: { skipStackPush?: boolean }) => {
	state.selectedCircleId = circleId;

	// Update navigation stack
	if (circleId && !options?.skipStackPush) {
		const circle = circlesQuery?.data?.find((c) => c.circleId === circleId);
		const circleName = circle?.name || 'Unknown';

		navigationStack.push({
			type: 'circle',
			id: circleId,
			name: circleName
		});
	}
};
```

**Reactive State**: `selectedCircleId` change triggers reactivity in `CircleDetailPanel`.

---

### 4. **CircleDetailPanel Opens** (`src/lib/modules/org-chart/components/CircleDetailPanel.svelte`)

**Lines 40-43**: Reactive derived state:

```typescript
const circle = $derived(orgChart?.selectedCircle ?? null),
	isOpen = $derived((orgChart?.selectedCircleId ?? null) !== null),
	isLoading = $derived(orgChart?.selectedCircleIsLoading ?? false),
	error = $derived(orgChart?.selectedCircleError ?? null);
```

**Lines 87-92**: Initializes `useCustomFields` composable:

```typescript
const customFields = useCustomFields({
	sessionId: () => sessionId,
	workspaceId: () => workspaceId(),
	entityType: () => 'circle',
	entityId: () => circle?.circleId ?? null
});
```

**Lines 161-172**: Sets context for tab components:

```typescript
setContext<CircleDetailContext>(CIRCLE_DETAIL_KEY, {
	circle: () => circle,
	customFields,
	editCircle,
	canEdit: () => canEdit
	// ... other context values
});
```

**Lines 213-227**: Renders `TabbedPanel` with default "overview" tab:

```svelte
<TabbedPanel tabs={CIRCLE_TABS} bind:activeTab {tabCounts}>
	{#snippet content(tabId)}
		<CircleTabContent
			{tabId}
			{childCircles}
			{coreRoles}
			{regularRoles}
			{membersWithoutRoles}
			onRoleClick={handleRoleClick}
			onChildCircleClick={handleChildCircleClick}
			onQuickUpdateRole={handleQuickUpdateRole}
			onOpenAssignUserDialog={openAssignUserDialog}
		/>
	{/snippet}
</TabbedPanel>
```

---

### 5. **CircleTabContent Routes to Overview Tab** (`src/lib/modules/org-chart/components/CircleTabContent.svelte`)

**Lines 38-48**: Routes based on `tabId`:

```svelte
{#if tabId === 'overview'}
	<CircleOverviewTab
		{childCircles}
		{coreRoles}
		{regularRoles}
		{membersWithoutRoles}
		{onRoleClick}
		{onChildCircleClick}
		{onQuickUpdateRole}
		{onOpenAssignUserDialog}
	/>
{/if}
```

---

### 6. **CircleOverviewTab Renders Custom Fields** (`src/lib/modules/org-chart/components/tabs/CircleOverviewTab.svelte`)

**Lines 59-68**: Gets context and customFields:

```typescript
const ctx = getContext<CircleDetailContext>(CIRCLE_DETAIL_KEY);
const circle = $derived(ctx.circle());
const canEdit = $derived(ctx.canEdit());
const { customFields } = ctx;
```

**Lines 78-86**: Iterates over custom fields (DB-driven, ordered by `definition.order`):

```svelte
<div class="gap-section flex min-w-0 flex-col overflow-hidden">
	{#each customFields.fields as field (field.definition._id)}
		<CustomFieldSection
			{field}
			{canEdit}
			{editReason}
			onSave={(value) => customFields.setFieldValue(field.definition._id, value)}
			onDelete={() => customFields.deleteFieldValue(field.definition._id)}
		/>
	{/each}
</div>
```

**Key Point**: The "Purpose" field is the first field because it's ordered first in the database (`definition.order`).

---

### 7. **CustomFieldSection Renders Purpose** (`src/lib/components/molecules/CustomFieldSection.svelte`)

**Lines 35-45**: Determines field type and values:

```typescript
const isTextList = $derived(field.definition.fieldType === 'textList');
const isLongText = $derived(field.definition.fieldType === 'longText');

const singleValue = $derived<string>(
	!isTextList && typeof field.parsedValue === 'string' ? field.parsedValue : ''
);
const isEmpty = $derived(isTextList ? listItems.length === 0 : !singleValue);
```

**Purpose is a single-value field** (`fieldType: 'text'` or `'longText'`), so it uses the single-value rendering path.

**Lines 420-443**: Renders clickable Purpose field (when not editing):

```svelte
{:else if canEdit}
  <div
    class="hover:bg-surface-hover rounded-button px-button py-button cursor-text transition-colors"
    onclick={() => (isEditingSingle = true)}
    role="button"
    tabindex="0"
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        isEditingSingle = true;
      }
    }}
    title="Click to edit"
  >
    {#if singleValue}
      <Text variant="body" size="md" color="default">
        {singleValue}
      </Text>
    {:else}
      <Text variant="body" size="md" color="tertiary">
        {effectivePlaceholder}
      </Text>
    {/if}
  </div>
```

**User Action**: Clicking the Purpose text → Sets `isEditingSingle = true`

---

### 8. **Edit Mode Activated** (`src/lib/components/molecules/CustomFieldSection.svelte`)

**Lines 63-66**: Edit state variables:

```typescript
let isEditingSingle = $state(false);
let editSingleValue = $state('');
let isSaving = $state(false);
let singleInputRef: HTMLInputElement | HTMLTextAreaElement | null = $state(null);
```

**Lines 77-81**: Syncs edit value when entering edit mode:

```typescript
$effect(() => {
	if (!isEditingSingle) {
		editSingleValue = singleValue;
	}
});
```

**Lines 84-91**: Auto-focuses input when editing:

```typescript
$effect(() => {
	if (isEditingSingle && browser && singleInputRef) {
		singleInputRef.focus();
		if (!isLongText && singleInputRef instanceof HTMLInputElement) {
			singleInputRef.select();
		}
	}
});
```

**Lines 391-419**: Renders input/textarea in edit mode:

```svelte
{#if isEditingSingle && canEdit}
  <div class="relative">
    {#if isLongText}
      <textarea
        bind:this={singleInputRef}
        bind:value={editSingleValue}
        placeholder={effectivePlaceholder}
        rows={4}
        onkeydown={handleSingleKeydown}
        onblur={handleSingleBlur}
        disabled={isSaving}
        class={textareaClasses}
      ></textarea>
    {:else}
      <input
        bind:this={singleInputRef}
        type="text"
        bind:value={editSingleValue}
        placeholder={effectivePlaceholder}
        onkeydown={handleSingleKeydown}
        onblur={handleSingleBlur}
        disabled={isSaving}
        class={inputClasses}
      />
    {/if}
    {#if isSaving}
      <div class="text-secondary absolute top-2 right-2 text-xs">Saving...</div>
    {/if}
  </div>
```

---

### 9. **User Saves Changes** (`src/lib/components/molecules/CustomFieldSection.svelte`)

**Lines 109-127**: `handleSingleSave` function:

```typescript
async function handleSingleSave() {
	if (editSingleValue.trim() === singleValue.trim() || isSaving) {
		isEditingSingle = false;
		return;
	}
	try {
		isSaving = true;
		if (!editSingleValue.trim()) {
			await onDelete();
		} else {
			await onSave(editSingleValue.trim());
		}
		isEditingSingle = false;
	} catch {
		// Keep editing mode open on error
	} finally {
		isSaving = false;
	}
}
```

**Triggered by**:

- **Enter key** (line 135-137): `handleSingleKeydown` → `handleSingleSave()`
- **Blur event** (line 144-148): `handleSingleBlur` → `handleSingleSave()` after 200ms delay

**Line 83**: `onSave` prop is `customFields.setFieldValue(field.definition._id, value)`

---

### 10. **CustomFields Composable Saves** (`src/lib/composables/useCustomFields.svelte.ts`)

**Lines 230-247**: `setFieldValue` mutation:

```typescript
async function setFieldValue(
	definitionId: Id<'customFieldDefinitions'>,
	value: unknown
): Promise<void> {
	invariant(convexClient, 'Convex client not available');
	const sessionId = getSessionId();
	const entityType = getEntityType();
	const entityId = getEntityId();
	invariant(sessionId && entityType && entityId, 'sessionId, entityType, and entityId required');

	await convexClient.mutation(api.features.customFields.mutations.setValue, {
		sessionId,
		definitionId,
		entityType: entityType as CustomFieldEntityType,
		entityId,
		value
	});
}
```

**Convex Mutation**: `api.features.customFields.mutations.setValue`

- **Parameters**: `sessionId`, `definitionId`, `entityType: 'circle'`, `entityId`, `value`

---

### 11. **Backend Updates Database** (Convex)

The mutation updates the `customFieldValues` table in Convex, which triggers reactive queries to refresh.

**Lines 134-152**: `valuesQuery` automatically refetches:

```typescript
const valuesQuery = $derived(
	browser && getSessionId() && getEntityType() && getEntityId()
		? useQuery(api.features.customFields.queries.listValues, () => {
				// ... query params
			})
		: null
);
```

**Lines 155-217**: `fields` derived value recomputes with new data:

```typescript
const fields = $derived.by(() => {
	const definitions = definitionsQuery?.data ?? [];
	const values = valuesQuery?.data ?? [];
	// ... combines definitions with values
});
```

**Result**: `CustomFieldSection` receives updated `field.parsedValue` → UI updates automatically.

---

## Key Architecture Patterns

### 1. **Reactive State Management**

- Uses Svelte 5 runes (`$state`, `$derived`, `$effect`)
- `orgChart.selectedCircleId` drives panel visibility
- `customFields.fields` reactively updates when database changes

### 2. **Context Pattern**

- `CircleDetailContext` provides shared state to tab components
- Avoids prop drilling through multiple component layers

### 3. **Composable Pattern**

- `useCustomFields` encapsulates field management logic
- `useOrgChart` manages chart state and navigation
- Reusable across different entity types (circles, roles, etc.)

### 4. **Database-Driven UI**

- Custom fields are defined in database (`customFieldDefinitions`)
- UI iterates over fields dynamically (no hardcoded fields)
- Order controlled by `definition.order` field

### 5. **Quick Edit Pattern**

- Single-value fields (like Purpose) support inline editing
- Click to edit → Input appears → Save on blur/Enter
- No need to enter full edit mode for simple text changes

---

## File References

| Component          | File Path                                                            | Key Responsibility                             |
| ------------------ | -------------------------------------------------------------------- | ---------------------------------------------- |
| Chart Page         | `src/routes/(authenticated)/w/[slug]/chart/+page.svelte`             | Route entry point, renders OrgChart and panels |
| OrgChart           | `src/lib/modules/org-chart/components/OrgChart.svelte`               | D3 visualization, handles circle clicks        |
| useOrgChart        | `src/lib/modules/org-chart/composables/useOrgChart.svelte.ts`        | Chart state management, selection logic        |
| CircleDetailPanel  | `src/lib/modules/org-chart/components/CircleDetailPanel.svelte`      | Main detail panel container                    |
| CircleTabContent   | `src/lib/modules/org-chart/components/CircleTabContent.svelte`       | Routes to appropriate tab component            |
| CircleOverviewTab  | `src/lib/modules/org-chart/components/tabs/CircleOverviewTab.svelte` | Overview tab, renders custom fields            |
| CustomFieldSection | `src/lib/components/molecules/CustomFieldSection.svelte`             | Renders and edits individual custom fields     |
| useCustomFields    | `src/lib/composables/useCustomFields.svelte.ts`                      | Custom field queries and mutations             |

---

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  +page.svelte (Chart Route)                                 │
│  - Initializes orgChart composable                          │
│  - Renders OrgChart + CircleDetailPanel (always in DOM)    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  OrgChart.svelte                                             │
│  - D3 visualization                                          │
│  - handleCircleClick() → orgChart.selectCircle()            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  useOrgChart.selectCircle()                                   │
│  - Sets state.selectedCircleId                                │
│  - Pushes to navigationStack                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  CircleDetailPanel.svelte                                    │
│  - Reactive: isOpen = selectedCircleId !== null              │
│  - Initializes useCustomFields()                             │
│  - Sets CircleDetailContext                                   │
│  - Renders TabbedPanel → Overview tab                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  CircleTabContent.svelte                                     │
│  - Routes tabId='overview' → CircleOverviewTab               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  CircleOverviewTab.svelte                                    │
│  - Gets customFields from context                            │
│  - Iterates: {#each customFields.fields as field}           │
│  - Renders CustomFieldSection for each                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  CustomFieldSection.svelte                                   │
│  - Renders Purpose field (single value)                     │
│  - Click → isEditingSingle = true                           │
│  - Shows input/textarea                                      │
│  - Save → onSave(value) → customFields.setFieldValue()      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  useCustomFields.setFieldValue()                             │
│  - Calls Convex mutation                                     │
│  - api.features.customFields.mutations.setValue             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Convex Backend                                              │
│  - Updates customFieldValues table                           │
│  - Triggers reactive query refresh                           │
│  - UI updates automatically                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

The flow demonstrates a clean separation of concerns:

1. **Visualization** (OrgChart) handles user interaction
2. **State Management** (useOrgChart) manages selection state
3. **UI Components** (CircleDetailPanel, tabs) render data reactively
4. **Data Layer** (useCustomFields) handles database operations
5. **Backend** (Convex) persists changes and triggers reactive updates

The entire flow is reactive - changes propagate automatically through Svelte's reactivity system, ensuring the UI stays in sync with the database.
