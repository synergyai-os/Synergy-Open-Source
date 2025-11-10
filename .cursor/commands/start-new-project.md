# start-new-project

**Purpose**: Initialize a new project/feature using Shape Up vertical slices with Linear tracking and PARA documentation.

**When to use**: Starting a significant feature that requires multiple end-to-end slices (3+ weeks of work).

---

## Prerequisites

1. Read `/start` command first (understand codebase)
2. Read `dev-docs/product-vision-and-plan.md` (understand current state)
3. Read `dev-docs/patterns/INDEX.md` (check existing patterns)

---

## Workflow

### 1. Plan & Validate Architecture

**Before coding**:
- Create architecture document (if needed)
- Discuss with user to validate approach
- Break down into vertical slices (Shape Up style)
- Get user confirmation on plan

**Example**: `dev-docs/2-areas/workos-convex-auth-architecture.md`

---

### 2. Create Git Branch

```bash
git checkout -b feature/[descriptive-name]
```

**Example**: `feature/multi-workspace-auth`

---

### 3. Create PARA Documentation Structure

```
dev-docs/
├── 1-projects/
│   └── [project-name]/
│       ├── README.md                 # START HERE (overview, status, slices)
│       ├── vertical-slices.md        # Detailed breakdown
│       ├── testing-checklist.md      # Manual QA
│       └── decisions/                # Architecture Decision Records
│           ├── 001-[topic].md
│           └── 002-[topic].md
```

**README.md must include**:
- Project status and Linear link
- User stories (what we're building)
- Architecture at-a-glance
- Vertical slices table (with status)
- Completion criteria (DoD)
- What happens after (pattern extraction, archival)

**See**: `dev-docs/1-projects/multi-workspace-auth/README.md` for template

---

### 4. Create Linear Tickets & Initialize Project (Use MCP)

**Step 4a: Create tickets** (one per vertical slice):

```typescript
// List teams and projects first
mcp_Linear_list_teams()
mcp_Linear_list_projects({ team: "SYOS" })

// Create ticket
mcp_Linear_create_issue({
  team: "SYOS",
  title: "[Slice N] Descriptive Title",
  description: `
**Goal**: What this slice delivers

**Acceptance Criteria:**
- [ ] Specific, testable requirement
- [ ] Another requirement

**Files Changed:**
- path/to/file.ts - What changes

**Test Plan:**
1. Step-by-step test
2. Expected result

**Estimate**: X hours
**Branch**: feature/branch-name
  `,
  project: "Project Name",
  state: "In Progress" | "Todo" | "Done",
  labels: ["tag1", "tag2"]
})
```

**Step 4b: Initialize Linear project** (for org-wide visibility):

```typescript
// Get project
mcp_Linear_get_project({ query: "Project Name" })

// Update with description
mcp_Linear_update_project({
  id: "project-id",
  summary: "One-line summary for project list",
  description: `
# Project Overview
[What we're building and why]

## Goals
- ✅ Completed goal
- 🚧 In progress goal
- ⏳ Upcoming goal

## Architecture
- **Backend**: Tech stack
- **Frontend**: Tech stack
- **Key Patterns**: Design decisions

## Documentation
- **Project README**: dev-docs/1-projects/[name]/README.md
- **Architecture**: dev-docs/2-areas/[name].md
- **Decisions**: dev-docs/1-projects/[name]/decisions/

## Branch
\`feature/branch-name\`

## Status
- **Completed**: [List]
- **In Progress**: [Current slice]
- **Next**: [Next slice]

## Key Design Decisions
1. Decision 1 and rationale
2. Decision 2 and rationale
  `
})
```

**Purpose split**:
- **Linear Project**: High-level overview for org-wide visibility (PMs, stakeholders, teammates)
- **Dev-Docs**: Technical details for developers and AI (architecture, patterns, decisions)

**Ticket states**:
- `"Todo"` - Not started
- `"In Progress"` - Currently working
- `"Done"` - Completed

**Always use Linear MCP** to create/update tickets, never manually.

---

### 5. Build Vertical Slices (Shape Up)

**For each slice**:

1. **Start work** → Update Linear:
   ```typescript
   mcp_Linear_update_issue({
     id: "issue-id",
     state: "In Progress"
   })
   ```

2. **Build end-to-end** (backend + frontend working together)

3. **Commit** (descriptive message):
   ```bash
   git add src/ convex/ dev-docs/1-projects/
   git commit -m "✅ [SLICE-N] Title" -m "TYPE: feature | SCOPE: area | SIZE: small | IMPACT: high

   - What was added/changed
   - Why it matters
   
   Addresses: vertical-slices.md#slice-N
   Linear: SYOS-N"
   ```

4. **Test with user** (get feedback before next slice)

5. **Mark complete** in Linear (ticket + one-line comment):
   ```typescript
   // Update ticket status
   mcp_Linear_update_issue({
     id: "issue-id",
     state: "Done"
   })
   
   // Add one-line completion comment
   mcp_Linear_create_comment({
     issueId: "issue-id",
     body: "✅ Complete - [What shipped in 1 sentence] | Commit: abc1234"
   })
   ```

6. **Update TODO list**:
   ```typescript
   todo_write({
     merge: true,
     todos: [{ id: "slice-N", status: "completed" }]
   })
   ```

**Repeat** until all slices complete.

---

### 6. Create Pull Request (When Ready to Merge)

**Before PR**:
- All Linear tickets marked "Done"
- All tests passing
- Documentation complete
- User tested all slices

**Create PR**:
```bash
git push origin feature/[branch-name]
```

**PR Description Template**:
```markdown
## Summary
[1-2 sentence overview]

