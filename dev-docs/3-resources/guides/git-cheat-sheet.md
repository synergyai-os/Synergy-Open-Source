# Git Workflow Cheat Sheet

> **Quick reference - keep this open while working**

---

## 🚀 Daily Workflow

### Start Work

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### Save Work

```bash
git add .
git commit -m "feat: description"
git push origin feature/your-feature-name
```

### After Merge

```bash
git checkout main
git pull origin main
git branch -d feature/old-branch-name
```

---

## 📍 Where Am I?

**Check current branch:**

```bash
git branch
# * shows current branch
```

**Check status:**

```bash
git status
```

**IDE status bar** → Shows branch name + sync status

---

## 🔄 Common Commands

### Switch Branch

```bash
git checkout main
git checkout feature/branch-name
```

### Pull Latest

```bash
git pull origin main
```

### Push Changes

```bash
git push origin feature/branch-name
```

### Discard Changes

```bash
git restore .  # ⚠️ Loses all uncommitted changes!
```

---

## 🎯 Three Locations

| Location     | What It Is        | When Changes Happen      |
| ------------ | ----------------- | ------------------------ |
| **Local**    | Your IDE/computer | You edit files           |
| **Remote**   | GitHub            | You push/merge PR        |
| **Deployed** | Vercel            | Auto-deploys from GitHub |

**Remember**: Changes go to current branch, not `main`!

---

## ⚠️ Common Mistakes

### "I'm on wrong branch"

```bash
git checkout main  # Switch first!
```

### "Changes not showing"

- Check IDE status bar → Branch name
- Changes go to current branch
- Switch to `main` before starting new work

### "Branch deleted on GitHub"

- Normal after merge
- Delete local: `git branch -d branch-name`

---

## 🔗 Quick Links

- **[Full Guide →](../2-areas/git-workflow.md)** - Detailed explanation
- **[Start Me →](../2-areas/start-me.md)** - Initial setup

---

**Print this page** - Keep it handy! 📄
