# Design Tokens

This document defines our design system tokens used consistently throughout the application. All tokens support automatic light/dark mode adaptation.

> **See Also**:
>
> - [Design Principles](design-principles.md) - Visual philosophy and UX principles (why we design this way)
> - [Component Architecture](component-architecture.md) - How tokens → utilities → patterns → components work together (how we implement)

---

## 🛡️ Design System Governance

**⚠️ CRITICAL: Hardcoded Tailwind values are BLOCKED**

As of November 2025 (SYOS-385, SYOS-386), the design system enforces token usage automatically:

### **Automated Enforcement**

- ✅ **ESLint Plugin**: `eslint-plugin-better-tailwindcss` blocks arbitrary values like `min-h-[2.75rem]`, `p-[12px]`, `w-[44px]`
- ✅ **Pre-commit Hook**: Git hook prevents committing hardcoded Tailwind values (blocks before commit)
- ✅ **CI Validation**: GitHub Actions runs `npm run lint` - PRs blocked if violations detected
- ✅ **Test Files Exempted**: `*.test.*` and `*.spec.*` files allowed to use hardcoded values for mocking

**Example Error Message:**

```bash
❌ Hardcoded Tailwind value detected in: Button.svelte
   Pattern: class="...[value]"

Replace with design token utility:
   - min-h-[2.75rem] → min-h-button (add to app.css)
   - p-[12px] → p-button-icon (already exists)

See: dev-docs/2-areas/design/design-tokens.md
```

### **How to Add New Tokens**

**Step 1: Check if token exists**

```bash
# Search app.css for existing token
grep -r "spacing-my-component" src/app.css
```

**Step 2: Add to `app.css` @theme block**

```css
/* src/app.css */
@theme {
  /* ... existing tokens ... */
  
  /* My Component Tokens */
  --spacing-my-component-x: 1rem; /* 16px - horizontal padding */
  --spacing-my-component-y: 0.75rem; /* 12px - vertical padding */
}
```

**Step 3: Create utility class**

```css
/* src/app.css */
@utility px-my-component {
  padding-inline: var(--spacing-my-component-x);
}

@utility py-my-component {
  padding-block: var(--spacing-my-component-y);
}
```

**Step 4: Document in this file**

Add token to appropriate section below with description and usage examples.

**Step 5: Update `design-system-test.json`**

Our design system spec file (`design-system-test.json`) is the **source of truth** for token values, descriptions, and design decisions. Always update it when adding new tokens.

### **Source of Truth Hierarchy**

1. **design-system-test.json**: Token specifications, values, descriptions (WHAT and WHY)
2. **src/app.css**: Token implementation - CSS variables + utility classes (HOW)
3. **This file (design-tokens.md)**: Token documentation and usage examples (WHEN and WHERE)

### **Token Validation Tools**

- **ESLint**: Immediate feedback in editor (red squiggles)
- **Pre-commit Hook**: Blocks git commit if violations detected
- **CI Pipeline**: Final validation before merge (`npm run lint`)
- **Style Dictionary** (Phase 3): Validates token → utility mapping

### **Common Violations**

❌ **BLOCKED - Will fail lint:**

```html
<!-- Hardcoded sizes -->
<button class="min-h-[2.75rem]">Click</button>
<div class="p-[12px]">Content</div>
<span class="w-[44px] h-[44px]">Icon</span>

<!-- Hardcoded spacing -->
<div class="mt-[24px] mb-[16px]">Content</div>
```

✅ **CORRECT - Uses tokens:**

```html
<!-- Token-based sizes -->
<button class="min-h-button">Click</button>
<div class="p-button-icon">Content</div>
<span class="icon-xl">Icon</span>

<!-- Token-based spacing -->
<div class="mt-content-padding mb-marketing-text">Content</div>
```

### **Acceptable Exceptions**

Some patterns are **intentionally allowed** and do not violate design system principles:

✅ **1. Functional CSS Properties** (behavior, not design):

```svelte
<!-- ✅ ACCEPTABLE - Semantic CSS properties -->
<div style="word-break: break-word; overflow-wrap: anywhere;">
  {longUserGeneratedText}
</div>

<!-- Other acceptable functional properties: -->
<!-- display, position, z-index, cursor, pointer-events, user-select -->
```

**Rationale**: These control **behavior** (text wrapping, layout), not **visual design** (colors, spacing). Design tokens are for visual design values only.

✅ **2. Dynamic Values from API/Database** (runtime user-provided):

```svelte
<!-- ✅ ACCEPTABLE - Dynamic color from user/API -->
<Avatar color={user.avatarColor} />
<div style="background-color: {project.color}">
  {project.name}
</div>

<!-- Found in: Avatar.svelte, ProjectSelector.svelte, AssigneeSelector.svelte -->
```

**Rationale**: Runtime/user-provided values **cannot reference design tokens** - they are dynamic and user-controlled. This is standard in all design systems (Material UI, Chakra UI, etc.).

✅ **3. Animation/Transform Properties** (state-driven calculations):

