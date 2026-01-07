# Deployment Setup Guide

## Convex Deploy Keys: Production vs Development

### Understanding Deploy Keys

Convex has two types of deploy keys:

1. **Production Deploy Keys** - Used to deploy to your production database
   - Deploys to: `prestigious-whale-251` (Production)
   - Use for: Production deployments from GitHub Actions

2. **Preview/Development Deploy Keys** - Used for preview deployments and development
   - Deploys to: `blissful-lynx-970` (Development)
   - Use for: Testing, preview deployments, CI checks

### Which Deploy Key to Use?

**For Production Deployments (`deploy.yml` workflow):**
- Use the **Production Deploy Key** from Convex Dashboard
- This ensures code deploys to your production database

**For Quality Checks (`quality-gates.yml` workflow):**
- Use the **Development/Preview Deploy Key** 
- Quality checks run against your development database to avoid impacting production

## GitHub Secrets Setup

### Required Secrets

Add these secrets in GitHub: **Settings → Secrets and variables → Actions**

#### 1. `CONVEX_DEPLOY_KEY` (Production)
- **Value**: Your Production Deploy Key from Convex Dashboard
- **Used by**: `deploy.yml` workflow (production deployments)
- **How to get**: Convex Dashboard → Project Settings → Deploy Keys → Production → Show/Copy

#### 2. `CONVEX_DEPLOY_KEY_DEV` (Development - Optional but Recommended)
- **Value**: Your Development/Preview Deploy Key
- **Used by**: `quality-gates.yml` workflow (CI checks)
- **How to get**: Convex Dashboard → Project Settings → Deploy Keys → Preview → Generate if needed

#### 3. `CONVEX_URL` (Production URL)
- **Value**: `https://prestigious-whale-251.convex.cloud`
- **Used by**: Build verification, frontend deployments
- **Purpose**: Tells the build process which Convex deployment to connect to

#### 4. `TEST_CONVEX_URL` (Development URL)
- **Value**: `https://blissful-lynx-970.convex.cloud`
- **Used by**: Quality checks, invariant tests
- **Purpose**: Runs tests against development database

### Additional Secrets (Already Configured)

These should already be set in Vercel, but verify they exist:
- `SYOS_SESSION_SECRET`
- `WORKOS_CLIENT_ID`
- `WORKOS_API_KEY`
- `WORKOS_REDIRECT_URI`

## Verifying Your Deploy Key

To verify your deploy key is correct:

1. **Check in Convex Dashboard:**
   - Go to Project Settings → Deploy Keys
   - Production keys show "Last used" timestamp
   - If you see "SynergyOS-GitHub", that's likely your production key

2. **Test locally:**
```bash
# Test production deploy key
CONVEX_DEPLOY_KEY="your-production-key" npx convex deploy --typecheck disable

# Should deploy to: prestigious-whale-251
```

3. **Check which deployment it targets:**
   - The deploy key is tied to a specific Convex project/deployment
   - Production keys deploy to Production
   - Preview keys deploy to Development

## Workflow Configuration

### `deploy.yml` (Production)
- **Trigger**: Push to `main` branch
- **Deploy Key**: `CONVEX_DEPLOY_KEY` (Production)
- **Target**: Production database (`prestigious-whale-251`)

### `quality-gates.yml` (CI Checks)
- **Trigger**: Pull requests and pushes to `main`
- **Deploy Key**: `CONVEX_DEPLOY_KEY_DEV` (Development) or `CONVEX_DEPLOY_KEY` (fallback)
- **Target**: Development database (`blissful-lynx-970`) for testing

## Troubleshooting

### Issue: "CONVEX_DEPLOY_KEY not found"
- **Solution**: Add `CONVEX_DEPLOY_KEY` secret in GitHub Settings → Secrets → Actions

### Issue: "Deployment failed" or "Authentication failed"
- **Solution**: Verify your deploy key is correct and hasn't been regenerated
- **Check**: Convex Dashboard → Deploy Keys → Check "Last used" timestamp

### Issue: "Wrong deployment targeted"
- **Solution**: Ensure you're using the correct deploy key type (Production vs Preview)
- **Production key** → deploys to Production
- **Preview key** → deploys to Development

### Issue: Quality checks failing with "CONVEX_URL not set"
- **Solution**: Add `TEST_CONVEX_URL` secret with value `https://blissful-lynx-970.convex.cloud`

## Next Steps

1. ✅ Add `CONVEX_DEPLOY_KEY` secret (Production deploy key)
2. ✅ Add `CONVEX_URL` secret (`https://prestigious-whale-251.convex.cloud`)
3. ✅ Add `TEST_CONVEX_URL` secret (`https://blissful-lynx-970.convex.cloud`)
4. ✅ (Optional) Add `CONVEX_DEPLOY_KEY_DEV` for quality checks
5. ✅ Verify workflows pass

