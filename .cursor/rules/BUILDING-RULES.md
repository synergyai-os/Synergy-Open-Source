# Building Cursor Rules - Iterative Process

**Purpose**: Systematic process for building Cursor rules from AI mistakes. Prevents repeating mistakes and improves code quality over time.

**Why this matters**: When AI makes a mistake, we need a process to create/update rules so it never makes that mistake again. Rules are proactive constraints that prevent mistakes before they happen.

---

## 🎯 Rules vs Patterns

**Key Difference**:

- **Rules** (`.cursor/rules/*.mdc`): **Proactive constraints** - Always enforced, prevent mistakes
- **Patterns** (`dev-docs/2-areas/patterns/*.md`): **Reactive solutions** - Lookup when problems occur

**When to use Rules**:

- ✅ Mistake happens **repeatedly** (2+ times)
- ✅ Mistake is **critical** (breaks functionality, security, CI)
- ✅ Mistake can be **prevented proactively** (constraint/validation)
- ✅ Rule can be **< 100 lines** (keep rules short)

**When to use Patterns**:

- ✅ One-time mistake (not repeated)
- ✅ Complex solution (needs examples, context)
- ✅ Domain-specific (Svelte reactivity, Convex integration)
- ✅ Solution is **reactive** (fix when problem occurs)

**Decision Tree**:

```
AI makes mistake
├─ Is it critical? (breaks functionality, security, CI)
│  ├─ Yes → Create rule (proactive prevention)
│  └─ No → Continue below
├─ Has it happened 2+ times?
│  ├─ Yes → Create rule (prevent repetition)
│  └─ No → Continue below
├─ Can it be prevented proactively? (constraint/validation)
│  ├─ Yes → Create rule
│  └─ No → Create pattern (reactive solution)
└─ Is solution complex? (needs examples, context)
   ├─ Yes → Create pattern
   └─ No → Create rule
```

---

## 📋 Rule Building Process

### Step 1: Identify the Mistake

**When**: AI makes a mistake during implementation

**What to capture**:

- **What happened**: Exact mistake (e.g., "Used `any` type, CI lint failed")
- **Why it happened**: Root cause (e.g., "Didn't check coding standards")
- **Impact**: What broke (e.g., "CI blocked PR, had to fix manually")

**Example**:

```
Mistake: Used `any` type in TypeScript code
Root Cause: Didn't check coding-standards.md before coding
Impact: CI lint failed, PR blocked, had to fix manually
```

---

### Step 2: Decide: Rule or Pattern?

**Use decision tree above** to determine if this should be a rule or pattern.

**Example Decisions**:

**Rule** (Proactive Prevention):

- ❌ Using `any` type → **Rule**: "Never use `any` type" (critical, CI blocks)
- ❌ Missing Linear ticket ID → **Rule**: "REFUSE to work without ticket" (critical, workflow breaks)
- ❌ Hardcoded values → **Rule**: "Never use hardcoded values" (repeated mistake)

**Pattern** (Reactive Solution):

- ✅ Svelte reactivity issue → **Pattern**: "Use `$state({})` + getters" (domain-specific, needs examples)
- ✅ Convex query fails → **Pattern**: "Use `sessionId` parameter" (complex solution, needs context)
- ✅ UI component broken → **Pattern**: "Use design tokens" (domain-specific, needs examples)

---

### Step 3: Create Rule (If Decision = Rule)

**Rule Format**:

````markdown
---
alwaysApply: true
# OR
description: apply when working with [topic]
globs: ['**/*topic*', '**/path/**']
---

# Rule Title

**Purpose**: One-line description of what this rule prevents

**Context**: When/why this rule exists (mistake that triggered it)

## Problem

**What happens**: Description of the mistake
**Why it happens**: Root cause
**Impact**: What breaks (CI, security, functionality)

## ❌ Bad Example

```typescript
// Show the mistake
const bad = any; // ❌ Wrong
```
````

## ✅ Good Example

```typescript
// Show the correct approach
const good: string = 'value'; // ✅ Correct
```

## Rules

**NEVER do X** → Use Y instead
**ALWAYS do Z** → Validation step

**Validation**: How to check before implementing

````

**Rule Location**: `.cursor/rules/[topic].mdc`

**Rule Size**: Keep < 100 lines (move detailed examples to commands if needed)

---

### Step 4: Update Existing Rule (If Rule Already Exists)

**When**: Mistake matches existing rule, but rule didn't prevent it

**What to do**:
1. **Enhance rule**: Add edge case to "Problem" section
2. **Add example**: Add bad/good example for the edge case
3. **Strengthen language**: Make constraint more explicit
4. **Add validation**: Add check step if missing

**Example Enhancement**:

