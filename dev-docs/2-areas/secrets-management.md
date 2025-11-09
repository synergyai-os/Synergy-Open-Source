# Secrets Management

**How we securely manage API keys, tokens, and credentials for SynergyOS.**

---

## 🎯 Overview

**Local Development:** 1Password CLI + `.env` file  
**Production:** Vercel Environment Variables  
**Team Sharing:** 1Password shared vaults

---

## 🔐 Local Development Setup

### Prerequisites

- 1Password account (personal or team)
- 1Password CLI installed

### Step 1: Install 1Password CLI

```bash
brew install --cask 1password-cli
```

### Step 2: Connect to 1Password

```bash
op account add
```

This opens 1Password for authentication. You only need to do this once.

### Step 3: Create Dev Vault in 1Password

**In 1Password app:**

1. Click **"+"** → **"New Vault"**
2. Name: **"Dev - SynergyOS"**
3. Add items for each service:

**Item: "Convex Production"**
- Type: API Credential
- Fields:
  - `deploy-key` = Your Convex deploy key
  - `deployment-name` = `blissful-lynx-970`
  - `url` = `https://blissful-lynx-970.convex.cloud`

**Item: "PostHog"**
- Type: API Credential
- Fields:
  - `key` = Your PostHog project key
  - `host` = `https://us.i.posthog.com`

### Step 4: Create `.env` File

**Create `.env` in project root:**

```bash
# .env - Safe to commit! Contains secret references, not actual secrets.

# Convex
CONVEX_DEPLOY_KEY=op://Dev-SynergyOS/Convex-Production/deploy-key
CONVEX_DEPLOYMENT=op://Dev-SynergyOS/Convex-Production/deployment-name
PUBLIC_CONVEX_URL=op://Dev-SynergyOS/Convex-Production/url

# PostHog Analytics
PUBLIC_POSTHOG_KEY=op://Dev-SynergyOS/PostHog/key
PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

**Add `.env.local` to `.gitignore`** (if not already):

```bash
echo ".env.local" >> .gitignore
```

### Step 5: Run with Secrets

**Instead of:**
```bash
npm run dev
```

**Run:**
```bash
op run -- npm run dev
```

1Password CLI injects secrets automatically.

---

## 🚀 Production Setup (Vercel)

Secrets for deployed environments live in Vercel.

### Required Environment Variables

Go to: **Vercel Dashboard → Project → Settings → Environment Variables**

**Add these:**

| Name | Value | Environment |
|------|-------|-------------|
| `CONVEX_DEPLOY_KEY` | (from Convex Dashboard) | Production ✓ |
| `CONVEX_DEPLOYMENT` | `blissful-lynx-970` | Production ✓ |
| `PUBLIC_CONVEX_URL` | `https://blissful-lynx-970.convex.cloud` | Production ✓ |
| `PUBLIC_POSTHOG_KEY` | (from PostHog Settings) | Production ✓ |
| `PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` | Production ✓ |

### Where to Get Keys

**Convex Deploy Key:**
1. Go to: https://dashboard.convex.dev
2. Select your project
3. Settings → URL & Deploy Key
4. Click "Generate Deploy Key"
5. Copy and save to Vercel

**PostHog Key:**
1. Go to: https://posthog.com/settings
2. Project API Key
3. Copy and save to Vercel

---

## 🔧 Core Shell Setup (Optional)

**Auto-load secrets in every terminal:**

1. Open Core Shell → Settings
2. Edit "SynergyOS" profile
3. Run Command: `op run -- npm run dev`
4. Save

Now every new tab automatically has secrets loaded.

---

## 👥 Onboarding New Developers

**Share secrets with a new team member:**

### Step 1: Share 1Password Vault

1. Open 1Password app
2. Right-click "Dev - SynergyOS" vault
3. Share → Invite by email
4. Set permissions: "Can view and copy"

### Step 2: New Developer Setup

**They run:**

```bash
# Clone repo
git clone https://github.com/synergyai-os/Synergy-Open-Source.git
cd Synergy-Open-Source

# Install dependencies
npm install

# Install 1Password CLI
brew install --cask 1password-cli

# Connect to 1Password
op account add

# Run with secrets
op run -- npm run dev
```

**Done!** They have access to all secrets without manual copy/paste.

---

## 📋 Required Secrets Checklist

### Development

- [ ] `CONVEX_DEPLOY_KEY` - For build-time codegen
- [ ] `CONVEX_DEPLOYMENT` - Deployment name (e.g., `blissful-lynx-970`)
- [ ] `PUBLIC_CONVEX_URL` - Convex deployment URL
- [ ] `PUBLIC_POSTHOG_KEY` - Analytics key
- [ ] `PUBLIC_POSTHOG_HOST` - PostHog host URL

### Production (Vercel)

Same as above, stored in Vercel Environment Variables.

---

## 🚨 Security Best Practices

**DO:**
- ✅ Use 1Password CLI for local development
- ✅ Store production secrets in Vercel
- ✅ Keep `.env` files in git (with secret references)
- ✅ Keep `.env.local` out of git (actual secrets)
- ✅ Rotate keys if exposed
- ✅ Use separate keys for dev/staging/prod

**DON'T:**
- ❌ Commit `.env.local` to git
- ❌ Share secrets in Slack/email
- ❌ Use production keys in development
- ❌ Hardcode secrets in code
- ❌ Screenshot secrets

---

## 🔄 Rotating Secrets

**If a secret is exposed:**

### Step 1: Generate New Key

**Convex:**
1. Dashboard → Settings → Deploy Keys
2. Click "Generate Deploy Key"
3. Copy new key

**PostHog:**
1. Settings → Project API Key
2. Click "Regenerate"
3. Copy new key

### Step 2: Update Everywhere

1. **1Password:** Update vault item with new key
2. **Vercel:** Update environment variable
3. **Redeploy:** Trigger new deployment in Vercel

### Step 3: Revoke Old Key

Immediately revoke the exposed key in the service's dashboard.

---

## 🐛 Troubleshooting

### Error: "MissingAccessToken" on Vercel build

**Fix:** Add `CONVEX_DEPLOY_KEY` to Vercel Environment Variables.

### Error: "command not found: op"

**Fix:** Install 1Password CLI:
```bash
brew install --cask 1password-cli
```

### Secrets not loading locally

**Fix:** Make sure you're using `op run`:
```bash
op run -- npm run dev
```

### Can't access shared vault

**Fix:** Check 1Password app → Shared vaults → Accept invitation.

---

## 📚 Resources

**1Password CLI:**
- [Official Docs](https://developer.1password.com/docs/cli)
- [Secret References Guide](https://developer.1password.com/docs/cli/secret-references)

**Vercel:**
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

**Convex:**
- [Deploy Keys](https://docs.convex.dev/production/hosting/deploy-keys)

---

## 🎯 Quick Commands

```bash
# Run dev server with secrets
op run -- npm run dev

# Run build with secrets
op run -- npm run build

# Run any command with secrets
op run -- <your-command>

# List vaults
op vault list

# Get a specific secret
op read op://Dev-SynergyOS/Convex-Production/url
```

---

**Questions?** Check [1Password CLI docs](https://developer.1password.com/docs/cli) or ask the team.

