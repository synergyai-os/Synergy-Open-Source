# Linear Integration

**Purpose**: How Linear, Cursor AI, and GitHub work together for seamless development workflow.

---

## 🔗 Integration Overview

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Linear  │ ◄─────► │  Cursor  │ ◄─────► │  GitHub  │
│          │         │    AI    │         │          │
│ Tickets  │         │  Coding  │         │  PRs     │
│ Projects │         │  MCP     │         │  Commits │
└──────────┘         └──────────┘         └──────────┘
     │                     │                     │
     └─────────────────────┴─────────────────────┘
              Single Source of Truth
```

**Flow**:

1. **Plan** in Linear (create tickets, projects)
2. **Code** in Cursor AI (MCP updates Linear automatically)
3. **Review** in GitHub (PR references Linear tickets)
4. **Ship** → Linear updates show completion

---

## 🎯 Linear: Project & Issue Management

### **What Linear Does**

- **Project tracking**: Epics, milestones, roadmap
- **Issue management**: Tickets, statuses, assignments
- **Team coordination**: Cycles, workflows, priorities
- **Analytics**: Flow metrics, insights, velocity

### **Linear Structure**

```
Workspace: Young Human Club
└─ Team: SYOS
   ├─ Project: Auth and System Foundation
   │  ├─ SYOS-1: [Slice 1] Workspace Context
   │  ├─ SYOS-2: [Slice 2] Create Organization
   │  └─ SYOS-3: [Slice 3] Workspace Switching
   │
   ├─ Labels: feature, bug, tech-debt, risk, s, m, l
   └─ Cycles: Nov 1-14, Nov 15-28, etc.
```

### **Linear Best Practices**

1. **One project per major initiative** (3+ weeks of work)
2. **Break into slices** (Shape Up methodology)
3. **Label every ticket** (type + scope + size)
4. **Use cycles** for velocity tracking
5. **Update status** as work progresses

---

## 🤖 Cursor AI: Development Environment

### **What Cursor Does**

- **AI-powered coding**: Context-aware code generation
- **MCP (Model Context Protocol)**: Connects to external tools
- **Linear MCP**: Updates Linear directly from Cursor
- **Commands**: Custom workflows (e.g., `/start-new-project`)

### **Linear MCP Functions**

```typescript
// List teams and projects
mcp_Linear_list_teams();
mcp_Linear_list_projects({ team: 'SYOS' });

// Create and update tickets
mcp_Linear_create_issue({
	team: 'SYOS',
	title: '[Slice 1] Workspace Context',
	description: '...',
	projectId: projectId, // ✅ Required (get/create first)
	assigneeId: 'c7c555a2-895a-48b6-ae24-d4147d44b1d5', // ✅ Required (Randy)
	estimate: 2, // ✅ Required (numeric: 0-5, not size labels)
	labels: [
		'ba9cfc2b-a993-4265-80dc-07fd1c831029', // feature (type)
		'7299ef53-982d-429d-b513-ccf190b28c16' // backend (scope)
	]
});

mcp_Linear_update_issue({
	id: 'issue-id',
	state: 'In Progress' | 'Done'
});

// Add comments
mcp_Linear_create_comment({
	issueId: 'issue-id',
	body: '✅ Complete - Feature shipped | Commit: abc1234'
});

// Update project description
mcp_Linear_update_project({
	id: 'project-id',
	summary: 'One-line summary',
	description: 'Full project overview'
});
```

### **Cursor Workflows**

**Starting a New Project** (`/start-new-project`):

1. Create git branch
2. Create PARA documentation structure
3. Create Linear project + tickets via MCP
4. Initialize project description

**Completing a Slice**:

1. Code the feature
2. Commit with structured message
3. Update Linear ticket status to "Done"
4. Add one-line comment with commit hash
5. Test with user before next slice

**Shipping a Project**:

1. Create PR on GitHub
2. Wait for approval
3. Merge to main
4. Post project update in Linear (manual for now)

---

## 💻 GitHub: Version Control & Code Review

### **What GitHub Does**

- **Version control**: Git repository, branches
- **Code review**: Pull requests, comments
- **CI/CD**: Automated testing, deployment
- **Integration**: Linear ticket linking

### **GitHub Structure**

```
Repository: SynergyOS
├─ main (production)
├─ feature/multi-workspace-auth (current)
└─ Pull Requests
   └─ PR #123: [SYOS-1] Multi-Workspace Auth
      - Links to Linear tickets
      - CI checks
      - Code review
```

### **PR Description Template**

```markdown
## Summary

Multi-workspace authentication support

