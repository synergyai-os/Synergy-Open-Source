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

**If user says "create new ticket" or "we have no ticket yet":**

1. **ASK user for project** (REQUIRED unless user says "no project"):

   ```
   Which project should this ticket belong to?
   (Say "no project" to skip, or provide project name)
   ```

   - If user says "no project" → Continue without project
   - If user provides project name → Get/create project → Use `projectId`
   - If user doesn't respond → STOP (project ID is required)

2. **Create ticket** with required fields:

   **Linear Constants** (always available):

   ```typescript
   const LINEAR_TEAM_ID = '08d684b7-986f-4781-8bc5-e4d9aead6935'; // SYOS
   const LINEAR_TEAM_NAME = 'SYOS';
   const RANDY_USER_ID = 'c7c555a2-895a-48b6-ae24-d4147d44b1d5'; // Randy Hereman

   const LINEAR_LABELS = {
   	// Type (REQUIRED - pick one)
   	feature: 'ba9cfc2b-a993-4265-80dc-07fd1c831029',
   	bug: '62008be5-0ff6-4aae-ba9b-c2887257acf8',
   	'tech-debt': '7cec9e22-31d4-4166-ba92-61d8f8c18809',
   	risk: '99472a27-79b0-475b-bd4a-d4d66e3f2b81',

   	// Scope (REQUIRED - pick one or more)
   	backend: '7299ef53-982d-429d-b513-ccf190b28c16',
   	frontend: '70068764-575a-48a6-b4d1-3735a044230e',
   	ui: 'ace175ff-3cce-4416-bacc-529ee85e72a9',
   	auth: '1ce394e6-d0ac-41c0-a3b2-f8dd062f7725',
   	workspace: 'ede0cdda-d56f-4f0d-a6b9-5522df50839f',
   	analytics: '1e82f018-fec6-4d0f-9369-ab1e98cdd613',
   	devops: 'df3e1654-2066-423b-905a-41dfc69f2cd5',
   	security: '9a561550-aff8-4cd3-a1f5-3cd5b9008b97'
   };

   const ESTIMATES = {
   	none: 0, // No estimate
   	xs: 1, // < 2h
   	s: 2, // 2-4h (default)
   	m: 3, // 4-8h (half day)
   	l: 4, // 1-2 days
   	xl: 5 // 2+ days (break down!)
   };
   ```

   **Create ticket:**

   ```typescript
   await mcp_Linear_create_issue({
   	team: LINEAR_TEAM_NAME, // 'SYOS'
   	title: '[Descriptive Title]',
   	description: '...', // See ticket-writing-format.md for structure
   	projectId: projectId, // ✅ From step 1 (or null if "no project")
   	assigneeId: RANDY_USER_ID, // ✅ ALWAYS Randy
   	state: 'Todo',
   	estimate: ESTIMATES.s, // ✅ Default to "s" (2) - numeric
   	labels: [
   		LINEAR_LABELS.bug, // ✅ Type (required, one)
   		LINEAR_LABELS.backend // ✅ Scope (required, one or more)
   	]
   });
   ```

   **Ticket Writing Format**: See `dev-docs/2-areas/development/ticket-writing-format.md` for complete structure

3. **Continue with onboarding** using the new ticket ID

**If user doesn't say "create new ticket":**

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

**Update ticket status to "In Progress" (only if still in pre-start state):**

```typescript
// Get current ticket to check state
const ticket = await mcp_Linear_get_issue({ id: 'SYOS-XXX' }); // Use the ticket ID from conversation

// Only update to "In Progress" if ticket is still in a pre-start state
// Pre-start states: Todo, Backlog (or similar initial states)
// Skip update if: Done/Cancelled (terminal) or In Review/In Progress (already progressed)
const preStartStates = ['Todo', 'Backlog']; // Add other initial states as needed
const currentState = ticket.state?.name || ticket.state;

if (preStartStates.includes(currentState)) {
	// Only update if still in pre-start state (avoids regressing Done/Cancelled/In Review tickets)
	await mcp_Linear_update_issue({
		id: 'SYOS-XXX',
		state: 'In Progress'
	});
}
// If ticket is already Done/Cancelled/In Review/In Progress, skip status update and continue onboarding
```

