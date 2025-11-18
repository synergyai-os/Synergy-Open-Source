# Post-Deployment Checklist

**Purpose**: Verify Convex database alignment between dev and production after PR merge and deployment.

**When to use**: After running `/pr-close` and GitHub Actions deployment completes (~3-4 minutes after merge).

---

## 🚨 Critical Issue

**Problem**: Dev and production Convex databases can become misaligned after deployment.

**Symptoms**:
- Functions exist in dev but not in production
- Tables exist in dev but not in production
- Errors like: `Could not find public function for 'doc404Tracking:log404'`
- Production logs show function not found errors

**Root Cause**: 
- GitHub Actions deploys Convex automatically, but schema changes may not sync automatically
- Need to verify deployment targeted production (not dev)
- Need to manually verify schema alignment

---

## ✅ Post-Deployment Verification Checklist

### Step 1: Verify GitHub Actions Deployment Succeeded

**Location**: GitHub repository → Actions tab

**Check**:
- [ ] "Deploy to Production" workflow shows ✅ green checkmark
- [ ] "Deploy Convex Backend" job completed successfully
- [ ] No red ❌ errors in workflow logs

**If failed**:
1. Click into failed workflow
2. Check error message
3. Common issues:
   - Missing `CONVEX_DEPLOY_KEY` secret → Add to GitHub Secrets
   - Wrong deploy key (dev instead of prod) → Regenerate production key
   - Schema validation error → Check `convex/schema.ts` for errors

**See**: `.github/workflows/deploy.yml` - Deployment workflow

---

### Step 2: Verify Deployment Targeted Production (Not Dev)

**⚠️ CRITICAL**: GitHub Actions must deploy to **production**, not dev.

**Check GitHub Actions logs**:

1. Open failed/successful workflow run
2. Expand "Deploy Convex Backend" step
3. Look for deployment output:
   ```
   ✓ Deploying to production deployment: prestigious-whale-251
   ```
   OR
   ```
   ⚠️ Deploying to dev deployment: blissful-lynx-970
   ```

**Expected**: Should show production deployment name (e.g., `prestigious-whale-251`)

**If deploying to dev**:

**Problem**: `CONVEX_DEPLOY_KEY` in GitHub Secrets points to dev instead of prod

**Fix**:

1. **Get production deploy key**:
   - Go to: https://dashboard.convex.dev
   - Select **Production** deployment (not dev)
   - Settings → Deploy Keys → Generate new key
   - Copy key (starts with `prod:`)

2. **Update GitHub Secret**:
   - Go to: GitHub repo → Settings → Secrets and variables → Actions
   - Find `CONVEX_DEPLOY_KEY`
   - Click "Update"
   - Paste production key (must start with `prod:`)
   - Save

3. **Redeploy**:
   - Push a new commit to `main` (or manually trigger workflow)
   - Verify deployment targets production

**See**: `dev-docs/2-areas/patterns/convex-integration.md#L750` - Production vs Dev deployment

---

### Step 3: Verify Convex Functions Deployed

**Location**: Convex Dashboard → Production Deployment → Functions tab

**Check**:
- [ ] All new functions appear in Functions list
- [ ] Functions show recent deployment timestamp
- [ ] No errors in Functions tab

**Manual verification** (if needed):

```bash
# List all functions in production
CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex run --help

# Test specific function
CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex run doc404Tracking:log404 '{"url":"test"}'
```

**If function missing**:

1. **Check deployment logs**:
   - Convex Dashboard → Production → Logs
   - Look for deployment errors
   - Check if function was skipped

2. **Verify function is exported**:
   - Check `convex/doc404Tracking.ts` (or relevant file)
   - Ensure function is exported: `export const log404 = mutation({...})`

3. **Redeploy manually**:
   ```bash
   CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex deploy --yes
   ```

---

### Step 4: Verify Schema Alignment (Dev vs Prod)