## Linear Project

https://linear.app/younghumanclub/project/auth-and-system-foundation-498d3cff7ef0

## Completed Tickets

- [x] SYOS-1: Workspace Context & Indicator
- [x] SYOS-2: Create First Organization
- [x] SYOS-3: Workspace Switching
      ...

## Documentation

- Project README: dev-docs/1-projects/multi-workspace-auth/README.md
- Architecture: dev-docs/2-areas/workos-convex-auth-architecture.md

## Testing

- [x] All slices tested by Randy
- [x] No breaking changes
- [x] Documentation updated
```

---

## 🔄 Complete Workflow Example

### **Phase 1: Planning (Linear)**

```typescript
// 1. Create project
mcp_Linear_get_project({ query: 'Auth and System Foundation' });

// 2. Update project description
mcp_Linear_update_project({
	id: 'project-id',
	summary: 'Multi-workspace authentication',
	description: '# Project Overview\n...'
});

// 3. Create tickets for each slice
mcp_Linear_create_issue({
	team: 'SYOS',
	title: '[Slice 1] Workspace Context & Indicator',
	projectId: projectId, // ✅ Required (get/create first)
	assigneeId: 'c7c555a2-895a-48b6-ae24-d4147d44b1d5', // ✅ Required (Randy)
	estimate: 2, // ✅ Required (numeric: 0-5, 2=S=2-4h)
	labels: [
		'ba9cfc2b-a993-4265-80dc-07fd1c831029', // feature (type)
		'7299ef53-982d-429d-b513-ccf190b28c16', // backend (scope)
		'ede0cdda-d56f-4f0d-a6b9-5522df50839f' // workspace (scope)
	],
	state: 'Todo'
});
```

---

### **Phase 2: Development (Cursor)**

```bash
# 1. Create git branch
git checkout -b feature/multi-workspace-auth

# 2. Code Slice 1
# ... implement feature ...

# 3. Update Linear ticket
mcp_Linear_update_issue({
  id: "SYOS-1-id",
  state: "In Progress"
})

# 4. Commit
git add src/ convex/
git commit -m "✅ [SLICE-1] Workspace Context & Indicator" -m "..."

# 5. Mark complete in Linear
mcp_Linear_update_issue({
  id: "SYOS-1-id",
  state: "Done"
})

mcp_Linear_create_comment({
  issueId: "SYOS-1-id",
  body: "✅ Complete - Session stores workspace context | Commit: 76da261"
})

# 6. Repeat for each slice...
```

---

### **Phase 3: Review & Ship (GitHub)**

```bash
# 1. Push to GitHub
git push origin feature/multi-workspace-auth

# 2. Create PR with Linear ticket links
# (see PR template above)

# 3. Code review
# Reviewer approves

# 4. Merge to main
git checkout main
git merge feature/multi-workspace-auth
git push origin main

# 5. Post project update in Linear
# (manual for now - update project Updates tab)
```

---

## 📊 Flow Metrics Integration

### **How Linear Tracks Flow**

**Flow Velocity**:

- Counts tickets moved to "Done" per cycle
- Filtered by cycle: `cycle:"Nov 1-14"`

**Flow Distribution**:

- Groups by type label: `feature`, `bug`, `tech-debt`, `risk`
- View in Insights panel (Cmd+Shift+I)

**Flow Time**:

- Measures time from "Todo" → "Done"
- Status transitions automatically tracked

**Flow Load** (WIP):

- Counts tickets in "In Progress"
- Filter: `status:"In Progress"`

**Flow Efficiency**:

- Requires manual tracking (active vs waiting time)
- Or use external tools like Screenful

---

## 🏷️ Labeling Convention

### **Every Ticket Must Have**

1. **Type** (one): `feature`, `bug`, `tech-debt`, `risk` (use label IDs)
2. **Scope** (one or more): `frontend`, `backend`, `ui`, `auth`, `workspace`, `analytics`, `devops`, `security` (use label IDs)
3. **Estimate** (numeric field): `0-5` (0=none, 1=xs, 2=s, 3=m, 4=l, 5=xl) - **NOT size labels**

### **Example**

```typescript
mcp_Linear_create_issue({
	team: 'SYOS',
	title: '[Slice 1] Workspace Context & Indicator',
	projectId: projectId, // ✅ Required (get/create first)
	assigneeId: 'c7c555a2-895a-48b6-ae24-d4147d44b1d5', // ✅ Required (Randy)
	estimate: 2, // ✅ Required (numeric: 2=S=2-4h, NOT size label)
	labels: [
		'ba9cfc2b-a993-4265-80dc-07fd1c831029', // feature (type - label ID)
		'7299ef53-982d-429d-b513-ccf190b28c16', // backend (scope - label ID)
		'ede0cdda-d56f-4f0d-a6b9-5522df50839f' // workspace (scope - label ID)
	]
});
```

**⚠️ CRITICAL**:

- Use `estimate` field (numeric), NOT size labels
- Use label IDs (not names) - see `/linear` command for all IDs
- Always include `projectId` and `assigneeId`

**See**: `/linear` command for complete labeling reference

---

## 🎯 Hardcoded Constants (for Speed)

**⚠️ IMPORTANT**: Use `/linear` command for complete constants reference.

**Quick Reference:**

```typescript
const LINEAR_TEAM_ID = '08d684b7-986f-4781-8bc5-e4d9aead6935'; // SYOS
const RANDY_USER_ID = 'c7c555a2-895a-48b6-ae24-d4147d44b1d5'; // Randy Hereman

