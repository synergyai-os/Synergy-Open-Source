# Design System Quick Start

> **Goal**: Get new developers productive in < 10 minutes with design system patterns.

---

## 🚀 5-Minute Setup

### 1. Understand the Structure

**Atomic Design Layers**:

```
src/lib/components/
├── primitives/     # Layer 1: Bits UI wrappers (future)
├── atoms/          # Layer 2: Styled components (Button, Card, Badge)
├── molecules/      # Layer 3: Composites (FormField, MetadataBar)
└── organisms/      # Layer 4: Complex sections (Dialog, NavigationMenu)
```

**Current State**: Components are in `ui/` folder, migrating to atomic structure incrementally.

**Both imports work** (backward compatible):

```typescript
// Old (still works)
import { Button } from '$lib/components/ui';

// New (preferred)
import { Button } from '$lib/components/atoms';
```

### 2. Token Usage Pattern

**❌ NEVER use hardcoded values**:

```svelte
<!-- ❌ WRONG - ESLint blocks this -->
<button class="min-h-[2.75rem] p-[12px] rounded-lg bg-blue-600">
```

**✅ ALWAYS use design tokens**:

```svelte
<!-- ✅ CORRECT - Uses semantic tokens -->
<button class="min-h-button p-button-icon rounded-button bg-accent-primary">
```

**Why**: Tokens adapt to light/dark mode automatically. Change once in `app.css`, updates everywhere.

**See**: [Design Tokens Reference](design-tokens.md) for all available tokens.

### 3. Component Import Pattern

**Atomic components** (Layer 2):

```typescript
import { Button, Card, Badge } from '$lib/components/atoms';
```

**Molecular components** (Layer 3):

```typescript
import { MetadataBar, PrioritySelector } from '$lib/components/molecules';
```

**Organism components** (Layer 4):

```typescript
import * as Dialog from '$lib/components/organisms';
```

---

## 🎨 Creating Your First Component

### Example: Custom Button Component

**File**: `src/lib/components/atoms/MyButton.svelte`

```svelte
<script lang="ts">
	import { Button as BitsButton } from 'bits-ui';
	import type { WithElementRef } from 'bits-ui';
	import type { Snippet } from 'svelte';

	type Props = WithElementRef<
		{
			variant?: 'primary' | 'secondary';
			onclick?: () => void;
			children: Snippet;
			class?: string;
		},
		HTMLButtonElement
	>;

	let {
		variant = 'primary',
		onclick = undefined,
		children,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	// Base classes using design tokens
	const baseClasses =
		'inline-flex items-center justify-center rounded-button transition-colors-token';

	// Variant classes using design tokens
	const variantClasses = {
		primary: 'bg-accent-primary text-white hover:bg-accent-hover',
		secondary: 'bg-elevated border border-base text-primary hover:border-accent-primary'
	};

	const buttonClasses = `${baseClasses} ${variantClasses[variant]} px-button-x py-button-y text-button ${className}`;
</script>

<BitsButton.Root {onclick} class={buttonClasses} bind:ref {...rest}>
	{@render children()}
</BitsButton.Root>
```

### Key Patterns

**1. Bits UI Wrapper**:

```typescript
import { Button as BitsButton } from 'bits-ui';
// Use BitsButton.Root for behavior, apply our tokens for styling
```

**2. Design Tokens** (never hardcode):

```typescript
// ✅ CORRECT
'px-button-x py-button-y rounded-button bg-accent-primary'

// ❌ WRONG
'px-4 py-2 rounded-lg bg-blue-600'
```

**3. Ref Forwarding**:

```typescript
import type { WithElementRef } from 'bits-ui';

type Props = WithElementRef<{ ... }, HTMLButtonElement>;

let { ref = $bindable(null), ...rest }: Props = $props();
```

**4. Export from Barrel**:

**File**: `src/lib/components/atoms/index.ts`

```typescript
export { default as MyButton } from './MyButton.svelte';
```

**Usage**:

```typescript
import { MyButton } from '$lib/components/atoms';
```

---

## 📋 Token Usage Patterns

### Spacing Tokens

**❌ WRONG**:

```svelte
<div class="px-2 py-1.5 gap-2">
```

**✅ CORRECT**:

```svelte
<div class="px-nav-item py-nav-item gap-icon">
```

**Common spacing tokens**:

- `px-nav-item py-nav-item` - Navigation items
- `px-button-x py-button-y` - Buttons
- `px-card py-card` - Cards
- `gap-icon` - Icon-to-text spacing
- `gap-marketing-section` - Marketing sections

