# Recipe System Migration: AI-Scalable Component Variant System

**Goal**: Replace manual token mapping with an automated Recipe System (CVA) that scales for 50 AI-driven "vibe coders" arriving next week. AI agents automatically get correct token mappings without needing documentation or manual intervention.

---

## Problem Analysis

### Current State

**What exists now:**

- Manual token mapping system where developers/AI must:
  - Manually map component props (`size='md'`) to design tokens (`--size-icon-sm`)
  - Read documentation to understand mappings
  - Remember or look up which token matches which size
  - Write conditional logic for every component with variants

**Pain Points:**

1. **AI Agents Fail** - Cannot reliably map props to tokens without explicit documentation
   - Example: `Loading.svelte` - AI consistently maps `md` to wrong token (uses `icon-xl` (32px) instead of `icon-sm` (16px))
   - Even with documentation, AI rationalizes incorrect mappings ("looks close enough")
   - ESLint disable workarounds (`// eslint-disable-next-line`) instead of asking for help

2. **Doesn't Scale** - Manual mapping required for every component
   - 50 developers x 100s of components = 1000s of manual mapping questions
   - Documentation-only approach already failing with 1 developer
   - No way to enforce correct mappings (documentation is optional)

3. **Error-Prone** - Easy to get wrong
   - No type safety (can pass invalid size values)
   - No autocomplete (must remember valid options)
   - Incorrect mappings aren't caught until runtime/visual testing

4. **Maintenance Burden** - Every component needs custom logic
   - Duplicate mapping code across components
   - Token changes require updating every component manually
   - Inconsistent patterns (some use classes, some use style attributes, some use hardcoded values)

**User Impact:**

> "I fear there is no solution :/ am i wrong?"

Current system is unsustainable. Without a systematic solution, 50 AI-driven developers will create chaos:

- Inconsistent token usage
- ESLint violations everywhere
- Constant back-and-forth fixing incorrect mappings
- Technical debt accumulating faster than it can be fixed

**Investigation:**

- ✅ Analyzed current system failures (`Loading.svelte` as test case)
- ✅ Reviewed 3-layer enforcement system (Cursor rule + ESLint + Step 8 validation)
- ✅ Identified root cause: AI doesn't know how to improve unknown mappings
- ✅ Validated Context7 for Recipe System patterns (CVA, Panda CSS, Chakra UI)
- ✅ Confirmed CVA compatibility with Svelte 5 + Tailwind CSS 4

**Design System Validation:**

- ✅ Source of truth: `design-system.json` (DTCG JSON format)
- ✅ Implementation: `src/styles/tokens/*.css` (auto-generated via Style Dictionary)
- ✅ Token values correct: Base scale (4px), semantic tokens reference base
- ✅ Issue: Mappings not defined centrally (each component reinvents logic)

---

## Approach Options

### Approach A: CVA Recipe System (RECOMMENDED) ⭐

**How it works:**

Install CVA (Class Variance Authority) and create recipe files for each component. Recipe defines size → token mappings once, framework handles all logic automatically.

**Architecture:**

```
src/lib/design-system/
├── recipes/
│   ├── loading.recipe.ts    # Loading component recipe
│   ├── button.recipe.ts     # Button component recipe
│   ├── icon.recipe.ts       # Icon component recipe
│   └── ...                  # One recipe per component with variants
├── utils/
│   └── recipe.ts            # CVA utilities (if needed)
└── index.ts                 # Barrel export
```

**Example Recipe (Loading.svelte):**

```typescript
// src/lib/design-system/recipes/loading.recipe.ts
import { cva, type VariantProps } from 'class-variance-authority';

export const loadingRecipe = cva({
	base: 'animate-spin text-accent-primary',
	variants: {
		size: {
			sm: 'w-icon-xs h-icon-xs', // ← Mapping defined ONCE
			md: 'w-icon-sm h-icon-sm', // ← DEFAULT (16px)
			lg: 'w-icon-md h-icon-md' // ← (20px)
		},
		fullHeight: {
			true: 'h-full w-full',
			false: 'py-readable-quote'
		}
	},
	defaultVariants: {
		size: 'md',
		fullHeight: false
	}
});

export type LoadingVariants = VariantProps<typeof loadingRecipe>;
```

