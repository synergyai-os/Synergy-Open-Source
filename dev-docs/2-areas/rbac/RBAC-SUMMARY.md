# RBAC System - Overview

**Last Updated**: November 18, 2025  
**Status**: ✅ **Implemented and Live**

---

## 🎯 What Is RBAC?

SynergyOS uses a **Role-Based Access Control (RBAC)** system with Permission-Based Access Control (PBAC) principles. This allows fine-grained control over who can do what in the platform.

### System Overview

```
User → Roles (multiple) → Permissions (actions) → Features
```

**Example**: Sarah has roles `billing-admin` + `team-lead` → Gets permissions from BOTH roles!

---

## ✅ Current Implementation Status

### What's Implemented

- ✅ **Database Schema**: All RBAC tables (`roles`, `permissions`, `rolePermissions`, `userRoles`, `resourceGuests`)
- ✅ **Permission Checking**: Core functions in `convex/rbac/permissions.ts`
- ✅ **Seed Script**: `convex/rbac/seedRBAC.ts` populates initial roles and permissions
- ✅ **System Admin Panel**: `/admin/rbac` for managing RBAC system
- ✅ **Admin Backend**: `convex/admin/rbac.ts` provides admin queries/mutations
- ✅ **Multi-Role Support**: Users can have multiple roles simultaneously
- ✅ **Resource Scoping**: Roles can be scoped globally, organization-wide, or team-specific

### Code Locations

- **Schema**: `convex/schema.ts` (lines 842-871)
- **Permissions**: `convex/rbac/permissions.ts`
- **Seed Data**: `convex/rbac/seedRBAC.ts`
- **Admin Panel**: `src/routes/(authenticated)/admin/rbac/`
- **Admin Backend**: `convex/admin/rbac.ts`

---

## 🎭 Roles

| Role              | Level        | Description                          |
| ----------------- | ------------ | ------------------------------------ |
| **Admin**         | System       | Global platform admin (system-level) |
| **Admin**         | Organization | Full organization access             |
| **Manager**       | Organization | Manage teams & users                 |
| **Team Lead**     | Team         | Manage specific team(s) only         |
| **Billing Admin** | Organization | Manage billing only                  |
| **Member**        | Team         | Regular team member                  |
| **Guest**         | Resource     | Limited resource access              |

### System Admin vs Organization Admin

- **System Admin**: Global platform admin (no `organizationId`). Can access `/admin` routes.
- **Organization Admin**: Organization-scoped admin role. Manages their organization via settings.

---

## 🔐 Permissions

### User Management

- `users.view` - View user profiles and details
- `users.invite` - Invite new users to organization
- `users.remove` - Remove users from organization
- `users.change-roles` - Change user roles
- `users.manage-profile` - Edit user profiles (own or others)

### Team Management

- `teams.view` - View team details and members
- `teams.create` - Create new teams
- `teams.update` - Edit team settings and details
- `teams.delete` - Delete teams
- `teams.add-members` - Add members to team
- `teams.remove-members` - Remove members from team
- `teams.change-roles` - Change team member roles

### Organization Management

- `organizations.view-settings` - View organization settings
- `organizations.update-settings` - Update organization settings
- `organizations.manage-billing` - Manage billing and subscriptions

---

## 🗄️ Database Schema

### Tables

1. **`roles`** - Role definitions (admin, manager, etc.)
2. **`permissions`** - All possible actions
3. **`rolePermissions`** - Links roles to permissions with scope
4. **`userRoles`** - User role assignments (many-to-many)
5. **`resourceGuests`** - Guest access to specific resources

### Key Fields

**`userRoles` table**:
- `userId` - User who has the role
- `roleId` - The role assigned
- `organizationId` - Optional: Organization scope
- `teamId` - Optional: Team scope
- `assignedBy` - Who assigned this role
- `assignedAt` - When assigned
- `expiresAt` - Optional expiration
- `revokedAt` - When revoked

---

## 💡 Key Design Decisions

### 1. Multi-Role Support

Users can have multiple roles simultaneously:

```typescript
// Sarah has TWO roles
userRoles: [
	{ userId: sarah, roleId: 'billing-admin', organizationId: org1 },
	{ userId: sarah, roleId: 'team-lead', organizationId: org1, teamId: teamA }
];
```

When checking permissions, system checks ALL roles and grants access if ANY role allows it.

**Benefits:**
- ✅ Real-world flexibility (people wear multiple hats)
- ✅ No need to create combined roles
- ✅ Easy to add/remove individual roles
- ✅ Clear separation of responsibilities

### 2. Permission-Based (Not Role-Based)

✅ **Permission-Based Approach**:

```typescript
if (userHasPermission(user, 'teams.create')) {
	allowAction();
}
// Adding new role = just assign permissions in database!
```

