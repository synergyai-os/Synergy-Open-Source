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

## #L100: Matching Component Styles with CVA Recipes [🟢 REFERENCE] [STATUS: ACCEPTED]

**Keywords**: CVA, recipe, match styling, same style, identical appearance, 
NavItem, sidebar button, custom button, consistent styling, style reuse,
navItemRecipe, buttonRecipe, cardRecipe, match NavItem

**Principle**: When components need identical visual styling, reuse CVA recipes 
instead of duplicating CSS classes.

**Symptom**: Custom component doesn't match existing component's appearance.

**Root Cause**: Each component uses a CVA recipe for styling. Duplicating 
Tailwind classes leads to drift and inconsistency.

**Pattern**: 
1. Identify the recipe used by the reference component
2. Import and apply the same recipe with appropriate props
3. Match prop values to achieve desired visual state

**Implementation Examples**:

### Example 1: Sidebar Button Matching NavItem
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

### Example 2: Custom Card Matching Standard Card
```svelte
<script lang="ts">
    import { cardRecipe } from '$lib/design-system/recipes';
    
    const cardClasses = $derived(cardRecipe({ variant: 'elevated', padding: 'md' }));
</script>

<div class={cardClasses}>Custom content</div>
```

**Key props** (for navItemRecipe):
- `state: 'default' | 'active'` - Visual state
- `collapsed: true | false` - Sidebar collapsed mode

**When to Apply**: 
- Custom component needs to match existing component's styling
- Building variations of existing components
- Maintaining visual consistency across related UI elements

**Anti-Patterns**:
- ❌ Copying Tailwind classes from one component to another
- ❌ Creating new recipes for existing patterns
- ❌ Hardcoding style values that exist in recipes
- ❌ Using non-existent utilities in recipes (always validate utilities exist)

**Validation**: Before using a recipe, verify all utilities exist:
```bash
# Check if utility exists
grep "^@utility py-button-sm" src/styles/utilities/*.css

# Validate recipe uses correct tokens
npm run validate:tokens src/lib/design-system/recipes/button.recipe.ts
```

**Related**: #L60 (Border Contrast), #L150 (Consistent Header Heights), #L500 (Recipe Validation and Missing Tokens)

---

## #L150: Consistent Header Heights [🟡 IMPORTANT]

**Keywords**: header height, 2.5rem, 40px, page header, sticky header, consistent spacing, PageHeader component, InboxHeader, AppTopBar, SidebarHeader, header padding, header divider, right slot, header button, small button, icon button, header action

**Principle**: All page headers should use consistent height (`2.5rem` / 40px) and spacing for visual consistency and maintainability.

**Symptom**: Headers across app have inconsistent heights, spacing, or styling.

**Root Cause**: Multiple height definitions (tokens, utilities, inline values) used across different pages. Pattern repeated in multiple places without centralization.

**Pattern**: 
- **Use `PageHeader` component** (recommended) - Centralized molecule component with consistent styling
- **Standard height**: `2.5rem` (40px) for all page headers
- **Standard padding**: `var(--spacing-4)` horizontal (16px), `var(--spacing-2)` vertical (8px)
- **Standard divider**: `border-b border-subtle`
- **Standard z-index**: `var(--zIndex-dropdown)` for sticky headers

**Implementation Examples**:

### Example 1: Using PageHeader Component (Recommended)
```svelte
<script>
  import { PageHeader } from '$lib/components/molecules';
  import { Button } from '$lib/components/atoms';
</script>

<!-- Simple title -->
<PageHeader title="Meetings" />

<!-- Title with right actions -->
<PageHeader title="Inbox">
  <snippet:right>
    <Button variant="secondary">Filter</Button>
    <Button variant="secondary">Sort</Button>
  </snippet:right>
</PageHeader>

<!-- Custom title with badge -->
<PageHeader>
  <snippet:titleSlot>
    <span class="flex items-center gap-header">
      <span>Inbox</span>
      <Badge>8</Badge>
    </span>
  </snippet:titleSlot>
</PageHeader>

<!-- Full flexibility with left and right content -->
<PageHeader>
  <snippet:left>
    <SidebarToggle />
  </snippet:left>
  <snippet:titleSlot>
    <Text variant="label" size="sm">Custom Title</Text>
  </snippet:titleSlot>
  <snippet:right>
    <DropdownMenu>...</DropdownMenu>
  </snippet:right>
</PageHeader>

<!-- Small button with icon + text in right slot -->
<PageHeader title="Meetings">
  <snippet:right>
    <Button variant="outline" size="sm" onclick={() => handleAction()}>
      <div class="flex items-center gap-button">
        <Icon type="add" size="sm" />
        <span>Add meeting</span>
      </div>
    </Button>
  </snippet:right>
</PageHeader>
```

### Example 2: Inline Implementation (Legacy/Reference)
```svelte
<!-- Use inline style if utility not generating (legacy approach) -->
<div
    class="sticky top-0 flex flex-shrink-0 items-center justify-between border-b border-subtle bg-surface"
    style="height: 2.5rem; padding-inline: var(--spacing-4); padding-block: var(--spacing-2); z-index: var(--zIndex-dropdown);"
>
    <!-- Header content -->
</div>
```

**Standard heights**:
- `2.5rem` (40px) - Section headers (PageHeader, AppTopBar, InboxHeader, SidebarHeader)
- `3rem` (48px) - Main navigation bars
- `1.25rem` (20px) - Very compact headers

**When to Apply**:
- Creating new page headers → Use `PageHeader` component
- Refactoring existing headers → Migrate to `PageHeader` component
- Need consistent spacing across pages → Use `PageHeader` component
- Adding action buttons to page headers → Use `right` slot with small buttons (`size="sm"`)
- Legacy code → Can use inline approach temporarily, but migrate to component

**Button Sizing in Headers**:
- Use `size="sm"` for buttons in PageHeader right slot (fits header height better)
- Use `variant="outline"` or `variant="primary"` depending on action importance
- For icon + text buttons, wrap in flex container with `gap-button` token

**Anti-Patterns**:
- ❌ Hardcoding different heights for different headers
- ❌ Copying header markup instead of using `PageHeader` component
- ❌ Creating custom header components when `PageHeader` covers the use case
- ❌ Using non-semantic spacing tokens or hardcoded values

**Component Details**:
- **Location**: `src/lib/components/molecules/PageHeader.svelte`
- **Type**: Molecule (composes Text atom + layout)
- **Props**: `title` (string), `titleSlot` (Snippet), `left` (Snippet), `right` (Snippet), `sticky` (boolean, default: true)
- **Slots**: Flexible slots for maximum customization while maintaining consistent styling

**Token reference**: `layout.header.height` in `design-tokens-base.json` (currently uses inline CSS variables until tokens are added)

**Related**: #L350 (Standardize Page-Level Padding), #L100 (Matching Component Styles), #L300 (Module Card Component Pattern)

**Apply when**: 
- Creating new headers
- Aligning headers across views
- `h-system-header` utility not working
- PageHeader needs consistent height

---

## #L200: Avatar Initials Generation [🟢 REFERENCE]

**Symptom**: Need to generate 2-letter initials from workspace/user name.

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

## #L300: Module Card Component Pattern [🟢 REFERENCE]

**Keywords**: module component, card, Card atom, recipe, InboxCard, TodayMeetingCard, module-specific styling

**Symptom**: Creating module-specific card components that reuse the Card atom while adding module-specific styling variants.

