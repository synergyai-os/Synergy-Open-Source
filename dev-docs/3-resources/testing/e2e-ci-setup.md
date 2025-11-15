# E2E Tests in CI - Setup Guide

**Status**: 🚧 Not Yet Enabled (tests commented out in quality-gates.yml)  
**Related**: SYOS-185 - Fix WorkOS test authentication

---

## Current State

E2E tests are **commented out** in `.github/workflows/quality-gates.yml` (lines 87-109).

**Why**: Tests were failing due to SSO enforcement. Now fixed with non-SSO test account.

---

## Prerequisites (Complete Before Enabling)

- ✅ Non-SSO test user created in WorkOS
- ✅ Local E2E tests passing (`npm run test:e2e`)
- ✅ Test credentials documented securely
- ✅ Team aware of CI environment requirements

---

## Step 1: Add GitHub Secrets

Go to GitHub Repository → Settings → Secrets and variables → Actions

**Add these secrets**:

| Secret Name | Value | Notes |
|-------------|-------|-------|
| `TEST_USER_EMAIL` | `e2e-test@synergyos-testing.com` | Non-SSO WorkOS test user |
| `TEST_USER_PASSWORD` | `<secure-password>` | From password manager |

**Existing secrets needed** (verify these exist):

| Secret Name | Purpose | Where to Get |
|-------------|---------|--------------|
| `CONVEX_URL` | Convex backend URL | Convex Dashboard → Settings |
| `CONVEX_DEPLOY_KEY` | Convex deployment key | Convex Dashboard → Settings → Deploy Keys |
| `WORKOS_API_KEY` | WorkOS API key | WorkOS Dashboard → API Keys (Staging) |
| `WORKOS_CLIENT_ID` | WorkOS client ID | WorkOS Dashboard → API Keys (Staging) |
| `WORKOS_REDIRECT_URI` | Callback URL | `http://localhost:5173/auth/callback` (for CI tests) |
| `PUBLIC_WORKOS_CLIENT_ID` | Same as WORKOS_CLIENT_ID | WorkOS Dashboard → API Keys (Staging) |
| `SYOS_SESSION_SECRET` | Session encryption key | Random 32+ char string |

---

## Step 2: Update GitHub Actions Workflow

Edit `.github/workflows/quality-gates.yml`:

**Uncomment lines 87-109** and update as follows:

```yaml
  # E2E Tests
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 60

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          # Test mode
          E2E_TEST_MODE: true
          BASE_URL: http://localhost:5173
          
          # Test credentials
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
          
          # Convex
          VITE_CONVEX_URL: ${{ secrets.CONVEX_URL }}
          PUBLIC_CONVEX_URL: ${{ secrets.CONVEX_URL }}
          
          # WorkOS
          PUBLIC_WORKOS_CLIENT_ID: ${{ secrets.PUBLIC_WORKOS_CLIENT_ID }}
          WORKOS_CLIENT_ID: ${{ secrets.WORKOS_CLIENT_ID }}
          WORKOS_API_KEY: ${{ secrets.WORKOS_API_KEY }}
          WORKOS_REDIRECT_URI: ${{ secrets.WORKOS_REDIRECT_URI }}
          
          # Session
          SYOS_SESSION_SECRET: ${{ secrets.SYOS_SESSION_SECRET }}

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: E2E test summary
        if: always()
        run: |
          echo "## E2E Test Results" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          if [ ${{ job.status }} == 'success' ]; then
            echo "✅ All E2E tests passed" >> $GITHUB_STEP_SUMMARY
          else
            echo "❌ Some E2E tests failed" >> $GITHUB_STEP_SUMMARY
            echo "" >> $GITHUB_STEP_SUMMARY
            echo "View the Playwright report artifact for details." >> $GITHUB_STEP_SUMMARY
          fi
```

---

## Step 3: Test CI Pipeline

**Recommended approach**: Test in a feature branch first.

```bash
# 1. Create test branch
git checkout -b test/enable-e2e-ci

# 2. Make workflow changes (Step 2 above)
git add .github/workflows/quality-gates.yml
git commit -m "chore(ci): Enable E2E tests in GitHub Actions

Related: SYOS-185

- Add E2E test job with proper environment variables
- Configure test credentials from GitHub Secrets
- Add Playwright report artifact upload
- Add test summary to GitHub Actions output"

# 3. Push and create PR
git push -u origin test/enable-e2e-ci
gh pr create --title "Enable E2E tests in CI" --body "Testing SYOS-185 fix in CI"

# 4. Watch CI run
gh pr view --web
# Or: GitHub → Pull Requests → Your PR → Checks tab
```

