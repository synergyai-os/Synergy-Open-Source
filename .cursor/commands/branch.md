# branch

**Purpose**: Create a new git branch following SynergyOS conventions and workflow.

**Critical Requirements:**

- ✅ **Always verify** nothing is left behind on `main` (or other branch)
- ✅ **Always ensure** new branch is up-to-date with `origin/main`
- ✅ **Always check** `main` is clean before and after branch creation
- ✅ **Always verify** branch is ready for work after creation
- ✅ **Always show summary** before any branch operation (current branch, changes, what will happen)
- ✅ **Always present options** when uncommitted changes exist (commit to branch, stash, abort)
- ✅ **Always require explicit confirmation** before proceeding (never assume "yes")
- ✅ **Always wait** for user response before executing branch operations

---

## Branch Naming Modes

**Two modes supported:**

1. **Ticket-Based** (preferred for single-ticket work)
   - Format: `feature/SYOS-XXX-description`
   - Use when: Working on a specific Linear ticket
   - Example: `feature/SYOS-123-add-user-auth`

2. **Project-Based** (for multi-ticket projects)
   - Format: `feature/descriptive-name` (4 words max)
   - Use when: Working on a project with multiple tickets
   - Example: `feature/design-system-v1-completed`

**Key Principles:**

- **Short & Clear**: Maximum 4 words, describe action/result
- **Kebab-case**: Use hyphens, lowercase
- **Action-focused**: Name describes what you're accomplishing
- **Prefix required**: `feature/`, `fix/`, or `docs/`

---

## Branch Creation Workflow

### Step 0: Determine Branch Type

**Check conversation context:**

- **Ticket ID found** (SYOS-123, SYOS-XXX) → Use ticket-based naming
- **Project mentioned** (e.g., "Design System", "multi-workspace auth") → Use project-based naming
- **User specifies name** → Use provided name (validate format)

**If unclear, ask user:**

```
Which branch naming approach should I use?

1. Ticket-based: feature/SYOS-XXX-description (if working on specific ticket)
2. Project-based: feature/descriptive-name (if working on project with multiple tickets)

Or provide a specific branch name (must follow naming conventions).
```

### Step 1: Check Current State (MANDATORY)

**ALWAYS check these before creating branch:**

```bash
# 1. Check current branch
git branch
# Note: * shows current branch

# 2. Check for uncommitted changes
git status
# Look for: "Changes not staged", "Untracked files", "Changes to be committed"

# 3. Check if main is up-to-date with origin
git fetch origin
git log HEAD..origin/main --oneline
# If output shows commits → main is behind origin/main

# 4. Check for committed changes on main (if currently on main)
git log origin/main..HEAD --oneline
# If output shows commits → you've committed to main directly
```

**Decision Tree:**

#### Scenario A: Uncommitted Changes on `main`

⚠️ **You've been working on `main` directly** - This violates trunk-based development.

**⚠️ BEFORE proceeding, show summary and require confirmation (see Step 1.5)**

**Option A: Move uncommitted changes to new branch** (Recommended)

**After user confirms "yes" or "A":**

```bash
# 1. Create branch from current state (changes come with you)
git checkout -b feature/branch-name

# 2. Verify changes moved with you
git status
# Should show your uncommitted changes

# 3. Commit your changes
git add .
git commit -m "feat: description"

# 4. Verify main is clean (switch back to check)
git checkout main
git status
# Should show "working tree clean"

# 5. Switch back to your branch
git checkout feature/branch-name
```

**Option B: Stash changes, create branch, then apply**

**After user confirms "B":**

```bash
# 1. Save changes temporarily
git stash

# 2. Verify main is clean
git status
# Should show "working tree clean"

# 3. Ensure main is up-to-date
git checkout main
git pull origin main

# 4. Create branch from clean, up-to-date main
git checkout -b feature/branch-name

# 5. Apply your changes
git stash pop

# 6. Commit your changes
git add .
git commit -m "feat: description"
```

**Option C: Abort**

**After user confirms "C" or "no":**

```
Branch creation aborted. Resolve uncommitted changes first, or choose a different option.
```

#### Scenario B: Committed Changes on `main`

⚠️ **You've committed to `main` directly** - Need to move commits to branch.

**⚠️ BEFORE proceeding, show summary and require confirmation (see Step 1.5)**

**Summary should include:**

- List of commits that will be moved
- Warning that main will be reset (destructive operation)
- What will happen step-by-step

**After user confirms "yes":**

