# Design Tokens: Single Source of Truth + Automated Validation

**Linear Ticket**: [SYOS-474](https://linear.app/younghumanclub/issue/SYOS-474)

**Goal**: Replace manual CSS token maintenance with automated Style Dictionary pipeline. Single JSON file (`design-system.json`) auto-generates CSS, validates semantic token references, and ensures cascade behavior works correctly.

---

## Problem Analysis

### Current State

**What exists now:**

- ✅ `design-system.json` - DTCG format token specification (source of truth)
- ✅ Modular CSS structure (`src/styles/tokens/`, `src/styles/utilities/`)
- ✅ ESLint validation - Blocks hardcoded Tailwind values in HTML/Svelte (`[2.75rem]` → `min-h-button`)
- ✅ Token validation script - Checks orphaned tokens (tokens without utility classes)
- ✅ DTCG format validation - Checks schema compliance

**What's broken:**

- ❌ **Manual CSS maintenance**: Tokens defined in JSON, manually copied to CSS (no automation)
- ❌ **No semantic token validation**: CI doesn't check if semantic tokens reference base scale
- ❌ **Cascade inconsistencies**: Some tokens use `var(--spacing-2)`, others hardcode `0.5rem`
- ❌ **Duplication**: Same values exist in JSON AND CSS (drift risk)
- ❌ **No cascade testing**: Changes to base scale don't propagate (manual verification required)

### Pain Points

**Why this needs solving:**

1. **CI didn't catch semantic token issues** (SYOS-XXX):
   - ESLint validates HTML (`class="min-h-[2.75rem]"` ❌)
   - BUT doesn't validate CSS (`--spacing-nav-x: 0.5rem` instead of `var(--spacing-2)`)
   - Manual code review required to catch these issues

2. **Maintenance burden**:
   - Change token in JSON → manually update CSS → manually update docs
   - Risk of inconsistency between spec and implementation
   - Developers confused: "Is JSON or CSS the source of truth?"

3. **No automated cascade validation**:
   - Change `--spacing-2` from `0.5rem` to `0.625rem`
   - Semantic tokens using `var(--spacing-2)` update automatically ✅
   - BUT hardcoded `0.5rem` values don't update ❌
   - No CI check catches this

4. **Developer confusion** (your feedback):
   - Multiple files (`tokens/*.css`, `utilities/*.css`, `design-system.json`)
   - Hard to know where to change values
   - Simple config file (`spacing = 4px; primary-color = #000000;`) would be clearer

### User Impact

- **Developers**: Simpler workflow (change JSON once, CSS auto-generates)
- **Design system maintainers**: Automated validation catches inconsistencies
- **QA**: CI blocks PRs with invalid token references
- **Product**: Cascade works correctly (design changes propagate automatically)

### Investigation Results

**✅ Checked existing implementations:**

- Reviewed `src/styles/` modular architecture (SYOS-373)
- Analyzed `scripts/validate-tokens.js` (doesn't check semantic references)
- Reviewed ESLint config (validates HTML, not CSS)
- Confirmed `design-system.json` follows DTCG 1.0.0 spec

**✅ Validated with Context7:**

- Style Dictionary (Amazon/Style-Dictionary) - Industry standard
- DTCG (Design Tokens Community Group) - W3C standard format
- Material UI, Chakra UI use JSON → compiled CSS approach
- Single source of truth → platform-specific outputs (CSS, JS, iOS, Android)

**✅ Identified gap:**

- JSON spec exists but not connected to CSS generation
- No validation for semantic token references (`var(--spacing-2)` vs `0.5rem`)
- CI doesn't catch cascade inconsistencies

---

## Approach Options

### Approach A: Manual Validation Script (Minimal Change)

**How it works:**

- Add new script: `validate-semantic-tokens.js`
- Parse `src/styles/tokens/spacing.css` manually
- Check all semantic tokens use `var(--spacing-X)` references
- Block CI if hardcoded values found

**Pros:**

- ✅ Quick to implement (1-2 hours)
- ✅ No build pipeline changes
- ✅ Catches semantic token issues immediately

**Cons:**

- ❌ Still manual CSS maintenance (JSON → CSS by hand)
- ❌ Doesn't solve duplication problem
- ❌ Doesn't validate JSON-to-CSS consistency
- ❌ Doesn't enforce cascade behavior
- ❌ Band-aid solution, doesn't address root cause

**Complexity:** Low

**Dependencies:** Node.js script, regex parsing

---

### Approach B: Style Dictionary Pipeline (Industry Standard)

**How it works:**

1. `design-system.json` (DTCG format) = **single source of truth**
2. Style Dictionary transforms JSON → CSS custom properties + utilities
3. `npm run tokens:build` auto-generates `src/styles/` files
4. CI validates:
   - Semantic tokens reference base scale (enforced by transform)
   - No manual edits to generated files (git diff check)
   - DTCG format compliance (existing script)

**Pros:**

- ✅ **Single source of truth** (JSON only, CSS auto-generated)
- ✅ **Automated cascade** (semantic tokens MUST reference base scale)
- ✅ **Industry standard** (Material UI, Chakra UI, Ant Design use this)
- ✅ **Platform-agnostic** (future: generate iOS, Android tokens)
- ✅ **Developer-friendly** (edit JSON, run build, done)
- ✅ **CI validation built-in** (transforms enforce correct references)

**Cons:**

- ⚠️ **Build step required** (`npm run tokens:build` before dev)
- ⚠️ **Learning curve** (Style Dictionary config syntax)
- ⚠️ **Migration effort** (move existing CSS to JSON format)
- ⚠️ **More complex setup** (initial configuration)

**Complexity:** Medium

**Dependencies:**

- `style-dictionary` npm package
- Custom transforms (DTCG → CSS custom properties)
- CI integration (`npm run tokens:build` + git diff check)

---

### Approach C: Simplified Config File + Custom Parser (User's Idea)

**How it works:**

1. Create `tokens.config` with simple syntax:
   ```
   spacing = 4px; // base unit
   primary-color = #000000;
   header-font = 'Arial';
   ```
2. Custom parser transforms → CSS + JSON + utilities
3. Developer-friendly syntax (no JSON nesting, no `$value`/`$type`)

**Pros:**

- ✅ **Extremely simple syntax** (easiest to read/write)
- ✅ **Single file** (tokens.config)
- ✅ **Custom validation** (can enforce any rules)

**Cons:**

- ❌ **Custom format** (not DTCG standard, no tooling support)
- ❌ **Build custom parser** (significant development time)
- ❌ **No ecosystem** (can't use Style Dictionary, Figma plugins, etc.)
- ❌ **Migration burden** (existing JSON → custom format)
- ❌ **Maintenance** (custom tooling requires ongoing support)
- ❌ **Not portable** (can't share tokens with other teams/tools)

**Complexity:** High (custom parser development)

**Dependencies:** Custom parser, custom validation, custom transforms

---

## Recommendation

**Selected:** **Approach B (Style Dictionary Pipeline)**

### Reasoning

1. **Industry Standard**:
   - Material UI, Chakra UI, IBM Carbon, Salesforce Lightning use this
   - DTCG (W3C Design Tokens Community Group) standard format
   - Rich ecosystem (Figma plugins, VS Code extensions, validation tools)

2. **Automated Validation Built-In**:
   - Style Dictionary transforms enforce semantic token references
   - Can't generate invalid CSS (pipeline fails if tokens don't reference base scale)
   - CI catches issues automatically (no manual code review)

3. **Single Source of Truth** (your goal):
   - Edit `design-system.json` → run `npm run tokens:build` → CSS auto-generated
   - No manual CSS editing (generated files marked read-only)
   - JSON-to-CSS consistency guaranteed

4. **Future-Proof**:
   - Same JSON generates iOS tokens (Style Dictionary supports Swift)
   - Same JSON generates Android tokens (Style Dictionary supports Kotlin/XML)
   - Same JSON integrates with Figma (Tokens Studio plugin)
   - Platform-agnostic design system

5. **Solves Root Cause**:
   - Not a band-aid (Approach A)
   - Not reinventing the wheel (Approach C)
   - Proven solution used by industry leaders

### Trade-offs Accepted

1. **Build step required**: Developers run `npm run tokens:build` before `npm run dev`
   - **Mitigation**: Add to `package.json` scripts, document in README
   - **Alternative**: Watch mode (`npm run tokens:watch`) auto-rebuilds on JSON changes

2. **Learning curve**: Style Dictionary config syntax
   - **Mitigation**: Provide templates, document patterns, Context7 validation
   - **Reality**: Most developers familiar with JSON (easier than CSS custom properties)

3. **Migration effort**: Move existing CSS tokens to JSON
   - **Mitigation**: Script exists (`scripts/convert-css-to-dtcg.ts`) - automated conversion
   - **Timeline**: 2-4 hours (mostly validation, not manual work)

### Risk Assessment

**Low Risk**:

- ✅ Style Dictionary battle-tested (used by Fortune 500 companies)
- ✅ DTCG format W3C standard (stable spec)
- ✅ Non-breaking (CSS output identical to current tokens)
- ✅ Reversible (can rollback to manual CSS if needed)
- ✅ Incremental adoption (can migrate token groups one at a time)

**Medium Risk**:

- ⚠️ Build pipeline complexity (added npm script)
- **Mitigation**: Document, add to README, CI checks

**Comparison to Alternatives**:

- Approach A: Low risk but doesn't solve root cause
- Approach C: High risk (custom tooling, no ecosystem)
- **Approach B: Best risk/reward ratio**

---

## Current State

### Existing Code

**Design System Files:**

- ✅ `design-system.json` - DTCG 1.0.0 format (270 lines, complete token spec)
- ✅ `src/styles/tokens/spacing.css` - Spacing tokens (@theme block)
- ✅ `src/styles/tokens/colors.css` - Color tokens
- ✅ `src/styles/tokens/typography.css` - Typography tokens
- ✅ `src/styles/tokens/sizes.css` - Size tokens
- ✅ `src/styles/tokens/effects.css` - Shadow/transition tokens
- ✅ `src/styles/utilities/*.css` - Utility classes (@utility blocks)
- ✅ `src/app.css` - Entry point (imports all token/utility files)

**Validation Scripts:**

- ✅ `scripts/validate-tokens.js` - Checks orphaned tokens (tokens without utilities)
- ✅ `scripts/validate-dtcg.ts` - Checks DTCG format compliance
- ✅ `scripts/convert-css-to-dtcg.ts` - Converts CSS tokens → JSON (existing)

**CI Configuration:**

- ✅ `.github/workflows/quality-gates.yml` - Runs validation scripts
- ✅ `eslint.config.js` - Blocks hardcoded Tailwind values in HTML/Svelte
- ❌ No validation for semantic token references in CSS

### Dependencies

**Existing:**

- Tailwind CSS 4 (CSS-first config via `@theme` blocks)
- ESLint + `eslint-plugin-better-tailwindcss`
- DTCG schema validation

**New (Required):**

- `style-dictionary` (npm package) - Transform engine
- `@tokens-studio/sd-transforms` (optional) - DTCG-specific transforms

### Patterns

**Existing Patterns:**

- Modular CSS architecture (`src/styles/`)
- Design token governance (`dev-docs/2-areas/design/design-tokens.md`)
- CI validation patterns (`.github/workflows/quality-gates.yml`)

**New Patterns (to create):**

- Style Dictionary config (`style-dictionary.config.js`)
- Token build workflow (`npm run tokens:build`)
- Generated file guards (CI checks for manual edits)

### Reference Code

**Style Dictionary Examples** (Context7 validated):

- DTCG format input: `{ "$type": "dimension", "spacing": { "small": { "$value": "8px" } } }`
- CSS custom properties output: `--spacing-small: 0.5rem;`
- Semantic token references: `{ "$value": "{spacing.small}" }` → `var(--spacing-small)`

**Industry Examples:**

- Material UI: `@mui/system/tokens` (Style Dictionary pipeline)
- Chakra UI: `@chakra-ui/theme-tools` (JSON → CSS vars)
- IBM Carbon: `@carbon/themes` (Style Dictionary transforms)

### Constraints

1. **Must maintain Tailwind CSS 4 compatibility**:
   - Output must be `@theme { --token: value; }` blocks
   - Utility classes use `@utility` blocks

2. **Must maintain existing token names**:
   - No breaking changes to token naming (components depend on these)
   - CSS output identical to current tokens

3. **Must validate semantic token references**:
   - Semantic tokens MUST reference base scale (`var(--spacing-2)`)
   - Hardcoded values in semantic tokens = CI failure

4. **Must work with existing CI pipeline**:
   - No major CI/CD changes
   - Integrate with existing quality gates

---

## Technical Requirements

### Components (New)

**Style Dictionary Configuration:**

- **File:** `style-dictionary.config.js`
- **Purpose:** Transform DTCG JSON → CSS custom properties + utilities
- **Transforms:**
  - `dtcg/dimension` - Convert px → rem (4px → 0.25rem)
  - `dtcg/color` - Convert colors to oklch format
  - `dtcg/fontWeight` - Convert font weights (400, 700)
  - `semantic/reference` - Enforce `var(--base-token)` references

**Custom Transforms:**

- **File:** `scripts/style-dictionary/transforms.js`
- **Transforms:**
  - `tailwind/theme` - Output `@theme { }` blocks
  - `tailwind/utility` - Output `@utility { }` blocks
  - `validate/semantic-reference` - Block hardcoded values in semantic tokens

**Generated Files (Read-Only):**

- `src/styles/tokens/spacing.css` - Auto-generated from JSON
- `src/styles/tokens/colors.css` - Auto-generated from JSON
- `src/styles/tokens/typography.css` - Auto-generated from JSON
- `src/styles/tokens/sizes.css` - Auto-generated from JSON
- `src/styles/tokens/effects.css` - Auto-generated from JSON
- `src/styles/utilities/*.css` - Auto-generated utility classes

### APIs (Scripts)

**Token Build:**

- **Script:** `npm run tokens:build`
- **Command:** `style-dictionary build`
- **Input:** `design-system.json`
- **Output:** `src/styles/tokens/*.css`, `src/styles/utilities/*.css`

**Token Watch:**

- **Script:** `npm run tokens:watch`
- **Command:** `style-dictionary build --watch`
- **Purpose:** Auto-rebuild on JSON changes (dev workflow)

**Semantic Token Validation:**

- **Script:** `npm run tokens:validate-semantic`
- **File:** `scripts/validate-semantic-references.js`
- **Check:** Semantic tokens reference base scale (not hardcoded)
- **Example:** `--spacing-nav-x: var(--spacing-2)` ✅ | `--spacing-nav-x: 0.5rem` ❌

### Data Model

**No schema changes** - `design-system.json` already exists in DTCG format.

**Validation additions:**

- Add `$extensions.isBaseToken: true` to base scale tokens
- Add `$extensions.isSemanticToken: true` to semantic tokens
- Add `$extensions.allowedReferences: ["spacing"]` for validation

**Example:**

```json
{
	"spacing": {
		"$type": "dimension",
		"$description": "Base spacing scale (4px unit)",
		"2": {
			"$value": "8px",
			"$description": "8px - Base scale value",
			"$extensions": {
				"isBaseToken": true
			}
		},
		"nav": {
			"container": {
				"x": {
					"$value": "{spacing.2}",
					"$description": "Nav container horizontal padding",
					"$extensions": {
						"isSemanticToken": true,
						"allowedReferences": ["spacing"]
					}
				}
			}
		}
	}
}
```

### Integrations

**Style Dictionary:**

- Install: `npm install --save-dev style-dictionary @tokens-studio/sd-transforms`
- Config: `style-dictionary.config.js`
- Formats: `css/variables`, `css/utilities` (custom)

**CI Pipeline:**

- Add: `npm run tokens:build` to pre-commit hook
- Add: `npm run tokens:validate-semantic` to CI quality gates
- Add: Git diff check (fail if generated files manually edited)

**Pre-commit Hook:**

```bash
# Run token build (auto-generates CSS)
npm run tokens:build

# Validate semantic references
npm run tokens:validate-semantic

# Check for manual edits to generated files
git diff --exit-code src/styles/tokens/ src/styles/utilities/
if [ $? -ne 0 ]; then
  echo "❌ Generated files have manual edits. Edit design-system.json instead."
  exit 1
fi
```

### Testing

**Token Build Validation:**

- ✅ `npm run tokens:build` succeeds without errors
- ✅ Generated CSS matches expected output (snapshot test)
- ✅ All tokens from JSON appear in CSS

**Semantic Token Validation:**

- ✅ Semantic tokens reference base scale (`var(--spacing-2)`)
- ✅ CI blocks hardcoded values (`0.5rem` instead of `var(--spacing-2)`)
- ✅ CI blocks manual edits to generated files

**Cascade Testing:**

- ✅ Change base token (`--spacing-2: 0.625rem` instead of `0.5rem`)
- ✅ Run build → Semantic tokens update automatically
- ✅ Visual test: All components using semantic tokens reflect change

**Integration Testing:**

- ✅ Tailwind CSS 4 recognizes generated `@theme` blocks
- ✅ Utility classes work correctly (`px-nav-container` → `padding-inline: var(--spacing-nav-container-x)`)
- ✅ Dark mode works (color tokens with light/dark variants)

---

## Success Criteria

### Functional

- ✅ **Single source of truth**: Edit `design-system.json` → run `npm run tokens:build` → CSS auto-generated
- ✅ **Semantic token validation**: CI blocks hardcoded values in semantic tokens
- ✅ **Cascade works**: Change base token → all semantic tokens update automatically
- ✅ **No manual CSS editing**: Generated files marked read-only, CI checks for manual edits
- ✅ **Backward compatible**: Existing components work without changes

### Performance

- ✅ **Token build fast**: `npm run tokens:build` completes in <5 seconds
- ✅ **Watch mode responsive**: Changes to JSON rebuild CSS in <1 second
- ✅ **No runtime performance impact**: CSS output identical to current tokens

### UX

- ✅ **Developer-friendly**: Clear error messages ("Semantic token `--spacing-nav-x` must reference base scale, not hardcode `0.5rem`")
- ✅ **Simple workflow**: Edit JSON → run build → done (no CSS editing)
- ✅ **Documentation**: README updated, examples provided

### Quality

- ✅ **CI validation**: All checks pass (DTCG format, semantic references, no manual edits)
- ✅ **Code review simplified**: Reviewers only check JSON changes (CSS auto-generated)
- ✅ **No duplication**: Token values exist only in JSON (not JSON + CSS)
- ✅ **Cascade guaranteed**: Impossible to create hardcoded semantic tokens (pipeline enforces references)

---

## Code Quality & Validation Strategy

### Build Pipeline Validation

**Style Dictionary:**

- Run `style-dictionary build` during token build
- Validate transforms succeed (no errors)
- Check output files generated correctly

**Snapshot Testing:**

- Save expected CSS output (snapshot)
- After `npm run tokens:build`, compare actual vs expected
- Fail if output differs (unexpected changes)

### Semantic Token Reference Validation

**Script:** `scripts/validate-semantic-references.js`

**Checks:**

1. **Base tokens**: Hardcoded values allowed (these are the base scale)
2. **Semantic tokens**: MUST reference base tokens (`{spacing.2}` → `var(--spacing-2)`)
3. **No hardcoded semantic tokens**: `0.5rem` in semantic token = CI failure
4. **Exception tokens**: Documented exceptions allowed (2px, 6px, 10px with rationale)

**Example validation:**

```javascript
// ✅ PASS: Base token (hardcoded allowed)
"spacing": { "2": { "$value": "8px", "$extensions": { "isBaseToken": true } } }

// ✅ PASS: Semantic token references base
"nav": { "container": { "x": { "$value": "{spacing.2}" } } }

// ❌ FAIL: Semantic token hardcoded
"nav": { "container": { "x": { "$value": "8px" } } } // Should reference {spacing.2}

// ✅ PASS: Exception token with rationale
"nav": { "item": { "y": { "$value": "6px", "$extensions": { "isException": true, "rationale": "Optimal for compact nav" } } } }
```

### CI Validation Strategy

**Pre-commit Hook** (`.git/hooks/pre-commit`):

1. Run `npm run tokens:build` (auto-generate CSS)
2. Run `npm run tokens:validate-semantic` (check references)
3. Check git diff (fail if generated files manually edited)

**CI Pipeline** (`.github/workflows/quality-gates.yml`):

1. Run `npm run tokens:build`
2. Run `npm run tokens:validate-semantic`
3. Check git diff (fail if generated files manually edited)
4. Run existing validations (DTCG format, orphaned tokens)

**Quality Gates:**

- ❌ **Blocking**: Semantic token validation fails (hardcoded values)
- ❌ **Blocking**: Manual edits to generated files detected
- ✅ **Non-blocking**: DTCG format warnings (missing descriptions)

### Validation Timing

**During Development:**

- `npm run tokens:watch` - Auto-rebuild on JSON changes (instant feedback)
- `npm run tokens:validate-semantic` - Run manually before commit

**Before Commit:**

- Pre-commit hook runs validation automatically
- Blocks commit if validation fails

**During CI:**

- Quality gates run full validation suite
- Blocks PR merge if validation fails

### Documentation

**Add to `dev-docs/2-areas/design/design-tokens.md`:**

- Token build workflow (`npm run tokens:build`)
- Semantic token reference rules (MUST use `{spacing.2}`, not `8px`)
- Exception token documentation (how to document exceptions)
- Troubleshooting guide (common errors + solutions)

---

## Implementation Checklist

### Phase 1: Setup Style Dictionary (2-4 hours)

- [ ] Install dependencies:

  ```bash
  npm install --save-dev style-dictionary @tokens-studio/sd-transforms
  ```

- [ ] Create `style-dictionary.config.js`:
  - Configure source (`design-system.json`)
  - Configure platforms (CSS custom properties, utilities)
  - Register DTCG transforms

- [ ] Create custom transforms (`scripts/style-dictionary/transforms.js`):
  - `tailwind/theme` - Output `@theme { }` blocks
  - `tailwind/utility` - Output `@utility { }` blocks
  - `validate/semantic-reference` - Enforce `var(--base-token)` references

- [ ] Test build: `npm run tokens:build`
  - Verify CSS output matches existing tokens
  - Check all token groups generated correctly

### Phase 2: Semantic Token Validation (2-3 hours)

- [ ] Create `scripts/validate-semantic-references.js`:
  - Parse `design-system.json`
  - Check semantic tokens reference base tokens
  - Block hardcoded values in semantic tokens
  - Allow documented exceptions

- [ ] Add validation to package.json:

  ```json
  "tokens:validate-semantic": "node scripts/validate-semantic-references.js"
  ```

- [ ] Test validation:
  - ✅ Pass: Semantic token references base (`{spacing.2}`)
  - ❌ Fail: Semantic token hardcoded (`8px`)
  - ✅ Pass: Exception token with rationale

### Phase 3: CI Integration (1-2 hours)

- [ ] Update `.github/workflows/quality-gates.yml`:
  - Add `npm run tokens:build` step
  - Add `npm run tokens:validate-semantic` step
  - Add git diff check (fail if generated files edited)

- [ ] Update pre-commit hook (`scripts/git-hooks/pre-commit`):
  - Add `npm run tokens:build`
  - Add `npm run tokens:validate-semantic`
  - Add git diff check

- [ ] Test CI locally: `npm run ci:local`

### Phase 4: Documentation (1-2 hours)

- [ ] Update `dev-docs/2-areas/design/design-tokens.md`:
  - Add "Token Build Workflow" section
  - Add "Semantic Token Reference Rules" section
  - Add "Exception Token Documentation" section
  - Add troubleshooting guide

- [ ] Update `README.md`:
  - Add token build step to setup instructions
  - Document `npm run tokens:build` command

- [ ] Create `DESIGN-TOKENS-WORKFLOW.md`:
  - Step-by-step guide for adding new tokens
  - Examples for base tokens vs semantic tokens
  - Exception token documentation process

### Phase 5: Migration & Validation (2-4 hours)

- [ ] Run `npm run tokens:build`
  - Compare generated CSS to existing CSS
  - Fix any discrepancies in `design-system.json`

- [ ] Mark generated files as read-only:
  - Add comment header: "AUTO-GENERATED - DO NOT EDIT"
  - Add `.gitattributes` rule (optional)

- [ ] Run full validation suite:
  - `npm run tokens:validate-dtcg` - DTCG format
  - `npm run tokens:validate-semantic` - Semantic references
  - `npm run tokens:validate` - Orphaned tokens
  - `npm run lint` - ESLint

- [ ] Visual regression test:
  - Run Storybook
  - Check all components render correctly
  - Verify dark mode works

### Phase 6: Cleanup & Deployment (1 hour)

- [ ] Remove old token validation logic (if any)
- [ ] Update CI configuration (make validation blocking)
- [ ] Create PR with all changes
- [ ] Code review + merge
- [ ] Document learnings in `dev-docs/patterns/design-tokens.md`

---

## Appendix

### Why CI Didn't Catch This Issue

**Original Problem:**

- Semantic tokens hardcoded values (`--spacing-nav-x: 0.5rem`) instead of referencing base scale (`var(--spacing-2)`)
- CI didn't fail, PR merged

**Root Cause:**

1. **ESLint validates HTML/Svelte only**:
   - Pattern: `class="min-h-[2.75rem]"` → Blocked ❌
   - Pattern: `--spacing-nav-x: 0.5rem;` (in CSS) → Not checked ✅

2. **Token validation script checks orphaned tokens only**:
   - Checks: "Does token have utility class?"
   - Doesn't check: "Does semantic token reference base scale?"

3. **DTCG validation checks format only**:
   - Checks: `$type`, `$value`, `$description` present
   - Doesn't check: Semantic token value is reference (`{spacing.2}`) not hardcoded (`8px`)

**Solution (This Task):**

- Add semantic token validation (`validate-semantic-references.js`)
- CI blocks hardcoded values in semantic tokens
- Style Dictionary pipeline enforces references automatically

### Context7 Validation Summary

**Style Dictionary (Industry Standard):**

- ✅ Used by Material UI, Chakra UI, IBM Carbon, Salesforce Lightning
- ✅ DTCG format support (W3C standard)
- ✅ JSON → CSS/JS/iOS/Android (platform-agnostic)
- ✅ Transform pipeline (validates references automatically)

**DTCG Format:**

- ✅ W3C Design Tokens Community Group standard
- ✅ Supported by Figma (Tokens Studio plugin)
- ✅ Supported by Adobe XD, Sketch (various plugins)
- ✅ JSON format (`.tokens.json`)

**Single Source of Truth Pattern:**

- ✅ Material UI: `@mui/system/tokens` (JSON → CSS vars)
- ✅ Chakra UI: `@chakra-ui/theme-tools` (JSON → theme object)
- ✅ Ant Design: `@ant-design/cssinjs` (JS → CSS vars)

**Semantic Token References:**

- ✅ Chakra UI: `{ "danger": { "value": "{colors.red}" } }`
- ✅ Material UI: `theme.spacing(2)` (references base scale)
- ✅ Style Dictionary: `"value": "{spacing.base}"` (reference syntax)

### User's Idea Analysis

**Original Idea:**

```
spacing = 4px; // base unit
primary-color = #000000;
header-font = 'Arial';
```

**Why This is Good:**

- ✅ Simple syntax (no JSON nesting)
- ✅ Single file (tokens.config)
- ✅ Easy to read/understand

**Why Style Dictionary is Better:**

- ✅ **Industry standard** (ecosystem, tooling, plugins)
- ✅ **DTCG compliant** (W3C standard, interoperable)
- ✅ **Platform-agnostic** (iOS, Android, Web from same JSON)
- ✅ **Proven at scale** (Fortune 500 companies)
- ✅ **No custom tooling** (maintained by community)

**Hybrid Approach (Best of Both Worlds):**

- Keep DTCG JSON format (standard, portable)
- Add VS Code extension (syntax highlighting, autocomplete)
- Add clear comments/examples in JSON (simple to understand)
- Document "How to add tokens" guide (step-by-step)

**Result**: Developer experience of simple config + ecosystem of DTCG standard

---

**Last Updated:** 2025-11-22  
**Author:** Design Manager (AI)  
**Ticket:** TBD (to be created)  
**Related:** SYOS-373 (Modular CSS), SYOS-385/386 (Token governance), SYOS-406 (Design system audit)