**Then continue with onboarding below...**

---

## 📚 Reference Code Check (After Ticket Status Update)

**Purpose**: Check for relevant reference code projects that AI can use when implementing features.

**When**: After updating ticket status to "In Progress", before investigation.

**Workflow**:

1. **List reference projects**:

   ```typescript
   // List directories in ai-docs/reference/
   const referenceProjects = list_dir('ai-docs/reference');
   // Filter out README.md, get project folders
   ```

2. **Match ticket to reference projects**:
   - Read ticket title and description
   - Check each project's README.md for keywords/topics
   - Match ticket keywords to project descriptions
   - Example: Ticket about "chat" → Check for `vercel-ai-sdk-chat/` project

3. **If match found**:
   - Load reference project README.md
   - Document in investigation findings: "Found reference project: [project-name] - [what it demonstrates]"
   - Note: Reference code will be used during `/go` implementation

4. **If no match**:
   - Continue normally (no reference code available)
   - Document: "No relevant reference projects found"

**Reference Code System**: See `ai-docs/reference/README.md` for structure and usage

**Integration**: Reference code loaded here will be available during `/go` implementation phase

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

## 🔍 Workflow: Linear Ticket Check → Investigate → Scope → Plan → Validate Architecture → Confirm

**Before doing ANYTHING:**

0. **🚨 Linear Ticket Check** - **MUST HAVE Linear ticket ID** (REFUSE if missing)
   - Check conversation for ticket ID (SYOS-XXX format)
   - If missing → STOP and ask for ticket ID
   - If present → Continue to step 1

1. **Investigate** - Understand current state, existing patterns
2. **Scope** - Define what's in/out
3. **Plan** - Outline approach, steps, issues
4. **🔧 Validate Architecture** - Check modularity principles (see below) ⭐ **MANDATORY**
5. **Confirm** - Get user approval

**Never start ANY work without:**

- ✅ Linear ticket ID (e.g., SYOS-123)
- ✅ Architecture validation passed
- ✅ User confirmation

---

## 🔧 Modularity Validation (MANDATORY Before Implementation)

**⚠️ CRITICAL**: All new features/modules MUST follow modularity principles from `system-architecture.md`.