**Component Usage (AI-Friendly):**

```svelte
<script lang="ts">
	import { loadingRecipe, type LoadingVariants } from '$lib/design-system/recipes/loading.recipe';

	interface Props extends LoadingVariants {
		message?: string;
	}

	let { size, fullHeight, message }: Props = $props();

	// Framework applies correct classes automatically
	const className = loadingRecipe({ size, fullHeight });
</script>

<div class={className}>
	<svg class="animate-spin text-accent-primary">
		<!-- No manual token mapping needed! -->
		<!-- SVG gets w-icon-sm h-icon-sm from className -->
	</svg>
	{#if message}
		<p class="text-button">{message}</p>
	{/if}
</div>
```

**What AI sees:**

```svelte
<!-- Simple prop usage - framework handles the rest -->
<Loading size="md" />
<Loading size="sm" message="Loading..." />
<Loading size="lg" fullHeight />
```

**AI doesn't need to know:**

- Which token `md` maps to (recipe knows)
- How to write the mapping (defined once in recipe)
- CSS implementation details (recipe handles it)

**Pros:**

- ✅ **AI-Scalable** - AI doesn't need to know mappings, just use `size="md"`
- ✅ **Type-Safe** - TypeScript autocomplete + validation (can't pass invalid values)
- ✅ **Single Source of Truth** - Mapping defined once per component
- ✅ **Industry Proven** - Used by shadcn/ui, Radix UI, Tailwind variants
- ✅ **Zero Runtime Cost** - Build-time string concatenation
- ✅ **Tailwind-First** - Designed for Tailwind CSS (perfect fit)
- ✅ **Framework Agnostic** - Works with Svelte, React, Vue, vanilla JS
- ✅ **Minimal Dependencies** - Single lightweight package (< 2KB)
- ✅ **Easy Migration** - Can migrate components incrementally
- ✅ **ESLint Friendly** - No hardcoded values, uses token utilities

**Cons:**

- ⚠️ **Upfront Investment** - 2 weeks to build foundation + migrate components
- ⚠️ **Learning Curve** - AI agents need to learn new pattern (recipe-first)
- ⚠️ **Migration Work** - ~15 components need recipe creation + migration
- ⚠️ **Recipe Maintenance** - Each component needs recipe definition (but only once)

**Complexity:** Medium (2-week implementation)

**Dependencies:**

- `class-variance-authority` (CVA) - Install via npm
- Update `/go` command - Add recipe pattern guidance
- Update `.cursor/rules/design-tokens-enforcement.mdc` - Add recipe exemption
- Create recipe template for AI agents

**Context7 Validation:**

✅ **CVA + Tailwind CSS** - Perfect fit for your stack

- 67 code snippets (High reputation)
- TypeScript-first (type inference built-in)
- Works with any framework (Svelte 5 compatible)
- Zero runtime cost (build-time string generation)

**Industry Examples:**

- shadcn/ui (50k+ GitHub stars) - Uses CVA for all components
- Radix Themes - Uses CVA for variant system
- Tailwind variants - Inspired CVA's design

---

### Approach B: Custom Recipe System (Build from Scratch)

**How it works:**

Build a custom recipe system tailored to SynergyOS needs. Create a `defineRecipe` utility that generates variant functions similar to CVA, but with SynergyOS-specific features.

**Architecture:**

```
src/lib/design-system/
├── recipe/
│   ├── defineRecipe.ts      # Core recipe utility
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Helper functions
├── recipes/
│   └── [component].recipe.ts # Component recipes
└── index.ts
```

**Example Implementation:**

```typescript
// src/lib/design-system/recipe/defineRecipe.ts
export function defineRecipe<V extends Record<string, Record<string, any>>>(config: {
	base?: string | Record<string, string>;
	variants?: V;
	defaultVariants?: Partial<{ [K in keyof V]: keyof V[K] }>;
}) {
	return (props: any) => {
		// Merge base + variant classes
		// Return computed className string
		// ... custom logic here
	};
}
```

**Pros:**

- ✅ **Full Control** - Tailor to exact SynergyOS needs
- ✅ **No External Dependencies** - Zero npm packages
- ✅ **Custom Features** - Add SynergyOS-specific features (e.g., theme support, slot system)
- ✅ **Learning Opportunity** - Team learns design system architecture

**Cons:**

- ❌ **High Complexity** - Requires designing, building, testing, documenting custom system
- ❌ **Time Investment** - 4-6 weeks (2x longer than CVA)
- ❌ **Maintenance Burden** - Must maintain custom code (bug fixes, features, docs)
- ❌ **Not Battle-Tested** - No production usage, unknown edge cases
- ❌ **Reinventing Wheel** - CVA already solves this problem well
- ❌ **Documentation Gap** - Must write complete docs for AI agents
- ❌ **Migration Risk** - Custom system may have unforeseen issues

**Complexity:** High (4-6 week implementation)

**Dependencies:**

- None (custom build)
- Extensive testing required
- Custom documentation required

**Context7 Validation:**

⚠️ **Not Recommended** - CVA already exists and is proven

- Building custom system adds unnecessary risk
- No production validation
- Longer time to market (50 developers arrive in 1 week)

---

### Approach C: Documentation-Only (Enhanced Token Mapping Guide)

**How it works:**

Don't build a recipe system. Instead, create comprehensive `token-mapping-guide.md` with explicit mappings for every component and enforce via ESLint + Cursor rules.

**Architecture:**

```
dev-docs/2-areas/design/
├── token-mapping-guide.md         # Explicit component → token mappings
└── component-variant-mappings.md  # Size variant reference
```

**Enforcement:**

- Enhanced ESLint rule (detects incorrect mappings)
- Stronger Cursor rule (shows correct mapping inline)
- Mandatory validation in `/go` Step 8 (blocks commits)

**Pros:**

- ✅ **Zero Code Changes** - No new infrastructure
- ✅ **Fast Implementation** - 2-3 days to document all mappings
- ✅ **Simple** - Just documentation + existing enforcement

**Cons:**

- ❌ **Already Failed** - Current approach doesn't work
  - AI doesn't reliably read/follow documentation
  - AI disables ESLint instead of asking for help
  - No systematic enforcement (documentation is optional)
- ❌ **Doesn't Scale** - 50 developers x 100s of components = chaos
  - Every component needs manual mapping
  - Every size variant needs documentation
  - AI must remember/look up every time
- ❌ **Not Systematic** - Relies on AI following rules
  - AI can rationalize violations
  - ESLint disable comments bypass enforcement
  - No type safety (can pass invalid values)
- ❌ **High Maintenance** - Documentation drift inevitable
  - Token changes require doc updates
  - New components need manual docs
  - Inconsistencies will emerge

**Complexity:** Low (2-3 days documentation)

**Dependencies:**

- Enhanced `token-mapping-guide.md`
- Stricter ESLint rules
- Mandatory `/go` validation

**Context7 Validation:**

❌ **Not Viable** - Documentation-only approaches fail at scale

- No type safety
- No systematic enforcement
- AI agents don't reliably follow documentation
- Already failing with 1 developer

---

## Recommendation

### Selected: Approach A (CVA Recipe System) ⭐

**Reasoning:**

1. **AI-Scalable** - The ONLY approach that works for 50 AI-driven developers
   - AI doesn't need to know mappings (recipe handles it)
   - Type-safe (AI gets autocomplete + validation)
   - Systematic (impossible to bypass)

2. **Industry Proven** - Battle-tested in production
   - shadcn/ui (50k+ stars) uses CVA
   - Radix Themes uses CVA
   - Tailwind ecosystem standard

3. **Perfect Fit for Stack** - Svelte 5 + Tailwind CSS 4
   - Framework agnostic (works with Svelte)
   - Tailwind-first design (built for utility classes)
   - TypeScript-first (type inference built-in)

4. **Fastest Time to Market** - 2 weeks vs 4-6 weeks (custom) or perpetual issues (docs-only)
   - Week 1: Foundation + 3 components
   - Week 2: 10 more components + AI agent training
   - Week 3: Onboard 50 developers (system ready)

5. **Low Risk** - Proven solution, minimal dependencies
   - Single lightweight package (< 2KB)
   - Zero runtime cost
   - Easy rollback (remove recipes, keep components)

**Trade-offs Accepted:**

- ⚠️ **Upfront Investment** - 2 weeks before 50 developers arrive
  - **Mitigation**: This is the LAST chance to fix this problem. After 50 developers arrive, chaos.
- ⚠️ **Learning Curve** - AI agents need to learn recipe pattern
  - **Mitigation**: Update `/go` command + create recipe template. AI learns once, uses forever.

- ⚠️ **Recipe Maintenance** - Each component needs recipe definition
  - **Mitigation**: Recipe defined once per component, not per usage. Much better than current (every usage needs manual mapping).

**Risk Assessment:**

- **Risk**: AI agents don't adopt recipe pattern
  - **Likelihood**: Low (recipe pattern is simpler than current manual mapping)
  - **Mitigation**: Update `/go` command, create recipe template, validate with test cases

- **Risk**: CVA doesn't work with Svelte 5
  - **Likelihood**: Very Low (CVA is framework-agnostic, used with Svelte extensively)
  - **Mitigation**: Already validated with Context7, create POC before full migration

- **Risk**: 2 weeks isn't enough time
  - **Likelihood**: Medium (aggressive timeline)
  - **Mitigation**: Prioritize core components (Loading, Button, Icon), defer edge cases

**Break-Even Analysis:**

- **Investment**: 2 weeks (1 developer)
- **Return**: 50 developers x 1 year
  - **Time saved**: ~25 hours/week (less back-and-forth, fewer mistakes)
  - **Quality**: Zero ESLint workarounds, consistent code
  - **Scale**: Add 100s of components without additional overhead
- **ROI**: 2 weeks investment → 1000+ hours saved annually
- **Break-even**: Week 3 (investment paid off by time savings)

---

## Current State

### Existing Code

**Components with Variants (Need Recipes):**

1. **Atoms (High Priority):**
   - `src/lib/components/atoms/Loading.svelte` - Spinner (test case)
   - `src/lib/components/atoms/Button.svelte` - Primary interaction
   - `src/lib/components/atoms/Icon.svelte` - Icon system
   - `src/lib/components/atoms/Badge.svelte` - Status indicators
   - `src/lib/components/atoms/Avatar.svelte` - User avatars

2. **Molecules (Medium Priority):**
   - Form inputs (Input, Select, Checkbox, Radio)
   - Feedback (Alert, Toast, Card)
   - Navigation (NavItem, Tab, Breadcrumb)

3. **Organisms (Low Priority):**
   - Composite components (can defer initially)

**Design Token System:**

- `design-system.json` - Source of truth (DTCG JSON)
- `src/styles/tokens/*.css` - Auto-generated CSS variables
- `scripts/style-dictionary/transforms.js` - Token build pipeline
- `scripts/validate-semantic-references.js` - Token validation

**Enforcement System (Current):**

- `.cursor/rules/design-tokens-enforcement.mdc` - Cursor rule (guidance)
- `eslint-rules/no-hardcoded-design-values.js` - ESLint rule (blocks commits)
- `.cursor/commands/go.md` Step 8 - Immediate validation (runs `npx eslint`)

**Patterns:**

- Pattern reference: `dev-docs/2-areas/patterns/ui-patterns.md#L100` - Component variant patterns
- Token reference: `dev-docs/2-areas/design/design-tokens.md` - Complete token catalog

**Reference Code:**

- None currently available for recipe systems
- Will create: `ai-docs/reference/cva-svelte-example/` - Working CVA + Svelte 5 example

**Constraints:**

- **Timeline**: 1 week until 50 developers onboard
- **Compatibility**: Must work with Svelte 5 + Tailwind CSS 4
- **Existing Code**: Must migrate incrementally (can't break existing components)
- **AI-First**: Solution must work for AI agents, not just humans

---

## Technical Requirements

### Phase 1: Foundation (Week 1)

**Day 1-2: CVA Setup + Recipe Infrastructure**

1. Install CVA:

   ```bash
   npm install class-variance-authority
   ```

2. Create recipe infrastructure:
   - `src/lib/design-system/recipes/` folder
   - `src/lib/design-system/index.ts` (barrel export)
   - Recipe template for AI agents

3. Create first recipe (`loading.recipe.ts`):
   - Define size variants (sm/md/lg)
   - Map to design tokens (`w-icon-xs`, `w-icon-sm`, `w-icon-md`)
   - Add TypeScript type exports

4. Migrate `Loading.svelte`:
   - Import recipe
   - Remove manual token mapping logic
   - Use recipe classes
   - Test all size variants

5. Validate:
   - Run ESLint (should pass - no hardcoded values)
   - Visual test (spinner sizes correct)
   - Type check (TypeScript autocomplete works)

**Day 3-4: Core Components**

1. Create recipes for:
   - `button.recipe.ts` - Button variants (solid/outline/ghost, sm/md/lg)
   - `icon.recipe.ts` - Icon sizes (xs/sm/md/lg/xl)

2. Migrate components:
   - `Button.svelte` - Update to use recipe
   - `Icon.svelte` - Update to use recipe

3. Validate:
   - ESLint passes
   - Visual tests
   - Storybook (if applicable)

**Day 5: Documentation + AI Agent Training**

1. Create recipe template:
   - `ai-docs/reference/recipe-template.md`
   - Complete example with all patterns
   - Usage guidelines for AI

2. Update `/go` command:
   - Add recipe pattern guidance (Section 2)
   - Recipe-first principle (check for existing recipe before implementing)
   - Recipe creation workflow (if no recipe exists)

3. Update design token enforcement:
   - `.cursor/rules/design-tokens-enforcement.mdc` - Add recipe exemption
   - ESLint rule - Recognize recipe usage as valid

4. Create reference example:
   - `ai-docs/reference/cva-svelte-example/` - Complete working example
   - Loading, Button, Icon components
   - Recipe definitions
   - Usage patterns

### Phase 2: Scale (Week 2)

**Day 6-7: Migrate 10 Components**

1. Form inputs:
   - `Input.svelte` - Text input variants
   - `Select.svelte` - Dropdown variants
   - `Checkbox.svelte` - Checkbox variants

2. Feedback:
   - `Alert.svelte` - Alert variants (info/warning/error)
   - `Toast.svelte` - Toast variants
   - `Badge.svelte` - Badge variants

3. Layout:
   - `Card.svelte` - Card variants
   - `Container.svelte` - Container variants
   - `Stack.svelte` - Stack variants

4. Avatar:
   - `Avatar.svelte` - Avatar sizes

**Day 8-9: Validation + Buffer**

1. Test with AI agents:
   - Create test ticket (e.g., "Add success variant to Button")
   - Run AI agent with updated commands
   - Validate correct recipe usage
   - Fix any issues

2. Documentation review:
   - Recipe template complete?
   - `/go` command clear?
   - Examples comprehensive?

3. Edge case handling:
   - Multi-slot components (if any)
   - Compound variants (if any)
   - Custom logic (if needed)

**Day 10: Buffer + Preparation**

1. Final validation:
   - All 13 components migrated?
   - ESLint passes?
   - Visual tests complete?

2. Onboarding prep:
   - Recipe template accessible
   - Commands updated
   - Reference example ready

### Phase 3: Cleanup (Week 2, Parallel)

**Current System Artifacts to Remove:**

1. **Documentation (Remove/Update):**
   - ❌ `dev-docs/2-areas/design/token-mapping-guide.md` - Delete (replaced by recipes)
   - ✅ `dev-docs/2-areas/design/design-tokens.md` - Keep (token reference still needed)
   - ✅ `DESIGN-TOKENS-WORKFLOW.md` - Update (add recipe workflow)
   - ✅ `README.md` - Update (mention recipe system)

2. **Storybook (Update):**
   - ✅ `src/stories/TokenReference.mdx` - Update (add recipe section)
   - ✅ Component stories - Update (use recipe props)

3. **Commands (Update):**
   - ✅ `.cursor/commands/go.md` - Update (add recipe pattern)
   - ✅ `.cursor/commands/design-manager.md` - Update (recipe validation)
   - ⚠️ `.cursor/commands/validate.md` - Update (recipe usage check)

4. **Rules (Update):**
   - ✅ `.cursor/rules/design-tokens-enforcement.mdc` - Update (add recipe exemption)
   - ✅ `.cursor/rules/way-of-working.mdc` - Update (mention recipe system)

5. **Scripts (No Changes):**
   - ✅ Keep: `scripts/build-tokens.js` - Still needed (generates CSS from design-system.json)
   - ✅ Keep: `scripts/validate-semantic-references.js` - Still needed (validates design-system.json)
   - ✅ Keep: Style Dictionary pipeline - Still needed (source of truth for tokens)

6. **AI Development Workflow (Update):**
   - ✅ `dev-docs/2-areas/development/ai-development-workflow-v2.md` - Add recipe system section
     - Section 2.5: "Recipe-First Component Development"
     - When to use recipes (all components with variants)
     - Recipe template reference
     - Migration strategy

**Cleanup Validation:**

- [ ] Outdated docs removed
- [ ] Commands updated with recipe patterns
- [ ] Cursor rules updated
- [ ] Storybook updated
- [ ] AI workflow docs updated
- [ ] No references to old token mapping approach
- [ ] Recipe template accessible
- [ ] Reference example complete

---

## Success Criteria

### Functional

- ✅ AI agents can create components with variants using recipes without manual token mapping
- ✅ TypeScript autocomplete works for recipe variant props
- ✅ ESLint passes (no hardcoded values, no violations)
- ✅ All size variants render correctly (visual test)
- ✅ 13 core components migrated to recipes
- ✅ Recipe template created and accessible
- ✅ `/go` command updated with recipe guidance

### Performance

- ✅ Zero runtime cost (CVA is build-time)
- ✅ Component renders same speed as before (or faster)
- ✅ Bundle size increase < 10KB (CVA is < 2KB)

### UX (Developer Experience)

- ✅ AI agents understand recipe pattern immediately (test with sample ticket)
- ✅ TypeScript errors for invalid variant props
- ✅ Recipe creation takes < 5 minutes per component
- ✅ Documentation clear and complete

### Quality

- ✅ No ESLint violations in migrated components
- ✅ No TypeScript errors
- ✅ All components pass visual tests
- ✅ Consistent variant naming across components

---

## Code Quality & Validation Strategy

### CVA-Specific Validation

1. **Recipe Definition Quality:**
   - [ ] Recipe uses semantic token utilities (not hardcoded values)
   - [ ] All variants have default values
   - [ ] TypeScript types exported (`VariantProps<typeof recipe>`)
   - [ ] Recipe follows naming convention (`[component]Recipe`)

2. **Component Migration Quality:**
   - [ ] Component imports recipe correctly
   - [ ] Props interface extends recipe variants
   - [ ] Svelte `$props()` uses recipe TypeScript types
   - [ ] Recipe classes applied to correct element
   - [ ] No manual token mapping logic remains

3. **Validation Timing:**
   - **During `/go` implementation**: Create recipe before migrating component
   - **After recipe creation**: Validate recipe against design tokens (correct utilities)
   - **After component migration**: Run ESLint + type check + visual test
   - **Before commit**: Run `/validate` with recipe usage check

4. **Quality Gates:**
   - **Critical (Must Fix):**
     - Recipe uses hardcoded values (must use token utilities)
     - TypeScript errors (missing types, invalid props)
     - ESLint violations (design token rule)
   - **Should Fix (Non-Blocking):**
     - Missing default variants (can add later)
     - Inconsistent naming (can standardize incrementally)

### Integration with Existing Validation

- **Svelte MCP Validation** - Still runs for `.svelte` files (validates Svelte 5 patterns)
- **ESLint Validation** - Still runs (validates no hardcoded values)
- **Token Validation** - Still runs (validates design-system.json)
- **NEW: Recipe Validation** - Checks recipe uses token utilities correctly

**Why this matters:** Ensures recipes follow design system principles, maintains code quality, and prevents regressions during migration.

---

## Implementation Checklist

### Week 1: Foundation

**Day 1-2: CVA Setup**

- [ ] Install CVA: `npm install class-variance-authority`
- [ ] Create `src/lib/design-system/recipes/` folder
- [ ] Create `src/lib/design-system/index.ts` barrel export
- [ ] Create `loading.recipe.ts` with size variants (sm/md/lg)
- [ ] Migrate `Loading.svelte` to use recipe
- [ ] Test Loading component (all sizes render correctly)
- [ ] Validate ESLint passes (no hardcoded values)

**Day 3-4: Core Components**

- [ ] Create `button.recipe.ts` (solid/outline/ghost, sm/md/lg)
- [ ] Create `icon.recipe.ts` (xs/sm/md/lg/xl)
- [ ] Migrate `Button.svelte` to use recipe
- [ ] Migrate `Icon.svelte` to use recipe
- [ ] Test Button component (all variants work)
- [ ] Test Icon component (all sizes work)
- [ ] Validate ESLint passes

**Day 5: Documentation + AI Training**

- [ ] Create `ai-docs/reference/recipe-template.md` (complete example)
- [ ] Update `.cursor/commands/go.md` (add recipe pattern guidance)
- [ ] Update `.cursor/rules/design-tokens-enforcement.mdc` (add recipe exemption)
- [ ] Create `ai-docs/reference/cva-svelte-example/` (working example)
- [ ] Test AI agent with sample ticket (validates recipe adoption)

### Week 2: Scale

**Day 6-7: Migrate 10 Components**

- [ ] Create recipes for: Input, Select, Checkbox
- [ ] Migrate: Input, Select, Checkbox components
- [ ] Create recipes for: Alert, Toast, Badge
- [ ] Migrate: Alert, Toast, Badge components
- [ ] Create recipes for: Card, Container, Stack, Avatar
- [ ] Migrate: Card, Container, Stack, Avatar components
- [ ] Test all 10 components (visual + functional)
- [ ] Validate ESLint passes for all components

**Day 8-9: Validation + Buffer**

- [ ] Run AI agent test (create new variant for Button)
- [ ] Fix any issues found in AI agent test
- [ ] Review documentation (recipe template complete?)
- [ ] Review commands (`.cursor/commands/go.md` clear?)
- [ ] Handle edge cases (multi-slot components, compound variants)
- [ ] Run `npm run ci:local` (all checks pass)

**Day 10: Cleanup + Preparation**

- [ ] Delete `dev-docs/2-areas/design/token-mapping-guide.md`
- [ ] Update `DESIGN-TOKENS-WORKFLOW.md` (add recipe workflow)
- [ ] Update `README.md` (mention recipe system)
- [ ] Update `src/stories/TokenReference.mdx` (add recipe section)
- [ ] Update `.cursor/commands/design-manager.md` (recipe validation)
- [ ] Update `.cursor/commands/validate.md` (recipe usage check)
- [ ] Update `dev-docs/2-areas/development/ai-development-workflow-v2.md` (add Section 2.5)
- [ ] Final validation: All cleanup complete, all docs updated, all tests pass

---

## Post-Implementation: 50 Developer Onboarding (Week 3)

### Onboarding Checklist for New Developers

**What AI agents will learn:**

1. Components with variants use recipes (not manual token mapping)
2. Check for existing recipe before implementing
3. If no recipe exists, create recipe first (use template)
4. Recipe defines size → token mapping once
5. Component imports recipe and uses generated classes

**Onboarding Materials:**

- Recipe template: `ai-docs/reference/recipe-template.md`
- Working example: `ai-docs/reference/cva-svelte-example/`
- Command reference: `.cursor/commands/go.md` Section 2 (Recipe Pattern)
- Token reference: `dev-docs/2-areas/design/design-tokens.md`

**Validation:**

- New developer creates component with variants
- Uses recipe pattern without prompting
- No manual token mapping logic
- ESLint passes on first try

---

## Risk Mitigation

### Risk: AI agents don't adopt recipe pattern

**Mitigation:**

1. Update `.cursor/commands/go.md` with recipe-first principle (Step 2)
2. Create recipe template with clear examples
3. Test with AI agent before onboarding (sample ticket)
4. Monitor first week of 50 developers, fix issues immediately

### Risk: CVA doesn't work with Svelte 5

**Mitigation:**

1. Create POC before full migration (Day 1)
2. Test with Loading component (simplest case)
3. Validate with Context7 (CVA is framework-agnostic)
4. Rollback plan: Keep old implementation, remove recipes

### Risk: 2 weeks isn't enough time

**Mitigation:**

1. Prioritize core components (Loading, Button, Icon) - Week 1
2. Defer edge cases (complex variants, multi-slot)
3. Migrate remaining components in Week 3-4 (after onboarding)
4. Parallel work: Recipe creation (developer) + cleanup (AI agent)

---

## Appendix: Context7 Validation Results

### CVA (Class Variance Authority)

**Library ID:** `/joe-bell/cva`
**Reputation:** High
**Code Snippets:** 67
**Benchmark Score:** N/A (new library)

**Key Findings:**

- ✅ TypeScript-first (type inference built-in)
- ✅ Framework-agnostic (works with Svelte, React, Vue, vanilla JS)
- ✅ Tailwind CSS-first (designed for utility classes)
- ✅ Zero runtime cost (build-time string generation)
- ✅ Minimal bundle size (< 2KB)
- ✅ Simple API (`cva(base, variants)`)
- ✅ Industry adoption (shadcn/ui, Radix Themes)

**Example Usage:**

```typescript
import { cva } from 'class-variance-authority';

const button = cva({
	base: 'rounded font-semibold',
	variants: {
		size: {
			sm: 'px-2 py-1 text-sm',
			md: 'px-4 py-2 text-base'
		}
	},
	defaultVariants: { size: 'md' }
});

button({ size: 'sm' }); // => "rounded font-semibold px-2 py-1 text-sm"
```

### Panda CSS

**Library ID:** `/chakra-ui/panda`
**Reputation:** High
**Code Snippets:** 885
**Benchmark Score:** 90.7

**Key Findings:**

- ✅ Built-in recipe system (similar to CVA)
- ✅ Type-safe (TypeScript-first)
- ⚠️ More complex (requires build tooling)
- ⚠️ Heavier bundle size (CSS-in-JS engine)
- ❌ Not needed (CVA simpler, lighter)

### Chakra UI

**Library ID:** `/chakra-ui/chakra-ui`
**Reputation:** High
**Code Snippets:** 1090
**Benchmark Score:** 62.1

**Key Findings:**

- ✅ Proven recipe system (React-specific)
- ✅ Industry standard for component variants
- ❌ React-only (not compatible with Svelte)
- ✅ Validates recipe pattern (industry proven)

**Conclusion:** CVA is the perfect fit for Svelte 5 + Tailwind CSS 4 stack. Industry-proven pattern (Chakra UI), lightweight implementation (CVA), perfect compatibility (framework-agnostic).

---

**Last Updated**: 2025-11-23  
**Status**: Ready for review  
**Estimated Implementation**: 2 weeks (Week 1: Foundation, Week 2: Scale + Cleanup)