**Symptom**: Need to create a card component for a specific module (e.g., meeting cards, inbox cards).

**Root Cause**: Module components should reuse shared atoms (Card) but may need module-specific styling variants.

**Pattern**: 
1. Use `Card` atom for base card functionality (padding, border, shadow, clickable behavior)
2. Use module-specific recipe for variant-specific styling only (not base card styling)
3. Recipe overrides Card's default background (`bg-elevated` → `bg-surface`) to match container

**Implementation**:
```svelte
<script lang="ts">
  import { Card } from '$lib/components/atoms';
  import { moduleCardRecipe } from '$lib/design-system/recipes';
  
  // Recipe handles variant-specific styling only
  const cardClasses = $derived([moduleCardRecipe({ variant: 'default' }));
</script>

<Card variant="default" padding="md" class={cardClasses}>
  <!-- Module-specific content -->
</Card>
```

**Recipe Pattern**:
```typescript
// Module-specific recipe - variant styling only
export const moduleCardRecipe = cva(
  // Override Card's bg-elevated with bg-surface
  'bg-surface',
  {
    variants: {
      variant: {
        default: '',
        selected: 'border-2 border-focus bg-selected',
        // Add more variants as needed
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);
```

**Key Principles**:
- **Card atom handles**: Base card styling (border, shadow, padding, rounded corners)
- **Recipe handles**: Module-specific variants (selected states, hover effects, background overrides)
- **Component handles**: Content, layout, business logic

**When to Apply**: 
- Creating module-specific card components (InboxCard, TodayMeetingCard, MeetingCard)
- Need module-specific styling variants
- Want to reuse Card atom's accessibility features (keyboard handling, focus states)

**Anti-Patterns**:
- ❌ Duplicating Card atom styling in recipe (border, shadow, padding)
- ❌ Using raw `<div>` instead of Card atom (loses accessibility)
- ❌ Putting base card styling in recipe (should be in Card atom)

**Examples**:
- ✅ `InboxCard` - Uses Card atom + `inboxCardRecipe` for selected/unselected variants
- ✅ `TodayMeetingCard` - Uses Card atom + `todayMeetingCardRecipe` for variant styling
- ❌ Raw `<div>` with full card styling in recipe (loses Card atom benefits)

**Related**: #L100 (Matching Component Styles), #L60 (Border Contrast)

---

## #L350: Standardize Page-Level Padding with Semantic Tokens [🟡 IMPORTANT]

**Keywords**: page padding, px-page, py-page, semantic tokens, design system compliance, broken utilities, non-existent utilities, authenticated pages, layout spacing, px-container, px-content-padding, px-inbox-container, content touches edges, no breathing room

**Principle**: All page-level padding should use semantic token utilities (`px-page` / `py-page`) for consistency, maintainability, and design system compliance.

**Symptom**: Pages have inconsistent padding, content touches edges, or use non-existent utility classes (`px-container`, `px-content-padding`, `px-inbox-container`).

**Root Cause**: Legacy code used non-existent utilities or hardcoded values instead of semantic tokens. Pages were created at different times with different conventions.

**Pattern**: 
- Use `px-page` (32px horizontal) and `py-page` (48px vertical) for all authenticated page content
- Replace all non-existent utilities (`px-container`, `px-content-padding`, `px-inbox-container`) with `px-page` / `py-page`
- Pages don't need recipes - they compose components and use semantic token utilities directly
- Standardize across all authenticated pages for consistent spacing

**Implementation Examples**:

### Example 1: Standard Page Layout
```svelte
<!-- ✅ CORRECT: Use semantic tokens for page padding -->
<div class="h-full overflow-y-auto bg-surface">
  <!-- Header -->
  <div class="border-b border-border-base bg-surface">
    <div class="mx-auto max-w-container px-page py-page">
      <!-- Header content -->
    </div>
  </div>
  
  <!-- Content -->
  <div class="mx-auto max-w-container px-page py-page">
    <!-- Page content -->
  </div>
</div>
```

### Example 2: Fixing Broken Utilities
```svelte
<!-- ❌ WRONG: Non-existent utility -->
<div class="px-container py-container">
  Content
</div>

<!-- ❌ WRONG: Non-existent utility -->
<div class="px-content-padding py-content-padding">
  Content
</div>

<!-- ❌ WRONG: Non-existent utility -->
<div class="px-inbox-container py-inbox-container">
  Content
</div>

<!-- ✅ CORRECT: Semantic token utilities -->
<div class="px-page py-page">
  Content
</div>
```

### Example 3: Page Header Padding
```svelte
<!-- ✅ CORRECT: Header uses px-page for consistency -->
<div class="border-b border-border-base bg-surface">
  <div class="mx-auto max-w-container px-page py-page">
    <Heading level="h1" size="h1">Page Title</Heading>
  </div>
</div>
```

**Token Values**:
- `px-page` = `var(--spacing-page-x)` = 32px horizontal padding
- `py-page` = `var(--spacing-page-y)` = 48px vertical padding (hero-level breathing room)

**When to Apply**: 
- Creating new authenticated pages
- Refactoring existing pages for design system compliance
- Fixing broken/non-existent utility classes
- Standardizing spacing across pages

**Anti-Patterns**:
- ❌ Using non-existent utilities (`px-container`, `px-content-padding`, `px-inbox-container`)
- ❌ Hardcoding padding values (`style="padding: 16px"`)
- ❌ Creating page-level recipes (pages compose components, not styled components)
- ❌ Using different padding utilities per page (breaks consistency)

**Related**: #L10 (Shell Layout), #L150 (Consistent Header Heights), #L100 (Matching Component Styles)

---

## #L400: Simple Vertical Dividers (Avoid Over-Engineering) [🟡 IMPORTANT]

**Keywords**: divider, separator, vertical line, Bits UI, simple solution, over-engineering, utility verification, bg-border, CSS variables

**Principle**: Use the simplest solution that works. Complex components aren't always better than simple HTML + CSS.

**Symptom**: Trying to use Bits UI Separator component but it's not visible or overly complex for simple divider needs.