**See**: [Design Tokens > Spacing](design-tokens.md#spacing-design-tokens) for complete list.

### Color Tokens

**❌ WRONG**:

```svelte
<div class="bg-gray-900 text-white border-gray-800">
```

**✅ CORRECT**:

```svelte
<div class="bg-sidebar text-sidebar-primary border-sidebar">
```

**Why**: Colors adapt to light/dark mode automatically.

**Common color tokens**:

- `bg-base` / `text-primary` - Base background/text
- `bg-elevated` / `text-primary` - Cards, modals
- `bg-accent-primary` - Primary actions
- `border-base` - Standard borders

**See**: [Design Tokens > Colors](design-tokens.md#colors-semantic-tokens) for complete list.

### Typography Tokens

**❌ WRONG**:

```svelte
<h1 class="text-[36px] font-bold">Title</h1>
```

**✅ CORRECT**:

```svelte
<h1 class="text-h1">Title</h1>
```

**Typography tokens**:

- `text-h1`, `text-h2`, `text-h3` - Headings
- `text-body` - Body text
- `text-button` - Button text
- `text-label` - Labels, badges

**See**: [Design Tokens > Typography](design-tokens.md#typography-scale-tokens-syos-353) for complete list.

---

## 🎯 Synergy-Specific Pattern Examples

> **Purpose**: Quick copy-paste reference for common SynergyOS patterns.

### Color Usage Patterns

**Primary actions** (main CTAs, submit buttons):
```svelte
<button class="bg-primary text-primary-foreground hover:bg-primary-hover">
  Submit
</button>
```

**Secondary actions** (cancel, alternative actions):
```svelte
<button class="bg-secondary text-secondary-foreground hover:bg-secondary-hover">
  Cancel
</button>
```

**Accent highlights** (notifications, badges, important UI elements):
```svelte
<div class="bg-accent text-accent-foreground">
  New feature available!
</div>
```

**Surface containers** (cards, panels, elevated sections):
```svelte
<div class="bg-surface text-on-surface border border-base">
  Card content
</div>
```

### Spacing Patterns

**Card spacing** (internal card padding):
```svelte
<div class="p-card-padding rounded-card">
  Card content with consistent padding
</div>
```

**Button padding** (horizontal and vertical button spacing):
```svelte
<button class="px-button-padding-md py-button-padding-sm rounded-button">
  Button text
</button>
```

**Section spacing** (vertical spacing between sections):
```svelte
<section class="space-y-section-spacing">
  <div>Section 1</div>
  <div>Section 2</div>
</section>
```

### Typography Hierarchy

**Headings** (page titles, section headers, card titles):
```svelte
<!-- Page title -->
<h1 class="text-heading-xl font-heading">Main Page Title</h1>

<!-- Section header -->
<h2 class="text-heading-lg font-heading">Section Header</h2>

<!-- Card title -->
<h3 class="text-heading-md font-heading">Card Title</h3>
```

**Body text** (paragraphs, descriptions, content):
```svelte
<!-- Primary body text -->
<p class="text-body-md font-body">
  This is standard body text for reading content.
</p>

<!-- Secondary/muted text -->
<p class="text-body-sm text-muted-foreground">
  This is smaller, less prominent text for additional details.
</p>
```

**Captions** (labels, metadata, timestamps):
```svelte
<span class="text-caption text-muted-foreground">
  Last updated: 2 hours ago
</span>
```

**Why These Patterns?**

- ✅ **Consistent**: Same problem, same solution across app
- ✅ **Theme-aware**: Automatically adapt to light/dark mode
- ✅ **Maintainable**: Change token once, updates everywhere
- ✅ **Copy-paste ready**: No thinking, just use

**See**: [Design Tokens](design-tokens.md) for complete token reference.

---

## 🔍 Common Debugging Tips

### Issue: ESLint blocks hardcoded values

**Error**:

```
❌ Hardcoded Tailwind value detected: min-h-[2.75rem]
```

**Solution**:

1. Check if token exists: `grep -r "min-h-button" src/app.css`
2. If exists: Use token (`min-h-button`)
3. If missing: Add token to `src/app.css` @theme block, then use it

**See**: [Design Tokens > How to Add New Tokens](design-tokens.md#how-to-add-new-tokens)

### Issue: Component not found

**Error**:

```
Cannot find module '$lib/components/atoms'
```

**Solution**:

1. Check if component exists in `src/lib/components/ui/`
2. Check if exported in `src/lib/components/atoms/index.ts`
3. If missing: Add export to barrel file

### Issue: Colors don't change with theme

**Problem**: Using hardcoded colors instead of tokens.

**Solution**: Replace hardcoded colors with semantic tokens:

```svelte
<!-- ❌ WRONG -->
<div class="bg-gray-900 text-white">

<!-- ✅ CORRECT -->
<div class="bg-base text-primary">
```

**See**: [Design Tokens > Colors](design-tokens.md#colors-semantic-tokens)

---

## ✅ Validation Checklist

Before submitting code:

- [ ] No hardcoded values (`px-2`, `bg-gray-900`, `text-[10px]`)
- [ ] Using design tokens (`px-nav-item`, `bg-sidebar`, `text-label`)
- [ ] Component exported from barrel (`atoms/index.ts`, `molecules/index.ts`, etc.)
- [ ] Using atomic imports (`$lib/components/atoms`, not `$lib/components/ui`)
- [ ] Ref forwarding implemented (if needed)
- [ ] TypeScript types defined
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

---

## 📚 Next Steps

1. **Read**: [Component Architecture](component-architecture.md) - Complete design system philosophy
2. **Read**: [Design Tokens](design-tokens.md) - Full token reference
3. **Read**: [Anti-Patterns](component-architecture.md#anti-patterns) - What NOT to do
4. **Read**: [Migration Guide](migration-guide.md) - How to migrate existing code

---

## 🆘 Need Help?

- **Token reference**: `dev-docs/2-areas/design/design-tokens.md`
- **Component examples**: `src/lib/components/ui/Button.svelte`
- **Patterns**: `dev-docs/2-areas/patterns/INDEX.md`
- **Coding standards**: `dev-docs/2-areas/development/coding-standards.md`

---

**Last Updated**: November 2025  
**Status**: 🟢 Active  
**Owner**: Design System Team