**Benefits:**
- ✅ Add roles without code changes
- ✅ Change what roles can do in database
- ✅ More granular control
- ✅ Easier to understand (roles group permissions)

### 3. Resource Scoping

Roles can be scoped at three levels:

1. **Global (System-Level)**: No `organizationId` or `teamId` (e.g., system admin)
2. **Organization-Scoped**: Has `organizationId`, no `teamId` (e.g., org admin)
3. **Team-Scoped**: Has `teamId` (e.g., team lead)

---

## 🎯 Real-World Examples

### Example 1: Sarah (Billing Admin + Team Lead)

**Roles:**
- `billing-admin` (org-level)
- `team-lead` for Marketing team (team-level)

**What Sarah Can Do:**
- ✅ View billing dashboard (from billing-admin)
- ✅ Update payment methods (from billing-admin)
- ✅ Update Marketing team settings (from team-lead)
- ✅ Add members to Marketing team (from team-lead)

**What Sarah Cannot Do:**
- ❌ Update Engineering team settings (not her team)
- ❌ Create new teams (needs manager or admin role)
- ❌ Update org settings (needs admin role)

### Example 2: Bob (Manager)

**Roles:**
- `manager` (org-level)

**What Bob Can Do:**
- ✅ Create teams
- ✅ Delete teams
- ✅ Update ANY team's settings (scope: all)
- ✅ Add/remove members from ANY team
- ✅ Invite users to organization
- ✅ Assign roles to users (except admin role)
- ✅ View org settings

**What Bob Cannot Do:**
- ❌ Update org settings (needs admin role)
- ❌ Manage billing (needs billing-admin role)
- ❌ Assign admin role (only admins can do this)

### Example 3: Alice (Team Lead)

**Roles:**
- `team-lead` for Engineering team (team-level)

**What Alice Can Do:**
- ✅ Update Engineering team settings (her team)
- ✅ Add members to Engineering team
- ✅ Remove members from Engineering team

**What Alice Cannot Do:**
- ❌ Update Design team settings (not her team)
- ❌ Create new teams (needs manager or admin)
- ❌ Delete teams (needs manager or admin)
- ❌ Invite users to org (needs manager or admin)

---

## 🔒 Security Features

### 1. Always Validate Server-Side

```typescript
// ❌ WRONG - Client check only
{#if userRole === 'admin'}
  <button>Delete Team</button>
{/if}

// ✅ CORRECT - Server validation
export const deleteTeam = mutation({
	handler: async (ctx, args) => {
		await requirePermission(ctx, userId, 'teams.delete');
		// ... delete team
	}
});
```

### 2. Principle of Least Privilege

Users get ONLY permissions they need:
- Start restrictive
- Add permissions as needed
- Regular audits to remove unused permissions

### 3. Separation of Duties

Critical actions require appropriate roles:
- Billing changes require `billing-admin`
- Org changes require `admin`
- System changes require system `admin`

---

## 🛠️ Using RBAC

### Checking Permissions in Convex

```typescript
import { requirePermission } from '../rbac/permissions';

export const deleteTeam = mutation({
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		
		// Require permission (throws if denied)
		await requirePermission(ctx, userId, 'teams.delete', {
			teamId: args.teamId,
			organizationId: args.organizationId
		});
		
		// ... perform action
	}
});
```

### Checking Permissions in Svelte

```typescript
import { usePermissions } from '$lib/composables/usePermissions.svelte';

const permissions = usePermissions({
	sessionId: () => data.sessionId,
	organizationId: () => organizations.activeOrganizationId,
	teamId: () => organizations.activeTeamId
});

// In template
{#if permissions.can('teams.create')}
	<button>Create Team</button>
{/if}
```

---

## 📚 Documentation

### Quick Links

- **[rbac-quick-reference.md](./rbac-quick-reference.md)** - Developer cheat sheet
- **[rbac-architecture.md](./rbac-architecture.md)** - Complete system design
- **[rbac-visual-overview.md](./rbac-visual-overview.md)** - Visual diagrams
- **[Architecture Overview](/dev-docs/2-areas/architecture/architecture.md)** - System architecture

### Admin Panel

Access the RBAC admin panel at `/admin/rbac` (system admins only).

Features:
- View all roles and permissions
- See role distribution and analytics
- Manage system-level role assignments
- View RBAC system health metrics

---

## 📊 System Health

### Metrics Tracked

- Total roles and permissions
- Active role assignments
- System-level vs organization-scoped assignments
- Unused roles (roles with no assignments)
- Permission usage statistics

View these metrics in the admin panel at `/admin/rbac` → Analytics tab.

---

## 🚦 Current Status

**Implementation**: ✅ Complete  
**Admin Panel**: ✅ Available at `/admin/rbac`  
**Documentation**: ✅ Complete

---

**Last Updated**: November 18, 2025  
**Maintained By**: SynergyOS Team
