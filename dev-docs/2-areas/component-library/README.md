# Component Library

> 🚧 **Coming Soon** - Visual component documentation for designers and engineers

---

## What Will Be Here

This section will document all UI components with:

- **Visual Examples** - Screenshots or Figma embeds
- **Usage Guidelines** - When and how to use each component
- **Code Examples** - Implementation with props/API
- **Accessibility Notes** - WCAG compliance, keyboard nav
- **Design Tokens Used** - Which tokens power each component
- **Do's and Don'ts** - Best practices

---

## Planned Components

### Core UI

- **Buttons** - Primary, secondary, ghost, danger variants
- **Forms** - Inputs, textareas, selects, checkboxes, radio buttons
- **Cards** - Inbox cards, flashcards, detail panels
- **Modals** - Command center, create modals, confirmations
- **Navigation** - Sidebar, breadcrumbs, tabs, pagination

### Product OS Specific

- **OKR Cards** - Objective and key result displays
- **Roadmap Views** - Timeline, kanban, list views
- **Opportunity Trees** - Visual discovery trees
- **Meeting Templates** - Stand-up, retro, planning layouts
- **Glossary Widgets** - Term cards, inline definitions

---

## Why This Matters

**For Designers:**

- Find component specs without digging through code
- Ensure consistency across the product
- Understand constraints and capabilities

**For Engineers:**

- See usage examples and props
- Understand accessibility requirements
- Follow established patterns

**For Product Managers:**

- Understand what's possible with existing components
- Reference components in feature specs
- Avoid reinventing the wheel

---

## Current State

The components exist in `/src/lib/components/` but are not yet documented. Priority components to document first:

1. **Button** (`/src/lib/components/ui/button/`) - Most used
2. **Input** (`/src/lib/components/ui/input/`) - Forms everywhere
3. **Card** (scattered) - Core pattern
4. **Modal** (command center, create menus) - High complexity
5. **Sidebar** (`/src/lib/components/Sidebar.svelte`) - Navigation

---

## Documentation Format

Each component will follow this structure:

````markdown
# ComponentName

> One-sentence description

## Preview

[Screenshot or Figma embed]

## Usage

When to use this component and when not to.

## Variants

- Default
- Primary
- Secondary
- etc.

## Props/API

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| ...  | ...  | ...     | ...         |

## Examples

```svelte
<Component prop="value" />
```
````

## Accessibility

- Keyboard navigation: Tab, Enter, Escape
- Screen reader: ARIA labels, roles
- WCAG: AA compliance

## Design Tokens Used

- `px-button-x` - Horizontal padding
- `bg-primary` - Background color
- etc.

## Do's and Don'ts

✅ Do: ...
❌ Don't: ...

```

---

## Related

- **[Design Tokens](../design-tokens.md)** - Token reference
- **[UI Patterns](../patterns/ui-patterns.md)** - Solved design problems
- **[Validation](../../VALIDATION-PRODUCT-TRIO.md)** - Why this is needed

---

**Next Steps**:
1. Create component template
2. Document 5 priority components
3. Add screenshots/Figma embeds
4. Review with design + engineering

**Estimated**: 1 day for 10-15 core components


```
