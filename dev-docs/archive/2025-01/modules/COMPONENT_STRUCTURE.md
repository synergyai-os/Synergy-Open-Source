# Import UI Component Structure

## Visual Layout

```
┌────────────────────────────────────────────────────────────────┐
│  /w/[slug]/chart/import/+page.svelte                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Header: "Import Org Structure"                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  OrgStructureImporter.svelte                             │  │
│  │  ┌─────────────────────┬──────────────────────────────┐  │  │
│  │  │ ImportTextarea      │ StructurePreview             │  │  │
│  │  │ (Left Panel)        │ (Right Panel)                │  │  │
│  │  │                     │                              │  │  │
│  │  │ ┌─────────────────┐ │ ┌──────────────────────────┐ │  │  │
│  │  │ │ "Import Struct" │ │ │ "Preview"                │ │  │  │
│  │  │ │ [? Syntax Help] │ │ │                          │ │  │  │
│  │  │ └─────────────────┘ │ │ ┌──────────────────────┐ │ │  │  │
│  │  │                     │ │ │ PreviewTree          │ │  │  │
│  │  │ [Syntax Examples]   │ │ │ ⭕ Root               │ │  │  │
│  │  │ (if showHelp)       │ │ │  └─ ⭕ Circle A       │ │  │  │
│  │  │                     │ │ │      └─ 👤 Role 1     │ │  │  │
│  │  │ ┌─────────────────┐ │ │ │      └─ 👤 Role 2     │ │  │  │
│  │  │ │                 │ │ │ │  └─ ⭕ Circle B       │ │  │  │
│  │  │ │  Textarea       │ │ │ │      └─ 👤 Role 3     │ │  │  │
│  │  │ │  (monospace)    │ │ │ └──────────────────────┘ │ │  │  │
│  │  │ │                 │ │ │                          │ │  │  │
│  │  │ │                 │ │ │ [Stats Box]              │ │  │  │
│  │  │ │                 │ │ │ "Will create: 2 circles, │ │  │  │
│  │  │ └─────────────────┘ │ │  3 roles"                │ │  │  │
│  │  │                     │ │ 📝 Draft badge           │ │  │  │
│  │  │ [Error Box]         │ │                          │ │  │  │
│  │  │ "3 errors found:"   │ │ [Buttons]                │ │  │  │
│  │  │ • Line 5: ...       │ │ [Cancel] [Import]        │ │  │  │
│  │  │ (if errors exist)   │ │                          │ │  │  │
│  │  └─────────────────────┴──────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
+page.svelte
  ├── Header (built-in)
  └── OrgStructureImporter
       ├── ImportTextarea
       │    ├── Header ("Import Structure" + "? Syntax Help")
       │    ├── Syntax Examples (collapsible)
       │    ├── <textarea> (monospace, 500ms debounce)
       │    └── Error Box (red, shows line numbers)
       └── StructurePreview
            ├── Header ("Preview")
            ├── PreviewTree (recursive)
            │    └── PreviewTree (recursive children)
            ├── Stats Box (shows counts, draft badge)
            └── Action Buttons (Cancel, Import)
```

## Data Flow

```
User Types Text
    ↓
textInput ($state)
    ↓
$effect (debounced 500ms)
    ↓
parseOrgStructure(textInput)
    ↓
parseResult ($state)
    ├─→ errors[] → ImportTextarea (displays errors)
    ├─→ warnings[] → StructurePreview (displays warnings)
    └─→ root → PreviewTree (displays tree)

User Clicks "Import"
    ↓
handleImport()
    ↓
importMutation({ sessionId, workspaceId, rootCircleId, structure })
    ↓
Convex: orgStructureImport.importOrgStructure
    ├─→ Creates circles (status: 'draft')
    ├─→ Creates roles (status: 'draft', isHiring: true)
    └─→ Captures version history

Success
    ↓
goto(`/w/${workspaceSlug}/chart`)
```

## State Management

```typescript
// OrgStructureImporter.svelte
let textInput = $state(''); // User's raw text input
let parseResult = $state<ParseResult | null>(null); // Parsed structure + errors/warnings
let importing = $state(false); // Loading state during mutation

// Derived state
const canImport = $derived(result?.success && result.root !== null && result.errors.length === 0);

const stats = $derived(() => {
	// Count circles and roles recursively
});
```

## Props Flow

