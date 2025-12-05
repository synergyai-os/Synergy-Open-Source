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
| org chart, D3, visualization, hierarchy, color, monochromatic, depth, circle pack, data viz, rainbow colors, status color misuse | Data Visualization Color Strategy | `design-system-patterns.md#L1000` |
| container, entity, circle, role, visual distinction, fill, stroke, interactive, parent, child, hierarchy | Container vs Entity Pattern | `design-system-patterns.md#L1050` |
| hover, active, selected, dashed, dotted, stroke, interactive state, data viz, stroke-dasharray, focus, proportional, stroke-width, radius, scale, CSS override, thick border, small circle | Data Viz Interactive States (Proportional Stroke) | `design-system-patterns.md#L1100` |
| SVG, D3.js, foreignObject, text, font-family, font-sans, visualization, org chart, labels, mask, paint-order, text-shadow | SVG Text with Design System Tokens | `design-system-patterns.md#L1150` |
| semantic zoom, proportional scaling, level of detail, LOD, D3, zoom, labels, truncation, word wrap, multi-line, tspan, padding, progressive disclosure, rendered size, circle pack | Text Scaling in Data Visualizations | `design-system-patterns.md#L1200` |
| zoom, zoom-to-fit, aspect ratio, viewport, D3, circle pack, org chart, padding, scale, transform, width, height, cropped, clipped, fit to view | Viewport-Aware Zoom-to-Fit | `design-system-patterns.md#L1250` |
| browser zoom, D3 zoom, scaleExtent, wheel, trackpad, pinch zoom, preventDefault, touch-action, zoom limits, zoom takeover, MacBook | Prevent Browser Zoom Takeover | `design-system-patterns.md#L1300` |
| D3 pack, circle size, depth sizing, radius, value, hierarchy depth, role size, sqrt, value to radius | D3 Pack Layout Depth Sizing | `design-system-patterns.md#L1350` |
| border, visualization, D3, org chart, boxed, boxy, organic, blend, seamless, circular, SVG container, rectangular frame | Visualization Container Styling (Borderless) | `design-system-patterns.md#L1400` |
| D3, pack layout, circle size, hierarchy depth, baseSizes, value, radius, role size, root circle, sub-circle, depth-based sizing, sqrt, value to radius | D3 Pack Circle Sizes by Depth | `design-system-patterns.md#L1350` |
|| nested cards, rounded corners, container, list items, rounded-none, nested variant, visual hierarchy, container border, inner items | Nested Cards Without Rounded Corners | `design-system-patterns.md#L1450` |
| preload, batch query, N+1 queries, performance, instant display, listByWorkspace, roles preloading, delay, sequential queries | Preload Related Data to Avoid N+1 Queries | `convex-integration.md#L10` |
| useQuery, hydration error, SSR, white screen, browser check, composable, component, $derived, conditional query, reactive query | useQuery Hydration Errors in Components vs Composables | `convex-integration.md#L140` |
| useQuery, $derived, conditional query, null forever, ternary, circle selection, dependency changes, reactive query creation | Conditional Query Creation Must Be Wrapped in $derived | `convex-integration.md#L250` |
| useQuery, manual query, convexClient.query, $effect, auto-refetch, reactivity, mutation updates, hard reload, refetch, circles vs roles | Use Reactive useQuery Instead of Manual Queries for Auto-Refetch | `convex-integration.md#L340` |

---

## 🔴 Critical (Breaks Functionality)

| Symptom | Pattern | File |
|---------|---------|------|
| Props not updating in composable/helper function | Composable Reactivity Break | `svelte-reactivity.md#L10` |
| TypeError: $.get(...) is not a function, component doesn't render | $derived Values Are Not Functions | `svelte-reactivity.md#L70` |
| Scroll area shows content at bottom, must scroll up | ScrollArea Initial Position | `ui-patterns.md#L10` |
| White screen on refresh with hydration error, useQuery in component | useQuery Hydration Errors | `convex-integration.md#L140` |
| Query never fires after user selection, queryResult is null forever, conditional useQuery | Conditional Query Creation Must Be Wrapped in $derived | `convex-integration.md#L250` |
| After mutations UI doesn't update, need manual refetch, hard reload feeling, circles update but roles don't | Use Reactive useQuery Instead of Manual Queries | `convex-integration.md#L340` |

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
| SVG text wrong font, D3 labels not matching design system, mask background bar, text stroke distortion | SVG Text with Design System Tokens | `design-system-patterns.md#L1150` |
| Circle cropped when zooming to focus, element clipped at top/bottom, zoom-to-fit ignores viewport aspect ratio | Viewport-Aware Zoom-to-Fit | `design-system-patterns.md#L1250` |
| Browser zoom takes over at D3 zoom limits, pinch zoom triggers browser zoom, trackpad zoom escapes app | Prevent Browser Zoom Takeover | `design-system-patterns.md#L1300` |
| Data loads with delay after user interaction, roles appear after circle selection, multiple sequential queries | Preload Related Data to Avoid N+1 Queries | `convex-integration.md#L10` |

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
| Org chart colors, D3 visualization, hierarchy depth colors, unlimited depth support | Data Visualization Color Strategy (Monochromatic) | `design-system-patterns.md#L1000` |
| Circle vs role distinction, container vs entity, visual hierarchy in data viz | Container vs Entity Pattern | `design-system-patterns.md#L1050` |
| Hover state on data viz, dashed stroke, active/selected state, SVG interaction, thick border on small circles, CSS hover overrides inline style, proportional stroke-width | Data Viz Interactive States (Proportional Stroke) | `design-system-patterns.md#L1100` |
| Labels stay truncated at all zoom levels, text doesn't reveal on zoom, proportional vs semantic zoom, multi-line text | Text Scaling in Data Visualizations | `design-system-patterns.md#L1200` |
| Role sizes too small, need more hierarchy between depths, D3 pack value to radius relationship | D3 Pack Circle Sizes by Depth | `design-system-patterns.md#L1350` |
| D3 visualization looks boxed-in, circular shapes feel awkward in rectangular border, org chart doesn't blend with UI | Visualization Container Styling (Borderless) | `design-system-patterns.md#L1400` |

---

## Files

- `svelte-reactivity.md` - Svelte 5 runes, $derived, $effect, composables
- `ui-patterns.md` - bits-ui components, scroll areas, dropdowns
- `design-system-patterns.md` - Design tokens, CVA recipes, layout patterns, **data visualization colors**
- `convex-integration.md` - Convex queries, mutations, real-time updates, **performance optimization**
- `analytics.md` - PostHog integration, events, feature flags

## Module-Specific Docs

- `src/lib/modules/org-chart/COLOR_STRATEGY.md` - Org chart color system (circles, roles, states)

---

**Last Updated**: 2025-12-04
**Key Principle**: One canonical pattern per concept. This index is the source of truth.

## Recent Additions (2025-12-01)

| Pattern | File | Keywords |
|---------|------|----------|
| Mobile-First Slide-Over Panel | `ui-patterns.md#L350` | panel, modal, sheet, mobile, responsive, breadcrumbs, back button |
| Dynamic Responsive Widths with CSS Variables | `ui-patterns.md#L400` | Tailwind JIT, dynamic class, CSS variable, calc, style block |
| Fixed vs Absolute Positioning for Panel Children | `ui-patterns.md#L450` | fixed, absolute, positioning, panel, viewport |
