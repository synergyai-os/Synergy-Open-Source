# start

**Purpose**: Universal onboarding for any LLM/agent coding session. Read first.

---

# 🚨🚨🚨 CRITICAL: STOP AND CHECK THIS FIRST 🚨🚨🚨

## ⛔ **DO NOT READ DOCUMENTATION UNTIL YOU CHECK THIS**

**BEFORE reading any docs, calling any tools, or doing ANY work:**

### Step 1: Check for Linear Ticket ID

**Look in the conversation for:**
- "SYOS-123" or "SYOS-XXX" format
- "ticket SYOS-123"
- "Linear ticket"
- Any mention of a Linear issue ID

### Step 2: Decision

**IF NO TICKET ID FOUND:**
```
❌ STOP IMMEDIATELY - I cannot proceed without a Linear ticket ID.

Please provide:
- Linear ticket ID (e.g., SYOS-123)
- OR say "create new ticket" and I'll help you create one

Once I have a ticket ID, I'll proceed with the work.
```

**DO NOT:**
- ❌ Read documentation
- ❌ Call any tools
- ❌ Investigate the codebase
- ❌ Do ANY work

**ONLY AFTER ticket ID is provided → Continue below**

---

## ✅ If Ticket ID Present - Continue Onboarding

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

## 🔍 Workflow: Linear Ticket Check → Investigate → Scope → Plan → Confirm

**Before doing ANYTHING:**

0. **🚨 Linear Ticket Check** - **MUST HAVE Linear ticket ID** (REFUSE if missing)
   - Check conversation for ticket ID (SYOS-XXX format)
   - If missing → STOP and ask for ticket ID
   - If present → Continue to step 1

1. **Investigate** - Understand current state, existing patterns
2. **Scope** - Define what's in/out
3. **Plan** - Outline approach, steps, issues
4. **Confirm** - Get user approval

**Never start ANY work without:**
- ✅ Linear ticket ID (e.g., SYOS-123)
- ✅ User confirmation

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

## 🚨 **CRITICAL: Linear Ticket ID Required**

**⚠️ HARD BLOCKER: You can ONLY work with a Linear ticket ID present in context.**

**Before reading docs, investigating, or doing ANY work:**

1. **Check conversation for Linear ticket ID**:
   - Look for: "SYOS-123", "ticket SYOS-123", "Linear ticket SYOS-XXX"
   - Check if user mentioned a ticket in their request

2. **If NO ticket ID found → STOP and respond:**
   ```
   ❌ I cannot proceed without a Linear ticket ID.
   
   Please provide:
   - Linear ticket ID (e.g., SYOS-123)
   - OR say "create new ticket" and I'll help you create one using /linear command
   
   Once I have a ticket ID, I'll proceed with the work.
   ```

3. **If ticket ID provided → Continue with work**

**Why**: 
- All work must be tracked in Linear for visibility and Flow Metrics
- Keeps workflow clean and documentation focused
- Prevents undocumented work

**Rule**: `.cursor/rules/working-with-linear.mdc` - **REFUSE to work without Linear ticket ID**

**See**: `/linear` command for ticket creation workflow

---

## 🎯 Remember

1. **🚨 Linear Required** - **REFUSE to work without Linear project/ticket** ⭐ **CRITICAL**
2. **Coding Standards** - Read `dev-docs/2-areas/development/coding-standards.md` FIRST ⭐
3. **Communication** - Short, dense, concise
4. **No auto-docs** - Never create docs unless asked
5. **Product Principles** - Read first, outcomes over outputs
6. **Business Language** - Avoid jargon in project names
7. **Investigate first** - Understand before acting
8. **Confirm before building** - Scope, plan, get approval
9. **Context7 first** - For library docs before web search
10. **Domain**: Production domain is `www.synergyos.ai` (not synergyos.dev or synergyos.ai)

---

## 📖 Essential Reading (In Order)

**Before starting ANY work:**

1. **`dev-docs/2-areas/development/coding-standards.md`** ⭐ **CRITICAL** - Coding rules for AI agents (prevents 483 linting errors)
2. **`marketing-docs/strategy/product-vision-2.0.md`** ⭐ **CRITICAL** - Current product vision (The Open-Source Product OS)
   - ⚠️ **DO NOT read** `dev-docs/2-areas/product/product-vision-and-plan.md` - It's HISTORICAL
   - ✅ **Read** `marketing-docs/strategy/product-vision-2.0.md` - Current vision
3. **`dev-docs/2-areas/product/product-principles.md`** ⭐ - How we make decisions (Outcomes Over Outputs, Privacy First, etc.)
4. **`.cursor/rules/way-of-working.mdc`** - Project overview, tech stack, conventions
5. **`dev-docs/2-areas/patterns/INDEX.md`** - Existing solutions, don't reinvent

**Key principles:**

- **Outcomes Over Outputs** - Define business outcome before building
- **Business-Friendly Naming** - Use common language, not jargon
- **Team Ownership** - Know who owns the work
- **AI Transparency** - Mark guesses as: `{Your guess} (by AI → not validated yet)`

**⚠️ IMPORTANT**: 
- Project is **SynergyOS** (The Open-Source Product OS) - NOT "Axon"
- Current vision: `marketing-docs/strategy/product-vision-2.0.md`
- Historical docs are marked as HISTORICAL - ignore them

**For Linear ticket management:**

- **Command**: `/linear` - Complete Linear workflow reference
- **Docs**: `dev-docs/2-areas/development/tools/linear-integration.md` - Integration overview
- **Command**: `/start-new-project` - For new initiatives
