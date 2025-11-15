# GitHub Secrets Setup Guide

**Purpose**: Reference table for configuring GitHub Actions secrets for DEV and PROD environments.

**Location**: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

---

## 🔐 GitHub Secrets Configuration

### ✅ Table 1: Must Setup (Required + Recommended)

| GitHub Secret Name                 | Required For                          | Where to Find                                              | Status            |
| ---------------------------------- | ------------------------------------- | ---------------------------------------------------------- | ----------------- |
| **✅ REQUIRED**                    |
| `CONVEX_DEPLOY_KEY`                | Production deployments (`deploy.yml`) | Convex Dashboard → Prod Project → Settings → Deploy Keys   | ⚠️ **Must have**  |
| **⚠️ RECOMMENDED (for E2E Tests)** |
| `TEST_CONVEX_URL`                  | E2E Tests                             | Convex Dashboard → Dev Project → Settings → Deployment URL | Optional          |
| `WORKOS_TEST_CLIENT_ID`            | E2E Tests                             | WorkOS Dashboard → Dev Environment → Client ID             | Optional          |
| `WORKOS_TEST_API_KEY`              | E2E Tests                             | WorkOS Dashboard → Dev Environment → API Keys              | Optional          |
| `WORKOS_TEST_REDIRECT_URI`         | E2E Tests                             | WorkOS Dashboard → Dev Environment → Redirect URIs         | Optional          |
| `TEST_USER_EMAIL`                  | E2E Tests                             | Create test user in WorkOS dev environment                 | Optional          |
| `TEST_USER_PASSWORD`               | E2E Tests                             | Set password for test user account                         | Optional          |
| `SYOS_SESSION_SECRET`              | Quality Gates, E2E                    | Generate: `openssl rand -base64 32`                        | Optional          |
| `TEST_AUTH_SECRET`                 | E2E Tests                             | Same as `SYOS_SESSION_SECRET` or separate                  | Optional (legacy) |

**Quick Check**: ✅ You need `CONVEX_DEPLOY_KEY` for production. Everything else is optional (for E2E tests).

---

## ❌ Table 2: Common Mistakes - Do NOT Add These

> **⚠️ Why this table exists**: These production keys are often mistakenly added to GitHub Secrets because they appear in workflow files. However, they're **NOT needed** - quality gates use placeholders automatically. Adding them is unnecessary and increases security risk. Production keys belong in **Vercel**, not GitHub Actions.

| GitHub Secret Name    | Why People Add This (Wrong)   | Why You Shouldn't             | What Happens Instead                                     |
| --------------------- | ----------------------------- | ----------------------------- | -------------------------------------------------------- |
| `CONVEX_URL`          | See it in `quality-gates.yml` | Quality gates use placeholder | Uses `https://placeholder.convex.cloud` automatically    |
| `WORKOS_CLIENT_ID`    | See it in `quality-gates.yml` | Quality gates use placeholder | Uses `placeholder-client-id` automatically               |
| `WORKOS_API_KEY`      | See it in `quality-gates.yml` | Quality gates use placeholder | Uses `placeholder-api-key` automatically                 |
| `WORKOS_REDIRECT_URI` | See it in `quality-gates.yml` | Quality gates use placeholder | Uses `http://localhost:5173/auth/callback` automatically |

**Key Points:**

- ❌ **Don't add these** - They're not needed for GitHub Actions
- ✅ **Placeholders work** - Quality gates only verify builds compile, they don't make API calls
- 🔒 **Security**: Production keys should only be in Vercel (for actual deployments), not GitHub Secrets
- 📝 **Why listed**: To prevent confusion - these appear in workflow files but aren't required

---

## ✅ Verification Checklist

Use this to verify your GitHub Secrets setup matches **Table 1** above:

### Required (Must Have)

- [ ] `CONVEX_DEPLOY_KEY` - ✅ You have this → Production deployments will work

### Optional (For E2E Tests)

