# Linear + GitHub Integration Guide

**Goal**: Automatically link Pull Requests to Linear issues, track what's in production.

---

## Setup Steps

### 1. Connect GitHub to Linear

**In Linear**:

1. Go to **Settings** → **Integrations** → **GitHub**
2. Click **Add GitHub Integration**
3. Authorize Linear to access your GitHub organization
4. Select the `SynergyOS` repository
5. Click **Install**

**Verify**:

- You should see "GitHub integration active" in Linear settings
- Repository should show as connected

---

### 2. Configure Auto-linking

**Linear automatically links PRs when**:

- Branch name includes Linear issue ID: `feature/SYN-123-description`
- PR title includes Linear issue ID: `feat: add feature [SYN-123]`
- PR description mentions issue: `Closes SYN-123`

**Best Practice**: Use branch naming (most reliable)

```bash
git checkout -b feature/SYN-123-my-feature
```

---

### 3. Configure Workflow States

**Linear Issue States** should match your deployment workflow:

1. **Backlog** - Not started
2. **Todo** - Ready to work on
3. **In Progress** - Actively working (branch created)
4. **In Review** - PR open, awaiting review
5. **Merged** - PR merged to main (auto-deploys)
6. **Done** - Verified in production

**Auto-transitions** (configure in Linear):

- PR opened → Move to "In Review"
- PR merged → Move to "Merged"
- Manual verification → Move to "Done"

---

### 4. PR Template Integration

Your `.github/pull_request_template.md` includes:

```markdown
## Linear Issue

Closes: SYN-XXX
```

**How to use**:

1. Create branch: `feature/SYN-123-notes-editor`
2. Push and open PR
3. Fill in template: `Closes: SYN-123`
4. Linear automatically links the PR

**Verify linking**:

- Open Linear issue SYN-123
- Scroll to "Git" section
- Should see PR listed with status

---

## Daily Workflow

### Starting Work

**1. Create Linear Issue**

- Navigate to your team's Linear workspace
- Click **New Issue** (or press `C`)
- Fill in:
  - **Title**: What you're building
  - **Description**: Why and how
  - **Status**: Todo
  - **Priority**: Set appropriately
- Note the issue ID (e.g., `SYN-123`)

**2. Create Branch**

```bash
git checkout main
git pull
git checkout -b feature/SYN-123-short-description
```

**3. Update Linear Status**

- Linear should auto-detect branch creation (if GitHub integration is working)
- Or manually update status to "In Progress"

### During Development

**Commit Regularly**:

```bash
git commit -m "feat: add initial implementation [SYN-123]"
```

**Link Additional Context**:

- In Linear issue, add notes about decisions
- Link to design docs, discussions
- Update status if blocked

### Creating PR

**1. Push Branch**

```bash
git push -u origin feature/SYN-123-short-description
```

**2. Open PR on GitHub**

- Template auto-fills
- Update `Closes: SYN-123` line
- Fill out PR checklist

**3. Linear Auto-Updates**

- Issue moves to "In Review"
- PR link appears in Linear issue
- Commits shown in Linear timeline

### After Merge

**1. Automatic**:

- Issue moves to "Merged"
- Deployment link added to Linear (if Vercel integration enabled)

**2. Manual Verification**:

- Test feature in production
- If working, move to "Done"
- If issues, create new issue and reference original

---

## Advanced: Linear → Cursor Workflow

**Goal**: Create Linear issues directly from Cursor when finding bugs.

### Using Linear MCP (Future)

Once Linear MCP is configured, you can:

```bash
# In Cursor
/linear create "Bug: Emoji picker doesn't close on enter"
  --project SYN
  --priority high
```

This creates a Linear issue and returns the ID for branch naming.

---

## Branch Naming Patterns

### With Linear ID

```bash
# Features
feature/SYN-123-notes-markdown-editor
feature/SYN-124-batch-inbox-actions

# Fixes
fix/SYN-125-emoji-picker-enter-key
fix/SYN-126-sync-error-handling

# Chores
chore/SYN-127-update-prosemirror
chore/SYN-128-refactor-composables
```

### Without Linear ID (Small Tasks)

For tiny tasks that don't need tracking:

```bash
# Small fixes
fix/typo-in-readme
chore/update-deps
docs/update-workflow-guide
```

**But**: Prefer creating Linear issues for everything. Better tracking, better context.

---

## Linear Labels & Projects

### Labels for Feature Flags

Tag issues that are behind feature flags:

- `feature-flag` - Behind flag, not live yet
- `rolled-out` - Flag at 100%, can be removed
- `flag-removed` - Code cleaned up

### Projects for Releases

Track related features:

- **Project**: "Notes 2.0"
  - SYN-123: Markdown editor
  - SYN-124: Syntax highlighting
  - SYN-125: Export functionality

---

## Troubleshooting

### PR Not Linking to Linear

**Check**:

1. Branch name includes issue ID: `SYN-123`
2. PR description includes `Closes SYN-123`
3. GitHub integration is active in Linear
4. Repository is connected

**Manual Link**:
If auto-linking fails, manually add in Linear:

1. Open Linear issue
2. Click **Add Link**
3. Paste PR URL

### Issue Not Auto-Updating Status

**Configure in Linear**:

1. **Settings** → **Integrations** → **GitHub**
2. Check **Workflow automation**
3. Enable:
   - PR opened → In Review
   - PR merged → Merged

### Can't Find Issue ID

**In Linear**:

- Issue ID is in URL: `linear.app/syn/issue/SYN-123`
- Shows in issue breadcrumb: `Team > SYN-123`
- Press `Cmd+K` → search by title

---

## Best Practices

### ✅ DO

- Create Linear issues before coding
- Use Linear ID in branch name
- Update issue with decisions/context
- Move to Done after verification
- Link related issues

### ❌ DON'T

- Skip creating issues ("just a small fix")
- Forget to link PR in template
- Leave issues in "Merged" forever
- Create duplicate issues

---

## Monitoring What's in Production

### Linear View

Create a **Cycle** or **View** for:

- **Status**: Merged + Done
- **Updated**: Last 7 days

This shows what shipped recently.

### Combined with PostHog

Tag PostHog events with Linear issue:

```typescript
posthog.capture('feature_used', {
	feature: 'notes_editor',
	linear_issue: 'SYN-123'
});
```

Query in PostHog to see feature usage linked to Linear issues.

---

## Quick Reference

```bash
# 1. Create Linear issue → Get SYN-XXX

# 2. Create branch
git checkout -b feature/SYN-XXX-description

# 3. Work and commit
git commit -m "feat: description [SYN-XXX]"

# 4. Push and PR
git push -u origin feature/SYN-XXX-description

# 5. In PR description: "Closes: SYN-XXX"

# 6. After merge, verify in production

# 7. Move Linear issue to Done
```

---

## Future Enhancements

### Cursor AI Bugbot

When configured:

1. Cursor detects potential bug
2. Auto-creates Linear issue
3. Returns issue ID
4. You create branch immediately

### Deployment Notifications

Configure Linear to receive Vercel deployment notifications:

- Comment on issue when deployed
- Link to deployment
- Track time from merge to production

---

## Resources

- [Linear GitHub Integration Docs](https://linear.app/docs/github)
- [Git Workflow Guide](./git-workflow.md)
- [Feature Flag Patterns](../2-areas/patterns/feature-flags.md)
