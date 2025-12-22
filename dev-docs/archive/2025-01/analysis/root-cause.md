# root-cause

Analyze a bug or unexpected behavior to identify root cause before fixing.

**Purpose**: Stop fixing symptoms. Find and fix the actual problem.

---

## When to Use

Use `/root-cause` when:

- Bug keeps coming back after "fixing"
- Fix seems obvious but you're not sure WHY it works
- Multiple possible causes and you need to narrow down
- Symptom is vague ("it doesn't work")

---

## Workflow

### Step 1: Clarify the Symptom

```markdown
## Problem Statement

**What's happening:** [Observable behavior]

**What should happen:** [Expected behavior]

**Where:** [File, component, route]

**When:** [Trigger, user action, timing]

**Reproducible:** [Always / Sometimes / Rarely]
```

If symptom is vague, ask clarifying questions before proceeding.

### Step 2: Read the Code

**Do not guess. Read the actual code.**

For each file involved:

```bash
view [file]
```

Document what you find:

```markdown
## Current Code State

### [file:lines]
```

[code]

```

**Observations:**
- [what you notice]
- [potential issues]
```

### Step 3: Trace the Data Flow

Map how data moves through the system:

```markdown
## Data Flow

1. **Input:** [where data comes from]
   - Value: [what value]
   - Type: [expected type]

2. **Processing:** [what transforms it]
   - Function: [name]
   - Logic: [what it does]

3. **Output:** [where it goes]
   - Expected: [what should appear]
   - Actual: [what appears]

**Break point:** [where flow diverges from expected]
```

### Step 4: Identify Root Cause

Separate the layers:

```markdown
## Root Cause Analysis

**Symptom:** [What user sees / what fails]

**Immediate Trigger:** [What directly causes the symptom]

- [e.g., "variable is undefined"]
- [e.g., "function returns null"]

**Root Cause:** [WHY the trigger exists]

- [e.g., "data source changed, but consumer wasn't updated"]
- [e.g., "async timing issue — query runs before context available"]

**Architecture Principle Violated:** [If applicable]

- Principle #[X]: [name]
- [How it was violated]
```

### Step 5: Check Architecture Alignment

Compare against architecture.md:

| Check             | Expected (per architecture.md) | Actual           | Aligned? |
| ----------------- | ------------------------------ | ---------------- | -------- |
| Identity chain    | sessionId → userId → personId  | [what code does] | ✅ / ❌  |
| Data source       | [expected pattern]             | [actual pattern] | ✅ / ❌  |
| Component pattern | [expected]                     | [actual]         | ✅ / ❌  |

**If misaligned:** Root cause may be architecture violation, not bug in logic.

### Step 6: Assess Fix Confidence

```markdown
## Fix Confidence: [X]%

**High confidence because:**

- [Evidence 1]
- [Evidence 2]

**Uncertainty remains because:**

- [Unknown 1]
- [Unknown 2]

**To increase confidence:**

- [What could be tested]
- [What questions remain]
```

### Step 7: Recommend Fix

```markdown
## Recommended Fix

### Immediate Fix (Stops the symptom)

**Change:** [What to change]
**Location:** [file:line]
**Limitation:** [What this doesn't solve]

### Proper Fix (Addresses root cause)

**Change:** [What to change]
**Location:** [file:line]
**Why this prevents recurrence:** [Explanation]

### Files to Modify

- `path/to/file.ts` — [what changes]

### Test to Confirm

[How to verify the fix works]
```

---

## Output Format

```markdown
# Root Cause Analysis: [Short description]

## Problem Statement

**What's happening:** [symptom]
**What should happen:** [expected]
**Where:** [location]
**Reproducible:** [yes/no/sometimes]

---

## Current Code State

### [file:lines]
```

[code]

```

---

## Data Flow

1. **Input:** [source]
2. **Processing:** [transforms]
3. **Output:** [destination]
4. **Break point:** [where it fails]

---

## Root Cause Analysis

**Symptom:** [observable]
**Immediate Trigger:** [direct cause]
**Root Cause:** [underlying reason]
**Architecture Principle:** [if violated]

---

## Architecture Alignment

| Check | Expected | Actual | Aligned? |
|-------|----------|--------|----------|
| [check] | [expected] | [actual] | ✅ / ❌ |

---

## Fix Confidence: [X]%

**High confidence:** [reasons]
**Uncertainty:** [unknowns]

---

## Recommended Fix

### Immediate Fix
[Change + location]

### Proper Fix
[Change + location + why]

### Files to Modify
- [files]

### Test to Confirm
[verification steps]
```

---

## Common Root Cause Patterns

### Timing / Async

| Symptom                     | Root Cause                          | Fix                         |
| --------------------------- | ----------------------------------- | --------------------------- |
| "undefined" on first render | Query runs before context available | Add loading state / guard   |
| Stale data after mutation   | Reactivity chain broken             | Check $derived dependencies |
| Race condition              | Multiple async operations           | Use proper sequencing       |

### Data Source

| Symptom              | Root Cause                           | Fix                 |
| -------------------- | ------------------------------------ | ------------------- |
| Wrong data displayed | Getting from wrong source            | Verify data flow    |
| Data disappears      | Source changed, consumer not updated | Align to new source |
| Type error           | Schema changed                       | Update types        |

### Identity / Auth

| Symptom              | Root Cause                                | Fix                      |
| -------------------- | ----------------------------------------- | ------------------------ |
| Permission denied    | Using wrong identity (userId vs personId) | Check identity chain     |
| Wrong workspace data | workspaceId from wrong source             | Use context, not derived |
| Auth fails           | Session expired / not passed              | Check session flow       |

### Svelte 5 Reactivity

| Symptom                 | Root Cause                            | Fix                  |
| ----------------------- | ------------------------------------- | -------------------- |
| UI doesn't update       | Reassigned $state, not mutated        | Use proxy properties |
| Infinite loop           | $effect writes to $state it reads     | Use $derived instead |
| Component doesn't react | Props destructured (broke reactivity) | Access via object    |

### Architecture Violations

| Symptom               | Root Cause                       | Fix                  |
| --------------------- | -------------------------------- | -------------------- |
| Inconsistent behavior | Business logic in UI             | Move to Convex       |
| Data drift            | Authority stored, not calculated | Calculate from roles |
| Security hole         | Auth after write                 | Auth before write    |

---

## Critical Rules

1. **Read the code** — Don't guess based on symptom
2. **Trace the data** — Find where flow breaks
3. **Separate layers** — Symptom → Trigger → Root Cause
4. **Check architecture** — Violation = root cause
5. **State confidence** — Be honest about uncertainty
6. **Fix root cause** — Not just the symptom

---

## Begin

Look for a bug description in the conversation.

If found: Clarify symptom → Read code → Trace flow → Identify root cause → Recommend fix

If not found: Ask "What's the bug or unexpected behavior?"

---

## Version History

| Version | Date       | Changes                                                                                |
| ------- | ---------- | -------------------------------------------------------------------------------------- |
| 1.0     | 2025-12-19 | Initial version aligned with architecture.md v4.1. Created as proper command template. |
