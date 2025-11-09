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

## 2. Store Credentials in 1Password

Generate a secure cookie password and store all credentials:

```bash
# Generate a secure cookie password (32+ characters)
openssl rand -base64 32

# Create 1Password item with all credentials
op item create \
  --vault SYOS \
  --category "API Credential" \
  --title "WorkOS-Production" \
  'client-id[password]=<your_workos_client_id>' \
  'api-key[password]=<your_workos_api_key>' \
  'cookie-password[password]=<generated_cookie_password>'
```

## 3. Update Local Environment Files

⚠️ **CRITICAL**: `PUBLIC_*` variables need **actual values** in `.env.local` (not 1Password references)!

**Why**: Vite bakes `PUBLIC_*` into client-side JavaScript at build time. It reads `.env` literally and doesn't execute `op run`.

**`.env`** (1Password references for server-side vars):
```env
# WorkOS Authentication (Staging for local dev)
WORKOS_API_KEY=op://SYOS/WorkOS-Staging/api-key
WORKOS_CLIENT_ID=op://SYOS/WorkOS-Staging/client-id
WORKOS_REDIRECT_URI=http://127.0.0.1:5173/auth/callback
WORKOS_COOKIE_PASSWORD=op://SYOS/WorkOS-Staging/cookie-password
```

**`.env.local`** (actual values for PUBLIC_ vars - not committed to git):
```env
# ⚠️ These need ACTUAL values (not op:// references)!
PUBLIC_WORKOS_CLIENT_ID=client_01K9STAGING_ACTUAL_ID_HERE
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
PUBLIC_POSTHOG_KEY=phc_your_actual_key
PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com

# You can also put server-side vars here to avoid op run
WORKOS_CLIENT_ID=client_01K9STAGING_ACTUAL_ID_HERE
WORKOS_API_KEY=sk_staging_actual_key_here
WORKOS_COOKIE_PASSWORD=your_32_char_password
WORKOS_REDIRECT_URI=http://127.0.0.1:5173/auth/callback
```

**To get actual values**:
```bash
# Get from 1Password
op read "op://SYOS/WorkOS-Staging/client-id"
op read "op://SYOS/WorkOS-Staging/api-key"
```

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
- `WORKOS_COOKIE_PASSWORD` = (from 1Password)
- `PUBLIC_CONVEX_URL` = Your Convex production URL (actual value!)
- `PUBLIC_POSTHOG_KEY` = Your PostHog key (actual value!)
- `PUBLIC_POSTHOG_HOST` = `https://eu.i.posthog.com`

## 6. Test Locally

After setting up the environment variables:

```bash
# If you put actual values in .env.local, just run:
npm run dev

# OR if using op run (but PUBLIC_ vars must still be in .env.local):
op run -- npm run dev
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

### 1. PUBLIC_ Variables Must Have Actual Values
**Problem**: Vite bakes `PUBLIC_*` vars into client-side JS at build time  
**Solution**: Put actual values in `.env.local`, not 1Password references  
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

