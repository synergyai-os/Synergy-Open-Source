# Investigation Report: Org Chart Detail Panel Refactoring

## 1. Existing Shared Components Inventory

### Command Outputs:

**Atoms Directory:**

- Found 69 files including: `Loading.svelte`, `LoadingOverlay.svelte`, `Button.svelte`, `Icon.svelte`, `Heading.svelte`, `Badge.svelte`, `Text.svelte`, etc.
- **Loading spinner exists**: `src/lib/components/atoms/Loading.svelte` (90 lines)
- **LoadingOverlay exists**: `src/lib/components/atoms/LoadingOverlay.svelte`

**Molecules Directory:**

- Found 55 files including: `PageHeader.svelte`, `InfoCard.svelte`, `ActionMenu.svelte`, `SplitButton.svelte`, etc.
- No dedicated error state component found in molecules

**Organisms Directory:**

- Found 25 files including: `StackedPanel.svelte`, `ErrorBoundary.svelte`, `Dialog.svelte`, `StandardDialog.svelte`, etc.
- **ErrorBoundary exists**: `src/lib/components/organisms/ErrorBoundary.svelte` (206 lines) - but this is for error boundaries, not error state display

**DetailPanel/TabPanel Patterns:**

- **No existing DetailPanel or TabPanel components found** in `src/lib/components/`
- Only found in `src/lib/modules/org-chart/components/` (CircleDetailPanel, RoleDetailPanel)

### StackedPanel.svelte Analysis:

**Location**: `src/lib/components/organisms/StackedPanel.svelte` (215 lines)

**Props Interface:**

```typescript
interface StackedPanelProps {
	isOpen: boolean;
	navigationStack: UseNavigationStack;
	onClose: () => void;
	onBreadcrumbClick: (index: number) => void;
	isTopmost: () => boolean;
	iconRenderer?: (layerType: string) => IconType | null;
	children: Snippet<[PanelContext]>;
}
```

**PanelContext Interface:**

```typescript
export interface PanelContext {
	isMobile: boolean;
	canGoBack: boolean;
	onBack: () => void;
}
```

**Key Features:**

- Handles mobile/desktop responsive behavior
- Manages breadcrumb navigation
- Provides panel context to children
- Handles ESC key and backdrop clicks
- Z-index management based on navigation stack depth

### Answers:

1. **Is there already a shared loading spinner component?**
   - ✅ YES: `src/lib/components/atoms/Loading.svelte`
   - Props: `message?: string`, `size?: 'sm' | 'md' | 'lg'`, `fullHeight?: boolean`
   - Uses SVG spinner with design tokens

2. **Is there already a shared error state component?**
   - ⚠️ PARTIAL: `ErrorBoundary.svelte` exists but is for error boundaries, not error state display
   - ❌ NO dedicated error state component for displaying error messages in panels
   - Pattern observed: Inline error messages like `<p class="text-error">...</p>`

3. **What does StackedPanel.svelte export and expect as props?**
   - See above for full interface
   - Expects `navigationStack` (from `useNavigationStack` composable)
   - Uses children snippet pattern with `PanelContext` parameter
   - Handles all panel-level concerns (backdrop, breadcrumbs, mobile back button)

---

## 2. Composables Pattern Investigation

### Command Outputs:

**Composables List:**

- `useCanEdit.svelte.ts` (63 lines)
- `useCustomFields.svelte.ts` (295 lines)
- `useEditCircle.svelte.ts` (320 lines)
- `useEditRole.svelte.ts` (273 lines)
- `useOrgChart.svelte.ts` (618 lines)
- `useOrgChartUrlSync.svelte.ts`
- `useOrgChartViewport.svelte.ts`
- `useOrgChartZoom.svelte.ts`
- `useProposals.svelte.ts`

### useOrgChart Return Type:

**Return Interface** (from `useOrgChart.svelte.ts`):