- [ ] `TEST_CONVEX_URL` - ✅ You have this → E2E tests can run
- [ ] `WORKOS_TEST_CLIENT_ID` - ✅ You have this → E2E tests can run
- [ ] `WORKOS_TEST_API_KEY` - ✅ You have this → E2E tests can run
- [ ] `WORKOS_TEST_REDIRECT_URI` - ✅ You have this → E2E tests can run
- [ ] `TEST_USER_EMAIL` - ✅ You have this → E2E tests can run
- [ ] `TEST_USER_PASSWORD` - ✅ You have this → E2E tests can run
- [ ] `TEST_AUTH_SECRET` - ✅ You have this → E2E tests can run

### ❌ Verify You DON'T Have (See Table 2)

- [ ] `CONVEX_URL` - ❌ Should NOT be in GitHub Secrets
- [ ] `WORKOS_CLIENT_ID` - ❌ Should NOT be in GitHub Secrets
- [ ] `WORKOS_API_KEY` - ❌ Should NOT be in GitHub Secrets
- [ ] `WORKOS_REDIRECT_URI` - ❌ Should NOT be in GitHub Secrets

**✅ Your setup is correct if:**

- ✅ You have `CONVEX_DEPLOY_KEY` (required - see Table 1)
- ✅ You have TEST\_\* secrets (optional but recommended - see Table 1)
- ✅ You DON'T have production keys listed in Table 2 (correct - they're not needed!)

---

## 📋 Quick Setup Checklist

### ✅ Required for Production Deployments

- [ ] `CONVEX_DEPLOY_KEY` - Production Convex deploy key (only secret needed for `deploy.yml`)

### ⚠️ Recommended for E2E Tests (if running E2E in CI)

- [ ] `TEST_CONVEX_URL` - Dev Convex deployment
- [ ] `WORKOS_TEST_CLIENT_ID` - Dev WorkOS client ID
- [ ] `WORKOS_TEST_API_KEY` - Dev WorkOS API key
- [ ] `WORKOS_TEST_REDIRECT_URI` - Dev redirect URI (`http://127.0.0.1:5173/auth/callback`)
- [ ] `TEST_USER_EMAIL` - Test user email
- [ ] `TEST_USER_PASSWORD` - Test user password
- [ ] `SYOS_SESSION_SECRET` - Session encryption secret (or use placeholder)

### ❌ **NOT NEEDED** - Production Keys for Quality Gates

**Skip these** - Quality gates use placeholders automatically:

- ~~`CONVEX_URL`~~ - Placeholder `https://placeholder.convex.cloud` works fine
- ~~`WORKOS_CLIENT_ID`~~ - Placeholder `placeholder-client-id` works fine
- ~~`WORKOS_API_KEY`~~ - Placeholder `placeholder-api-key` works fine
- ~~`WORKOS_REDIRECT_URI`~~ - Placeholder `http://localhost:5173/auth/callback` works fine

**Why?** Quality gates only verify that code compiles/builds. They don't run the app or make API calls, so placeholders are sufficient.

---

## 🎯 Environment-Specific Setup

### DEV Environment Secrets

**Purpose**: CI/CD testing, E2E tests, development workflows

**Required**:

- None (all have placeholders or are optional)

**Recommended**:

- `TEST_CONVEX_URL` - Separate dev Convex deployment
- `WORKOS_TEST_CLIENT_ID` - WorkOS test environment
- `WORKOS_TEST_API_KEY` - WorkOS test API key
- `TEST_USER_EMAIL` - Test user account
- `TEST_USER_PASSWORD` - Test user password
- `SYOS_SESSION_SECRET` - Session secret (can be same as prod)

**Where to find**:

- **Convex**: `npx convex dev --project-name synergyos-dev` → Copy deployment URL
- **WorkOS**: Dashboard → Environments → Test/Dev → Copy credentials
- **Test User**: Create in WorkOS test environment

---

### PROD Environment Secrets

**Purpose**: Production deployments only

**Required**:

