# RBAC Infrastructure - Essentials

> **Note**: This document describes the RBAC (Role-Based Access Control) system as implemented. All documented fields, relationships, and entities exist in the database schema.

## User Types

- **System Admin** - Global administrator with full system access
  - Can manage all users, workspaces, roles, and permissions
  - Has access across all workspaces
  - Can configure system-level RBAC settings
  - Can map organizational role templates to RBAC permissions

- **Workspace Admin** - Administrator for a specific workspace
  - Can manage workspace members and their roles
  - Can assign workspace-scoped RBAC roles
  - Has full access within their workspace scope

- **Circle Lead** - Leader of a specific circle (organizational role)
  - Can assign users to roles **within their circle only**
  - Permission granted automatically via CircleRole → RBAC mapping
  - This is a DEFAULT BEHAVIOR (always enabled, not tied to Quick Edit Mode)

- **Workspace User** - Standard member of a workspace
  - Permissions determined by assigned RBAC roles
  - Can have system-level, workspace-scoped, or circle-scoped roles

## Glossary

| Term | Definition |
|------|------------|
| **RBAC Role** | A named collection of permissions (e.g., "Org Designer", "Viewer"). Defined in `roles` table. |
| **Permission** | A specific capability (e.g., `users.change-roles`, `circles.update`). Defined in `permissions` table. |
| **Permission Scope** | How broadly a permission applies: `all` (any resource), `own` (own resources only), `none` (denied). |
| **Role Scope** | Where a role applies: system-wide (no workspaceId/circleId), workspace-scoped, or circle-scoped. |
| **User Role Assignment** | Links a user to a role with optional scope. Stored in `userRoles` table. |
| **CircleRole** | An organizational role within a circle (e.g., "Circle Lead", "Secretary"). Distinct from RBAC roles. |
| **Role Template** | A template for organizational roles that can map to RBAC permissions. Stored in `roleTemplates` table. |
| **Auto-Assignment** | Automatic granting of RBAC permissions when user fills an organizational role (e.g., Circle Lead). |
| **Source Tracking** | Using `sourceCircleRoleId` to track which CircleRole granted an auto-assigned RBAC role. |

## Data Entities

### Core RBAC Entities

- **Roles** (`roles` table)
  - Defines named roles (e.g., "admin", "org-designer", "viewer")
  - Fields: `slug`, `name`, `description`, `isSystem`
  - System roles are seeded on deployment
  - Can create custom roles per workspace (future)

- **Permissions** (`permissions` table)
  - Defines specific capabilities (e.g., `users.change-roles`)
  - Fields: `slug`, `name`, `description`, `category`
  - Always system-defined (seeded on deployment)

- **Role Permissions** (`rolePermissions` table)
  - Links roles to permissions with scope
  - Fields: `roleId`, `permissionId`, `scope` (all/own/none)
  - Defines what each role can do

- **User Roles** (`userRoles` table)
  - Assigns roles to users with optional scoping
  - Fields: `userId`, `roleId`, `workspaceId`, `circleId`, `assignedBy`, `assignedAt`, `revokedAt`
  - **Role Scope Determination:**
    - No `workspaceId` or `circleId` → System-wide role
    - Has `workspaceId` only → Workspace-scoped role
    - Has `workspaceId` AND `circleId` → Circle-scoped role
  - **Source Tracking:** `sourceCircleRoleId` (optional) tracks which CircleRole auto-assigned this

### CircleRole → RBAC Integration

- **Role Templates** (`roleTemplates` table)
  - Templates for organizational roles (Circle Lead, Secretary, etc.)
  - Fields: `name`, `description`, `workspaceId`, `isCore`, `isRequired`
  - **RBAC Mapping:** `rbacPermissions` field (array of permission mappings)
    - Each mapping: `{ permissionSlug: string, scope: 'all' | 'own' }`
    - Example: Circle Lead → `[{ permissionSlug: 'users.change-roles', scope: 'own' }]`

- **User Circle Roles** (`userCircleRoles` table)
  - Assigns users to organizational roles within circles
  - When user assigned to CircleRole with RBAC mapping:
    - Auto-creates `userRoles` record with `sourceCircleRoleId` set
    - Permission is circle-scoped (user can only use permission within that circle)

## Relationships

### RBAC Core

```
User ──┬── userRoles ────── Role
       │                      │
       │                      ├── rolePermissions ── Permission
       │                      │
       └── (scope) ──────── Workspace
                    ──────── Circle
```

- **User → Roles**: Many-to-many via `userRoles`
- **Role → Permissions**: Many-to-many via `rolePermissions`
- **User Role → Workspace**: Optional scope (null = system-wide)
- **User Role → Circle**: Optional scope (requires workspaceId too)

### CircleRole Integration

```
User ── userCircleRoles ── CircleRole ── roleTemplate
                              │               │
                              │               └── rbacPermissions[] ── Permission
                              │
                              └── (auto-creates) ── userRoles (with sourceCircleRoleId)
```

- **User → CircleRole**: Many-to-many via `userCircleRoles`
- **CircleRole → Role Template**: Many-to-one via `templateId`
- **Role Template → RBAC Permissions**: One-to-many via `rbacPermissions` array
- **Auto-Assignment**: Creates `userRoles` record linked via `sourceCircleRoleId`

## Permission Checking Flow

### Backend (`convex/rbac/permissions.ts`)

