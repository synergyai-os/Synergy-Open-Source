# Design Tokens

This document defines our design system tokens used consistently throughout the application. All tokens support automatic light/dark mode adaptation.

## Typography

- **Nav Item Text**: `text-sm` (0.875rem / 14px)
- **Label/Badge Text**: `text-label` (0.625rem / 10px) - *custom token*
- **Section Label**: `text-label` with `uppercase tracking-wider`

## Spacing (Design Tokens)

**✨ USE SEMANTIC TOKENS INSTEAD OF NUMERIC VALUES**

All spacing now uses semantic tokens that can be changed globally. Instead of `px-2 py-1.5`, use `px-nav-item py-nav-item`.

### Spacing Scale
Our spacing scale is based on a 4px base unit (0.25rem):
- **1** = 4px (0.25rem)
- **2** = 8px (0.5rem) 
- **3** = 12px (0.75rem)
- **4** = 16px (1rem)
- **5** = 20px (1.25rem)
- **6** = 24px (1.5rem)

### Semantic Spacing Tokens

| Token | Utility Class | Value | Usage |
|-------|--------------|-------|-------|
| `--spacing-nav-container-x` | `px-nav-container` | 0.5rem (8px) | Nav container horizontal padding |
| `--spacing-nav-container-y` | `py-nav-container` | 0.5rem (8px) | Nav container vertical padding |
| `--spacing-nav-item-x` | `px-nav-item` | 0.5rem (8px) | Nav item horizontal padding |
| `--spacing-nav-item-y` | `py-nav-item` | 0.375rem (6px) | Nav item vertical padding |
| `--spacing-menu-item-x` | `px-menu-item` | 0.625rem (10px) | Menu/dropdown item horizontal padding |
| `--spacing-menu-item-y` | `py-menu-item` | 0.375rem (6px) | Menu/dropdown item vertical padding |
| `--spacing-section-x` | `px-section` | 0.5rem (8px) | Section horizontal padding |
| `--spacing-section-y` | `py-section` | 0.25rem (4px) | Section vertical padding |
| `--spacing-badge-x` | `px-badge` | 0.375rem (6px) | Badge horizontal padding |
| `--spacing-badge-y` | `py-badge` | 0.125rem (2px) | Badge vertical padding |
| `--spacing-header-x` | `px-header` | 0.75rem (12px) | Header horizontal padding |
| `--spacing-header-y` | `py-header` | 0.625rem (10px) | Header vertical padding |
| `--spacing-icon-gap` | `gap-icon` | 0.5rem (8px) | Standard icon-text gap |
| `--spacing-icon-gap-wide` | `gap-icon-wide` | 0.625rem (10px) | Wider icon-text gap |
| `--spacing-indent` | `pl-indent` | 1.5rem (24px) | Left padding for nested/indented items |
| `--spacing-inbox-container` | `p-inbox-container` | 1rem (16px) | Inbox container padding |
| `--spacing-inbox-card-x` | `px-inbox-card` | 0.75rem (12px) | Inbox card horizontal padding |
| `--spacing-inbox-card-y` | `py-inbox-card` | 0.75rem (12px) | Inbox card vertical padding |
| `--spacing-inbox-list-gap` | `gap-inbox-list` | 0.5rem (8px) | Gap between inbox cards |
| `--spacing-inbox-icon-gap` | `gap-inbox-icon` | 0.5rem (8px) | Icon-to-content gap in inbox cards |
| `--spacing-inbox-title-bottom` | `mb-inbox-title` | 1rem (16px) | Margin below inbox title |
| `--spacing-inbox-header-x` | `px-inbox-header` | 1rem (16px) | Inbox header horizontal padding |
| `--spacing-inbox-header-y` | `py-inbox-header` | 0.75rem (12px) | Inbox header vertical padding |
| `--spacing-settings-section-gap` | `gap-settings-section` | 1.5rem (24px) | Gap between settings section cards |
| `--spacing-settings-row-gap` | `gap-settings-row` | 1rem (16px) | Vertical gap between setting rows |
| `--spacing-settings-row-padding-x` | `px-settings-row` | 1rem (16px) | Setting row horizontal padding |
| `--spacing-settings-row-padding-y` | `py-settings-row` | 1rem (16px) | Setting row vertical padding |

### Migration Guide

**Before (hardcoded):**
```html
<nav class="px-2 py-2">...</nav>
<a class="px-2 py-1.5 gap-2">...</a>
```

**After (semantic tokens):**
```html
<nav class="px-nav-container py-nav-container">...</nav>
<a class="px-nav-item py-nav-item gap-icon">...</a>
```

**Benefits:**
- ✅ Change spacing globally by updating one CSS variable
- ✅ Self-documenting code (semantic names explain purpose)
- ✅ Prevents inconsistent spacing
- ✅ Easy to audit and maintain

## Icon Sizes

- **Standard Icon**: `w-4 h-4` (1rem / 16px) - used for nav items, buttons
- **Small Icon**: `w-3.5 h-3.5` (0.875rem / 14px) - used for dropdowns, inline icons
- **Large Icon/Avatar**: `w-7 h-7` (1.75rem / 28px) - used for workspace logo, avatars