```svelte
<!-- ✅ ACCEPTABLE - Calculated transform -->
<div style="transform: translateX({offset}px)">
  Animated element
</div>

<!-- Other acceptable animation properties: -->
<!-- animation-delay, transition-delay, transform (when calculated) -->
```

**Rationale**: State-driven or calculated values that change based on props/state cannot use static tokens.

---

## Typography

- **Nav Item Text**: `text-sm` (0.875rem / 14px)
- **Label/Badge Text**: `text-label` (0.625rem / 10px) - _custom token_
- **Section Label**: `text-label` with `uppercase tracking-wider`

### Readability Tokens (Optimized for ADHD/Focus-Challenged Users)

**✨ USE THESE TOKENS FOR READABLE CONTENT (QUOTES, HIGHLIGHTS, ARTICLES)**

| Token                        | Utility Class       | Value         | Usage                                                                  |
| ---------------------------- | ------------------- | ------------- | ---------------------------------------------------------------------- |
| `--line-height-readable`     | `leading-readable`  | 1.75          | Optimal line-height for comfortable reading (prevents visual crowding) |
| `--letter-spacing-readable`  | `tracking-readable` | 0 (normal)    | Normal letter spacing (not too tight)                                  |
| `--max-width-readable`       | `max-w-readable`    | 42rem (672px) | Optimal reading width (65-75 characters per line)                      |
| `--spacing-readable-quote-y` | `py-readable-quote` | 2rem (32px)   | Vertical padding for quote/highlight containers                        |

**Why:** These tokens are optimized based on typography best practices and ADHD-friendly reading guidelines:

- **Line height 1.75**: Provides generous breathing room between lines, reducing visual crowding
- **Normal tracking**: Avoids tight letter spacing that can strain focus
- **Max width 42rem**: Optimal line length prevents eye jumping and improves reading flow
- **Generous padding**: Creates visual space that helps maintain focus

**Example Usage:**