```typescript
// 1. Get user's active roles (respects workspace/circle context)
const userRoles = await getUserActiveRoles(ctx, userId, { workspaceId, circleId });

// 2. For each role, get permissions with scope
const permissions = await getRolePermissions(roleId);

// 3. Merge permissions (highest scope wins)
// scopePriority: { all: 3, own: 2, none: 1 }

// 4. Check if user has required permission
return hasPermission(permissions, permissionSlug);
```

### Frontend (`usePermissions` composable)

```svelte
<script lang="ts">
  import { usePermissions } from '$lib/infrastructure/rbac/composables/usePermissions.svelte';

  const permissions = usePermissions({
    sessionId: () => $page.data.sessionId,
    workspaceId: () => activeWorkspaceId,
    circleId: () => selectedCircleId  // Optional: for circle-scoped checks
  });

  // Check permission
  const canAssignRoles = $derived(permissions.can('users.change-roles'));
</script>
```

## Scope Inheritance Rules

### Permission Inheritance (Higher Scope Wins)

| User Has | Check Context | Result |
|----------|---------------|--------|
| System role (`users.change-roles`) | Any workspace | ✅ Has permission |
| Workspace role (`users.change-roles` for workspace A) | Workspace A | ✅ Has permission |
| Workspace role (`users.change-roles` for workspace A) | Workspace B | ❌ No permission |
| Circle role (`users.change-roles` for circle X) | Circle X | ✅ Has permission |
| Circle role (`users.change-roles` for circle X) | Circle Y | ❌ No permission |
| Both workspace AND circle role | Any circle in workspace | ✅ Workspace wins |

**Rule**: Broader scope always grants permission. Workspace-level permission applies to all circles within that workspace.

### Scope Priority

```
System (no scope) > Workspace > Circle
```

If user has conflicting scopes (e.g., workspace says `all`, circle says `own`), the broader scope (`all`) wins.

## Auto-Assignment Behavior

### When User Fills CircleRole

1. User is assigned to CircleRole (e.g., "Circle Lead" in Marketing circle)
2. System checks if CircleRole's template has `rbacPermissions`
3. If yes, auto-creates `userRoles` record:
   - `userId`: The user being assigned
   - `roleId`: The RBAC role for the permission
   - `workspaceId`: From the circle
   - `circleId`: The circle they're leading
   - `sourceCircleRoleId`: Links back to the userCircleRole record
4. User immediately has permission within that circle

### When User Removed from CircleRole

1. User is removed from CircleRole (e.g., no longer Circle Lead)
2. System queries `userRoles` where `sourceCircleRoleId` = the removed assignment
3. Only those specific auto-assigned roles are revoked (`revokedAt` set)
4. User's other RBAC roles remain intact

**Key**: `sourceCircleRoleId` enables precise cleanup without over-revoking.

## Constraints & Edge Cases

### Foreign Key Constraints

- **User deleted**: `userRoles` records remain (soft delete via `revokedAt`)
- **Role deleted**: Should not happen for system roles; custom roles cascade delete `rolePermissions`
- **Circle deleted**: `userRoles` with that `circleId` become orphaned (permission checks will fail gracefully)

### State Management

- **Concurrent role changes**: Last write wins (Convex handles conflicts)
- **Role assignment during check**: Query uses snapshot isolation (consistent view)
- **Cache invalidation**: Frontend queries are reactive (auto-update when data changes)

### Data Retention

- **Role revocation**: Soft delete (`revokedAt` timestamp), data retained for audit
- **Workspace deletion**: All workspace-scoped `userRoles` should be cleaned up (future: cascade delete)

## Common Permission Slugs

### User Management
- `users.view` - View user profiles
- `users.invite` - Invite new users to workspace
- `users.remove` - Remove users from workspace
- `users.change-roles` - Assign/revoke RBAC roles

### Circle Management
- `circles.view` - View circle details
- `circles.create` - Create new circles
- `circles.update` - Edit circle settings (name, purpose)
- `circles.delete` - Delete circles
- `circles.quick-edit` - Make quick edits without governance (Org Designer feature)

### Workspace Management
- `workspaces.view-settings` - View workspace settings
- `workspaces.update-settings` - Update workspace settings
- `workspaces.manage-members` - Manage workspace membership

## File Structure

```
src/lib/infrastructure/rbac/
├── components/
│   ├── index.ts
│   ├── PermissionButton.svelte    # Button with permission check
│   ├── PermissionGate.svelte      # Conditional render by permission
│   └── README.md                  # Component usage docs
├── composables/
│   └── usePermissions.svelte.ts   # Reactive permission checking
└── docs/
    └── essentials.md              # This file

convex/rbac/
├── permissions.ts                 # Permission checking logic
├── roles.ts                       # Role assignment mutations
└── queries.ts                     # Role/permission queries
```

## Related Documentation

- **Global Business Rules**: `dev-docs/master-docs/global-business-rules.md` (Circle Lead requirements)
- **Component README**: `src/lib/infrastructure/rbac/components/README.md` (UI component usage)
- **Implementation Plan**: `ai-docs/tasks/SYOS-649-rbac-role-management-ui.md`
- **Architecture**: `dev-docs/master-docs/architecture.md`

---

**Last Updated**: 2025-12-04
**Linear Ticket**: [SYOS-649](https://linear.app/younghumanclub/issue/SYOS-649)

