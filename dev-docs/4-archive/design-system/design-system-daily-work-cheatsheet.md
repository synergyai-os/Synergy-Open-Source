# SynergyOS Design System - Quick Reference

**Last Updated**: 2024-11-20  
**Version**: Phase 3 (Production Optimization)

---

## 🚀 Quick Start Commands

```bash
# Development
npm run dev                 # Start dev server
npm run lint                # Validate design system compliance
npm run type-check          # TypeScript validation
npm run ci:quick            # Full validation (lint + type-check)

# Storybook (when available)
npm run storybook           # Component playground
npm run build-storybook     # Build static Storybook
```

---

## 📁 File Locations

| Resource                 | Path                                |
| ------------------------ | ----------------------------------- |
| **Token Source**         | `design-system-test.json`           |
| **Token Implementation** | `src/app.css` (soon: `src/styles/`) |
| **Styled Components**    | `src/lib/components/ui/`            |
| **Primitives**           | `src/lib/components/ui/primitives/` |
| **Feature Components**   | `src/lib/[feature]/components/`     |
| **Documentation**        | `dev-docs/2-areas/design/`          |
| **AI Rules**             | `.cursorrules-synergy`              |

---

## 🎨 Token Usage Cheat Sheet

### Colors

```svelte
<!-- ✅ Correct: Semantic tokens -->
<div class="bg-primary text-primary-foreground">
<div class="bg-secondary text-secondary-foreground">
<div class="bg-accent text-accent-foreground">
<div class="bg-surface text-on-surface">

<!-- ❌ Wrong: Arbitrary or raw values -->
<div class="bg-[#3b82f6] text-white">
<div class="bg-blue-500 text-gray-900">
```

### Spacing (SYOS-403 Base Scale)

```svelte
<!-- ✅ Correct: Base scale tokens -->
<div class="p-4 m-2 gap-6">        <!-- Uses --spacing-4, --spacing-2, --spacing-6 -->
<div class="p-card-padding">        <!-- Uses semantic alias -->
<button class="px-button-padding-md py-2">

<!-- ❌ Wrong: Arbitrary values -->
<div class="p-[16px] m-[8px]">
```

### Typography

```svelte
<!-- ✅ Correct: Semantic typography -->
<h1 class="text-heading-xl font-heading">
<h2 class="text-heading-lg font-heading">
<p class="text-body-md font-body">
<span class="text-caption text-muted-foreground">

<!-- ❌ Wrong: Raw scale values -->
<h1 class="text-4xl font-bold">
<p class="text-base">
```

---

## 🧩 Component Layers (Quick Classifier)

| Question                    | Answer | Layer                                          |
| --------------------------- | ------ | ---------------------------------------------- |
| Has ZERO styling?           | Yes    | **Layer 1: Primitive** → `ui/primitives/`      |
| Single interactive element? | Yes    | **Layer 2: Styled** → `ui/`                    |
| Combines 2-3 atoms?         | Yes    | **Layer 3: Composite** → `ui/composites/`      |
| Feature-specific logic?     | Yes    | **Layer 4: Feature** → `[feature]/components/` |

---

## ✅ Component Creation Checklist (30 Seconds)

**Before coding:**

- [ ] Check if component exists: `ls src/lib/components/ui/`
- [ ] Classify into layers (use table above)
- [ ] Review reference: `Button.svelte` for patterns

**While coding:**

- [ ] Use ONLY semantic tokens (`bg-primary` not `bg-blue-500`)
- [ ] Follow variant + size + class prop pattern
- [ ] Svelte 5 syntax (`$props()`, `$derived`, `$effect`)
- [ ] TypeScript Props interface

**After coding:**

- [ ] Run `npm run lint` ✅
- [ ] Test visually in `npm run dev` ✅
- [ ] Create `index.ts` barrel export ✅
- [ ] Add JSDoc comments ✅

---

## 🚫 Forbidden Patterns (Auto-Blocked by ESLint)

| Pattern                         | Block Reason       | Fix                                       |
| ------------------------------- | ------------------ | ----------------------------------------- |
| `class="bg-[#3b82f6]"`          | Arbitrary color    | `class="bg-primary"`                      |
| `class="p-[16px]"`              | Arbitrary spacing  | `class="p-4"` or `class="p-card-padding"` |
| `style="..."`                   | Inline styles      | Use Tailwind utilities                    |
| `class="bg-blue-500"`           | Raw Tailwind scale | `class="bg-primary"`                      |
| `<button class="...">` in pages | Raw HTML           | `<Button>` from `$lib/components/ui`      |

---

## 📦 Import Patterns

```svelte
<!-- ✅ Correct: Import from design system -->
<script>
  import { Button, Input, Card } from '$lib/components/ui';
</script>

<Button variant="primary">Click</Button>
<Input type="email" bind:value={email} />

<!-- ❌ Wrong: Raw HTML elements -->
<script>
  // No imports
</script>

<button class="bg-blue-500">Click</button>
<input type="email" bind:value={email} />
```

---

## 🔧 Component Modification Safety

**Golden Rule**: **Add, don't replace. Deprecate, don't delete.**

```typescript
// ✅ Safe: Add new variant
interface Props {
	variant?: 'primary' | 'secondary' | 'ghost' | 'outline'; // Added 'outline'
}

// ❌ Breaking: Rename variant
interface Props {
	variant?: 'main' | 'alternate'; // Changed 'primary' to 'main' ❌
}

// ✅ Safe: Deprecate old pattern
interface Props {
	/** @deprecated Use 'variant="outline"' instead */
	ghost?: boolean;
	variant?: 'primary' | 'secondary' | 'outline';
}
```

