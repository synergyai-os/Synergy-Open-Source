# root-cause

**Purpose**: Find root cause using documented patterns OR systematic investigation.

**Key Principle**: **SLOW = FAST** - Methodical investigation prevents wasted time on wrong fixes.

---

## Decision Tree: Known vs Unknown Issue

### Step 0: Check Pattern Index First

- Open `dev-docs/2-areas/patterns/INDEX.md`
- Scan symptom tables (🔴 Critical, 🟡 Important, 🟢 Reference)

**If exact match found** → Follow **Path A: Known Pattern**  
**If no match found** → Follow **Path B: Systematic Investigation**

---

## Path A: Known Pattern (Fast Path)

### 1. Jump to Solution

- Click line number link (e.g., `dev-docs/2-areas/patterns/svelte-reactivity.md#L10`)
- Read compressed pattern: Symptom → Root Cause → Fix

### 2. Assess Confidence

- **95%+ confident**: Apply fix immediately
- **<95% confident**: Research + report findings
  - State confidence % and what's unclear
  - Use Context7 for latest docs if pattern involves libraries

### 3. Apply or Report

- **Confident**: Implement fix as documented
- **Uncertain**: Document what you found, ask for guidance

---

## Path B: Systematic Investigation (Slow = Fast)

**⚠️ CRITICAL**: This path saved 2+ hours by avoiding the SSO red herring. Use it.

### Step 1: Understand What SHOULD Happen

**Goal**: Trace the expected flow end-to-end

**Actions**:

1. Start at the entry point (e.g., user action, API endpoint)
2. Map each step of the expected flow
3. Identify key transition points (e.g., data writes, state changes)
4. Use `codebase_search` for "How does X work?" queries
5. Read actual code - don't guess

**Example**:

```
Expected: Login → WorkOS auth → Create Convex session → Set cookie → Cookie visible to tests
Actual: Login ✅ → WorkOS auth ✅ → Create session ✅ → Set cookie ✅ → Cookie NOT queryable ❌
```

### Step 2: Break Into 2-5 Investigation Steps

**Goal**: Isolate where expected diverges from actual

**Template**:

- **Step 1**: [First transition point] - Verify input/output
- **Step 2**: [Second transition point] - Verify transformation
- **Step 3**: [Third transition point] - Identify divergence
- **Step 4**: [Root cause] - Confirm hypothesis
- **Step 5**: [Validation] - Test fix

**Red Flags to Avoid**:

