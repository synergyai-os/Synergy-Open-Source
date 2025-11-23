# Design Token Mapping Guide

**Purpose**: Authoritative mapping between component props and design tokens.

**For AI Agents**: When you don't know which token to use → **ASK THE USER** (don't guess, don't disable ESLint)

---

## 📋 Icon Size Mapping

### Available Tokens

```css
--size-iconxs:  12px  /* 0.75rem */
--size-iconsm:  16px  /* 1rem    */
--size-iconmd:  20px  /* 1.25rem */
--size-iconlg:  24px  /* 1.5rem  */
--size-iconxl:  32px  /* 2rem    */
```

### Component Prop → Token Mapping

**For components with `size?: 'sm' | 'md' | 'lg'` prop:**

| Component Prop | Design Token | Pixel Value | Usage |
|----------------|--------------|-------------|-------|
| `sm` | `--size-iconxs` | 12px | Compact UI (chips, close buttons) |
| `md` (default) | **`--size-iconsm`** | **16px** | **Default size (most common)** |
| `lg` | `--size-iconmd` | 20px | Larger icons (prominent actions) |

**Examples:**
- `<Loading size="md" />` → Uses `--size-iconsm` (16px)
- `<Spinner size="sm" />` → Uses `--size-iconxs` (12px)
- `<Icon size="lg" />` → Uses `--size-iconmd` (20px)

---

## 🎯 Implementation Pattern

### ✅ CORRECT: Use CSS Custom Properties in Style Attribute

```javascript
// ✅ CORRECT: Maps component prop to design token
const sizeStyle = $derived(
  size === 'sm'
    ? 'width: var(--size-iconxs); height: var(--size-iconxs);'
    : size === 'lg'
      ? 'width: var(--size-iconmd); height: var(--size-iconmd);'
      : 'width: var(--size-iconsm); height: var(--size-iconsm);' // md (default)
);

<svg style={sizeStyle}>
```

**Why this works:**
- ✅ Uses design tokens (cascade works)
- ✅ ESLint clean (no hardcoded values)
- ✅ Browser gets explicit dimensions
- ✅ Industry standard (Chakra UI pattern)

### ❌ WRONG: Hardcoded Pixel Values

```javascript
// ❌ WRONG: Hardcoded pixels, ESLint disabled
const dimensions = $derived(
  // eslint-disable-next-line synergyos/no-hardcoded-design-values
  size === 'sm' ? 12 : 20 : 16
);

<svg width={dimensions} height={dimensions}>
```

**Why this is wrong:**
- ❌ Breaks design token cascade
- ❌ Bypasses ESLint enforcement
- ❌ Requires manual updates if tokens change
- ❌ Violates design system principles

---

## 📖 Avatar Size Mapping

### Available Tokens

```css
--size-avatarsm:  32px  /* 2rem   */
--size-avatarmd:  40px  /* 2.5rem */
--size-avatarlg:  48px  /* 3rem   */
```

### Component Prop → Token Mapping

| Component Prop | Design Token | Pixel Value | Usage |
|----------------|--------------|-------------|-------|
| `sm` | `--size-avatarsm` | 32px | Small avatars (inline, comments) |
| `md` (default) | `--size-avatarmd` | 40px | Default avatar size |
| `lg` | `--size-avatarlg` | 48px | Large avatars (profile pages) |

---

## ⚠️ When You Don't Know Which Token to Use

### For AI Agents: ASK THE USER

**If you're uncertain about token mapping:**

1. ⛔ **DON'T** guess
2. ⛔ **DON'T** use hardcoded values
3. ⛔ **DON'T** disable ESLint
4. ✅ **DO** ask the user: "Which design token should I use for [component] [size prop]?"

**Example:**
> "I'm implementing a Button component with `size='md'`. Should I use:
> - `--size-iconsm` (16px)
> - `--size-iconmd` (20px)
> - `--size-iconlg` (24px)
> 
> Or a different token? Please clarify the correct mapping."

---

## 🔄 Adding New Component Size Mappings

**When creating a new component with size variants:**

1. **Check this document** for existing patterns
2. **If unclear** → Ask user for token mapping
3. **Document the mapping** in this file
4. **Use the established pattern** (CSS custom properties in style attribute)

**Example workflow:**
```
AI: "I'm creating a Badge component with size variants. Should I use icon tokens or create new badge tokens?"
User: "Use icon tokens: sm → iconxs, md → iconsm, lg → iconmd"
AI: [Implements using correct tokens, updates this document]
```

---

## 📊 Token Naming Convention

**Pattern**: `--size-{category}{scale}`

**Categories:**
- `icon` - Icon dimensions
- `avatar` - Avatar dimensions
- `button` - Button dimensions
- Custom categories as needed

**Scales:**
- `xs`, `sm`, `md`, `lg`, `xl`, `2xl` (standardized across categories when possible)

---

## 🎯 Quick Reference: Most Common Mappings

| Use Case | Default Token | Pixel Value |
|----------|---------------|-------------|
| Icon (default) | `--size-iconsm` | 16px |
| Loading spinner (default) | `--size-iconsm` | 16px |
| Avatar (default) | `--size-avatarmd` | 40px |
| Button min-height | `--size-buttonheight` | 44px |

---

**Last Updated**: 2025-11-22  
**Purpose**: Prevent token mapping confusion and ESLint workarounds  
**Audience**: AI agents, developers working with size variants

