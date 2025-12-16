# Seed Scripts Analysis

## Overview

This document analyzes all seed scripts in the codebase, explains what each does, and compares them to actual code implementation to identify what's used vs. what's not.

---

## Seed Scripts Found

### 1. `convex/infrastructure/rbac/seedRBAC.ts`

**Purpose**: Seeds RBAC (Role-Based Access Control) roles, permissions, and role-permission mappings.

**What it creates**:

- **6 Roles**:
  - `admin` - Full system access
  - `manager` - Can manage teams and invite users
  - `circle-lead` - Can manage their own circles only
  - `billing-admin` - Can manage billing and subscriptions only
  - `member` - Standard user - view access and own profile management
  - `guest` - Limited access - specific resources only

- **15 Permissions**:
  - **User Management (5)**: `users.view`, `users.invite`, `users.remove`, `users.change-roles`, `users.manage-profile`
  - **Circle Management (7)**: `circles.view`, `circles.create`, `circles.update`, `circles.delete`, `circles.add-members`, `circles.remove-members`, `circles.change-roles`
  - **Workspace Settings (3)**: `workspaces.view-settings`, `workspaces.update-settings`, `workspaces.manage-billing`

- **Role-Permission Mappings**: Maps each role to its permissions with scope (`all`, `own`, `none`)

**Usage**:

- ✅ Used in tests: `convex/infrastructure/rbac/permissions.test.ts` (called 5 times)
- ✅ Referenced in setup: `convex/infrastructure/rbac/setupAdmin.ts` checks for admin role
- ✅ Referenced in admin: `convex/admin/rbac.ts` checks for admin role
- ✅ Manual execution: Can be run via CLI: `npx convex run infrastructure/rbac/seedRBAC:seedRBAC`

**Status**: ✅ **ACTIVE** - Used in tests and required for RBAC system

---

### 2. `convex/admin/seedOrgChart.ts`

**Purpose**: Seeds test data for org chart visualization - creates a nested hierarchy of circles with roles.

**What it creates**:

- **Root Circle**: "Active Platforms"
- **Level 1 Circles (3)**: Guidelines API, Platform Infrastructure, Developer Experience
- **Level 2 Circles (6)**: 2-3 sub-circles per Level 1 circle
- **Roles**: Each circle gets 3-10 randomly generated roles from a pool of 20 role names

**Exports**:

- `seedTestData` - Mutation (requires sessionId)
- `seedTestDataInternal` - Internal mutation (no sessionId required)

**Usage**:

- ✅ Used by script wrapper: `scripts/seed-org-chart.ts` calls `seedTestDataInternal`
- ✅ Can be run manually via CLI: `npx convex run admin/seedOrgChart:seedTestDataInternal --arg workspaceId="..."`

**Status**: ✅ **ACTIVE** - Development/testing tool

---

### 3. `scripts/seed-org-chart.ts`

**Purpose**: Script wrapper for `seedOrgChart.ts` - allows running from command line with deploy key.

**What it does**:

- Loads environment variables from `.env.local`
- Uses Convex HTTP client with deploy key
- Calls `internal.admin.seedOrgChart.seedTestDataInternal`
- Hardcoded workspace ID: `mx7ecpdw61qbsfj3488xaxtd7x7veq2w`

**Usage**:

- ✅ Can be run manually: `CONVEX_DEPLOY_KEY=your_key npx tsx scripts/seed-org-chart.ts`

**Status**: ✅ **ACTIVE** - Development/testing tool

---

### 4. `convex/infrastructure/rbac/permissions/seed.ts`

**Purpose**: Empty placeholder function.

**What it does**:

- Exports `listPermissionSeeds()` that returns an empty array `[]`

**Usage**:

- ❌ **NOT USED** - Empty placeholder, no references found

**Status**: ⚠️ **UNUSED** - Should be removed or implemented

---

### 5. `convex/features/meetings/helpers/templates/seed.ts`

**Purpose**: Seeds default meeting templates for a workspace.

**What it creates**:

- **Governance Template**:
  - Check-in Round (5 min)
  - Agenda Building
  - Closing Round (5 min)

- **Weekly Tactical Template**:
  - Check-in Round (5 min)
  - Checklists (10 min)
  - Metrics Review (10 min)
  - Project Updates (15 min)
  - Agenda Items
  - Closing Round (5 min)

**Exports**:

- `seedDefaultTemplates` - Mutation (requires sessionId)
- `seedDefaultTemplatesInternal` - Internal mutation (no sessionId required)

**Usage**:

- ✅ **AUTOMATICALLY CALLED** when workspace is created: `convex/core/workspaces/lifecycle.ts` line 233
- ✅ Used in tests: `convex/features/meetings/helpers/templates.test.ts`
- ✅ Can be run manually: Referenced in UI at `src/routes/(authenticated)/w/[slug]/meetings/+page.svelte`

**Status**: ✅ **ACTIVE** - Automatically runs on workspace creation

