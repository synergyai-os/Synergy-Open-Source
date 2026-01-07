# GitHub Secrets Setup - Quick Reference

## Step-by-Step: Adding Required Secrets

### 1. Go to GitHub Secrets

Navigate to: **Your Repository → Settings → Secrets and variables → Actions**

### 2. Add Required Secrets

Click **"New repository secret"** for each:

#### ✅ `CONVEX_DEPLOY_KEY` (REQUIRED)

- **Name**: `CONVEX_DEPLOY_KEY`
- **Value**: Your **Production Deploy Key** from Convex Dashboard
- **How to get**:
  1. Go to [Convex Dashboard](https://dashboard.convex.dev)
  2. Select your project (Production: `prestigious-whale-251`)
  3. Go to **Settings → Deploy Keys → Production Deploy Keys**
  4. Find "SynergyOS-GitHub" or click "Show" next to your production key
  5. Copy the entire key (it's a long string)

#### ✅ `CONVEX_URL` (REQUIRED)

- **Name**: `CONVEX_URL`
- **Value**: `https://prestigious-whale-251.convex.cloud`
- **Purpose**: Production Convex deployment URL

#### ✅ `TEST_CONVEX_URL` (REQUIRED)

- **Name**: `TEST_CONVEX_URL`
- **Value**: `https://blissful-lynx-970.convex.cloud`
- **Purpose**: Development Convex deployment URL for CI tests

#### ⚠️ `CONVEX_DEPLOY_KEY_DEV` (OPTIONAL but Recommended)

- **Name**: `CONVEX_DEPLOY_KEY_DEV`
- **Value**: Your **Preview Deploy Key** from Convex Dashboard
- **How to get**:
  1. Go to Convex Dashboard
  2. Select your project
  3. Go to **Settings → Deploy Keys → Preview Deploy Keys**
  4. If none exists, click **"+ Generate Preview Deploy Key"**
  5. Copy the key
- **Purpose**: Used for quality checks (runs against dev database)

### 3. Verify Secrets Are Set

After adding secrets, verify they appear in the secrets list:

- ✅ `CONVEX_DEPLOY_KEY`
- ✅ `CONVEX_URL`
- ✅ `TEST_CONVEX_URL`
- ✅ `CONVEX_DEPLOY_KEY_DEV` (optional)

## Verifying Your Deploy Key

### Check if your Production Deploy Key is correct:

1. **In Convex Dashboard:**
   - Settings → Deploy Keys → Production Deploy Keys
   - Look for "SynergyOS-GitHub" (if that's what you named it)
   - Check "Last used" timestamp - should update after successful deployment

2. **Test locally** (optional):

```bash
# Set your production deploy key
export CONVEX_DEPLOY_KEY="your-production-key-here"

# Try deploying (this will deploy to production!)
npx convex deploy --typecheck disable

# Should succeed and deploy to: prestigious-whale-251
```

## Which Deploy Key Should You Use?

### For Production Deployments (`deploy.yml`)

- ✅ Use **Production Deploy Key**
- Deploys to: `prestigious-whale-251`
- This is what triggers when you push to `main`

### For Quality Checks (`quality-gates.yml`)

- ✅ Prefer **Preview Deploy Key** (`CONVEX_DEPLOY_KEY_DEV`)
- Falls back to Production key if dev key not set
- Runs tests against: `blissful-lynx-970` (development)

## Troubleshooting

### "CONVEX_DEPLOY_KEY not found" error

- ✅ Make sure secret name is exactly `CONVEX_DEPLOY_KEY` (case-sensitive)
- ✅ Check you're in the correct repository
- ✅ Verify secret was saved (refresh the secrets page)

### "Authentication failed" or "Invalid deploy key"

- ✅ Verify you copied the entire key (no extra spaces, no line breaks)
- ✅ Check if the key was regenerated in Convex Dashboard
- ✅ Ensure you're using the Production key for production deployments

### "CONVEX_URL not set" in quality checks

- ✅ Add `TEST_CONVEX_URL` secret with value `https://blissful-lynx-970.convex.cloud`

## Next Steps

After adding secrets:

1. ✅ Push a commit to trigger workflows
2. ✅ Check GitHub Actions tab for workflow runs
3. ✅ Verify `deploy.yml` succeeds (deploys to production)
4. ✅ Verify `quality-gates.yml` succeeds (runs checks against dev)