```typescript
{
  // Getters (reactive)
  circles: CircleNode[]
  selectedCircle: CircleSummary | null
  selectedCircleError: unknown | null
  selectedCircleIsLoading: boolean
  selectedCircleMembers: CircleMember[]
  selectedCircleMembersWithoutRoles: CircleMember[]
  selectedRole: CircleRoleDetail | null
  selectedRoleError: unknown | null
  selectedRoleIsLoading: boolean
  selectedRoleFillers: RoleFiller[]
  selectedRoleId: Id<'circleRoles'> | null
  selectionSource: 'chart' | 'circle-panel' | null
  zoomLevel: number
  panOffset: { x: number; y: number }
  hoveredCircleId: Id<'circles'> | null
  isLoading: boolean

  // Navigation stack
  navigationStack: UseNavigationStack

  // Methods
  getRolesForCircle: (circleId: Id<'circles'>) => Array<...> | null
  getCoreRolesForCircle: (circleId: Id<'circles'>) => Array<...>
  getRegularRolesForCircle: (circleId: Id<'circles'>) => Array<...>
  isRoleCore: (templateId: Id<'roleTemplates'> | undefined) => boolean
  selectCircle: (circleId: Id<'circles'> | null, options?: { skipStackPush?: boolean }) => void
  openEditCircle: (circleId: Id<'circles'>) => void
  openEditRole: (roleId: Id<'circleRoles'>) => void
  selectRole: (roleId: Id<'circleRoles'> | null, source: 'chart' | 'circle-panel' | null, options?: { skipStackPush?: boolean }) => void
  setZoom: (level: number) => void
  setPan: (offset: { x: number; y: number }) => void
  setHover: (circleId: Id<'circles'> | null) => void
  resetView: () => void
}
```

**Navigation Stack API** (from `useNavigationStack.svelte.ts`):

```typescript
{
  // Getters
  stack: NavigationLayer[]
  currentLayer: NavigationLayer | null
  previousLayer: NavigationLayer | null
  depth: number

  // Actions
  push: (layer: Omit<NavigationLayer, 'zIndex'>) => void
  pop: () => void
  jumpTo: (index: number) => void
  clear: () => void
  getLayer: (index: number) => NavigationLayer | null
}
```

### useEditCircle vs useEditRole Comparison:

**useEditCircle Interface:**

```typescript
interface UseEditCircleReturn {
	isDirty: boolean;
	formValues: CircleEditValues; // { name, purpose, circleType, decisionModel }
	isLoading: boolean;
	isSaving: boolean;
	error: string | null;
	loadCircle: () => Promise<void>;
	setField: <K extends keyof CircleEditValues>(field: K, value: CircleEditValues[K]) => void;
	saveDirectly: () => Promise<void>;
	saveAsProposal: (title: string, description: string) => Promise<Id<'circleProposals'> | null>;
	reset: () => void;
}
```

**useEditRole Interface:**

```typescript
interface UseEditRoleReturn {
	isDirty: boolean;
	formValues: RoleEditValues; // { name, purpose, representsToParent }
	isLoading: boolean;
	isSaving: boolean;
	error: string | null;
	loadRole: () => Promise<void>;
	setField: <K extends keyof RoleEditValues>(field: K, value: RoleEditValues[K]) => void;
	saveDirectly: () => Promise<void>;
	saveAsProposal: (title: string, description: string) => Promise<Id<'circleProposals'> | null>;
	reset: () => void;
}
```

**Similarities:**

- ✅ Identical return structure (isDirty, formValues, isLoading, isSaving, error)
- ✅ Identical method signatures (setField, saveDirectly, saveAsProposal, reset)
- ✅ Same pattern: load function (`loadCircle` vs `loadRole`)

**Differences:**

- ❌ Different form value types (CircleEditValues vs RoleEditValues)
- ❌ Different field names (`circleType`, `decisionModel` vs `representsToParent`)
- ⚠️ `canQuickEdit` is optional in useEditCircle but required in useEditRole

**Unification Potential:**

- ⚠️ **PARTIAL**: Could create generic `useEditEntity<T>` but would need type parameters
- ✅ **YES**: Could extract shared logic into `useEditForm<T>` base composable
- ✅ **YES**: Both use identical save patterns (direct vs proposal)

### useCanEdit Return Type:

**Return Interface** (from `useCanEdit.svelte.ts`):

```typescript
{
  get canEdit(): boolean  // true if design phase OR circle member in active phase
  get isDesignPhase(): boolean  // true if workspace phase === 'design'
  get isLoading(): boolean  // true while workspace query is loading
}
```

