# pr-close

**Purpose**: Clean up local repository after PR is merged to `main`, following trunk-based deployment workflow.

---

## 🚨 Prerequisites

**Before running this command:**

1. **PR must be merged** - This command is for AFTER merge, not before
2. **GitHub CLI**: `gh` must be installed (`gh auth status`)
3. **Current branch**: Should be the merged feature branch (not `main`)

**Check prerequisites:**
```bash
# Verify PR is merged
gh pr view --json merged

# Check current branch
git branch --show-current
```

---

## 🔄 Workflow: Post-Merge Cleanup

### Step 1: Verify PR Status

**Check if PR is actually merged (not just closed):**
```bash
# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Check if PR exists and is merged
gh pr view --json merged,state,title --jq '.merged, .state, .title'
```

**Expected output:**
- `merged: true` ✅ - PR is merged, proceed
- `merged: false` + `state: "CLOSED"` ❌ - PR was closed, not merged (don't delete branch)
- `merged: false` + `state: "OPEN"` ❌ - PR still open (don't delete branch)

**If PR is not merged:**
```
❌ PR is not merged. This command is only for merged PRs.

If PR was closed without merging:
- Keep your branch (work might be needed later)
- Or manually delete: git branch -D feature/branch-name

If PR is still open:
- Wait for merge, or use /pr command to check status
```

---

### Step 2: Check for Uncommitted Changes

**Verify working directory is clean:**
```bash
git status
```

**If uncommitted changes exist:**
```
⚠️ Warning: You have uncommitted changes.

Options:
1. Commit changes: git add . && git commit -m "message"
2. Stash changes: git stash
3. Discard changes: git restore . (⚠️ loses changes!)

After resolving, run /pr-close again.
```

**Why**: Prevents losing work when switching branches

---

### Step 3: Switch to Main Branch

**Switch to main:**
```bash
git checkout main
```

**If already on main:**
```
ℹ️ Already on main branch. Checking if cleanup is needed...
```

---

### Step 4: Pull Latest Main

**Pull merged changes from remote:**
```bash
git pull origin main
```

**What this does:**
- Fetches latest commits from `origin/main`
- Includes your merged PR changes
- Updates local `main` to match remote

**If pull fails:**
```
❌ Failed to pull main. Possible issues:

1. Uncommitted changes blocking pull
   → Resolve: git stash, then git pull, then git stash pop

2. Local main has diverged
   → Resolve: git fetch origin && git reset --hard origin/main (⚠️ loses local changes)

3. Network/authentication issue
   → Check: gh auth status
```

**Why**: Ensures local `main` includes merged changes before deleting branch

---

### Step 5: Verify Remote Branch Deletion

**Check if remote branch was auto-deleted:**
```bash
# Get branch name from merged PR
BRANCH_NAME=$(gh pr view --json headRefName --jq -r '.headRefName')

# Check if remote branch exists
git ls-remote --heads origin $BRANCH_NAME
```

**Expected:**
- Empty output ✅ - Remote branch deleted (by GitHub Actions)
- Branch listed ⚠️ - Remote branch still exists (unusual, but safe to continue)

**Note**: GitHub Actions workflow (`.github/workflows/cleanup-merged-branches.yml`) automatically deletes remote branches after merge. This step is verification only.

**See**: `dev-docs/3-resources/deployment/deployment-procedures.md` - Automatic branch cleanup section

---

### Step 6: Delete Local Branch

**Safely delete local branch:**
```bash
# Get branch name
BRANCH_NAME=$(gh pr view --json headRefName --jq -r '.headRefName')

# Delete local branch (safe - only if merged)
git branch -d $BRANCH_NAME
```

**What `-d` does:**
- Only deletes if branch is fully merged
- Prevents accidental deletion of unmerged work
- Safe default for cleanup

**If deletion fails:**
```
⚠️ Branch not deleted. Possible reasons:

1. Branch not fully merged locally
   → Force delete: git branch -D $BRANCH_NAME (⚠️ only if sure)

2. Branch name not found
   → Already deleted, or wrong branch name

3. Current branch is the target
   → Already switched to main, branch should delete
```

**Why**: Keeps local repository clean, prevents branch clutter

---

### Step 7: Check Other Branches (Optional)

**List other local branches that might need updating:**
```bash
# List all local branches except main
git branch | grep -v "main" | grep -v "^\*"
```

**If other branches exist:**
```
ℹ️ Other local branches found:
  - feature/SYN-124-other-feature
  - feature/SYN-125-another-feature

Consider updating them to avoid future conflicts:
  git checkout feature/SYN-124-other-feature
  git merge main --no-edit -X theirs
  git push origin feature/SYN-124-other-feature

See: dev-docs/2-areas/patterns/convex-integration.md#L800
```

**When to update:**
- ✅ After merging major features
- ✅ Before starting new work on feature branch
- ❌ Don't update if branch is abandoned/archived

**See**: `dev-docs/2-areas/patterns/convex-integration.md#L800` - Branch cleanup pattern

---

## ✅ Post-Cleanup Checklist

**After cleanup:**

- [ ] Local `main` is up to date (`git pull origin main`)
- [ ] Merged branch deleted locally (`git branch -d`)
- [ ] Remote branch deleted (verified by GitHub Actions)
- [ ] No uncommitted changes blocking future work

**Next steps:**

- [ ] **Verify deployment**: Check Convex + Vercel deployments
- [ ] **Update Linear**: Move issue to "Merged" or "Done" status
- [ ] **Monitor production**: Watch for errors in first 30 minutes
- [ ] **Update other branches**: If you have other feature branches

---

## 🔗 Related Documentation

- **Git Workflow**: `dev-docs/2-areas/development/git-workflow.md` - Complete git workflow guide
- **Branch Cleanup**: `dev-docs/2-areas/patterns/convex-integration.md#L800` - Branch cleanup pattern
- **Deployment**: `dev-docs/3-resources/deployment/deployment-procedures.md` - Deployment workflow
- **Linear Integration**: `dev-docs/3-resources/guides/linear-github-integration.md` - Linear + GitHub integration

---

## 🚨 Common Issues

### "PR is not merged"

**Problem**: PR was closed without merging
**Solution**: 
- Keep branch if work might be needed later
- Or manually force delete: `git branch -D feature/branch-name`

### "Cannot delete branch"

**Problem**: `git branch -d` fails
**Possible causes**:
- Branch not fully merged locally
- Uncommitted changes
- Wrong branch name

**Solution**:
```bash
# Check merge status
git branch --merged main

# Force delete (only if sure)
git branch -D feature/branch-name
```

### "Pull failed"

**Problem**: `git pull origin main` fails
**Common causes**:
- Uncommitted changes
- Local main diverged from remote
- Network/authentication issue

**Solution**:
```bash
# Stash changes
git stash

# Pull again
git pull origin main

# Restore changes
git stash pop
```

### "Remote branch still exists"

**Problem**: Remote branch wasn't auto-deleted
**Why**: GitHub Actions workflow might have failed
**Solution**:
```bash
# Manually delete remote branch
git push origin --delete feature/branch-name
```

**Note**: This is rare - GitHub Actions should handle it automatically

### "Other branches are outdated"

**Problem**: Other feature branches behind `main`
**Solution**: Update them before starting new work
```bash
git checkout feature/other-branch
git merge main --no-edit -X theirs
git push origin feature/other-branch
```

**See**: `dev-docs/2-areas/patterns/convex-integration.md#L800` for complete pattern

---

## 📝 Quick Reference

**Complete cleanup workflow:**
```bash
# 1. Verify PR is merged
gh pr view --json merged

# 2. Switch to main
git checkout main

# 3. Pull latest
git pull origin main

# 4. Delete local branch
git branch -d feature/SYN-123-description

# 5. Verify remote deleted (should be automatic)
git ls-remote --heads origin feature/SYN-123-description
```

**One-liner (if on feature branch):**
```bash
BRANCH=$(git branch --show-current) && \
git checkout main && \
git pull origin main && \
git branch -d $BRANCH
```

---

**Last Updated**: 2025-01-13  
**Purpose**: Streamline post-merge cleanup workflow following trunk-based deployment principles