## Linear Project
[Link to Linear project]

## Completed Tickets
- [x] SYOS-1: Slice 1 description
- [x] SYOS-2: Slice 2 description
...

## Documentation
- Project README: `dev-docs/1-projects/[name]/README.md`
- Architecture: `dev-docs/2-areas/[arch-doc].md`

## Testing
- [ ] All slices tested by user
- [ ] No breaking changes
- [ ] Documentation updated

## Deployment Notes
[Any special deployment steps]
```

**Wait for reviewer approval** before merging.

**After PR merged** → Post project update in Linear (org-wide visibility):

```typescript
// Post to Linear Updates tab (announces completion to entire org)
// TODO: Check if Linear MCP supports project updates
// For now: Manually post update in Linear UI
```

**Update template**:
```markdown
## 🚀 [Project Name] Shipped

**What we built:**
- Feature 1: Brief description
- Feature 2: Brief description
- Feature 3: Brief description

**Impact:**
[Why this matters to users/org]

**Try it:**
[How to use the new features]

**Technical details:**
See dev-docs/1-projects/[name]/ for architecture and decisions

**Merged:** [PR link]
**Branch:** feature/[name]
```

---

### 7. After Merge (Cleanup)

**Extract patterns**:
1. Review project docs in `dev-docs/1-projects/[name]/`
2. Extract reusable patterns → `dev-docs/2-areas/` or `dev-docs/patterns/`
3. Update `dev-docs/patterns/INDEX.md`
4. Move project docs → `dev-docs/4-archive/`

**Example**:
- `decisions/001-workspace-context.md` → Keep in archive for reference
- Workspace switching pattern → Extract to `dev-docs/patterns/workspace-patterns.md`

---

## Commit Message Format

```
[TYPE] Title (max 50 chars)

TYPE: feature | SCOPE: area | SIZE: small/medium/large | IMPACT: low/medium/high

Detailed description of changes:
- What was changed
- Why it matters
- What problem it solves

Addresses: [doc reference]
Linear: [ticket ID]
```

**Common types**:
- `✅ [SLICE-N]` - Completed vertical slice
- `📦 [PROJECT]` - Project setup/documentation
- `🔧 [FIX]` - Bug fix
- `📝 [DOCS]` - Documentation only
- `♻️ [REFACTOR]` - Code refactoring

---

## Quick Reference

| Step | Action | Tool |
|------|--------|------|
| Plan | Validate architecture | Discussion with user |
| Branch | `git checkout -b feature/name` | Git |
| Docs | Create PARA structure | `dev-docs/1-projects/` |
| Tickets | Create Linear issues | `mcp_Linear_create_issue` |
| Build | Implement slice | Code |
| Update | Mark slice complete | `mcp_Linear_update_issue` |
| Commit | Commit changes | Git |
| Test | User tests slice | Manual QA |
| PR | Create pull request | GitHub |
| Merge | After approval | GitHub |
| Archive | Extract patterns, archive | Docs |

---

## Related Commands

- `/start` - Onboarding guide (read first)
- `/save` - Save patterns after completing work
- `/root-cause` - Debug issues using patterns

---

## Example: Multi-Workspace Auth

**Branch**: `feature/multi-workspace-auth`

**Documentation**:
- `dev-docs/1-projects/multi-workspace-auth/README.md`
- `dev-docs/1-projects/multi-workspace-auth/vertical-slices.md`
- `dev-docs/1-projects/multi-workspace-auth/decisions/001-workspace-context.md`

**Linear**: 7 tickets (SYOS-1 through SYOS-7)

**Slices**:
1. Workspace Context & Indicator ✅
2. Create First Organization (in progress)
3. Switch Between Workspaces
4. Keyboard Shortcuts
5. Multiple Organizations
6. CMD+K Search
7. Account Linking (stretch)

**See project docs** for full example.
