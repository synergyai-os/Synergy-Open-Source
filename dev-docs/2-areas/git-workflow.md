# Git Workflow Guide

> **Complete guide to working with Git, GitHub, Vercel, and your IDE**

---

## 🎯 Quick Links

- **[Cheat Sheet →](../3-resources/git-cheat-sheet.md)** - Quick reference (keep this open!)
- **[Start Me Guide →](start-me.md)** - Initial setup

---

## Understanding the Three Locations

**Your code lives in three places:**

1. **Local (Your Computer)** - Your IDE (Cursor, VS Code, etc.)
   - Where you write code
   - Changes exist only on your machine until you commit/push

2. **Remote (GitHub)** - The cloud repository
   - Where your team's code lives
   - Changes are shared with others
   - PRs are created here

3. **Deployed (Vercel)** - Production/preview sites
   - Where users see your code
   - Auto-deploys from GitHub

---

## The Complete Workflow

### 1. Starting Work (Create Branch)

**Always create a branch before making changes:**

```bash
# Switch to main first
git checkout main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature/your-feature-name
```

**Why**: Keeps `main` stable. Your changes are isolated.

---

### 2. Making Changes (Local)

**Work in your IDE:**

- Edit files
- Save changes
- Test locally (`npm run dev`)

**Your changes are only local until you commit.**

---

### 3. Committing Changes (Local → Local History)

**Save your work:**

```bash
# See what changed
git status

# Stage changes
git add .

# Commit with message
git commit -m "feat: add new feature"
```

**What happens**: Changes saved to local Git history. Still only on your computer.

---

### 4. Pushing to GitHub (Local → Remote)

**Share your work:**

```bash
# Push branch to GitHub
git push origin feature/your-feature-name
```

**What happens**:

- Branch appears on GitHub
- Others can see your work
- Ready for PR

---

### 5. Creating Pull Request (GitHub)

**Request review:**

1. Go to GitHub → Your repo
2. Click "Compare & pull request" (or create manually)
3. Fill PR description
4. Request review
5. Wait for approval

**What happens**:

- Code is reviewed
- CI checks run (quality gates, link checker)
- Vercel creates preview deployment

---

### 6. Merging PR (GitHub → Main)

**After approval:**

1. Click "Merge pull request"
2. Confirm merge
3. **Branch auto-deletes** (via `.github/workflows/cleanup-merged-branches.yml`)

**What happens**:

- Code merged into `main`
- Vercel deploys to production (after checks pass)
- Branch deleted automatically

---

### 7. After Merge (Cleanup Local)

**Back to your IDE:**

```bash
# Switch to main
git checkout main

# Pull latest (includes your merged changes)
git pull origin main

# Delete local branch (optional cleanup)
git branch -d feature/your-feature-name
```

**Why**: Keeps your local repo clean. Remote branch already deleted.

---

## Common Scenarios

### Scenario 1: "I merged a PR, but my local branch still exists"

**This is normal!**

- Remote branch: Deleted automatically ✅
- Local branch: Still exists (you delete manually)

**Fix**:

```bash
git checkout main
git pull origin main
git branch -d feature/old-branch-name
```

---

### Scenario 2: "I made changes but haven't committed yet"

**Check status**:

```bash
git status
```

**Options**:

- **Commit**: `git add . && git commit -m "message"`
- **Discard**: `git restore .` (⚠️ loses changes!)
- **Stash**: `git stash` (saves for later)

---

### Scenario 3: "I'm on the wrong branch"

**Check current branch**:

```bash
git branch
# * shows current branch
```

**Switch**:

```bash
git checkout main
# or
git checkout feature/other-branch
```

---

### Scenario 4: "My changes aren't showing up"

**Check where you are**:

1. Look at IDE status bar → Shows current branch
2. Changes go to current branch, not `main`
3. If on old branch → Switch to `main` first

**Fix**:

```bash
git checkout main
git pull origin main
# Now make changes
```

---

## Branch Naming Conventions

**Use descriptive names:**

- ✅ `feature/add-user-auth`
- ✅ `fix/broken-links`
- ✅ `docs/update-readme`
- ❌ `test`
- ❌ `changes`
- ❌ `fix`

**Why**: Clear purpose. Easy to find later.

---

## Protected Branches

**Never push directly to these:**

- `main` - Production code
- `master` - Legacy main
- `develop` - Development branch (if exists)

**Always use PR workflow**:

1. Create feature branch
2. Make changes
3. Push branch
4. Create PR
5. Get review
6. Merge

---

## Vercel Integration

### Preview Deployments

**What**: Every PR gets a preview URL

**When**:

- Created automatically on push
- Updates on every new commit

**Where**:

- Vercel Dashboard → Deployments
- PR page shows preview link

### Production Deployments

**What**: Live site at `www.synergyos.ai`

**When**:

- After PR merged to `main`
- After quality checks pass (via Deployment Checks)

**Flow**:

```
Merge PR → GitHub Actions runs checks → Vercel receives check status →
If checks pass → Production deploys → If checks fail → Deployment blocked
```

---

## IDE Integration (Cursor/VS Code)

### Status Bar Shows:

- **Branch name**: Current branch
- **Sync icon**: Changes not pushed
- **Asterisk (\*)**: Uncommitted changes

### Common Actions:

- **Commit**: Source Control panel → Stage → Commit
- **Push**: Click sync icon or `git push`
- **Switch branch**: Click branch name → Select branch

---

## Troubleshooting

### "Branch not found"

**Cause**: Branch deleted on GitHub but still exists locally

**Fix**: Delete local branch

```bash
git branch -d branch-name
```

---

### "Your branch is behind"

**Cause**: `main` has new commits you don't have

**Fix**: Pull latest

```bash
git checkout main
git pull origin main
```

---

### "Merge conflict"

**Cause**: You and someone else changed same lines

**Fix**:

1. Pull latest: `git pull origin main`
2. Resolve conflicts in IDE
3. Commit resolution
4. Push

---

## Best Practices

1. **Always pull before starting work**

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create branch for each feature**
   - Never work directly on `main`
   - One branch = one feature

3. **Commit often**
   - Small, logical commits
   - Clear commit messages

4. **Push before creating PR**
   - Ensures code is on GitHub
   - Enables CI checks

5. **Clean up after merge**
   - Switch to `main`
   - Pull latest
   - Delete local branch

---

## Related Resources

- **[Git Cheat Sheet](../3-resources/git-cheat-sheet.md)** - Quick reference
- **[Deployment Procedures](../3-resources/deployment-procedures.md)** - CI/CD details
- **[Start Me Guide](start-me.md)** - Initial setup

---

**Last Updated**: 2025-01-XX
