# Design Tokens Workflow Guide

**Complete step-by-step guide for working with design tokens in SynergyOS.**

This guide covers everything from adding new tokens to migrating hardcoded values to the token system.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Adding New Tokens](#adding-new-tokens)
3. [Base Tokens vs Semantic Tokens](#base-tokens-vs-semantic-tokens)
4. [Exception Token Documentation](#exception-token-documentation)
5. [Migration Guide](#migration-guide)
6. [Common Patterns](#common-patterns)

---

## Quick Start

**First time working with tokens?**

1. **Build tokens** (required after pulling changes):

   ```bash
   npm run tokens:build
   ```

2. **Verify build succeeded:**

   ```bash
   # Check output files exist
   ls -la src/styles/tokens/
   ```

3. **Use tokens in components:**

   ```svelte
   <!-- ✅ CORRECT - Use semantic tokens -->
   <nav class="px-nav-container py-nav-container">
   	<a class="px-nav-item py-nav-item">Item</a>
   </nav>

   <!-- ❌ WRONG - Hardcoded values -->
   <nav class="px-2 py-2">
   	<a class="px-2 py-1.5">Item</a>
   </nav>
   ```

**See**: `dev-docs/2-areas/design/design-tokens.md` for complete token reference.

---

## Adding New Tokens

**Step-by-step process for adding new design tokens.**

### Step 1: Determine Token Type

**Ask yourself:**

- **Is this a base value?** (e.g., `spacing.2 = 0.5rem`) → Add to base scale
- **Is this component-specific?** (e.g., `spacing.nav.item.x`) → Add as semantic token
- **Does this need to cascade?** (e.g., multiple components use same value) → Reference base token

**Decision tree:**

```
Q: Is this a foundational value used by many tokens?
→ Yes: Base token (e.g., spacing.2)
→ No: Semantic token (e.g., spacing.nav.item.x)

Q: Does this value need to cascade when base changes?
→ Yes: Reference base token (e.g., {spacing.2})
→ No: Can be exception (document with rationale)
```

### Step 2: Add Token to design-system.json

**Location**: `design-system.json` (root of project)

**Base token example:**

```json
{
	"spacing": {
		"2": {
			"$value": "0.5rem",
			"$description": "8px = sm"
		}
	}
}
```

**Semantic token example:**

```json
{
	"spacing": {
		"nav": {
			"item": {
				"x": {
					"$value": "{spacing.2}",
					"$description": "Nav item horizontal padding - references base scale"
				}
			}
		}
	}
}
```

**Key points:**

- ✅ Use DTCG format (`$value`, `$description`)
- ✅ Semantic tokens reference base tokens: `{spacing.2}`
- ✅ Include clear `$description` explaining purpose
- ✅ Follow existing naming patterns (see Common Patterns below)

### Step 3: Build Tokens

**Generate CSS files:**

```bash
npm run tokens:build
```

**Expected output:**

```
✅ Tokens built successfully!
📁 Output files:
   - src/styles/tokens/spacing.css
   - src/styles/tokens/colors.css
   - src/styles/tokens/typography.css
   - src/styles/tokens/effects.css
   - src/styles/tokens/sizes.css
   - src/styles/utilities/spacing-utils.css
   - src/styles/utilities/color-utils.css
   - src/styles/utilities/typography-utils.css
   - src/styles/utilities/component-utils.css
```

### Step 4: Validate Tokens

**Check semantic token references:**

```bash
npm run tokens:validate-semantic
```

**Expected output:**

```
✅ All semantic tokens reference base tokens correctly
✅ No hardcoded values found in semantic tokens
```

**If errors found:**

- Fix references (use `{spacing.X}` format)
- Document exceptions (see Exception Token Documentation below)

### Step 5: Use Token in Components

**Use generated utility classes:**

```svelte
<!-- ✅ CORRECT - Use semantic token utility -->
<nav class="px-nav-container py-nav-container">
	<a class="px-nav-item py-nav-item">Item</a>
</nav>
```

**Verify token works:**

1. Check component renders correctly
2. Verify spacing/colors match design
3. Test light/dark mode (if color token)

### Step 6: Document Token

**Add to `design-tokens.md`:**

1. Find appropriate section (Spacing, Colors, Typography, etc.)
2. Add token to table with:
   - Token name
   - Utility class
   - Value
   - Usage description

**Example:**

```markdown
| Token                  | Utility Class | Value        | Usage                       |
| ---------------------- | ------------- | ------------ | --------------------------- |
| `--spacing-nav-item-x` | `px-nav-item` | 0.5rem (8px) | Nav item horizontal padding |
```

---

## Base Tokens vs Semantic Tokens

**Understanding the difference and when to use each.**

### Base Tokens

**Definition**: Foundation values for the design system.

**Characteristics:**

- Direct children of category (e.g., `spacing.0`, `spacing.1`, `spacing.2`)
- Can have hardcoded values (e.g., `"0.5rem"`, `"oklch(...)"`)
- Used as building blocks for semantic tokens
- Examples: `spacing.2 = 0.5rem`, `color.primary = oklch(...)`

**When to add:**

- New spacing scale value (e.g., `spacing.14 = 3.5rem`)
- New color in palette (e.g., `color.accent.secondary`)
- New typography scale (e.g., `typography.size.xl`)

**Example:**

```json
{
	"spacing": {
		"2": {
			"$value": "0.5rem",
			"$description": "8px = sm"
		}
	}
}
```

### Semantic Tokens

**Definition**: Component-specific or context-specific values.

**Characteristics:**

- Nested deeper than base tokens (e.g., `spacing.nav.item.x`)
- **MUST reference base tokens** using `{spacing.X}` format
- Cascade automatically when base token changes
- Examples: `spacing.nav.item.x = {spacing.2}`, `color.text.primary = {color.primary}`

**When to add:**

- Component-specific spacing (e.g., nav item padding)
- Context-specific colors (e.g., sidebar text color)
- Feature-specific values (e.g., marketing section padding)

**Example:**

```json
{
	"spacing": {
		"nav": {
			"item": {
				"x": {
					"$value": "{spacing.2}",
					"$description": "Nav item horizontal padding - references base scale"
				}
			}
		}
	}
}
```

### Cascade Behavior

**Why semantic tokens reference base tokens:**

**Example cascade:**

```json
// Base token
"spacing.2": "0.5rem"

// Semantic tokens (all reference base)
"spacing.nav.item.x": "{spacing.2}"      // → 0.5rem
"spacing.menu.item.x": "{spacing.2}"      // → 0.5rem
"spacing.badge.x": "{spacing.2}"         // → 0.5rem

// Change base token once:
"spacing.2": "0.75rem"

// All semantic tokens update automatically:
"spacing.nav.item.x": "{spacing.2}"      // → 0.75rem ✅
"spacing.menu.item.x": "{spacing.2}"     // → 0.75rem ✅
"spacing.badge.x": "{spacing.2}"         // → 0.75rem ✅
```

**Benefits:**

- ✅ Single source of truth (change once, updates everywhere)
- ✅ Consistent design system (related tokens stay aligned)
- ✅ Easy refactoring (update base token, all semantic tokens update)

---

## Exception Token Documentation

**When semantic tokens intentionally don't reference base tokens.**

### When Exceptions Are Allowed

Some values intentionally don't map to base scale (optimized for specific components):

- `0.125rem` (2px) - Chip padding, badge padding (compact design)
- `0.375rem` (6px) - Nav items, menu items, tabs (optimal touch target)
- `0.625rem` (10px) - Headers, inputs, menu items (visual balance)
- `0.875rem` (14px) - Marketing list spacing (readability)

### How to Document Exceptions

**Required format:**

```json
{
	"spacing": {
		"nav": {
			"item": {
				"y": {
					"$value": "0.375rem",
					"$description": "6px - INTENTIONAL EXCEPTION: Optimal touch target size for nav items. Not in base scale (0.25rem increments). Rationale: 6px provides better touch target than 4px (spacing.1) or 8px (spacing.2) for mobile navigation."
				}
			}
		}
	}
}
```

**Key requirements:**

1. **Include "INTENTIONAL EXCEPTION"** in `$description` (validation script checks for this)
2. **Include "Rationale"** explaining why exception is needed
3. **Specify which base tokens were considered** and why they don't work

**Validation script behavior:**

- ✅ Tokens with "INTENTIONAL EXCEPTION" in description are allowed
- ✅ Tokens with "EXCEPTION" or "RATIONALE" keywords are also allowed
- ❌ Semantic tokens without exception documentation will fail validation

### Exception Examples

**Example 1: Optimal touch target**

```json
{
	"spacing": {
		"nav": {
			"item": {
				"y": {
					"$value": "0.375rem",
					"$description": "6px - INTENTIONAL EXCEPTION: Optimal touch target size. spacing.1 (4px) too small, spacing.2 (8px) too large for mobile nav items."
				}
			}
		}
	}
}
```

**Example 2: Visual balance**

```json
{
	"spacing": {
		"header": {
			"y": {
				"$value": "0.625rem",
				"$description": "10px - INTENTIONAL EXCEPTION: Visual balance for headers. spacing.2 (8px) too tight, spacing.3 (12px) too loose. Rationale: 10px creates optimal visual rhythm with header content."
			}
		}
	}
}
```

**Example 3: Readability optimization**

```json
{
	"spacing": {
		"marketing": {
			"list": {
				"gap": {
					"$value": "0.875rem",
					"$description": "14px - INTENTIONAL EXCEPTION: Optimized for readability in marketing content. spacing.3 (12px) too tight, spacing.4 (16px) too loose. Rationale: 14px provides optimal line spacing for marketing list items."
				}
			}
		}
	}
}
```

---

## Migration Guide

**Converting hardcoded values to design tokens.**

### Step 1: Identify Hardcoded Values

**Find hardcoded values in components:**

```bash
# Search for common hardcoded patterns
grep -r "px-\[" src/
grep -r "py-\[" src/
grep -r "bg-\[" src/
grep -r "text-\[" src/
```

**Common patterns:**

- `px-[12px]` → Should use `px-nav-item` or similar
- `py-[8px]` → Should use `py-nav-item` or similar
- `bg-[#3b82f6]` → Should use `bg-accent-primary` or similar
- `text-[10px]` → Should use `text-label` or similar

### Step 2: Check if Token Exists

**Search existing tokens:**

```bash
# Search design-system.json
grep -r "nav-item" design-system.json

# Search design-tokens.md
grep -r "nav-item" dev-docs/2-areas/design/design-tokens.md
```

**If token exists:**

- Use existing utility class (e.g., `px-nav-item`)
- Skip to Step 4

**If token doesn't exist:**

- Continue to Step 3 (add new token)

### Step 3: Add New Token

**Follow "Adding New Tokens" workflow above:**

1. Determine token type (base vs semantic)
2. Add to `design-system.json`
3. Build tokens (`npm run tokens:build`)
4. Validate tokens (`npm run tokens:validate-semantic`)
5. Document token in `design-tokens.md`

### Step 4: Replace Hardcoded Values

**Update component:**

```svelte
<!-- Before -->
<nav class="px-[8px] py-[6px]">
	<a class="px-[8px] py-[6px]">Item</a>
</nav>

<!-- After -->
<nav class="px-nav-container py-nav-container">
	<a class="px-nav-item py-nav-item">Item</a>
</nav>
```

**Verify changes:**

1. Component renders correctly
2. Spacing/colors match design
3. Light/dark mode works (if color token)
4. ESLint passes (`npm run lint`)

### Step 5: Test and Verify

**Run validation:**

```bash
# Check ESLint (should pass)
npm run lint

# Check tokens build
npm run tokens:build

# Check semantic token validation
npm run tokens:validate-semantic
```

**Visual verification:**

1. Check component in browser
2. Verify spacing matches design
3. Test responsive behavior
4. Verify light/dark mode (if color token)

### Migration Checklist

**Before migrating:**

- [ ] Identified all hardcoded values in component
- [ ] Checked if tokens already exist
- [ ] Determined token type (base vs semantic)

**During migration:**

- [ ] Added token to `design-system.json`
- [ ] Built tokens (`npm run tokens:build`)
- [ ] Validated tokens (`npm run tokens:validate-semantic`)
- [ ] Replaced hardcoded values with utility classes
- [ ] Documented token in `design-tokens.md`

**After migration:**

- [ ] ESLint passes (`npm run lint`)
- [ ] Component renders correctly
- [ ] Visual verification (spacing/colors match design)
- [ ] Light/dark mode works (if color token)
- [ ] Responsive behavior verified

---

## Common Patterns

**Reusable patterns for common token scenarios.**

### Pattern 1: Component Padding

**Scenario**: Component needs consistent padding.

**Base token approach:**

```json
{
	"spacing": {
		"card": {
			"padding": {
				"x": {
					"$value": "{spacing.5}",
					"$description": "Card horizontal padding - references base scale"
				},
				"y": {
					"$value": "{spacing.5}",
					"$description": "Card vertical padding - references base scale"
				}
			}
		}
	}
}
```

**Usage:**

```svelte
<div class="px-card py-card">Card content</div>
```

### Pattern 2: Icon Sizes

**Scenario**: Standardized icon sizes across app.

**Base token approach:**

```json
{
	"size": {
		"icon": {
			"sm": {
				"$value": "1rem",
				"$description": "16px - Small icons"
			},
			"md": {
				"$value": "1.25rem",
				"$description": "20px - Medium icons (standard)"
			},
			"lg": {
				"$value": "1.5rem",
				"$description": "24px - Large icons"
			}
		}
	}
}
```

**Usage:**

```svelte
<svg class="icon-md">...</svg>
<svg class="icon-lg">...</svg>
```

### Pattern 3: Color Variants

**Scenario**: Color variants for different contexts.

**Semantic token approach:**

```json
{
	"color": {
		"text": {
			"primary": {
				"$value": "{color.primary}",
				"$description": "Primary text color - references base color"
			},
			"secondary": {
				"$value": "{color.secondary}",
				"$description": "Secondary text color - references base color"
			}
		}
	}
}
```

**Usage:**

```svelte
<h1 class="text-primary">Title</h1><p class="text-secondary">Description</p>
```

### Pattern 4: Responsive Spacing

**Scenario**: Different spacing for mobile vs desktop.

**Semantic token approach:**

```json
{
	"spacing": {
		"container": {
			"x": {
				"$value": "{spacing.4}",
				"$description": "Container horizontal padding - mobile (16px)"
			},
			"x-desktop": {
				"$value": "{spacing.6}",
				"$description": "Container horizontal padding - desktop (24px)"
			}
		}
	}
}
```

**Usage:**

```svelte
<div class="md:px-container-desktop px-container">Content</div>
```

### Pattern 5: Exception Documentation

**Scenario**: Value doesn't map to base scale (exception needed).

**Exception token approach:**

```json
{
	"spacing": {
		"nav": {
			"item": {
				"y": {
					"$value": "0.375rem",
					"$description": "6px - INTENTIONAL EXCEPTION: Optimal touch target size. spacing.1 (4px) too small, spacing.2 (8px) too large for mobile nav items. Rationale: 6px provides better touch target than base scale values."
				}
			}
		}
	}
}
```

**Usage:**

```svelte
<a class="py-nav-item">Nav Item</a>
```

---

## Quick Reference

**Common commands:**

```bash
# Build tokens
npm run tokens:build

# Watch mode (auto-rebuild)
npm run tokens:watch

# Validate semantic token references
npm run tokens:validate-semantic

# Validate DTCG format
npm run tokens:validate-dtcg
```

**File locations:**

- **Source of truth**: `design-system.json` (DTCG format)
- **Generated CSS**: `src/styles/tokens/*.css` (theme tokens)
- **Generated utilities**: `src/styles/utilities/*.css` (utility classes)
- **Documentation**: `dev-docs/2-areas/design/design-tokens.md`

**Key rules:**

1. ✅ Semantic tokens MUST reference base tokens (`{spacing.X}`)
2. ✅ Base tokens can have hardcoded values
3. ✅ Exceptions must be documented with "INTENTIONAL EXCEPTION"
4. ✅ Always build tokens after changes (`npm run tokens:build`)
5. ✅ Validate tokens before committing (`npm run tokens:validate-semantic`)

---

**See Also:**

- [Design Tokens Reference](dev-docs/2-areas/design/design-tokens.md) - Complete token list
- [Token Build Workflow](dev-docs/2-areas/design/design-tokens.md#token-build-workflow) - Build process details
- [Semantic Token Rules](dev-docs/2-areas/design/design-tokens.md#semantic-token-reference-rules) - Reference rules
- [Troubleshooting Guide](dev-docs/2-areas/design/design-tokens.md#troubleshooting-guide) - Common errors and solutions
