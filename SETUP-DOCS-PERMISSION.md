# Setup Documentation Access Control

This guide walks you through setting up RBAC so that only you can view documentation pages.

## Overview

After completing these steps:

- ✅ All `/dev-docs/*` routes will require `docs.view` permission
- ✅ All `/marketing-docs/*` routes will require `docs.view` permission
- ✅ Only users with the `docs.view` permission (via admin role) can access docs
- ✅ You'll have the admin role with `docs.view` permission

## Step-by-Step Setup

### Step 1: Create the `docs.view` Permission

1. Navigate to `/admin/rbac` in your application
2. Click **"Create Permission"** button in the Quick Actions Bar
3. Fill in the form:
   - **Slug**: `docs.view`
   - **Category**: `docs`
   - **Action**: `view`
   - **Description**: `View documentation pages`
   - **Requires Resource**: Leave unchecked
4. Click **"Create Permission"**

### Step 2: Assign Permission to Admin Role

1. Find the **"admin"** role in the Roles tab
2. Click **"View Details"** on the admin role
3. Click **"Add Permission"** button
4. In the modal:
   - **Role**: Should be pre-filled with "admin"
   - **Permission**: Select `docs.view - View documentation pages`
   - **Scope**: Select `all` (allows access to all docs)
5. Click **"Assign Permission"**

### Step 3: Assign Admin Role to Yourself

1. Click **"Assign Role to User"** button in Quick Actions Bar
2. Fill in the form:
   - **User**: Select yourself (your email)
   - **Role**: Select `Admin (admin)`
3. Click **"Assign Role"**

**Done!** You now have the `docs.view` permission via the admin role.

### Step 4: Verify Setup

After running the mutation, verify:

1. **Check Permission Created**:
   - Go to **Functions** → **admin/rbac** → `listPermissions`
   - Run it and verify `docs.view` appears in the list

2. **Check Your Roles**:
   - Go to **Functions** → **admin/rbac** → `getUserRoles`
   - Run it with your userId
   - Verify you have the `admin` role assigned (global scope, no organizationId)

3. **Check Permission Assignment**:
   - Go to **Functions** → **admin/rbac** → `getRolePermissions`
   - Run it with the admin roleId
   - Verify `docs.view` appears in the permissions list

### Step 3: Test Access

1. **As You (Should Work)**:
   - Visit `/dev-docs/README` - should load successfully
   - Visit `/marketing-docs/README` - should load successfully

2. **As Another User (Should Fail)**:
   - Have another user try to access `/dev-docs/README`
   - Should see 403 error: "Permission denied: docs.view permission required"

## What Was Changed

### Code Changes

1. **Added `docs.view` permission type** (`convex/rbac/permissions.ts`):
   - Added to `PermissionSlug` type union

2. **Created admin helper** (`convex/admin/rbac.ts`):
   - `setupDocsPermission` mutation - one-click setup

3. **Added permission checks** (`src/routes/dev-docs/[...path]/+page.server.ts`):
   - Checks for `docs.view` permission before serving docs

4. **Added permission checks** (`src/routes/marketing-docs/[...path]/+page.server.ts`):
   - Checks for `docs.view` permission before serving docs

## Manual Setup (Alternative)

If you prefer to set up manually:

### 1. Create Permission

```typescript
// Run in Convex dashboard: admin/rbac → createPermission (if exists)
// Or use admin/rbac → assignPermissionToRole with a new permission
```

### 2. Assign Permission to Admin Role

```typescript
// Run: admin/rbac → assignPermissionToRole
// roleId: <admin role ID>
// permissionId: <docs.view permission ID>
// scope: "all"
```

### 3. Assign Admin Role to Yourself

```typescript
// Run: admin/rbac → assignRoleToUser
// userId: <your user ID>
// roleId: <admin role ID>
// (no organizationId or teamId - global scope)
```

## Troubleshooting

### "Permission denied" but you're an admin

1. Check you have the `admin` role assigned globally (no organizationId):

   ```typescript
   // Run: admin/rbac → getUserRoles
   // Verify admin role has no organizationId or teamId
   ```

2. Check the admin role has `docs.view` permission:
   ```typescript
   // Run: admin/rbac → getRolePermissions
   // Verify docs.view appears with scope "all"
   ```

### "Admin role not found"

Run the RBAC seed first:

```bash
npx convex run rbac/seedRBAC:seedRBAC
```

### Permission check fails

1. Verify sessionId is being passed correctly
2. Check browser console for errors
3. Verify Convex deployment is up to date

## Future: Granting Access to Others

To grant docs access to another user:

1. **Option 1: Assign Admin Role** (full system access):

   ```typescript
   // Run: admin/rbac → assignRoleToUser
   // userId: <their user ID>
   // roleId: <admin role ID>
   ```

2. **Option 2: Create Custom Role** (docs-only access):

   ```typescript
   // 1. Create role: admin/rbac → createRole
   //    slug: "docs-viewer", name: "Documentation Viewer"

   // 2. Assign permission: admin/rbac → assignPermissionToRole
   //    roleId: <new role ID>
   //    permissionId: <docs.view permission ID>
   //    scope: "all"

   // 3. Assign to user: admin/rbac → assignRoleToUser
   //    userId: <their user ID>
   //    roleId: <new role ID>
   ```

## Security Notes

- ✅ Permission checks happen server-side (can't be bypassed)
- ✅ Session validation ensures users can't impersonate others
- ✅ RBAC system supports fine-grained access control
- ✅ Audit logging tracks all permission checks (in `permissionAuditLog` table)

## Related Documentation

- RBAC System: `dev-docs/2-areas/rbac/RBAC-SUMMARY.md`
- Admin Functions: `convex/admin/rbac.ts`
- Permission System: `convex/rbac/permissions.ts`