// Use estimate field (numeric: 0-5), NOT size labels
const ESTIMATES = {
	none: 0,
	xs: 1,
	s: 2,
	m: 3,
	l: 4,
	xl: 5
};

// Label IDs (see /linear command for complete list)
const LINEAR_LABELS = {
	feature: 'ba9cfc2b-a993-4265-80dc-07fd1c831029',
	backend: '7299ef53-982d-429d-b513-ccf190b28c16'
	// ... see /linear command for all labels
};
```

**⚠️ CRITICAL**:

- Use `projectId` (not `project` name)
- Use `estimate` field (numeric 0-5), NOT size labels
- Use label IDs (not label names)
- Always set `assigneeId` to Randy's ID

**See**: `/linear` command for complete constants and examples

---

## 📋 Creating Subtickets (Child Issues)

**When to use**: Break down large tickets into focused, actionable subtickets.

### Workflow

1. **Identify parent ticket** - Get ticket ID (e.g., SYOS-84)
2. **Create subtickets** - One ticket per issue/fix
3. **Link with `parentId`** - Use parent ticket's ID

### Example: Creating Subtickets

```typescript
// Get parent ticket
const parent = await mcp_Linear_get_issue({ id: 'SYOS-84' });

// Create subticket
await mcp_Linear_create_issue({
	team: 'SYOS',
	title: 'Fix: [Specific Issue]',
	description: '# Issue Description\n\n**Parent:** [SYOS-84](url)\n\n...',
	projectId: parent.projectId, // ✅ Use same project as parent
	parentId: parent.id, // ✅ Link to parent
	assigneeId: RANDY_USER_ID, // ✅ Always assign to Randy
	estimate: 2, // ✅ Numeric estimate
	labels: ['bug', 'auth', 'backend'] // ✅ Appropriate labels
});
```

### Best Practices

- ✅ **One issue per subticket** - Each subticket should be independently fixable
- ✅ **Use parent's project** - Subtickets inherit parent's project
- ✅ **Clear titles** - Start with "Fix:" or "Add:" for clarity
- ✅ **Link to parent** - Include parent ticket link in description
- ✅ **Appropriate estimates** - Smaller than parent (typically 1-3)

**See**: `/linear` command for complete ticket creation workflow

---

## 🚀 Quick Reference

| Tool       | Purpose          | Key Actions                                 |
| ---------- | ---------------- | ------------------------------------------- |
| **Linear** | Project tracking | Create tickets, update status, view metrics |
| **Cursor** | Development      | Code with AI, update Linear via MCP         |
| **GitHub** | Version control  | Create branches, PR, merge                  |

| MCP Function     | When to Use               |
| ---------------- | ------------------------- |
| `list_teams`     | Get team ID               |
| `list_projects`  | Get project ID            |
| `create_issue`   | New ticket                |
| `update_issue`   | Change status, add labels |
| `create_comment` | Add completion note       |
| `update_project` | Update description        |

---

## 📚 References

- [Linear API Documentation](https://developers.linear.app/)
- [MCP (Model Context Protocol)](https://modelcontextprotocol.io/)
- [GitHub Linear Integration](https://linear.app/docs/github)
- [Flow Metrics](./flow-metrics.md)

---

**Last Updated**: 2025-11-13  
**Related**:

- **Command**: `/linear` - Complete Linear workflow reference (constants, ticket creation, examples)
- **Rule**: `.cursor/rules/working-with-linear.mdc` - Critical rules (Project ID required, Assign user)
- **Docs**: [Flow Metrics](./flow-metrics.md), [Ticket Writing](../patterns/ticket-writing.md)