```html
<!-- Readable quote/highlight container -->
<div class="mx-auto max-w-readable px-inbox-container py-inbox-container">
	<div class="rounded-lg border-l-4 border-accent-primary bg-surface py-readable-quote">
		<p class="text-2xl leading-readable tracking-readable text-primary sm:text-3xl">
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

**Application UI Tokens:**

| Token                              | Utility Class          | Value           | Usage                                                                                                 |
| ---------------------------------- | ---------------------- | --------------- | ----------------------------------------------------------------------------------------------------- |
| `--spacing-nav-container-x`        | `px-nav-container`     | 0.5rem (8px)    | Nav container horizontal padding                                                                      |
| `--spacing-nav-container-y`        | `py-nav-container`     | 0.5rem (8px)    | Nav container vertical padding                                                                        |
| `--spacing-nav-item-x`             | `px-nav-item`          | 0.5rem (8px)    | Nav item horizontal padding                                                                           |
| `--spacing-nav-item-y`             | `py-nav-item`          | 0.375rem (6px)  | Nav item vertical padding                                                                             |
| `--spacing-menu-item-x`            | `px-menu-item`         | 0.625rem (10px) | Menu/dropdown item horizontal padding                                                                 |
| `--spacing-menu-item-y`            | `py-menu-item`         | 0.375rem (6px)  | Menu/dropdown item vertical padding                                                                   |
| `--spacing-section-x`              | `px-section`           | 0.5rem (8px)    | Section horizontal padding                                                                            |
| `--spacing-section-y`              | `py-section`           | 0.25rem (4px)   | Section vertical padding                                                                              |
| `--spacing-badge-x`                | `px-badge`             | 0.375rem (6px)  | Badge horizontal padding                                                                              |
| `--spacing-badge-y`                | `py-badge`             | 0.125rem (2px)  | Badge vertical padding                                                                                |
| `--spacing-header-x`               | `px-header`            | 0.75rem (12px)  | Header horizontal padding                                                                             |
| `--spacing-header-y`               | `py-header`            | 0.625rem (10px) | Header vertical padding                                                                               |
| `--spacing-icon-gap`               | `gap-icon`             | 0.5rem (8px)    | Standard icon-text gap                                                                                |
| `--spacing-icon-gap-wide`          | `gap-icon-wide`        | 0.625rem (10px) | Wider icon-text gap                                                                                   |
| `--spacing-indent`                 | `pl-indent`            | 1.5rem (24px)   | Left padding for nested/indented items                                                                |
| `--spacing-system-header-y`        | `py-system-header`     | 0.75rem (12px)  | **System-level header/footer vertical padding** - Use for all header/footer borders                   |
| `--spacing-system-header-height`   | `h-system-header`      | 4rem (64px)     | **FIXED total height for all headers** - Ensures border alignment regardless of content height        |
| `--spacing-system-content-y`       | `py-system-content`    | 0.75rem (12px)  | **System-level content vertical padding** - Use for content areas between borders to ensure alignment |
| `--spacing-inbox-container`        | `p-inbox-container`    | 1rem (16px)     | Inbox container padding                                                                               |
| `--spacing-inbox-card-x`           | `px-inbox-card`        | 0.75rem (12px)  | Inbox card horizontal padding                                                                         |
| `--spacing-inbox-card-y`           | `py-inbox-card`        | 0.75rem (12px)  | Inbox card vertical padding                                                                           |
| `--spacing-inbox-list-gap`         | `gap-inbox-list`       | 0.5rem (8px)    | Gap between inbox cards                                                                               |
| `--spacing-inbox-icon-gap`         | `gap-inbox-icon`       | 0.5rem (8px)    | Icon-to-content gap in inbox cards                                                                    |
| `--spacing-inbox-title-bottom`     | `mb-inbox-title`       | 1rem (16px)     | Margin below inbox title                                                                              |
| `--spacing-inbox-header-x`         | `px-inbox-header`      | 1rem (16px)     | Inbox header horizontal padding                                                                       |
| `--spacing-inbox-header-y`         | `py-inbox-header`      | 1rem (16px)     | _Legacy token - headers now use py-system-header + h-system-header for alignment_                     |
| `--spacing-settings-section-gap`   | `gap-settings-section` | 1.5rem (24px)   | Gap between settings section cards                                                                    |
| `--spacing-settings-row-gap`       | `gap-settings-row`     | 1rem (16px)     | Vertical gap between setting rows                                                                     |
| `--spacing-settings-row-padding-x` | `px-settings-row`      | 1rem (16px)     | Setting row horizontal padding                                                                        |
| `--spacing-settings-row-padding-y` | `py-settings-row`      | 1rem (16px)     | Setting row vertical padding                                                                          |
| `--spacing-readable-quote-y`       | `py-readable-quote`    | 2rem (32px)     | Vertical padding for quote/highlight containers (readability optimized)                               |

**Marketing Page Tokens:**

✨ **USE THESE FOR ALL MARKETING/CONTENT PAGES** (landing pages, blog posts, documentation)

| Token                                 | Utility Class                | Value           | Usage                                                  |
| ------------------------------------- | ---------------------------- | --------------- | ------------------------------------------------------ |
| `--spacing-marketing-section-y`       | `py-marketing-section`       | 7rem (112px)    | **Section vertical padding** (top and bottom)          |
| `--spacing-marketing-section-gap`     | `gap-marketing-section`      | 5rem (80px)     | **Gap between major sections** (when stacked)          |
| `--spacing-marketing-container-x`     | `px-marketing-container`     | 1.5rem (24px)   | **Page horizontal padding** (mobile/desktop)           |
| `--spacing-marketing-title-to-lead`   | `mb-marketing-title-to-lead` | 1.5rem (24px)   | **H2 to lead paragraph** spacing                       |
| `--spacing-marketing-lead-to-content` | `mt-marketing-content`       | 3rem (48px)     | **Lead paragraph to content** spacing                  |
| `--spacing-marketing-card-padding`    | `p-marketing-card`           | 2.5rem (40px)   | **Card internal padding**                              |
| `--spacing-marketing-card-gap`        | `gap-marketing-card`         | 2rem (32px)     | **Gap between cards in grid**                          |
| `--spacing-marketing-element-gap`     | `gap-marketing-element`      | 1.5rem (24px)   | **Gap between related elements** (badges, buttons)     |
| `--spacing-marketing-text-gap`        | `gap-marketing-text`         | 1rem (16px)     | **Gap between text elements** (title to description)   |
| `--spacing-marketing-hero-y`          | `py-marketing-hero`          | 5rem (80px)     | **Hero section vertical padding** (top)                |
| `--spacing-marketing-hero-bottom`     | `pb-marketing-hero`          | 8rem (128px)    | **Hero section vertical padding** (bottom - extended)  |
| `--spacing-marketing-cta-gap`         | `gap-marketing-cta`          | 1rem (16px)     | **Gap between CTA buttons**                            |
| `--spacing-marketing-badge-gap`       | `gap-marketing-badge`        | 0.75rem (12px)  | **Gap between trust badges**                           |
| `--spacing-marketing-list-gap`        | `gap-marketing-list`         | 0.875rem (14px) | **Gap between list items** (bullet points, checkmarks) |

**Why These Tokens:**

- **Consistent vertical rhythm**: All major sections use 7rem (112px) padding
- **Clear hierarchy**: H2 → lead (1.5rem) → content (3rem) creates predictable spacing
- **Reusable**: Change spacing globally by updating one token
- **Semantic names**: "title-to-lead" is clearer than "spacing-6"
- **Mobile-friendly**: Tokens work at all screen sizes

**Usage Pattern:**

✅ **CORRECT - Use utility classes in HTML/Svelte:**

```html
<!-- Section with consistent padding -->
<section class="py-marketing-section">
	<div class="mx-auto max-w-5xl px-marketing-container">
		<!-- Title with proper spacing to lead -->
		<h2 class="mb-marketing-title-to-lead text-center text-primary">Our Vision</h2>

		<!-- Lead with proper spacing to content -->
		<p class="mb-marketing-content text-center text-secondary">Building the future...</p>

		<!-- Card grid with proper gaps -->
		<div class="grid grid-cols-1 gap-marketing-card md:grid-cols-2">
			<!-- Cards with proper padding -->
			<div class="rounded-lg bg-elevated p-marketing-card">
				<h3 class="mb-marketing-text text-primary">Feature Title</h3>
				<p class="text-secondary">Description...</p>
			</div>
		</div>
	</div>
