# Secrets Management

**How we securely manage API keys, tokens, and credentials for SynergyOS.**

---

## 🎯 Overview

**Local Development:** `.env.local` file (not committed to git)  
**Production:** Vercel Environment Variables  
**Team Sharing:** Share `.env.local` contents securely (1Password, encrypted notes, etc.)

**Why `.env.local`?**
- ✅ Simple - no CLI tools required
- ✅ Fast - no secret injection overhead
- ✅ Works with all tools (`npm run dev`, `npx convex dev`, etc.)
- ✅ Standard Node.js/Vite convention
- ✅ Automatically ignored by git (via `.gitignore`)

---

## 🔐 Local Development Setup

### Step 1: Get Your API Keys

**Convex Deploy Key:**
1. Go to: https://dashboard.convex.dev
2. Select your project
3. Settings → URL & Deploy Key
4. Click "Generate Deploy Key" if needed
5. Copy the key

**WorkOS Credentials (Staging for local dev):**
1. Go to WorkOS Dashboard (requires authentication)
2. Switch to **Staging** environment (dropdown at top)
3. Go to **API Keys** section
4. Copy **Client ID** and **API Key**

**PostHog Key:**
1. Go to PostHog Settings (requires authentication)
2. Copy Project API Key

### Step 2: Create `.env.local`

Create `.env.local` in the project root with your actual secret values:

```bash
# .env.local - NEVER commit this file!

# Convex
CONVEX_DEPLOY_KEY=prod:...your_actual_deploy_key_here

# WorkOS - Staging (for local development)
WORKOS_CLIENT_ID=client_01K9...staging_id_here
WORKOS_API_KEY=sk_staging_...your_key_here
WORKOS_COOKIE_PASSWORD=your_32_character_random_string_here
WORKOS_REDIRECT_URI=http://127.0.0.1:5173/auth/callback

# Public variables (need actual values, not references)
PUBLIC_WORKOS_CLIENT_ID=client_01K9...staging_id_here
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
PUBLIC_POSTHOG_KEY=phc_your_actual_key_here
PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

**Generate cookie password:**
```bash
# Generate a secure 32+ character random string
openssl rand -base64 32
```

### Step 3: Verify `.gitignore`

Make sure `.env.local` is in `.gitignore` (should already be there):

```bash
# Check if it's there
grep ".env.local" .gitignore

# If not, add it
echo ".env.local" >> .gitignore
```

### Step 4: Run Your App

Now you can run everything normally:

```bash
# Dev server
npm run dev

# Convex dev
npx convex dev

# Build
npm run build
```

No `op run` or CLI tools needed! ✅

---

## 🚀 Production Setup (Vercel)

Secrets for deployed environments live in Vercel Environment Variables.

### Required Environment Variables

⚠️ **Important**: Use **Production** WorkOS credentials for Vercel!

Go to: **Vercel Dashboard → Project → Settings → Environment Variables**

**Add these:**

| Name | Value | Where to Get It |
|------|-------|-----------------|
| `CONVEX_DEPLOY_KEY` | `prod:...` | Convex Dashboard → Settings |
| `WORKOS_CLIENT_ID` | `client_...` | WorkOS **Production** → API Keys |
| `WORKOS_API_KEY` | `sk_prod_...` | WorkOS **Production** → API Keys |
| `WORKOS_COOKIE_PASSWORD` | (32+ chars) | Generate with `openssl rand -base64 32` |
| `WORKOS_REDIRECT_URI` | `https://www.synergyos.ai/auth/callback` | Your production domain |
| `PUBLIC_WORKOS_CLIENT_ID` | `client_...` | Same as `WORKOS_CLIENT_ID` |
| `PUBLIC_CONVEX_URL` | `https://...convex.cloud` | Convex Dashboard |
| `PUBLIC_POSTHOG_KEY` | `phc_...` | PostHog Settings |
| `PUBLIC_POSTHOG_HOST` | `https://eu.i.posthog.com` | Your PostHog region |

**Set for**: Production, Preview, Development (all environments)

---

## 👥 Onboarding New Developers

**Share `.env.local` contents securely with new team members:**

### Option 1: Encrypted Note (Recommended)

1. Copy your `.env.local` contents
2. Send via 1Password secure note, encrypted email, or secure sharing service
3. New developer creates their own `.env.local` file
4. Paste contents and save

### Option 2: Screen Share

1. Open your `.env.local` in editor
2. Screen share (make sure nothing else sensitive is visible)
3. New developer copies values manually

### New Developer Setup

```bash
# Clone repo
git clone https://github.com/synergyai-os/Synergy-Open-Source.git
cd Synergy-Open-Source

# Install dependencies
npm install

# Create .env.local file (get contents from team)
# Paste the secrets you received

# Run the app
npm run dev

# In another terminal, run Convex dev
npx convex dev
```

**Done!** No CLI tools or complex setup required.

---

## 📋 Required Secrets Checklist

