# Design System Patterns

Patterns for using design tokens, CVA recipes, and consistent UI styling.

---

## #L10: Shell Layout (Linear/Notion Aesthetic) [🟢 REFERENCE]

**Symptom**: Need a premium app layout where sidebar and content feel unified with depth.

**Pattern**: Sidebar background extends as "shell" around the entire page. Main content area floats as a card within this shell.

**Implementation**:
```svelte
<div class="bg-sidebar relative flex h-screen overflow-hidden">
    <!-- Shell gradient overlay for subtle depth -->
    <div
        class="pointer-events-none absolute inset-0 bg-radial-[at_0%_0%] from-[oklch(55%_0.12_195_/_0.03)] via-[oklch(55%_0.06_195_/_0.01)] to-transparent"
        aria-hidden="true"
    ></div>

    <!-- Sidebar (no right border - flows into shell) -->
    <Sidebar />

    <!-- Main Content - Floating Card -->
    <div
        class="relative flex flex-1 flex-col overflow-hidden"
        style="padding: var(--spacing-2); padding-left: 0;"
    >
        <!-- Content card with rounded corners, subtle border, shadow -->
        <div class="border-subtle flex flex-1 flex-col overflow-hidden rounded-xl border bg-surface shadow-sm">
            <!-- First child needs rounded-t-xl to match card -->
            <div class="rounded-t-xl bg-surface">
                <AppTopBar />
            </div>
            <div class="flex-1 overflow-hidden">
                {@render children()}
            </div>
        </div>
    </div>
</div>
```

**Key principles**:
- Sidebar has no right border (use `sidebarRecipe` without `border-r`)
- Content card uses `border-subtle` (not `border-base`) for softer contrast
- First child of content card needs matching `rounded-t-xl`
- `shadow-sm` for subtle depth without heaviness
- Gradient uses brand hue (195) at very low opacity (3%)

**Apply when**: 
- Building authenticated layouts
- Premium/modern app aesthetics
- Sidebar + content layouts

**Related**: #L60 (Border Contrast)

---

## #L60: Border Contrast (Subtle vs Base) [🟡 IMPORTANT]

**Symptom**: Borders look too harsh or dark, breaking the premium aesthetic.

**Root Cause**: `border-base` uses higher contrast color. For card edges and content dividers, softer contrast looks better.

**Fix**: Use `border-subtle` for content areas:

```svelte
<!-- ❌ TOO HARSH: border-base for content card -->
<div class="border-base rounded-xl border bg-surface">

<!-- ✅ BETTER: border-subtle for softer premium feel -->
<div class="border-subtle rounded-xl border bg-surface">
```

**When to use which**:
- `border-base` - Form inputs, focus rings, structural boundaries
- `border-subtle` - Content cards, dividers, secondary separators

**Apply when**: 
- Designing content cards/panels
- Headers with bottom borders
- Dividers between content sections

**Related**: #L10 (Shell Layout)

---

## #L100: NavItem Recipe for Custom Buttons [🟢 REFERENCE]

**Symptom**: Need a button in sidebar that looks identical to NavItem.

**Root Cause**: NavItem uses `navItemRecipe` from CVA. Custom buttons need same recipe.

**Implementation**:
```svelte
<script lang="ts">
    import { Icon, Text } from '$lib/components/atoms';
    import { navItemRecipe } from '$lib/design-system/recipes';

    // Match NavItem's default styling
    const buttonClasses = $derived(navItemRecipe({ state: 'default', collapsed: false }));
</script>

<button type="button" onclick={handleClick} class={buttonClasses}>
    <Icon type="delete" size="sm" class="flex-shrink-0" />
    <Text variant="body" size="sm" as="span" class="min-w-0 flex-1 font-normal">
        Button Label
    </Text>
</button>
```

**Key props**:
- `state: 'default' | 'active'` - Visual state
- `collapsed: true | false` - Sidebar collapsed mode

**Apply when**: 
- Custom action buttons in sidebar
- Non-link nav items (buttons, triggers)
- Development/admin tools in sidebar

---

## #L150: Consistent Header Heights [🟡 IMPORTANT]

**Symptom**: Headers across app have inconsistent heights.

**Root Cause**: Multiple height definitions (tokens, utilities, inline values).

**Fix**: Use consistent `2.5rem` (40px) for all section headers:

```svelte
<!-- Use inline style if utility not generating -->
<div
    class="flex items-center justify-between border-b border-subtle bg-surface"
    style="height: 2.5rem; padding-inline: var(--spacing-4);"
>
    <!-- Header content -->
</div>
```

**Standard heights**:
- `2.5rem` (40px) - Section headers (AppTopBar, InboxHeader, SidebarHeader)
- `3rem` (48px) - Main navigation bars
- `1.25rem` (20px) - Very compact headers

**Token reference**: `layout.header.height` in `design-tokens-base.json`

**Apply when**: 
- Creating new headers
- Aligning headers across views
- `h-system-header` utility not working

---

## #L200: Avatar Initials Generation [🟢 REFERENCE]

**Symptom**: Need to generate 2-letter initials from organization/user name.

**Pattern**: First letter of first two words, or first two letters of single word.

**Implementation**:
```typescript
function getOrgInitials(name: string): string {
    const words = name.split(' ').filter(Boolean);
    if (words.length >= 2) {
        // "Synergy OS" → "SO", "My Company" → "MC"
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    // "Test" → "TE", "A" → "A"
    return name.substring(0, 2).toUpperCase();
}
```

**Examples**:
- "Synergy OS" → "SO"
- "Test Company" → "TC"
- "Marketing" → "MA"
- "A" → "A"

**Apply when**: 
- Organization switcher without logo
- Avatar fallbacks
- User initials when no image

---

## #L250: Sidebar Header Alignment [🟢 REFERENCE]

**Symptom**: Sidebar header items not aligned with nav items below.

**Root Cause**: Different padding values between header trigger and NavItem.

**Fix**: Match padding exactly with NavItem:
```svelte
<!-- NavItem uses: px-2 py-[0.375rem] -->
<DropdownMenu.Trigger class="px-2 py-[0.375rem] ...">
    <!-- Header content -->
</DropdownMenu.Trigger>
```

**Key values**:
- `padding-inline: var(--spacing-2)` or `px-2`
- `padding-block: 0.375rem` (6px) or `py-[0.375rem]`

**Apply when**: 
- Sidebar header not visually aligned
- Adding new triggers/buttons to sidebar header

---

**Last Updated**: 2025-11-26

