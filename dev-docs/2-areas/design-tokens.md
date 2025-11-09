# Design Tokens

This document defines our design system tokens used consistently throughout the application. All tokens support automatic light/dark mode adaptation.

> **See Also**: 
> - [Design Principles](design-principles.md) - Visual philosophy and UX principles (why we design this way)
> - [Component Architecture](component-architecture.md) - How tokens → utilities → patterns → components work together (how we implement)

## Typography

- **Nav Item Text**: `text-sm` (0.875rem / 14px)
- **Label/Badge Text**: `text-label` (0.625rem / 10px) - *custom token*
- **Section Label**: `text-label` with `uppercase tracking-wider`

### Readability Tokens (Optimized for ADHD/Focus-Challenged Users)

**✨ USE THESE TOKENS FOR READABLE CONTENT (QUOTES, HIGHLIGHTS, ARTICLES)**

| Token | Utility Class | Value | Usage |
|-------|--------------|-------|-------|
| `--line-height-readable` | `leading-readable` | 1.75 | Optimal line-height for comfortable reading (prevents visual crowding) |
| `--letter-spacing-readable` | `tracking-readable` | 0 (normal) | Normal letter spacing (not too tight) |
| `--max-width-readable` | `max-w-readable` | 42rem (672px) | Optimal reading width (65-75 characters per line) |
| `--spacing-readable-quote-y` | `py-readable-quote` | 2rem (32px) | Vertical padding for quote/highlight containers |

**Why:** These tokens are optimized based on typography best practices and ADHD-friendly reading guidelines:
- **Line height 1.75**: Provides generous breathing room between lines, reducing visual crowding
- **Normal tracking**: Avoids tight letter spacing that can strain focus
- **Max width 42rem**: Optimal line length prevents eye jumping and improves reading flow
- **Generous padding**: Creates visual space that helps maintain focus

**Example Usage:**
```html
<!-- Readable quote/highlight container -->
<div class="max-w-readable mx-auto px-inbox-container py-inbox-container">
  <div class="py-readable-quote bg-surface border-l-4 border-accent-primary rounded-lg">
    <p class="text-2xl sm:text-3xl text-primary leading-readable tracking-readable">
      Long-form readable content here...
    </p>
  </div>
</div>
```

**Benefits:**
- ✅ Optimized for ADHD and focus-challenged users
- ✅ Based on typography best practices (65-75 chars per line)
- ✅ Change readability settings globally by updating tokens
- ✅ Self-documenting (semantic names explain purpose)

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
| `--spacing-system-header-y` | `py-system-header` | 0.75rem (12px) | **System-level header/footer vertical padding** - Use for all header/footer borders |
| `--spacing-system-header-height` | `h-system-header` | 4rem (64px) | **FIXED total height for all headers** - Ensures border alignment regardless of content height |
| `--spacing-system-content-y` | `py-system-content` | 0.75rem (12px) | **System-level content vertical padding** - Use for content areas between borders to ensure alignment |
| `--spacing-inbox-container` | `p-inbox-container` | 1rem (16px) | Inbox container padding |
| `--spacing-inbox-card-x` | `px-inbox-card` | 0.75rem (12px) | Inbox card horizontal padding |
| `--spacing-inbox-card-y` | `py-inbox-card` | 0.75rem (12px) | Inbox card vertical padding |
| `--spacing-inbox-list-gap` | `gap-inbox-list` | 0.5rem (8px) | Gap between inbox cards |
| `--spacing-inbox-icon-gap` | `gap-inbox-icon` | 0.5rem (8px) | Icon-to-content gap in inbox cards |
| `--spacing-inbox-title-bottom` | `mb-inbox-title` | 1rem (16px) | Margin below inbox title |
| `--spacing-inbox-header-x` | `px-inbox-header` | 1rem (16px) | Inbox header horizontal padding |
| `--spacing-inbox-header-y` | `py-inbox-header` | 1rem (16px) | *Legacy token - headers now use py-system-header + h-system-header for alignment* |
| `--spacing-settings-section-gap` | `gap-settings-section` | 1.5rem (24px) | Gap between settings section cards |
| `--spacing-settings-row-gap` | `gap-settings-row` | 1rem (16px) | Vertical gap between setting rows |
| `--spacing-settings-row-padding-x` | `px-settings-row` | 1rem (16px) | Setting row horizontal padding |
| `--spacing-settings-row-padding-y` | `py-settings-row` | 1rem (16px) | Setting row vertical padding |
| `--spacing-readable-quote-y` | `py-readable-quote` | 2rem (32px) | Vertical padding for quote/highlight containers (readability optimized) |

