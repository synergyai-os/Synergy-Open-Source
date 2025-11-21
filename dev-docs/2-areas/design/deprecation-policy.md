# Design System Deprecation Policy

> **Purpose**: Formal process for deprecating tokens, components, and patterns with clear timelines and migration paths.

---

## 📋 Overview

**Deprecation Timeline**: 2-version buffer (deprecate → warn → remove)

**Process**:

1. **Deprecate** (v1.0): Mark as deprecated, add warning comment
2. **Warn** (v1.1): Add `console.warn()` for runtime warnings
3. **Remove** (v2.0): Remove deprecated code

**Timeline Example**:

- **v1.0** (Nov 2025): Deprecate `--spacing-old-token`
- **v1.1** (Dec 2025): Add `console.warn()` when used
- **v2.0** (Jan 2026): Remove `--spacing-old-token` completely

---

## 🎨 Token Deprecation

### Step 1: Mark as Deprecated

**File**: `src/app.css`

```css
@theme {
	/* @deprecated Use --spacing-button-x instead. Remove in v2.0 */
	--spacing-old-button-x: var(--spacing-button-x);
}
```

**Pattern**:

```css
/* @deprecated Use [NEW_TOKEN] instead. Remove in [VERSION] */
--old-token: var(--new-token);
```

### Step 2: Add Runtime Warning

**File**: `src/lib/utils/deprecation-warnings.ts`

```typescript
/**
 * Deprecation warnings for design tokens
 * Remove warnings when deprecated tokens are removed in v2.0
 */

export function warnDeprecatedToken(tokenName: string, replacement: string) {
	if (import.meta.env.DEV) {
		console.warn(
			`[Deprecated] Design token "${tokenName}" is deprecated. Use "${replacement}" instead. Will be removed in v2.0.`
		);
	}
}
```

**Usage in components**:

```typescript
import { warnDeprecatedToken } from '$lib/utils/deprecation-warnings';

// If using deprecated token
if (usesOldToken) {
	warnDeprecatedToken('--spacing-old-button-x', '--spacing-button-x');
}
```

### Step 3: Update Documentation

**File**: `dev-docs/2-areas/design/design-tokens.md`

```markdown
### Deprecated Tokens

| Token | Replacement | Deprecated | Remove |
|-------|-------------|------------|--------|
| `--spacing-old-button-x` | `--spacing-button-x` | v1.0 (Nov 2025) | v2.0 (Jan 2026) |
```

### Step 4: Create Migration Guide

**File**: `dev-docs/2-areas/design/migration-guide.md`

Add section:

```markdown
## Token Migration: --spacing-old-button-x → --spacing-button-x

**Deprecated**: v1.0 (Nov 2025)  
**Remove**: v2.0 (Jan 2026)

**Find and replace**:

```typescript
// Old
class="px-old-button"

// New
class="px-button-x"
```

**Files affected**: [List files using deprecated token]
```

### Step 5: Remove (v2.0)

**File**: `src/app.css`

```diff
- /* @deprecated Use --spacing-button-x instead. Remove in v2.0 */
- --spacing-old-button-x: var(--spacing-button-x);
```

**File**: `dev-docs/2-areas/design/design-tokens.md`

Remove deprecated token from documentation.

---

## 🧩 Component Deprecation

### Step 1: Mark as Deprecated

**File**: `src/lib/components/ui/OldComponent.svelte`

```svelte
<script lang="ts">
	/**
	 * @deprecated Use NewComponent instead. Remove in v2.0
	 * @see migration-guide.md for migration steps
	 */
	import { warnDeprecatedComponent } from '$lib/utils/deprecation-warnings';

	// Warn on mount
	$effect(() => {
		warnDeprecatedComponent('OldComponent', 'NewComponent');
	});
</script>
```

### Step 2: Add Runtime Warning

**File**: `src/lib/utils/deprecation-warnings.ts`

```typescript
export function warnDeprecatedComponent(
	componentName: string,
	replacement: string
) {
	if (import.meta.env.DEV) {
		console.warn(
			`[Deprecated] Component "${componentName}" is deprecated. Use "${replacement}" instead. Will be removed in v2.0.`
		);
	}
}
```

### Step 3: Update Barrel Export

**File**: `src/lib/components/ui/index.ts`

```typescript
/**
 * @deprecated Use NewComponent instead. Remove in v2.0
 */
export { default as OldComponent } from './OldComponent.svelte';
```

### Step 4: Create Migration Guide

**File**: `dev-docs/2-areas/design/migration-guide.md`

```markdown
## Component Migration: OldComponent → NewComponent

**Deprecated**: v1.0 (Nov 2025)  
**Remove**: v2.0 (Jan 2026)

**API Changes**:

```svelte
<!-- Old -->
<OldComponent prop1={value1} prop2={value2} />