**Root Cause**: 
- Bits UI Separator requires data attributes (`data-[orientation=vertical]`) selectors that may not work as expected
- Recipe system may reference non-existent utilities (e.g., `bg-border-base` doesn't exist - only `border-default` exists for border-color, not background-color)
- Complex wrapper components add unnecessary abstraction for simple visual elements

**Pattern**: For simple vertical dividers, use a plain div with CSS variables directly:

```svelte
<!-- ✅ CORRECT: Simple div with CSS variable -->
<div class="w-px shrink-0 self-stretch bg-[var(--color-border-default)]"></div>

<!-- ❌ WRONG: Over-engineered Bits UI wrapper -->
<Separator.Root orientation="vertical" variant="default" size="sm" />
```

**Implementation Examples**:

### Example 1: Vertical Divider Between Groups
```svelte
<div class="flex items-center gap-header">
  <!-- Group 1: Title -->
  <Text variant="label" size="sm">Title</Text>
  
  <!-- Group 2: Divider -->
  <div class="w-px shrink-0 self-stretch bg-[var(--color-border-default)]"></div>
  
  <!-- Group 3: Actions -->
  <div class="flex items-center gap-button">
    <Button>Action 1</Button>
    <Button>Action 2</Button>
  </div>
</div>
```

### Example 2: Horizontal Divider
```svelte
<!-- Horizontal divider -->
<div class="h-px w-full shrink-0 bg-[var(--color-border-subtle)]"></div>
```

**When to Apply**: 
- Simple visual dividers (vertical or horizontal lines)
- When Bits UI component adds unnecessary complexity
- When you need immediate visibility without debugging component wrappers

**Anti-Patterns**:
- ❌ Using Bits UI Separator for simple dividers (over-engineering)
- ❌ Creating recipes/components for one-line dividers (unnecessary abstraction)
- ❌ Using non-existent utilities like `bg-border-base` (verify utilities exist first)

**Utility Verification**:
- Check `src/styles/utilities/color-utils.css` for available background utilities
- Use `bg-[var(--color-border-default)]` when utility doesn't exist
- Remember: `border-default` is for `border-color`, not `background-color`

**Related**: #L60 (Border Contrast), #L450 (Grouping Elements with Spacing Tokens)

---

## #L450: Grouping Elements with Spacing Tokens [🟢 REFERENCE]

**Keywords**: grouping, spacing, gap-header, gap-button, gap-form, gap-fieldGroup, element groups, visual hierarchy

**Principle**: Use semantic spacing tokens to create visual hierarchy through grouping. Related items get tight spacing, groups get generous spacing.

**Symptom**: Elements feel cramped or spacing is inconsistent. Need to group related items and space groups appropriately.

**Root Cause**: Using single `gap-*` value for all spacing doesn't create visual hierarchy. Related items should be grouped with tight spacing, groups should be separated with generous spacing.

**Pattern**: Group related elements, then space groups using semantic tokens:

```svelte
<!-- ✅ CORRECT: Groups separated by gap-header, items within group use gap-button -->
<div class="flex items-center gap-header">
  <!-- Group 1: Title -->
  <Text>Title</Text>
  
  <!-- Group 2: Divider -->
  <div class="w-px self-stretch bg-[var(--color-border-default)]"></div>
  
  <!-- Group 3: Related buttons (tight spacing) -->
  <div class="flex items-center gap-button">
    <Button>Action 1</Button>
    <Button>Action 2</Button>
  </div>
</div>
```

**Implementation Examples**:

### Example 1: Header with Title, Divider, and Actions
```svelte
<div class="flex items-center gap-header">
  <!-- Group 1: Title (standalone) -->
  <Text variant="label" size="sm">Meetings</Text>
  
  <!-- Group 2: Divider (standalone) -->
  <div class="w-px shrink-0 self-stretch bg-[var(--color-border-default)]"></div>
  
  <!-- Group 3: Related buttons (grouped with tight spacing) -->
  <div class="flex items-center gap-button">
    <Button variant="primary">My Meetings</Button>
    <Button variant="ghost">Reports</Button>
  </div>
</div>
```

### Example 2: Form Fields with Labels
```svelte
<div class="flex flex-col gap-form">
  <!-- Group 1: First field -->
  <div class="flex flex-col gap-fieldGroup">
    <Label>Field 1</Label>
    <Input />
  </div>
  
  <!-- Group 2: Second field -->
  <div class="flex flex-col gap-fieldGroup">
    <Label>Field 2</Label>
    <Input />
  </div>
</div>
```

**Spacing Token Guide**:
- `gap-header` (12px) - Between groups in headers/navigation
- `gap-form` (20px) - Between form fields
- `gap-fieldGroup` (8px) - Between tightly related elements (label + input, icon + text)
- `gap-button` (8px) - Between related buttons/icons in a group
- `gap-content` (16px) - Between content sections

**When to Apply**:
- Grouping related UI elements (buttons, icons, labels)
- Creating visual hierarchy in headers/navigation
- Form layouts with labels and inputs
- Any layout needing clear element grouping

**Anti-Patterns**:
- ❌ Using single `gap-*` value for everything (no visual hierarchy)
- ❌ Using `gap-button` between groups (too tight - use `gap-header`)
- ❌ Using `gap-header` within groups (too loose - use `gap-button` or `gap-fieldGroup`)

**Related**: #L350 (Standardize Page-Level Padding), #L400 (Simple Vertical Dividers)

---

## #L500: Recipe Validation and Missing Tokens [🟡 IMPORTANT]

**Keywords**: recipe validation, missing token, non-existent utility, py-nav-item, py-button-sm, 
button recipe, token missing, utility doesn't exist, validate tokens, recipe uses wrong token,
design token missing, add semantic token, spacing.button.sm.y

**Principle**: Recipes must use valid design token utilities. If a recipe references a non-existent utility, add the missing semantic token and rebuild.

**Symptom**: Recipe uses utility class that doesn't exist (e.g., `py-nav-item` in button recipe), causing styling to break or not apply correctly.

**Root Cause**: Recipe was written with assumption that utility exists, but token was never added to `design-tokens-semantic.json` or token naming doesn't match utility generation pattern.

**Pattern**: 
1. **Identify missing utility**: Recipe uses class like `py-nav-item` but utility doesn't exist
2. **Check if token exists**: Search `design-tokens-semantic.json` for related token (e.g., `spacing.button.sm.y`)
3. **Add missing token**: Add token to `design-tokens-semantic.json` with correct naming pattern
4. **Rebuild tokens**: Run `npm run tokens:build` to generate utility
5. **Verify utility exists**: Check `src/styles/utilities/*.css` for generated utility
6. **Update recipe**: Use correct utility class name

**Implementation Examples**:

### Example 1: Button Recipe Using Non-Existent Utility
```typescript
// ❌ WRONG: Recipe uses py-nav-item which doesn't exist
export const buttonRecipe = cva('...', {
  variants: {
    size: {
      sm: 'px-button-sm py-nav-item gap-button text-label', // ❌ py-nav-item doesn't exist
    }
  }
});

// ✅ CORRECT: Add missing token, rebuild, use correct utility
// 1. Add to design-tokens-semantic.json:
"button": {
  "sm": {
    "y": {
      "$value": "{spacing.0.5}",
      "$description": "Small button vertical padding (2px - ultra-sleek)"
    }
  }
}

// 2. Run: npm run tokens:build

// 3. Update recipe to use generated utility:
export const buttonRecipe = cva('...', {
  variants: {
    size: {
      sm: 'px-button-sm py-button-sm gap-button-sm text-label', // ✅ Uses py-button-sm
    }
  }
});
```

### Example 2: Missing Icon-Text Gap Token
```typescript
// Recipe needs gap-button-sm but token doesn't exist

// 1. Add token to design-tokens-semantic.json:
"button": {
  "sm": {
    "gap": {
      "$value": "{spacing.0.5}",
      "$description": "Gap between icon and text for small buttons (2px - tight)"
    }
  }
}

// 2. Rebuild: npm run tokens:build

// 3. Verify utility generated:
// grep "^@utility gap-button-sm" src/styles/utilities/*.css

// 4. Use in recipe:
sm: 'px-button-sm py-button-sm gap-button-sm text-label'
```

**Validation Steps**:
```bash
# 1. Check if utility exists
grep "^@utility py-button-sm" src/styles/utilities/*.css

# 2. Validate recipe uses correct tokens
npm run validate:tokens src/lib/design-system/recipes/button.recipe.ts

# 3. Validate all utilities exist
npm run validate:utilities

# 4. Full design system validation
npm run validate:design-system
```

**Token Naming Patterns**:
- `spacing.button.sm.x` → generates `px-button-sm` utility
- `spacing.button.sm.y` → generates `py-button-sm` utility
- `spacing.button.sm.gap` → generates `gap-button-sm` utility
- See `scripts/style-dictionary/transforms.js` for all patterns

**When to Apply**:
- Recipe uses utility that doesn't exist
- Recipe needs new spacing/color token
- Validating recipe before using in component
- Refactoring recipe to use design tokens

**Anti-Patterns**:
- ❌ Using non-existent utilities in recipes (always validate first)
- ❌ Manually editing `src/styles/utilities/*.css` (auto-generated - never edit)
- ❌ Hardcoding values instead of adding semantic token
- ❌ Using wrong token naming pattern (check transforms.js)

**Related**: #L100 (Matching Component Styles), #L350 (Standardize Page-Level Padding)

---

## #L550: Hover Effects with Rounded Corners [🟡 IMPORTANT]

**Keywords**: hover effect, rounded corners, overflow-hidden, hover background, square hover, rounded hover, border radius, hover:bg-subtle

**Principle**: When using hover background effects on elements with rounded corners, add `overflow-hidden` to ensure the hover background respects the border radius.

**Symptom**: Hover effect appears square/rectangular even though the element has rounded corners. The hover background extends beyond the rounded edges.

**Root Cause**: Hover background (`hover:bg-subtle`) doesn't automatically respect `border-radius` without `overflow-hidden`. The background extends to the element's bounding box, ignoring rounded corners.

**Pattern**: Add `overflow-hidden` to elements with rounded corners that have hover effects:

```svelte
<!-- ❌ WRONG: Hover background extends beyond rounded corners -->
<div class="group hover:bg-subtle rounded-card transition-colors-token">
  Content
</div>

<!-- ✅ CORRECT: overflow-hidden clips hover background to rounded corners -->
<div class="group hover:bg-subtle rounded-card overflow-hidden transition-colors-token">
  Content
</div>
```

**Implementation Examples**:

### Example 1: List Item with Rounded Corners
```svelte
<script lang="ts">
  import { meetingCardRecipe } from '$lib/design-system/recipes';
  
  const containerClasses = $derived([meetingCardRecipe()]);
</script>

<!-- Recipe includes overflow-hidden -->
<div class={containerClasses}>
  <!-- Content -->
</div>
```

```typescript
// meetingCard.recipe.ts
export const meetingCardRecipe = cva(
  // overflow-hidden ensures hover background respects rounded corners
  'group hover:bg-subtle transition-colors-token flex items-center rounded-card overflow-hidden gap-fieldGroup',
  {
    variants: {},
    defaultVariants: {}
  }
);
```

### Example 2: Card with Hover Effect
```svelte
<!-- Card with rounded corners and hover effect -->
<div class="rounded-card overflow-hidden hover:bg-subtle transition-colors-token">
  <div class="p-card">
    Card content
  </div>
</div>
```

**When to Apply**:
- Elements with `rounded-*` classes that have hover background effects
- List items with rounded corners and hover states
- Cards with hover effects
- Any element where hover background should match rounded border radius

**Anti-Patterns**:
- ❌ Using `rounded-card` without `overflow-hidden` when hover effects are present
- ❌ Removing `overflow-hidden` because it "clips content" (use padding instead)
- ❌ Using square hover effects on rounded elements (breaks visual consistency)

**Key Points**:
- `overflow-hidden` clips the hover background to the border radius
- Works with any `rounded-*` utility (`rounded-card`, `rounded-button`, etc.)
- Essential for maintaining visual consistency in hover states
- Can be applied in recipes or directly on components

**Related**: #L300 (Module Card Component Pattern), #L100 (Matching Component Styles)

---

## #L600: Component State Variants with Conditional Rendering [🟢 REFERENCE]

**Keywords**: component state, variant, conditional rendering, state-based styling, recipe variant, derived state, isClosed, closed state, active state, conditional buttons

**Principle**: Use recipe variants for state-based styling, and conditional rendering for state-based content/actions. Keep styling in recipes, keep content logic in components.

**Symptom**: Component needs different visual appearance and different actions/buttons based on state (e.g., closed vs active meeting).

**Root Cause**: State affects both styling (visual appearance) and content (which buttons/actions to show). These concerns should be separated: styling via recipe variants, content via conditional rendering.

**Pattern**: 
1. **Add state variant to recipe** - Recipe handles visual styling differences
2. **Derive state in component** - Use `$derived` to compute state from props/data
3. **Apply recipe variant** - Pass state to recipe for styling
4. **Conditionally render content** - Use `{#if}` blocks for state-based content/actions

**Implementation Example**:
```svelte
<script lang="ts">
  import { meetingCardRecipe } from '$lib/design-system/recipes';
  
  interface Meeting {
    closedAt?: number;
    // ... other fields
  }
  
  let { meeting }: Props = $props();
  
  // Derive state from data
  const isClosed = $derived(!!meeting.closedAt);
  
  // Apply recipe variant for styling
  const containerClasses = $derived([meetingCardRecipe({ closed: isClosed })]);
</script>

<div class={containerClasses}>
  <!-- Content that's always visible -->
  
  <!-- Conditionally render actions based on state -->
  {#if isClosed}
    <!-- Closed state: Show Report button -->
    <Button variant="outline" onclick={onShowReport}>
      <Icon type="document" size="sm" />
      Show Report
    </Button>
  {:else}
    <!-- Active state: Download, Add agenda item, Start buttons -->
    <Button variant="outline" iconOnly onclick={handleDownload}>
      <Icon type="download" size="md" />
    </Button>
    {#if onAddAgendaItem}
      <Button variant="outline" onclick={onAddAgendaItem}>
        <Icon type="add" size="sm" />
        Add agenda item
      </Button>
    {/if}
    {#if onStart}
      <Button variant="primary" onclick={onStart}>Start</Button>
    {/if}
  {/if}
  
  <!-- Actions that are always visible -->
  <Button variant="ghost" iconOnly ariaLabel="More options">
    <!-- ... -->
  </Button>
</div>
```

**Recipe Pattern**:
```typescript
// meetingCard.recipe.ts
export const meetingCardRecipe = cva(
  'group hover:bg-subtle transition-colors-token flex items-center rounded-card overflow-hidden gap-fieldGroup',
  {
    variants: {
      closed: {
        true: '',  // Closed state styling (if needed)
        false: ''  // Active state styling (if needed)
      }
    },
    defaultVariants: {
      closed: false
    }
  }
);
```

**Key Principles**:
- **Recipe handles**: Visual styling differences between states (colors, borders, etc.)
- **Component handles**: Which content/actions to show based on state
- **State derivation**: Use `$derived` to compute state from props/data
- **Separation of concerns**: Styling ≠ Content. Recipes for styling, conditionals for content.

**When to Apply**:
- Component has multiple states (active/closed, selected/unselected, etc.)
- Different states need different actions/buttons
- Visual appearance changes with state
- Need type-safe state management

**Anti-Patterns**:
- ❌ Putting content logic in recipes (recipes return CSS classes, not content)
- ❌ Hardcoding state checks in multiple places (derive state once)
- ❌ Mixing styling and content concerns (keep them separate)
- ❌ Not using recipe variants for state-based styling (use variants, not conditional classes)

**Examples**:
- ✅ `MeetingCard` - Uses `closed` variant for styling, conditional rendering for buttons
- ✅ `InboxCard` - Uses `selected` variant for styling, conditional rendering for selected actions
- ❌ Conditional classes in component instead of recipe variants

**Related**: #L300 (Module Card Component Pattern), #L100 (Matching Component Styles), #L550 (Hover Effects with Rounded Corners)

---

## #L650: Molecule Components with Recipes [🟢 REFERENCE]

**Keywords**: molecule component, recipe, atomic design, molecule recipe, AttendeeChip, component classification, molecule vs atom, molecule vs organism, complex component, multiple atoms

**Principle**: Molecule components that compose multiple atoms and have complex styling should use recipes for container styling. Recipes handle container appearance, atoms handle their own styling.

**Symptom**: Complex UI element (chip, tag, selector) that combines multiple atoms (Icon, Text, Badge, Button) needs consistent styling and spacing. Component is too complex to be an atom, but not complex enough to be an organism.

**Root Cause**: Need to classify component correctly (atom vs molecule vs organism) and determine if recipe is needed. Molecules compose atoms and may need container-level styling.

**Pattern**: 
1. **Classify component**: Molecule if it composes 2-3 atoms and has reusable behavior
2. **Create recipe**: Recipe handles container styling (border, padding, background, spacing between elements)
3. **Atoms handle themselves**: Each atom uses its own recipe/variants
4. **Recipe includes spacing**: Use `gap-fieldGroup` in recipe for spacing between atoms

**Implementation Example**:
```svelte
<!-- AttendeeChip.svelte - Molecule component -->
<script lang="ts">
  import { Icon, Text, Badge } from '$lib/components/atoms';
  import { attendeeChipRecipe } from '$lib/design-system/recipes';
  
  let { attendee, onRemove, getTypeLabel, variant = 'default' }: Props = $props();
  
  const containerClasses = $derived([attendeeChipRecipe({ variant })]);
</script>

<div class={containerClasses}>
  <Icon type={attendee.type} size="sm" color="secondary" />
  <Text variant="body" size="sm" color="default" as="span">{attendee.name}</Text>
  <Badge variant="primary" size="sm">
    {getTypeLabel(attendee.type)}
  </Badge>
  <button onclick={() => onRemove(attendee)}>
    <Icon type="close" size="sm" />
  </button>
</div>
```

**Recipe Pattern**:
```typescript
// attendeeChip.recipe.ts
export const attendeeChipRecipe = cva(
  // Container styling: padding, border, background, rounded corners
  // Internal spacing: gap between icon, text, badge, and button
  'inline-flex items-center rounded-button border bg-surface px-button-sm py-button-sm gap-fieldGroup',
  {
    variants: {
      variant: {
        default: 'border-border-base'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);
```

**Component Classification Guide**:
- **Atom**: Single element (Button, Badge, Icon, Text) - has recipe, no composition
- **Molecule**: 2-3 atoms combined (AttendeeChip, FormField) - has recipe for container, composes atoms
- **Organism**: Complex section (Dialog, Header) - may have recipe, composes molecules/atoms
- **Module Component**: Feature-specific (AttendeeSelector) - uses molecules/atoms, may have recipe

**When to Apply**:
- Component composes 2-3 atoms (Icon + Text + Badge + Button)
- Component needs container-level styling (border, padding, background)
- Component is reusable across modules
- Component is too complex for atom, not complex enough for organism

**Anti-Patterns**:
- ❌ Creating recipe for atom that composes other atoms (atoms don't compose atoms)
- ❌ Putting atom styling in molecule recipe (atoms handle their own styling)
- ❌ Not using recipe for molecule container styling (leads to inconsistent spacing)
- ❌ Using margin instead of gap in flex containers (gap handles spacing better)

**Key Principles**:
- **Recipe handles**: Container styling (border, padding, background, gap between elements)
- **Atoms handle**: Their own styling via their recipes/variants
- **Component handles**: Content, business logic, event handlers
- **Spacing**: Use `gap-fieldGroup` in recipe, not margin on individual elements

**Examples**:
- ✅ `AttendeeChip` - Molecule with recipe, composes Icon + Text + Badge + Button
- ✅ `FormField` - Molecule with recipe, composes Label + Input + Error
- ❌ `Button` with Icon inside - Atom shouldn't compose other atoms (use molecule wrapper)

**Related**: #L300 (Module Card Component Pattern), #L450 (Grouping Elements with Spacing Tokens), #L100 (Matching Component Styles)

---

## #L700: Gap vs Margin in Flex Containers [🟢 REFERENCE]

**Keywords**: gap, margin, flex container, spacing, gap-fieldGroup, ml-fieldGroup, redundant margin, flex gap, spacing tokens

**Principle**: Use `gap-*` tokens in flex containers instead of margin on individual elements. Gap handles spacing automatically and is more maintainable.

**Symptom**: Spacing looks off or redundant. Elements have both `gap-fieldGroup` on parent and `ml-fieldGroup` on child, causing double spacing.

**Root Cause**: Using margin (`ml-fieldGroup`) on flex children when parent already has `gap-fieldGroup`. Gap handles spacing between all flex children automatically.

**Pattern**: Use gap on flex container, remove redundant margins on children:

```svelte
<!-- ❌ WRONG: Redundant margin on button -->
<div class="flex items-center gap-fieldGroup">
  <Icon type="user" />
  <Text>Name</Text>
  <Badge>Type</Badge>
  <button class="ml-fieldGroup">Remove</button> <!-- ❌ Redundant -->
</div>

<!-- ✅ CORRECT: Gap handles all spacing -->
<div class="flex items-center gap-fieldGroup">
  <Icon type="user" />
  <Text>Name</Text>
  <Badge>Type</Badge>
  <button>Remove</button> <!-- ✅ No margin needed -->
</div>
```

**Implementation Examples**:

### Example 1: Chip Component
```svelte
<!-- Recipe includes gap-fieldGroup -->
<div class="inline-flex items-center gap-fieldGroup px-button-sm py-button-sm">
  <Icon type="user" size="sm" />
  <Text size="sm">John Doe</Text>
  <Badge size="sm">User</Badge>
  <button>Remove</button> <!-- No margin - gap handles spacing -->
</div>
```

### Example 2: Form Field Group
```svelte
<!-- Parent uses gap-fieldGroup -->
<div class="flex flex-col gap-fieldGroup">
  <Label>Field Name</Label>
  <Input /> <!-- No margin needed -->
  <ErrorText>Error message</ErrorText> <!-- No margin needed -->
</div>
```

**When to Use Gap**:
- Flex containers (`flex`, `inline-flex`)
- Grid containers (`grid`)
- Spacing between related elements
- Container-level spacing

**When to Use Margin**:
- Spacing outside flex/grid containers
- Pushing elements away from container edges
- Non-flex layouts (block, inline-block)
- Specific spacing needs that gap can't handle

**Key Benefits of Gap**:
- ✅ Handles spacing between all children automatically
- ✅ No need to add margin to first/last child
- ✅ More maintainable (one place to change spacing)
- ✅ Works with flex-wrap (spacing maintained when wrapping)

**Anti-Patterns**:
- ❌ Using `ml-fieldGroup` on flex child when parent has `gap-fieldGroup`
- ❌ Using margin for spacing between flex children (use gap instead)
- ❌ Mixing gap and margin for same spacing purpose (choose one)

**Related**: #L450 (Grouping Elements with Spacing Tokens), #L650 (Molecule Components with Recipes)

---

## #L750: Always Use Design System Components (Never Raw HTML) [🟡 IMPORTANT]

**Keywords**: Button component, raw button, design system component, <button>, <Button>, accessibility, recipe system, maintainability, consistency

**Principle**: Always use design system components (Button, Text, Icon, etc.) instead of raw HTML elements. Design system components provide consistency, accessibility, and maintainability.

**Symptom**: Using raw `<button>` instead of `<Button>` component, or other raw HTML elements instead of design system components.

**Root Cause**: Raw HTML elements bypass the design system, lose accessibility features, and require manual styling that breaks consistency.

**Pattern**: Always use design system components:

```svelte
<!-- ❌ WRONG: Raw button element -->
<button
	type="button"
	onclick={() => handleClick()}
	class="px-button-sm py-button-sm rounded-button bg-surface"
	aria-label="Remove item"
>
	<Icon type="close" size="sm" />
</button>

<!-- ✅ CORRECT: Button component from design system -->
<Button
	variant="ghost"
	size="sm"
	iconOnly={true}
	ariaLabel="Remove item"
	onclick={() => handleClick()}
>
	{#snippet children()}
		<Icon type="close" size="sm" />
	{/snippet}
</Button>
```

**Why Use Design System Components**:
- ✅ **Consistency**: All buttons look and behave the same
- ✅ **Accessibility**: Built-in aria-label handling, keyboard support, focus states
- ✅ **Maintainability**: Changes to Button component update all buttons automatically
- ✅ **Recipe System**: Uses design tokens and recipes automatically
- ✅ **Type Safety**: Props are type-checked

**When to Override with className**:
- Button component merges classes as: `[recipeClasses, iconOnlySizeClasses, className]`
- `className` comes last, so it can override recipe classes when needed
- Example: Custom padding override for specific use case

```svelte
<!-- Override padding while keeping Button component benefits -->
<Button
	variant="ghost"
	size="sm"
	iconOnly={true}
	class="pl-button-sm"  <!-- Overrides px-button-sm from iconOnly -->
	style="padding-right: var(--spacing-chip-closeButton-pr);"  <!-- Custom right padding -->
	ariaLabel="Remove"
>
	{#snippet children()}
		<Icon type="close" size="sm" />
	{/snippet}
</Button>
```

**When to Apply**:
- Creating any button, link, or interactive element
- Need consistent styling across app
- Need accessibility features
- Want design system compliance

**Anti-Patterns**:
- ❌ Using raw `<button>` instead of `<Button>` component
- ❌ Using raw `<span>` for text instead of `<Text>` component
- ❌ Using raw `<img>` for icons instead of `<Icon>` component
- ❌ Creating custom styled elements when design system component exists

**Exception**: Only use raw HTML when design system component doesn't exist AND you're creating a new atom component.

**Related**: #L100 (Matching Component Styles), #L650 (Molecule Components with Recipes), #L500 (Recipe Validation)

---

## #L800: Size-Dependent Font Sizes in Recipes [🟢 REFERENCE]

**Keywords**: size-dependent font sizes, badge font size, recipe font size, text-2xs, text-xs, text-sm, fontSize variant, size variants

**Principle**: When components have size variants (sm, md, lg), font sizes should scale with size. Use existing text utilities (`text-2xs`, `text-xs`, `text-sm`) instead of creating component-specific font size tokens.

**Symptom**: Component has size variants but all sizes use the same font size, or recipe uses non-existent `fontSize-*` utility.

**Root Cause**: Recipe uses single font size for all variants, or tries to use non-existent component-specific font size utility.

**Pattern**: Use size-dependent font sizes with existing text utilities:

```typescript
// ❌ WRONG: All sizes use same font size
export const badgeRecipe = cva('...', {
	variants: {
		size: {
			sm: 'px-badge-sm py-badge-sm fontSize-badge',  // ❌ fontSize-badge doesn't exist
			md: 'px-badge-md py-badge-md fontSize-badge',
			lg: 'px-badge-lg py-badge-lg fontSize-badge'
		}
	}
});

// ✅ CORRECT: Size-dependent font sizes
export const badgeRecipe = cva('...', {
	variants: {
		size: {
			sm: 'px-badge-sm py-badge-sm text-2xs',  // 10px - smallest
			md: 'px-badge-md py-badge-md text-xs',   // 12px - default
			lg: 'px-badge-lg py-badge-lg text-sm'    // 14px - larger
		}
	}
});
```

**Available Text Size Utilities**:
- `text-2xs` = 10px (tiny labels, compact badges)
- `text-xs` = 12px (small labels, badges)
- `text-sm` = 14px (secondary text, buttons)
- `text-base` = 16px (body text, default)
- `text-lg` = 18px (large body, emphasis)

**When to Apply**:
- Component has size variants (sm, md, lg)
- Font size should scale with component size
- Recipe uses non-existent font size utility
- Need consistent typography scaling

**Anti-Patterns**:
- ❌ Using non-existent `fontSize-*` utilities
- ❌ All sizes using same font size (no visual hierarchy)
- ❌ Creating component-specific font size tokens when text utilities exist

**Related**: #L500 (Recipe Validation), #L100 (Matching Component Styles)

---

## #L850: Overriding Recipe Classes with className Prop [🟢 REFERENCE]

**Keywords**: className override, recipe override, Button className, class prop, override padding, custom styling, recipe merge order

**Principle**: Design system components accept `className` prop that merges with recipe classes. Use `className` to override specific recipe classes when needed, but prefer using component props/variants when possible.

**Symptom**: Need to override specific recipe classes (e.g., padding) while keeping other recipe styling.

**Root Cause**: Component's recipe provides most styling, but specific use case needs slight override (e.g., custom padding for chip close button).

**Pattern**: Use `className` prop to override recipe classes. Component merges classes as: `[recipeClasses, iconOnlySizeClasses, className]` - `className` comes last, so it overrides:

```svelte
<!-- Button component merges: [recipeClasses, iconOnlySizeClasses, className] -->
<Button
	variant="ghost"
	size="sm"
	iconOnly={true}
	class="pl-button-sm"  <!-- Overrides px-button-sm from iconOnly (left padding only) -->
	style="padding-right: var(--spacing-chip-closeButton-pr);"  <!-- Custom right padding -->
>
	{#snippet children()}
		<Icon type="close" size="sm" />
	{/snippet}
</Button>
```

**When to Use className**:
- Need to override specific recipe classes (padding, margin, etc.)
- Component props don't support the customization needed
- Custom spacing requirements for specific use case

**When NOT to Use className**:
- Component props/variants can achieve the styling (prefer props)
- Need to override many classes (consider adding variant to recipe)
- Override breaks design system consistency (reconsider approach)

**Anti-Patterns**:
- ❌ Using `className` when component props can achieve styling
- ❌ Overriding too many classes (add variant to recipe instead)
- ❌ Using `className` to break design system (reconsider approach)

**Related**: #L100 (Matching Component Styles), #L750 (Always Use Design System Components)

---

## #L900: Separating Color from Variants in CVA Recipes [🟡 IMPORTANT]

**Keywords**: color inheritance, variant color, text-primary, color prop, separation of concerns, CSS specificity, !important, variant typography, color separate

**Principle**: Variants should control typography (font size, weight, line height), not color. Color should always be a separate prop. This prevents CSS specificity conflicts and enables clean color inheritance.

**Symptom**: Component needs to inherit color from parent, but variant applies its own color (e.g., `variant="body"` applies `text-primary`), causing CSS specificity conflicts. Using `!important` feels hacky.

**Root Cause**: Variants mixing typography and color concerns. When `color="inherit"` is needed, variant's color class conflicts with inherit, requiring `!important` hacks.

**Pattern**: Separate color from variants - variants control typography only, color is always separate:

```typescript
// ❌ WRONG: Variant mixes typography and color
export const textRecipe = cva('font-body', {
  variants: {
    variant: {
      body: 'text-primary',  // ❌ Color mixed with typography
      label: 'text-[0.625rem] text-secondary',  // ❌ Color mixed with typography
    },
    color: {
      inherit: '![color:inherit]',  // ❌ Need !important to override variant
    }
  }
});

// ✅ CORRECT: Variants control typography only, color is separate
export const textRecipe = cva('font-body', {
  variants: {
    variant: {
      body: '',  // ✅ Typography only (size handles font size)
      label: 'text-[0.625rem]',  // ✅ Typography only (font size)
    },
    color: {
      default: 'text-primary',  // ✅ Color always separate
      inherit: '[color:inherit]',  // ✅ No !important needed - no conflict
    }
  }
});
```

**Implementation Example**:
```svelte
<!-- InfoCard - parent sets color, Text inherits -->
<div class="bg-status-infoLight [color:var(--color-neutral-900)]">
  <Text variant="body" size="sm" color="inherit" as="span">
    Message inherits dark color from parent
  </Text>
</div>
```

**Key Principles**:
- **Variants = Typography**: Font size (for label/caption), weight, line height
- **Color = Separate**: Always controlled by `color` prop, never in variants
- **No Conflicts**: When `color="inherit"`, no CSS specificity fights
- **Clean API**: `color="inherit"` just works without hacks

**When to Apply**:
- Creating CVA recipes with variants
- Component needs color inheritance from parent
- Variants currently mix typography and color
- Encountering CSS specificity conflicts with color

**Anti-Patterns**:
- ❌ Putting color classes in variants (`variant: { body: 'text-primary' }`)
- ❌ Using `!important` to override variant colors (fix architecture instead)
- ❌ Mixing typography and color concerns in variants
- ❌ Not separating color when inheritance is needed

**Benefits**:
- ✅ No CSS specificity conflicts
- ✅ Clean color inheritance (`color="inherit"` just works)
- ✅ Better separation of concerns
- ✅ More maintainable (color changes don't affect variants)

**Related**: #L100 (Matching Component Styles), #L500 (Recipe Validation)

---

## #L950: Using svelte:element for Dynamic Element Types [🟢 REFERENCE]

**Keywords**: dynamic element, svelte:element, if/else chain, element type, as prop, polymorphic component, repetitive code

**Principle**: Use `svelte:element` for dynamic element types instead of if/else chains. Reduces code from 20+ lines to 3 lines.

**Symptom**: Component has repetitive if/else chain for different HTML elements (p, span, h1-h6, div), making code verbose and hard to maintain.

**Root Cause**: Using conditional rendering (`{#if}`) for each element type instead of Svelte's built-in `svelte:element` feature.

**Pattern**: Use `svelte:element` for dynamic element types:

```svelte
<!-- ❌ WRONG: 20 lines of repetitive if/else -->
{#if as === 'p'}
	<p bind:this={ref} class={classes} {...rest}>{@render children()}</p>
{:else if as === 'span'}
	<span bind:this={ref} class={classes} {...rest}>{@render children()}</span>
{:else if as === 'h1'}
	<h1 bind:this={ref} class={classes} {...rest}>{@render children()}</h1>
<!-- ... 7 more branches ... -->
{/if}

<!-- ✅ CORRECT: 3 lines using svelte:element -->
<svelte:element this={as} bind:this={ref} class={classes} {...rest}>
	{@render children()}
</svelte:element>
```

**Implementation Example**:
```svelte
<script lang="ts">
  let { as = 'p', ref = $bindable(null), ...rest }: Props = $props();
  const classes = $derived(textRecipe({ variant, size, color }));
</script>

<svelte:element this={as} bind:this={ref} class={classes} {...rest}>
	{@render children()}
</svelte:element>
```

**Key Benefits**:
- ✅ **3 lines instead of 20+** - Massive code reduction
- ✅ **No repetition** - DRY principle
- ✅ **Uses Svelte feature** - Built-in for this exact use case
- ✅ **Same functionality** - Works identically to if/else chain
- ✅ **Easier to maintain** - One place to update

**When to Apply**:
- Component accepts `as` prop for element type
- Multiple element types supported (p, span, h1-h6, div)
- Currently using if/else chain for element rendering
- Need polymorphic component behavior

**Anti-Patterns**:
- ❌ Using if/else chain when `svelte:element` can be used
- ❌ Repetitive code for each element type
- ❌ Not using Svelte's built-in features

**Related**: #L100 (Matching Component Styles), #L650 (Molecule Components with Recipes)

---

## #L1000: Data Visualization Color Strategy (Monochromatic Hierarchy) [🟢 REFERENCE]

**Keywords**: org chart, D3, visualization, hierarchy, color, monochromatic, depth, circle pack, data viz, container, entity, depth colors, rainbow colors, status color misuse

**Symptom**: Data visualization (org chart, tree, hierarchy) uses different hue per depth level, causing visual noise and limited scalability.

**Root Cause**: Using separate colors (or worse, status colors) for each hierarchy depth creates a "rainbow effect" that:
1. Limits hierarchy to N colors (what happens at depth 10?)
2. Creates semantic confusion (green ≠ "level 2")
3. Adds cognitive load (users process multiple hues)

**Solution**: Use **monochromatic scale** based on brand hue. All depths use same hue family, varying only in lightness/saturation.

```typescript
// ❌ OLD: Different color per depth (limited, semantically wrong)
const colors = [
  'var(--color-brand-primary)',    // Level 0
  'var(--color-brand-secondary)',  // Level 1 - competes with primary
  'var(--color-status-success)',   // Level 2 - SUCCESS doesn't mean "level 2"
  'var(--color-status-warning)'    // Level 3+ - WARNING doesn't mean "deep"
];
return colors[Math.min(depth, colors.length - 1)];

// ✅ NEW: Single color for all depths (unlimited, clear)
export function getCircleColor(): string {
  return 'var(--color-component-orgChart-circle-fill)';
}
```

**Implementation**: Create dedicated visualization tokens in design system:

```json
// design-tokens-base.json
"orgChart": {
  "circle": {
    "fill": "oklch(90% 0.05 195)",       // Light teal (same for ALL depths)
    "stroke": "oklch(70% 0.10 195)",
    "strokeHover": "oklch(60% 0.12 195)"
  }
}
```

**How Hierarchy Is Communicated**:
- **Nesting** (visual containment)
- **Size** (larger = higher level)
- **Stroke weight** (optional: thicker = higher)

**Related Files**:
- `src/lib/modules/org-chart/COLOR_STRATEGY.md` - Full documentation
- `design-tokens-base.json` - `color.orgChart` tokens
- `design-tokens-semantic.json` - Light/dark mode variants

---

## #L1050: Container vs Entity Pattern (Visual Distinction) [🟢 REFERENCE]

**Keywords**: container, entity, circle, role, org chart, data viz, visual distinction, fill, stroke, interactive, parent, child, hierarchy

**Symptom**: Two different types of elements (e.g., circles/containers vs roles/entities) look too similar, causing user confusion about what's clickable or what contains what.

**Root Cause**: Both element types using same visual treatment (same fill, same stroke weight) without clear distinction.

**Pattern**: Containers (things that hold other things) should look like backgrounds. Entities (things users interact with) should look like foreground objects.

```
CONTAINERS (teams, departments, groups):
├── Light fill (background-like, 70-85% opacity)
├── Subtle stroke (defines boundary)
├── Let content show through

ENTITIES (roles, people, items):
├── Solid fill (brand primary, 100% opacity)
├── High contrast text (white on primary)
├── Clearly "clickable"
```

**Implementation**:

```typescript
// Circle (container) - light, subtle
<circle
  fill="var(--color-component-orgChart-circle-fill)"  // Light teal
  fill-opacity={0.7}
  stroke="var(--color-component-orgChart-circle-stroke)"
  stroke-width={1.5}
/>

// Role (entity) - solid, prominent
<circle
  fill="var(--color-component-orgChart-role-fill)"  // Brand primary
  fill-opacity={1}
/>
<text fill="var(--color-component-orgChart-role-text)">  // White
  Role Name
</text>
```

**When to Apply**:
- Hierarchy visualizations (org charts, trees)
- Nested data structures with different element types
- Parent/child relationships where child is the interactive element
- Any visualization with "containers" and "items"

---

## #L1100: Data Visualization Interactive States (Dashed Hover) [🟢 REFERENCE]

**Keywords**: hover, active, selected, dashed, dotted, stroke, interactive state, data viz, org chart, D3, focus, stroke-dasharray

**Symptom**: Hover state on data visualization elements doesn't clearly indicate interactivity, or active state isn't distinguishable enough.

**Pattern**: Use stroke style changes (not just color) to communicate state:

| State | Stroke Style | Stroke Color | Stroke Width |
|-------|--------------|--------------|--------------|
| Default | Solid | Subtle | 1.5px |
| **Hover (non-active)** | **Dashed** `6 3` | Medium | 2px |
| **Active/Selected** | **Solid** | **Brand Primary** | 3px |
| Focus | Solid + Ring | Primary | 3px + outline |

**Implementation**:

```svelte
<circle
  stroke={isActive
    ? 'var(--color-component-orgChart-circle-strokeActive)'  // Primary
    : isHovered
      ? 'var(--color-component-orgChart-circle-strokeHover)' // Darker
      : 'var(--color-component-orgChart-circle-stroke)'}     // Default
  stroke-width={isActive ? 3 : isHovered ? 2 : 1.5}
  stroke-dasharray={isHovered && !isActive ? '6 3' : 'none'}  <!-- KEY: Dashed on hover -->
/>
```

**Why Dashed for Hover?**:
- ✅ Clearly different from solid active state
- ✅ Indicates "this is interactive but not selected"
- ✅ Works well in SVG without adding extra elements
- ✅ Cross-browser compatible

**CSS for focus-visible**:

```css
.circle-group:focus-visible circle {
  stroke: var(--color-component-orgChart-circle-strokeActive);
  stroke-width: 3;
  stroke-dasharray: none;  /* Solid on focus */
  outline: 2px solid var(--color-component-orgChart-circle-strokeActive);
  outline-offset: 4px;
}
```

**Related**: #L1000 (Monochromatic Hierarchy), #L1050 (Container vs Entity)

---

## #L1150: SVG Text with Design System Tokens (D3.js/Visualization) [🟡 IMPORTANT]

**Keywords**: SVG, D3.js, foreignObject, text, font-family, font-sans, visualization, circle pack, org chart, labels, mask, paint-order, CSS variables, design tokens, readable text, text-shadow

**Principle**: SVG `<text>` elements don't inherit CSS font-family from HTML parents. Use `foreignObject` for full design system integration or explicitly set `font-family` via CSS variables in inline styles.

**Symptom**: 
- SVG text uses wrong font (browser default instead of design system font)
- Text labels in D3.js visualizations don't match app typography
- SVG mask creates visible "background bar" behind text
- Text stroke breaks thin letter forms (e.g., 'e' looks distorted)

**Root Cause**:
1. **Font inheritance**: SVG `<text>` elements exist in SVG namespace, not HTML namespace. CSS classes like `font-bold` set weight but NOT font-family.
2. **Mask artifacts**: SVG masks that hide content behind text create visible rectangular exclusion zones.
3. **Paint order**: Default SVG paint order (fill then stroke) causes stroke to "eat" thin glyph parts.

**Pattern**:

### Option A: foreignObject (Full Design System Integration) ⭐ RECOMMENDED

Use `<foreignObject>` to embed HTML inside SVG, enabling full CSS/design system support:

```svelte
<g transform="translate({node.x},{node.y})">
  <foreignObject
    x={-labelWidth / 2}
    y={-labelHeight / 2}
    width={labelWidth}
    height={labelHeight}
    class="pointer-events-none overflow-visible"
  >
    <div
      xmlns="http://www.w3.org/1999/xhtml"
      class="flex h-full w-full items-center justify-center"
    >
      <span
        class="font-sans font-semibold text-center select-none"
        style="
          font-size: {fontSize}px;
          color: var(--color-component-orgChart-label-text);
          text-shadow: 
            0 0 3px var(--color-component-orgChart-circle-fill),
            0 0 6px var(--color-component-orgChart-circle-fill),
            0 1px 2px rgba(0,0,0,0.3);
        "
      >
        {labelText}
      </span>
    </div>
  </foreignObject>
</g>
```

**Pros**: Full design system integration, CSS utilities work, multi-line text support
**Cons**: Slightly more complex, minor performance overhead with many labels

### Option B: SVG Text with CSS Variables

Style SVG `<text>` directly with CSS variables for simpler cases:

```svelte
<text
  x="0"
  y="0"
  text-anchor="middle"
  dominant-baseline="middle"
  class="pointer-events-none select-none"
  style="
    font-family: var(--typography-fontFamily-sans);
    font-weight: 500;
    paint-order: stroke fill;
  "
  fill="var(--color-component-orgChart-label-text)"
  stroke="var(--color-component-orgChart-circle-fill)"
  stroke-width="3"
  font-size={fontSize}
>
  {labelText}
</text>
```

**Key**: Use `paint-order: stroke fill` to paint stroke BEHIND fill for readability without distorting letters.

### Readability Techniques

For text floating over complex backgrounds:

1. **Layered text-shadow** (for foreignObject):
   ```css
   text-shadow: 
     0 0 3px var(--background-color),
     0 0 6px var(--background-color),
     0 1px 2px rgba(0,0,0,0.3);
   ```

2. **paint-order with stroke** (for SVG text):
   ```svelte
   style="paint-order: stroke fill;"
   stroke="var(--background-color)"
   stroke-width="3"
   ```

3. **Avoid masks**: Don't use SVG masks to hide content behind text - they create visible rectangular artifacts.

**When to Apply**:
- Building D3.js visualizations (circle pack, treemap, etc.)
- SVG text labels not matching design system font
- Text needs to float over complex backgrounds
- Org charts, hierarchical visualizations

**Anti-Patterns**:
- ❌ Using `font-bold` class without `font-sans` (sets weight but not family)
- ❌ Using SVG masks to hide content behind text labels
- ❌ Aggressive `text-shadow` (90% opacity creates artifacts)
- ❌ Default paint order with thin stroke (distorts letter forms)
- ❌ Hardcoded colors instead of CSS variables (breaks theming)

**Related**: #L1000 (Monochromatic Hierarchy), #L750 (Always Use Design System Components)

---

**Last Updated**: 2025-11-30

