# branch

**Purpose**: Create a new git branch following SynergyOS conventions and workflow.

---

# 🚨🚨🚨 CRITICAL: Linear Ticket Required 🚨🚨🚨

## ⛔ **DO NOT CREATE BRANCH WITHOUT LINEAR TICKET ID**

**BEFORE creating branch:**

### Step 1: Check for Linear Ticket ID

**Look in the conversation for:**

- "SYOS-123" or "SYOS-XXX" format
- "ticket SYOS-123"
- "Linear ticket"
- Any mention of a Linear issue ID

### Step 2: Decision

**IF NO TICKET ID FOUND:**

```
❌ STOP - I cannot create a branch without a Linear ticket ID.

Please provide:
- Linear ticket ID (e.g., SYOS-123)
- OR say "create new ticket" and I'll help you create one using /start

Once I have a ticket ID, I'll create the branch with the correct naming convention.
```

**IF TICKET ID FOUND:**

1. **Get ticket details** (optional - to verify ticket exists)
2. **Create branch** with correct naming convention
3. **Verify branch created** successfully

---

## Branch Creation Workflow

### Step 0: Check Current State (IMPORTANT)

**Before creating branch, check if you have uncommitted changes:**

```bash
# Check current branch and status
git branch
git status
```

**If you have uncommitted changes on `main`:**

⚠️ **You've been working on `main` directly** - This violates trunk-based development.

**Option A: Move uncommitted changes to new branch** (Recommended)

```bash
# Create branch from current state (changes come with you)
git checkout -b feature/SYOS-XXX-description

# Now commit your changes
git add .
git commit -m "feat: description"
```

**Option B: Stash changes, create branch, then apply**

```bash
# Save changes temporarily
git stash

# Create branch from clean main
git checkout main
git pull origin main
git checkout -b feature/SYOS-XXX-description

# Apply your changes
git stash pop

# Now commit
git add .
git commit -m "feat: description"
```

**If you have committed changes on `main`:**

⚠️ **You've committed to `main` directly** - Need to move commits to branch.

```bash
# Create branch from current state (includes your commits)
git checkout -b feature/SYOS-XXX-description

# Reset main to before your commits (get commit hash first!)
git checkout main
git reset --hard origin/main  # ⚠️ This removes your commits from main

# Switch back to your branch (commits are safe here)
git checkout feature/SYOS-XXX-description
```

**If `main` is clean:**

Proceed to Step 1 below.

---

### Step 1: Ensure You're on Main (If Starting Fresh)

**Only if you don't have existing changes:**

```bash
# Check current branch
git branch

# Switch to main if needed
git checkout main

# Pull latest changes
git pull origin main
```

**Why**: Ensures branch is created from latest `main` code.

---

### Step 2: Create Branch with Correct Naming

**Branch Naming Convention**: `feature/SYOS-XXX-description`

**Format**:

- Prefix: `feature/`, `fix/`, or `docs/`
- Linear ticket ID: `SYOS-123`
- Description: Short, kebab-case description

**Examples**:

- ✅ `feature/SYOS-123-add-user-auth`
- ✅ `fix/SYOS-456-sidebar-navigation-bug`
- ✅ `docs/SYOS-789-update-readme`
- ❌ `feature/my-feature` (missing ticket ID)
- ❌ `SYOS-123-feature` (wrong prefix order)

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

---

### Step 3: Verify Branch Created

```bash
# Confirm you're on the new branch
git branch
# * should show your new branch

# Verify branch name matches convention
git branch --show-current
```

---

## Why This Matters

### Linear Integration

**Branch names with ticket IDs auto-link to Linear issues:**

- GitHub integration detects `SYOS-123` in branch name
- PRs automatically link to Linear ticket
- Workflow states update automatically

**See**: `dev-docs/3-resources/guides/linear-github-integration.md` for complete integration details

### Trunk-Based Development

**SynergyOS uses trunk-based development:**

- Single `main` branch (always deployable)
- Short-lived feature branches (< 2 days)
- Merge via PR with quality gates

**See**: `dev-docs/2-areas/architecture/system-architecture.md#L680` for complete workflow

---

## Common Mistakes

### ❌ Missing Ticket ID

```bash
# WRONG: No ticket ID
git checkout -b feature/add-user-auth
```

**Fix**: Always include ticket ID: `feature/SYOS-123-add-user-auth`

---

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
git checkout main
git pull origin main
git checkout -b feature/SYOS-123-new-feature
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
# Create branch from current state (changes come with you)
git checkout -b feature/SYOS-123-my-feature
git add .
git commit -m "feat: my feature"
```

**If already committed:**

```bash
# Create branch from current state (includes commits)
git checkout -b feature/SYOS-123-my-feature

# Reset main to clean state
git checkout main
git reset --hard origin/main

# Switch back to your branch (commits are safe)
git checkout feature/SYOS-123-my-feature
```

**Prevention**: Always create branch BEFORE making changes.

---

## Quick Reference

**Complete Git Workflow**: `dev-docs/2-areas/development/git-workflow.md`

**Branch Naming Pattern**: `{prefix}/{SYOS-XXX}-{description}`

**Prefixes**:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates

**Required**: Linear ticket ID (`SYOS-XXX`)

---

## Next Steps

After creating branch:

1. **Make changes** - Edit files, test locally
2. **Commit changes** - `git add . && git commit -m "feat: description"`
3. **Push branch** - `git push origin feature/SYOS-XXX-description`
4. **Create PR** - Use `/pr` command for PR creation workflow

**See**: `dev-docs/2-areas/development/git-workflow.md` for complete workflow

---

**Last Updated**: 2025-01-XX  
**Purpose**: Ensure consistent branch creation with Linear integration  
**Related**: `/start` (ticket creation), `/pr` (PR workflow), `git-workflow.md` (complete guide)
