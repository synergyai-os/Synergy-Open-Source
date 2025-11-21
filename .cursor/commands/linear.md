# linear

**Purpose**: Complete reference for working with Linear tickets, projects, and workflow. Use this when creating or managing Linear tickets.

---

## 📋 Hardcoded Constants

### Team & User IDs

```typescript
const LINEAR_TEAM_ID = '08d684b7-986f-4781-8bc5-e4d9aead6935'; // SYOS
const LINEAR_TEAM_NAME = 'SYOS';
const RANDY_USER_ID = 'c7c555a2-895a-48b6-ae24-d4147d44b1d5'; // Randy Hereman
```

### Flow Distribution Labels

```typescript
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
	s: 2, // 2-4h
	m: 3, // 4-8h (half day)
	l: 4, // 1-2 days
	xl: 5 // 2+ days (break down!)
};
```

---

## 🏷️ Label Selection Guide

### Type Labels (REQUIRED - Pick ONE)

**When to use each type:**

- **`feature`**: New user-facing functionality or capabilities
  - Examples: "Add organization switching", "Create team management UI", "Add dark mode toggle"
  - ❌ NOT for: Refactoring, testing, code quality improvements

- **`tech-debt`**: Code quality, refactoring, testing, maintainability
  - Examples: "Refactor useOrganizations composable", "Add tests for X", "Fix ESLint errors", "Extract utilities"
  - ✅ Use for: Refactoring existing code, writing tests, code cleanup, improving maintainability

- **`bug`**: Something is broken or not working as expected
  - Examples: "Organization switcher doesn't update URL", "Tests failing", "TypeScript errors blocking CI"

- **`risk`**: Security, performance, or stability concerns
  - Examples: "Fix XSS vulnerability", "Optimize slow query", "Prevent memory leak"

**Decision Tree:**

```
Is it new user-facing functionality?
  YES → `feature`
  NO → Is something broken?
    YES → `bug`
    NO → Is it security/performance risk?
      YES → `risk`
      NO → `tech-debt` (refactoring, testing, code quality)
```

**Common Mistakes:**

- ❌ Refactoring labeled as `feature` → ✅ Should be `tech-debt`
- ❌ Writing tests labeled as `feature` → ✅ Should be `tech-debt`
- ❌ Code cleanup labeled as `feature` → ✅ Should be `tech-debt`
- ❌ Extracting utilities labeled as `feature` → ✅ Should be `tech-debt`

**Validation Question**: "Is this adding new functionality users will see/use, or improving existing code?"

- New functionality → `feature`
- Improving existing code → `tech-debt`

---

## 🎯 Ticket Creation

### Required Fields

```typescript
await mcp_Linear_create_issue({
	team: 'SYOS',
	title: '[Slice N] Descriptive Title',
	description: '...', // See ticket writing format below
	project: projectId, // ✅ Required (get/create first)
	assignee: RANDY_USER_ID, // ✅ Required
	state: 'Todo',
	estimate: ESTIMATES.s, // ✅ Required (numeric: 0-5)
	labels: [
		LINEAR_LABELS.feature, // ✅ Type (required, one)
		LINEAR_LABELS.backend, // ✅ Scope (required, one or more)
		LINEAR_LABELS.workspace
	]
});
```

---

## 📝 Ticket Writing Format (Marty Cagan + Shape Up)

### Required Structure

