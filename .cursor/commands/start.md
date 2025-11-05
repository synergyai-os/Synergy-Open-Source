# start

**Purpose**: Universal onboarding for any LLM/agent coding session. Read first.

---

## ⚠️ CRITICAL: Communication Style

**User prefers concise, dense communication:**
- Keep answers SHORT - even if it means less detail
- Minimum fluff - be direct
- Dense information - pack maximum value into minimum words
- If user needs more - they will ask you to expand

**⚠️ NEVER CREATE DOCUMENTATION UNLESS EXPLICITLY ASKED:**
- DO NOT create documentation files automatically
- DO NOT create multiple docs for the same topic
- YOU CAN ask or suggest creating docs if helpful
- YOU CAN update existing docs if explicitly part of workflow

**When in doubt**: Ask first, don't create.

---

## 🔍 Workflow: Investigate → Scope → Plan → Confirm

**Before building anything:**

1. **Investigate** - Understand current state, existing patterns, similar solutions
2. **Scope** - Define what's in/out of scope
3. **Plan** - Outline approach, steps, potential issues
4. **Confirm** - Get user approval before executing

**Never start coding without user confirmation of the plan.**

---

## 📚 Library Documentation

**Use Context7 MCP before web search:**
1. Call `mcp_context7_resolve-library-id` to find library
2. Call `mcp_context7_get-library-docs` with resolved ID and topic
3. Only fall back to web search if Context7 fails

**Why**: Context7 provides up-to-date, accurate docs with code examples from official sources.

---

## 🔧 Critical Workflows

### `/save` Command - Capture Knowledge
**When**: End of work session, before committing
1. Analyze what changed
2. Update project's patterns file FIRST (e.g., `dev-docs/patterns-and-lessons.md`)
3. Add/update patterns, update indexes
4. Commit (local only, don't push)

### `/root-cause` Command - Find Solutions
**When**: Investigating bugs/issues
1. Check Quick Diagnostic in project's patterns file
2. Search by symptom → find pattern
3. Read: Problem → Root Cause → Solution
4. Only implement if 95%+ confident
5. If uncertain: Research, document, report confidence

---

## ✅ General Principles

**Before Writing Code:**
- Check existing patterns/solutions in project
- Use Context7 for library documentation
- Investigate scope, define plan, get confirmation

**When Debugging:**
- Use `/root-cause` command
- Search existing solutions first
- Use Context7 to verify with latest docs
- Only fix if 95%+ confident - otherwise research and report

**When Uncertain:**
- Research and report confidence level
- Ask user before implementing
- Don't guess - validate first

---

## 🎯 Remember

1. **Communication** - Short, dense, concise. User asks for more if needed.
2. **No auto-docs** - Never create docs unless explicitly asked.
3. **Investigate first** - Understand before acting.
4. **Confirm before building** - Scope, plan, get approval.
5. **Context7 first** - Use for library docs before web search.

---

## 📖 Project-Specific Details

**Read `.cursor/rules/way-of-working.mdc` for:**
- Project overview and tech stack
- Project-specific documentation paths
- Project-specific patterns and conventions
- Project file structure
