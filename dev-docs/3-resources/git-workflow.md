# Git Workflow Guide

**Philosophy**: Ship to production constantly through `main` branch. Control exposure with feature flags, not branches.

---

## Branch Strategy

### Main Branch
- **`main`** - Always deployable, auto-deploys to production
- Protected branch (require PR, no force push)
- Merged code goes live within minutes

### Feature Branches
**Naming Convention**: `<type>/<linear-id>-<description>`

**Types**:
- `feature/` - New functionality
- `fix/` - Bug fixes
- `chore/` - Maintenance, refactoring, deps
- `docs/` - Documentation only

**Examples**:
- `feature/SYN-123-notes-editor`
- `fix/SYN-124-emoji-enter-key`
- `chore/SYN-125-update-deps`

### Linear Integration
**Auto-linking**: Include Linear issue ID in branch name or PR title
- Branch: `feature/SYN-123-feature-name`
- PR Title: `feat: add notes editor [SYN-123]`

This automatically links your PR to the Linear issue.

---

## Daily Workflow

### Starting New Work

```bash
# 1. Get latest main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/SYN-123-my-feature

# 3. Make changes, commit often
git add .
git commit -m "feat: add initial structure"

# Keep commits small and focused
git commit -m "feat: add UI component"
git commit -m "feat: integrate with backend"
git commit -m "test: add unit tests"
```

### Commit Message Format
Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `chore:` - Maintenance
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code restructuring

**Examples**:
```bash
git commit -m "feat: add markdown editor component"
git commit -m "fix: emoji picker enter key behavior"
git commit -m "chore: update prosemirror dependencies"
```

### Creating a Pull Request

```bash
# 1. Push your branch
git push -u origin feature/SYN-123-my-feature

# 2. Open PR on GitHub
# - PR template will auto-populate
# - Fill out all sections
# - Request review if needed

# 3. Address feedback
git add .
git commit -m "fix: address review feedback"
git push
```

### Merging to Main

**Before Merge**:
- [ ] All PR checklist items completed
- [ ] Types pass (`npm run check`)
- [ ] Linter passes (`npm run lint`)
- [ ] Feature behind flag (if new functionality)

**Merge Strategy**: Squash and Merge
- Keeps main history clean
- One commit per PR
- Easy to track changes

**After Merge**:
- Branch auto-deleted
- Convex backend auto-deploys (via GitHub Actions)
- Vercel frontend auto-deploys
- Monitor deployment in Vercel dashboard

### Cleaning Up

```bash
# After PR merged, delete local branch
git checkout main
git pull origin main
git branch -d feature/SYN-123-my-feature
```

---

## Feature Flag Workflow

**Rule**: Every new feature MUST be behind a flag until proven stable.

### 1. Create Feature Branch
```bash
git checkout -b feature/SYN-200-new-editor
```

### 2. Implement with Flag
```typescript
// Check flag before showing feature
const showNewEditor = await featureFlags.isEnabled('notes_editor_beta', {
  userId: user._id
});
```

### 3. Merge to Main (Flag OFF)
- Feature is in production code
- But invisible to users
- Safe to deploy

### 4. Progressive Rollout
**Day 1**: Enable for yourself only
```typescript
// In Vercel Edge Config or database
featureFlags.enable('notes_editor_beta', { userIds: ['your-user-id'] })
```

**Day 2-3**: Enable for team
```typescript
featureFlags.enable('notes_editor_beta', { 
  allowedDomains: ['@yourcompany.com'] 
})
```

**Week 1**: Enable for beta users (10%)
```typescript
featureFlags.enable('notes_editor_beta', { rolloutPercentage: 10 })
```

**Week 2**: Gradual increase (25%, 50%, 100%)

### 5. Remove Flag (Week 3+)
Once feature is stable at 100%:
```bash
git checkout -b chore/SYN-201-remove-editor-flag
# Remove flag checks, make feature default
git push
```

---

## Emergency Procedures

### Rollback via Feature Flag
**Fastest**: Disable the flag (< 1 minute)
```typescript
// In Edge Config or admin panel
featureFlags.disable('problematic_feature')
```

### Rollback via Deployment
**If flag can't fix it**:
```bash
# Via Vercel CLI
vercel rollback

# Or via Vercel Dashboard
# Deployments → Previous deployment → Promote to Production
```

### Hot Fix
**Critical bugs in production**:
```bash
# 1. Create fix branch from main
git checkout main
git pull
git checkout -b fix/SYN-999-critical-bug

# 2. Make minimal fix
git commit -m "fix: critical bug in payment flow"

# 3. Push and create PR
git push -u origin fix/SYN-999-critical-bug

# 4. Fast-track review and merge
# 5. Monitor deployment
```

---

## Best Practices

### ✅ DO
- Merge to main daily (or more)
- Keep branches short-lived (< 2 days)
- Put new features behind flags
- Commit often with clear messages
- Delete branches after merge
- Monitor deployments after merge

### ❌ DON'T
- Leave branches open for weeks
- Merge without feature flags (for new features)
- Skip the PR template
- Force push to main
- Merge broken code (types/lint failing)
- Deploy and disappear (stay and monitor)

---

## Troubleshooting

### "My branch is behind main"
```bash
# Update your branch
git checkout feature/SYN-123-my-feature
git rebase main
git push --force-with-lease
```

### "I accidentally committed to main"
```bash
# Don't push! Create a branch
git branch feature/SYN-123-my-work
git reset --hard origin/main
git checkout feature/SYN-123-my-work
```

### "I need to undo my last commit"
```bash
# If not pushed yet
git reset --soft HEAD~1  # Keep changes staged
git reset HEAD~1         # Keep changes unstaged

# If already pushed
git revert HEAD          # Creates new commit undoing last one
```

### "Merge conflict"
```bash
# Update from main
git checkout feature/SYN-123-my-feature
git pull origin main

# Resolve conflicts in files
# Then:
git add .
git commit -m "chore: resolve merge conflicts"
git push
```

---

## Monitoring Deployments

### After Merge to Main

**1. Check GitHub Actions** (1-2 min)
- Navigate to Actions tab
- Verify "Deploy" workflow passed
- Convex backend deployed successfully

**2. Check Vercel Dashboard** (2-3 min)
- Navigate to deployments
- Verify production deployment succeeded
- Check logs for any errors

**3. Test in Production** (5-10 min)
- Visit production URL
- Test your feature (if behind flag)
- Check browser console for errors
- Monitor PostHog for events

**4. Monitor PostHog** (First hour)
- Watch for error rate changes
- Check feature flag evaluation events
- Review session replays if issues

---

## Quick Reference

```bash
# Start new work
git checkout main && git pull
git checkout -b feature/SYN-XXX-description

# Commit changes
git add .
git commit -m "feat: description"

# Push and create PR
git push -u origin feature/SYN-XXX-description

# After merge, clean up
git checkout main && git pull
git branch -d feature/SYN-XXX-description

# Emergency rollback
vercel rollback
```

---

## Further Reading

- [Trunk-Based Development](https://trunkbaseddevelopment.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Feature Flags Best Practices](../2-areas/patterns/feature-flags.md)
- [Deployment Architecture](../2-areas/architecture.md)

