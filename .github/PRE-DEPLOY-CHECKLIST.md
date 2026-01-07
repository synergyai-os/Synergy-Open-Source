# Pre-Deploy Checklist

## ✅ Before Pushing to Main

### 1. Verify All Required Secrets Are Set

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

Check that these secrets exist:

- [ ] `CONVEX_DEPLOY_KEY` (REQUIRED - Production deploy key)
- [ ] `TEST_CONVEX_URL` (REQUIRED - `https://blissful-lynx-970.convex.cloud`)
- [ ] `CONVEX_DEPLOY_KEY_DEV` (OPTIONAL - Preview deploy key)
- [ ] `CONVEX_URL` (OPTIONAL - `https://prestigious-whale-251.convex.cloud`)

### 2. Test with a Pull Request First (Recommended)

**Safer approach**: Create a PR to test workflows before deploying to production

1. Create a new branch:

   ```bash
   git checkout -b test/deployment-workflow
   ```

2. Make a small change (or just update documentation):

   ```bash
   # Example: Update a comment or add a small doc change
   git commit --allow-empty -m "test: verify deployment workflows"
   ```

3. Push and create PR:

   ```bash
   git push origin test/deployment-workflow
   ```

4. Check GitHub Actions:
   - Go to **Actions** tab
   - Verify `quality-gates.yml` passes
   - Verify `sessionid-check.yml` passes

5. If PR checks pass → merge to main → triggers `deploy.yml`

### 3. Or Push Directly to Main

If you're confident all secrets are set:

```bash
git checkout main
git pull origin main
# Make sure you're up to date

# Push your changes
git push origin main
```

**Note**: This will immediately trigger:

- ✅ `deploy.yml` → Deploys Convex backend to **production**
- ✅ `quality-gates.yml` → Runs quality checks
- ✅ Vercel → Deploys frontend automatically

## 🔍 After Pushing

### Monitor GitHub Actions

1. Go to **Actions** tab
2. Watch for:
   - ✅ `Deploy to Production` workflow
   - ✅ `Quality Gates` workflow
   - ✅ `SessionID Migration Check` workflow

### Check for Success

- ✅ All workflows show green checkmarks
- ✅ `deploy.yml` shows "Convex backend deployed successfully"
- ✅ Check Convex Dashboard → Deploy Keys → "Last used" timestamp updated
- ✅ Check Vercel Dashboard → New deployment triggered

### If Something Fails

1. Check workflow logs for specific error
2. Verify secrets are set correctly
3. Check Convex Dashboard for deployment status
4. See troubleshooting in `DEPLOYMENT-FIX-SUMMARY.md`

## 🚨 Important Notes

- **Pushing to `main` deploys to PRODUCTION** (`prestigious-whale-251`)
- Make sure you're using the **Production Deploy Key** for `CONVEX_DEPLOY_KEY`
- Test with PR first if you're unsure about secrets configuration