**Logic:**

- Design phase: any workspace member can edit
- Active phase: must be circle member to propose/edit

### Answers:

1. **What is the return type/interface of useOrgChart?**
   - See full interface above
   - `navigationStack` is a `UseNavigationStack` instance with reactive getters and action methods

2. **Does useEditCircle and useEditRole have identical interfaces?**
   - ⚠️ **MOSTLY**: Same structure, different form value types
   - ✅ **YES**: Can be unified with generic type parameter or base composable

3. **What does useCanEdit return exactly?**
   - Returns `{ canEdit: boolean, isDesignPhase: boolean, isLoading: boolean }`
   - Reactive getters that check workspace phase and circle membership

---

## 3. Navigation Stack Understanding

### Command Outputs:

**Navigation Stack Implementation:**

- Location: `src/lib/modules/core/composables/useNavigationStack.svelte.ts` (128 lines)
- Used in: `useOrgChart.svelte.ts`, `CircleDetailPanel.svelte`, `RoleDetailPanel.svelte`, `ProposalDetailPanel.svelte`

### Navigation Stack Analysis:

**Type:**

- ✅ **Reactive object** (not a class instance)
- Uses Svelte 5 `$state` for reactivity
- Returns object with getters and methods

**Methods Exposed:**

```typescript
push(layer: Omit<NavigationLayer, 'zIndex'>): void
pop(): void
jumpTo(index: number): void
clear(): void
getLayer(index: number): NavigationLayer | null
```

**State:**

```typescript
{
  stack: NavigationLayer[]
  baseZIndex: 60
  zIndexIncrement: 10
}
```

**NavigationLayer Type:**

```typescript
{
	type: NavigationLayerType; // string (e.g., 'circle', 'role', 'edit-circle')
	id: string;
	name: string;
	zIndex: number; // Auto-calculated: baseZIndex + depth * increment
}
```

### Navigation Logic Duplication:

**In CircleDetailPanel.svelte:**

- Lines 243-460: Navigation logic for handling breadcrumb clicks, ESC key, back button
- Uses: `navigationStack.pop()`, `navigationStack.jumpTo(index)`, `navigationStack.getLayer(index)`

**In RoleDetailPanel.svelte:**

- Lines 243-332: **IDENTICAL** navigation logic
- Same methods: `navigationStack.pop()`, `navigationStack.jumpTo(index)`, `navigationStack.getLayer(index)`

**Observation:**

- ⚠️ **DUPLICATED**: Both panels have identical navigation handling code
- ✅ **CENTRALIZED**: Navigation stack itself is centralized in `useNavigationStack`
- ❌ **NOT CENTRALIZED**: Panel-level navigation handlers are duplicated

### Answers:

1. **Is navigationStack a class instance or reactive object?**
   - ✅ **Reactive object** (Svelte 5 `$state`)

2. **What methods does it expose?**
   - `push()`, `pop()`, `jumpTo()`, `clear()`, `getLayer()`
   - See full API above

3. **Is the navigation logic duplicated in both panels or centralized?**
   - ⚠️ **DUPLICATED**: Panel-level handlers are duplicated
   - ✅ **CENTRALIZED**: Stack management is centralized

---

## 4. Header Components Analysis

### Command Outputs:

**CircleDetailHeader.svelte:**

- Lines: 100
- Props: `circleName`, `onClose`, `onEdit?`, `onBack?`, `showBackButton?`, `addMenuItems?`, `headerMenuItems?`, `editable?`, `editReason?`, `onNameChange?`, `titleBadges?`, `class?`

**RoleDetailHeader.svelte:**

- Lines: 128
- Props: `roleName`, `canEdit?`, `editReason?`, `onNameChange?`, `onClose`, `onEdit?`, `onBack?`, `showBackButton?`, `authorityUI?`, `authorityDescription?`, `addMenuItems?`, `headerMenuItems?`, `class?`

### Header Comparison:

**Shared Props:**

- ✅ `onClose`, `onEdit?`, `onBack?`, `showBackButton?`
- ✅ `addMenuItems?`, `headerMenuItems?`
- ✅ `editReason?`, `onNameChange?`
- ✅ `class?`

