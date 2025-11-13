# Ticket Writing Patterns for AI Implementation

**Purpose**: How to write Linear tickets that enable parallel AI implementation and clear technical execution.

---

## When to Use This Guide

**For:**

- Product engineers writing technical tickets
- Breaking down overlapping work into parallel tracks
- Creating tickets for AI agents (Cursor, Claude, etc.)
- Organizing complex initiatives with multiple workstreams

**Key Principle**: Technical clarity enables autonomous execution. AI agents need specificity, not ambiguity.

---

## Core Patterns

### Pattern 1: User-Centric + Technical Detail

**Problem**: Tickets written only for humans lack technical specificity for AI agents. Tickets written only for AI lack product context.

**Solution**: Combine Marty Cagan's user stories with technical implementation details.

#### Structure

````markdown
## Context

[1-2 sentences: Why this work matters]

**Why this matters**: [User outcome or business value]

---

## Goals

**Outcome**: [What success looks like]  
**User Impact**: [How users benefit]  
**Success Metrics**:

- [Measurable criteria 1]
- [Measurable criteria 2]

---

## Technical Scope

**What to build:**

- [Specific module 1] - [What it does]
- [Specific module 2] - [What it does]

**Implementation pattern:**

```[language]
// Example showing the pattern
const example = () => {
  // Clear code example
};
```
````

**Files to modify:**

- `path/to/file1.ts` - [What changes]
- `path/to/file2.ts` - [What changes]

---

## Success Criteria

- [Testable criterion 1] ✅
- [Testable criterion 2] ✅
- [Testable criterion 3] ✅

---

## Resources

- **Docs**: Link to relevant docs
- **Examples**: Link to similar implementations
- **Tools**: Libraries or tools needed

```

#### Example

**❌ BAD (Too vague for AI):**
```

Title: Fix test coverage
Description: We need better tests

```

**✅ GOOD (Clear for AI + user-centric):**
```

Title: Expand integration test coverage - Organizations, Users, RBAC modules

## Goal

Add integration tests for Organizations, Users, and RBAC modules following
the pattern established in Tags/Flashcards tests.

