# WorkOS AuthKit Setup Instructions

This document contains the manual setup steps required to complete the WorkOS AuthKit migration.

## 1. WorkOS Account Setup

### Create WorkOS Account and Project

1. Go to https://workos.com and sign up
2. Create a new project named "SynergyOS Production"
3. In WorkOS Dashboard, navigate to **Configuration** → **Redirects**
4. Add these redirect URIs:
   - `http://localhost:5173/auth/callback` (development)
   - `https://www.synergyos.ai/auth/callback` (production)

### Get API Credentials

From the WorkOS Dashboard:
1. Go to **API Keys** section
2. Copy your **Client ID** (starts with `client_`)
3. Copy your **API Key** (starts with `sk_`)

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

## 3. Update Local Environment File

Add these lines to your `.env` file (using 1Password references):

```env
# WorkOS Authentication
WORKOS_API_KEY=op://SYOS/WorkOS-Production/api-key
WORKOS_CLIENT_ID=op://SYOS/WorkOS-Production/client-id
PUBLIC_WORKOS_CLIENT_ID=op://SYOS/WorkOS-Production/client-id
WORKOS_REDIRECT_URI=http://localhost:5173/auth/callback
WORKOS_COOKIE_PASSWORD=op://SYOS/WorkOS-Production/cookie-password
```

## 4. Add to Convex Dashboard

Go to https://dashboard.convex.dev and add these environment variables:
- `WORKOS_CLIENT_ID`
- `WORKOS_API_KEY`

## 5. Add to Vercel

Go to Vercel Dashboard → Project → Settings → Environment Variables and add:
- `WORKOS_API_KEY` = (from 1Password)
- `WORKOS_CLIENT_ID` = (from 1Password)
- `PUBLIC_WORKOS_CLIENT_ID` = (from 1Password - this is safe to be public)
- `WORKOS_REDIRECT_URI` = `https://www.synergyos.ai/auth/callback`
- `WORKOS_COOKIE_PASSWORD` = (from 1Password)

## 6. Test Locally

After setting up the environment variables:

```bash
# Run with 1Password secrets
op run -- npm run dev
```

Then test:
1. Navigate to http://localhost:5173/register
2. Click "Create account" → should redirect to WorkOS
3. Create a test account
4. Verify redirect back to /inbox
5. Test logout at http://localhost:5173/logout
6. Try accessing /inbox without auth → should redirect to login

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

**Next Steps:** Follow steps 1-7 above, then delete this file after successful deployment.

