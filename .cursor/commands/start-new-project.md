# start-new-project

**Purpose**: Initialize a new project/feature using Shape Up vertical slices with Linear tracking and PARA documentation.

**When to use**: Starting a significant feature that requires multiple end-to-end slices (3+ weeks of work).

---

## 📋 Linear Constants & Workflow

**For hardcoded constants and complete Linear workflow:**
- **Command**: `/linear` - All constants, ticket writing format, examples

**Quick Reference:**
- **Team**: `SYOS` (`08d684b7-986f-4781-8bc5-e4d9aead6935`)
- **User (Randy)**: `c7c555a2-895a-48b6-ae24-d4147d44b1d5`
- **Estimate**: Numeric (0-5): 0=none, 1=xs, 2=s, 3=m, 4=l, 5=xl

**See**: `/linear` command for complete constants and ticket creation examples

---

## Prerequisites

**Before starting any project, read these in order:**

1. **Read `/start` command** - Understand codebase patterns and architecture
2. **Read `/linear` command** ⭐ **CRITICAL** - Linear workflow, constants, ticket creation
3. **Read `dev-docs/2-areas/development/coding-standards.md`** ⭐ **CRITICAL** - Coding rules (prevents linting errors)
4. **Read `dev-docs/2-areas/product-principles.md`** ⭐ - How we make decisions (Outcomes Over Outputs, etc.)
5. **Read `marketing-docs/strategy/product-vision-2.0.md`** ⭐ - Current product vision (The Open-Source Product OS)
   - ⚠️ **DO NOT read** `dev-docs/2-areas/product/product-vision-and-plan.md` - It's HISTORICAL
6. **Read `dev-docs/2-areas/patterns/INDEX.md`** - Check for existing patterns to reuse
7. **Read `dev-docs/2-areas/flow-metrics.md`** - Understand Linear labeling system

**Project Info:**

- **Production Domain**: `www.synergyos.ai` (always use www prefix)
- **GitHub Repo**: `synergyai-os/Synergy-Open-Source`
- **Linear Team**: `SYOS`

---

## Workflow

### 1. Plan & Validate Architecture

**Before coding**:

#### Define Team & Ownership

- **Who owns this project?** (e.g., Randy, Platform Team, etc.)
- If not yet defined, write **"Not defined"** and assign later
- Document in project README

#### Define Outcome & Success Signals

- **What business outcome does this achieve?** (not just features)
- If not yet validated with users, write: **"{Your best guess} (by AI → real outcome is not defined or linked yet)"**
- Define **success signals**:
  - **Leading indicators**: Early signals (usage, activity, feedback)
  - **Lagging indicators**: Outcome signals (revenue, retention, satisfaction)
- Include **validation plan**: How will you test assumptions with real users?

**Example outcomes**:

- ❌ Bad: "Build RBAC system" (output, not outcome)
- ✅ Good: "Enable secure delegation of team management without admin bottlenecks" (business outcome)

#### Validate Naming (Business-Friendly)

- **Use common language** that all roles understand (not just developers)
- Avoid technical jargon in project names (e.g., "Team Access & Permissions" not "RBAC Phase 1")
- **Validate with user** before finalizing names
- Technical terms OK in developer docs, but use business language for:
  - Linear project names
  - Git branch names (can be shorter)
  - User-facing descriptions

**Example naming**:

- ❌ Bad: "RBAC Phase 1" (developer jargon)
- ✅ Good: "Team Access & Permissions" (everyone understands)

#### Check for Existing Projects

```typescript
// List existing projects first
mcp_Linear_list_projects({ team: 'SYOS' });

// Validate: Create new project or use existing?
```

#### Create Architecture Document

- Create architecture document (if needed)
- Discuss with user to validate approach
- Break down into vertical slices (Shape Up style)
- Get user confirmation on plan

**Example**: `dev-docs/2-areas/workos-convex-auth-architecture.md`

**⚠️ Do NOT start coding until user confirms**:

1. ✅ Team ownership assigned
2. ✅ Outcome defined (even if AI guess)
3. ✅ Naming validated (business-friendly)
4. ✅ Architecture approach approved

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

1. **Project Header**:
   - Status, branch, Linear link, dates

