# WorkOS AuthKit Setup Instructions

> ✅ **STATUS**: Migration completed Nov 2025. This document is kept for reference.
>
> **For current implementation**: See [dev-docs/2-areas/patterns/auth-deployment.md](dev-docs/2-areas/patterns/auth-deployment.md)

This document contains the setup steps for WorkOS AuthKit (completed during migration).

## 1. WorkOS Account Setup

### Create WorkOS Account and Environments

1. Go to https://workos.com and sign up
2. WorkOS creates **Staging** and **Production** environments automatically
3. Configure **each environment separately**:

**Staging Environment** (for local development):

- Navigate to **Configuration** → **Redirects**
- Add: `http://127.0.0.1:5173/auth/callback` (⚠️ use `127.0.0.1` not `localhost`!)
- Set App Homepage URL: `http://127.0.0.1:5173`
- Enable "Email + Password" authentication

**Production Environment** (for live deployment):

- Navigate to **Configuration** → **Redirects**
- Add **both** (⚠️ important - www and non-www):
  - `https://synergyos.ai/auth/callback`
  - `https://www.synergyos.ai/auth/callback`
- Set App Homepage URL: `https://synergyos.ai`
- Enable "Email + Password" authentication

### Get API Credentials (Per Environment!)

⚠️ **Important**: Staging and Production have **different credentials**!

**For Staging**:

1. Switch to **Staging** environment (dropdown at top)
2. Go to **API Keys** section
3. Copy your **Staging Client ID** (starts with `client_`)
4. Copy your **Staging API Key** (starts with `sk_`)

**For Production**:

1. Switch to **Production** environment
2. Go to **API Keys** section
3. Copy your **Production Client ID** (starts with `client_`)
4. Copy your **Production API Key** (starts with `sk_`)

## 2. Generate Cookie Password

Generate a secure random password for cookie encryption:

```bash
# Generate a secure cookie password (32+ characters)
openssl rand -base64 32

# Save this password - you'll need it for .env.local and Vercel
```

## 3. Create `.env.local` File

Create `.env.local` in the project root with your actual secret values:

```env
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

⚠️ **Important**: Use **Staging** WorkOS credentials for local development, **Production** credentials for Vercel.

⚠️ **Why `.env.local`?** Vite bakes `PUBLIC_*` vars into client-side JavaScript at build time. They need actual values, not references. The `.env.local` file is automatically ignored by git (via `.gitignore`).

## 4. Add to Convex Dashboard

Go to https://dashboard.convex.dev and add these environment variables:

- `WORKOS_CLIENT_ID`
- `WORKOS_API_KEY`

## 5. Add to Vercel

⚠️ **Use PRODUCTION credentials** for Vercel!

Go to Vercel Dashboard → Project → Settings → Environment Variables and add:

- `WORKOS_API_KEY` = Production API Key from WorkOS
- `WORKOS_CLIENT_ID` = Production Client ID
- `PUBLIC_WORKOS_CLIENT_ID` = Production Client ID (actual value, not op:// reference!)
- `WORKOS_REDIRECT_URI` = `https://synergyos.ai/auth/callback` (use canonical domain)
- `WORKOS_COOKIE_PASSWORD` = (generate with `openssl rand -base64 32`)
- `PUBLIC_CONVEX_URL` = Your Convex production URL (actual value!)
- `PUBLIC_POSTHOG_KEY` = Your PostHog key (actual value!)
- `PUBLIC_POSTHOG_HOST` = `https://eu.i.posthog.com`

## 6. Test Locally

After setting up `.env.local`:

```bash
# Run dev server
npm run dev

# In another terminal, run Convex dev
npx convex dev
```

Then test (use `127.0.0.1` not `localhost`):

1. Navigate to `http://127.0.0.1:5173/register`
2. Click "Create account" → should redirect to WorkOS AuthKit
3. Create a test account with Staging environment
4. Verify redirect back to `/inbox`
5. Test logout at `http://127.0.0.1:5173/logout`
   - Should clear cookies
   - Should redirect to WorkOS logout
   - Should return to homepage
