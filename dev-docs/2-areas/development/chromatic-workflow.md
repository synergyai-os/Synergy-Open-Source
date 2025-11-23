# Chromatic Visual Regression Testing Workflow

**Purpose**: Understand how to change UI/components when Chromatic is monitoring visual changes.

---

## 🎯 The Workflow (Step-by-Step)

### Scenario: You're Changing a Button Component

**Step 1: Make Your Changes**

```bash
# Edit the component
src/lib/components/atoms/Button.svelte

# Make changes (e.g., update padding, colors, etc.)
# Use design tokens (not hardcoded values!)
```

**Step 2: Test Locally (Optional)**

```bash
# Run Storybook to see your changes
npm run storybook

# Optionally: Run Chromatic locally to see diffs before pushing
npm run chromatic
```

**Step 3: Commit & Push**

```bash
git add src/lib/components/atoms/Button.svelte
git commit -m "feat(ui): update Button padding and colors"
git push origin feature/my-feature
```

**Step 4: Create Pull Request**

- GitHub Actions automatically runs Chromatic
- Chromatic builds Storybook and compares snapshots
- **Chromatic comments on your PR** with visual diff results

**Step 5: Review Visual Changes**

1. **Click the Chromatic link** in the PR comment
2. **Review each visual diff**:
   - ✅ **Expected changes** (you intended these) → Click "Accept"
   - ❌ **Unexpected changes** (regressions) → Click "Reject" → Fix code → Push

**Step 6: Accept Changes**

- After accepting, Chromatic updates the baseline
- Future builds compare against the new baseline
- PR status updates to ✅ (Chromatic check passes)

**Step 7: Merge PR**

- Once all changes accepted → Merge PR
- Next PR will compare against the new baseline

---

## 🔄 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Make UI Changes                                          │
│    - Edit component files                                    │
│    - Use design tokens (no hardcoded values)                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Test Locally (Optional)                                  │
│    npm run storybook  → Visual check                        │
│    npm run chromatic → See diffs before PR                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Commit & Push                                             │
│    git commit -m "feat(ui): update Button"                 │
│    git push origin feature/my-feature                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. GitHub Actions Runs Chromatic                            │
│    - Builds Storybook                                        │
│    - Takes snapshots of all stories                         │
│    - Compares against baseline                              │
│    - Comments on PR with results                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Review Visual Diffs                                      │
│    - Click Chromatic link in PR comment                     │
│    - Review each change side-by-side                        │
│    - Accept ✅ or Reject ❌                                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Accept Changes → New Baseline                            │
│    - Chromatic updates baseline                             │
│    - PR status: ✅ Chromatic check passes                   │
│    - Ready to merge                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Common Scenarios

### Scenario A: Intentional UI Change

**Example**: Updating Button padding from `px-4` to `px-6`

**Workflow**:
1. Make change → Commit → Push → PR
2. Chromatic detects visual change
3. Review diff → See padding increased ✅
4. **Accept change** → New baseline established
5. Merge PR

**Result**: ✅ Change accepted, baseline updated

---

### Scenario B: Accidental Regression

**Example**: Button text color changed from blue to black (unintended)

**Workflow**:
1. Make change → Commit → Push → PR
2. Chromatic detects visual change
3. Review diff → See color changed ❌ (not intended)
4. **Reject change** → Fix code → Push again
5. Chromatic re-runs → No changes (back to baseline)
6. Merge PR

**Result**: ✅ Regression caught and fixed before merge

---

### Scenario C: Multiple Components Changed

**Example**: Updating design tokens affects 10+ components

**Workflow**:
1. Update design token → Commit → Push → PR
2. Chromatic detects changes in 10+ components
3. Review each diff → All expected ✅
4. **Accept all changes** → New baseline
5. Merge PR

**Result**: ✅ Cascade test passed (all changes intentional)

---

## 🚨 Important Rules

### ✅ DO:

- **Accept expected changes** - If you intended the visual change, accept it
- **Review carefully** - Look at each diff before accepting
- **Test locally first** - Run `npm run chromatic` before pushing (optional)
- **Use design tokens** - Changes should cascade from token updates

### ❌ DON'T:

- **Accept blindly** - Always review what changed
- **Ignore Chromatic** - Visual regressions will block PRs
- **Hardcode values** - Use design tokens (ESLint will catch this)
- **Skip review** - Even if you "know" it's right, verify visually

---

## 🔧 Local Testing Workflow

**Before pushing to PR:**

```bash
# 1. Make your changes
# Edit component files...

# 2. Run Storybook (visual check)
npm run storybook
# Open http://localhost:6006
# Verify changes look correct

# 3. Run Chromatic locally (optional - see diffs)
npm run chromatic
# Review diffs in Chromatic dashboard
# Accept if expected, fix if not

# 4. Push to PR
git push origin feature/my-feature
```

**Why test locally?**
- Catch issues before PR
- Faster feedback loop
- Don't waste CI resources

---

## 📊 Chromatic Dashboard

**Where to Review Changes:**

1. **PR Comment** - Chromatic posts a comment with link
2. **Chromatic Dashboard** - https://www.chromatic.com
3. **Direct Link** - Shown in terminal output

**What You'll See:**

- **Side-by-side comparison** - Old vs New
- **Diff highlighting** - Shows exactly what changed
- **Accept/Reject buttons** - One click to approve
- **Build status** - Pass/Fail indicator

---

## 🎯 Integration with Development Workflow

### Standard PR Workflow:

```bash
# 1. Make changes
# 2. Run tests
npm run lint
npm run check
npm run test:unit:server

# 3. Run Chromatic locally (optional)
npm run chromatic

# 4. Push & create PR
git push origin feature/my-feature

# 5. GitHub Actions runs:
#    - Lint ✅
#    - Type check ✅
#    - Unit tests ✅
#    - Chromatic ✅ (visual regression)

# 6. Review Chromatic diffs
# 7. Accept changes
# 8. Merge PR
```

---

## ⚡ Quick Reference

**Local Testing:**
```bash
npm run storybook      # Visual check
npm run chromatic     # See diffs before PR
```

**CI/CD:**
- Automatically runs on PR
- Comments on PR with results
- Blocks merge if changes not accepted

**Review Changes:**
- Click Chromatic link in PR comment
- Review side-by-side diffs
- Accept ✅ or Reject ❌

**Accept Changes:**
- Updates baseline automatically
- Future builds compare against new baseline
- PR status updates to ✅

---

## 🎓 Best Practices

1. **Small, focused PRs** - Easier to review visual changes
2. **Test locally first** - Catch issues before CI
3. **Review carefully** - Don't accept blindly
4. **Use design tokens** - Changes cascade automatically
5. **Document intentional changes** - Explain in PR description

---

## 📚 Related Documentation

- **Setup Guide**: `CHROMATIC_SETUP.md`
- **Design Tokens**: `dev-docs/2-areas/design/design-tokens.md`
- **Component Architecture**: `dev-docs/2-areas/design/component-architecture.md`

---

**Last Updated**: 2025-11-23  
**Ticket**: SYOS-531