**Reference**: [System Architecture - Modularity Section](dev-docs/2-areas/architecture/system-architecture.md#6-modularity--module-system) ⭐

### Quick Validation Checklist

**Before writing ANY code, validate:**

- [ ] **Is this a new module?** → Create feature flag in `src/lib/featureFlags.ts` and `convex/featureFlags.ts`
- [ ] **Can this be enabled per org?** → Use `allowedOrganizationIds` targeting (organization-based feature flags)
- [ ] **Does this follow loose coupling?** → No direct imports from other modules' internals (use shared utilities or APIs)
- [ ] **Does this have clear contracts?** → Documented API/interface for module communication (if cross-module)
- [ ] **Can this be deployed independently?** → Verify module boundaries (future goal, but design for it now)

### Modularity Principles (from system-architecture.md)

**Current State** (Verified):

- ✅ **Independent Development** - Teams work without conflicts
- ✅ **Independent Enablement** - Feature flags per org/tenant (`allowedOrganizationIds`)
- 🟡 **Independent Deployment** - Planned after refactoring (design for it now)
- 🟡 **Clear Contracts** - APIs for module communication (in progress - document interfaces)
- 🟡 **Loose Coupling** - No direct internal dependencies (needs enforcement - validate imports)

**Module Enablement Pattern** (Required for new modules):

```typescript
// Frontend: src/lib/featureFlags.ts
export const NEW_MODULE_FLAG = 'new-module-flag';

// Backend: convex/featureFlags.ts
await upsertFlag({
	flag: 'new-module-flag',
	enabled: true,
	allowedOrganizationIds: ['org-id-1'] // Per-org targeting
});

// Usage: Check flag before rendering/enabling module
const isEnabled = useFeatureFlag(NEW_MODULE_FLAG, organizationId);
```

**Common Violations to Avoid:**

- ❌ **Tight Coupling**: Direct imports from `src/lib/components/[other-module]/` internals
- ❌ **Missing Feature Flags**: New module without feature flag (can't enable/disable per org)
- ❌ **Hardcoded Dependencies**: Module assumes another module is always enabled
- ❌ **No Contracts**: Cross-module communication without documented API

**If violations detected**: STOP and discuss with user before implementing.

**See**: [System Architecture](dev-docs/2-areas/architecture/system-architecture.md#6-modularity--module-system) for complete module system details

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

**Linear Constants & Workflow**: All constants and workflows are in this `/start` command (see above)

---

## 🎯 Remember

1. **🚨 Linear Required** - **REFUSE to work without Linear project/ticket** ⭐ **CRITICAL**
2. **Coding Standards** - Read `dev-docs/2-areas/development/coding-standards.md` FIRST ⭐
3. **🔧 Modularity Validation** - Validate architecture before coding ⭐ **MANDATORY**
4. **Design System** - Use design tokens, atomic components, follow governance docs ⭐
5. **Communication** - Short, dense, concise
6. **No auto-docs** - Never create docs unless asked
7. **Product Principles** - Read first, outcomes over outputs
8. **Business Language** - Avoid jargon in project names
9. **Investigate first** - Understand before acting
10. **Confirm before building** - Scope, plan, validate architecture, get approval
11. **Context7 first** - For library docs before web search
12. **Domain**: Production domain is `www.synergyos.ai` (not synergyos.dev or synergyos.ai)

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

**Design System Governance** (when working with UI/components):

- **`dev-docs/2-areas/design/quick-start.md`** ⭐ - 5-minute setup guide for new developers
- **`dev-docs/2-areas/design/component-architecture.md`** - Component structure and anti-patterns
- **`dev-docs/2-areas/design/design-tokens.md`** - Complete token reference
- **`dev-docs/2-areas/design/migration-guide.md`** - Step-by-step migration instructions
- **`dev-docs/2-areas/design/deprecation-policy.md`** - Token/component deprecation process

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

- **Constants & Workflow**: All in this `/start` command (see ticket creation section above)
- **Ticket Writing Format**: `dev-docs/2-areas/development/ticket-writing-format.md` - Complete template
- **Creating Subtickets**: See "Creating Subtickets" section below
- **Command**: `/start-new-project` - For new initiatives

---

## 📋 Creating Subtickets (Child Issues)

**When to use**: Break down large tickets into focused, actionable subtickets.

### Workflow

1. **Get parent ticket** - `mcp_Linear_get_issue({ id: 'SYOS-84' })`
2. **Create subticket** - One ticket per issue/fix
3. **Link with `parentId`** - Use parent ticket's ID

### Example

```typescript
// Get parent ticket
const parent = await mcp_Linear_get_issue({ id: 'SYOS-84' });

// Create subticket
await mcp_Linear_create_issue({
	team: LINEAR_TEAM_NAME,
	title: 'Fix: [Specific Issue]',
	description: `# Issue Description

**Parent:** [SYOS-84](https://linear.app/younghumanclub/issue/SYOS-84)

[Issue details...]`,
	projectId: parent.projectId, // ✅ Use same project as parent
	parentId: parent.id, // ✅ Link to parent
	assigneeId: RANDY_USER_ID, // ✅ Always assign to Randy
	state: 'Todo',
	estimate: ESTIMATES.s, // ✅ Numeric estimate (typically 1-3 for subtasks)
	labels: [
		LINEAR_LABELS.bug, // ✅ Type
		LINEAR_LABELS.auth, // ✅ Scope
		LINEAR_LABELS.backend
	]
});
```

### Best Practices

- ✅ **One issue per subticket** - Each subticket should be independently fixable
- ✅ **Use parent's project** - Subtickets inherit parent's project
- ✅ **Clear titles** - Start with "Fix:" or "Add:" for clarity
- ✅ **Link to parent** - Include parent ticket link in description
- ✅ **Appropriate estimates** - Smaller than parent (typically 1-3)
