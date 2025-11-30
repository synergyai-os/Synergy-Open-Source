# Match Design System

Refactor components to be design system compliant using the Recipe System (CVA).

---

## ⚠️ STOP - READ BEFORE DOING ANYTHING

### 🚨 NON-NEGOTIABLE RULES (WILL CAUSE REWORK IF VIOLATED)

**1. NEVER CREATE OR EDIT CSS FILES**
```
src/styles/utilities/*.css  ← AUTO-GENERATED - NEVER TOUCH
```
If you need a new utility: `design-tokens-semantic.json` → `npm run tokens:build` → utility exists.

**2. NEVER USE HARDCODED TAILWIND**
```
❌ gap-2, px-4, mb-8, text-gray-500, bg-blue-100, rounded-lg
✅ gap-button, px-button, mb-header, text-secondary, bg-surface, rounded-button
```

**3. ALWAYS USE RECIPE SYSTEM**
```svelte
// ✅ Recipe handles all styling
const classes = $derived(buttonRecipe({ variant, size }));

// ❌ Manual class mapping = WRONG
const classes = size === 'sm' ? 'px-2' : 'px-4';
```

**4. VALIDATE BEFORE COMPLETING**
```bash
npm run validate:design-system  # MUST PASS before marking complete
```

**Detection:** If you're typing CSS into `.css` files or using `gap-2`, `px-4`, etc. → STOP. You're doing it wrong.

**Reference:** `design-tokens-enforcement.mdc` rule is auto-applied for all .svelte/.css files.

---

## Process

### 0.0 Decision-Making: Confirm Lasting Impact Decisions

**CRITICAL**: Before making decisions that have lasting impact, **ALWAYS ask for user confirmation first**.

**Decisions requiring confirmation**:
- **Component naming** (e.g., `NavItem` vs `SidebarMenuItem`, `ActionMenu` vs `ToolbarMenu`)
- **API design** (prop names, variant names, component structure)
- **Architectural choices** (component location, module vs shared, atomic design level)
- **Breaking changes** (renaming components, changing prop APIs)
- **New patterns** (introducing new design patterns or conventions)
- **File structure** (moving components, reorganizing directories)

**When to ask**:
- Before implementing a new component name
- Before choosing between multiple valid naming options
- Before making architectural decisions (where to place component)
- Before introducing new patterns or conventions
- When unsure between options that have different trade-offs

**How to ask**:
1. **Present the decision** clearly with context
2. **Explain the options** and their trade-offs
3. **Recommend an approach** with rationale
4. **Wait for confirmation** before proceeding

**Example**:
```
I'm creating a navigation menu item component. I have two naming options:

1. `SidebarMenuItem` - Context-specific, clear but limits reuse
2. `NavItem` - Generic, reusable in sidebars, dropdowns, top nav, etc.

Recommendation: `NavItem` because it's reusable and matches existing patterns 
(MetadataBar, ActionMenu). Context comes from parent component.

Which name should I use?
```

**Exception**: Trivial decisions (e.g., internal variable names, temporary code) don't require no confirmation.

### 0. Development Workflow: Test First, Comply Second

**KEY INSIGHT**: For complex styling changes, it's often better to:

1. **Prototype outside the design system first** - Use inline styles or temporary hardcoded values to validate the visual result
2. **Test and iterate** - Get confirmation that the approach works visually
3. **Then make it compliant** - Once validated, migrate to semantic tokens, recipes, and design system patterns
4. **Validate before closing** - Run `npm run validate:design-system` and ensure all checks pass

**Why this works:**
- **Faster iteration**: Don't get blocked by missing tokens or utility generation issues while exploring
- **Visual validation first**: Ensures the end result is correct before investing in compliance
- **Clear separation**: Experimentation vs. production-ready code

**Example workflow:**
```svelte
<!-- 1. Prototype with inline styles -->
<div style="padding: 12px; gap: 8px;">Test layout</div>

<!-- 2. User confirms: "Yes, this looks right!" -->

<!-- 3. Now make compliant -->
<div class="inset-md gap-fieldGroup">Test layout</div>

<!-- 4. Run npm run validate:design-system -->
```

**IMPORTANT**: Never commit non-compliant code. Always complete the compliance step before marking done.

### 0.1 Audit Usage Sites (BEFORE starting)
- **Find all usage sites**: `grep -r "text-secondary\|text-primary\|font-semibold" src/` (adjust pattern for your component)
- **Count affected files**: Document how many files/components need updating
- **Identify dependencies**: Which components use this component? (affects migration order)

### 1. Create/Update Recipe (`src/lib/design-system/recipes/[component].recipe.ts`)
- Use CVA with variants for all styling
- **ONLY use design token utilities** - check `src/styles/utilities/` for available utilities
- **NEVER use Tailwind defaults** (`text-sm`, `font-semibold`, etc.) - use design tokens (`fontSize-sm`, `fontWeight-semibold`)
- Map variants to design token utilities (no hardcoded values)
- Export from `recipes/index.ts`
- Document exceptions only if absolutely necessary (one line max)

### 1.1 Verify Recipe Uses Semantic Tokens (MANDATORY)
- **Quick validation during development**: `npm run validate:tokens [path/to/component]` - Fast feedback for specific files:
  - No hardcoded Tailwind spacing (gap-2, mb-4, p-3, etc.)
  - No hardcoded Tailwind colors (text-gray-500, bg-blue-100, etc.)
  - All classes are either semantic tokens or allowed layout primitives
- **Comprehensive validation before completion**: `npm run validate:design-system` - Runs all design system checks:
  - `tokens:build` - Ensures utilities are up-to-date
  - `validate:tokens` - Checks for hardcoded Tailwind (entire codebase)
  - `validate:utilities` - **NEW**: Verifies utility classes actually exist (catches missing utilities like `bg-accent-primary`)
  - `recipes:validate` - Validates recipes use semantic tokens correctly
  - `validate:css-conflicts` - Checks for CSS conflicts
- **Important**: We only check `design-tokens-semantic.json`, NOT `design-tokens-base.json` because:
  - Base tokens (spacing.2, spacing.3, etc.) do NOT generate utilities (see transforms.js line 141)
  - Only semantic tokens (spacing.button.gap, color.interactive.primary) generate utilities
  - Recipes should use semantic token utilities (`gap-button`) not base token values (`gap-2`)
- **Cross-reference recipe with `design-tokens-semantic.json`**: Check that all component-specific semantic tokens are being used
  - For buttons: verify `spacing.button.*`, `color.interactive.*`, `borderRadius.button` are used
  - For inputs: verify `spacing.input.*`, `color.component.input.*`, `borderRadius.input` are used
  - Pattern: `grep -E "spacing\.(button|input|card)" design-tokens-semantic.json` to find all tokens
