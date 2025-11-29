# Pattern Index

Quick lookup for common issues. Find your symptom → go to line number.

**⚠️ AI Note**: Each concept has ONE canonical pattern. If you find multiple patterns for same concept, the one in this index is canonical.

## How to Use

1. **Find symptom** in tables below
2. **Or search keywords** in Keyword Quick Reference
3. **Click line number** (e.g., `svelte-reactivity.md#L10`)
4. **Apply fix** from pattern

---

## Keyword Quick Reference

| Keywords | Canonical Pattern | File |
|----------|-------------------|------|
| reactivity, props, stale, composable, $derived, updates | Composable Reactivity Break | `svelte-reactivity.md#L10` |
| $derived, function call, TypeError, $.get is not a function, reactive values, component doesn't render | $derived Values Are Not Functions | `svelte-reactivity.md#L70` |
| scroll, bottom, position, viewport, scrollTop | ScrollArea Initial Position | `ui-patterns.md#L10` |
| overflow, max-height, scroll, dropdown, full-page, parent height, h-full, Tabs.Root, height constraint | ScrollArea Max Height | `ui-patterns.md#L60` |
| border, harsh, contrast, subtle, soft | Border Contrast | `design-system-patterns.md#L60` |
| CVA, recipe, match, styling, NavItem, consistent | Component Style Matching | `design-system-patterns.md#L100` |
| height, header, inconsistent, 2.5rem, 40px, PageHeader component, sticky header, header padding, header divider, right slot, header button, small button, icon button, header action | Consistent Header Heights | `design-system-patterns.md#L150` |
| initials, avatar, name, abbreviation | Avatar Initials | `design-system-patterns.md#L200` |
| alignment, padding, sidebar, spacing, px-2 | Sidebar Header Alignment | `design-system-patterns.md#L250` |
| module component, card, Card atom, recipe, InboxCard, TodayMeetingCard | Module Card Component Pattern | `design-system-patterns.md#L300` |
| page padding, px-page, py-page, semantic tokens, broken utilities, px-container, px-content-padding, px-inbox-container, content touches edges | Standardize Page-Level Padding | `design-system-patterns.md#L350` |
| divider, separator, vertical line, Bits UI, simple solution, over-engineering, utility verification, bg-border, CSS variables | Simple Vertical Dividers | `design-system-patterns.md#L400` |
| grouping, spacing, gap-header, gap-button, gap-form, gap-fieldGroup, element groups, visual hierarchy | Grouping Elements with Spacing Tokens | `design-system-patterns.md#L450` |
| recipe validation, missing token, non-existent utility, py-nav-item, py-button-sm, button recipe, token missing, utility doesn't exist, validate tokens | Recipe Validation and Missing Tokens | `design-system-patterns.md#L500` |
| hover effect, rounded corners, overflow-hidden, hover background, square hover, rounded hover, border radius, hover:bg-subtle | Hover Effects with Rounded Corners | `design-system-patterns.md#L550` |
| component state, variant, conditional rendering, state-based styling, recipe variant, derived state, isClosed, closed state, active state, conditional buttons | Component State Variants with Conditional Rendering | `design-system-patterns.md#L600` |
| atom, class prop, className, pure components, self-contained, Icon, Text, Button, Card, Avatar, Heading | Atoms Should NOT Accept class Props | `atoms-no-class-props.md` |
| molecule component, recipe, atomic design, molecule recipe, AttendeeChip, component classification, molecule vs atom, molecule vs organism, complex component, multiple atoms | Molecule Components with Recipes | `design-system-patterns.md#L650` |
| gap, margin, flex container, spacing, gap-fieldGroup, ml-fieldGroup, redundant margin, flex gap, spacing tokens | Gap vs Margin in Flex Containers | `design-system-patterns.md#L700` |
| Button component, raw button, design system component, <button>, <Button>, accessibility, recipe system, maintainability, consistency | Always Use Design System Components | `design-system-patterns.md#L750` |
| size-dependent font sizes, badge font size, recipe font size, text-2xs, text-xs, text-sm, fontSize variant, size variants | Size-Dependent Font Sizes in Recipes | `design-system-patterns.md#L800` |
| className override, recipe override, Button className, class prop, override padding, custom styling, recipe merge order | Overriding Recipe Classes with className | `design-system-patterns.md#L850` |
| color inheritance, variant color, text-primary, color prop, separation of concerns, CSS specificity, !important, variant typography, color separate | Separating Color from Variants in CVA Recipes | `design-system-patterns.md#L900` |
| dynamic element, svelte:element, if/else chain, element type, as prop, polymorphic component, repetitive code | Using svelte:element for Dynamic Element Types | `design-system-patterns.md#L950` |

