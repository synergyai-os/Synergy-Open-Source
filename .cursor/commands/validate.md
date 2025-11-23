validate if its resolved correctly (within ticket scope/criteria). If yes. update /linear ticket

- NEVER update our ticket after finding a problem and making edits in our code. This requires a new round of validation by me and you.
- NEVER create an MD document. Keep everything inside the relevant ticket. if no ticket exists, return your feedback as a chat comment.
- 🚨 **CRITICAL**: If user testing is required, DO NOT mark ticket as done until user confirms tests passed. Wait for explicit confirmation before updating ticket status.

## 🎯 Output Format (CRITICAL)

**ONLY output a brief summary (2-3 sentences max). Do NOT list all checks performed.**

**Summary Format:**

```
**Summary:** [What we did in 1 sentence]. [Why it matters in 1-2 sentences - focus on impact/value, not technical details].
```

**Examples:**

- ✅ **Good**: "**Summary:** Added image upload to chat. Users can now share screenshots and photos directly in conversations, making collaboration faster."
- ❌ **Bad**: "Validated TypeScript compilation passes ✅, linting passes ✅, modularity checks passed ✅, no regressions ✅..."

**Why**: The checklist below is for internal validation steps. Perform all checks internally, but only output the summary to the ticket. This keeps feedback concise and actionable.

---

## Validation Checklist

**Note**: Perform these checks internally. Do NOT list them in the ticket comment. Only output the summary above.

### 1. Testing Strategy (AI vs User)

**Before functional validation, determine testing approach:**

- [ ] **Can AI test this?** → Perform automated testing (code review, linting, type checking, unit tests)
- [ ] **Does this require USER testing?** → Only if AI cannot validate (visual/UX checks, subjective quality, real device testing)
- [ ] **If user testing required** → Run `/test-manual` to generate concise test instructions
- [ ] **Include test instructions** in validation comment (for user to execute)
- [ ] **🚨 DO NOT mark ticket as done** - Wait for user to execute tests and confirm results
- [ ] **Only after user confirmation** → Proceed with marking ticket as complete

**AI can test (perform automatically):**

- ✅ Code correctness (TypeScript, linting, type checking)
- ✅ Logic validation (unit tests, integration tests)
- ✅ API responses (Convex functions, data flows)
- ✅ Code structure (modularity, patterns, architecture)
- ✅ Backend functionality (database queries, mutations)

**User testing required (AI cannot validate):**

- ❌ Visual appearance (spacing, colors, typography - subjective)
- ❌ UX flow (does it feel right, intuitive interactions)
- ❌ Real device testing (mobile, tablet, different browsers)
- ❌ Performance perception (does it feel fast/slow)
- ❌ Accessibility (screen reader, keyboard navigation - requires human testing)

**Decision rule**: If AI can validate → do it automatically. Only generate `/test-manual` instructions when user testing is actually required.

**See**: `/test-manual` command for test instruction format and guidelines

### 2. Functional Validation

**Perform automated validation (AI can do this):**

- ✅ Code works as specified (within ticket scope/criteria)
- ✅ No regressions introduced
- ✅ Edge cases handled appropriately
- ✅ TypeScript compilation passes
- ✅ Linting passes
- ✅ Tests pass (if applicable)

**If user testing was required (from step 1):**

- ✅ **User testing passed** - Wait for explicit user confirmation before proceeding
- 🚨 **DO NOT mark ticket as done** until user confirms all tests passed

### 3. Modularity Validation ⭐ **MANDATORY**

**Reference**: [System Architecture - Modularity](dev-docs/2-areas/architecture/system-architecture.md#6-modularity--module-system)

**Quick Checks** (if new module/feature added):

- [ ] **Feature Flag Created?** → New module has flag in `src/lib/featureFlags.ts` and `convex/featureFlags.ts`
- [ ] **Per-Org Enablement?** → Uses `allowedOrganizationIds` targeting (if applicable)
- [ ] **Loose Coupling?** → No direct imports from other modules' internals (`src/lib/components/[other-module]/`)
- [ ] **Module Boundaries?** → Uses shared utilities (`src/lib/utils/`, `src/lib/types/`) or documented APIs
- [ ] **Hardcoded Dependencies?** → Module doesn't assume another module is always enabled

**If violations found**: Document in ticket comment (briefly), mark ticket as needs work (don't mark as done).

**Common Violations**:

- ❌ New module without feature flag
- ❌ Direct imports: `import { X } from '../other-module/Component.svelte'`
- ❌ Missing per-org targeting for org-specific modules
- ❌ Module assumes another module exists without checking flag

**Note**: See "Output Format" section above for summary format. Only output summary (not checklist items).

### 4. Update Ticket Status

**⚠️ CRITICAL RULES:**

- **If user testing was required**: DO NOT mark ticket as done until user explicitly confirms tests passed
- **If only AI testing was required**: Can mark ticket as done after automated validation passes
- **If validation fails**: Mark ticket as needs work, document issues in comment

**Only mark ticket as complete when:**

- ✅ All automated validation passed (TypeScript, linting, tests)
- ✅ Modularity validation passed (if applicable)
- ✅ User testing confirmed passed (if user testing was required)

### 5. Archive Task Document (if applicable)

**If validation passes and ticket is marked complete:**

- [ ] **Check for task document**: Look for `ai-docs/tasks/[ticket-id]-*.md` or `ai-docs/tasks/*.md` related to this ticket
- [ ] **Move to archive**: Move task document → `dev-docs/4-archive/tasks/[ticket-id]-*.md`
- [ ] **Preserve history**: Task documents are archived (not deleted) for reference

**Why**: Task documents are pre-coding analysis. Once work is complete and validated, they become historical reference material and should be archived to keep `ai-docs/tasks/` clean and focused on active work.

**Note**: Only archive if validation passes and ticket is marked complete. If validation fails, keep task document in `ai-docs/tasks/` for continued reference.
