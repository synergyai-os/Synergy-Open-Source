# Deployment Procedures

**Philosophy**: Deploy constantly to production. Feature flags control exposure. Monitor everything.

---

## Deployment Architecture

### Automatic Deployments

**When**: Push to `main` branch
**How**: GitHub Actions + Vercel (with Deployment Checks)

**Flow**:

```
Push to main
    ↓
GitHub Actions triggered
    ↓
1. Deploy Convex backend (< 1 min)
    ↓
2. Quality checks run (types, lint, build)
    ↓
3. If checks pass → Notify Vercel
    ↓
4. Vercel Deployment Check passes → Promote to production (2-3 min)
    ↓
Production updated (total: 3-4 min)
```

**Preview Deployments** (PR branches):

- Vercel auto-deploys previews on every push (immediate feedback)
- Previews are free/cheap (Vercel free tier: unlimited)
- **Trade-off**: Previews deploy even if checks fail (acceptable cost for fast iteration)
- Production only deploys after checks pass (via Deployment Checks)

### Deployment Checks (Production Only)

**Purpose**: Prevent production deployments if quality checks fail

**Configuration Steps**:

1. Vercel Dashboard → Project → Settings → **Build and Deployment** (in sidebar)
2. Click **"Deployment Checks"** section
3. Click **"+ Add Checks"** button
4. Select **"Import from GitHub"** → Choose **"GitHub"**
5. You'll see two options:

   **Option A: Connect GitHub Actions (Use This One)**
   - Modal shows "Send workflow updates to Vercel"
   - In **"Check Name"** field, enter: `Quality Checks` (exact match required)
   - This matches the name in `.github/workflows/quality-gates.yml` line 60
   - The workflow already has the notification snippet configured
   - Click Save/Add
   - ✅ **This is all you need!** You don't need to use "Select checks to add"

   **Option B: Select checks to add (Not Needed)**
   - Shows "No configured checks found" - this is normal
   - Checks will automatically appear after the next commit to `main` triggers the workflow
   - You can ignore this section - Option A is sufficient

6. After adding, the check will appear in Deployment Checks list after next commit to `main`

**How It Works**:

1. When code is pushed to `main`, GitHub Actions workflow runs quality checks
2. On success/failure, notifies Vercel via `repository_dispatch` with check name "Quality Checks"
3. Vercel receives the check status and blocks production promotion if failed
4. Production deployment only proceeds when "Quality Checks" passes
5. The check will appear in Vercel's Deployment Checks list automatically after first run

**Result**: Production deployments only happen after:

- ✅ Type checks pass
- ✅ Linter passes
- ✅ Build succeeds
- ✅ Convex backend deployed

**Test Status**: ✅ Verified working (2025-11-11)
- Tested by temporarily disabling `continue-on-error` on lint step
- Production deployment correctly blocked when checks failed
- Preview deployments not blocked (as designed)

### No Manual Steps

**Everything is automated**:

- No SSH into servers
- No manual database migrations
- No configuration file updates
- **No manual branch deletion** - Merged branches auto-delete (`.github/workflows/cleanup-merged-branches.yml`)
- Just merge → monitor

### Automatic Branch Cleanup

**When**: PR is merged to `main`  
**How**: GitHub Actions workflow (`.github/workflows/cleanup-merged-branches.yml`)

**What happens**:

1. PR merged → Workflow triggers
2. Checks if branch is protected (main, master, develop) → Skips if protected
3. Deletes the merged branch automatically
4. No manual cleanup needed

**Protected branches** (never auto-deleted):

- `main`
- `master`
- `develop`

**Benefits**:

- ✅ Reduces manual work
- ✅ Keeps repository clean
- ✅ Prevents branch clutter
- ✅ Safe (skips protected branches)

---

## Pre-Deployment Checklist

### Before Merging PR

**Required**:

- [ ] Types pass (`npm run check`)
- [ ] Linter passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] PR checklist completed

**For New Features**:

- [ ] Feature behind flag
- [ ] Flag defaults to `false`
- [ ] Error boundary wraps component
- [ ] PostHog events added

**Optional** (recommended):

- [ ] Tested locally
- [ ] Reviewed by teammate
- [ ] Breaking changes documented

### After Merge

**Automatic**:

- ✅ GitHub Actions deploy Convex
- ✅ Vercel deploys frontend
- ✅ Both complete in ~4 minutes

**Manual**:

- [ ] Verify deployment succeeded (check Vercel dashboard)
- [ ] Monitor for errors (PostHog dashboard)
- [ ] Test critical paths in production

---

## Monitoring Deployments

### GitHub Actions