<!-- New -->
<NewComponent newProp={value1} otherProp={value2} />
```

**Breaking changes**: [List breaking changes]
```

### Step 5: Remove (v2.0)

- Remove component file
- Remove from barrel exports
- Update migration guide (mark as completed)

---

## 🔧 Prop/API Deprecation

### Step 1: Mark Prop as Deprecated

**File**: `src/lib/components/ui/Component.svelte`

```typescript
type Props = {
	/**
	 * @deprecated Use newProp instead. Remove in v2.0
	 */
	oldProp?: string;
	newProp?: string;
};

let { oldProp, newProp, ...rest }: Props = $props();

// Warn if oldProp is used
if (oldProp && import.meta.env.DEV) {
	console.warn(
		`[Deprecated] Component prop "oldProp" is deprecated. Use "newProp" instead. Will be removed in v2.0.`
	);
}

// Use newProp if provided, fallback to oldProp
const value = newProp ?? oldProp;
```

### Step 2: Update TypeScript Types

**File**: `src/lib/components/ui/types.ts`

```typescript
export type ComponentProps = {
	/**
	 * @deprecated Use newProp instead. Remove in v2.0
	 */
	oldProp?: string;
	newProp?: string;
};
```

### Step 3: Create Migration Guide

**File**: `dev-docs/2-areas/design/migration-guide.md`

```markdown
## Prop Migration: oldProp → newProp

**Deprecated**: v1.0 (Nov 2025)  
**Remove**: v2.0 (Jan 2026)

**Find and replace**:

```svelte
<!-- Old -->
<Component oldProp={value} />

<!-- New -->
<Component newProp={value} />
```
```

---

## 📊 Deprecation Checklist

**Before deprecating**:

- [ ] Identify replacement (token/component/prop)
- [ ] Document breaking changes
- [ ] Create migration guide
- [ ] Update documentation
- [ ] Add deprecation comment/annotation

**During deprecation**:

- [ ] Mark as deprecated in code
- [ ] Add runtime warning (`console.warn()`)
- [ ] Update barrel exports (if component)
- [ ] Update documentation
- [ ] Create migration guide

**Before removing**:

- [ ] Verify no usage in codebase (`grep -r "old-token" src/`)
- [ ] Update migration guide (mark as completed)
- [ ] Remove deprecated code
- [ ] Remove from documentation
- [ ] Update version number

---

## 🚨 Breaking Change Communication

**When deprecating**:

1. **Linear ticket**: Create ticket for deprecation
2. **PR description**: Include deprecation notice
3. **Migration guide**: Add to `migration-guide.md`
4. **Changelog**: Document in release notes

**Example PR description**:

```markdown
## Deprecation Notice

⚠️ **Breaking Change**: `--spacing-old-button-x` is deprecated.

**Migration**:
- Old: `px-old-button`
- New: `px-button-x`

**Timeline**:
- Deprecated: v1.0 (Nov 2025)
- Remove: v2.0 (Jan 2026)

See `migration-guide.md` for complete migration steps.
```

---

## 📝 Examples

### Example 1: Token Deprecation

**v1.0** (Deprecate):

```css
/* @deprecated Use --spacing-button-x instead. Remove in v2.0 */
--spacing-button-primary-x: var(--spacing-button-x);
```

**v1.1** (Warn):

```typescript
// In component using deprecated token
if (usesOldToken && import.meta.env.DEV) {
	console.warn(
		'[Deprecated] --spacing-button-primary-x is deprecated. Use --spacing-button-x instead.'
	);
}
```

**v2.0** (Remove):

```diff
- /* @deprecated Use --spacing-button-x instead. Remove in v2.0 */
- --spacing-button-primary-x: var(--spacing-button-x);
```

### Example 2: Component Deprecation

**v1.0** (Deprecate):

```svelte
<!-- OldButton.svelte -->
<script lang="ts">
	/**
	 * @deprecated Use Button from atoms instead. Remove in v2.0
	 */
	import { warnDeprecatedComponent } from '$lib/utils/deprecation-warnings';

	$effect(() => {
		warnDeprecatedComponent('OldButton', 'Button');
	});
</script>
```

**v2.0** (Remove):

- Delete `OldButton.svelte`
- Remove from barrel exports
- Update migration guide

---

## 🔗 Related

- [Migration Guide](migration-guide.md) - Step-by-step migration instructions
- [Design Tokens](design-tokens.md) - Token reference
- [Component Architecture](component-architecture.md) - Component structure

---

**Last Updated**: November 2025  
**Status**: 🟢 Active  
**Owner**: Design System Team