```bash
# 1. Note the commit hash(es) you want to move
git log origin/main..HEAD --oneline

# 2. Create branch from current state (includes your commits)
git checkout -b feature/branch-name

# 3. Verify commits are on new branch
git log origin/main..HEAD --oneline
# Should show your commits

# 4. Reset main to match origin/main (removes your commits from main)
git checkout main
git reset --hard origin/main

# 5. Verify main is clean and matches origin
git status
# Should show "working tree clean"
git log HEAD..origin/main --oneline
# Should show no output (main matches origin/main)

# 6. Switch back to your branch (commits are safe here)
git checkout feature/branch-name

# 7. Verify commits are still on your branch
git log origin/main..HEAD --oneline
# Should show your commits
```

#### Scenario C: On `main`, Clean, But Behind Origin

⚠️ **Local main is behind origin/main** - Need to update before creating branch.

**⚠️ BEFORE proceeding, show summary and require confirmation (see Step 1.5)**

**Summary should include:**

- Current branch: main
- Status: Clean (no uncommitted changes)
- Issue: Local main is behind origin/main
- What will happen: Pull latest changes, then create branch

**After user confirms "yes":**

```bash
# 1. Pull latest changes
git pull origin main

# 2. Verify main is up-to-date
git log HEAD..origin/main --oneline
# Should show no output (main matches origin/main)

# Proceed to Step 2
```

#### Scenario D: On `main`, Clean, Up-to-Date

✅ **Main is clean and up-to-date** - Ready to create branch.

**⚠️ BEFORE proceeding, show summary and require confirmation (see Step 1.5)**

**Summary should include:**

- Current branch: main
- Status: Clean and up-to-date
- Action: Create new branch
- Branch name: [proposed name]

**After user confirms "yes":**

Proceed to Step 2 below.

#### Scenario E: On Another Branch

⚠️ **You're on a feature branch** - Need to switch to main first.

**⚠️ BEFORE proceeding, show summary and require confirmation (see Step 1.5)**

**Summary should include:**

- Current branch: [feature branch name]
- Uncommitted changes: [list if any]
- Action: Switch to main, then create new branch
- What will happen: Commit/stash changes, switch to main, pull latest, create branch

**After user confirms "yes":**

```bash
# 1. Check if you have uncommitted changes
git status

# 2. If you have changes, commit or stash them first
git add .
git commit -m "feat: work in progress"
# OR
git stash

# 3. Switch to main
git checkout main

# 4. Ensure main is up-to-date
git pull origin main

# Proceed to Step 2
```

---

### Step 1.5: Show Summary and Require Explicit Confirmation (MANDATORY) ⚠️ **CRITICAL**

**⚠️ NEVER proceed with branch operations without explicit user confirmation.**

**After checking current state (Step 1), ALWAYS:**

1. **Show Summary** (MANDATORY):
   - Current branch name
   - List of uncommitted changes (files modified/added/deleted)
   - What will happen (step-by-step)
   - Which option will be used (if multiple options exist)

2. **Present Options** (if uncommitted changes exist):
   - **Option A**: Move changes to new branch, then commit (recommended)
   - **Option B**: Stash changes, create clean branch, then apply
   - **Option C**: Abort branch creation

3. **Require Explicit Confirmation** (MANDATORY):
   - Show: "Proceed with Option A? (yes/no)"
   - **WAIT for user response**
   - **NEVER proceed without explicit "yes"**
   - **NEVER assume user wants to proceed**

**Example Summary Format:**

```
📋 Summary:
   - Current branch: main
   - Uncommitted changes: 2 files
     • Modified: .cursor/commands/branch.md
     • Untracked: ai-docs/tasks/SYOS-430-branch-safety-gates.md
   - Action: Create feature/design-system-v1-completed
   - What will happen:
     1. Create branch from current state (changes come with you)
     2. Switch to new branch
     3. Commit changes on new branch
     4. Verify main is clean

Options:
   A) Move changes to new branch, then commit (recommended)
   B) Stash changes, create clean branch, then apply
   C) Abort branch creation

Which option? (A/B/C or yes/no for Option A)
```

**⚠️ CRITICAL RULES:**

- ❌ **NEVER proceed** without showing summary
- ❌ **NEVER proceed** without presenting options (if changes exist)
- ❌ **NEVER proceed** without explicit user confirmation
- ❌ **NEVER assume** user wants to proceed ("yes" is implicit)
- ✅ **ALWAYS wait** for user response before executing any branch operations
- ✅ **ALWAYS show** what will happen before doing it

**Why**: Prevents work loss, builds trust, ensures user understands what will happen before AI acts.

---

### Step 2: Ensure You're on Main and Up-to-Date (MANDATORY)

**ALWAYS verify before creating branch:**

