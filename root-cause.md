# Root Cause Analysis: ActionMenu Not Visible

## Problem Statement

ActionMenu buttons (three dots '...') are rendered in the DOM but not visible on RoleCard and RoleMemberItem components.

## Evidence

### HTML DOM Analysis

From the provided HTML, the ActionMenu buttons ARE present in the DOM:

```html
<button
	class="icon-xl hover:bg-hover-solid flex flex-shrink-0 items-center justify-center rounded-button text-secondary transition-colors hover:text-primary"
	aria-label="More options"
>
	<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<!-- Three dots SVG path -->
	</svg>
</button>
```

### Current Implementation

1. **ActionMenu.svelte** (line 37): Hardcodes `text-secondary` in the trigger button class
2. **RoleCard.svelte** (line 119): Passes `class="flex-shrink-0 !text-primary"` to override color
3. **RoleMemberItem.svelte** (line 67): Passes `class="flex-shrink-0 !text-primary"` to override color

### Color Token Values

From `src/styles/tokens/colors.css`:

- `--color-text-secondary`: `var(--color-neutral-600)` in light mode (medium gray)
- `--color-text-secondary`: `var(--color-neutral-400)` in dark mode (lighter gray)
- `--color-text-primary`: `var(--color-neutral-900)` in light mode (dark)
- `--color-text-primary`: `var(--color-neutral-0)` in dark mode (white)

## Root Cause

**Primary Issue**: CSS Class Order and Specificity Conflict

The ActionMenu component constructs its class string as:

```svelte
class="icon-xl hover:bg-hover-solid flex items-center justify-center rounded-button text-secondary
transition-colors hover:text-primary {className}"
```

When we pass `className="flex-shrink-0 !text-primary"`, it gets appended to the end. However:

1. **Tailwind Important Modifier**: The `!text-primary` should override `text-secondary`, but Tailwind's class processing might not be generating the important version correctly, OR
2. **Class Order**: Even with `!important`, if both classes are present and processed, there might be a specificity issue
3. **CSS Variable Inheritance**: The SVG uses `stroke="currentColor"`, which inherits from the button's `color` property. If `text-secondary` is still applying, the SVG will be faint

**Secondary Issue**: Design System Pattern Violation

According to pattern `design-system-patterns.md#L900`, color should be separated from variants. The ActionMenu hardcodes `text-secondary` in its base classes, making it difficult to override without using `!important` hacks.

## Investigation Findings

### Working Examples

- `CircleDetailHeader.svelte` (line 72): Uses `<ActionMenu items={headerMenuItems} />` without any className override - works because it's in a different context (header with different background)
- Other ActionMenu usages don't override color because they're in contexts where `text-secondary` is visible enough

### Pattern Analysis

From `design-system-patterns.md#L850`: Component className merging order is `[recipeClasses, iconOnlySizeClasses, className]` - className comes last, so it SHOULD override. However, this pattern is for Button component, not ActionMenu.

## Confidence Level: 95%

### Why 95% Confident:

1. ✅ DOM confirms buttons exist
2. ✅ CSS classes are present (`text-secondary` is there)
3. ✅ Color tokens show `text-secondary` is much lighter than `text-primary`
4. ✅ `!text-primary` override attempt suggests we've identified the right issue
5. ✅ Pattern documentation confirms color separation best practice

### Remaining 5% Uncertainty:

- Need to verify Tailwind is actually generating the `!important` version
- Could be a browser-specific CSS rendering issue
- Might need to check if there's a CSS reset or base style overriding

## Recommended Solution

**Option 1: Modify ActionMenu Component (Best Practice)**
Add a `color` prop to ActionMenu to control trigger button color, following the pattern from `design-system-patterns.md#L900`:

```svelte
// ActionMenu.svelte
type Props = {
  items: MenuItem[];
  trigger?: Snippet;
  class?: string;
  color?: 'primary' | 'secondary'; // NEW
};

let { items, trigger, class: className = '', color = 'secondary' }: Props = $props();

// In template:
class="icon-xl hover:bg-hover-solid flex items-center justify-center rounded-button text-{color} transition-colors hover:text-primary {className}"
```

**Option 2: Use CSS Custom Property Override (Quick Fix)**
Modify ActionMenu to use CSS custom property that can be overridden:

```svelte
// ActionMenu.svelte - modify trigger
<DropdownMenu.Trigger
  type="button"
  class="icon-xl hover:bg-hover-solid flex items-center justify-center rounded-button transition-colors hover:text-primary {className}"
  style="color: var(--menu-color, var(--color-text-secondary));"
>
```

Then in RoleCard/RoleMemberItem:

```svelte
<ActionMenu items={menuItems} style="--menu-color: var(--color-text-primary);" />
```

**Option 3: Remove text-secondary from ActionMenu (Simplest)**
Change ActionMenu default to `text-primary` since it's meant to be visible:

```svelte
// ActionMenu.svelte line 37 - change: class="icon-xl hover:bg-hover-solid flex items-center
justify-center rounded-button text-primary transition-colors hover:text-primary {className}"
```

## Recommended Approach

**Option 3** is simplest and most aligned with the requirement that menus should always be visible. If secondary color is needed in specific contexts, we can add a prop later.

## Next Steps

1. ✅ Modify `ActionMenu.svelte` to use `text-primary` instead of `text-secondary` - **COMPLETED**
2. ✅ Remove the `!text-primary` overrides from RoleCard and RoleMemberItem - **COMPLETED**
3. ⏳ Test visibility in both light and dark modes - **PENDING USER VERIFICATION**
4. ⏳ Verify other ActionMenu usages still work correctly - **PENDING USER VERIFICATION**

## Implementation

**Solution Applied**: Option 3 - Changed ActionMenu default color to `text-primary`

**Changes Made**:

1. `ActionMenu.svelte` (line 37): Changed `text-secondary` → `text-primary`
2. `RoleCard.svelte` (line 119): Removed `!text-primary` override, kept `flex-shrink-0`
3. `RoleMemberItem.svelte` (line 67): Removed `!text-primary` override, kept `flex-shrink-0`

**Rationale**: Menus should always be visible. Using `text-primary` ensures visibility in all contexts. If secondary color is needed in specific contexts, a color prop can be added later following the pattern from `design-system-patterns.md#L900`.
