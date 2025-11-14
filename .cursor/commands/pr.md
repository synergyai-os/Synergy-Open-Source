# pr

**Purpose**: Create Pull Requests for features or CI testing following trunk-based deployment workflow.

---

## 🚨 Prerequisites

**Before creating a PR:**

1. **Git status**: Ensure you're on a feature branch (not `main`)
2. **GitHub CLI**: `gh` must be installed and authenticated (`gh auth status`)
3. **Linear ticket**: For feature PRs, you need a Linear ticket ID (e.g., `SYOS-123`)
4. **Committed changes**: All work should be committed to your branch

**Check prerequisites:**

```bash
# Check git status
git status

# Check GitHub CLI
gh auth status

# Check current branch
git branch --show-current
```

---

## 📋 Two PR Types

### 1. Regular PR (Feature/Bug Work)

**Use for**: Features, bug fixes, refactoring, documentation
**Requires**: Linear ticket ID
**Branch naming**: `feature/SYN-123-description` or `fix/SYN-123-description`

### 2. Test PR (CI Verification)

**Use for**: Testing CI workflows, verifying GitHub Actions
**Requires**: No Linear ticket needed
**Branch naming**: `test/ci-workflow-verification` or `test/[description]`

---

## 🔄 Workflow: Regular PR (Feature/Bug)

### Step 1: Verify Branch Status

**Check if you're on a feature branch:**

```bash
git branch --show-current
# Should be: feature/SYN-123-description or fix/SYN-123-description
```

**If on `main`:**

```bash
# Create feature branch from Linear ticket
git checkout -b feature/SYN-123-short-description
```

**Branch naming conventions:**

- `feature/SYN-123-description` - New features
- `fix/SYN-123-description` - Bug fixes
- `docs/SYN-123-description` - Documentation
- `refactor/SYN-123-description` - Code refactoring

**See**: `dev-docs/3-resources/guides/linear-github-integration.md` for complete branch naming guide

---

### Step 2: Ensure Changes Are Committed

**Check for uncommitted changes:**

```bash
git status
```

**If uncommitted changes exist:**

```bash
# Review changes
git diff

# Stage and commit
git add .
git commit -m "feat: [description] [SYN-123]"
```

**Commit message format**: See `dev-docs/2-areas/development/commit-message-format.md`

---

### Step 3: Push Branch to GitHub

**Push your branch:**

```bash
git push -u origin feature/SYN-123-description
```

**If branch already exists remotely:**

```bash
git push
```

---

### Step 4: Create PR with Template

**Using GitHub CLI:**

```bash
gh pr create \
  --title "feat: [Description] [SYN-123]" \
  --body-file .github/pull_request_template.md \
  --base main
```

**Manual PR creation:**

1. Go to: https://github.com/synergyai-os/Synergy-Open-Source/pull/new/[branch-name]
2. PR template auto-fills
3. Update `Closes: SYN-123` line
4. Fill out checklist
5. Click "Create Pull Request"

---

### Step 5: Update PR Description

**Required updates to template:**

1. **What Changed**: Brief description
2. **Why**: Problem being solved
3. **Type of Change**: Check appropriate box
4. **Linear Issue**: Update `Closes: SYN-123` line
5. **Checklist**: Verify all items checked

**Feature Flag Checklist** (if applicable):

- [ ] Feature flag created in `src/lib/featureFlags.ts`
- [ ] Feature flag added to Convex schema
- [ ] Feature flag gated in UI/backend
- [ ] Feature flag documented

**See**: `dev-docs/2-areas/patterns/feature-flags.md` for feature flag patterns

---

### Step 6: Verify CI Runs

**After creating PR:**

1. Go to PR page on GitHub
2. Check "Checks" tab
3. Verify "Quality Checks" workflow runs:
   - ✅ Type check
   - ✅ Lint
   - ✅ Build verification
   - ✅ Secret scan

**If CI fails:**

- Review error messages
- Fix issues locally
- Push fixes: `git push`
- CI re-runs automatically

---

### Step 7: Linear Auto-Linking

**Linear automatically links PR when:**

- Branch name includes Linear ID: `feature/SYN-123-description`
- PR title includes Linear ID: `feat: add feature [SYN-123]`
- PR description mentions: `Closes SYN-123`

**Verify linking:**

1. Open Linear issue SYN-123
2. Scroll to "Git" section
3. PR should appear with status

**See**: `dev-docs/3-resources/guides/linear-github-integration.md` for complete integration guide

---

## 🧪 Workflow: Test PR (CI Verification)

### Step 1: Create Test Branch