```bash
# 1. Verify you're on main
git branch
# * should be on main

# 2. Fetch latest from origin
git fetch origin

# 3. Check if main is behind origin/main
git log HEAD..origin/main --oneline
# If output shows commits → main is behind, need to pull

# 4. Pull latest changes (if behind)
git pull origin main

# 5. Verify main matches origin/main exactly
git log HEAD..origin/main --oneline
# Should show no output (main matches origin/main)

git log origin/main..HEAD --oneline
# Should show no output (no local commits ahead)

# 6. Verify main is clean (no uncommitted changes)
git status
# Should show "working tree clean"
```

**Why**: Ensures branch is created from latest `main` code, preventing merge conflicts and ensuring consistency.

---

### Step 3: Create Branch with Correct Naming

**Branch Naming Rules:**

- **Prefix required**: `feature/`, `fix/`, or `docs/`
- **Short & descriptive**: Maximum 4 words
- **Kebab-case**: Use hyphens, lowercase
- **Action-focused**: Describe what you're accomplishing

#### Mode 1: Ticket-Based Naming

**Format**: `feature/SYOS-XXX-description`

**When to use**: Working on a specific Linear ticket

**Examples**:

- ✅ `feature/SYOS-123-add-user-auth`
- ✅ `fix/SYOS-456-sidebar-navigation-bug`
- ✅ `docs/SYOS-789-update-readme`

**Create branch**:

```bash
# Replace SYOS-XXX with actual ticket ID
# Replace description with short feature description
git checkout -b feature/SYOS-XXX-description
```

**Example**:

```bash
# For ticket SYOS-123 "Add user authentication"
git checkout -b feature/SYOS-123-add-user-auth
```

#### Mode 2: Project-Based Naming

**Format**: `feature/descriptive-name` (4 words max)

**When to use**: Working on a project with multiple tickets

**Examples**:

- ✅ `feature/design-system-v1-completed`
- ✅ `feature/multi-workspace-auth`
- ✅ `feature/team-access-permissions`
- ✅ `feature/ai-docs-system`
- ❌ `feature/design-system-version-one-completed` (too long, 5 words)
- ❌ `feature/Design System V1` (spaces, uppercase)

**Create branch**:

```bash
# Use descriptive name (4 words max, kebab-case)
git checkout -b feature/descriptive-name
```

**Example**:

```bash
# For Design System project completion
git checkout -b feature/design-system-v1-completed
```

**Best Practices** (from Git community):

- **Be specific**: `design-system-v1-completed` better than `design-system`
- **Use verbs**: `add-user-auth` better than `user-auth`
- **Keep it short**: 4 words maximum for readability
- **Avoid dates**: Don't include dates (e.g., `design-system-2025`)

---

### Step 4: Verify Branch Created and Up-to-Date (MANDATORY)

**ALWAYS verify after creating branch:**

```bash
# 1. Confirm you're on the new branch
git branch
# * should show your new branch

# 2. Verify branch name matches convention
git branch --show-current

# 3. Verify branch is based on latest main
git log origin/main..HEAD --oneline
# Should show no output (branch matches main, no commits yet)

# 4. Verify main is still clean (nothing left behind)
git checkout main
git status
# Should show "working tree clean"

git log HEAD..origin/main --oneline
# Should show no output (main matches origin/main)

git log origin/main..HEAD --oneline
# Should show no output (no commits on main)

# 5. Switch back to your new branch
git checkout feature/branch-name

# 6. Verify branch is ready for work
git status
# Should show "working tree clean" (ready for new changes)
```

**Critical Checks:**

- ✅ **New branch exists** and is checked out
- ✅ **Branch is up-to-date** with origin/main (no commits yet)
- ✅ **Main is clean** (no uncommitted changes left behind)
- ✅ **Main matches origin/main** (no local commits on main)
- ✅ **New branch is ready** for work (clean working tree)

---

## Why This Matters

### Linear Integration (Ticket-Based Branches)

**Branch names with ticket IDs auto-link to Linear issues:**

- GitHub integration detects `SYOS-123` in branch name
- PRs automatically link to Linear ticket
- Workflow states update automatically

**Note**: Project-based branches don't auto-link to tickets, but can reference project in PR description.

**See**: `dev-docs/3-resources/guides/linear-github-integration.md` for complete integration details

### Trunk-Based Development

**SynergyOS uses trunk-based development:**

- Single `main` branch (always deployable)
- Short-lived feature branches (< 2 days)
- Merge via PR with quality gates

**See**: `dev-docs/2-areas/architecture/system-architecture.md#L680` for complete workflow

---

## Common Mistakes

### ❌ Too Long Branch Name

```bash
# WRONG: More than 4 words
git checkout -b feature/design-system-version-one-completed-implementation
```