### Button Spacing Tokens

| Token | Utility Class | Value | Usage |
|-------|--------------|-------|-------|
| `--spacing-button-x` | `px-button-x` | 1rem (16px) | Button horizontal padding |
| `--spacing-button-y` | `py-button-y` | 0.625rem (10px) | Button vertical padding |
| `--border-radius-button` | `rounded-button` | 0.375rem (6px) | Button border radius |

**Example Usage:**
```html
<!-- Primary button with design tokens -->
<button class="px-button-x py-button-y rounded-button bg-accent-primary text-white">
  Click me
</button>

<!-- Using the Button component (recommended) -->
<Button variant="primary" href="/login">Login</Button>
```

**See**: Button component (`src/lib/components/ui/Button.svelte`) for standardized button implementation.

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

### Scrollable Container Pattern (CRITICAL - prevents double scrollbars)
**✨ ALWAYS FOLLOW THIS PATTERN TO AVOID SCROLLBAR ALIGNMENT ISSUES**

**Rule 1: Never nest `overflow-y: auto` containers**
- Only the **innermost content element** should have `overflow-y: auto`
- Parent containers should NOT have `overflow` or `max-height`
- Scrollbar must render on content, not on padding

**Rule 2: Padding belongs on outer container, overflow on inner list**

**❌ WRONG - Double overflow (scrollbar on outer panel):**
```css
.panel {
  padding: 1.5rem;
  max-height: calc(100vh - 6rem);
  overflow-y: auto; /* ❌ Scrollbar includes padding */
}

.list {
  overflow-y: auto; /* ❌ Double nested overflow */
}
```

**✅ CORRECT - Single overflow (scrollbar on inner list):**
```css
.panel {
  padding: var(--spacing-control-panel-padding); /* ✅ Padding on outer */
  /* NO overflow, NO max-height */
}

.list {
  max-height: calc(100vh - 200px);
  overflow-y: auto; /* ✅ Scrollbar ONLY here */
  padding-right: 0.25rem; /* Small gap from edge */
}
```

**Why This Matters:**
- ✅ Scrollbar appears 12-20px from right edge (inside padding)
- ✅ More space for content (padding not included in scroll width)
- ✅ Consistent with design system (control panel tokens)
- ✅ Prevents "scrollbar too far right" bug

**Real Example (TableOfContents.svelte):**
```svelte
<aside class="toc-panel">  <!-- Outer container -->
  <nav class="toc">
    <ul class="toc-list">  <!-- Inner scrollable list -->
      <!-- items -->
    </ul>
  </nav>
</aside>

<style>
  .toc-panel.open {
    padding: var(--spacing-control-panel-padding); /* 12px */
    /* NO overflow, NO max-height */
  }
  
  .toc-list {
    max-height: calc(100vh - 200px);
    overflow-y: auto; /* Scrollbar ONLY here */
    padding-right: 0.25rem;
  }
</style>
```

**Utility Classes (Recommended):**

Use the pre-built utility classes for foolproof implementation:

```svelte
<aside class="toc-panel scrollable-outer">  <!-- Padding, NO overflow -->
  <nav class="toc">
    <ul class="toc-list scrollable-inner">  <!-- Overflow ONLY here -->
      <!-- items -->
    </ul>
  </nav>
</aside>
```

**Available Utilities:**
- `.scrollable-outer` - Applies `p-control-panel-padding` (12px), prevents outer overflow
- `.scrollable-inner` - Applies `max-height`, `overflow-y: auto`, `padding-right: 0.25rem`

**Token Usage (Manual CSS):**
- Use `--spacing-control-panel-padding` (12px) for control panels/toolbars/TOC
- Use `--spacing-content-padding` (24px) for general content areas
- Never use arbitrary multipliers like `calc(var(...) * 1.5)`

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

### Header/Footer Border Pattern (system-level alignment)
**✨ USE THIS FOR ALL HEADER/FOOTER BORDERS TO ENSURE PERFECT ALIGNMENT**

**⚠️ CRITICAL: All headers MUST use fixed height for border alignment**