</section>
```

❌ **AVOID - Don't use CSS variables directly in `<style>` blocks:**

```css
<style>
  .my-section {
    padding: var(--spacing-marketing-section-y) 0; /* ❌ Don't do this */
  }
</style>
```

**Why use utility classes:**

- ✅ Works across all pages (just add class in HTML)
- ✅ No need for `<style>` blocks in every component
- ✅ Consistent with the rest of the design system
- ✅ Easier to maintain (change once in `app.css`)
- ✅ Better for code review (spacing visible in markup)

### Button Component Tokens

| Token                    | Utility Class    | Value          | Usage                            |
| ------------------------ | ---------------- | -------------- | -------------------------------- |
| `--spacing-button-x`     | `px-button-x`    | 1.5rem (24px)  | Button horizontal padding        |
| `--spacing-button-y`     | `py-button-y`    | 0.75rem (12px) | Button vertical padding          |
| `--spacing-button-icon`  | `p-button-icon`  | 0.75rem (12px) | Icon-only button padding (square)|
| `--size-button-height`   | `min-h-button`   | 2.75rem (44px) | Minimum button height (all types)|
| `--border-radius-button` | `rounded-button` | 0.5rem (8px)   | Button border radius             |
| `--font-size-button`     | `text-button`    | 0.875rem (14px)| Button font size                 |
| `--font-weight-button`   | `text-button`    | 600            | Button font weight               |

**Why `--size-button-height`:** Ensures icon-only buttons match text button height (consistent alignment in flex containers).

**Example Usage:**

```html
<!-- Text button with design tokens -->
<button class="rounded-button bg-accent-primary px-button-x py-button-y text-button text-white min-h-button">
  Click me
</button>

<!-- Icon-only button (square padding, same height) -->
<button class="rounded-button bg-elevated p-button-icon min-h-button">
  <svg class="icon-md">...</svg>
</button>

<!-- Using the Button component (recommended) -->
<Button variant="primary" href="/login">Login</Button>
<Button variant="secondary" iconOnly ariaLabel="Download">
  <svg class="icon-md">...</svg>
</Button>
```

**See**: Button component (`src/lib/components/atoms/Button.svelte`) for standardized button implementation.

---

## Component Tokens (SYOS-353 - Nov 2025)

### ✨ NEW TOKENS FOR ATOMIC COMPONENTS

These tokens were added as part of the Design System Foundation (SYOS-353, SYOS-355, SYOS-356) to align with `design-system-test.json` specifications.

### Card Component Tokens

| Token                       | Utility Class       | Value                         | Usage                         |
| --------------------------- | ------------------- | ----------------------------- | ----------------------------- |
| `--border-radius-card`      | `rounded-card`      | 0.875rem (14px)               | Card border radius            |
| `--shadow-card`             | `shadow-card`       | Multiple layers (2px, 8px)    | Card shadow (default)         |
| `--shadow-card-hover`       | `shadow-card-hover` | Multiple layers (4px, 16px)   | Card shadow (hover state)     |
| `--spacing-card-padding-x`  | `px-card`           | 1.25rem (20px)                | Card horizontal padding       |
| `--spacing-card-padding-y`  | `py-card`           | 1.25rem (20px)                | Card vertical padding         |

**Example Usage:**

```html
<div class="rounded-card shadow-card hover:shadow-card-hover px-card py-card bg-elevated">
  Card content here
</div>
```

### Badge Component Tokens

| Token                  | Utility Class  | Value           | Usage              |
| ---------------------- | -------------- | --------------- | ------------------ |
| `--border-radius-badge`| `rounded-badge`| 0.25rem (4px)   | Badge border radius|
| `--font-size-badge`    | `text-badge`   | 0.75rem (12px)  | Badge font size    |
| `--font-weight-badge`  | `text-badge`   | 500             | Badge font weight  |

**Example Usage:**

```html
<span class="rounded-badge text-badge bg-tag text-tag px-badge py-badge">
  New
</span>
```

### Chip Component Tokens

**⚠️ Important: Chip vs Badge Distinction**

| Component | Purpose | Interaction | Padding |
|-----------|---------|-------------|---------|
| **Badge** | Static status indicator | Non-interactive | 6px horizontal (compact) |
| **Chip** | Removable filter pill | Interactive (close button) | 12px horizontal (larger touch target) |

**When to use:**
- **Badge**: Status labels, system indicators, non-removable tags
- **Chip**: Filter pills, removable tags, interactive labels with delete functionality

**Context 7 validation**: Material UI, Chakra UI, and Shadcn UI all distinguish between Badge (static) and Chip/Tag (interactive removable).

| Token                  | Utility Class  | Value           | Usage              |
| ---------------------- | -------------- | --------------- | ------------------ |
| `--spacing-chip-x`     | `px-chip`      | 0.75rem (12px)  | Chip horizontal padding (2x Badge) |
| `--spacing-chip-y`     | `py-chip`       | 0.25rem (4px)   | Chip vertical padding |
| `--border-radius-chip` | `rounded-chip` | 9999px (full)    | Chip border radius (pill shape) |
| `--font-size-chip`     | `text-chip`     | 0.875rem (14px) | Chip font size (text-sm) |
| `--font-weight-chip`   | `text-chip`     | 500             | Chip font weight |

**Example Usage:**

```svelte
<!-- Removable filter pill -->
<Chip
	label="Active"
	variant="default"
	onDelete={() => removeFilter('active')}