```markdown
## Context

[1-2 sentences: Why this work matters]

**Why this matters**: [User outcome or business value]

---

## Problem

[Root causes - what's broken or missing]

---

## Goals

**Outcome**: [What success looks like - business outcome, not output]  
**User Impact**: [How users benefit]  
**Success Metrics**:

- [Measurable criteria 1]
- [Measurable criteria 2]

---

## Technical Scope

**What to build:**

- [Specific module 1] - [What it does]
- [Specific module 2] - [What it does]

**Files to modify:**

- `path/to/file1.ts` - [What changes]
- `path/to/file2.ts` - [What changes]

---

## Subtasks (Priority Order)

**🔴 URGENT (Ship First)**

- TICKET-1: [Title] (URGENT) - [Why urgent]

**🟠 HIGH (Ship Week 1)**

- TICKET-2: [Title] (HIGH) - [Impact]

**🟡 MEDIUM (Ship Week 2)**

- TICKET-3: [Title] (MEDIUM) - [Nice to have]

---

## Non-Goals

- ❌ TypeScript strict mode (separate track)
- ❌ Performance optimization (separate concern)

---

## Dependencies

**Requires**: [What must be done first - specific ticket IDs]  
**Blocks**: [What waits for this]  
**Parallel**: [CLEARLY STATE if agents can work in parallel]

---

## Success Criteria

- [Testable criterion 1] ✅
- [Testable criterion 2] ✅
```

### ⚠️ Parallel Work Warning

**State clearly at top of ticket if agents CAN work in parallel:**

```markdown
## ⚠️ PARALLEL WORK WARNING

**This ticket CAN be worked on by multiple agents simultaneously:**

- Agent 1: Backend (convex/ functions)
- Agent 2: Frontend (src/lib/components/)
- Agent 3: Tests (tests/ directory)

**Boundaries:**

- No shared files
- Clear technical separation
- Independent shipping

**OR**

**This ticket CANNOT be worked on in parallel:**

- Sequential dependencies (Slice 1 → Slice 2 → Slice 3)
- Shared files that would cause conflicts
```

---

## 🔗 Project Management

### Get/Create Project

```typescript
// 1. Check if project exists
const projects = await mcp_Linear_list_projects({ team: 'SYOS' });
let project = projects.find((p) => p.name === 'Project Name');

// 2. Create if missing
if (!project) {
	project = await mcp_Linear_create_project({
		team: 'SYOS',
		name: 'Project Name',
		summary: 'One-line summary',
		description: '# Project Overview\n...',
		state: 'planned'
	});
}

const projectId = project.id; // ✅ Use ID, not name
```

---

## 💬 Comments

### When to Comment

1. **Progress Updates** - After completing subtasks
2. **Completion Notes** - When marking "In Review"
3. **Blockers** - When work is blocked
4. **Decisions** - Key architectural decisions

### Comment Format

```typescript
await mcp_Linear_create_comment({
	issueId: 'SYOS-60',
	body: `## ✅ URGENT Subtasks Shipped (3/3)

**Commits:**
- \`fe01139\` - feat(ci): Enable CI/CD quality gates

**What shipped:**
1. ✅ **SYOS-65** - Lint + Build gates enabled
2. ✅ **SYOS-64** - Secret scanning added

**Next:**
- HIGH priority subtasks (SYOS-72, 66, 67, 68)`
});
```

---

## 📋 Subtasks

### When to Use

**Use subtasks when:**

- Breaking down parent ticket (epic → slices)
- Parallel work tracks (multiple agents)
- Clear dependencies (Slice 1 → Slice 2)
- Priority tiers (URGENT vs HIGH)

**Don't use when:**

- Single focused ticket (< 4h)
- No clear boundaries
- Better as separate tickets

### Subtask Structure

**In parent ticket description:**

```markdown
## Subtasks (Priority Order)

**🔴 URGENT (Ship First)**

- **SYOS-65**: Enable CI/CD quality gates

**🟠 HIGH (Ship Next)**

- **SYOS-72**: Fix TypeScript errors
```

**Create subtask ticket:**

```typescript
await mcp_Linear_create_issue({
	team: 'SYOS',
	title: '[SYOS-60] Enable CI/CD quality gates',
	description: `
**Parent**: SYOS-60 - CI/CD Pipeline & Security Gates

**Goal**: Enable lint and build gates

**Acceptance Criteria:**
- [ ] Lint gate enabled
- [ ] Build gate enabled
  `,
	project: projectId,
	assignee: RANDY_USER_ID,
	state: 'Todo',
	estimate: ESTIMATES.s,
	labels: [LINEAR_LABELS['tech-debt'], LINEAR_LABELS.devops]
});
```

---

## 🔄 Complete Workflow Example

```typescript
// 1. Validate project exists
const projects = await mcp_Linear_list_projects({ team: 'SYOS' });
let project = projects.find((p) => p.name === 'Auth and System Foundation');