## Border Radius

- **Default**: `rounded-md` (0.375rem / 6px)
- **Buttons/Nav Items**: `rounded-md`
- **Badges**: `rounded` (0.25rem / 4px)
- **Workspace Logo**: `rounded-md`

## Transitions

- **Standard**: `transition-all duration-150` (150ms)
- **Colors**: Used for hover states and interactive elements

## Colors (Semantic Tokens)

**✨ USE SEMANTIC COLOR TOKENS - Colors change automatically with light/dark mode**

We use unified brand color tokens throughout the application. Colors automatically adapt to light/dark theme. **Always use semantic tokens instead of hardcoded colors like `bg-gray-900`, `text-white`, etc.**

### Unified Brand Colors

**✨ PRIMARY SYSTEM - Use these throughout the app**

| Token | Utility Class | Dark Mode | Light Mode | Usage |
|-------|--------------|-----------|------------|-------|
| `--color-text-primary` | `text-primary` | white | gray-900 | Primary text (headings, important content) |
| `--color-text-secondary` | `text-secondary` | gray-300 | gray-600 | Secondary text (descriptions, subtitles) |
| `--color-text-tertiary` | `text-tertiary` | gray-500 | gray-500 | Tertiary text (labels, hints) |
| `--color-bg-base` | `bg-base` | gray-900 | white | Base background (page background) |
| `--color-bg-surface` | `bg-surface` | gray-800 | gray-50 | Surface background (panels, lists) |
| `--color-bg-elevated` | `bg-elevated` | gray-750* | white | Elevated surfaces (cards, modals) |
| `--color-border-base` | `border-base` | gray-800 | gray-200 | Base borders |
| `--color-border-elevated` | `border-elevated` | gray-700 | gray-300 | Elevated borders (cards) |
| `--color-accent-primary` | `border-accent-primary` | blue-600 | blue-600 | Primary accent (selected states, links) |
| `--color-bg-hover` | `hover:bg-hover` | gray-800/50 | gray-100/50 | Hover background (subtle) |
| `--color-bg-hover-solid` | `hover:bg-hover-solid` | gray-800 | gray-100 | Hover background (solid) |
| `--color-bg-selected` | `bg-selected` | blue-600 | blue-600 | Selected state background |
| `--color-tag-bg` | `bg-tag` | gray-700 | gray-100 | Tag/chip background |
| `--color-tag-text` | `text-tag` | gray-300 | gray-600 | Tag/chip text |

*Note: `gray-750` is a custom shade slightly lighter than gray-800 for elevated surfaces in dark mode.

**Benefits:**
- ✅ One unified color system for entire app
- ✅ Automatic light/dark mode adaptation
- ✅ Change all colors globally by updating CSS variables
- ✅ Self-documenting (semantic names explain purpose)

### Sidebar-Specific Colors

For sidebar components, we use sidebar-specific tokens that work with the sidebar's unique styling:

| Token | Utility Class | Dark Mode | Light Mode | Usage |
|-------|--------------|-----------|------------|-------|
| `--color-sidebar-bg` | `bg-sidebar` | gray-900 | white | Sidebar background |
| `--color-sidebar-border` | `border-sidebar` | gray-800 | gray-200 | Sidebar borders |
| `--color-sidebar-text-primary` | `text-sidebar-primary` | white | gray-900 | Primary text |
| `--color-sidebar-text-secondary` | `text-sidebar-secondary` | gray-300 | gray-600 | Secondary text (nav items) |
| `--color-sidebar-text-tertiary` | `text-sidebar-tertiary` | gray-500 | gray-500 | Tertiary text (labels) |
| `--color-sidebar-hover` | `hover:bg-sidebar-hover` | gray-800/50 | gray-100/50 | Hover background (subtle) |
| `--color-sidebar-hover-solid` | `hover:bg-sidebar-hover-solid` | gray-800 | gray-100 | Hover background (solid) |
| `--color-sidebar-active` | `bg-sidebar-active` | gray-800 | gray-100 | Active state background |
| `--color-sidebar-badge-bg` | `bg-sidebar-badge` | gray-700 | gray-300 | Badge background |
| `--color-sidebar-badge-text` | `text-sidebar-badge` | gray-300 | gray-600 | Badge text |

### Color Migration Guide

**Before (hardcoded colors):**
```html
<div class="bg-gray-50 text-gray-900 border-gray-200">
  <button class="bg-white text-gray-600 hover:bg-gray-100">...</button>
  <span class="bg-gray-100 text-gray-600">Tag</span>
</div>
```

**After (semantic tokens - auto-adapts to theme):**
```html
<div class="bg-surface text-primary border-base">
  <button class="bg-elevated text-secondary hover:bg-hover-solid">...</button>
  <span class="bg-tag text-tag">Tag</span>
</div>
```

**Benefits:**
- ✅ Colors automatically adapt to light/dark mode
- ✅ Change all colors globally by updating CSS variables
- ✅ Self-documenting (semantic names explain purpose)
- ✅ Consistent theming across entire application