/>

<!-- Read-only chip (no onDelete) -->
<Chip label="Read-only" variant="primary" />
```

**Key Differences from Badge:**
- **Larger padding**: Chip uses 12px horizontal (vs Badge 6px) for better touch targets
- **Pill shape**: Chip uses `rounded-chip` (full radius) vs Badge `rounded-badge` (4px)
- **Interactive**: Chip supports `onDelete` prop for removable functionality
- **Accessibility**: Remove button uses `p-button-icon` (44x44px minimum) for WCAG compliance

### Dialog Component Tokens

| Token                      | Utility Class      | Value          | Usage                        |
| -------------------------- | ------------------ | -------------- | ---------------------------- |
| `--max-width-dialog-default`| `max-w-dialog`    | 32rem (512px)  | Default dialog width         |
| `--max-width-dialog-wide`  | `max-w-dialog-wide`| 56rem (896px)  | Wide dialog width            |
| `--border-radius-dialog`   | `rounded-dialog`   | 0.875rem (14px)| Dialog border radius (=card) |

**Example Usage:**

```html
<Dialog.Content class="max-w-dialog rounded-dialog bg-elevated shadow-xl">
	Dialog content
</Dialog.Content>
```

### Dialog Close Button Utility

**Utility Class**: `dialog-close-button`

**Purpose**: Standardized styling for icon close buttons in dialog headers (top-right corner). Use this for primary dismiss actions that are always visible.

**Usage:**

```svelte
<Dialog.Close
	type="button"
	onclick={onClose}
	class="dialog-close-button"
>
	<svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M6 18L18 6M6 6l12 12"
		/>
	</svg>
</Dialog.Close>
```

**Tokens Used**:
- `--spacing-button-icon`: Padding (0.75rem / 12px)
- `--size-button-height`: Min height/width (2.75rem / 44px) - accessibility minimum
- `--border-radius-button`: Border radius (0.5rem / 8px)
- `--transition-colors`: Smooth color transitions
- `--color-text-secondary`: Default text color
- `--color-text-primary`: Hover text color
- `--color-bg-hover-solid`: Hover background color

**Patterns**:

**Pattern A: Icon Close Button (Header)** - Use `dialog-close-button` utility
- Location: Top-right corner of dialog header
- Purpose: Primary/only dismiss action, always visible
- Visual: X icon, minimal visual weight

**Pattern B: Text Close Button (Footer)** - Use regular button styling
- Location: Dialog footer with other action buttons
- Purpose: Secondary dismiss action alongside primary button ("Cancel" | "Save")
- Visual: Text label ("Cancel", "Close"), styled like regular button
- Example: RBAC dialogs use `rounded-md border border-base px-3 py-1.5 text-sm`

### Accordion Component Tokens

| Token                         | Utility Class      | Value          | Usage                       |
| ----------------------------- | ------------------ | -------------- | --------------------------- |
| `--spacing-accordion-padding-x`| `px-accordion`    | 1rem (16px)    | Accordion horizontal padding|
| `--spacing-accordion-padding-y`| `py-accordion`    | 0.75rem (12px) | Accordion vertical padding  |
| `--spacing-accordion-gap`     | `gap-accordion`    | 0.5rem (8px)   | Gap between accordion items |

### Avatar Component Tokens

| Token              | Utility Class    | Value          | Usage                |
| ------------------ | ---------------- | -------------- | -------------------- |
| `--size-avatar-sm` | `size-avatar-sm` | 2rem (32px)    | Small avatar (32px)  |
| `--size-avatar-md` | `size-avatar-md` | 2.5rem (40px)  | Medium avatar (40px) |
| `--size-avatar-lg` | `size-avatar-lg` | 3rem (48px)    | Large avatar (48px)  |

**Example Usage:**

```html
<img src="/avatar.jpg" class="size-avatar-md rounded-full" alt="User" />
```

### Tabs Component Tokens

| Token                       | Utility Class           | Value          | Usage                       |
| --------------------------- | ----------------------- | -------------- | --------------------------- |
| `--size-tab-height`         | `size-tab`              | 2.5rem (40px)  | Tab container height        |
| `--spacing-tab-padding-x`   | `px-tab`                | 0.75rem (12px) | Tab item horizontal padding |
| `--spacing-tab-padding-y`   | `py-tab`                | 0.375rem (6px) | Tab item vertical padding   |
| `--border-radius-tab-container`| `rounded-tab-container`| 0.5rem (8px)  | Tab container border radius |
| `--border-radius-tab-item`  | `rounded-tab-item`      | 0.125rem (2px) | Tab item border radius      |

---

## Typography Scale Tokens (SYOS-353)

**✨ SEMANTIC TYPOGRAPHY TOKENS**

Use these instead of arbitrary `text-[XXpx]` values.

| Token             | Utility Class | Value           | Usage                          |
| ----------------- | ------------- | --------------- | ------------------------------ |
| `--font-size-h1`  | `text-h1`     | 2.25rem (36px)  | H1 headings + font-weight-h1   |
| `--font-size-h2`  | `text-h2`     | 1.75rem (28px)  | H2 headings + font-weight-h2   |
| `--font-size-h3`  | `text-h3`     | 1.25rem (20px)  | H3 headings + font-weight-h3   |
| `--font-size-body`| `text-body`   | 1rem (16px)     | Body text                      |
| `--font-size-small`|`text-small`  | 0.875rem (14px) | Small text                     |
| `--font-weight-h1`| `text-h1`     | 700             | H1 font weight (bold)          |
| `--font-weight-h2`| `text-h2`     | 600             | H2 font weight (semibold)      |
| `--font-weight-h3`| `text-h3`     | 600             | H3 font weight (semibold)      |

**Example Usage:**

```html
<h1 class="text-h1 text-primary">Page Title</h1>
<h2 class="text-h2 text-primary">Section Title</h2>
<p class="text-body text-secondary">Body text content here</p>
<span class="text-small text-tertiary">Small helper text</span>
```

**Benefits:**
- ✅ Change font sizes globally by updating one token
- ✅ Consistent typography scale across entire app
- ✅ Self-documenting (semantic names explain hierarchy)

---

## Icon Size Tokens (SYOS-353)

**✨ SEMANTIC ICON SIZES**

Use these instead of `w-X h-X` hardcoded values.

| Token            | Utility Class | Value          | Usage                    |
| ---------------- | ------------- | -------------- | ------------------------ |
| `--size-icon-sm` | `icon-sm`     | 1rem (16px)    | Small icons              |
| `--size-icon-md` | `icon-md`     | 1.25rem (20px) | Medium icons (standard)  |
| `--size-icon-lg` | `icon-lg`     | 1.5rem (24px)  | Large icons              |
| `--size-icon-xl` | `icon-xl`     | 2rem (32px)    | Extra large icons        |

**Example Usage:**

```html
<!-- Icon in button -->
<button class="flex items-center gap-icon">
	<svg class="icon-md">...</svg>
	<span>Click me</span>