### Development (.env.local)

- [ ] `CONVEX_DEPLOY_KEY` - For Convex dev/deploy
- [ ] `WORKOS_CLIENT_ID` - Staging Client ID
- [ ] `WORKOS_API_KEY` - Staging API Key
- [ ] `WORKOS_COOKIE_PASSWORD` - Random 32+ characters
- [ ] `WORKOS_REDIRECT_URI` - `http://127.0.0.1:5173/auth/callback`
- [ ] `PUBLIC_WORKOS_CLIENT_ID` - Same as `WORKOS_CLIENT_ID`
- [ ] `PUBLIC_CONVEX_URL` - Your Convex deployment URL
- [ ] `PUBLIC_POSTHOG_KEY` - PostHog project key
- [ ] `PUBLIC_POSTHOG_HOST` - PostHog host (usually `https://eu.i.posthog.com`)

### Production (Vercel)

Same variables as above, but use **Production** WorkOS credentials and production redirect URI.

---

## 🚨 Security Best Practices

**DO:**
- ✅ Keep `.env.local` out of git (it's in `.gitignore`)
- ✅ Store production secrets in Vercel Environment Variables
- ✅ Use **Staging** credentials for local development
- ✅ Use **Production** credentials for Vercel
- ✅ Rotate keys if exposed
- ✅ Generate strong cookie passwords (32+ characters)
- ✅ Use `127.0.0.1` (not `localhost`) for local redirect URIs

**DON'T:**
- ❌ Commit `.env.local` to git
- ❌ Share secrets in public Slack/Discord
- ❌ Use production keys in local development
- ❌ Hardcode secrets in code files
- ❌ Screenshot secrets (unless blurred)
- ❌ Use `localhost` in WorkOS redirect URIs (use `127.0.0.1`)

---

## 🔄 Rotating Secrets

**If a secret is exposed:**

### Step 1: Generate New Key

**Convex:**
1. Dashboard → Settings → Deploy Keys
2. Click "Generate Deploy Key"
3. Copy new key

**WorkOS:**
1. Dashboard → API Keys
2. Generate new Client ID and API Key
3. Update redirect URIs if needed

**PostHog:**
1. Settings → Project API Key
2. Click "Regenerate"
3. Copy new key

### Step 2: Update Everywhere

1. **Local:** Update `.env.local` with new key
2. **Vercel:** Update environment variable in Vercel Dashboard
3. **Team:** Share new keys with team securely
4. **Redeploy:** Trigger new deployment in Vercel

### Step 3: Revoke Old Key

Immediately revoke the exposed key in the service's dashboard.

---

## 🐛 Troubleshooting

### Error: "CONVEX_DEPLOY_KEY is required"

**Fix:** Add `CONVEX_DEPLOY_KEY` to your `.env.local` file with the actual key from Convex Dashboard.

### Error: "Invalid client ID" (WorkOS)

**Fix:** 
- Check that `PUBLIC_WORKOS_CLIENT_ID` in `.env.local` has the **actual Client ID** (not a reference)
- Verify you're using **Staging** credentials for local development
- Make sure Client ID starts with `client_`

### Error: "Invalid redirect URI"

**Fix:**
- Use `127.0.0.1` (not `localhost`) in your redirect URI
- Check WorkOS Dashboard has `http://127.0.0.1:5173/auth/callback` configured
- Restart dev server after changing `.env.local`

### PUBLIC_ variables not working

**Problem:** Vite bakes `PUBLIC_*` variables into client code at build time.

**Fix:** 
- Always put **actual values** in `.env.local` for `PUBLIC_*` variables
- Never use references like `op://...` for public variables
- Restart dev server after changes

### Secrets not loading

**Fix:** 
- Make sure file is named `.env.local` (not `.env.local.txt`)
- File should be in project root (same directory as `package.json`)
- Restart your dev server after creating/changing `.env.local`

---

## 📚 Resources

**Vite Environment Variables:**
- [Vite Env Variables Guide](https://vitejs.dev/guide/env-and-mode.html)

**Vercel:**
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

**WorkOS:**
- [AuthKit Setup](https://workos.com/docs/user-management)

**Convex:**
- [Deployment Documentation](https://docs.convex.dev/deploy)

---

## 🎯 Quick Reference

**File structure:**
```
project-root/
├── .env              # Default values, references (committed to git)
├── .env.local        # Actual secrets (NOT committed, in .gitignore)
├── .gitignore        # Contains .env.local
└── package.json
```

**Variable priority:**
1. `.env.local` (highest priority - actual secrets)
2. `.env` (lowest priority - defaults/references)

**Commands:**
```bash
# Run dev server
npm run dev

# Run Convex dev
npx convex dev

# Deploy to Convex
npx convex deploy

# Build for production
npm run build

# No special commands needed - just use .env.local!
```

---

**Questions?** Check the [Vite environment variables docs](https://vitejs.dev/guide/env-and-mode.html) or ask the team.
