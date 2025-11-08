# Atomic UI Components - Linear Style

**Pattern Reference**: `dev-docs/patterns/ui-patterns.md#L680`

Reusable, composable UI elements following atomic design principles. All components are **UI-only** with stubbed functionality to enable independent development and reuse across the application.

---

## Components

### Form Components
- **`KeyboardShortcut`** - Display keyboard shortcuts consistently
- **`FormInput`** - Text input with label
- **`FormTextarea`** - Textarea with label

### Metadata Components (Linear-style)
- **`StatusPill`** - Status selector with icon (Backlog, In Progress, Done, etc.)
- **`PrioritySelector`** - Priority levels with visual indicators (None, Low, Medium, High, Urgent)
- **`AssigneeSelector`** - User assignment with avatar/initials
- **`ProjectSelector`** - Project selection with color indicator
- **`ContextSelector`** - Context/Template/Team selector (PAI, Template buttons)

### Utility Components
- **`MetadataBar`** - Horizontal container for metadata pills
- **`AttachmentButton`** - File attachment button with count
- **`ToggleSwitch`** - On/off toggle switch

---

## Usage

```typescript
import {
  StatusPill,
  PrioritySelector,
  AssigneeSelector,
  MetadataBar
} from '$lib/components/ui';

// In your component
<MetadataBar>
  <StatusPill status="backlog" onChange={(s) => console.log(s)} />
  <PrioritySelector priority="high" onChange={(p) => console.log(p)} />
  <AssigneeSelector assignee={user} onChange={(a) => console.log(a)} />
</MetadataBar>
```

---

## Design Principles

1. **Atomic** - Each component does one thing well
2. **Composable** - Components work together seamlessly
3. **Reusable** - Can be used anywhere in the app
4. **Consistent** - Follows Linear's design language
5. **Accessible** - Proper ARIA labels and keyboard support

---

## Stubbed Functionality

All components have **onChange** handlers but **no backend integration**. This allows:
- ✅ UI development independent of backend
- ✅ Easy testing of visual states
- ✅ Future integration without UI changes
- ✅ Component reuse across features

---

## Next Steps

To make these components functional:
1. Add Convex schema for metadata (status, priority, assignee, project)
2. Create mutations for updating metadata
3. Wire up onChange handlers to mutations
4. Add dropdown menus for selection (use Bits UI)
5. Implement real data fetching (users, projects)

---

## Examples

See `QuickCreateModal.svelte` for full integration example with all components working together in Linear-style layout.

