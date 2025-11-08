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
5. Commit (local only, don't push)

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

## 🎯 Remember

1. **Communication** - Short, dense, concise
2. **No auto-docs** - Never create docs unless asked
3. **Investigate first** - Understand before acting
4. **Confirm before building** - Scope, plan, get approval
5. **Context7 first** - For library docs before web search

---

## 📖 Project-Specific Details

**Read `.cursor/rules/way-of-working.mdc` for:**
- Project overview and tech stack
- Documentation paths
- Patterns and conventions
- File structure
