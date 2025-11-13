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

1. **Read `dev-docs/2-areas/development/coding-standards.md`** ⭐ **CRITICAL** - Prevents linting errors
2. Check `dev-docs/2-areas/patterns/INDEX.md` for existing solutions
3. Use Context7 for library documentation
4. Investigate, scope, plan, get confirmation

**Coding Standards (MANDATORY for AI Agents):**
- ❌ NEVER use `any` type (use proper types or `unknown` + type guards)
- ❌ NEVER use `{#each}` without keys `(item._id)`
- ❌ NEVER use `goto()` without `resolveRoute()`
- ❌ NEVER use `Map`/`Set` (use `SvelteMap`/`SvelteSet` or plain objects)
- ❌ NEVER leave unused imports/variables
- ✅ ALWAYS use TypeScript types
- ✅ ALWAYS use design tokens
- ✅ ALWAYS use `.svelte.ts` for composables
- ✅ ALWAYS use `useQuery()` for Convex data

**See**: `dev-docs/2-areas/development/coding-standards.md` for complete rules

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

## 📋 **Linear Ticket Management**

**For Linear workflow, ticket creation, and management:**
- **Command**: `/linear` - Complete Linear reference (constants, ticket writing, workflows)
- **Rule**: `.cursor/rules/working-with-linear.mdc` - Critical rules (Project ID required, Assign user)

**See**: `/linear` command for complete Linear workflow

---

## 🎯 Remember

1. **Coding Standards** - Read `dev-docs/2-areas/development/coding-standards.md` FIRST ⭐
2. **Communication** - Short, dense, concise
3. **No auto-docs** - Never create docs unless asked
4. **Product Principles** - Read first, outcomes over outputs
5. **Business Language** - Avoid jargon in project names
6. **Investigate first** - Understand before acting
7. **Confirm before building** - Scope, plan, get approval
8. **Context7 first** - For library docs before web search
9. **Domain**: Production domain is `www.synergyos.ai` (not synergyos.dev or synergyos.ai)

---

## 📖 Essential Reading (In Order)

**Before starting ANY work:**

1. **`dev-docs/2-areas/development/coding-standards.md`** ⭐ **CRITICAL** - Coding rules for AI agents (prevents 483 linting errors)
2. **`dev-docs/2-areas/product-principles.md`** ⭐ - How we make decisions (Outcomes Over Outputs, Privacy First, etc.)
3. **`.cursor/rules/way-of-working.mdc`** - Project overview, tech stack, conventions
4. **`dev-docs/2-areas/patterns/INDEX.md`** - Existing solutions, don't reinvent

**Key principles:**

- **Outcomes Over Outputs** - Define business outcome before building
- **Business-Friendly Naming** - Use common language, not jargon
- **Team Ownership** - Know who owns the work
- **AI Transparency** - Mark guesses as: `{Your guess} (by AI → not validated yet)`

**For Linear ticket management:**

- **Command**: `/linear` - Complete Linear workflow reference
- **Docs**: `dev-docs/2-areas/development/tools/linear-integration.md` - Integration overview
- **Command**: `/start-new-project` - For new initiatives
