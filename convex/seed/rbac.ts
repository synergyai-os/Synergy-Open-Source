/**
 * RBAC Seed Data
 * 
 * Seeds initial roles, permissions, and role-permission mappings.
 * Run once to initialize the permission system.
 * 
 * Usage: npx convex run seed/rbac:seedRoles
 */

import { mutation } from "../_generated/server";

export const seedRoles = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    // ==============================================================================
    // 1. Create Roles
    // ==============================================================================

    const adminRoleId = await ctx.db.insert("roles", {
      slug: "admin",
      name: "Admin",
      description: "Full system access - can manage all users, teams, and settings",
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const managerRoleId = await ctx.db.insert("roles", {
      slug: "manager",
      name: "Manager",
      description: "Can manage teams and invite users, but cannot change billing or remove users",
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const teamLeadRoleId = await ctx.db.insert("roles", {
      slug: "team-lead",
      name: "Team Lead",
      description: "Can manage their own teams (add/remove members, configure settings)",
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const billingAdminRoleId = await ctx.db.insert("roles", {
      slug: "billing-admin",
      name: "Billing Admin",
      description: "Can manage billing and subscriptions only",
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const memberRoleId = await ctx.db.insert("roles", {
      slug: "member",
      name: "Member",
      description: "Standard user - can view teams and manage own profile",
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const guestRoleId = await ctx.db.insert("roles", {
      slug: "guest",
      name: "Guest",
      description: "Limited access - can only view specific resources they're invited to",
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    // ==============================================================================
    // 2. Create Permissions
    // ==============================================================================

    // User Management Permissions
    const userViewPermissionId = await ctx.db.insert("permissions", {
      slug: "users.view",
      category: "users",
      action: "view",
      description: "View user profiles and details",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const userInvitePermissionId = await ctx.db.insert("permissions", {
      slug: "users.invite",
      category: "users",
      action: "invite",
      description: "Invite new users to the organization",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const userRemovePermissionId = await ctx.db.insert("permissions", {
      slug: "users.remove",
      category: "users",
      action: "remove",
      description: "Remove users from the organization",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const userChangeRolesPermissionId = await ctx.db.insert("permissions", {
      slug: "users.change-roles",
      category: "users",
      action: "change-roles",
      description: "Assign or revoke user roles",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const userManageProfilePermissionId = await ctx.db.insert("permissions", {
      slug: "users.manage-profile",
      category: "users",
      action: "manage-profile",
      description: "Edit user profiles (own or others)",
      requiresResource: true,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    // Team Management Permissions
    const teamViewPermissionId = await ctx.db.insert("permissions", {
      slug: "teams.view",
      category: "teams",
      action: "view",
      description: "View team details and members",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const teamCreatePermissionId = await ctx.db.insert("permissions", {
      slug: "teams.create",
      category: "teams",
      action: "create",
      description: "Create new teams",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const teamUpdatePermissionId = await ctx.db.insert("permissions", {
      slug: "teams.update",
      category: "teams",
      action: "update",
      description: "Edit team settings and details",
      requiresResource: true,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const teamDeletePermissionId = await ctx.db.insert("permissions", {
      slug: "teams.delete",
      category: "teams",
      action: "delete",
      description: "Delete teams",
      requiresResource: true,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const teamAddMembersPermissionId = await ctx.db.insert("permissions", {
      slug: "teams.add-members",
      category: "teams",
      action: "add-members",
      description: "Add members to teams",
      requiresResource: true,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const teamRemoveMembersPermissionId = await ctx.db.insert("permissions", {
      slug: "teams.remove-members",
      category: "teams",
      action: "remove-members",
      description: "Remove members from teams",
      requiresResource: true,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const teamChangeRolesPermissionId = await ctx.db.insert("permissions", {
      slug: "teams.change-roles",
      category: "teams",
      action: "change-roles",
      description: "Change team member roles",
      requiresResource: true,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    // Organization Settings Permissions
    const orgViewSettingsPermissionId = await ctx.db.insert("permissions", {
      slug: "organizations.view-settings",
      category: "organizations",
      action: "view-settings",
      description: "View organization settings",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const orgUpdateSettingsPermissionId = await ctx.db.insert("permissions", {
      slug: "organizations.update-settings",
      category: "organizations",
      action: "update-settings",
      description: "Update organization settings",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const orgManageBillingPermissionId = await ctx.db.insert("permissions", {
      slug: "organizations.manage-billing",
      category: "organizations",
      action: "manage-billing",
      description: "Manage billing and subscriptions",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    // ==============================================================================
    // 3. Assign Permissions to Roles
    // ==============================================================================

    // Admin - Full access (scope: "all")
    const adminPermissions = [
      userViewPermissionId,
      userInvitePermissionId,
      userRemovePermissionId,
      userChangeRolesPermissionId,
      userManageProfilePermissionId,
      teamViewPermissionId,
      teamCreatePermissionId,
      teamUpdatePermissionId,
      teamDeletePermissionId,
      teamAddMembersPermissionId,
      teamRemoveMembersPermissionId,
      teamChangeRolesPermissionId,
      orgViewSettingsPermissionId,
      orgUpdateSettingsPermissionId,
      orgManageBillingPermissionId,
    ];

    for (const permissionId of adminPermissions) {
      await ctx.db.insert("rolePermissions", {
        roleId: adminRoleId,
        permissionId,
        scope: "all",
        createdAt: now,
      });
    }

    // Manager - Can manage teams and invite users (scope: "all" for most)
    const managerPermissions = [
      { id: userViewPermissionId, scope: "all" as const },
      { id: userInvitePermissionId, scope: "all" as const },
      { id: userManageProfilePermissionId, scope: "own" as const },
      { id: teamViewPermissionId, scope: "all" as const },
      { id: teamCreatePermissionId, scope: "all" as const },
      { id: teamUpdatePermissionId, scope: "all" as const },
      { id: teamAddMembersPermissionId, scope: "all" as const },
      { id: teamRemoveMembersPermissionId, scope: "all" as const },
      { id: teamChangeRolesPermissionId, scope: "all" as const },
      { id: orgViewSettingsPermissionId, scope: "all" as const },
    ];

    for (const { id, scope } of managerPermissions) {
      await ctx.db.insert("rolePermissions", {
        roleId: managerRoleId,
        permissionId: id,
        scope,
        createdAt: now,
      });
    }

    // Team Lead - Can only manage their own teams (scope: "own")
    const teamLeadPermissions = [
      { id: userViewPermissionId, scope: "all" as const },
      { id: userManageProfilePermissionId, scope: "own" as const },
      { id: teamViewPermissionId, scope: "all" as const },
      { id: teamUpdatePermissionId, scope: "own" as const },
      { id: teamAddMembersPermissionId, scope: "own" as const },
      { id: teamRemoveMembersPermissionId, scope: "own" as const },
      { id: teamChangeRolesPermissionId, scope: "own" as const },
    ];

    for (const { id, scope } of teamLeadPermissions) {
      await ctx.db.insert("rolePermissions", {
        roleId: teamLeadRoleId,
        permissionId: id,
        scope,
        createdAt: now,
      });
    }

    // Billing Admin - Only billing permissions
    const billingAdminPermissions = [
      { id: userViewPermissionId, scope: "all" as const },
      { id: userManageProfilePermissionId, scope: "own" as const },
      { id: orgViewSettingsPermissionId, scope: "all" as const },
      { id: orgManageBillingPermissionId, scope: "all" as const },
    ];

    for (const { id, scope } of billingAdminPermissions) {
      await ctx.db.insert("rolePermissions", {
        roleId: billingAdminRoleId,
        permissionId: id,
        scope,
        createdAt: now,
      });
    }

    // Member - Basic viewing and own profile
    const memberPermissions = [
      { id: userViewPermissionId, scope: "all" as const },
      { id: userManageProfilePermissionId, scope: "own" as const },
      { id: teamViewPermissionId, scope: "all" as const },
    ];

    for (const { id, scope } of memberPermissions) {
      await ctx.db.insert("rolePermissions", {
        roleId: memberRoleId,
        permissionId: id,
        scope,
        createdAt: now,
      });
    }

    // Guest - Very limited (permissions granted per-resource via resourceGuests table)
    const guestPermissions = [
      { id: userViewPermissionId, scope: "all" as const },
      { id: userManageProfilePermissionId, scope: "own" as const },
    ];

    for (const { id, scope } of guestPermissions) {
      await ctx.db.insert("rolePermissions", {
        roleId: guestRoleId,
        permissionId: id,
        scope,
        createdAt: now,
      });
    }

    return {
      success: true,
      message: "RBAC roles and permissions seeded successfully",
      roles: 6,
      permissions: 15,
      mappings: adminPermissions.length + managerPermissions.length + teamLeadPermissions.length + billingAdminPermissions.length + memberPermissions.length + guestPermissions.length,
    };
  },
});