**⚠️ CRITICAL**: Schema changes may not sync automatically.

**Check tables in production**:

1. **Convex Dashboard**:
   - Go to: Production deployment → Data → Tables
   - List all tables
   - Compare with dev deployment tables

2. **Manual comparison**:

```bash
# Check dev tables (local)
npx convex dev --once --run admin:listTables

# Check prod tables (requires deploy key)
CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex run admin:listTables '{}'
```

**If tables missing in production**:

**Problem**: Schema changes not deployed to production

**Fix**:

1. **Verify schema changes are in `main` branch**:
   ```bash
   git checkout main
   git pull origin main
   cat convex/schema.ts | grep -A 5 "doc404Errors"
   ```

2. **Redeploy schema**:
   ```bash
   # Deploy to production with schema push
   CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex deploy --yes
   ```

3. **Verify in dashboard**:
   - Production → Data → Tables
   - Should see new tables

**See**: `convex/schema.ts` - Schema definition

---

### Step 5: Verify Production Logs (No Errors)

**Location**: Convex Dashboard → Production → Logs

**Check**:
- [ ] No "Could not find public function" errors
- [ ] No schema validation errors
- [ ] Recent successful function calls

**If errors found**:

1. **Identify missing function**:
   - Error: `Could not find public function for 'doc404Tracking:log404'`
   - Function: `doc404Tracking:log404`

2. **Check if function exists**:
   - Production → Functions → Search for `doc404Tracking`
   - If missing → See Step 3

3. **Check if function is public**:
   - Open `convex/doc404Tracking.ts`
   - Verify: `export const log404 = mutation({...})` (not `internalMutation`)

4. **Redeploy if needed**:
   ```bash
   CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex deploy --yes
   ```

---

### Step 6: Test Critical Functions in Production

**Manual testing** (if schema/function changes):

```bash
# Test function exists and works
CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex run doc404Tracking:log404 '{
  "url": "https://example.com/test",
  "referrer": "https://synergyos.ai"
}'

# Should return function result (not error)
```

**If test fails**:

- Function not deployed → See Step 3
- Schema mismatch → See Step 4
- Authentication issue → Check deploy key

---

## 🔧 Manual Schema Alignment (If Needed)

**When**: Steps 1-6 reveal misalignment between dev and prod

### Option A: Redeploy Everything

**If many changes or unsure what's missing**:

```bash
# 1. Ensure you're on main branch with latest code
git checkout main
git pull origin main

# 2. Deploy to production
CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex deploy --yes

# 3. Verify deployment succeeded
# Check Convex Dashboard → Production → Logs
```

### Option B: Deploy Specific Functions

**If only specific functions missing**:

```bash
# Deploy specific module
CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex deploy --yes

# Convex will deploy all functions, but you can verify specific ones
```

### Option C: Schema Push (If Schema Changes)

**If tables missing**:

```bash
# Schema is deployed automatically with functions
# But verify schema.ts is correct:

# 1. Check schema.ts includes new tables
cat convex/schema.ts | grep -A 10 "doc404Errors"

# 2. Redeploy (schema deploys with functions)
CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex deploy --yes

# 3. Verify tables exist
# Convex Dashboard → Production → Data → Tables
```

---

## 📋 Quick Reference Checklist

**After `/pr-close` completes**:

- [ ] **Step 1**: GitHub Actions deployment succeeded ✅
- [ ] **Step 2**: Deployment targeted production (not dev) ✅
- [ ] **Step 3**: Functions deployed to production ✅
- [ ] **Step 4**: Schema aligned (tables match dev) ✅
- [ ] **Step 5**: Production logs show no errors ✅
- [ ] **Step 6**: Critical functions tested ✅

**If any step fails**:

- [ ] Check GitHub Secrets (`CONVEX_DEPLOY_KEY` is production key)
- [ ] Verify `convex/schema.ts` includes all tables
- [ ] Verify functions are exported (not `internalMutation`)
- [ ] Redeploy manually if needed
- [ ] Check Convex Dashboard for deployment errors

