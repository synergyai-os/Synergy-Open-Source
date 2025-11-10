/**
 * RBAC Seed Data
 * 
<<<<<<< HEAD
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
=======
 * Populates initial roles, permissions, and role-permission mappings.
 * Run this once after deploying the schema.
 * 
 * Usage: Call seedRBAC() mutation from Convex dashboard
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const seedRBAC = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    console.log("🌱 Seeding RBAC data...");

    // ========================================================================
    // Step 1: Create Roles
    // ========================================================================
    
    console.log("Creating roles...");
    
    const adminRole = await ctx.db.insert("roles", {
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      slug: "admin",
      name: "Admin",
      description: "Full system access - can manage all users, teams, and settings",
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    const managerRoleId = await ctx.db.insert("roles", {
      slug: "manager",
      name: "Manager",
      description: "Can manage teams and invite users, but cannot change billing or remove users",
=======
    const managerRole = await ctx.db.insert("roles", {
      slug: "manager",
      name: "Manager",
      description: "Can manage teams and invite users",
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    const teamLeadRoleId = await ctx.db.insert("roles", {
      slug: "team-lead",
      name: "Team Lead",
      description: "Can manage their own teams (add/remove members, configure settings)",
=======
    const teamLeadRole = await ctx.db.insert("roles", {
      slug: "team-lead",
      name: "Team Lead",
      description: "Can manage their own team members",
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    const billingAdminRoleId = await ctx.db.insert("roles", {
      slug: "billing-admin",
      name: "Billing Admin",
      description: "Can manage billing and subscriptions only",
=======
    const billingAdminRole = await ctx.db.insert("roles", {
      slug: "billing-admin",
      name: "Billing Admin",
      description: "Can manage billing and subscription settings",
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    const memberRoleId = await ctx.db.insert("roles", {
      slug: "member",
      name: "Member",
      description: "Standard user - can view teams and manage own profile",
=======
    const memberRole = await ctx.db.insert("roles", {
      slug: "member",
      name: "Member",
      description: "Standard team member with basic access",
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    const guestRoleId = await ctx.db.insert("roles", {
      slug: "guest",
      name: "Guest",
      description: "Limited access - can only view specific resources they're invited to",
=======
    const guestRole = await ctx.db.insert("roles", {
      slug: "guest",
      name: "Guest",
      description: "Limited access to specific resources",
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    // ==============================================================================
    // 2. Create Permissions
    // ==============================================================================

    // User Management Permissions
    const userViewPermissionId = await ctx.db.insert("permissions", {
=======
    console.log(`✅ Created 6 roles`);

    // ========================================================================
    // Step 2: Create Permissions
    // ========================================================================
    
    console.log("Creating permissions...");

    // --- User Management Permissions (5) ---
    
    const userViewPerm = await ctx.db.insert("permissions", {
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      slug: "users.view",
      category: "users",
      action: "view",
      description: "View user profiles and details",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    const userInvitePermissionId = await ctx.db.insert("permissions", {
=======
    const userInvitePerm = await ctx.db.insert("permissions", {
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      slug: "users.invite",
      category: "users",
      action: "invite",
      description: "Invite new users to the organization",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    const userRemovePermissionId = await ctx.db.insert("permissions", {
=======
    const userRemovePerm = await ctx.db.insert("permissions", {
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      slug: "users.remove",
      category: "users",
      action: "remove",
      description: "Remove users from the organization",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    const userChangeRolesPermissionId = await ctx.db.insert("permissions", {
=======
    const userChangeRolesPerm = await ctx.db.insert("permissions", {
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      slug: "users.change-roles",
      category: "users",
      action: "change-roles",
      description: "Assign or revoke user roles",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    const userManageProfilePermissionId = await ctx.db.insert("permissions", {
      slug: "users.manage-profile",
      category: "users",
      action: "manage-profile",
      description: "Edit user profiles (own or others)",
=======
    const userManageProfilePerm = await ctx.db.insert("permissions", {
      slug: "users.manage-profile",
      category: "users",
      action: "manage-profile",
      description: "Edit user profiles and settings",
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      requiresResource: true,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    // Team Management Permissions
    const teamViewPermissionId = await ctx.db.insert("permissions", {
=======
    // --- Team Management Permissions (7) ---

    const teamViewPerm = await ctx.db.insert("permissions", {
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      slug: "teams.view",
      category: "teams",
      action: "view",
      description: "View team details and members",
<<<<<<< HEAD
      requiresResource: false,
=======
      requiresResource: true,
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    const teamCreatePermissionId = await ctx.db.insert("permissions", {
=======
    const teamCreatePerm = await ctx.db.insert("permissions", {
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      slug: "teams.create",
      category: "teams",
      action: "create",
      description: "Create new teams",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    const teamUpdatePermissionId = await ctx.db.insert("permissions", {
      slug: "teams.update",
      category: "teams",
      action: "update",
      description: "Edit team settings and details",
=======
    const teamUpdatePerm = await ctx.db.insert("permissions", {
      slug: "teams.update",
      category: "teams",
      action: "update",
      description: "Edit team details and settings",
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      requiresResource: true,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    const teamDeletePermissionId = await ctx.db.insert("permissions", {
=======
    const teamDeletePerm = await ctx.db.insert("permissions", {
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      slug: "teams.delete",
      category: "teams",
      action: "delete",
      description: "Delete teams",
      requiresResource: true,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    const teamAddMembersPermissionId = await ctx.db.insert("permissions", {
=======
    const teamAddMembersPerm = await ctx.db.insert("permissions", {
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      slug: "teams.add-members",
      category: "teams",
      action: "add-members",
      description: "Add members to teams",
      requiresResource: true,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    const teamRemoveMembersPermissionId = await ctx.db.insert("permissions", {
=======
    const teamRemoveMembersPerm = await ctx.db.insert("permissions", {
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      slug: "teams.remove-members",
      category: "teams",
      action: "remove-members",
      description: "Remove members from teams",
      requiresResource: true,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    const teamChangeRolesPermissionId = await ctx.db.insert("permissions", {
=======
    const teamChangeRolesPerm = await ctx.db.insert("permissions", {
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      slug: "teams.change-roles",
      category: "teams",
      action: "change-roles",
      description: "Change team member roles",
      requiresResource: true,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    // Organization Settings Permissions
    const orgViewSettingsPermissionId = await ctx.db.insert("permissions", {
=======
    // --- Organization Settings Permissions (3) ---

    const orgViewSettingsPerm = await ctx.db.insert("permissions", {
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      slug: "organizations.view-settings",
      category: "organizations",
      action: "view-settings",
      description: "View organization settings",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    const orgUpdateSettingsPermissionId = await ctx.db.insert("permissions", {
=======
    const orgUpdateSettingsPerm = await ctx.db.insert("permissions", {
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      slug: "organizations.update-settings",
      category: "organizations",
      action: "update-settings",
      description: "Update organization settings",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
    const orgManageBillingPermissionId = await ctx.db.insert("permissions", {
=======
    const orgManageBillingPerm = await ctx.db.insert("permissions", {
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
      slug: "organizations.manage-billing",
      category: "organizations",
      action: "manage-billing",
      description: "Manage billing and subscriptions",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

<<<<<<< HEAD
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
=======
    // --- Placeholder Permissions (5) for future features ---

    const projectsCreatePerm = await ctx.db.insert("permissions", {
      slug: "projects.create",
      category: "projects",
      action: "create",
      description: "Create new projects (placeholder)",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const projectsManagePerm = await ctx.db.insert("permissions", {
      slug: "projects.manage",
      category: "projects",
      action: "manage",
      description: "Manage project settings (placeholder)",
      requiresResource: true,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const reportsViewPerm = await ctx.db.insert("permissions", {
      slug: "reports.view",
      category: "reports",
      action: "view",
      description: "View analytics and reports (placeholder)",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const integrationsManagePerm = await ctx.db.insert("permissions", {
      slug: "integrations.manage",
      category: "integrations",
      action: "manage",
      description: "Manage third-party integrations (placeholder)",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    const auditLogViewPerm = await ctx.db.insert("permissions", {
      slug: "audit-log.view",
      category: "audit-log",
      action: "view",
      description: "View audit logs (placeholder)",
      requiresResource: false,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`✅ Created 20 permissions`);

    // ========================================================================
    // Step 3: Create Role-Permission Mappings
    // ========================================================================
    
    console.log("Creating role-permission mappings...");

    const mappings = [
      // --- ADMIN (all permissions with "all" scope) ---
      { roleId: adminRole, permissionId: userViewPerm, scope: "all" as const },
      { roleId: adminRole, permissionId: userInvitePerm, scope: "all" as const },
      { roleId: adminRole, permissionId: userRemovePerm, scope: "all" as const },
      { roleId: adminRole, permissionId: userChangeRolesPerm, scope: "all" as const },
      { roleId: adminRole, permissionId: userManageProfilePerm, scope: "all" as const },
      { roleId: adminRole, permissionId: teamViewPerm, scope: "all" as const },
      { roleId: adminRole, permissionId: teamCreatePerm, scope: "all" as const },
      { roleId: adminRole, permissionId: teamUpdatePerm, scope: "all" as const },
      { roleId: adminRole, permissionId: teamDeletePerm, scope: "all" as const },
      { roleId: adminRole, permissionId: teamAddMembersPerm, scope: "all" as const },
      { roleId: adminRole, permissionId: teamRemoveMembersPerm, scope: "all" as const },
      { roleId: adminRole, permissionId: teamChangeRolesPerm, scope: "all" as const },
      { roleId: adminRole, permissionId: orgViewSettingsPerm, scope: "all" as const },
      { roleId: adminRole, permissionId: orgUpdateSettingsPerm, scope: "all" as const },
      { roleId: adminRole, permissionId: orgManageBillingPerm, scope: "all" as const },
      { roleId: adminRole, permissionId: projectsCreatePerm, scope: "all" as const },
      { roleId: adminRole, permissionId: projectsManagePerm, scope: "all" as const },
      { roleId: adminRole, permissionId: reportsViewPerm, scope: "all" as const },
      { roleId: adminRole, permissionId: integrationsManagePerm, scope: "all" as const },
      { roleId: adminRole, permissionId: auditLogViewPerm, scope: "all" as const },

      // --- MANAGER (can manage teams and invite users) ---
      { roleId: managerRole, permissionId: userViewPerm, scope: "all" as const },
      { roleId: managerRole, permissionId: userInvitePerm, scope: "all" as const },
      { roleId: managerRole, permissionId: teamViewPerm, scope: "all" as const },
      { roleId: managerRole, permissionId: teamCreatePerm, scope: "all" as const },
      { roleId: managerRole, permissionId: teamUpdatePerm, scope: "all" as const },
      { roleId: managerRole, permissionId: teamAddMembersPerm, scope: "all" as const },
      { roleId: managerRole, permissionId: teamRemoveMembersPerm, scope: "all" as const },
      { roleId: managerRole, permissionId: teamChangeRolesPerm, scope: "all" as const },
      { roleId: managerRole, permissionId: orgViewSettingsPerm, scope: "all" as const },
      { roleId: managerRole, permissionId: reportsViewPerm, scope: "all" as const },

      // --- TEAM LEAD (can only manage their own team) ---
      { roleId: teamLeadRole, permissionId: userViewPerm, scope: "all" as const },
      { roleId: teamLeadRole, permissionId: teamViewPerm, scope: "own" as const },
      { roleId: teamLeadRole, permissionId: teamUpdatePerm, scope: "own" as const },
      { roleId: teamLeadRole, permissionId: teamAddMembersPerm, scope: "own" as const },
      { roleId: teamLeadRole, permissionId: teamRemoveMembersPerm, scope: "own" as const },
      { roleId: teamLeadRole, permissionId: orgViewSettingsPerm, scope: "all" as const },

      // --- BILLING ADMIN (can manage billing only) ---
      { roleId: billingAdminRole, permissionId: userViewPerm, scope: "all" as const },
      { roleId: billingAdminRole, permissionId: orgViewSettingsPerm, scope: "all" as const },
      { roleId: billingAdminRole, permissionId: orgManageBillingPerm, scope: "all" as const },

      // --- MEMBER (basic access) ---
      { roleId: memberRole, permissionId: userViewPerm, scope: "all" as const },
      { roleId: memberRole, permissionId: userManageProfilePerm, scope: "own" as const },
      { roleId: memberRole, permissionId: teamViewPerm, scope: "all" as const },
      { roleId: memberRole, permissionId: orgViewSettingsPerm, scope: "all" as const },

      // --- GUEST (minimal access) ---
      { roleId: guestRole, permissionId: userViewPerm, scope: "all" as const },
      { roleId: guestRole, permissionId: teamViewPerm, scope: "own" as const },
    ];

    // Insert all mappings
    for (const mapping of mappings) {
      await ctx.db.insert("rolePermissions", {
        roleId: mapping.roleId,
        permissionId: mapping.permissionId,
        scope: mapping.scope,
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
        createdAt: now,
      });
    }

<<<<<<< HEAD
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
=======
    console.log(`✅ Created ${mappings.length} role-permission mappings`);

    console.log("🎉 RBAC seed complete!");

    return {
      success: true,
      stats: {
        roles: 6,
        permissions: 20,
        mappings: mappings.length,
      },
>>>>>>> 7479ab6 (🐛 [FIX] Use Linear's estimate field instead of size labels)
    };
  },
});