---

## 🔴 Critical (Breaks Functionality)

| Symptom | Pattern | File |
|---------|---------|------|
| Props not updating in composable/helper function | Composable Reactivity Break | `svelte-reactivity.md#L10` |
| TypeError: $.get(...) is not a function, component doesn't render | $derived Values Are Not Functions | `svelte-reactivity.md#L70` |
| Scroll area shows content at bottom, must scroll up | ScrollArea Initial Position | `ui-patterns.md#L10` |

## 🟡 Important (Common Issues)

| Symptom | Pattern | File |
|---------|---------|------|
| Dropdown content overflows instead of scrolling | ScrollArea Max Height | `ui-patterns.md#L60` |
| Full-page ScrollArea doesn't scroll (no scrollbar) | ScrollArea Max Height | `ui-patterns.md#L60` |
| Borders look too harsh/dark | Border Contrast (Subtle vs Base) | `design-system-patterns.md#L60` |
| Headers have inconsistent heights | Consistent Header Heights | `design-system-patterns.md#L150` |
| Page padding inconsistent or content touches edges | Standardize Page-Level Padding | `design-system-patterns.md#L350` |
| Divider not visible, Bits UI Separator too complex, utility doesn't exist | Simple Vertical Dividers | `design-system-patterns.md#L400` |
| Recipe uses non-existent utility, button recipe broken, py-nav-item doesn't exist, missing token | Recipe Validation and Missing Tokens | `design-system-patterns.md#L500` |

## 🟢 Reference (Best Practices)

| Symptom | Pattern | File |
|---------|---------|------|
| Need scrollable dropdown with bits-ui | ScrollArea with DropdownMenu | `ui-patterns.md#L110` |
| Need premium sidebar + content layout | Shell Layout (Linear/Notion) | `design-system-patterns.md#L10` |
| Custom sidebar button matching NavItem | NavItem Recipe for Buttons | `design-system-patterns.md#L100` |
| Generate 2-letter initials from name | Avatar Initials Generation | `design-system-patterns.md#L200` |
| Sidebar header not aligned with nav | Sidebar Header Alignment | `design-system-patterns.md#L250` |
| Creating module-specific card component | Module Card Component Pattern | `design-system-patterns.md#L300` |
| Grouping elements, spacing between groups, visual hierarchy | Grouping Elements with Spacing Tokens | `design-system-patterns.md#L450` |
| Recipe validation, missing design token, add semantic token, validate utilities exist | Recipe Validation and Missing Tokens | `design-system-patterns.md#L500` |
| Component has multiple states, different actions per state, state-based styling | Component State Variants with Conditional Rendering | `design-system-patterns.md#L600` |
| Atom accepting class prop, Icon with class prop, Text with class prop | Atoms Should NOT Accept class Props | `atoms-no-class-props.md` |
| Creating molecule component, molecule with recipe, component classification, molecule vs atom | Molecule Components with Recipes | `design-system-patterns.md#L650` |
| Redundant margin, gap vs margin, flex spacing, ml-fieldGroup redundant | Gap vs Margin in Flex Containers | `design-system-patterns.md#L700` |
| Using raw button instead of Button component, design system compliance, accessibility | Always Use Design System Components | `design-system-patterns.md#L750` |
| Badge font size, component font size variants, text-2xs text-xs text-sm | Size-Dependent Font Sizes in Recipes | `design-system-patterns.md#L800` |
| Override recipe classes, Button className prop, custom padding override | Overriding Recipe Classes with className | `design-system-patterns.md#L850` |
| Component needs color inheritance, variant applies color, CSS specificity conflict, !important hack | Separating Color from Variants in CVA Recipes | `design-system-patterns.md#L900` |
| Repetitive if/else for element types, polymorphic component, as prop, dynamic HTML element | Using svelte:element for Dynamic Element Types | `design-system-patterns.md#L950` |

---

## Files

- `svelte-reactivity.md` - Svelte 5 runes, $derived, $effect, composables
- `ui-patterns.md` - bits-ui components, scroll areas, dropdowns
- `design-system-patterns.md` - Design tokens, CVA recipes, layout patterns
- `convex-integration.md` - Convex queries, mutations, real-time updates
- `analytics.md` - PostHog integration, events, feature flags

---

**Last Updated**: 2025-01-27
**Key Principle**: One canonical pattern per concept. This index is the source of truth.