**Fix**: Keep it short (4 words max): `feature/design-system-v1-completed`

---

### ❌ Wrong Format (Spaces, Uppercase)

```bash
# WRONG: Spaces and uppercase
git checkout -b feature/Design System V1 Completed
```

**Fix**: Use kebab-case: `feature/design-system-v1-completed`

---

### ❌ Missing Prefix

```bash
# WRONG: No prefix
git checkout -b design-system-v1-completed
```

**Fix**: Always include prefix: `feature/design-system-v1-completed`

---

### ❌ Ticket ID Required When Not Needed

```bash
# WRONG: Adding ticket ID to project-based branch
git checkout -b feature/SYOS-123-design-system-v1-completed
```

**Fix**: For project-based branches, use descriptive name: `feature/design-system-v1-completed`

**Note**: Only use ticket ID format when working on a single ticket.

### ❌ Wrong Prefix Order

```bash
# WRONG: Ticket ID before prefix
git checkout -b SYOS-123-feature-add-user-auth
```

**Fix**: Prefix first: `feature/SYOS-123-add-user-auth`

---

### ❌ Creating from Wrong Branch

```bash
# WRONG: Creating branch from feature branch
git checkout feature/old-branch
git checkout -b feature/SYOS-123-new-feature
```

**Fix**: Always create from `main`:

```bash
# 1. Switch to main
git checkout main

# 2. Ensure main is up-to-date
git pull origin main

# 3. Verify main is clean and up-to-date
git status
# Should show "working tree clean"
git log HEAD..origin/main --oneline
# Should show no output (main matches origin/main)

# 4. Create branch from clean, up-to-date main
git checkout -b feature/SYOS-123-new-feature

# 5. Verify branch created and main is still clean
git checkout main
git status
# Should show "working tree clean"
git checkout feature/SYOS-123-new-feature
```

---

### ❌ Working on Main Branch Directly

```bash
# WRONG: Working on main, then trying to create branch
# (You've already made changes/commits on main)
git checkout main
# ... make changes ...
git commit -m "feat: my feature"
# Now you realize you need a branch
```

**Fix**: Move your work to a branch (see Step 0 above):

**If uncommitted:**

```bash
# 1. Create branch from current state (changes come with you)
git checkout -b feature/branch-name

# 2. Verify changes moved with you
git status
# Should show your uncommitted changes

# 3. Commit your changes
git add .
git commit -m "feat: description"

# 4. Verify main is clean (nothing left behind)
git checkout main
git status
# Should show "working tree clean"

# 5. Switch back to your branch
git checkout feature/branch-name
```

**If already committed:**

```bash
# 1. Note commit hash(es) to move
git log origin/main..HEAD --oneline

# 2. Create branch from current state (includes commits)
git checkout -b feature/branch-name

# 3. Verify commits are on new branch
git log origin/main..HEAD --oneline
# Should show your commits

# 4. Reset main to clean state (matches origin/main)
git checkout main
git reset --hard origin/main

# 5. Verify main is clean and matches origin
git status
# Should show "working tree clean"
git log HEAD..origin/main --oneline
# Should show no output (main matches origin/main)

# 6. Switch back to your branch (commits are safe)
git checkout feature/branch-name

# 7. Verify commits are still on your branch
git log origin/main..HEAD --oneline
# Should show your commits
```

**Prevention**: Always create branch BEFORE making changes.

---

## Quick Reference

**Complete Git Workflow**: `dev-docs/2-areas/development/git-workflow.md`

**Branch Naming Patterns**:

- **Ticket-based**: `{prefix}/{SYOS-XXX}-{description}`
- **Project-based**: `{prefix}/{descriptive-name}` (4 words max)

**Prefixes**:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates

**Rules**:

- Maximum 4 words
- Kebab-case (lowercase, hyphens)
- Action-focused (describe what you're accomplishing)
- Ticket ID optional (use for single-ticket work, omit for projects)

---

## Next Steps

After creating branch:

1. **Make changes** - Edit files, test locally
2. **Commit changes** - `git add . && git commit -m "feat: description"`
3. **Push branch** - `git push origin feature/branch-name`
4. **Create PR** - Use `/pr` command for PR creation workflow
   - For project-based branches: Reference project in PR description
   - For ticket-based branches: PR will auto-link to Linear ticket

**See**: `dev-docs/2-areas/development/git-workflow.md` for complete workflow

---

**Last Updated**: 2025-01-XX  
**Purpose**: Flexible branch creation supporting both ticket-based and project-based workflows  
**Related**: `/start` (ticket creation), `/pr` (PR workflow), `git-workflow.md` (complete guide)