**Circle-Specific:**

- `circleName` (vs `roleName`)
- `editable?` (vs `canEdit?`)
- `titleBadges?` (snippet)

**Role-Specific:**

- `roleName` (vs `circleName`)
- `canEdit?` (vs `editable?`)
- `authorityUI?`, `authorityDescription?` (authority badge with tooltip)

**Structural Differences:**

- Circle: Simple heading with optional badges snippet
- Role: Heading + authority badge with tooltip wrapper

**Code Similarity:**

- ~80% identical structure
- Same layout: back button → title → badges → actions
- Same action buttons: Add menu → Edit → Menu → Close

### Answers:

1. **How different are these two header components?**
   - ⚠️ **MOSTLY SIMILAR**: ~80% identical
   - Main difference: Role has authority badge, Circle has titleBadges snippet
   - Minor prop naming differences (`editable` vs `canEdit`, `circleName` vs `roleName`)

2. **Could they share a base DetailHeader component with entity-specific slots?**
   - ✅ **YES**: High unification potential
   - Could use generic `entityName` prop + `titleBadges` slot
   - Authority badge could be optional slot or prop

---

## 5. CategoryItemsList Pattern

### Command Outputs:

**CategoryItemsList.svelte:**

- Location: `src/lib/modules/org-chart/components/CategoryItemsList.svelte` (253 lines)
- Props: `categoryName`, `items`, `canEdit`, `editReason?`, `onCreate`, `onUpdate`, `onDelete`, `placeholder?`

**Usage:**

- Used in: `CircleDetailPanel.svelte` (5 times), `RoleDetailPanel.svelte` (1 time)
- Categories: Domains, Accountabilities, Policies, Decision Rights, Notes

### CategoryItemsList Analysis:

**Props Interface:**

```typescript
{
  categoryName: string
  items: CircleItem[]  // { itemId, content, order, createdAt, updatedAt }
  canEdit: boolean
  editReason?: string
  onCreate: (content: string) => Promise<void>
  onUpdate: (itemId: Id<'circleItems'>, content: string) => Promise<void>
  onDelete: (itemId: Id<'circleItems'>) => Promise<void>
  placeholder?: string
}
```

**Features:**

- Handles single-field categories (Notes) vs multi-item categories (Domains, Accountabilities)
- Uses `InlineEditText` for editing
- Empty state handling ("No X set")
- Add button with inline input

**getItemsForCategory Pattern:**

**In CircleDetailPanel:**

```typescript
function getItemsForCategory(categoryName: string): Array<{
	itemId: Id<'circleItems'>;
	content: string;
	order: number;
	createdAt: number;
	updatedAt: number;
}> {
	const systemKey = getSystemKeyForCategory(categoryName);
	if (!systemKey) return [];
	const items = getFieldValueAsArray(systemKey);
	return items.map((content, index) => ({
		itemId: `${systemKey}-${index}` as Id<'circleItems'>, // ⚠️ Index-based ID
		content,
		order: index,
		createdAt: Date.now(),
		updatedAt: Date.now()
	}));
}
```

**In RoleDetailPanel:**

```typescript
function getItemsForCategory(systemKey: string): Array<{
	itemId: string;
	content: string;
	order: number;
	createdAt: number;
	updatedAt: number;
}> {
	const items = getFieldValueAsArray(systemKey);
	return items.map((content, index) => ({
		itemId: `${systemKey}-${index}` as Id<'circleItems'>, // ⚠️ Index-based ID
		content,
		order: index,
		createdAt: Date.now(),
		updatedAt: Date.now()
	}));
}
```

**Observation:**

- ⚠️ **WORKAROUND**: Index-based IDs (`${systemKey}-${index}`) are temporary
- Comment in code: "Temporary ID format" / "Temporary adapter until we migrate CategoryItemsList to work directly with customFields"
- This is a migration artifact from legacy `circleItems` to new `customFields` system

### Answers:

1. **What props does CategoryItemsList expect?**
   - See interface above
   - Requires `CircleItem[]` format with `itemId`, `content`, `order`, `createdAt`, `updatedAt`