**From `main`:**

```bash
git checkout main
git pull origin main
git checkout -b test/ci-workflow-verification
```

**Branch naming**: `test/[description]` (e.g., `test/ci-workflow-verification`)

---

### Step 2: Add Test Commit

**Create a simple test file:**

```bash
echo "# CI Workflow Test

Testing GitHub Actions workflows:
- Quality Gates (build verification)
- Secrets configuration

This is a test PR - will be closed after verification." > .ci-test.md

git add .ci-test.md
git commit -m "test: verify CI workflow with test PR"
```

---

### Step 3: Push and Create PR

**Push branch:**

```bash
git push -u origin test/ci-workflow-verification
```

**Create PR:**

```bash
gh pr create \
  --title "test: Verify CI workflow" \
  --body "Testing GitHub Actions workflows to verify:
- ✅ Quality Gates (build verification)
- ✅ Secrets configuration
- ✅ CI triggers correctly

This is a test PR - will be closed after verification." \
  --base main
```

---

### Step 4: Verify CI Runs

**Check PR page:**

1. Go to PR on GitHub
2. Check "Checks" tab
3. Verify all workflows pass:
   - ✅ Quality Checks
   - ✅ Build succeeds
   - ✅ No secret errors

---

### Step 5: Clean Up After Testing

**After verifying CI works:**

```bash
# Close PR (don't merge test PRs)
gh pr close [PR-number]

# Delete branch locally
git checkout main
git branch -d test/ci-workflow-verification

# Delete remote branch
git push origin --delete test/ci-workflow-verification

# Remove test file (if kept)
rm .ci-test.md
```

---

## 📝 PR Template Reference

**Location**: `.github/pull_request_template.md`

**Template includes:**

- What Changed / Why
- Type of Change checklist
- Testing checklist
- Code quality checklist
- Related Issues section

**For feature flags**, add to PR description:

```markdown
## Feature Flags

- [ ] Feature flag created: `FEATURE_NAME`
- [ ] Feature flag gated in UI/backend
- [ ] Feature flag documented
```

**See**: `.github/pull_request_template.md` for complete template

---

## ✅ Post-PR Checklist

**After creating PR:**

- [ ] PR title follows convention: `feat: [description] [SYN-123]`
- [ ] PR description filled out completely
- [ ] Linear issue linked (`Closes: SYN-123`)
- [ ] All checklist items verified
- [ ] CI checks passing
- [ ] Linear issue status updated to "In Review"

**After merge:**

- [ ] PR merged to `main`
- [ ] Convex backend auto-deploys (via `deploy.yml`)
- [ ] Vercel frontend auto-deploys
- [ ] Linear issue moves to "Merged"
- [ ] Feature flag enabled (if applicable)
- [ ] Verify in production

---

## 🔗 Related Documentation

- **Git Workflow**: `dev-docs/3-resources/guides/linear-github-integration.md` - Complete git workflow guide
- **Branch Naming**: `dev-docs/3-resources/guides/linear-github-integration.md` - Branch naming conventions
- **PR Template**: `.github/pull_request_template.md` - PR template with checklists
- **Commit Format**: `dev-docs/2-areas/development/commit-message-format.md` - Commit message format
- **Feature Flags**: `dev-docs/2-areas/patterns/feature-flags.md` - Feature flag patterns
- **Deployment**: `dev-docs/3-resources/deployment/trunk-based-deployment-implementation-summary.md` - Deployment workflow
- **Linear Integration**: `dev-docs/3-resources/guides/linear-github-integration.md` - Linear + GitHub integration

---

## 🚨 Common Issues

### PR Template Not Auto-Filling

**Problem**: GitHub doesn't auto-fill template
**Solution**: Copy template manually from `.github/pull_request_template.md`

### Linear Not Linking

**Problem**: PR doesn't appear in Linear issue
**Solution**:

- Verify branch name includes Linear ID: `feature/SYN-123-description`
- Check PR description includes `Closes: SYN-123`
- Verify GitHub integration in Linear Settings

### CI Failing

**Problem**: Quality checks fail
**Solution**:

- Review error messages in PR "Checks" tab
- Fix issues locally
- Push fixes: `git push`
- CI re-runs automatically

### Branch Outdated

**Problem**: Branch is behind `main`
**Solution**:

```bash
git checkout main
git pull origin main
git checkout feature/SYN-123-description
git merge main
# Resolve conflicts if any
git push
```

---

**Last Updated**: 2025-01-13  
**Purpose**: Streamline PR creation workflow following trunk-based deployment principles