---

### 6. `convex/admin/seedRoleTemplates.ts`

**Purpose**: Seeds system-level role templates that are available to all workspaces.

**What it creates**:

- **Circle Lead** (core, required) - Leads the circle and coordinates work
- **Facilitator** (core, optional) - Facilitates meetings and governance
- **Secretary** (core, optional) - Manages records and communications

**Usage**:

- ✅ Used when creating circles: `convex/core/circles/circleCoreRoles.ts` queries for core templates
- ✅ Referenced in validation: `convex/admin/validateRoleTemplates.ts` warns if templates missing
- ✅ Can be run manually: `npx convex run admin/seedRoleTemplates:seedRoleTemplates`

**Status**: ✅ **ACTIVE** - Required for circle creation workflow

---

## Comparison: Seed Scripts vs. Actual Implementation

### RBAC Roles Mismatch ⚠️

**Roles in `seedRBAC.ts`**:

- `admin`
- `manager`
- `circle-lead`
- `billing-admin`
- `member`
- `guest`

**Roles actually used in code** (`convex/infrastructure/rbac/scopeHelpers.ts`):

- **System roles**: `platform_admin`, `platform_manager`, `developer`, `support`
- **Workspace roles**: `billing_admin`, `workspace_admin`, `member`

**Issue**: The seed script creates roles (`admin`, `manager`, `circle-lead`, `guest`) that don't match the types defined in the code (`platform_admin`, `workspace_admin`, etc.). However, the code does check for `admin` role slug in `convex/infrastructure/rbac/permissions/access.ts` line 78, suggesting there may be legacy compatibility.

**Recommendation**: Review and align seed script roles with actual type definitions, or document the mapping/legacy support.

---

### Permissions: Seed vs. Implementation

**Permissions in `seedRBAC.ts`** (15 total):

- ✅ All 15 permissions are defined in `convex/infrastructure/rbac/permissions/types.ts`
- ✅ Most are actively used:
  - `users.change-roles` - Used in `convex/infrastructure/rbac/roles.ts`
  - `users.invite` - Used in `convex/core/workspaces/access.ts`
  - `users.manage-profile` - Used in `convex/core/users/access.ts`
  - `circles.create`, `circles.update` - Used in tests and permission checks
  - `workspaces.manage-billing` - Used in tests

**Missing from seed** (but defined in types):

- `org-chart.edit.quick` - Used in `convex/infrastructure/rbac/orgChart.ts`
- `docs.view` - Created manually in `convex/admin/rbac.ts` (line 988-1007), not seeded

**Recommendation**: Add `org-chart.edit.quick` and `docs.view` to seed script for completeness.

---

### Role Templates: Seed vs. Implementation

**Templates in `seedRoleTemplates.ts`**:

- ✅ `Circle Lead` - Used in `convex/core/circles/circleCoreRoles.ts`
- ✅ `Facilitator` - Available for use
- ✅ `Secretary` - Available for use

**Status**: All seeded templates are properly used in the codebase.

---

### Meeting Templates: Seed vs. Implementation

**Templates in `seed.ts`**:

- ✅ `Governance` - Created and available
- ✅ `Weekly Tactical` - Created and available

**Status**: Templates are automatically created when workspace is created and are used in the meetings feature.

---

## Summary Table

| Seed Script                  | Status    | Used In Production | Used In Tests | Notes                                   |
| ---------------------------- | --------- | ------------------ | ------------- | --------------------------------------- |
| `seedRBAC.ts`                | ✅ Active | ✅ Yes             | ✅ Yes        | Role names don't match type definitions |
| `seedOrgChart.ts`            | ✅ Active | ❌ Dev only        | ✅ Yes        | Test data generator                     |
| `scripts/seed-org-chart.ts`  | ✅ Active | ❌ Dev only        | ❌ No         | CLI wrapper                             |
| `permissions/seed.ts`        | ⚠️ Unused | ❌ No              | ❌ No         | Empty placeholder                       |
| `meetings/templates/seed.ts` | ✅ Active | ✅ Yes             | ✅ Yes        | Auto-runs on workspace creation         |
| `seedRoleTemplates.ts`       | ✅ Active | ✅ Yes             | ❌ No         | Required for circle creation            |

---

## Recommendations

1. **Fix RBAC Role Mismatch**: Update `seedRBAC.ts` to create roles matching `SystemRole` and `WorkspaceRole` types, or document legacy compatibility.

2. **Add Missing Permissions**: Add `org-chart.edit.quick` and `docs.view` to `seedRBAC.ts`.

3. **Remove Unused Seed**: Delete or implement `convex/infrastructure/rbac/permissions/seed.ts` (currently empty).

4. **Document Seed Dependencies**: Add comments explaining which seeds must run before others (e.g., `seedRBAC` before `seedRoleTemplates`).

5. **Consider Consolidation**: Meeting templates seed runs automatically; consider if RBAC seed should also run automatically on first deployment.