2. **Is the getItemsForCategory + index-based ID pattern a workaround or intentional design?**
   - ⚠️ **WORKAROUND**: Temporary adapter pattern
   - Comments indicate migration from `circleItems` to `customFields`
   - Index-based IDs are not stable (will break if items reorder)

---

## 6. Tab Recipes Location

### Command Outputs:

**Tab Recipes:**

- Location: `src/lib/design-system/recipes/tabs.recipe.ts` (56 lines)
- Exports: `tabsRootRecipe`, `tabsListRecipe`, `tabsTriggerRecipe`, `tabsContentRecipe`

**Recipes:**

```typescript
tabsListRecipe: 'inline-flex items-center justify-center'
tabsTriggerRecipe: 'inline-flex items-center justify-center px-button-sm-x py-button-sm-y text-button text-secondary ...' (with active variant)
tabsContentRecipe: 'mt-section focus:outline-none'
```

**Usage:**

- Used in: `CircleDetailPanel.svelte`, `RoleDetailPanel.svelte`
- Both use `Tabs.Root`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content` from Bits UI

### Answers:

- ✅ **Tab recipes exist**: `src/lib/design-system/recipes/tabs.recipe.ts`
- Recipes available: `tabsListRecipe`, `tabsTriggerRecipe`, `tabsContentRecipe`
- Both panels use identical tab patterns

---

## 7. Similar Refactoring Patterns

### Command Outputs:

**Detail Components Found:**

- `CircleDetailPanel.svelte` (1227 lines)
- `RoleDetailPanel.svelte` (996 lines)
- `ProposalDetailPanel.svelte` (in `proposals/` subdirectory)
- `ReadwiseDetail.svelte`, `PhotoDetail.svelte`, `NoteDetail.svelte`, `ManualDetail.svelte` (in inbox module)
- `FlashcardDetailModal.svelte` (in flashcards module)

**Panel Components Found:**

- `StackedPanel.svelte` (organisms)
- `CircleRolesPanel.svelte`, `CircleMembersPanel.svelte` (in circles subdirectory)
- `ProposalDetailPanel.svelte`
- `ControlPanel.*` components (in core module)

**Tabs Usage:**

- `CircleDetailPanel.svelte`: Uses `Tabs.Root`
- `RoleDetailPanel.svelte`: Uses `Tabs.Root`
- `ActionItemsList.svelte`: Uses `Tabs.Root`

### Observations:

**Other Modules:**

- ⚠️ **Inbox module**: Has multiple Detail components but different pattern (not panels)
- ⚠️ **Flashcards module**: Has `FlashcardDetailModal` (modal pattern, not panel)
- ✅ **Proposals**: Has `ProposalDetailPanel` (similar pattern to Circle/Role panels)

**Refactoring Pattern:**

- ❌ **NOT APPLIED**: No evidence of shared DetailPanel base component
- ✅ **EXISTS**: `StackedPanel` handles panel infrastructure (breadcrumbs, backdrop, mobile)
- ⚠️ **PARTIAL**: Tab pattern is shared via recipes, but tab content logic is duplicated

### Answers:

1. **Are there other modules with similar panel patterns we should align with?**
   - ⚠️ **PARTIAL**: `ProposalDetailPanel` uses similar pattern
   - Inbox/Flashcards use different patterns (modals, not panels)

2. **Has this refactoring pattern been applied elsewhere?**
   - ❌ **NO**: No shared DetailPanel base component found
   - ✅ **YES**: `StackedPanel` provides shared panel infrastructure
   - ⚠️ **PARTIAL**: Tab recipes are shared, but tab content logic is duplicated

---

## 8. Module Manifest Check

### Command Outputs:

**org-chart/manifest.ts:**

```typescript
export const orgChartModule: ModuleManifest = {
	name: 'org-chart',
	version: '1.0.0',
	dependencies: ['core'],
	featureFlag: null, // Always enabled
	api: undefined as OrgChartModuleAPI | undefined
};
```

**Module Structure:**

- `api.ts` - Module API exports
- `manifest.ts` - Module manifest
- `components/` - Component directory
- `composables/` - Composable directory
- `utils/` - Utility functions
- `constants/` - Constants
- `docs/` - Documentation

**No index.ts found** - Components are imported directly

### Answers:

- ✅ **Module manifest exists**: `src/lib/modules/org-chart/manifest.ts`
- Dependencies: `['core']` (for `useNavigationStack`)
- No feature flag (always enabled)
- No central index.ts - direct imports used

---

## 9. InlineEditText Component

### Command Outputs:

**InlineEditText.svelte:**

- Location: `src/lib/modules/org-chart/components/InlineEditText.svelte` (164 lines)
- Used in: Both `CircleDetailPanel` and `RoleDetailPanel`, `CategoryItemsList`, headers

**Props Interface:**

```typescript
{
  value: string
  onSave: (newValue: string) => Promise<void>
  multiline?: boolean
  placeholder?: string
  maxRows?: number
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}
```

**Features:**

- Click-to-edit pattern
- Auto-focus and select on edit
- Enter to save, Escape to cancel
- Loading state during save
- Error handling with toast

**Usage:**

- Used for editing names in headers
- Used for editing items in CategoryItemsList
- Shared between both panels

### Answers:

- ✅ **Component exists**: `src/lib/modules/org-chart/components/InlineEditText.svelte`
- ✅ **Shared**: Used in both panels and headers
- ✅ **Well-designed**: Handles edit state, focus, save, cancel

---

## 10. Empty State Pattern Check

### Command Outputs:

**Empty State Components:**

- ❌ **NO**: No `EmptyState` or `NoData` component found in `src/lib/components/`
- ⚠️ **PATTERN**: Inline empty state messages found

**Empty State Patterns Found:**

**In RoleDetailPanel:**

```svelte
<p class="text-button text-primary mb-header font-medium">No members yet</p>
<p class="text-button text-primary mb-header font-medium">No documents yet</p>
<p class="text-button text-primary mb-header font-medium">No activities yet</p>
<!-- ... etc -->
```

**In CategoryItemsList:**

```svelte
<Text variant="body" size="md" color="tertiary">
	No {categoryName.toLowerCase()} set