**Location**: GitHub repository → Actions tab (https://github.com/synergyai-os/Synergy-Open-Source)

**What to watch**:

1. **Deploy to Production** workflow
   - Should complete in < 2 minutes
   - Green checkmark = success
   - Red X = failed deployment

**If Failed**:

1. Click into failed workflow
2. Read error message
3. Common issues:
   - Missing `CONVEX_DEPLOY_KEY` secret
   - Convex schema validation error
   - npm install failure

### Vercel Dashboard

**Location**: https://vercel.com/dashboard

**What to watch**:

1. **Latest Deployment**
   - Should show "Ready" in ~3 minutes
   - Click for build logs
2. **Production URL**
   - Visit site, verify it loads
   - Check browser console for errors

**If Failed**:

1. Click "View Function Logs"
2. Look for build errors
3. Common issues:
   - Missing environment variables
   - Import errors
   - Build timeout

### PostHog Real-time

**Location**: Your PostHog dashboard

**What to watch**:

1. **Error Rate** (first 15 minutes)
   - Should remain stable
   - Spike = potential issue
2. **Page Views**
   - Should show recent activity
   - No activity = site might be down
3. **Recent Events**
   - Look for `error_occurred` events
   - Check if related to your changes

---

## Rollback Procedures

### Level 1: Feature Flag Rollback (< 1 minute)

**When**: Feature is broken but app still works

**Steps**:

```typescript
// 1. Identify problematic flag from PostHog
// Errors show: feature_flag = "notes_editor_beta"

// 2. Disable flag (Convex function runner)
await toggleFlag({
	flag: 'notes_editor_beta',
	enabled: false
});

// 3. Verify error rate drops (PostHog)
// Should drop within 30 seconds
```

**Effect**: Users immediately get old (working) version

### Level 2: Deployment Rollback (< 5 minutes)

**When**: Multiple features broken or app not loading

**Via Vercel Dashboard**:

```
1. Go to Vercel dashboard
2. Click "Deployments"
3. Find previous working deployment
4. Click "..." menu → "Promote to Production"
5. Confirm
```

**Via Vercel CLI**:

```bash
# Install Vercel CLI if not already
npm i -g vercel

# Rollback to previous deployment
vercel rollback
```

**Effect**: Entire frontend rolls back (including Convex URL if changed)

### Level 3: Emergency Fix (< 15 minutes)

**When**: Rollback doesn't fix it, need hot fix

**Steps**:

```bash
# 1. Create fix branch from main
git checkout main
git pull
git checkout -b fix/critical-bug

# 2. Make minimal fix
# Edit only what's necessary

# 3. Commit and push
git add .
git commit -m "fix: critical production bug"
git push -u origin fix/critical-bug

# 4. Create PR, request fast-track review
# Get approval ASAP

# 5. Merge to main
# Deployment starts automatically

# 6. Monitor deployment (3-4 min)
```

**Effect**: Fix deploys to production, issue resolved

---

## Progressive Feature Rollout

### Rolling Out a Feature

**Day 0**: Code merged, flag disabled

```typescript
// Feature is in production but invisible
await upsertFlag({
	flag: 'notes_editor_beta',
	enabled: false
});
```

**Day 1**: Enable for yourself

```typescript
await upsertFlag({
	flag: 'notes_editor_beta',
	enabled: true,
	allowedUserIds: ['your-user-id']
});

// Test for 1+ hours
// Monitor PostHog for errors
```

**Day 2-3**: Enable for team

```typescript
await upsertFlag({
	flag: 'notes_editor_beta',
	enabled: true,
	allowedDomains: ['@yourcompany.com']
});

// Team tests for 1-2 days
// Gather feedback
```

**Week 1**: Percentage rollout begins

```typescript
// Day 1: 5%
await updateRollout({ flag: 'notes_editor_beta', percentage: 5 });
// Monitor for 24h

// Day 2: 10%
await updateRollout({ flag: 'notes_editor_beta', percentage: 10 });
// Monitor for 24h

// Day 3: 25%
await updateRollout({ flag: 'notes_editor_beta', percentage: 25 });
// Monitor for 24h

// Day 4: 50%
await updateRollout({ flag: 'notes_editor_beta', percentage: 50 });
// Monitor for 24h

// Day 5: 100%
await updateRollout({ flag: 'notes_editor_beta', percentage: 100 });
// Monitor for 48h
```

**Week 2-3**: Stability period

- Feature at 100%
- Monitor for issues
- If stable for 2 weeks, schedule flag removal

**Week 4**: Remove flag

```bash
# Create cleanup PR
git checkout -b chore/remove-editor-flag

# Remove flag checks
# Make new code default
# Delete old code

# Merge to main
```

---

## Production Debugging

### High Error Rate

**PostHog Investigation**:

```
1. Filter events by: error_occurred
2. Group by: feature_flag
3. Look for spike in specific flag
```

**Action**:

```typescript
// Disable problematic flag
await toggleFlag({ flag: 'problematic_feature', enabled: false });
```

### Site Not Loading

**Check Vercel**:

1. Dashboard → Latest deployment
2. Status should be "Ready"
3. If "Error", click for logs

**Check Convex**:

1. Convex dashboard
2. Logs tab
3. Look for errors

**Emergency Fix**:

```bash
# If frontend issue
vercel rollback

# If backend issue
# Investigate Convex logs, fix, redeploy
```

### Performance Degradation

**PostHog Investigation**:

```
1. Filter events by: performance_metric
2. Look for: duration_ms increasing
3. Identify: which operations are slow
```

**Action**:

```typescript
// If related to feature flag
await toggleFlag({ flag: 'slow_feature', enabled: false });

// Otherwise, investigate and fix
```

---

## Environment Variables

### Required Secrets

**GitHub Secrets** (for Actions):

- `CONVEX_DEPLOY_KEY` - Convex production deploy key

**Vercel Environment Variables**:

- `CONVEX_DEPLOYMENT` - Convex production URL (auto-set)
- `POSTHOG_API_KEY` - PostHog production project key
- `VITE_CONVEX_URL` - Public Convex URL (for client)

### Setting Secrets

**GitHub**:

```
1. Repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: CONVEX_DEPLOY_KEY
4. Value: [from Convex dashboard]
5. Save
```

**Vercel**:

```
1. Project → Settings → Environment Variables
2. Add variables for "Production" environment
3. Save
4. Redeploy for changes to take effect
```

---

## Deployment Frequency

### Target Metrics

**Ideal**:

- Deploy to production: 2-5 times per day
- Merge to main: Multiple developers daily
- Time to production: < 5 minutes from merge
- Rollback time: < 1 minute (via flags) or < 5 minutes (via deployment)

**Current**:

- Track your actual metrics
- Improve over time
- Don't force it - quality over speed

---

## Best Practices

### ✅ DO

**Deploy Small Changes**:

```
Better: 10 small deploys per day
Worse: 1 giant deploy per week
```

**Monitor Every Deployment**:

```
1. Check GitHub Actions - passed?
2. Check Vercel - deployed?
3. Check PostHog - errors?
4. Test in production - works?
```

**Use Feature Flags**:

```
Every new feature behind flag
Deploy code hidden
Enable progressively
```

**Stay and Monitor**:

```
Don't deploy and leave
Watch for 15-30 minutes
Check PostHog dashboard
Be ready to rollback
```

### ❌ DON'T

**Don't Deploy and Disappear**:

```
Bad: Merge PR, go to lunch
Good: Merge PR, monitor for 30 min
```

**Don't Skip Monitoring**:

```
Bad: Assume it worked
Good: Verify in dashboard
```

**Don't Deploy Fridays** (initially):

```
Bad: Deploy risky feature Friday 5pm
Good: Deploy Tuesday morning
Reason: More time to fix issues
```

**Don't Panic on Errors**:

```
1. Check PostHog - how bad?
2. Feature flag? Disable it
3. Deployment issue? Rollback
4. Can wait? Fix and redeploy
```

---

## Troubleshooting

### Deployment Stuck

**Symptoms**: Vercel shows "Building" for > 10 minutes

**Actions**:

1. Check build logs in Vercel
2. Look for hanging process
3. Cancel and retry deployment

### GitHub Actions Failing

**Common Issues**:

**Missing Secret**:

```
Error: CONVEX_DEPLOY_KEY not found
Fix: Add secret in repo settings
```

**npm install fails**:

```
Error: Cannot find module 'X'
Fix: Check package.json, run npm install locally
```

**Convex deploy fails**:

```
Error: Schema validation failed
Fix: Check schema changes, fix locally, push
```

### Site Loads But Features Broken

**Likely**: Feature flag issue, not deployment issue

**Check**:

1. PostHog → Recent errors
2. Identify feature flag
3. Disable flag
4. Investigate and fix

---

## Quick Reference

### Monitor Deployment

```
1. GitHub Actions - backend deployed?
2. Vercel dashboard - frontend deployed?
3. PostHog - errors spiking?
4. Production site - loads correctly?
```

### Rollback Feature

```typescript
await toggleFlag({ flag: 'feature_name', enabled: false });
```

### Rollback Deployment

```bash
vercel rollback
```

### Emergency Fix

```bash
git checkout -b fix/critical
# Fix bug
git commit -m "fix: critical bug"
git push
# Create PR, merge ASAP
```

---

## Further Reading

- [Git Workflow Guide](./git-workflow.md)
- [Feature Flags Pattern](../2-areas/patterns/feature-flags.md)
- [Error Handling & Monitoring](./error-handling-monitoring.md)