- `CONVEX_DEPLOY_KEY` - Production Convex deploy key (only secret needed for `deploy.yml`)

**❌ NOT NEEDED for Quality Gates**:

- ~~`CONVEX_URL`~~ - Quality gates use placeholder `https://placeholder.convex.cloud`
- ~~`WORKOS_CLIENT_ID`~~ - Quality gates use placeholder `placeholder-client-id`
- ~~`WORKOS_API_KEY`~~ - Quality gates use placeholder `placeholder-api-key`
- ~~`WORKOS_REDIRECT_URI`~~ - Quality gates use placeholder `http://localhost:5173/auth/callback`

**Why?** Quality gates (`quality-gates.yml`) only verify builds compile. They don't run the app or make API calls, so placeholders work perfectly. Production keys are only needed in Vercel (for actual deployments), not in GitHub Actions.

**Where to find**:

- **Convex**: Dashboard → Production Project → Settings → Deploy Keys
- **WorkOS**: Dashboard → Production Environment → Copy credentials
- **Vercel**: Dashboard → Project → Settings → Environment Variables (for frontend)

---

## 🔍 Finding Values

### Convex

1. **Dev URL**: Run `npx convex dev` → Copy deployment URL from output
2. **Prod URL**: Convex Dashboard → Production Project → Settings → Deployment URL
3. **Deploy Key**: Convex Dashboard → Production Project → Settings → Deploy Keys → Generate New

### WorkOS

1. **Dashboard**: https://dashboard.workos.com/
2. **Environments**: Navigate to your project → Environments
3. **Dev Environment**: Use test/dev environment credentials
4. **Prod Environment**: Use production environment credentials
5. **Client ID**: Environment → Configuration → Client ID
6. **API Key**: Environment → API Keys → Create/View
7. **Redirect URI**: Environment → Redirect URIs → Add `http://127.0.0.1:5173/auth/callback` for dev (⚠️ use `127.0.0.1` not `localhost` for WorkOS compatibility)

### Session Secret

Generate a secure random secret:

```bash
# Generate 32-character base64 secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🚨 Security Best Practices

1. **Never commit secrets** - Always use GitHub Secrets, never hardcode
2. **Use separate DEV/PROD** - Isolate test and production credentials
3. **Rotate regularly** - Update secrets periodically
4. **Limit access** - Only repository admins should manage secrets
5. **Use test accounts** - Never use real user credentials for E2E tests
6. **Monitor usage** - Review GitHub Actions logs for secret exposure

---

## 📝 Notes

### Quality Gates (Build Verification)

- **Uses placeholders automatically** - No production keys needed
- **Purpose**: Verify code compiles/builds (doesn't run app or make API calls)
- **Placeholders work fine**: `https://placeholder.convex.cloud`, `placeholder-client-id`, etc.
- **Why safe**: Build process only checks syntax/imports, doesn't validate auth or API calls

### E2E Tests

- **Non-blocking** (`continue-on-error: true`) - PR can merge without test credentials
- **Requires TEST\_\* secrets** - Uses dev/test environment credentials
- **Runs locally in CI** - Uses `http://127.0.0.1:5173` (Playwright starts dev server)

### Production Deploy

- **Requires `CONVEX_DEPLOY_KEY`** - Only secret needed for `deploy.yml`
- **Only runs on `main` branch pushes** - Separate from quality gates
- **Production keys go in Vercel** - Not GitHub Secrets (for frontend deployment)

### Security Best Practice

- **Don't add production keys to GitHub** - Only needed in Vercel
- **Use TEST\_\* secrets for CI** - Isolated dev/test environment
- **Placeholders are safe** - Quality gates don't need real values

---

## 🔗 Related Documentation

- [Secrets Management Guide](./secrets-management.md) - Local `.env.local` setup
- [CI/CD Patterns](../patterns/ci-cd.md) - Workflow patterns and best practices
- [GitHub Open Source Setup](./tools/github-open-source-setup.md) - Repository configuration
