# How to Assign Yourself Admin Role

## Step 1: Find Your User ID

You have a few options to find your user ID:

### Option A: From Browser Console (Easiest)

1. Open your SynergyOS app in the browser
2. Open Developer Console (F12 or Cmd+Option+I)
3. Run this in the console:

```javascript
// Get your userId from the page data
const userId = document.querySelector('[data-user-id]')?.getAttribute('data-user-id');
console.log('Your User ID:', userId);
```

Or check the page data directly:

```javascript
// In browser console on any authenticated page
fetch('/api/user-id')
	.then((r) => r.json())
	.then(console.log);
```

### Option B: From Convex Dashboard

1. Go to your Convex Dashboard: https://dashboard.convex.dev
2. Select your project
3. Go to "Data" tab
4. Query the `users` table
5. Find your user by email
6. Copy the `_id` field (it looks like `j1234567890abcdef`)

### Option C: Query via Convex Dashboard

1. Go to Convex Dashboard → Functions
2. Run this query:

```javascript
// In Convex Dashboard Functions tab
users.getCurrentUser({ sessionId: 'your-session-id' });
```

But you'll need your sessionId, so this is harder.

### Option D: Check Browser Local Storage / Network Tab

1. Open DevTools → Network tab
2. Look at any API request to Convex
3. Check the response - it might include userId
4. Or check Application → Local Storage for any stored user data

## Step 2: Assign Admin Role

Once you have your userId, run one of these:

### Via Convex CLI (Recommended)

```bash
npx convex run rbac/setupAdmin:setupAdmin '{"userId":"YOUR_USER_ID_HERE"}'
```

**Important**:

- Replace `YOUR_USER_ID_HERE` with your actual userId (e.g., `"j1234567890abcdef"`)
- Keep the quotes around the userId
- Don't include `organizationId` - leave it out for global admin role

### Via Convex Dashboard

1. Go to Convex Dashboard → Functions
2. Find `rbac/setupAdmin:setupAdmin`
3. Click "Run"
4. Enter: `{"userId": "YOUR_USER_ID_HERE"}`
5. Click "Run Function"

## Step 3: Verify It Worked

### Option A: Try Accessing Admin Route

1. Navigate to `/admin` in your app
2. If you see the admin dashboard, it worked!

### Option B: Verify via Query

Run this in Convex Dashboard:

```javascript
rbac/setupAdmin:verifyAdminSetup({ userId: "YOUR_USER_ID_HERE" })
```

It should return:

```json
{
  "isAdmin": true,
  "roles": [...],
  "permissions": [...]
}
```

## Troubleshooting

**Error: "Admin role not found"**

- You need to seed RBAC data first
- Run: `npx convex run rbac/seedRBAC:seedRBAC {}`

**Error: "User not found"**

- Double-check your userId
- Make sure you're logged in and the user exists

**Still can't access /admin**

- Make sure you didn't include `organizationId` (needs to be global admin)
- Check browser console for errors
- Try logging out and back in

## Quick Test

After assigning admin role, you can test the admin check query:

```bash
# In Convex Dashboard Functions, run:
rbac/permissions:isSystemAdmin({ sessionId: "your-session-id" })
```

This should return `true` if you're an admin.
