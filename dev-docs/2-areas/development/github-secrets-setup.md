# GitHub Secrets Setup Guide

**Purpose**: Reference table for configuring GitHub Actions secrets for DEV and PROD environments.

**Location**: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

---

## 🔐 GitHub Secrets Configuration Table

| GitHub Secret Name | Environment | Source Location | Used By | Priority | Notes |
|-------------------|-------------|-----------------|---------|----------|-------|
| **Convex Configuration** |
| `TEST_CONVEX_URL` | DEV | Convex Dashboard → Dev Project → Settings → Deployment URL | E2E Tests | ⚠️ Optional | Dev/test Convex deployment URL |
| `CONVEX_URL` | PROD | Convex Dashboard → Prod Project → Settings → Deployment URL | Build, E2E (fallback) | ⚠️ Optional | Production Convex URL (has placeholders) |
| `CONVEX_DEPLOY_KEY` | PROD | Convex Dashboard → Prod Project → Settings → Deploy Keys | Deploy Workflow | ✅ Required | Only for production deployments |
| **WorkOS Authentication** |
| `WORKOS_TEST_CLIENT_ID` | DEV | WorkOS Dashboard → Dev Environment → Client ID | E2E Tests | ⚠️ Optional | Test environment client ID |
| `WORKOS_TEST_API_KEY` | DEV | WorkOS Dashboard → Dev Environment → API Keys | E2E Tests | ⚠️ Optional | Test environment API key |
| `WORKOS_TEST_REDIRECT_URI` | DEV | WorkOS Dashboard → Dev Environment → Redirect URIs | E2E Tests | ⚠️ Optional | Usually `http://localhost:5173/auth/callback` |
| `WORKOS_CLIENT_ID` | PROD | WorkOS Dashboard → Prod Environment → Client ID | Build (fallback) | ⚠️ Optional | Production client ID (has placeholders) |
| `WORKOS_API_KEY` | PROD | WorkOS Dashboard → Prod Environment → API Keys | Build (fallback) | ⚠️ Optional | Production API key (has placeholders) |
| `WORKOS_REDIRECT_URI` | PROD | WorkOS Dashboard → Prod Environment → Redirect URIs | Build (fallback) | ⚠️ Optional | Production redirect URI |
| **Session Management** |
| `SYOS_SESSION_SECRET` | BOTH | Generate: `openssl rand -base64 32` (≥32 chars) | Build, E2E | ⚠️ Optional | Same secret for both (or separate) |
| `TEST_AUTH_SECRET` | DEV | Same as `SYOS_SESSION_SECRET` or separate | E2E Tests | ⚠️ Optional | Legacy alias, can reuse `SYOS_SESSION_SECRET` |
| **Test User Credentials** |
| `TEST_USER_EMAIL` | DEV | Create test user: `test@synergyai.nl` or `randy+cicduser@synergyai.nl` | E2E Tests | ⚠️ Optional | Dedicated test account (not real user) |
| `TEST_USER_PASSWORD` | DEV | Set password for test user account | E2E Tests | ⚠️ Optional | Test account password |

---

## 📋 Quick Setup Checklist

### ✅ Required for Production Deployments
- [ ] `CONVEX_DEPLOY_KEY` - Production Convex deploy key

### ⚠️ Optional (but recommended for E2E tests)
- [ ] `TEST_CONVEX_URL` - Dev Convex deployment
- [ ] `WORKOS_TEST_CLIENT_ID` - Dev WorkOS client ID
- [ ] `WORKOS_TEST_API_KEY` - Dev WorkOS API key
- [ ] `WORKOS_TEST_REDIRECT_URI` - Dev redirect URI
- [ ] `TEST_USER_EMAIL` - Test user email
- [ ] `TEST_USER_PASSWORD` - Test user password
- [ ] `SYOS_SESSION_SECRET` - Session encryption secret

### 🔧 Optional (for build verification)
- [ ] `CONVEX_URL` - Production Convex URL (has placeholders)
- [ ] `WORKOS_CLIENT_ID` - Production WorkOS client ID (has placeholders)
- [ ] `WORKOS_API_KEY` - Production WorkOS API key (has placeholders)

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
- `CONVEX_DEPLOY_KEY` - Production Convex deploy key

**Optional** (for build verification):
- `CONVEX_URL` - Production Convex URL
- `WORKOS_CLIENT_ID` - Production WorkOS client ID
- `WORKOS_API_KEY` - Production WorkOS API key
- `SYOS_SESSION_SECRET` - Session secret (can be same as dev)

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
7. **Redirect URI**: Environment → Redirect URIs → Add `http://localhost:5173/auth/callback` for dev

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

- **E2E Tests**: Non-blocking (`continue-on-error: true`) - PR can merge without test credentials
- **Build Verification**: Has placeholders - Works without secrets but better with real values
- **Production Deploy**: Requires `CONVEX_DEPLOY_KEY` - Only runs on `main` branch pushes
- **Fallback Chain**: Most secrets have fallbacks (TEST_* → PROD → placeholder)

---

## 🔗 Related Documentation

- [Secrets Management Guide](./secrets-management.md) - Local `.env.local` setup
- [CI/CD Patterns](../patterns/ci-cd.md) - Workflow patterns and best practices
- [GitHub Open Source Setup](./tools/github-open-source-setup.md) - Repository configuration