```
+page.svelte
  ↓ (props)
OrgStructureImporter
  ├─→ workspaceId: string
  ├─→ rootCircleId: string
  └─→ workspaceSlug: string
      │
      ├─→ ImportTextarea
      │     ├─→ value: string ($bindable)
      │     └─→ errors: ParseError[]
      │
      └─→ StructurePreview
            ├─→ result: ParseResult | null
            ├─→ onImport: () => Promise<void>
            └─→ importing: boolean
                  │
                  └─→ PreviewTree
                        └─→ node: ParsedNode (recursive)
```

## Styling Breakdown

### Layout Tokens

```svelte
<!-- OrgStructureImporter: Split-pane layout -->
<div class="grid h-full grid-cols-2 gap-section">

<!-- ImportTextarea: Vertical form layout -->
<div class="flex h-full flex-col gap-form">

<!-- StructurePreview: Vertical form layout -->
<div class="flex h-full flex-col gap-form">

<!-- PreviewTree: Hierarchical spacing -->
<div class="mb-fieldGroup">
  <div class="flex items-start gap-fieldGroup">
  <div class="border-base pl-fieldGroup ml-6 border-l mt-fieldGroup">
```

### Component Tokens

```svelte
<!-- Cards/Containers -->
class="border-base rounded-card inset-md border bg-surface" class="border-base rounded-card inset-md
border bg-elevated"

<!-- Input -->
class="border-base rounded-input border bg-surface px-input py-input"

<!-- Buttons -->
class="flex justify-end gap-button"

<!-- Status Badges -->
class="bg-warning-subtle rounded-full px-2 py-1 text-xs text-warning" class="bg-error-subtle rounded-card
inset-md border border-error"
```

### Text Tokens

```svelte
<!-- Headings -->
<Text variant="h3">Import Structure</Text>
<Text variant="h3">Preview</Text>

<!-- Body Text -->
<Text variant="body" size="sm" color="secondary">
<Text variant="body" size="sm" color="error">
<Text variant="body" size="sm" color="warning">

<!-- Labels -->
class="text-label text-secondary hover:text-primary"
```

## Accessibility

### Keyboard Navigation

- ✅ Tab through: Syntax Help → Textarea → Cancel → Import
- ✅ Enter in textarea = newline (not submit)
- ✅ Space on buttons = click

### Screen Readers

- ⚠️ **TODO**: Add `aria-label="Syntax help toggle"` to help button
- ⚠️ **TODO**: Add `aria-live="polite"` to error region
- ⚠️ **TODO**: Add `aria-live="polite"` to preview region

### Visual Feedback

- ✅ Focus ring on textarea (`:focus` border color)
- ✅ Button disabled state (opacity change)
- ✅ Error text in red (`text-error`)
- ✅ Warning text in orange (`text-warning`)

## Performance Characteristics

| Operation         | Time    | Implementation             |
| ----------------- | ------- | -------------------------- |
| Debounce delay    | 500ms   | `setTimeout` in `$effect`  |
| Parse (10 nodes)  | < 10ms  | Pure function, single pass |
| Parse (50 nodes)  | < 50ms  | Linear complexity O(n)     |
| Import (10 nodes) | < 500ms | Convex mutation            |
| Import (50 nodes) | < 2s    | Convex mutation (network)  |

## Error States

| Error Type          | Where Shown            | User Action             |
| ------------------- | ---------------------- | ----------------------- |
| Empty input         | Preview placeholder    | Enter text              |
| Syntax error        | Red box below textarea | Fix syntax              |
| Business rule error | Red box below textarea | Fix structure           |
| Mutation error      | Browser alert          | Check console, retry    |
| Network error       | Browser alert          | Check connection, retry |

## Success Flow

```
1. User pastes valid structure
   ↓ 500ms debounce
2. Parser validates → No errors
   ↓
3. Preview shows tree + stats
   ↓
4. User clicks "Import Structure"
   ↓
5. Button shows "Importing..."
   ↓
6. Mutation creates circles/roles (draft status)
   ↓
7. Success: goto(/w/{slug}/chart)
   ↓
8. Org chart shows new items with draft badges
```

## Testing Hooks

```typescript
// PreviewTree.svelte
data-testid="preview-tree-node"
data-node-type={node.type}
data-node-name={node.name}

// ImportTextarea.svelte
data-testid="import-textarea"
data-testid="syntax-help-button"
data-testid="error-list"

// StructurePreview.svelte
data-testid="structure-preview"
data-testid="preview-stats"
data-testid="import-button"
data-testid="cancel-button"
```

_(Not yet added, but recommended for E2E tests)_
