# Pattern Index

Quick lookup for common issues. Find your symptom → go to line number.

## How to Use

1. **Find symptom** in tables below
2. **Click line number** (e.g., `svelte-reactivity.md#L10`)
3. **Apply fix** from pattern

---

## 🔴 Critical (Breaks Functionality)

| Symptom | Pattern | File |
|---------|---------|------|
| Props not updating in composable/helper function | Composable Reactivity Break | `svelte-reactivity.md#L10` |
| Scroll area shows content at bottom, must scroll up | ScrollArea Initial Position | `ui-patterns.md#L10` |

## 🟡 Important (Common Issues)

| Symptom | Pattern | File |
|---------|---------|------|
| Dropdown content overflows instead of scrolling | ScrollArea Max Height | `ui-patterns.md#L60` |
| Borders look too harsh/dark | Border Contrast (Subtle vs Base) | `design-system-patterns.md#L60` |
| Headers have inconsistent heights | Consistent Header Heights | `design-system-patterns.md#L150` |

## 🟢 Reference (Best Practices)

| Symptom | Pattern | File |
|---------|---------|------|
| Need scrollable dropdown with bits-ui | ScrollArea with DropdownMenu | `ui-patterns.md#L110` |
| Need premium sidebar + content layout | Shell Layout (Linear/Notion) | `design-system-patterns.md#L10` |
| Custom sidebar button matching NavItem | NavItem Recipe for Buttons | `design-system-patterns.md#L100` |
| Generate 2-letter initials from name | Avatar Initials Generation | `design-system-patterns.md#L200` |
| Sidebar header not aligned with nav | Sidebar Header Alignment | `design-system-patterns.md#L250` |

---

## Files

- `svelte-reactivity.md` - Svelte 5 runes, $derived, $effect, composables
- `ui-patterns.md` - bits-ui components, scroll areas, dropdowns
- `design-system-patterns.md` - Design tokens, CVA recipes, layout patterns
- `convex-integration.md` - Convex queries, mutations, real-time updates
- `analytics.md` - PostHog integration, events, feature flags

---

**Last Updated**: 2025-11-26