</button>

<!-- Icon-only button -->
<button class="p-button-icon">
	<svg class="icon-md">...</svg>
</button>

<!-- Large header icon -->
<div class="flex items-center gap-icon-wide">
	<svg class="icon-xl text-accent-primary">...</svg>
	<h1 class="text-h1">Title</h1>
</div>
```

**Benefits:**
- ✅ Change icon sizes globally
- ✅ Consistent icon sizing across entire app
- ✅ No more `w-4 h-4`, `w-5 h-5` guessing

---

## Transition Tokens (SYOS-353)

**✨ SEMANTIC TRANSITION DURATIONS**

Use these instead of `transition-all duration-XXX` hardcoded values.

| Token                      | Utility Class           | Value                     | Usage                          |
| -------------------------- | ----------------------- | ------------------------- | ------------------------------ |
| `--transition-default`     | `transition-default`    | all 0.2s ease             | Default transition (all props) |
| `--transition-slow`        | `transition-slow`       | all 0.3s ease-in-out      | Slow transition (animations)   |
| `--transition-fast`        | `transition-fast`       | all 0.15s ease            | Fast transition (micro-interactions)|
| `--transition-colors-token`| `transition-colors-token`| background, border, color, etc. | Color transitions only (optimized)|

**Example Usage:**

```html
<!-- Button with color transition -->
<button class="bg-accent-primary hover:bg-accent-hover transition-colors-token">
	Hover me
</button>

<!-- Card with default transition (shadow, transform) -->
<div class="shadow-card hover:shadow-card-hover transition-default">
	Card content
</div>

<!-- Slow transition for animations -->
<div class="transform scale-100 hover:scale-105 transition-slow">
	Animated content