**For header borders:**
```
border-b border-base py-system-header h-system-header flex items-center
```

**For footer borders:**
```
border-t border-base py-system-header h-system-header flex items-center
```

**For content areas between borders:**
```
py-system-content
```

**Why:** All headers use a **fixed height** (`h-system-header` = 64px) combined with `py-system-header` padding (12px) to ensure borders align perfectly across the entire application, regardless of content height differences. This guarantees that header borders are always at the same vertical position.

**Token Usage Rules (MANDATORY):**
- **`h-system-header`**: Use on **ALL** headers/footers with borders - This is the fixed height (64px) that ensures alignment
- **`py-system-header`**: Use for **ALL** header/footer padding (12px) - Provides consistent vertical spacing
- **`flex items-center`**: Required to vertically center content within the fixed height
- **`py-system-content`**: Use for content areas **between** header and footer borders (e.g., inside SyncReadwiseConfig)
- **`py-inbox-header`**: Legacy token - **DO NOT USE** for headers anymore. Headers now use `py-system-header + h-system-header`

**Example (header with border - REQUIRED PATTERN):**
```html
<div class="px-inbox-container py-system-header h-system-header border-b border-base flex items-center justify-between flex-shrink-0">
  <h3 class="text-sm font-normal text-secondary">Title</h3>
</div>
```

**Key Requirements:**
- ✅ **Always include `h-system-header`** - Fixed 64px height ensures border alignment
- ✅ **Always include `py-system-header`** - Consistent 12px vertical padding
- ✅ **Always include `flex items-center`** - Vertically centers content within fixed height
- ✅ **Border always aligns** - Fixed height guarantees borders at same position

**Example (content between borders):**
```html
<div class="flex-1 overflow-y-auto px-inbox-container py-system-content">
  <!-- Content here -->
</div>
```

**Example (footer with border - REQUIRED PATTERN):**
```html
<div class="px-inbox-container py-system-header h-system-header border-t border-base flex items-center justify-end gap-2 flex-shrink-0">
  <button>Cancel</button>
  <button>Save</button>
</div>
```

### InboxHeader Pattern (sticky header)
```
sticky top-0 z-10 bg-surface border-b border-base px-inbox-header py-system-header h-system-header
flex items-center justify-between
```

**Note:** Now uses `py-system-header + h-system-header` like all other headers for perfect alignment. The fixed height system ensures borders align regardless of content differences.
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

## Control Panel Tokens

**✨ USE THESE TOKENS FOR TOOLBARS, POPOVERS, AND CONTROL PANELS**

Control panel tokens are designed for building Notion-style control interfaces across features. All control panels use the same design system for consistency.

### Control Panel Spacing Tokens

| Token | Utility Class | Value | Usage |
|-------|--------------|-------|-------|
| `--spacing-control-panel-padding` | `p-control-panel-padding` | 0.75rem (12px) | Panel container padding |
| `--spacing-control-group-gap` | `gap-control-group` | 0.5rem (8px) | Gap between control groups |
| `--spacing-control-item-gap` | `gap-control-item-gap` | 0.25rem (4px) | Gap between buttons in group |
| `--spacing-control-button-padding` | `p-control-button-padding` | 0.5rem (8px) | Button padding (square) |
| `--spacing-control-divider` | `mx-control-divider` | 0.5rem (8px) | Margin around dividers |

### Control Panel Color Tokens

| Token | Utility Class | Value | Usage |
|-------|--------------|-------|-------|
| `--color-control-bg` | `bg-control` | var(--color-bg-elevated) | Panel background |
| `--color-control-border` | `border-control-border` | var(--color-border-base) | Panel border |
| `--color-control-button-hover` | `bg-control-button-hover` | var(--color-bg-hover-solid) | Button hover state |
| `--color-control-button-active` | `bg-control-button-active` | var(--color-bg-selected) | Active button state |
| `--color-control-divider` | `bg-control-divider` | var(--color-border-base) | Divider color |

### Control Panel Components

Use the pre-built control panel components instead of building custom toolbars:

```svelte
import * as ControlPanel from '$lib/components/control-panel';

<!-- Toolbar (fixed header) -->
<ControlPanel.Root variant="toolbar">
  <ControlPanel.Group>
    <ControlPanel.Button active={isBold} onclick={toggleBold}>
      <BoldIcon />
    </ControlPanel.Button>
  </ControlPanel.Group>
</ControlPanel.Root>

<!-- Popover (contextual) -->
<ControlPanel.Root variant="popover" bind:open={popoverOpen}>
  {#snippet trigger()}
    <button>Options</button>
  {/snippet}
  <ControlPanel.Group label="Settings">
    <ControlPanel.Button onclick={handleAction}>
      <Icon />
    </ControlPanel.Button>
  </ControlPanel.Group>
</ControlPanel.Root>

<!-- Embedded (inline) -->
<ControlPanel.Root variant="embedded">
  <ControlPanel.Button onclick={handleAction}>
    <Icon /> Action
  </ControlPanel.Button>
</ControlPanel.Root>
```

**Benefits:**
- ✅ Three variants: toolbar, popover, embedded
- ✅ Consistent design across all control panels
- ✅ Product teams own content, design system owns components
- ✅ All buttons use design tokens (no hardcoded values)
- ✅ ESC key automatically closes popovers (Bits UI)

**See Pattern**: [ui-patterns.md#L620](patterns/ui-patterns.md#L620)

### Modal & Form Patterns
**✨ USE THESE PATTERNS FOR ALL MODALS AND FORMS**

**Modal Container:**
```
bg-elevated rounded-modal border border-base/30 shadow-lg p-content-padding
```

**Form Field (Label + Input):**
```
flex flex-col gap-form-field
```

**Form Section Gap (between field groups):**
```
gap-content-section
```

**Modal Action Buttons:**
```
flex justify-end gap-button-group pt-content-section border-t border-base
```

**Example Modal Form:**
```svelte
<Dialog.Content class="bg-elevated rounded-modal border border-base/30 shadow-lg p-content-padding">
  <Dialog.Title class="text-xl font-medium text-primary mb-heading">
    Create Note
  </Dialog.Title>
  
  <div class="flex flex-col gap-content-section mt-content-section">
    <FormInput label="Title" placeholder="Enter title..." bind:value={title} />
    <FormTextarea label="Content" rows={6} bind:value={content} />
    
    <div class="flex justify-end gap-button-group pt-content-section border-t border-base">
      <button class="rounded-button px-button-x py-button-y">Cancel</button>
      <button class="rounded-button bg-accent-primary px-button-x py-button-y">Create</button>
    </div>
  </div>
</Dialog.Content>
```

### Atomic Component Patterns

**Button Component:**
Always use `<Button>` component instead of raw `<button>` or `<a>` tags for actions and navigation. This ensures consistent styling using design tokens.

```svelte
<!-- ❌ Don't do this -->
<button class="px-4 py-2 bg-blue-600 text-white rounded">Click me</button>
<a href="/login" class="px-4 py-2 border border-gray-200 rounded">Login</a>

<!-- ✅ Do this -->
<Button variant="primary" onclick={handleClick}>Click me</Button>
<Button variant="secondary" href="/login">Login</Button>
```

**Variants:**
- `primary` - Blue filled button for primary actions (Register, Submit, etc.)
- `secondary` - Outlined button for secondary actions (Login, Cancel, etc.)

**Keyboard Shortcut Badge:**
Use `<KeyboardShortcut keys="C" />` or `<KeyboardShortcut keys={['Cmd', 'K']} />` instead of hardcoding shortcuts. When you change the shortcut from 'C' to 'A', it updates everywhere automatically.

**Form Inputs:**
Always use `<FormInput>` and `<FormTextarea>` components instead of raw `<input>` or `<textarea>`. This ensures consistent styling across the app using design tokens.

```svelte
<!-- ❌ Don't do this -->
<input class="rounded-input border border-base bg-input px-input-x py-input-y" />

<!-- ✅ Do this -->
<FormInput label="Title" placeholder="Enter title..." bind:value={title} />
```

## Usage Guidelines

1. **When creating new components**, reference these patterns first
2. **If you need to deviate**, document why and consider adding a new pattern
3. **For spacing/padding**, prefer the defined tokens over arbitrary values
4. **For typography**, always use semantic sizes (`text-sm`, `text-label`) rather than arbitrary values like `text-[10px]`
5. **For buttons**, always use `<Button>` component for consistent styling
6. **For keyboard shortcuts**, always use `<KeyboardShortcut>` component for consistency
7. **For form inputs**, always use `<FormInput>` and `<FormTextarea>` components