2. **Team & Ownership** (NEW ⭐):

   ```markdown
   ## 👥 Team & Ownership

   **Team**: [Team Name or "Not defined"]

   **Key Contributors**:

   - [Name] - [Role/Responsibility]
   ```

3. **Outcome & Success Signals** (NEW ⭐):

   ```markdown
   ## 🎯 Outcome & Success Signals

   **Outcome**: {Your outcome guess} (by AI → real outcome is not defined or linked yet)

   ### How We'll Know We Succeeded

   **Leading Indicators** (Early signals):

   - [ ] Signal 1
   - [ ] Signal 2

   **Lagging Indicators** (Outcome signals):

   - [ ] Outcome 1
   - [ ] Outcome 2

   ⚠️ These are AI guesses - Validate with real users!

   **Validation Plan**:

   1. How to test assumption 1
   2. How to test assumption 2
   ```

4. **Project Overview**:
   - User stories (what we're building)
   - Architecture at-a-glance

5. **Vertical slices table** (with status)
6. **Completion criteria** (DoD)
7. **What happens after** (pattern extraction, archival)

**See**: `dev-docs/1-projects/multi-workspace-auth/README.md` or `dev-docs/1-projects/team-access-permissions/README.md` for templates

---

### 4. Create Linear Tickets & Initialize Project (Use MCP)

**Step 4a: Create tickets** (one per vertical slice):

**⚠️ CRITICAL**: Before creating tickets, read `/linear` command for:
- Hardcoded constants (team ID, user ID, labels)
- Ticket writing format (Marty Cagan + Shape Up)
- Required fields and validation

**Quick Example:**

```typescript
// See /linear command for complete constants and format
mcp_Linear_create_issue({
	team: 'SYOS',
	title: '[Slice N] Descriptive Title',
	description: '...', // Use ticket writing format from /linear command
	projectId: projectId, // ✅ Required (get/create first)
	assigneeId: 'c7c555a2-895a-48b6-ae24-d4147d44b1d5', // ✅ Randy
	state: 'Todo',
	estimate: 2, // Numeric: 1=XS, 2=S, 3=M, 4=L, 5=XL
	labels: [
		'ba9cfc2b-a993-4265-80dc-07fd1c831029', // feature (type)
		'7299ef53-982d-429d-b513-ccf190b28c16'  // backend (scope)
	]
});
```

**See**: `/linear` command for complete ticket creation workflow and constants

**⚠️ After Creating Ticket:**

1. Copy the returned Linear ticket ID (e.g., `SYOS-123`)
2. **Update ticket description** to include the ID:
   ```typescript
   mcp_Linear_update_issue({
   	id: 'issue-id',
   	description: '... **Linear ID**: SYOS-123 ...'
   });
   ```
3. Use this ID in all commit messages: `Linear: SYOS-123`

**Why**: Enables automation, links commits to tickets, tracks Flow Distribution

---

### 📋 **Ticket Management**

**For complete ticket management rules and examples:**
- **Command**: `/linear` - Ticket writing format, update workflows, examples

**Quick Summary:**
- **AI updates**: Acceptance criteria, files changed, implementation notes, commits list
- **User updates**: Test plan (never check off user's test items)
- **Estimate**: Use numeric values (0-5) - see `/linear` for mapping
- **Labels**: Type (one) + Scope (one or more) - see `/linear` for all label IDs

**See**: `/linear` command for complete ticket management workflow

**Step 4b: Initialize Linear project** (for org-wide visibility):

```typescript
// Get project
mcp_Linear_get_project({ query: 'Project Name' });

// Update with description
mcp_Linear_update_project({
	id: 'project-id',
	summary: 'One-line summary for project list',
	description: `
# Project Overview

**Team**: [Team Name or "Not defined"]

**Outcome**: {Your outcome guess} (by AI → real outcome is not defined or linked yet)

[What we're building and why]

## Success Signals (How we'll measure)
**Leading Indicators:**
- [ ] Signal 1 (AI guess - validate!)
- [ ] Signal 2 (AI guess - validate!)

**Lagging Indicators:**
- [ ] Outcome 1 (AI guess - validate!)
- [ ] Outcome 2 (AI guess - validate!)

⚠️ **These are AI guesses - Talk to users to validate real outcomes!**

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
});
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

**🚦 When to Continue vs. Stop for Review**

**✅ Continue Automatically When:**

- Slice follows same patterns as previous slices
- Backend-only work (APIs, database, logic)
- Well-defined acceptance criteria (no ambiguity)
- Low risk of breaking changes
- Similar to existing features (e.g., Slice 4 → Slice 5 same patterns)
- You're 95%+ confident it will work

**⛔ Stop and Ask for Review When:**

- Frontend/UX decisions needed (layout, interaction, design)
- Breaking changes or migrations required
- Architecture changes or new patterns introduced
- Unclear requirements or acceptance criteria
- Integration with external services (needs testing)
- User experience could vary (need validation)
- Security-sensitive operations
- You're <90% confident

**🎯 Default Rule**: If the next slice is "more of the same pattern", **continue**. If it's "different territory", **stop and ask**.

**For each slice**:

1. **Start work** → Update Linear:

   ```typescript
   mcp_Linear_update_issue({
   	id: 'issue-id',
   	state: 'In Progress'
   });
   ```

2. **Build end-to-end** (backend + frontend working together)
   - **Follow coding standards** - No `any` types, keys in `{#each}`, `resolveRoute()` for navigation
   - **Check linting** - Run `npm run lint` before committing (errors visible but non-blocking)

3. **Commit** (descriptive message with Linear ID, on feature branch):

   ```bash
   git add src/ convex/ dev-docs/1-projects/
   git commit -m "✅ [SLICE-N] Title" -m "TYPE: feature | SCOPE: area | SIZE: small | IMPACT: high

   - What was added/changed
   - Why it matters

   Addresses: vertical-slices.md#slice-N
   Linear: SYOS-N"
   ```

   **⚠️ ALWAYS include `Linear: SYOS-N`** - Enables automation and links commits to tickets
   **⚠️ Commit to feature branch** - Create PR to main when ready (don't push directly to main)

4. **Test with user** (get feedback before next slice)

5. **Mark for review** in Linear (ticket + one-line comment):

   ```typescript
   // Update ticket status to "In Review" (human will mark "Done" after testing)
   mcp_Linear_update_issue({
   	id: 'issue-id',
   	state: 'In Review'
   });

   // Add one-line completion comment
   mcp_Linear_create_comment({
   	issueId: 'issue-id',
   	body: '✅ Ready for review - [What shipped in 1 sentence] | Commit: abc1234'
   });
   ```

   **⚠️ Human marks "Done"** - AI marks "In Review", human tests and confirms

6. **Update TODO list**:
   ```typescript
   todo_write({
   	merge: true,
   	todos: [{ id: 'slice-N', status: 'completed' }]
   });
   ```

**Repeat** until all slices complete.

---

### 6. Create Pull Request (When Ready to Merge)

**Before PR**:

- All Linear tickets reviewed and marked "Done" by human
- All tests passing
- Documentation complete
- User tested all slices

**Create PR** (push feature branch, then create PR to main):

```bash
# Push feature branch (not main)
git push origin feature/[branch-name]

# Then create PR via GitHub UI or CLI
# PR should target: main ← feature/[branch-name]
```

**⚠️ Never push directly to main** - Always use PR workflow for review and CI checks

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
2. Extract reusable patterns → `dev-docs/2-areas/patterns/` (add to domain files)
3. Update `dev-docs/2-areas/patterns/INDEX.md` (add to symptom table)
4. Move project docs → `dev-docs/4-archive/`

**Example**:

- `decisions/001-workspace-context.md` → Keep in archive for reference
- Workspace switching pattern → Extract to `dev-docs/2-areas/patterns/ui-patterns.md` (or appropriate domain file)

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

| Step    | Action                         | Tool                      |
| ------- | ------------------------------ | ------------------------- |
| Plan    | Validate architecture          | Discussion with user      |
| Branch  | `git checkout -b feature/name` | Git                       |
| Docs    | Create PARA structure          | `dev-docs/1-projects/`    |
| Tickets | Create Linear issues           | `mcp_Linear_create_issue` |
| Build   | Implement slice                | Code                      |
| Update  | Mark slice complete            | `mcp_Linear_update_issue` |
| Commit  | Commit changes                 | Git                       |
| Test    | User tests slice               | Manual QA                 |
| PR      | Create pull request            | GitHub                    |
| Merge   | After approval                 | GitHub                    |
| Archive | Extract patterns, archive      | Docs                      |

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