---

## 🚨 Common Issues & Solutions

### Issue 1: "Could not find public function" in Production

**Symptom**: Production logs show function not found errors

**Root Causes**:
1. Function not deployed to production
2. Function deployed to dev instead of prod
3. Function is `internalMutation` instead of `mutation`

**Solution**:

```bash
# 1. Verify function is exported as public
cat convex/doc404Tracking.ts | grep "export const log404"

# Should show: export const log404 = mutation({...})
# NOT: export const log404 = internalMutation({...})

# 2. Redeploy to production
CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex deploy --yes

# 3. Verify in dashboard
# Production → Functions → Search for function name
```

**See**: Step 3 above

---

### Issue 2: Tables Missing in Production

**Symptom**: Tables exist in dev but not in production

**Root Causes**:
1. Schema changes not deployed
2. Deployment targeted dev instead of prod
3. Schema validation failed silently

**Solution**:

```bash
# 1. Verify schema.ts includes table
cat convex/schema.ts | grep -A 10 "doc404Errors"

# 2. Redeploy schema (deploys with functions)
CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex deploy --yes

# 3. Verify in dashboard
# Production → Data → Tables → Should see new table
```

**See**: Step 4 above

---

### Issue 3: Deployment Targets Dev Instead of Prod

**Symptom**: GitHub Actions deploys to dev deployment

**Root Cause**: `CONVEX_DEPLOY_KEY` in GitHub Secrets is dev key (starts with `dev:`)

**Solution**:

1. **Get production key**:
   - Convex Dashboard → Production → Settings → Deploy Keys → Generate

2. **Update GitHub Secret**:
   - GitHub → Repo → Settings → Secrets → `CONVEX_DEPLOY_KEY`
   - Update with production key (starts with `prod:`)

3. **Redeploy**:
   - Push new commit or manually trigger workflow
   - Verify deployment targets production

**See**: Step 2 above

---

### Issue 4: Schema Validation Errors

**Symptom**: Deployment fails with schema validation errors

**Root Cause**: Schema changes incompatible with existing data

**Solution**:

1. **Check schema errors**:
   ```bash
   # Test schema locally first
   npx convex dev --once
   ```

2. **Fix schema**:
   - Review `convex/schema.ts`
   - Ensure backward compatibility
   - Use `v.optional()` for new fields

3. **Redeploy**:
   ```bash
   CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex deploy --yes
   ```

**See**: `convex/schema.ts` - Schema definition

---

## 🔗 Related Documentation

- **Deployment Procedures**: `dev-docs/3-resources/deployment/deployment-procedures.md` - Complete deployment guide
- **Convex Integration**: `dev-docs/2-areas/patterns/convex-integration.md#L750` - Production vs Dev deployment
- **GitHub Secrets**: `dev-docs/2-areas/development/github-secrets-setup.md` - Setting up secrets
- **Schema Patterns**: `dev-docs/2-areas/data-models/README.md` - Schema evolution strategy

---

## 📝 Quick Commands Reference

**Verify production deployment**:

```bash
# Check which deployment is active (requires deploy key)
CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex run --help

# List all functions
CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex run --help | grep doc404Tracking

# Test function
CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex run doc404Tracking:log404 '{"url":"test"}'
```

**Redeploy to production**:

```bash
# Full redeploy
CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex deploy --yes

# Verify deployment
# Check Convex Dashboard → Production → Logs
```

**Compare dev vs prod**:

```bash
# Dev tables (local)
npx convex dev --once --run admin:listTables

# Prod tables (requires deploy key)
CONVEX_DEPLOY_KEY="prod:your-deployment|your-key" npx convex run admin:listTables '{}'
```

---

**Last Updated**: 2025-01-13  
**Purpose**: Ensure Convex database alignment between dev and production after deployment