6. Try accessing `/inbox` without auth → should redirect to login

## 7. Deploy to Production

Once local testing is successful:

```bash
git add .
git commit -m "Migrate to WorkOS AuthKit

- Replaced @mmailaender/convex-auth-svelte with WorkOS
- Updated all authentication flows
- Simplified login/register pages to use WorkOS hosted UI
- Added WorkOS credentials management via 1Password

Fixes: TypeError null.redirect bug
Benefits: Enterprise-ready auth, 1M MAU free tier"

git push origin main
```

## Success Criteria

After deployment, verify:

- ✅ User can register at https://www.synergyos.ai/register
- ✅ User can login at https://www.synergyos.ai/login
- ✅ Protected routes require authentication
- ✅ User data syncs to Convex
- ✅ No console errors
- ✅ Logout works and clears session

## Troubleshooting

### Error: "client_id is required"

- Make sure `PUBLIC_WORKOS_CLIENT_ID` is set in Vercel
- Check that the client ID starts with `client_`

### Error: "Invalid redirect_uri"

- Verify the redirect URI in WorkOS Dashboard matches exactly
- Check for trailing slashes

### Session not persisting

- Verify `WORKOS_COOKIE_PASSWORD` is set and is 32+ characters
- Check browser cookies are enabled

---

## Lessons Learned (From Actual Migration)

### 1. PUBLIC\_ Variables Must Have Actual Values

**Problem**: Vite bakes `PUBLIC_*` vars into client-side JS at build time  
**Solution**: Put actual values in `.env.local` (never references or placeholders)  
**See**: [patterns/auth-deployment.md#L10](dev-docs/2-areas/patterns/auth-deployment.md#L10)

### 2. Staging vs Production Credentials

**Problem**: Used staging credentials in production → "Invalid redirect URI"  
**Solution**: Separate environments, separate credentials in Vercel  
**See**: [patterns/auth-deployment.md#L60](dev-docs/2-areas/patterns/auth-deployment.md#L60)

### 3. www vs non-www Redirect URIs

**Problem**: Auth worked on `synergyos.ai` but failed on `www.synergyos.ai`  
**Solution**: Add BOTH to WorkOS redirect URIs  
**See**: [patterns/auth-deployment.md#L110](dev-docs/2-areas/patterns/auth-deployment.md#L110)

### 4. 127.0.0.1 vs localhost

**Problem**: WorkOS requires `127.0.0.1` for HTTP (not `localhost`)  
**Solution**: Use `127.0.0.1` in dev server and redirect URIs  
**See**: [patterns/auth-deployment.md#L310](dev-docs/2-areas/patterns/auth-deployment.md#L310)

### 5. Cookie Deletion Must Match Creation

**Problem**: Logout didn't work, cookies persisted  
**Solution**: Use exact same attributes (httpOnly, secure, sameSite) when deleting  
**See**: [patterns/auth-deployment.md#L160](dev-docs/2-areas/patterns/auth-deployment.md#L160)

### 6. Must Revoke Sessions on Auth Provider

**Problem**: User auto-logged back in after local logout  
**Solution**: Redirect to WorkOS logout endpoint with `session_id`  
**See**: [patterns/auth-deployment.md#L210](dev-docs/2-areas/patterns/auth-deployment.md#L210)

### 7. Check All Imports After Deleting Files

**Problem**: Build failed in CI with "Could not load [deleted-file]"  
**Solution**: `grep -r` for imports before deleting shared files  
**See**: [patterns/auth-deployment.md#L260](dev-docs/2-areas/patterns/auth-deployment.md#L260)

---

**Migration Status**: ✅ Completed Nov 2025

**For current implementation and troubleshooting**: See [dev-docs/2-areas/patterns/auth-deployment.md](dev-docs/2-areas/patterns/auth-deployment.md)