- **Verify utilities exist**: The new `validate:utilities` command automatically checks this, but you can manually verify:
  ```bash
  grep "^@utility bg-interactive-primary" src/styles/utilities/*.css
  grep "^@utility gap-button" src/styles/utilities/*.css
  ```
- **Check for non-existent utilities**: `validate:utilities` will catch these automatically (e.g., `bg-accent-primary` used but doesn't exist)
- **Document mismatches**: If semantic token exists but utility doesn't, add to `missing-styles.md` and fix token generation

### 2. Determine Component Type (Atomic Design Hierarchy)

**CRITICAL**: Before updating, determine the component's atomic design level and whether it's module-specific:

- **Atom** (`src/lib/components/atoms/`): Single element (Button, Input, Text, Badge, Card)
- **Molecule** (`src/lib/components/molecules/`): 2-3 atoms combined (FormInput, SearchBar, FormField)
- **Organism** (`src/lib/components/organisms/`): Complex sections (Dialog, Header, Sidebar, LoginBox)
- **Module Component** (`src/lib/modules/[module]/components/`): Feature-specific, business logic, module-specific
- **Page/Template** (`src/routes/` or `src/lib/components/templates/`): Full page layouts

**Decision Tree**:
1. **Is it module-specific?** (has business logic, domain-specific, used by single module)
   - Yes → Module Component (`src/lib/modules/[module]/components/`)
   - No → Continue to atomic design classification
2. **Atomic Design Classification**:
   - Single interactive element? → Atom
   - Combines 2-3 atoms? → Molecule
   - Complex section with multiple molecules? → Organism
   - Full page layout? → Page/Template

**Module vs Shared Component**:
- **Module Component** (`src/lib/modules/[module]/components/`): 
  - Domain-specific (meetings, inbox, org-chart)
  - Has business logic (data fetching, mutations, domain-specific behavior)
  - Connects to backend (Convex queries/mutations)
  - Used by single module
  - Examples: `MeetingCard`, `InboxCard`, `CircleDetailPanel`
  - **Rule**: If component is domain-specific with business logic → Module Component
- **Shared Component** (`src/lib/components/[atoms|molecules|organisms]/`):
  - Generic, reusable across modules
  - No business logic (presentational only)
  - Used across multiple modules
  - Examples: `Button`, `Text`, `Icon`, `Avatar`, `FormInput`, `Dialog`
  - **Rule**: If component is used by multiple modules → Shared Component
- **Decision Tree**:
  ```
  Is it domain-specific with business logic?
  ├─ YES → Module Component (src/lib/modules/[module]/components/)
  └─ NO → Is it reusable across modules?
      ├─ YES → Shared Component (src/lib/components/[atoms|molecules|organisms]/)
      └─ NO → Still Shared Component (generic, no business logic)
  ```

### 2.1 Update Atom Component (`src/lib/components/atoms/[Component].svelte`)
- **Check for Bits UI component first**: 
  - Use Context7 or codebase search to check if component exists in `bits-ui`
  - If component exists (e.g., `Button`, `Input`), import and use it: `import { Input as BitsInput } from 'bits-ui'`
  - If not (e.g., `Text`, `Heading`), use native HTML elements (`<p>`, `<h1>`, etc.)
- Import recipe: `import { [component]Recipe } from '$lib/design-system/recipes'`
- **Apply recipe to Bits UI component or native element** - recipe handles ALL styling
- Replace manual class mapping with `recipe({ variant, size, color })`
- Add props matching recipe variants
- Use `$derived` with array syntax for class computation (Svelte 5.16+):
  ```svelte
  const classes = $derived([recipe({ variant, size, color }), className])
  ```
  - Array syntax handles empty strings/undefined automatically (no manual `.trim()` needed)
- **No styling in component** - recipe is the single source of styling
- **No internal atoms** - atoms are the smallest building blocks, they don't compose other atoms

### 2.2 Update Molecule Component (`src/lib/components/molecules/[Component].svelte`)
- **MUST use atoms internally** - molecules compose atoms, not hardcoded HTML
- **Text/Labels**: If molecule contains text or labels, use `<Text>` component:
  ```svelte
  <label for={inputId}>
    <Text variant="body" size="sm" color="default" as="span" class="font-medium">
      {label}
    </Text>
  </label>
  ```
  - **Why**: When text styles change, labels automatically inherit changes
  - **Semantic HTML**: Keep semantic elements (`<label>`, `<form>`) but use Text component for typography
- **Layout only**: Molecules handle layout/spacing (`gap-*`, `flex`, `grid`), atoms handle styling
- **Example**: FormInput (molecule) uses Text (atom) for label, Input (atom) for input field
- **No recipes for molecules** - molecules don't have recipes, they compose atoms with recipes
- **Exception**: If molecule needs its own styling variants, create a recipe, but still use atoms internally

### 2.3 Update Organism Component (`src/lib/components/organisms/[Component].svelte`)
- **Use molecules and atoms** - organisms compose molecules and atoms
- **Layout and composition** - organisms handle complex layouts and state management
- **Use semantic spacing tokens** for all spacing:
  - `gap-header` for header element gaps
  - `mb-header` for header bottom margins
  - `gap-form` for form field gaps
  - `gap-fieldGroup` for tightly related elements
  - `mb-alert` for alert/message margins
  - `size-icon-md` for icon sizing
- **Recipe for container styling** - organisms CAN have recipes for their container (e.g., `loginBoxRecipe`)
- **Example**: LoginBox (organism) uses FormInput (molecule), Button (atom), Text (atom)

### 2.4 Update Module Component (`src/lib/modules/[module]/components/[Component].svelte`)
- **Use shared components** - module components compose atoms, molecules, and organisms from design system
- **Business logic allowed** - module components can have domain-specific logic, data fetching, mutations
- **No recipes** - module components don't have recipes, they use shared components with recipes
- **Exception**: If module component needs its own styling variants (e.g., selected/unselected states), create a recipe, but still use shared components internally
- **Text/Labels**: Use `<Text>` component for all text content (same as molecules)
- **Layout and composition** - module components handle module-specific layouts and state
- **Example**: InboxCard (module component) uses Card (atom), Text (atom), Button (atom), Badge (atom), and has `inboxCardRecipe` for selected/unselected styling variants
- **Content vs Styling**: Recipes handle CSS styling (colors, borders, spacing) → returns CSS class strings. Components handle content/data/business logic (icons, text, computed values) → returns actual content. Example: `getTypeIcon()` function stays in component because it returns emoji strings (content), not CSS classes (styling)
- **Icon Props**: Icons should be passed as props from data (`item.icon`) rather than hardcoded in component. Use fallback pattern: `const icon = $derived(item.icon ?? getTypeIcon(item.type))`
- **Import pattern**: 
  ```svelte
  import { Card, Text, Button } from '$lib/components/atoms';
  import { FormInput } from '$lib/components/molecules';
  ```
- **Cross-module imports**: Module components MUST NOT import from other modules (enforced by ESLint)

### 2.5 Update Page/Template Component (`src/routes/[route]/+page.svelte` or `src/lib/components/templates/[Template].svelte`)
- **Use organisms, molecules, atoms, and module components** - pages compose all component types
- **Layout and routing** - pages handle routing, data fetching, and page-level layout
- **No recipes** - pages don't have recipes, they compose components
- **Use semantic page tokens**: `px-page`, `py-page` for page padding
- **Page-level effects** (gradients, backgrounds) can use inline values with documentation:
  ```svelte
  <!--
    Page Background
    - Uses semantic token bg-subtle
    - Radial gradient uses brand hue (195) at 8% opacity for subtle depth
    - This is a page-level effect, not a design token (intentional)
  -->
  <div class="bg-subtle">
    <div class="bg-radial-[at_50%_35%] from-[oklch(55%_0.12_195_/_0.08)] ...">
  ```
- **Example**: Login page uses LoginBox (organism), semantic page tokens

### 3. Update Usage Sites
- Replace hardcoded color classes (`class="text-secondary"`) with props (`color="secondary"`)
- Replace hardcoded spacing with semantic tokens:
  - `mb-8` → `mb-header` (32px)
  - `mb-6` → `mb-alert` (24px)
  - `gap-3` → `gap-header` (12px)
  - `gap-2` → `gap-fieldGroup` (8px)
  - `mt-2` → `mt-fieldGroup` (8px)
  - `h-5 w-5` → `size-icon-md` (20px)
- Keep only layout primitives (`flex`, `items-center`, `text-center`) and semantic tokens
- **Migration order**: Start with leaf components (no dependencies) → composite components → page-level components

### 4. Validate with Svelte MCP Autofixer
- **MANDATORY**: Run Svelte MCP autofixer on component before marking complete
- Use `svelte-autofixer` tool to validate:
  - Correct `$derived` usage
  - Proper `$props` destructuring
  - Class handling follows Svelte 5 best practices
  - No deprecated patterns
- Fix any issues reported by autofixer

### 5. Run Full Test Suite (MANDATORY)
**ALWAYS run these validations before marking any component complete:**

```bash
# Quick check during development (specific file)
npm run validate:tokens [path/to/component]

# Comprehensive design system validation (before completion)
npm run validate:design-system

# TypeScript/Svelte check
npm run check
```

**Validation Strategy:**
- **During development**: Use `validate:tokens [path]` for quick feedback on specific files
- **Before completion**: Use `validate:design-system` which runs:
  1. `tokens:build` - Builds tokens (ensures utilities are current)
  2. `validate:tokens` - Checks for hardcoded Tailwind (entire codebase)
  3. `validate:utilities` - Verifies utility classes exist (catches missing utilities)
  4. `recipes:validate` - Validates recipes use semantic tokens
  5. `validate:css-conflicts` - Checks for CSS conflicts

**If any validation fails:**
1. Fix the issue if possible (use semantic tokens, add missing tokens)
2. If a token/utility is MISSING from the design system, go to Step 6
3. Do NOT proceed until all validations pass OR workarounds are documented

### 6. Document Workarounds (REQUIRED when hardcoding)

**🚨 FIRST**: Before documenting a workaround, confirm the utility truly can't be generated:
1. Can you add a token to `design-tokens-semantic.json`? → Add token, run `npm run tokens:build`
2. Is the naming pattern not supported? → Update `scripts/style-dictionary/transforms.js`, run build
3. **NEVER manually edit `src/styles/utilities/*.css`** - always use the build system

**If you MUST use a hardcoded value because the design system lacks a token:**

1. **STOP and document in `ai-docs/tasks/missing-styles.md`** using this format:
   ```markdown
   ### `[utility-name]` (e.g., `text-error-secondary`)
   - **Location**: `[file path]` (line [number])
   - **Usage**: [What it's used for]
   - **Status**: Missing utility class
   - **Current Workaround**: [What you used instead]
   - **Proposed Solution**: Add to semantic tokens as `[token path]`
   - **Note**: [Any additional context]
   ```

2. **Add inline comment in code**:
   ```typescript
   // WORKAROUND: [utility] missing - see missing-styles.md
   'hardcoded-value-here'
   ```

3. **Create follow-up task**: Add to bottom of `missing-styles.md`:
   ```markdown
   ## Follow-up Tasks
   - [ ] Add `[token]` to `design-tokens-semantic.json`
   - [ ] Run `npm run tokens:build` to generate utility
   - [ ] Remove workaround from `[file]`
   ```

**When a workaround is fixed:**
1. Remove the entry from `missing-styles.md`
2. Remove inline `// WORKAROUND` comment
3. Re-run `npm run validate:design-system` to confirm

### 7. Create/Update Storybook Stories (MANDATORY)
**ALWAYS create or update Storybook stories for new/refactored components:**

**File Location**: Co-locate with component
- `src/lib/components/atoms/[Component].stories.svelte`
- `src/lib/components/molecules/[Component].stories.svelte`
- `src/lib/components/organisms/[Component].stories.svelte`

**Title Hierarchy**:
```typescript
// Design System (shared components)
'Design System/Atoms/ComponentName'      // Single elements
'Design System/Molecules/ComponentName'  // 2-3 atoms composed
'Design System/Organisms/ComponentName'  // Complex sections

// Modules (feature-specific)
'Modules/ModuleName/ComponentName'       // e.g., 'Modules/Meetings/ActionItemsList'
```

**Story Structure**:
```svelte
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ComponentName from './ComponentName.svelte';

  const { Story } = defineMeta({
    component: ComponentName,
    title: 'Design System/Molecules/ComponentName', // Adjust level
    tags: ['autodocs'],
    argTypes: {
      // All props with controls
      variant: { control: { type: 'select' }, options: ['default', 'primary'] },
      size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] }
    }
  });
</script>

<Story name="Default" args={{ variant: 'default', size: 'md' }}>
  {#snippet template(args)}
    <ComponentName {...args}>Content</ComponentName>
  {/snippet}
</Story>

<!-- Add stories for each variant/size combination -->
```

**Validation**:
- [ ] Story renders without errors
- [ ] All variants/sizes are covered
- [ ] Controls work correctly in Storybook UI
- [ ] Visual appearance matches design

**See**: `.cursor/commands/storybook.md` for detailed Storybook patterns

### 8. Validation Checklist
Before marking complete, verify ALL of these:

**Automated Checks (MUST PASS):**
- [ ] `npm run validate:design-system` - ✅ All design system checks pass (tokens, utilities, recipes, conflicts)
- [ ] `npm run check` - ✅ No TypeScript/Svelte errors

**Manual Checks:**
- [ ] Recipe uses ONLY design token utilities (no Tailwind defaults)
- [ ] **Recipe cross-referenced with `design-tokens-semantic.json`** - all component-specific tokens are used
- [ ] **All utilities in recipe verified to exist** (`grep "^@utility" src/styles/utilities/*.css`)
- [ ] Component uses `$derived` with array syntax for classes
- [ ] Svelte MCP autofixer reports no issues
- [ ] All usage sites updated (grep confirms no hardcoded classes)
- [ ] **Storybook story created/updated** - component documented in Storybook
- [ ] Visual regression checked (Storybook/browser)

**Workaround Documentation (if any hardcoded values):**
- [ ] Entry added to `ai-docs/tasks/missing-styles.md`
- [ ] Inline `// WORKAROUND` comment added
- [ ] Follow-up task created to fix token

**Sign-off:**
- [ ] All automated validations pass
- [ ] Any workarounds are documented
- [ ] Storybook story created/updated
- [ ] Component renders correctly in browser

## Visual Design Principles

**See**: `dev-docs/master-docs/design-system.md` section 9.1 for complete visual design principles.

**Quick reference:**
- **Compact but breathable**: Linear-inspired tight spacing without feeling cramped (use semantic tokens: `gap-header`, `gap-form`, `gap-fieldGroup`)
- **Soft shadows**: Multi-layered for natural depth
- **Micro-animations**: 200ms transitions, subtle hover effects
- **WCAG compliance**: Use `text-inverse` on dark backgrounds
- **Brand hue**: Consistent use of hue 195 (teal) in oklch

## Semantic Spacing Tokens

**See**: `dev-docs/master-docs/design-system.md` section 9.2 for complete semantic spacing token reference.

**Quick reference:** Use `gap-button`, `gap-header`, `gap-form`, `gap-fieldGroup`, `mb-header`, `mb-alert`, `size-icon-md` for all spacing. Never use numeric Tailwind spacing (`gap-2`, `mb-4`, etc.).

## Criteria

✅ **DO:**
- Use recipe system for variant management
- **ONLY use design token utilities** from `src/styles/utilities/`
- **Run `npm run validate:tokens` to verify** no hardcoded Tailwind
- **Cross-reference recipe with `design-tokens-semantic.json`** to ensure all component tokens are used
- Verify utilities exist before using them (`grep "^@utility" src/styles/utilities/*.css`)
- Check semantic tokens first: if `design-tokens-semantic.json` defines `spacing.button.gap`, use `gap-button` not `gap-2`
- Keep layout/spacing classes separate from styling
- Document missing utilities
- **Validate with Svelte MCP autofixer** before marking complete
- **Create/update Storybook stories** for all new/refactored components
- Use array syntax for class computation: `$derived([recipe(...), className])`
- **Molecules use atoms**: If molecule contains text/labels, use `<Text>` component
- **Module components use shared components**: Module components compose atoms/molecules/organisms
- **Check component type first**: Determine if component is atom/molecule/organism/module before refactoring
- **Check module vs shared**: If component is module-specific, place in `src/lib/modules/[module]/components/`
- **Use compact but breathable spacing**: Linear-inspired tight spacing without feeling cramped
- **Add micro-animations**: 200ms transitions, subtle hover effects
- **Use semantic opacity utilities**: `opacity-disabled` for disabled states, CSS variables for other opacity values
- **Use inline styles for skeleton dimensions**: Skeleton loading states use inline styles (no semantic tokens)

❌ **DON'T:**
- **🚨 NEVER EDIT AUTO-GENERATED CSS FILES** - See "Auto-Generated Files" edge case below
- **NEVER use Tailwind numeric spacing** (`gap-2`, `mb-4`, `p-3`, etc.) - use semantic tokens
- **NEVER use Tailwind color scales** (`text-gray-500`, `bg-blue-100`, etc.) - use semantic tokens
- **NEVER use hardcoded sizes** (`h-5`, `w-5`, etc.) - use semantic tokens (`size-icon-md`)
- **NEVER hardcode values** (even if they "match" tokens)
- Use color classes when recipe props exist
- Add long comments (one line max if needed)
- Mix styling concerns (layout vs. design tokens)
- Use string concatenation for classes (use array syntax instead)
- **NEVER use recipes directly in molecules** - molecules should use atoms, not recipes
- **NEVER hardcode text in molecules** - use `<Text>` component for all text content
- **NEVER create atoms that compose other atoms** - atoms are the smallest building blocks
- **NEVER put module-specific components in shared components** - use `src/lib/modules/[module]/components/`
- **NEVER import module components from other modules** - modules are isolated (ESLint enforced)
- **NEVER use overly cramped spacing** - compact doesn't mean cramped, maintain breathability

## Allowed Layout Primitives

These Tailwind classes are ALLOWED (structural, not design):
- **Flexbox**: `flex`, `flex-col`, `flex-row`, `items-center`, `justify-center`, `flex-shrink-0`
- **Grid**: `grid`, `grid-cols-*`, `col-span-*`
- **Positioning**: `relative`, `absolute`, `fixed`, `inset-0`
- **Text alignment**: `text-center`, `text-right`, `text-left`
- **Overflow**: `overflow-hidden`, `overflow-auto`
- **Sizing constraints**: `w-full`, `min-h-screen`, `max-w-md`
- **Pointer events**: `pointer-events-none`
- **Font weights** (until tokenized): `font-medium`, `font-semibold`
- **Text decoration**: `underline`, `hover:underline`

## Component Naming Conventions

### Generic Names Over Context-Specific Names

**CRITICAL**: Use generic, reusable names for shared components (atoms/molecules/organisms). Avoid context-specific prefixes that limit reuse.

**IMPORTANT**: Before choosing a component name, **ask for user confirmation** if multiple valid options exist or if the name has architectural implications (see Decision-Making section above).

**Rule**: Component names should reflect **what it is** (structure/function), not **where it's used** (context/location).

**Examples**:
```typescript
// ✅ CORRECT: Generic names - reusable everywhere
NavItem.svelte          // Works in sidebar, dropdown, top nav, breadcrumbs
MetadataBar.svelte      // Works in cards, headers, footers
ActionMenu.svelte       // Works in toolbars, context menus, headers

// ❌ WRONG: Context-specific names - limits reuse
SidebarMenuItem.svelte  // Implies sidebar-only usage
HeaderMetadataBar.svelte // Implies header-only usage
ToolbarActionMenu.svelte // Implies toolbar-only usage
```

**Why Generic Names?**:
1. **Reusability**: Component can be used in multiple contexts (sidebar, dropdown, top nav, etc.)
2. **Context comes from usage**: The parent component (`Sidebar`, `DropdownMenu`, etc.) provides context
3. **Atomic Design Principle**: Molecules/organisms are reusable compositions - naming should reflect structure, not location
4. **Consistency**: Matches existing codebase patterns (`MetadataBar`, `ActionMenu`, `ToggleSwitch`)

**When Context-Specific Names Are OK**:
- **Module Components**: Domain-specific components can have context (e.g., `InboxCard`, `MeetingCard`) because they're module-specific
- **Organisms**: Complex sections that are truly context-specific (e.g., `Sidebar`, `Header`) - but these are organisms, not reusable molecules

**Migration Pattern**:
```typescript
// Before: Context-specific
SidebarMenuItem.svelte → sidebarMenuItemRecipe.ts

// After: Generic
NavItem.svelte → navItemRecipe.ts

// Usage stays the same - context comes from parent
<Sidebar>
  <NavItem href="/inbox" iconType="inbox" label="Inbox" />
</Sidebar>

<DropdownMenu>
  <NavItem href="/settings" iconType="settings" label="Settings" />
</DropdownMenu>
```

## Atomic Design Principles

### Molecules Must Use Atoms
- **Rule**: Molecules MUST use atoms internally, not hardcoded HTML with recipes
- **Example**: FormInput (molecule) should use `<Text>` component for labels, not `<label class={formInputLabelRecipe()}>`
- **Benefit**: When atom styles change (e.g., Text component), molecules automatically inherit changes
- **Pattern**: 
  ```svelte
  <!-- ✅ CORRECT: Molecule uses Text atom -->
  <label for={inputId}>
    <Text variant="body" size="sm" as="span">{label}</Text>
  </label>
  
  <!-- ❌ WRONG: Molecule uses recipe directly -->
  <label for={inputId} class={formInputLabelRecipe()}>{label}</label>
  ```

### Component Classification
- **Check component location first**: 
  - `src/lib/components/atoms/` → Atom (single element)
  - `src/lib/components/molecules/` → Molecule (2-3 atoms)
  - `src/lib/components/organisms/` → Organism (complex section)
  - `src/lib/modules/[module]/components/` → Module component (feature-specific, business logic)
- **If misclassified**: Move component to correct location before refactoring
- **Example**: FormInput was in `atoms/` but is actually a molecule (Label + Input), should be in `molecules/`
- **Module vs Shared**: 
  - Used by multiple modules? → Shared component (atoms/molecules/organisms)
  - Used by single module? → Module component (`src/lib/modules/[module]/components/`)
  - Has business logic/domain-specific? → Module component

### Text Component Usage
- **When to use**: Any text content in molecules/organisms should use `<Text>` component
- **Semantic HTML**: Keep semantic elements (`<label>`, `<p>`, `<h1>`) but wrap text content with `<Text>`
- **Props**: Use appropriate variant (`body`, `label`, `caption`), size (`sm`, `base`, `lg`), and `as` prop for semantic element
- **Example**: 
  ```svelte
  <label for={id}>
    <Text variant="body" size="sm" as="span" class="font-medium">
      Label text
    </Text>
  </label>
  ```

## Edge Cases

### 🚨 Auto-Generated Files (CRITICAL - NON-NEGOTIABLE)

**Problem**: Manually editing auto-generated CSS files breaks the design system cascade.

**AUTO-GENERATED FILES - NEVER EDIT DIRECTLY:**
```
src/styles/utilities/spacing-utils.css    ← AUTO-GENERATED
src/styles/utilities/color-utils.css      ← AUTO-GENERATED
src/styles/utilities/typography-utils.css ← AUTO-GENERATED
src/styles/utilities/component-utils.css  ← AUTO-GENERATED
src/styles/utilities/opacity-utils.css    ← AUTO-GENERATED
```

**How to identify**: These files have a header comment `AUTO-GENERATED - DO NOT EDIT`

**Why this breaks things**:
1. Manual edits are overwritten on `npm run tokens:build`
2. Breaks the cascade: `tokens → build → utilities`
3. Creates inconsistency between tokens and utilities
4. Next developer running build will lose your changes

**The Correct Process for Adding New Utilities**:
1. **Add token to `design-tokens-semantic.json`** with correct naming pattern
2. **If build script doesn't support pattern**, update `scripts/style-dictionary/transforms.js`
3. **Run `npm run tokens:build`** to regenerate utilities
4. **Verify utility was generated**: `grep "^@utility my-utility-name" src/styles/utilities/*.css`

**Token Naming → Utility Generation Patterns** (in `transforms.js`):
| Token Path | Generated Utility | CSS Property |
|------------|-------------------|--------------|
| `spacing.foo.x` | `px-foo` | `padding-inline` |
| `spacing.foo.y` | `py-foo` | `padding-block` |
| `spacing.foo.my` | `my-foo` | `margin-block` |
| `spacing.foo.mb` | `mb-foo` | `margin-block-end` |
| `spacing.foo.mt` | `mt-foo` | `margin-block-start` |
| `spacing.foo.gap` | `gap-foo` | `gap` |
| `spacing.foo` | `foo` | `padding` (default) |

**Example - Adding `my-stack-divider`**:
```json
// design-tokens-semantic.json
"spacing": {
  "stack": {
    "divider": {
      "my": { "$value": "{spacing.2}", "$description": "Divider vertical margin" }
    }
  }
}
```
Then run `npm run tokens:build` → generates `@utility my-stack-divider { margin-block: var(--spacing-stack-divider-my); }`

**If the pattern doesn't exist in `transforms.js`**:
1. Edit `scripts/style-dictionary/transforms.js`
2. Add the pattern to the spacing utilities section
3. Run `npm run tokens:build`
4. Test that utility generates correctly

**Detection**: If you see yourself typing CSS rules into files under `src/styles/utilities/`, STOP. You're doing it wrong.

---

### Missing Utility
- **Problem**: Recipe references utility that doesn't exist
- **Solution**: 
  1. **First check `design-tokens-semantic.json`** - does semantic token exist? (e.g., `spacing.button.gap`)
  2. **If semantic token exists but utility missing**: Check if `transforms.js` supports the naming pattern (see table above)
  3. **If pattern not supported**: Add pattern to `scripts/style-dictionary/transforms.js`, then run `npm run tokens:build`
  4. **If token doesn't exist**: Add to `design-tokens-semantic.json` with correct naming, run `npm run tokens:build`
  5. **NEVER manually add utilities** - always use the build system

### Recipe Not Using Semantic Tokens
- **Problem**: Recipe uses hardcoded Tailwind (`gap-2`) when semantic token exists (`spacing.button.gap` → `gap-button`)
- **Detection**: `npm run validate:tokens` will fail if hardcoded values found
- **Solution**: 
  1. Run `npm run validate:tokens` to see all violations
  2. Check `design-tokens-semantic.json` for component-specific tokens (e.g., `spacing.button.*`, `color.interactive.*`)
  3. Replace hardcoded values with semantic token utilities
  4. Verify utility exists: `grep "^@utility gap-button" src/styles/utilities/*.css`
  5. **If utility doesn't exist**: See "Auto-Generated Files" edge case above - add token with correct naming, run `npm run tokens:build`
  6. **NEVER manually edit CSS** - always use the token → build → utility cascade
  7. Re-run `npm run validate:tokens` to confirm fixes

### Mixed Layout + Styling Classes
- **Problem**: Component has both layout (`mt-*`, `gap-*`) and styling classes
- **Solution**: Keep layout classes separate, only recipe classes go in `$derived([recipe(...), className])`

### Bits UI API Differences
- **Problem**: Bits UI component uses `className` instead of `class`, or different prop structure
- **Solution**: Check Bits UI docs via Context7, adapt accordingly (may need wrapper or prop mapping)

### Dynamic Classes
- **Problem**: Component needs conditional classes beyond recipe variants
- **Solution**: Use `$derived.by()` for complex logic, or combine multiple `$derived` values in array

### Molecule Using Recipe Instead of Atom
- **Problem**: Molecule uses recipe directly (e.g., `formInputLabelRecipe`) instead of Text component
- **Example**: FormInput label uses `class={formInputLabelRecipe()}` instead of `<Text>` component
- **Solution**: 
  1. Identify what atom should be used (Text for labels/text, Button for buttons, etc.)
  2. Replace recipe usage with atom component
  3. Deprecate the recipe if it was molecule-specific
  4. Update all molecules using that recipe pattern
- **Why**: Ensures consistency - when atom styles change, molecules automatically inherit changes

### Component Misclassified
- **Problem**: Component is in wrong atomic design level (e.g., FormInput in `atoms/` but it's a molecule)
- **Detection**: Check if component composes multiple elements (molecule) or is single element (atom)
- **Solution**: 
  1. Move component to correct location (`atoms/` → `molecules/` or vice versa)
  2. Update imports in all usage sites
  3. Update component to follow correct pattern for its level

### Module Component in Wrong Location
- **Problem**: Feature-specific component is in shared components (`src/lib/components/`) instead of module
- **Detection**: Component has business logic, domain-specific behavior, or is only used by one module
- **Solution**: 
  1. Move component to `src/lib/modules/[module]/components/`
  2. Update imports in all usage sites
  3. Ensure component uses shared components (atoms/molecules/organisms) internally
  4. Verify no cross-module imports (ESLint will catch this)
- **Example**: InboxCard should be in `src/lib/modules/inbox/components/`, not `src/lib/components/`

### Hardcoded Focus Ring Color
- **Problem**: Focus ring uses hardcoded rgba color
- **Solution**: Use oklch with brand hue (195) for consistency:
  ```typescript
  // ✅ Uses brand hue (195) - changes if brand changes
  'focus:shadow-[0_0_0_3px_oklch(55%_0.15_195_/_0.12)]'
  
  // ❌ Hardcoded rgba - won't update with brand
  'focus:shadow-[0_0_0_3px_rgba(0,128,128,0.1)]'
  ```
- Document with comment explaining brand hue usage

### Page-Level Gradients
- **Problem**: Need subtle gradient effect on page background
- **Solution**: Inline gradient with documentation, not design token:
  ```svelte
  <!--
    Page Background
    - Radial gradient uses brand hue (195) at 8% opacity
    - This is a page-level effect, not a design token (intentional)
  -->
  <div class="bg-radial-[at_50%_35%] from-[oklch(55%_0.12_195_/_0.08)] ...">
  ```
- Keep opacity low (5-10%) to avoid "cheap" look

### Dropdown Menu Gradients
- **Problem**: Dropdown menus look flat and boring compared to premium pages (login)
- **Solution**: Add subtle radial gradient to dropdown content:
  ```svelte
  <DropdownMenu.Content class="relative overflow-hidden rounded-modal border border-base bg-surface shadow-md">
    <!-- Gradient overlay - brand hue (195) at 5% opacity -->
    <div class="pointer-events-none absolute inset-0 bg-radial-[at_50%_0%] from-[oklch(55%_0.12_195_/_0.05)] via-[oklch(55%_0.06_195_/_0.02)] to-transparent" aria-hidden="true"></div>
    <div class="relative"><!-- Content here --></div>
  </DropdownMenu.Content>
  ```
- **Key changes**: `bg-surface` (not `bg-elevated`), `rounded-modal`, `shadow-md`, gradient overlay
- **Why**: Matches login page aesthetic, creates visual consistency

### Non-Existent Hover Utilities
- **Problem**: Components use `hover:bg-hover-solid` which doesn't exist as a utility
- **Detection**: Hover effects don't work, no visual feedback on menu items
- **Solution**: Use `hover:bg-subtle` or `hover:bg-active` instead:
  ```svelte
  <!-- ❌ WRONG: Non-existent utility -->
  <DropdownMenu.Item class="hover:bg-hover-solid focus:bg-hover-solid ...">
  
  <!-- ✅ CORRECT: Use existing utilities -->
  <DropdownMenu.Item class="hover:bg-subtle focus:bg-subtle ...">
  ```
- **Why**: `bg-hover-solid` was never added to semantic tokens - `bg-subtle` provides visible feedback
- **Bonus**: Add `rounded-button mx-1 transition-all duration-200` for polished look

### Inline Style Overrides on Atoms
- **Problem**: Parent components override atom styling with inline styles, breaking the recipe system
- **Example**: `<Avatar style="background-color: var(--color-component-sidebar-itemHover);" />`
- **Detection**: Avatar/Button/etc. looks different than expected, inconsistent styling
- **Solution**: 
  1. Remove inline style override
  2. Use atom's variant props instead
  3. If needed variant doesn't exist, add it to the recipe
  ```svelte
  <!-- ❌ WRONG: Inline override -->
  <Avatar variant="default" style="background-color: var(--color-component-sidebar-itemHover);" />
  
  <!-- ✅ CORRECT: Use variant prop -->
  <Avatar variant="default" />
  ```
- **Why**: Inline styles bypass the recipe system, can't be updated via tokens, creates inconsistencies

### Avatar Variant Differentiation
- **Problem**: Both avatar variants (`default` and `brand`) use same color - no way to distinguish use cases
- **Solution**: Differentiate variants for different contexts:
  - `default`: Neutral gray (`bg-interactive-tertiary`) - workspace/organization avatars
  - `brand`: Brand teal (`bg-interactive-primary`) - primary CTAs, user profile, brand emphasis
  ```typescript
  // In avatar.recipe.ts
  variant: {
    default: 'bg-interactive-tertiary text-inverse',  // Gray - professional
    brand: 'bg-interactive-primary text-inverse'      // Teal - brand color
  }
  ```
- **Pattern**: Workspace avatars = gray (professional), Primary CTAs = brand color (teal)
- **Why**: Creates visual hierarchy, workspace avatars don't compete with brand CTAs

### Opacity Handling
- **Problem**: Need opacity values (e.g., loading states, disabled states)
- **Solution**: Use semantic opacity utilities when available, CSS variables for others:
  ```svelte
  <!-- ✅ CORRECT: Use semantic opacity utility (exists!) -->
  <button class="disabled:opacity-disabled">Submit</button>
  
  <!-- ✅ CORRECT: Use CSS variable for other opacity values -->
  <div style="opacity: var(--opacity-60)">Loading...</div>
  
  <!-- ❌ WRONG: Tailwind numeric opacity class -->
  <div class="opacity-60">Loading...</div>
  ```
- **Available semantic opacity utilities**: `opacity-disabled` (50%)
- **For other values**: Use `var(--opacity-{value})` CSS variables (e.g., `--opacity-50`, `--opacity-75`)
- **Pattern**: Prefer semantic utilities when available, fall back to CSS variables

### Skeleton Loading States
- **Problem**: Need placeholder sizes for skeleton loading animations
- **Solution**: Use inline styles for skeleton dimensions (no semantic tokens exist):
  ```svelte
  <!-- ✅ CORRECT: Inline styles for skeleton placeholders -->
  <div class="bg-component-sidebar-itemHover animate-pulse rounded" style="height: 0.875rem; width: 7rem;"></div>
  
  <!-- ❌ WRONG: Hardcoded Tailwind classes -->
  <div class="h-3.5 w-28 animate-pulse rounded bg-sidebar-hover"></div>
  ```
- **Why**: Skeleton placeholder sizes are temporary/loading-specific, not part of design system
- **Pattern**: Use semantic tokens for colors (`bg-component-sidebar-itemHover`), inline styles for dimensions

### Missing Size Utilities (Avatar, Icon, etc.)
- **Problem**: Size utilities like `size-avatar-sm` don't exist even though tokens exist in `design-tokens-base.json`
- **Detection**: `validate:utilities` will catch these, or manually check: `grep "^@utility size-avatar" src/styles/utilities/*.css`
- **Solution**: Use inline styles with direct token values from `design-tokens-base.json`:
  ```svelte
  <!-- ✅ CORRECT: Inline styles with token values -->
  <div class="rounded-full bg-interactive-primary" style="width: 2rem; height: 2rem;">
    {initials}
  </div>
  
  <!-- ❌ WRONG: Using non-existent utility -->
  <div class="size-avatar-sm rounded-full bg-interactive-primary">
    {initials}
  </div>
  ```
- **Why**: Base tokens (`sizing.avatar.sm`) exist but don't generate utilities. Only semantic tokens generate utilities.
- **Pattern**: Use inline styles for sizing when utilities don't exist, reference token values directly (e.g., `2rem` from `sizing.avatar.sm`)
- **Note**: Document in `missing-styles.md` if this is a common pattern that should be fixed

### Perfect Circle Requirements
- **Problem**: Components requiring perfect circles (avatars, circular icons) need width = height
- **Solution**: Use inline styles to ensure square dimensions:
  ```svelte
  <!-- ✅ CORRECT: Explicit width and height for perfect circle -->
  <div 
    class="rounded-full bg-interactive-primary" 
    style="width: 2rem; height: 2rem;"
  >
    {initials}
  </div>
  
  <!-- ❌ WRONG: Only rounded-full, no size constraints -->
  <div class="rounded-full bg-interactive-primary">
    {initials}
  </div>
  ```
- **Why**: `rounded-full` alone doesn't guarantee a circle - element must be square (width = height)
- **Pattern**: Recipe handles `rounded-full`, inline styles handle sizing (width/height) when size utilities don't exist
- **Note**: If size utilities existed (`size-avatar-sm`), they would handle this automatically

### String Concatenation vs Array Syntax for Classes
- **Problem**: Using string concatenation (`class="base {className}"`) can break when custom classes conflict
- **Example**: Avatar component using `class="rounded-full bg-accent-primary {className}"` breaks when parent passes `bg-interactive-primary` (conflicts with `bg-accent-primary`)
- **Solution**: Always use array syntax with `$derived`:
  ```svelte
  <!-- ✅ CORRECT: Array syntax handles conflicts gracefully -->
  const classes = $derived([recipe({ variant, size }), className]);
  
  <!-- ❌ WRONG: String concatenation can break -->
  const classes = $derived(recipe({ variant, size }) + ' ' + className);
  ```
- **Why**: Array syntax allows Tailwind to handle conflicts (last class wins), string concatenation can create invalid combinations
- **Pattern**: Always use `$derived([...])` for class computation, never string concatenation

### Standardizing Styling in Atoms
- **Problem**: Parent components overriding atom styling causes inconsistencies and breaks (e.g., avatar losing circle shape)
- **Solution**: Standardize all styling in atom component via recipe system, use props for variants:
  ```svelte
  <!-- ✅ CORRECT: Atom handles all styling via recipe -->
  <Avatar variant="brand" size="sm" />
  
  <!-- ❌ WRONG: Parent overrides atom styling -->
  <Avatar size="sm" class="bg-interactive-primary text-inverse" />
  ```
- **Why**: 
  - Atoms should be self-contained and consistent
  - Parent components shouldn't need to know internal styling details
  - Recipe system ensures styling is centralized and maintainable
- **Pattern**: 
  - Atoms use recipes for all styling
  - Parent components use props (`variant`, `size`, `color`) not custom classes
  - If customization needed, add variant to recipe, don't pass custom classes

### Conditional Image Rendering
- **Problem**: Component needs to support both image and fallback (e.g., Avatar with photo or initials)
- **Solution**: Check for image prop first, render img tag if exists, else render component:
  ```svelte
  {#if avatarImage}
    <img src={avatarImage} alt={username} class="size-avatar-sm rounded-full" />
  {:else}
    <Avatar {initials} size="sm" />
  {/if}
  ```
- **Why**: Provides flexibility - users can upload photos later without component changes
- **Pattern**: Image prop is optional, component handles both cases gracefully

### Bits UI Composition Pattern
- **Problem**: Molecule needs to be used inside Bits UI components (e.g., DropdownMenu.Trigger)
- **Solution**: Molecule should be **content inside** Bits UI component, not wrapping it:
  ```svelte
  <!-- ✅ CORRECT: Molecule is content inside trigger -->
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      <WorkspaceSelector {...props} />  <!-- Content inside -->
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
      <!-- Menu content -->
    </DropdownMenu.Content>
  </DropdownMenu.Root>
  
  <!-- ❌ WRONG: Molecule wraps Bits UI component -->
  <WorkspaceSelector>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>...</DropdownMenu.Trigger>
    </DropdownMenu.Root>
  </WorkspaceSelector>
  ```
- **Why**: Bits UI components manage state and accessibility - molecule should be presentational content
- **Pattern**: Molecule composes atoms, parent (module component) composes Bits UI + molecule

## Exception Rule

**🚨 NON-NEGOTIABLE - NO EXCEPTIONS:**
- **NEVER manually edit files in `src/styles/utilities/`** - These are auto-generated
- **NEVER add CSS utilities by hand** - Always use `design-tokens-semantic.json` → `npm run tokens:build`
- If the build doesn't generate what you need, fix `scripts/style-dictionary/transforms.js`

**If you MUST use a non-design-token utility:**
1. **STOP** - Run `npm run validate:design-system` first to confirm it's actually missing
2. **Check if utility can be generated** - See "Auto-Generated Files" edge case for token naming patterns
3. **If pattern not supported**, update `scripts/style-dictionary/transforms.js` first
4. **If truly can't be tokenized**, document in `ai-docs/tasks/missing-styles.md` (see Step 6 format)
5. **Add inline comment** in code: `// WORKAROUND: [utility] missing - see missing-styles.md`
6. **Proceed** with hardcoded workaround only after documentation is complete

**Approval required for:**
- Using Tailwind color scales (e.g., `text-gray-500`) - must document why semantic token can't work
- Using numeric spacing (e.g., `gap-4`) - must propose semantic token name
- Any inline styles or arbitrary values beyond documented patterns (oklch gradients)

## Test Workflow Summary

```bash
# Quick validation during development (specific file)
npm run validate:tokens src/lib/components/[component]

# Comprehensive design system validation (before completion)
npm run validate:design-system

# If tests fail:
# 1. Check output for specific violations
# 2. Fix issues or document workarounds in missing-styles.md
# 3. Re-run until all pass
```

## Key Principle

**Move styling from hardcoded classes → recipe props → design tokens**

**🚨 The Sacred Cascade (NEVER break this):**
```
design-tokens-semantic.json → npm run tokens:build → src/styles/utilities/*.css
```
- **Tokens are source of truth** - All utilities come from tokens
- **Build generates utilities** - `transforms.js` controls how tokens become CSS
- **Never edit generated files** - Changes must go through tokens

**100% design token utilities only** - This centralizes styling and enables token-driven updates across the system.

**Always validate with `npm run validate:design-system`** - Catches hardcoded Tailwind, missing utilities, and recipe issues before merging.

**Always validate with Svelte MCP autofixer** - Ensures code follows Svelte 5 best practices and catches issues before completion.

**Premium = Compact but breathable spacing + Soft shadows + Subtle animations** - This is the Linear/Notion look.

## Recipe System vs Component Logic

**See**: `dev-docs/master-docs/design-system.md` section 6.2 for complete explanation.

**Quick reference:** Recipes return CSS classes (styling), components return content/data (business logic). Example: `inboxCardRecipe({ selected: true })` → CSS classes, `getTypeIcon('note')` → emoji string.

## Dark Mode Color Considerations

**See**: `dev-docs/master-docs/design-system.md` section 7.1 for dark mode color guidance.

**Quick reference:** Use `bg-surface` for containers, `bg-elevated` for subtle contrast, `bg-selected` for selected states.

## Component Design Patterns (Lessons Learned)

### Predefined Icon Registry vs Arbitrary SVG
**Problem**: Allowing arbitrary SVG children leads to:
- Inconsistent icons across the codebase
- Multiple versions of the same icon (e.g., 10 different payment icons)
- No type safety
- Hard to maintain/update icons

**Solution**: Centralized icon registry with TypeScript enforcement

**Benefits**:
- ✅ Type safety: Autocomplete for valid icon types
- ✅ Consistency: Single source of truth
- ✅ Maintainability: Update icons in one place
- ✅ Design system compliance: Only curated icons can be used

**Implementation**:
```typescript
// iconRegistry.ts
export type IconType = 'add' | 'edit' | 'delete' | ...;

export const iconRegistry: Record<IconType, IconDefinition> = {
  add: { path: 'M12 4v16m8-8H4', ... },
  // ...
};

// Icon.svelte
<Icon type="payment" size="md" />
```

### Boolean vs Enum for Component States
**Problem**: Having both `iconPosition: 'only'` and `iconOnly: boolean` is redundant and confusing

**Solution**: Use boolean for binary states, enum only for positioning

**Rationale**:
- `iconOnly` is a boolean state (has text or not)
- `iconPosition` is about positioning relative to text (left/right)
- When `iconOnly = true`, position doesn't make sense
- Simpler API: one boolean instead of special enum value

**Pattern**:
```typescript
// Component API
type Props = {
  iconOnly?: boolean;  // Boolean state
  iconPosition?: 'left' | 'right';  // Position enum (only when iconOnly=false)
};

// Storybook argTypes
argTypes: {
  iconOnly: {
    control: { type: 'boolean' },
    if: { arg: 'iconType', exists: true }
  },
  iconPosition: {
    control: { type: 'select' },
    options: ['left', 'right'],  // No 'only' option
    if: { arg: 'iconType', exists: true }
  }
}
```

### Snippet Scope in Svelte Stories
**Problem**: Icon snippet defined inside conditional block not accessible when rendering

**Solution**: Define snippets at the template level, check conditions inside snippet

**Pattern**:
```svelte
{#snippet template(args)}
  {@const hasIcon = !!args.iconType}
  {#snippet icon()}
    {#if hasIcon}
      <Icon type={args.iconType} />
    {/if}
  {/snippet}
  <Button>
    {#snippet children()}
      {#if hasIcon}
        {@render icon()}
      {/if}
    {/snippet}
  </Button>
{/snippet}
```

**Why**: Snippets must be defined at template scope to be accessible throughout the template.

### Component API Design: Props vs Storybook Args
**Key Insight**: Storybook args don't have to match component props exactly

**Pattern**:
- Component props: `iconOnly: boolean` (actual component API)
- Storybook args: `iconType`, `iconPosition`, `iconOnly` (convenience controls)
- Story logic maps args to component props

**Benefits**:
- Better UX in Storybook (icon selection + position controls)
- Component API stays clean and simple
- Stories handle the mapping logic

**See**: `.cursor/commands/storybook.md` for Storybook-specific patterns
