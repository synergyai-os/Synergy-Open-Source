# start

**Purpose**: Universal onboarding for any LLM/agent coding session. Read first.

---

## ⚠️ CRITICAL: Communication Style

**User prefers concise, dense communication:**

- Keep answers SHORT
- Minimum fluff - be direct
- Dense information - maximum value, minimum words
- If user needs more - they will ask

**⚠️ NEVER CREATE DOCUMENTATION UNLESS EXPLICITLY ASKED**

**When in doubt**: Ask first, don't create.

---

## 🔍 Problem-Solving Workflow (MANDATORY)

**Before implementing any fix or feature:**

1. **Identify Problem** - Clearly state what's broken or what needs to be built
2. **Confirm Root Cause** - Investigate why it's happening (check logs, trace code flow, test hypotheses)
3. **Validate Pattern with DevDocs** - Check `dev-docs/2-areas/patterns/INDEX.md` for existing solutions
4. **Create Hypothesis to Solution** - Design the fix based on root cause and patterns
5. **Confidence Check**:
   - **95%+ confident**: Implement directly
   - **<95% confident**: Provide short recap (problem → solution → confidence score) and wait for confirmation

**Why**: Prevents writing unnecessary code, introducing bugs, creating spaghetti code, and leaving garbage in the codebase. We want simple, clean, maintainable, scalable, reliable, secure code.

## 🔍 Workflow: Investigate → Scope → Plan → Confirm

**Before building anything:**

1. **Investigate** - Understand current state, existing patterns
2. **Scope** - Define what's in/out
3. **Plan** - Outline approach, steps, issues
4. **Confirm** - Get user approval

**Never start coding without user confirmation.**

---

## 📚 Library Documentation

**Use Context7 MCP before web search:**

1. Call `mcp_context7_resolve-library-id` to find library
2. Call `mcp_context7_get-library-docs` with topic
3. Only web search if Context7 fails

**Why**: Up-to-date, accurate docs with code examples.

---

## 🔧 Critical Workflows

### `/root-cause` - Find Solutions Fast

**When**: Investigating bugs/issues

1. Load `dev-docs/2-areas/patterns/INDEX.md` (200 lines)
2. Scan symptom table → jump to line number
3. Read: Symptom → Root Cause → Fix
4. Apply if 95%+ confident
5. If uncertain: Research, report confidence

### `/save` - Capture Knowledge

**When**: End of session, before commit

1. Analyze what changed
2. Search `dev-docs/2-areas/patterns/INDEX.md` for existing patterns
3. Update domain file OR add new pattern
4. Update INDEX.md symptom table
5. Mark Linear ticket as "In Review" (human marks "Done")
6. Commit locally (on feature branch)
7. Create PR to main (don't push directly to main)

---

## ✅ General Principles

**Before Writing Code:**

- Check `dev-docs/2-areas/patterns/INDEX.md` for existing solutions
- Use Context7 for library documentation
- Investigate, scope, plan, get confirmation

**When Debugging:**

- Use `/root-cause` command
- Load `dev-docs/2-areas/patterns/INDEX.md` → jump to line number
- Validate with Context7 for library patterns
- Only fix if 95%+ confident

**When Uncertain:**

- Research and report confidence %
- Ask user before implementing
- Don't guess - validate first

---

## 📋 **Linear Ticket Management (AI Responsibilities)**

**When you create or manage tickets:**

### ✅ **AI Must Check Off (Don't Wait for User)**:

1. **Acceptance Criteria** - Check off as you complete each item
2. **Files Changed** - Add ✅ emoji when file is modified
3. **Implementation Notes** - Add key decisions, edge cases, fixes
4. **Estimate → Actual** - Update when done (e.g., "2-4h (actual: ~2h)")
5. **Commits List** - Add hash + description after each commit

### 📝 **User Will Check Off (Never Touch These)**:

1. **Test Plan** - User manually tests and checks off
   - Provide clear steps with working links
   - Format: `- [ ] Action → [Link](http://127.0.0.1:5173/page) if applicable`
   - User checks after testing

### 🔄 **When to Update**:

- **During work**: Check off criteria as you complete them
- **After commits**: Add commit hashes to ticket
- **Before "In Review"**: Ensure all AI-owned items are checked/updated
- **Never**: Check off user's test plan items

### 📋 **Ticket Template Format**:

```markdown
**Goal**: One sentence what this delivers

**Acceptance Criteria** (AI checks these off when complete):

- [ ] Specific requirement
- [ ] Another requirement

**Files Changed** (AI updates with ✅ when done):

- path/to/file.ts - What changes

**Test Plan** (User checks these off when tested):

- [ ] Step 1 → [Link to page](http://127.0.0.1:5173/page)
- [ ] Step 2 - What to verify
- [ ] Check [doc](http://127.0.0.1:5173/dev-docs/path)

**Implementation Notes** (AI adds as work progresses):

- Key decisions
- Edge cases handled

**Estimate**: Xh (actual: Yh - AI updates)
**Linear ID**: SYOS-123
**Commits**:

- abc1234 - Description
```

**See**: `/start-new-project` for full examples and workflow

---

## 🎯 Remember

1. **Communication** - Short, dense, concise
2. **No auto-docs** - Never create docs unless asked
3. **Product Principles** - Read first, outcomes over outputs
4. **Business Language** - Avoid jargon in project names
5. **Investigate first** - Understand before acting
6. **Confirm before building** - Scope, plan, get approval
7. **Context7 first** - For library docs before web search
8. **Domain**: Production domain is `www.synergyos.ai` (not synergyos.dev or synergyos.ai)

---

## 📖 Essential Reading (In Order)

**Before starting ANY work:**

1. **`dev-docs/2-areas/product-principles.md`** ⭐ - How we make decisions (Outcomes Over Outputs, Privacy First, etc.)
2. **`.cursor/rules/way-of-working.mdc`** - Project overview, tech stack, conventions
3. **`dev-docs/2-areas/patterns/INDEX.md`** - Existing solutions, don't reinvent

**Key principles:**

- **Outcomes Over Outputs** - Define business outcome before building
- **Business-Friendly Naming** - Use common language, not jargon
- **Team Ownership** - Know who owns the work
- **AI Transparency** - Mark guesses as: `{Your guess} (by AI → not validated yet)`

**For Linear ticket management:**

- Read `dev-docs/2-areas/linear-integration.md` - Cursor + Linear + GitHub workflow
- Read `dev-docs/2-areas/flow-metrics.md` - Flow Distribution tracking
- Use `/start-new-project` for new initiatives