**User outcome**: Catch authorization bugs before production (e.g., users
accessing other orgs' data).

## Technical Scope

**Test these functions:**

### Organizations (`convex/organizations.ts`)

- `createOrganization` - Creates org, assigns creator as owner
- `updateOrganization` - Only owners/admins can update
- `deleteOrganization` - Only owners can delete

### Testing Pattern

```typescript
import { convexTest } from 'convex-test';
import { createTestSession } from './helpers';

test('createOrganization assigns creator as owner', async () => {
	const t = convexTest(schema);
	const session = await createTestSession(t, 'owner@example.com');

	const orgId = await t.mutation(api.organizations.createOrganization, {
		sessionId: session.sessionId,
		name: 'Test Org'
	});

	expect(orgId).toBeDefined();
});
```

## Files to Create

- `tests/convex/integration/organizations.test.ts` (~150 lines, 6-8 tests)
- `tests/convex/integration/users.test.ts` (~100 lines, 4-6 tests)

## Success Criteria

- All 15-20 tests passing in < 30 seconds ✅
- Tests catch missing sessionId destructuring ✅
- Zero flaky tests (run 10 times, 100% pass rate) ✅

```

---

### Pattern 2: Split Overlapping Tickets for Parallel Execution

**Problem**: Multiple tickets with overlapping scope block parallel AI implementation.

**Symptoms**:
- Both tickets mention same features (E2E tests, TypeScript checks)
- Unclear which agent should work on what
- Risk of duplicate work or merge conflicts

**Solution**: Reorganize into clear technical boundaries that can run simultaneously.

#### Decision Framework

**Question 1: Can we identify clean technical boundaries?**
- YES → Split by boundary (testing vs deployment, frontend vs backend)
- NO → Keep as single ticket, implement sequentially

**Question 2: Do the boundaries have different goals?**
- YES → Create separate parent tickets
- NO → Keep as subtasks under one parent

**Question 3: Can both tracks ship value independently?**
- YES → Both are shippable units
- NO → One depends on the other, do sequentially

#### Splitting Process

1. **Identify Technical Boundaries**
```

Example:

- Track A: Testing infrastructure (integration tests, test helpers)
- Track B: CI/CD pipeline (quality gates, secret scanning)

```

2. **Redistribute Subtasks**
```

Old: SYOS-44 & SYOS-50 (overlapping)
↓
New: SYOS-59 (testing) & SYOS-60 (CI/CD)

- E2E test fixes → Split into:
  - SYOS-63: Fix E2E CI execution (Track A)
  - SYOS-70: Expand E2E coverage (Track B)

````

3. **Update Old Tickets**
```markdown
## ⚠️ SUPERSEDED BY SYOS-59

This ticket has been reorganized for parallel AI implementation.

**Use these instead:**
- **SYOS-59**: Test Infrastructure & Coverage
- **SYOS-60**: CI/CD Pipeline & Security Gates

**Why reorganized:** [Brief explanation]
````

4. **Ensure Clear Dependencies**

   ```markdown
   ## Dependencies

   - Requires: [What must be done first]
   - Blocks: [What waits for this]
   - Parallel: [What can run simultaneously]
   ```

#### Template: Track Separation

```markdown
## Track A: [Focus Area]

**Focus**: [What this track owns]  
**Non-Goals**: [What Track B handles]

**Subtasks:**

- TICKET-X: [Clear technical scope]
- TICKET-Y: [Clear technical scope]

**Can ship independently**: Yes/No

---

## Track B: [Focus Area]

**Focus**: [What this track owns]  
**Non-Goals**: [What Track A handles]

**Subtasks:**

- TICKET-Z: [Clear technical scope]

**Can ship independently**: Yes/No
```

---

### Pattern 3: Priority-Driven Subtask Organization

**Problem**: Flat list of subtasks doesn't communicate urgency or sequence.

**Solution**: Use priority tiers with clear shipping order.

#### Structure

```markdown
## Subtasks (Priority Order)

**🔴 URGENT (Ship First)**

- TICKET-1: [Title] (URGENT) - [Why urgent]
- TICKET-2: [Title] (URGENT) - [Why urgent]

**🟠 HIGH (Ship Week 1)**

- TICKET-3: [Title] (HIGH) - [Impact]
- TICKET-4: [Title] (HIGH) - [Impact]

**🟡 MEDIUM (Ship Week 2)**

- TICKET-5: [Title] (MEDIUM) - [Nice to have]

**🟢 LOW (Future/Optional)**

- TICKET-6: [Title] (LOW) - [Can defer]
```

**Benefits**:

- Visual priority scanning (🔴 urgent stands out)
- Clear shipping sequence
- Easy to defer low priority work

---

### Pattern 4: Non-Goals Section

**Problem**: Tickets expand in scope during implementation ("scope creep").

**Solution**: Explicitly state what's out of scope.

#### Template

```markdown
## Non-Goals

- ❌ TypeScript strict mode (separate track)
- ❌ Performance optimization (separate concern)
- ❌ Secret scanning (Track B handles this)
- ❌ Integration test coverage (Track A handles this)
```

**Why this works**:

- Prevents AI agents from over-implementing
- Clarifies boundaries between tracks
- Makes scope discussions explicit

---

### Pattern 5: File-Specific Implementation Guidance

**Problem**: "Update the tests" is too vague for AI agents.

**Solution**: List exact files and what changes in each.

#### Template

```markdown
## Files to Modify

**New files:**

- `tests/convex/integration/organizations.test.ts` (~150 lines, 6-8 tests)
- `tests/convex/integration/users.test.ts` (~100 lines, 4-6 tests)

**Update:**

- `playwright.config.ts` - Add CI-specific config (lines 20-35)
- `e2e/**/*.spec.ts` - Fix race conditions, add proper waits
- `dev-docs/testing-workflow.md` - Document new tests (add section)

**Remove:**

- `src/legacy/old-test.ts` - No longer needed
```

**Why estimates help**:

- AI can gauge complexity
- Easier to validate completion
- Clear scope boundaries

---

## Anti-Patterns

### ❌ Anti-Pattern 1: Feature-Only Tickets

```markdown
Title: Add keyboard navigation
Description: Users should be able to navigate with keyboard
```

**Problem**: No technical detail, AI has to guess implementation.

**Fix**: Add technical scope, files, patterns.

---

### ❌ Anti-Pattern 2: Technical-Only Tickets

```markdown
Title: Refactor useSession composable
Description: Extract session logic to .svelte.ts file
```

**Problem**: No user value, no "why". Just mechanical work.

**Fix**: Add user story - who benefits and why.

---

### ❌ Anti-Pattern 3: Overlapping Subtasks

```markdown
Parent: TICKET-A

- Subtask 1: Fix E2E tests

Parent: TICKET-B

- Subtask 2: Fix E2E tests
```

**Problem**: Duplicate work, unclear ownership.

**Fix**: Split by technical boundary (CI execution vs test coverage).

---

### ❌ Anti-Pattern 4: Missing Success Criteria

```markdown
Title: Improve test coverage
Description: Add more tests
```

**Problem**: No definition of "done". AI doesn't know when to stop.

**Fix**: Add measurable criteria (15-20 tests, < 30s execution, 100% pass rate).

---

### ❌ Anti-Pattern 5: Vague Dependencies

```markdown
## Dependencies

- Requires some other work
- Blocks future stuff
```

**Problem**: AI can't determine sequencing.

**Fix**: Use specific ticket IDs (SYOS-26, SYOS-39) or clear technical dependencies.

---

## Checklist: AI-Ready Ticket

Before creating a ticket, verify:

**User Story:**

- [ ] Clear WHO benefits (user, developer, contributor)
- [ ] Clear WHAT VALUE delivered (outcome, not output)
- [ ] Clear WHY it matters (pain point solved)

**Technical Detail:**

- [ ] Specific modules/functions listed
- [ ] Code examples or patterns provided
- [ ] Files to modify with line count estimates
- [ ] Non-goals explicitly stated

**Success Criteria:**

- [ ] Measurable (numbers, counts, times)
- [ ] Testable (can verify completion)
- [ ] Complete (nothing left ambiguous)

**Dependencies:**

- [ ] Requires: Clear prerequisites
- [ ] Blocks: Clear downstream work
- [ ] Parallel: Clear what can run simultaneously

**Resources:**

- [ ] Documentation links
- [ ] Example implementations
- [ ] Tools/libraries needed

---

## Meta: When to Split Tickets

### Heuristics

**Split if:**

- ✅ 2+ AI agents could work in parallel
- ✅ Clean technical boundaries exist (testing vs deployment)
- ✅ Both tracks ship value independently
- ✅ Total work > 1 week (splitting reduces risk)

**Keep together if:**

- ❌ Technical boundary is fuzzy (lots of shared files)
- ❌ One track depends entirely on the other
- ❌ Total work < 3 days (overhead not worth it)
- ❌ Team has limited bandwidth (focus > parallelism)

### Reorganization Template

```markdown
## Original Tickets (Superseded)

- ~~TICKET-A~~ → Split into TICKET-NEW-A (Track A)
- ~~TICKET-B~~ → Split into TICKET-NEW-B (Track B)

**Why reorganized:**
[Problem]: Overlapping scope, unclear ownership
[Solution]: Split by [technical boundary]
[Benefits]: Parallel execution, clear scope, no conflicts

**Migration:**

- Old tickets marked "SUPERSEDED BY"
- Old subtasks cancelled or redirected
- New tickets link to old for context
```

---

## Real-World Example: SYOS-44 & SYOS-50 Split

### Before (Overlapping)

**SYOS-44**: Improve CI/CD test automation

- Static analysis ✅
- Integration tests ✅
- **E2E test fixes** ⚠️ (overlap)
- **TypeScript checks** ⚠️ (overlap)

**SYOS-50**: Improve CI/CD test automation - Part 2

- Quality gates
- Secret scanning
- **E2E test coverage** ⚠️ (overlap)
- **TypeScript pre-commit** ⚠️ (overlap)

**Problem**: Unclear which agent fixes E2E or TypeScript.

---

### After (Clean Separation)

**SYOS-59: Test Infrastructure & Coverage**

- Focus: Testing infrastructure, test coverage
- SYOS-61: Integration tests (Organizations, Users, RBAC)
- SYOS-62: Integration tests (Notes, Inbox)
- SYOS-63: Fix E2E CI execution (configuration, not coverage)
- SYOS-64: Contract tests (future)

**SYOS-60: CI/CD Pipeline & Security Gates**

- Focus: CI/CD pipeline, security scanning
- SYOS-65: Enable quality gates
- SYOS-66: Add secret scanning
- SYOS-67: Remove hardcoded credentials
- SYOS-68: Fix test mocks (security validation)
- SYOS-69: Security validation tests (not generic E2E)
- SYOS-70: E2E coverage expansion (user flows, not CI)
- SYOS-71: TypeScript pre-commit hook

**Resolution**:

- E2E split: CI execution (Track A) vs coverage expansion (Track B)
- TypeScript: Pre-commit hook only (Track B), not strict mode

**Benefits**:

- Agent 1 writes tests without touching CI
- Agent 2 fixes CI without writing tests
- Zero conflicts, parallel execution

---

## Resources

- **Linear Integration**: `dev-docs/2-areas/linear-integration.md` (workflow)
- **Flow Metrics**: `dev-docs/2-areas/flow-metrics.md` (tracking)
- **Product Principles**: `dev-docs/2-areas/product-principles.md` (Marty Cagan)

---

**Last Updated**: 2025-11-12  
**Related**: Linear Integration, Product Principles, Flow Metrics