```markdown
## Problem

**What happens**: Using `any` type in TypeScript
**Why it happens**: Didn't check coding standards, or edge case not covered
**Impact**: CI lint fails, PR blocked

**Edge Case** (added after mistake):
- Test files may use `any` for mocks (ESLint allows it)
- But production code must never use `any`

## Rules

**NEVER use `any` type** → Use proper types or `unknown` + type guards
**Exception**: Test files (`.test.ts`, `.spec.ts`) may use `any` - ESLint allows it

**Validation**: Check `dev-docs/2-areas/development/coding-standards.md` before coding
````

---

### Step 5: Document in `/save` Workflow

**When**: Rule created/updated during `/save` phase

**What to document**:

- Rule created: "Created rule `.cursor/rules/[topic].mdc` to prevent [mistake]"
- Rule updated: "Enhanced rule `.cursor/rules/[topic].mdc` with edge case [description]"
- Decision: "Chose rule over pattern because [reason]"

**Integration**: See `/save` command - Rule Building section

---

## 📚 Examples from Existing Rules

### Example 1: `working-with-linear.mdc`

**Mistake**: AI created tickets without project ID, workflow broke

**Rule Created**:

```markdown
---
alwaysApply: true
---

# Working with Linear - Critical Rules

**NEVER create ticket without project ID** → Get/create project first
**ALWAYS assign to Randy** → Use `assigneeId: 'c7c555a2-895a-48b6-ae24-d4147d44b1d5'`

**Validation**: Check project ID before creating ticket
```

**Why Rule**: Critical workflow constraint, prevents repeated mistakes

---

### Example 2: `svelte-typescript-patterns.mdc`

**Mistake**: AI used `any` type repeatedly, CI failed multiple times

**Rule Created**:

```markdown
---
alwaysApply: true
---

# Svelte 5 + TypeScript + Convex Development Standards

## Critical Rules (NEVER Do These)

1. ❌ **Never use `any` type** → Use proper types or `unknown` + type guards (blocks CI lint)
2. ❌ **Never use `{#each}` without keys** → Always `{#each items as item (item._id)}` (ESLint error)
```

**Why Rule**: Critical CI blocker, repeated mistake, proactive prevention

---

### Example 3: `posthog-integration.mdc`

**Mistake**: AI hallucinated API keys, security risk

**Rule Created**:

```markdown
---
description: apply when working with PostHog
globs: ['**/*posthog*', '**/analytics/**']
---

# PostHog Integration Rules

**NEVER hardcode API keys** → Use environment variables
**NEVER hallucinate API keys** → Check `.env.local` or ask user
```

**Why Rule**: Security constraint, critical mistake, scoped with globs

---

## ✅ Rule Creation Checklist

**Before creating a rule:**

- [ ] Mistake happened **2+ times** OR is **critical** (breaks functionality, security, CI)
- [ ] Mistake can be **prevented proactively** (constraint/validation)
- [ ] Rule can be **< 100 lines** (keep short)
- [ ] Rule is **actionable** (not just reference - use command for reference)
- [ ] Decision made: **Rule** (not pattern)

**Rule Format:**

- [ ] Frontmatter: `alwaysApply: true` OR `globs` for scoping
- [ ] Purpose: One-line description
- [ ] Context: Why rule exists (mistake that triggered it)
- [ ] Problem: What/why/impact
- [ ] Bad Example: Shows the mistake
- [ ] Good Example: Shows correct approach
- [ ] Rules: NEVER/ALWAYS statements
- [ ] Validation: How to check before implementing

**After creating rule:**

- [ ] Rule prevents mistake (test: Would rule have caught this?)
- [ ] Rule is scoped correctly (`alwaysApply` vs `globs`)
- [ ] Rule is < 100 lines (move examples to command if needed)
- [ ] Documented in `/save` workflow

---

## 🔄 Iterative Improvement

**Process**:

1. **Mistake occurs** → AI makes mistake
2. **Identify mistake** → Capture what/why/impact
3. **Decide rule vs pattern** → Use decision tree
4. **Create/update rule** → Follow rule format
5. **Test rule** → Would rule have prevented mistake?
6. **Document** → Update `/save` workflow

**Goal**: Rules prevent mistakes proactively, reducing corrections over time.

---

## 📖 Related Documentation

- **Rules Best Practices**: `.cursor/rules/README.md` - Rule optimization and format
- **Patterns System**: `dev-docs/2-areas/patterns/INDEX.md` - Pattern lookup
- **Save Workflow**: `.cursor/commands/save.md` - Rule building integration
- **Coding Standards**: `dev-docs/2-areas/development/coding-standards.md` - Rules source

---

**Last Updated**: 2025-11-20  
**Purpose**: Systematic process for building rules from AI mistakes  
**Status**: Active process