</div>
```

**Benefits:**
- ✅ Consistent transition timings across app
- ✅ Optimized performance (`transition-colors-token` only animates colors)
- ✅ Change timings globally by updating one token

---

## Token Migration Guide (Nov 2025)

### Button Token Consolidation

**What Changed:**
- Button tokens updated to match `design-system-test.json` specification (8px radius, 12px×24px padding)
- Conflicting `button-primary-*` tokens removed
- Single naming convention: `button-*` (not `button-primary-*`)

**Old naming → New consolidated naming:**

| Old Token Name                  | New Token Name           | Old Value      | New Value      |
| ------------------------------- | ------------------------ | -------------- | -------------- |
| `--spacing-button-primary-x`    | `--spacing-button-x`     | 1.5rem (24px)  | 1.5rem (24px)  |
| `--spacing-button-primary-y`    | `--spacing-button-y`     | 0.75rem (12px) | 0.75rem (12px) |
| `--border-radius-button-primary`| `--border-radius-button` | 0.5rem (8px)   | 0.5rem (8px)   |

**Value Updates (for existing `button-*` tokens):**

| Token                    | Old Value       | New Value      | Reason                            |
| ------------------------ | --------------- | -------------- | --------------------------------- |
| `--spacing-button-x`     | 1rem (16px)     | 1.5rem (24px)  | Match design system specification |
| `--spacing-button-y`     | 0.625rem (10px) | 0.75rem (12px) | Match design system specification |
| `--border-radius-button` | 0.375rem (6px)  | 0.5rem (8px)   | Match design system specification |

**Backward compatibility:**
- ✅ Old token **names** (`button-primary-*`) → Use `button-*` instead
- ✅ Old token **values** available as `-legacy` tokens until **Dec 2025**:
  - `--spacing-button-x-legacy: 1rem` (16px)
  - `--spacing-button-y-legacy: 0.625rem` (10px)
  - `--border-radius-button-legacy: 0.375rem` (6px)

**Migration Steps:**

1. **Update token names in components:**
   ```diff
   - class="px-button-primary py-button-primary rounded-button-primary"
   + class="px-button-x py-button-y rounded-button"
   ```

2. **Update CSS variable references:**
   ```diff
   - padding: var(--spacing-button-primary-x) var(--spacing-button-primary-y);
   + padding: var(--spacing-button-x) var(--spacing-button-y);
   ```

3. **If you need old values temporarily:**
   ```css
   /* Use legacy tokens until you update component */
   padding: var(--spacing-button-x-legacy) var(--spacing-button-y-legacy);
   ```

4. **Component updates:**
   - Subtask 3-6 (SYOS-356-359) will update components to use new consolidated tokens
   - No immediate action required - changes will cascade automatically

**Timeline:**
- **Now (Nov 2025)**: Token consolidation complete, backward compatibility available
- **Dec 2025**: Remove `-legacy` tokens (1 sprint)

**Questions?** See parent ticket SYOS-354 or contact @randy

### Migration Guide

**Before (hardcoded):**

```html
<nav class="px-2 py-2">...</nav>
<a class="gap-2 px-2 py-1.5">...</a>
```

**After (semantic tokens):**

```html
<nav class="px-nav-container py-nav-container">...</nav>
<a class="gap-icon px-nav-item py-nav-item">...</a>
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

| Token                     | Utility Class           | Dark Mode   | Light Mode  | Usage                                      |
| ------------------------- | ----------------------- | ----------- | ----------- | ------------------------------------------ |
| `--color-text-primary`    | `text-primary`          | white       | gray-900    | Primary text (headings, important content) |
| `--color-text-secondary`  | `text-secondary`        | gray-300    | gray-600    | Secondary text (descriptions, subtitles)   |
| `--color-text-tertiary`   | `text-tertiary`         | gray-500    | gray-500    | Tertiary text (labels, hints)              |
| `--color-bg-base`         | `bg-base`               | gray-900    | white       | Base background (page background)          |
| `--color-bg-surface`      | `bg-surface`            | gray-800    | gray-50     | Surface background (panels, lists)         |
| `--color-bg-elevated`     | `bg-elevated`           | gray-750\*  | white       | Elevated surfaces (cards, modals)          |
| `--color-border-base`     | `border-base`           | gray-800    | gray-200    | Base borders                               |
| `--color-border-elevated` | `border-elevated`       | gray-700    | gray-300    | Elevated borders (cards)                   |
| `--color-accent-primary`  | `border-accent-primary` | blue-600    | blue-600    | Primary accent (selected states, links)    |
| `--color-bg-hover`        | `hover:bg-hover`        | gray-800/50 | gray-100/50 | Hover background (subtle)                  |
| `--color-bg-hover-solid`  | `hover:bg-hover-solid`  | gray-800    | gray-100    | Hover background (solid)                   |
| `--color-bg-selected`     | `bg-selected`           | blue-600    | blue-600    | Selected state background                  |
| `--color-toggle-off`      | `bg-toggle-off`         | gray-700    | gray-300    | Toggle switch "off" state background       |
| `--color-tag-bg`          | `bg-tag`                | gray-700    | gray-100    | Tag/chip background                        |
| `--color-tag-text`        | `text-tag`              | gray-300    | gray-600    | Tag/chip text                              |

\*Note: `gray-750` is a custom shade slightly lighter than gray-800 for elevated surfaces in dark mode.

**Benefits:**

- ✅ One unified color system for entire app
- ✅ Automatic light/dark mode adaptation
- ✅ Change all colors globally by updating CSS variables
- ✅ Self-documenting (semantic names explain purpose)

### Sidebar-Specific Colors

For sidebar components, we use sidebar-specific tokens that work with the sidebar's unique styling:

| Token                            | Utility Class                  | Dark Mode   | Light Mode  | Usage                      |
| -------------------------------- | ------------------------------ | ----------- | ----------- | -------------------------- |
| `--color-sidebar-bg`             | `bg-sidebar`                   | gray-900    | white       | Sidebar background         |
| `--color-sidebar-border`         | `border-sidebar`               | gray-800    | gray-200    | Sidebar borders            |
| `--color-sidebar-text-primary`   | `text-sidebar-primary`         | white       | gray-900    | Primary text               |
| `--color-sidebar-text-secondary` | `text-sidebar-secondary`       | gray-300    | gray-600    | Secondary text (nav items) |
| `--color-sidebar-text-tertiary`  | `text-sidebar-tertiary`        | gray-500    | gray-500    | Tertiary text (labels)     |
| `--color-sidebar-hover`          | `hover:bg-sidebar-hover`       | gray-800/50 | gray-100/50 | Hover background (subtle)  |
| `--color-sidebar-hover-solid`    | `hover:bg-sidebar-hover-solid` | gray-800    | gray-100    | Hover background (solid)   |
| `--color-sidebar-active`         | `bg-sidebar-active`            | gray-800    | gray-100    | Active state background    |
| `--color-sidebar-badge-bg`       | `bg-sidebar-badge`             | gray-700    | gray-300    | Badge background           |
| `--color-sidebar-badge-text`     | `text-sidebar-badge`           | gray-300    | gray-600    | Badge text                 |

### Color Migration Guide

**Before (hardcoded colors):**

```html
<div class="border-gray-200 bg-gray-50 text-gray-900">
	<button class="bg-white text-gray-600 hover:bg-gray-100">...</button>
	<span class="bg-gray-100 text-gray-600">Tag</span>
</div>
```

**After (semantic tokens - auto-adapts to theme):**

```html
<div class="border-base bg-surface text-primary">
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
<aside class="toc-panel">
	<!-- Outer container -->
	<nav class="toc">
		<ul class="toc-list">
			<!-- Inner scrollable list -->
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
<aside class="toc-panel scrollable-outer">
	<!-- Padding, NO overflow -->
	<nav class="toc">
		<ul class="toc-list scrollable-inner">
			<!-- Overflow ONLY here -->
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

_Note: Different from nav items - uses semantic menu-item tokens and lighter colors for light backgrounds_

### Badge Pattern (used 4+ times)

```
text-label bg-gray-700 text-gray-300 font-medium px-badge py-badge rounded min-w-[18px] text-center flex-shrink-0
```

_Variations:_

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

_Always use with `flex-shrink-0` to prevent icon from shrinking_

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
<div
	class="flex h-system-header flex-shrink-0 items-center justify-between border-b border-base px-inbox-container py-system-header"
>
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
<div
	class="flex h-system-header flex-shrink-0 items-center justify-end gap-2 border-t border-base px-inbox-container py-system-header"
>
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
	class="z-50 min-w-[180px] rounded-md border border-base bg-elevated py-1 shadow-lg"
	side="bottom"
	align="start"
	sideOffset={4}
>
	<DropdownMenu.Item
		class="flex cursor-pointer items-center gap-icon px-menu-item py-menu-item text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
		textValue="Option"
		onSelect={() => handleSelect()}
	>
		<span class="flex-1">Option</span>
		{#if isSelected}
			<svg class="h-4 w-4 flex-shrink-0 text-secondary" ...>
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

| Token                              | Utility Class              | Value          | Usage                        |
| ---------------------------------- | -------------------------- | -------------- | ---------------------------- |
| `--spacing-control-panel-padding`  | `p-control-panel-padding`  | 0.75rem (12px) | Panel container padding      |
| `--spacing-control-group-gap`      | `gap-control-group`        | 0.5rem (8px)   | Gap between control groups   |
| `--spacing-control-item-gap`       | `gap-control-item-gap`     | 0.25rem (4px)  | Gap between buttons in group |
| `--spacing-control-button-padding` | `p-control-button-padding` | 0.5rem (8px)   | Button padding (square)      |
| `--spacing-control-divider`        | `mx-control-divider`       | 0.5rem (8px)   | Margin around dividers       |

### Control Panel Color Tokens

| Token                           | Utility Class              | Value                       | Usage               |
| ------------------------------- | -------------------------- | --------------------------- | ------------------- |
| `--color-control-bg`            | `bg-control`               | var(--color-bg-elevated)    | Panel background    |
| `--color-control-border`        | `border-control-border`    | var(--color-border-base)    | Panel border        |
| `--color-control-button-hover`  | `bg-control-button-hover`  | var(--color-bg-hover-solid) | Button hover state  |
| `--color-control-button-active` | `bg-control-button-active` | var(--color-bg-selected)    | Active button state |
| `--color-control-divider`       | `bg-control-divider`       | var(--color-border-base)    | Divider color       |

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
<Dialog.Content class="border-base/30 rounded-modal border bg-elevated p-content-padding shadow-lg">
	<Dialog.Title class="mb-heading text-xl font-medium text-primary">Create Note</Dialog.Title>

	<div class="mt-content-section flex flex-col gap-content-section">
		<FormInput label="Title" placeholder="Enter title..." bind:value={title} />
		<FormTextarea label="Content" rows={6} bind:value={content} />

		<div class="flex justify-end gap-button-group border-t border-base pt-content-section">
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
<button class="rounded bg-blue-600 px-4 py-2 text-white">Click me</button>
<a href="/login" class="rounded border border-gray-200 px-4 py-2">Login</a>

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