</Text>
```

**Pattern:**

- ⚠️ **INLINE**: Empty states are inline text, not components
- ⚠️ **INCONSISTENT**: Different styling patterns ("No X yet" vs "No X set")
- ❌ **NO SHARED COMPONENT**: No reusable EmptyState component

### Answers:

1. **Check if there's already an EmptyState component:**
   - ❌ **NO**: No EmptyState component found

2. **Check for existing empty state patterns:**
   - ⚠️ **INLINE PATTERNS**: Found inline empty state messages
   - ⚠️ **INCONSISTENT**: Different patterns ("No X yet" vs "No X set")
   - ❌ **NO SHARED COMPONENT**: Should create one for consistency

---

## Summary & Observations

### Key Findings:

1. **Shared Components:**
   - ✅ Loading spinner exists (`Loading.svelte`)
   - ❌ Error state component missing (should create)
   - ✅ StackedPanel handles panel infrastructure
   - ❌ EmptyState component missing (should create)

2. **Composables:**
   - ✅ Navigation stack is centralized and well-designed
   - ⚠️ Edit composables are similar but not unified
   - ✅ useCanEdit is simple and clear

3. **Duplication:**
   - ⚠️ Navigation handlers duplicated in both panels
   - ⚠️ Tab content logic duplicated
   - ⚠️ Header components ~80% similar
   - ⚠️ Empty state patterns inconsistent

4. **Refactoring Opportunities:**
   - Create shared `DetailPanel` base component
   - Unify `CircleDetailHeader` and `RoleDetailHeader`
   - Extract shared navigation handlers
   - Create `EmptyState` component
   - Create `ErrorState` component
   - Unify edit composables (generic base)

5. **Migration Artifacts:**
   - `getItemsForCategory` with index-based IDs is temporary
   - Migrating from `circleItems` to `customFields`

### Recommendations:

1. **High Priority:**
   - Create shared `DetailPanel` base component
   - Unify header components
   - Extract navigation handlers to shared location

2. **Medium Priority:**
   - Create `EmptyState` component
   - Create `ErrorState` component
   - Unify edit composables

3. **Low Priority:**
   - Migrate `CategoryItemsList` to work directly with `customFields`
   - Remove index-based ID workaround
