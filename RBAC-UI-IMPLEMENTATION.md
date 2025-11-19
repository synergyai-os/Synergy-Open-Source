# RBAC UI Implementation Plan

## Overview

Replace the current RBAC admin page with a comprehensive, intuitive UI that allows:

1. **Creating Permissions** - Full form with slug, category, action, description, requiresResource
2. **Creating Roles** - Full form with slug, name, description
3. **Assigning Permissions to Roles** - With scope selector (all/own/none)
4. **Viewing Role Details** - See all permissions with ability to add/remove
5. **Assigning Roles to Users** - Select user, role, and scope

## Implementation Steps

### Step 1: Remove One-Off Setup Button

- Remove `setupDocsPermission` function and related state
- Remove the conditional button/badge

### Step 2: Add Create Permission Modal

- Form fields: slug, category, action, description, requiresResource (checkbox)
- Validation: slug format (category.action), unique check
- Call `api.admin.rbac.createPermission` mutation
- Reload permissions list on success

### Step 3: Add Create Role Modal

- Form fields: slug, name, description
- Validation: slug format, unique check
- Call `api.admin.rbac.createRole` mutation
- Reload roles list on success

### Step 4: Enhance Role Detail Modal

- Show all permissions assigned to role with scope badges
- Add "Assign Permission" button that opens permission selector
- Permission selector shows all permissions grouped by category
- For each permission, show scope selector (all/own/none)
- Call `api.admin.rbac.assignPermissionToRole` mutation
- Add remove button for each permission
- Call `api.admin.rbac.removePermissionFromRole` mutation

### Step 5: Add Assign Role to User Functionality

- Add "Assign Role to User" button in Quick Actions
- Modal with user selector, role selector, scope (global/org/team)
- Call `api.admin.rbac.assignRoleToUser` mutation

## Key UI Components Needed

1. **Permission Form Modal**
   - Slug input (e.g., "docs.view")
   - Category input (e.g., "docs")
   - Action input (e.g., "view")
   - Description textarea
   - Requires Resource checkbox

2. **Role Form Modal**
   - Slug input (e.g., "docs-viewer")
   - Name input (e.g., "Documentation Viewer")
   - Description textarea

3. **Role Detail Modal** (Enhanced)
   - Current permissions list with scope badges
   - "Add Permission" button
   - Permission selector modal (nested)
   - Remove permission buttons

4. **Assign Role Modal**
   - User dropdown/search
   - Role dropdown
   - Scope selector (global/org/team)

## Data Flow

```
User Action → Modal Form → Mutation → Success → Reload Data → Update UI
```

## Example: Setting up docs.view permission

1. Click "Create Permission"
2. Fill form:
   - Slug: `docs.view`
   - Category: `docs`
   - Action: `view`
   - Description: `View documentation pages`
   - Requires Resource: No
3. Submit → Permission created
4. Click on "admin" role → View Details
5. Click "Assign Permission" → Select "docs.view" → Scope: "all"
6. Submit → Permission assigned to admin role
7. Click "Assign Role to User" → Select yourself → Role: "admin" → Scope: Global
8. Submit → You now have docs.view permission!

This approach scales - no need to write code for each new permission/role!
