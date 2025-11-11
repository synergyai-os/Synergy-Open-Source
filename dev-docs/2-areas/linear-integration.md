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
	labels: ['feature', 'backend', 's'],
	project: 'Auth and System Foundation'
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
	labels: ['feature', 'backend', 'workspace', 's'],
	project: 'Auth and System Foundation',
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

1. **Type** (one): `feature`, `bug`, `tech-debt`, `risk`
2. **Scope** (one or more): `frontend`, `backend`, `ui`, `auth`, `workspace`, `analytics`, `devops`, `security`
3. **Size** (one): `xs`, `s`, `m`, `l`, `xl`

### **Example**

```typescript
mcp_Linear_create_issue({
	title: '[Slice 1] Workspace Context & Indicator',
	labels: [
		'feature', // Type: New functionality
		'backend', // Scope: Convex functions
		'workspace', // Scope: Multi-tenancy
		's' // Size: 2-4 hours
	]
});
```

---

## 🎯 Hardcoded Constants (for Speed)

```typescript
// Defined in /start-new-project command
const LINEAR_DEFAULTS = {
	team: 'SYOS',
	teamId: '08d684b7-986f-4781-8bc5-e4d9aead6935',

	labels: {
		// Type
		feature: 'ba9cfc2b-a993-4265-80dc-07fd1c831029',
		bug: '62008be5-0ff6-4aae-ba9b-c2887257acf8',
		'tech-debt': '7cec9e22-31d4-4166-ba92-61d8f8c18809',
		risk: '99472a27-79b0-475b-bd4a-d4d66e3f2b81',

		// Scope
		frontend: '70068764-575a-48a6-b4d1-3735a044230e',
		backend: '7299ef53-982d-429d-b513-ccf190b28c16',
		ui: 'ace175ff-3cce-4416-bacc-529ee85e72a9',
		auth: '1ce394e6-d0ac-41c0-a3b2-f8dd062f7725',
		workspace: 'ede0cdda-d56f-4f0d-a6b9-5522df50839f',
		analytics: '1e82f018-fec6-4d0f-9369-ab1e98cdd613',
		devops: 'df3e1654-2066-423b-905a-41dfc69f2cd5',
		security: '9a561550-aff8-4cd3-a1f5-3cd5b9008b97',

		// Size
		xs: '3af5aae3-2503-40b7-b51c-4ec4f56cd2fc',
		s: '4bcc3827-94f3-4eda-8581-c76e6e51dead',
		m: '8171cae2-3a72-46a0-9d68-b2eb64d90def',
		l: '9fc2063b-a156-4519-8c33-83432e7e9deb',
		xl: '5840c3f2-c2fc-4354-bff7-6eedba83d709',

		// Special
		shaping: '5a657e67-a6d7-4b49-9299-91e60daf44b3'
	}
};
```

**Benefits**:

- ⚡ Faster (no lookup calls)
- 💰 Cheaper (fewer MCP requests)
- 🎯 More precise (exact IDs)

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

**Last Updated**: 2025-11-10  
**Related**: [Flow Metrics](./flow-metrics.md), [/start-new-project](./.cursor/commands/start-new-project.md)