**Expected result**:
- ✅ E2E test job appears in GitHub Actions
- ✅ Tests run successfully
- ✅ Playwright report uploaded as artifact
- ✅ Summary shows "All E2E tests passed"

**If tests fail**:
1. Check GitHub Actions logs for error details
2. Verify all secrets are set correctly (Settings → Secrets)
3. Download Playwright report artifact to see test failures
4. Common issues: Missing secrets, wrong WorkOS environment, network timeouts

---

## Step 4: Enable for Production

Once tests pass in feature branch:

```bash
# 1. Merge test PR
gh pr merge --merge

# 2. Verify on main branch
git checkout main
git pull

# 3. Monitor next production deployment
# E2E tests will now run on every PR and push to main
```

---

## Monitoring & Maintenance

### Weekly Checks

- ✅ E2E tests still passing in CI
- ✅ Test user still valid in WorkOS
- ✅ No "sso_required" errors appearing
- ✅ Playwright report artifacts available

### Monthly Reviews

- 📊 Test execution time (should be < 5 minutes)
- 🔒 Test credential rotation (every 90 days)
- 📈 Test coverage (add new flows as needed)
- 🐛 Flaky test detection (re-run failures)

### When Tests Fail in CI

**Step 1: Check Logs**
```bash
# View recent workflow runs
gh run list --workflow=quality-gates.yml --limit 10

# View specific run
gh run view <run-id> --log-failed
```

**Step 2: Download Playwright Report**
```bash
# List artifacts
gh run view <run-id> --log

# Download report
gh run download <run-id> --name playwright-report
```

**Step 3: Reproduce Locally**
```bash
# Run same test that failed in CI
npm run test:e2e -- e2e/auth-registration.test.ts
```

**Step 4: Common Fixes**
- **Timeout**: Increase timeout in test or workflow
- **SSO error**: Check test user hasn't been linked to SSO
- **Network**: WorkOS API might be slow (check status.workos.com)
- **Secret expired**: Rotate credentials and update GitHub Secrets

---

## Cost Considerations

**GitHub Actions minutes**:
- E2E tests take ~3-5 minutes per run
- Free tier: 2,000 minutes/month (private repos) or unlimited (public repos)
- Each PR triggers 1 run (~5 minutes)
- Pushing to main triggers 1 run (~5 minutes)

**Example monthly usage** (20 PRs):
- 20 PRs × 5 minutes = 100 minutes
- 20 main pushes × 5 minutes = 100 minutes
- **Total: ~200 minutes/month** (10% of free tier)

**Optimization tips**:
- Run E2E tests only on PRs targeting main (not on draft PRs)
- Skip E2E tests on docs-only changes (use `paths` filter)
- Run E2E tests in parallel (split into multiple jobs)

---

## Rollback Plan

If E2E tests cause issues in CI:

**Option 1: Disable temporarily**
```yaml
# Comment out e2e-tests job in quality-gates.yml
# This allows PRs to merge while you debug
```

**Option 2: Make non-blocking**
```yaml
e2e-tests:
  name: E2E Tests
  continue-on-error: true  # Add this line
  # ... rest of job
```

**Option 3: Remove from workflow**
```bash
git revert <commit-that-enabled-e2e>
git push
```

---

## Future Enhancements

### Parallel Test Execution

Currently tests run sequentially (1 worker). To speed up:

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 2 : undefined, // Run 2 tests in parallel in CI
  // ...
});
```

**Note**: Requires multiple test accounts or better test isolation.

### Test Sharding

For very large test suites:

```yaml
# Split tests across multiple jobs
strategy:
  matrix:
    shard: [1, 2, 3, 4]
jobs:
  - run: npx playwright test --shard=${{ matrix.shard }}/4
```

### Visual Regression Testing

Add screenshot comparison:

```yaml
- name: Run E2E tests with screenshots
  run: npm run test:e2e
  env:
    PLAYWRIGHT_UPDATE_SNAPSHOTS: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' && 'true' || 'false' }}
```

---

## References

- **Issue**: [SYOS-185](https://linear.app/younghumanclub/issue/SYOS-185)
- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Playwright CI Guide**: https://playwright.dev/docs/ci
- **E2E Testing Strategy**: `dev-docs/3-resources/testing/e2e-auth-testing-strategy.md`

---

**Last Updated**: 2025-11-15  
**Status**: Ready to enable once local tests pass

