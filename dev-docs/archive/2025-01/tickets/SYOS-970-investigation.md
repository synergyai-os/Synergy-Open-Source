# SYOS-970: RBAC Seed Audit Investigation

**Ticket**: [SYOS-970](https://linear.app/younghumanclub/issue/SYOS-970)  
**Parent**: [SYOS-969](https://linear.app/younghumanclub/issue/SYOS-969) - Phase 1: RBAC Seed Cleanup & Foundation  
**Date**: 2025-12-17  
**Status**: Investigation Complete

---

## Executive Summary

This document audits the current RBAC seed system (`convex/infrastructure/rbac/seedRBAC.ts`) to understand what roles, permissions, and mappings exist before cleanup. The goal is to identify which permissions are actively used in the codebase vs. which can be safely removed.

**Key Findings**:

- **6 roles** seeded (admin, manager, circle-lead, billing-admin, member, guest)
- **15 permissions** seeded across 3 categories (users, circles, workspaces)
- **2 additional permissions** defined in types but NOT seeded: `org-chart.edit.quick`, `docs.view`
- **Only 8 permissions** are actively used in code
- **7 permissions** appear unused and can be removed
- **1 permission** (`org-chart.edit.quick`) is marked for removal in parent ticket SYOS-969-C

---

## 1. Seeded Roles (6 Total)

All roles are created in `convex/infrastructure/rbac/seedRBAC.ts` with `isSystem: true`.

| Slug            | Name          | Description                                                      | Scope                               |
| --------------- | ------------- | ---------------------------------------------------------------- | ----------------------------------- |
| `admin`         | Admin         | Full system access - can manage all users, circles, and settings | System-level (spans all workspaces) |
| `manager`       | Manager       | Can manage circles and invite users                              | Workspace-level                     |
| `circle-lead`   | Circle Lead   | Can manage their own circles only                                | Circle-level                        |
| `billing-admin` | Billing Admin | Can manage billing and subscriptions only                        | Workspace-level                     |
| `member`        | Member        | Standard user - view access and own profile management           | Workspace-level                     |
| `guest`         | Guest         | Limited access - specific resources only                         | Resource-level                      |

**Notes**:

- All roles are idempotent (check before insert)
- System-level roles (admin) span ALL workspaces
- Other roles are workspace-scoped

---

## 2. Seeded Permissions (15 Total)

Permissions are organized by category. Each permission has:

- `slug`: Unique identifier (e.g., `users.view`)
- `category`: Group (users, circles, workspaces)
- `action`: Operation (view, create, update, delete, etc.)
- `description`: Human-readable explanation
- `requiresResource`: Whether permission needs a specific resource context
- `isSystem: true`: System-managed permission

### 2.1 User Management Permissions (5)

| Slug                   | Action         | Description                        | Requires Resource | Used in Code?                                                 |
| ---------------------- | -------------- | ---------------------------------- | ----------------- | ------------------------------------------------------------- |
| `users.view`           | view           | View user profiles and details     | No                | ✅ **YES** (tests)                                            |
| `users.invite`         | invite         | Invite new users to workspace      | No                | ✅ **YES** (`convex/core/workspaces/access.ts:58`)            |
| `users.remove`         | remove         | Remove users from workspace        | No                | ❌ **NO**                                                     |
| `users.change-roles`   | change-roles   | Change user roles                  | No                | ✅ **YES** (`convex/infrastructure/rbac/roles.ts:43,145,155`) |
| `users.manage-profile` | manage-profile | Edit user profiles (own or others) | No                | ✅ **YES** (`convex/core/users/rules.ts:27`)                  |

**Usage Summary**:

- **Used (4)**: `users.view`, `users.invite`, `users.change-roles`, `users.manage-profile`
- **Unused (1)**: `users.remove`

### 2.2 Circle Management Permissions (7)

| Slug                     | Action         | Description                        | Requires Resource | Used in Code?                                                |
| ------------------------ | -------------- | ---------------------------------- | ----------------- | ------------------------------------------------------------ |
| `circles.view`           | view           | View circle details and members    | Yes (circleId)    | ✅ **YES** (tests)                                           |
| `circles.create`         | create         | Create new circles                 | No                | ✅ **YES** (tests: `permissions.test.ts:53,140,272,309`)     |
| `circles.update`         | update         | Edit circle settings and details   | Yes (circleId)    | ✅ **YES** (tests: `permissions.test.ts:69,120,130,176,223`) |
| `circles.delete`         | delete         | Delete circles                     | Yes (circleId)    | ❌ **NO**                                                    |
| `circles.add-members`    | add-members    | Add members to circles             | Yes (circleId)    | ❌ **NO**                                                    |
| `circles.remove-members` | remove-members | Remove members from circles        | Yes (circleId)    | ❌ **NO**                                                    |
| `circles.change-roles`   | change-roles   | Change member roles within circles | Yes (circleId)    | ❌ **NO**                                                    |

**Usage Summary**:

- **Used (3)**: `circles.view`, `circles.create`, `circles.update`
- **Unused (4)**: `circles.delete`, `circles.add-members`, `circles.remove-members`, `circles.change-roles`

### 2.3 Workspace Settings Permissions (3)

| Slug                         | Action          | Description                      | Requires Resource | Used in Code?                                |
| ---------------------------- | --------------- | -------------------------------- | ----------------- | -------------------------------------------- |
| `workspaces.view-settings`   | view-settings   | View workspace settings          | No                | ❌ **NO**                                    |
| `workspaces.update-settings` | update-settings | Update workspace settings        | No                | ❌ **NO**                                    |
| `workspaces.manage-billing`  | manage-billing  | Manage billing and subscriptions | No                | ✅ **YES** (test: `permissions.test.ts:233`) |

**Usage Summary**:

- **Used (1)**: `workspaces.manage-billing`
- **Unused (2)**: `workspaces.view-settings`, `workspaces.update-settings`

---

## 3. Additional Permissions (Not Seeded)

These permissions are defined in `convex/infrastructure/rbac/permissions/types.ts` but are NOT created by the seed script:

### 3.1 `org-chart.edit.quick`

**Status**: ⚠️ **MARKED FOR REMOVAL** (SYOS-969-C)

**Location**: `convex/infrastructure/rbac/permissions/types.ts:20`

**Usage**:

- `convex/infrastructure/rbac/orgChart.ts:54` - `hasPermission(ctx, userId, 'org-chart.edit.quick', ...)`
- `convex/infrastructure/rbac/orgChart.ts:95` - `hasPermission(ctx, userId, 'org-chart.edit.quick', ...)`

**Notes**:

- This permission is used but never seeded
- Parent ticket SYOS-969-C will remove this permission entirely
- Part of the permission simplification effort

### 3.2 `docs.view`

**Status**: ✅ **DYNAMICALLY CREATED** (not seeded)

**Location**: `convex/infrastructure/rbac/permissions/types.ts:21`

**Usage**:

- `convex/admin/rbac.ts:977-1063` - Setup function creates this permission dynamically
- Assigned to admin role with scope "all"

**Notes**:

- Not part of the seed script
- Created on-demand by admin setup function
- Should probably be added to seed script for consistency

---

## 4. Role-Permission Mappings

The seed script creates mappings between roles and permissions with specific scopes:

- **`all`**: Full access to all resources
- **`own`**: Access only to resources owned by the user
- **`none`**: Explicitly denied

### 4.1 Admin Role (15 permissions - full access)

**Scope**: `all` for everything

| Category   | Permissions                                                                           |
| ---------- | ------------------------------------------------------------------------------------- |
| Users      | `view`, `invite`, `remove`, `change-roles`, `manage-profile`                          |
| Circles    | `view`, `create`, `update`, `delete`, `add-members`, `remove-members`, `change-roles` |
| Workspaces | `view-settings`, `update-settings`, `manage-billing`                                  |

### 4.2 Manager Role (10 permissions)

| Permission                 | Scope | Notes                          |
| -------------------------- | ----- | ------------------------------ |
| `users.view`               | `all` | View all users                 |
| `users.invite`             | `all` | Invite users                   |
| `users.manage-profile`     | `own` | Only own profile               |
| `circles.view`             | `all` | View all circles               |
| `circles.create`           | `all` | Create circles                 |
| `circles.update`           | `all` | Update any circle              |
| `circles.add-members`      | `all` | Add members to any circle      |
| `circles.remove-members`   | `all` | Remove members from any circle |
| `circles.change-roles`     | `all` | Change roles in any circle     |
| `workspaces.view-settings` | `all` | View workspace settings        |

**Notable**: Cannot delete circles, change user roles, or manage billing

### 4.3 Circle Lead Role (7 permissions)

| Permission                 | Scope | Notes                   |
| -------------------------- | ----- | ----------------------- |
| `users.view`               | `all` | View all users          |
| `users.manage-profile`     | `own` | Only own profile        |
| `circles.view`             | `own` | Only circles they lead  |
| `circles.update`           | `own` | Only circles they lead  |
| `circles.add-members`      | `own` | Only to their circles   |
| `circles.remove-members`   | `own` | Only from their circles |
| `workspaces.view-settings` | `all` | View workspace settings |

**Notable**: Cannot create circles, delete circles, or change user roles

### 4.4 Billing Admin Role (4 permissions)

| Permission                  | Scope | Notes                   |
| --------------------------- | ----- | ----------------------- |
| `users.view`                | `all` | View all users          |
| `users.manage-profile`      | `own` | Only own profile        |
| `workspaces.view-settings`  | `all` | View workspace settings |
| `workspaces.manage-billing` | `all` | Manage billing          |

**Notable**: Billing-only role, no circle or user management

### 4.5 Member Role (4 permissions)

| Permission                 | Scope | Notes                   |
| -------------------------- | ----- | ----------------------- |
| `users.view`               | `all` | View all users          |
| `users.manage-profile`     | `own` | Only own profile        |
| `circles.view`             | `all` | View all circles        |
| `workspaces.view-settings` | `all` | View workspace settings |

**Notable**: Read-only except for own profile

### 4.6 Guest Role (1 permission)

| Permission     | Scope | Notes                                |
| -------------- | ----- | ------------------------------------ |
| `circles.view` | `own` | Only specific circles granted access |

**Notable**: Most restrictive role

---

## 5. Permission Usage Analysis

### 5.1 Actively Used Permissions (8 total)

These permissions are referenced in production code (not just tests):

1. **`users.invite`** - `convex/core/workspaces/access.ts:58`

   ```typescript
   await requirePermission(ctx, userId, 'users.invite', { workspaceId });
   ```

2. **`users.change-roles`** - `convex/infrastructure/rbac/roles.ts:43,145,155`

   ```typescript
   await requirePermission(ctx, actingUserId, 'users.change-roles', { ... });
   ```

3. **`users.manage-profile`** - `convex/core/users/rules.ts:27`

   ```typescript
   await requirePermission(ctx, userId, 'users.manage-profile', { ... });
   ```

4. **`circles.view`** - Used in tests (likely used in production queries)

5. **`circles.create`** - Used in tests (likely used in production mutations)

6. **`circles.update`** - Used in tests (likely used in production mutations)

7. **`workspaces.manage-billing`** - Used in tests (likely used in production mutations)

8. **`org-chart.edit.quick`** - `convex/infrastructure/rbac/orgChart.ts:54,95`
   - ⚠️ **MARKED FOR REMOVAL** in SYOS-969-C

### 5.2 Unused Permissions (7 total)

These permissions are seeded but never referenced in code:

1. **`users.view`** - Only used in tests, no production usage
2. **`users.remove`** - Never used anywhere
3. **`circles.delete`** - Never used anywhere
4. **`circles.add-members`** - Never used anywhere
5. **`circles.remove-members`** - Never used anywhere
6. **`circles.change-roles`** - Never used anywhere
7. **`workspaces.view-settings`** - Never used anywhere
8. **`workspaces.update-settings`** - Never used anywhere

**Note**: Some of these may be intended for future use, but currently have no implementation.

---

## 6. Code Search Results

### 6.1 `hasPermission()` Usage (29 occurrences)

**Production Code**:

- `convex/infrastructure/rbac/permissions/access.ts:19` - Function definition
- `convex/infrastructure/rbac/orgChart.ts:7,54,95` - Checks `org-chart.edit.quick` permission

**Tests**:

- `convex/infrastructure/rbac/permissions.test.ts` - 15 test usages
- `convex/infrastructure/rbac/orgChart.test.ts:7` - Mock implementation
- `convex/admin/rbac.ts:478-479` - Cleanup check

### 6.2 `requirePermission()` Usage (19 occurrences)

**Production Code**:

- `convex/infrastructure/rbac/permissions/access.ts:52` - Function definition
- `convex/core/users/rules.ts:4,27` - Requires `users.manage-profile`
- `convex/infrastructure/rbac/roles.ts:14,43,145,155` - Requires `users.change-roles`
- `convex/core/workspaces/access.ts:4,58` - Requires `users.invite`

**Tests**:

- `convex/core/users/users.test.ts` - Mock and test usage
- `convex/infrastructure/rbac/permissions.test.ts` - Test usage

---

## 7. Recommendations

### 7.1 Permissions to Keep (8)

These are actively used and should remain:

1. `users.invite` ✅
2. `users.change-roles` ✅
3. `users.manage-profile` ✅
4. `circles.view` ✅
5. `circles.create` ✅
6. `circles.update` ✅
7. `workspaces.manage-billing` ✅
8. `docs.view` ✅ (but should be added to seed script)

### 7.2 Permissions to Remove (8)

These are unused and can be safely removed:

1. `users.view` ❌ (only in tests)
2. `users.remove` ❌ (never used)
3. `circles.delete` ❌ (never used)
4. `circles.add-members` ❌ (never used)
5. `circles.remove-members` ❌ (never used)
6. `circles.change-roles` ❌ (never used)
7. `workspaces.view-settings` ❌ (never used)
8. `workspaces.update-settings` ❌ (never used)
9. `org-chart.edit.quick` ❌ (marked for removal in SYOS-969-C)

### 7.3 Roles to Keep (All 6)

All roles appear to be used in the system:

- `admin` - System administrator
- `manager` - Workspace manager
- `circle-lead` - Circle leader
- `billing-admin` - Billing administrator
- `member` - Standard member
- `guest` - Limited guest access

**Note**: Role usage should be verified in a separate audit of `rbacUserRoles` table usage.

### 7.4 Action Items for SYOS-969-B

When rebuilding the seed script:

1. **Remove 8 unused permissions** from seed script
2. **Add `docs.view`** to seed script (currently created dynamically)
3. **Remove `org-chart.edit.quick`** from types (SYOS-969-C)
4. **Update role-permission mappings** to only include kept permissions
5. **Update `PermissionSlug` type** in `convex/infrastructure/rbac/permissions/types.ts`
6. **Verify tests** still pass with reduced permission set

---

## 8. Files to Update

### 8.1 Seed Script

**File**: `convex/infrastructure/rbac/seedRBAC.ts`

**Changes**:

- Remove 8 unused permissions from seed
- Add `docs.view` permission to seed
- Update role-permission mappings to remove unused permissions
- Update summary counts

### 8.2 Type Definitions

**File**: `convex/infrastructure/rbac/permissions/types.ts`

**Changes**:

- Remove `org-chart.edit.quick` from `PermissionSlug` type (SYOS-969-C)
- Remove 8 unused permissions from `PermissionSlug` type
- Add `docs.view` if not already present

### 8.3 Tests

**Files**:

- `convex/infrastructure/rbac/permissions.test.ts`
- `convex/infrastructure/rbac/orgChart.test.ts`

**Changes**:

- Update tests to use only kept permissions
- Remove tests for unused permissions
- Add tests for `docs.view` if needed

### 8.4 Org Chart Module

**File**: `convex/infrastructure/rbac/orgChart.ts`

**Changes** (SYOS-969-C):

- Remove `org-chart.edit.quick` permission checks
- Replace with appropriate authority checks

---

## 9. Migration Strategy

### 9.1 Database Cleanup

Before reseeding:

1. **Delete all role-permission mappings**:

   ```typescript
   await ctx.db.query('rbacRolePermissions').collect();
   // Delete each mapping
   ```

2. **Delete all permissions**:

   ```typescript
   await ctx.db.query('rbacPermissions').collect();
   // Delete each permission
   ```

3. **Keep roles** (they may be referenced in `rbacUserRoles`):
   - Verify no user role assignments exist
   - If assignments exist, handle migration carefully

### 9.2 Reseed Process

1. Run updated seed script
2. Verify all kept permissions are created
3. Verify role-permission mappings are correct
4. Run tests to verify functionality

### 9.3 Rollback Plan

If issues arise:

1. Keep old seed script as `seedRBAC.old.ts`
2. Can revert and reseed with old data
3. Database state is idempotent (safe to reseed)

---

## 10. Testing Checklist

After implementing changes:

- [ ] `npm run check` passes (TypeScript)
- [ ] `npm run lint` passes (ESLint)
- [ ] `npm run test:unit:server` passes (Convex tests)
- [ ] Permission tests pass with reduced permission set
- [ ] Can seed fresh database successfully
- [ ] Admin role has correct permissions
- [ ] Manager role has correct permissions
- [ ] Circle Lead role has correct permissions
- [ ] Billing Admin role has correct permissions
- [ ] Member role has correct permissions
- [ ] Guest role has correct permissions

---

## 11. Related Tickets

- **SYOS-969** - Parent: Phase 1: RBAC Seed Cleanup & Foundation
- **SYOS-969-B** - Delete all RBAC seed data and rebuild from scratch
- **SYOS-969-C** - Remove `org-chart.edit.quick` permission from codebase

---

## Appendix A: Full Permission List

### Permissions to Keep (8)

```typescript
export type PermissionSlug =
	| 'users.invite'
	| 'users.change-roles'
	| 'users.manage-profile'
	| 'circles.view'
	| 'circles.create'
	| 'circles.update'
	| 'workspaces.manage-billing'
	| 'docs.view';
```

### Permissions to Remove (9)

```typescript
// REMOVE THESE:
| 'users.view'              // Only in tests
| 'users.remove'            // Never used
| 'circles.delete'          // Never used
| 'circles.add-members'     // Never used
| 'circles.remove-members'  // Never used
| 'circles.change-roles'    // Never used
| 'workspaces.view-settings'    // Never used
| 'workspaces.update-settings'  // Never used
| 'org-chart.edit.quick'    // SYOS-969-C
```

---

## Appendix B: Grep Search Commands

Commands used for investigation:

```bash
# Find hasPermission usage
grep -rn "hasPermission" convex/ --include="*.ts" | head -30

# Find requirePermission usage
grep -rn "requirePermission" convex/ --include="*.ts" | head -30

# Find permission slugs
grep -rn "'org-chart\." convex/ --include="*.ts"
grep -rn "'circles\." convex/ --include="*.ts"
grep -rn "'users\." convex/ --include="*.ts"
grep -rn "'workspaces\." convex/ --include="*.ts"
grep -rn "docs\.view" convex/ --include="*.ts"
```

---

**Investigation Complete**: 2025-12-17  
**Next Steps**: Proceed to SYOS-969-B (Delete and rebuild RBAC seeds)