---

## 🎯 Current Phase 3 Priorities

| Task                                 | Status         | Files Affected               |
| ------------------------------------ | -------------- | ---------------------------- |
| **SYOS-403**: Base spacing scale     | 🔄 In Progress | `src/app.css`                |
| **SYOS-390**: Specialized components | 📋 Planned     | `ui/avatar/`, `ui/skeleton/` |
| **SYOS-373**: Modular CSS split      | 📋 Planned     | `src/styles/*` (11 files)    |
| **SYOS-389**: Storybook integration  | 📋 Planned     | `*.stories.ts` files         |

---

## 🔍 Quick Debugging

### ESLint Blocking Build?

```bash
# 1. Check what failed
npm run lint

# 2. Look for pattern in error
# Example: "Arbitrary value bg-[#abc] not allowed"

# 3. Replace with semantic token
# bg-[#3b82f6] → bg-primary
# p-[16px] → p-4 or p-card-padding

# 4. Re-run
npm run lint
```

### Component Not Showing Styles?

```bash
# 1. Check token exists
cat src/app.css | grep "color-primary"

# 2. Verify class is correct
# bg-primary (correct)
# bg-blue-500 (wrong - use semantic)

# 3. Restart dev server
npm run dev

# 4. Inspect element in browser
# Check computed styles
```

### AI Tool Generating Wrong Code?

```bash
# 1. Verify .cursorrules-synergy exists
ls -la .cursorrules-synergy

# 2. Update prompt to be explicit
"Create a button using our Button component from $lib/components/ui"

# 3. Validate after generation
npm run lint
```

---

## 📚 Documentation Quick Links

| Resource                    | Purpose                                |
| --------------------------- | -------------------------------------- |
| `design-tokens.md`          | Full token reference + governance      |
| `component-architecture.md` | 4-layer system explained               |
| `design-system-test.json`   | Token specifications (source of truth) |
| `.cursorrules-synergy`      | AI generation rules                    |
| `SYNERGY_AUDIT_GUIDE.md`    | Optimization playbook                  |

---

## 💡 Pro Tips

### 1. Finding Usages Before Changing

```bash
# Find all usages of a component
grep -r "import.*Button" src/

# Find all usages of a token
grep -r "bg-primary" src/

# Find all raw HTML buttons
grep -rn "<button" src/routes/
```

### 2. Testing Token Cascade

```bash
# 1. Change token temporarily in src/app.css
--color-primary: oklch(0.7 0.2 250);  # Lighter

# 2. Start dev, verify change visible
npm run dev

# 3. Revert
--color-primary: oklch(0.5 0.2 250);  # Original

# 4. Verify revert worked
# All primary elements back to normal
```

### 3. Creating New Component Fast

```bash
# 1. Copy reference component
cp -r src/lib/components/ui/button src/lib/components/ui/my-component

# 2. Rename files
mv src/lib/components/ui/my-component/Button.svelte MyComponent.svelte

# 3. Update content following Button pattern

# 4. Update barrel export
# src/lib/components/ui/my-component/index.ts

# 5. Validate
npm run lint
```

---

## ⚠️ Common Pitfalls

| Mistake                      | Why Bad             | Fix                     |
| ---------------------------- | ------------------- | ----------------------- |
| Bypassing pre-commit hook    | Breaks governance   | Don't use `--no-verify` |
| Changing variant names       | Breaks production   | Add new, deprecate old  |
| Using `bg-blue-500`          | Not semantic        | Use `bg-primary`        |
| Inline styles                | Can't theme         | Use Tailwind utilities  |
| Raw `<button>` in pages      | Not design system   | Import `<Button>`       |
| Modifying token without test | Risk cascade breaks | Test → change → revert  |

---

## 🎓 Learning Resources

**New to SynergyOS Design System?**

1. Read `component-architecture.md` (15 min)
2. Study `Button.svelte` (reference pattern) (10 min)
3. Create first component using template (30 min)
4. Review this Quick Reference daily

**AI Tool User?**

1. Ensure `.cursorrules-synergy` in project root
2. Always mention "using SynergyOS design system" in prompts
3. Run `npm run lint` after AI generation
4. Review AI output before committing

**Contributing New Components?**

1. Check existing components first
2. Follow 4-layer classification
3. Copy `Button.svelte` as template
4. Use ONLY semantic tokens
5. Add JSDoc comments
6. Create Storybook story (when Storybook added)

---

## 📊 Success Metrics (Track Weekly)

| Metric                    | Current | Target | Trend |
| ------------------------- | ------- | ------ | ----- |
| **Token Coverage**        | 85%     | 95%+   | ↑     |
| **ESLint Pass Rate**      | 98%     | 100%   | ↑     |
| **Components Documented** | 10%     | 100%   | ↑     |
| **AI Code Compliance**    | Unknown | 90%+   | →     |

---

## 🆘 Getting Help

**Documentation Issue?**

- Check `dev-docs/2-areas/design/`
- Review `.cursorrules-synergy`

**Technical Issue?**

- Run `npm run ci:quick` for full validation
- Check ESLint output for specific errors
- Review this Quick Reference

**Design System Question?**

- Consult `design-tokens.md`
- Review `component-architecture.md`
- Study existing components in `ui/`

---

**Keep this page bookmarked for daily reference!** 📌