if (!project) {
	project = await mcp_Linear_create_project({
		team: 'SYOS',
		name: 'Auth and System Foundation',
		summary: 'Multi-workspace authentication',
		description: '# Project Overview\n...',
		state: 'planned'
	});
}

const projectId = project.id;

// 2. Create ticket
const ticket = await mcp_Linear_create_issue({
	team: 'SYOS',
	title: '[Slice 1] Workspace Context & Indicator',
	description: '...', // Use ticket writing format above
	project: projectId,
	assignee: RANDY_USER_ID,
	state: 'Todo',
	estimate: ESTIMATES.s,
	labels: [LINEAR_LABELS.feature, LINEAR_LABELS.backend, LINEAR_LABELS.workspace]
});

// 2a. Verify project linking (CRITICAL - tickets may not link during creation)
const createdTicket = await mcp_Linear_get_issue({ id: ticket.id });
if (!createdTicket.projectId || createdTicket.projectId !== projectId) {
	await mcp_Linear_update_issue({
		id: ticket.id,
		project: projectId // Explicitly link to project
	});
}

// 3. Update status when starting
await mcp_Linear_update_issue({
	id: ticket.id,
	state: 'In Progress'
});

// 4. Add comment when complete
await mcp_Linear_create_comment({
	issueId: ticket.id,
	body: '✅ Complete - Workspace context stored | Commit: abc1234'
});

// 5. Mark for review
await mcp_Linear_update_issue({
	id: ticket.id,
	state: 'In Review'
});
```

---

## ✅ Pre-Work Checklist

**Before creating tickets:**

- [ ] Project ID exists (check with `list_projects`, create if missing)
- [ ] User assigned (`assignee: RANDY_USER_ID`)
- [ ] Estimate set (numeric: 0-5)
- [ ] Labels correct (Type: one + Scope: one or more)
- [ ] Ticket structure (Context, Problem, Goals, Technical Scope)
- [ ] Parallel work clearly stated (if applicable)
- [ ] Dependencies filled (Requires/Blocks/Parallel)

**After creating tickets:**

- [ ] **Verify project linking** - Check ticket has `projectId` field set
- [ ] **Update if needed** - Use `mcp_Linear_update_issue()` with `project` if not linked
- [ ] Ticket appears in project view

---

## 📚 References

- **Linear Integration**: `dev-docs/2-areas/development/tools/linear-integration.md`
- **Ticket Writing**: `dev-docs/2-areas/patterns/ticket-writing.md`
- **Flow Metrics**: `dev-docs/2-areas/flow-metrics.md`
- **GitHub Integration**: `dev-docs/3-resources/guides/linear-github-integration.md`

---

## ⚠️ Critical: Project Linking Verification

**IMPORTANT**: Even when `project` is provided in `create_issue()`, tickets may not be linked to the project.

**Always verify and update:**

```typescript
// After creating ticket
const createdTicket = await mcp_Linear_get_issue({ id: ticket.id });

// Verify project linking
if (!createdTicket.projectId || createdTicket.projectId !== projectId) {
	// Explicitly link to project
	await mcp_Linear_update_issue({
		id: ticket.id,
		project: projectId
	});
}
```

**Why this matters**: Tickets without project links won't appear in project views, making them hard to track and manage.

---

**Last Updated**: 2025-11-21  
**Purpose**: Complete Linear workflow reference for AI agents  
**Latest Change**: Added project linking verification workflow (critical lesson learned)