## Common Patterns

### Page/Section Title Pattern (Linear-style subtle naming)
**✨ USE THIS FOR ALL PAGE/SECTION TITLES IN HEADERS**

```
text-sm font-normal text-secondary
```

**Why:** Linear uses subtle, unobtrusive titles that don't dominate the UI. This creates a cleaner, more focused interface where content is the star, not the labels.

**Examples:**
- "Inbox" in InboxHeader
- "Flashcards" in FlashcardsHeader
- Any page or section title in a sticky header

**Do NOT use:**
- ❌ `text-xl font-bold text-primary` (too dominant)
- ❌ `text-lg font-semibold text-primary` (still too bold)
- ✅ `text-sm font-normal text-secondary` (subtle, Linear-style)

### Nav Item Pattern (used 24+ times)
**Full pattern (with semantic tokens):**
```
group flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary
```
**Core classes only:**
```
px-nav-item py-nav-item gap-icon rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary
```

### Menu/Dropdown Item Pattern
```
px-menu-item py-menu-item text-sm text-gray-900 hover:bg-gray-50 cursor-pointer flex items-center justify-between focus:bg-gray-50
```
*Note: Different from nav items - uses semantic menu-item tokens and lighter colors for light backgrounds*

### Badge Pattern (used 4+ times)
```
text-label bg-gray-700 text-gray-300 font-medium px-badge py-badge rounded min-w-[18px] text-center flex-shrink-0
```
*Variations:*
- With absolute positioning: `absolute top-0 right-0 ... leading-none`
- For smaller badges: Use arbitrary values or create new token if needed

### Section Label Pattern (used 4+ times)
```
text-label font-medium text-gray-500 uppercase tracking-wider mb-1.5
```

### Icon Pattern (standard size - used 18+ times)
```
w-4 h-4 flex-shrink-0
```
*Always use with `flex-shrink-0` to prevent icon from shrinking*

### InboxCard Pattern
**Full pattern:**
```
w-full text-left bg-elevated rounded-md transition-all duration-150 border-2 border-base hover:border-elevated
```
**With selected state:**
```
border-selected (when selected) | border-base (when not selected)
```
**Card content:**
```
px-inbox-card py-inbox-card
flex items-start gap-inbox-icon
```
**Tag pattern (within cards):**
```
bg-tag text-tag text-label px-badge py-badge rounded
```

### InboxHeader Pattern (sticky header)
```
sticky top-0 z-10 bg-elevated border-b border-base px-inbox-header py-inbox-header
flex items-center justify-between
```
**Header title (subtle Linear-style naming):**
```
text-sm font-normal text-secondary
```
**Why:** Linear uses subtle, unobtrusive titles that don't dominate the UI. This pattern should be used for all section/page titles in headers.

**Header buttons:**
```
w-8 h-8 flex items-center justify-center rounded-md hover:bg-hover-solid transition-colors text-secondary hover:text-primary
```

### DropdownMenu Pattern (standard for all menus)
**✨ USE THIS PATTERN FOR ALL DROPDOWN MENUS**

**Menu Content:**
```
bg-elevated rounded-md shadow-lg border border-base min-w-[180px] py-1 z-50
```

**Menu Items:**
```
px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer focus:bg-hover-solid outline-none flex items-center gap-icon
```

**Menu Separator:**
```
my-1 border-t border-base
```

**Secondary text (keyboard shortcuts, hints):**
```
text-label text-tertiary
```

**Selected item indicator:**
- Use a checkmark icon (`w-4 h-4 text-secondary`) on the right side
- Do NOT use conditional background colors on DropdownMenu.Item (causes linter errors)
- Instead, show/hide checkmark based on selection state

**Complete Example:**
```svelte
<DropdownMenu.Content
  class="bg-elevated rounded-md shadow-lg border border-base min-w-[180px] py-1 z-50"
  side="bottom"
  align="start"
  sideOffset={4}
>
  <DropdownMenu.Item
    class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer focus:bg-hover-solid outline-none flex items-center gap-icon"
    textValue="Option"
    onSelect={() => handleSelect()}
  >
    <span class="flex-1">Option</span>
    {#if isSelected}
      <svg class="w-4 h-4 text-secondary flex-shrink-0" ...>
        <!-- checkmark icon -->
      </svg>
    {/if}
  </DropdownMenu.Item>
  
  <DropdownMenu.Separator class="my-1 border-t border-base" />
</DropdownMenu.Content>
```

**Why This Pattern:**
- ✅ Uses unified brand color tokens (auto light/dark mode)
- ✅ Consistent spacing using semantic tokens
- ✅ Same styling across all menus in the app
- ✅ Easy to maintain (change colors globally)

## Usage Guidelines

1. **When creating new components**, reference these patterns first
2. **If you need to deviate**, document why and consider adding a new pattern
3. **For spacing/padding**, prefer the defined tokens over arbitrary values
4. **For typography**, always use semantic sizes (`text-sm`, `text-label`) rather than arbitrary values like `text-[10px]`