- ❌ "It's probably X" (without checking X)
- ❌ Skipping steps to "save time"
- ❌ Assuming based on symptoms alone
- ❌ Following red herrings (errors that aren't the root cause)

**Example** (Session persistence bug):

- Step 1: Check login endpoint creates session ✅
- Step 2: Check session written to Convex ✅
- Step 3: Check cookie encoding format 🔍 (found signed format)
- Step 4: Check test extracts sessionId correctly ❌ (used full signed value)
- Step 5: Decode cookie before query ✅ (fix confirmed)

### Step 3: Identify Potential Root Causes

**For each step where actual ≠ expected:**

1. **Read the code** - Don't guess what it does
2. **Check data format** - Is transformation correct?
3. **Verify assumptions** - Are preconditions met?
4. **Look for mismatches** - Do both sides expect same format?

**Common Root Cause Patterns**:

- **Format mismatch**: One side encodes/signs, other expects raw value
- **Race condition**: Write happens after read
- **Wrong query parameter**: Using transformed value instead of original
- **Environment difference**: Dev works, test/prod fails
- **Scope issue**: Global vs instance state

### Step 4: Validate Root Cause (95%+ Confidence)

**Before implementing fix:**

- [ ] Can explain WHY symptom occurs given root cause
- [ ] Identified exact line/function where divergence happens
- [ ] Understand data flow before and after divergence point
- [ ] Fix addresses root cause, not symptom
- [ ] No assumptions - all claims verified with code/logs

**If <95% confident**:

1. State confidence level (e.g., "70% confident root cause is X")
2. List what's still unclear
3. Propose next investigation steps
4. **Don't implement** - report findings first

### Step 5: Implement and Verify

**After fix implemented:**

1. Explain what changed and why
2. Show before/after code
3. Predict expected test results
4. Let user validate

---

## Red Flags: When NOT to Rush

**Stop and go slow if:**

- [ ] Error message is vague or generic
- [ ] Multiple potential causes exist
- [ ] Symptom appears in one environment but not others
- [ ] "Obvious" fix didn't work
- [ ] Time pressure to "just try something"
- [ ] Similar-looking issue was a red herring before

**Example**: SSO error was a red herring - actual issue was session query format mismatch.

---

## Search Strategy

### For Known Patterns:

1. **Symptom match**: Scan `dev-docs/2-areas/patterns/INDEX.md` tables by severity
2. **Technology**: Svelte → `svelte-reactivity.md`, Convex → `convex-integration.md`
3. **Keywords**: Grep domain files for error messages/terms
4. **Related patterns**: Follow `Related: #L[number]` links

### For Unknown Issues:

1. **Entry point**: `codebase_search` "How does [feature] work?"
2. **Flow trace**: Read code from entry → error point
3. **Data format**: `grep` for type definitions, validators
4. **Examples**: Look for similar patterns in working code

---

## Confidence Checklist

✅ **Apply fix if**:

- Exact symptom match in index (Path A)
- OR traced flow end-to-end and found divergence (Path B)
- Root cause clearly explained with code evidence
- Fix validated with Context7 (for library patterns)
- No ambiguity in solution
- **95%+ confidence**

❌ **Research + report if**:

- Symptom similar but not exact
- Multiple possible causes remain
- Flow trace incomplete or assumptions made
- Library-specific and not validated
- Solution unclear or missing context
- **<95% confidence**

---

## Quick Reference

### Pattern Files:

- **Svelte 5**: `dev-docs/2-areas/patterns/svelte-reactivity.md`
- **Convex**: `dev-docs/2-areas/patterns/convex-integration.md`
- **UI/UX**: `dev-docs/2-areas/patterns/ui-patterns.md`
- **Analytics**: `dev-docs/2-areas/patterns/analytics.md`
- **CI/CD**: `dev-docs/2-areas/patterns/ci-cd.md`

### Investigation Tools:

- **Understand flow**: `codebase_search` with "How does X work?" queries
- **Find code**: `grep` for exact symbols, error messages
- **Trace data**: `read_file` with offsets for large files
- **Validate libs**: Context7 for latest library docs

---

## Examples

### Good Investigation (Slow = Fast):

**Issue**: Tests fail with "Session not found in Convex"

**Investigation**:

1. ✅ Traced login flow: /auth/login → establishSession → createSessionRecord → Convex insert
2. ✅ Verified session created: Cookie exists, value is `sessionId.signature`
3. ✅ Checked test query: Using full cookie value (with `.signature`)
4. ✅ Checked Convex storage: Only stores `sessionId` (before dot)
5. ✅ Root cause: Format mismatch - test queries with signed value, Convex has unsigned value
6. ✅ Fix: Decode cookie to extract `sessionId` before querying
7. ✅ Confidence: 100% - exact divergence point identified

**Time**: 20 minutes systematic investigation  
**Result**: Correct fix on first try

### Bad Investigation (Too Fast):

**Issue**: Tests fail with "Session not found in Convex"

**Investigation**:

1. ❌ Saw "not found" error
2. ❌ Assumed race condition
3. ❌ Added `waitForTimeout(2000)` everywhere
4. ❌ Still failed
5. ❌ Tried adding retry logic
6. ❌ Still failed
7. ❌ Suspected SSO configuration issue
8. ❌ Spent 2 hours investigating WorkOS settings

**Time**: 2+ hours on wrong path  
**Result**: No progress, multiple failed attempts

---

**Last Updated**: 2025-11-15  
**Key Learning**: Methodical investigation (slow) finds root cause faster than trying random fixes (fast)
