/**
 * Manual Test: RBAC Permission System
 * 
 * Run from Convex dashboard to manually verify permission checking.
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { hasPermission, requirePermission, getUserPermissions, getUserRoles } from "./permissions";

export const testAdminPermissions = mutation({
  args: {},
  handler: async (ctx) => {
    // Create test admin user
    const adminUserId = await ctx.db.insert("users", {
      workosId: "test-admin-permissions",
      email: "admin@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Find Admin role
    const adminRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "admin"))
      .first();
    
    if (!adminRole) throw new Error("Admin role not found - run seed first");
    
    // Assign Admin role
    await ctx.db.insert("userRoles", {
      userId: adminUserId,
      roleId: adminRole._id,
      assignedBy: adminUserId,
      assignedAt: Date.now(),
    });
    
    // Test 1: Check if admin can create teams
    const canCreateTeams = await hasPermission(ctx, adminUserId, "teams.create");
    
    // Test 2: Check if admin can update any team (scope: all)
    const otherUserId = await ctx.db.insert("users", {
      workosId: "other-user",
      email: "other@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    const canUpdateOtherTeam = await hasPermission(ctx, adminUserId, "teams.update", {
      resourceOwnerId: otherUserId,
    });
    
    // Test 3: Get all permissions
    const allPermissions = await getUserPermissions(ctx, adminUserId);
    
    // Test 4: Get all roles
    const allRoles = await getUserRoles(ctx, adminUserId);
    
    return {
      success: true,
      tests: {
        canCreateTeams,
        canUpdateOtherTeam,
        permissionCount: allPermissions.length,
        roleCount: allRoles.length,
        roles: allRoles.map((r) => r.role?.slug),
      },
    };
  },
});

export const testTeamLeadPermissions = mutation({
  args: {},
  handler: async (ctx) => {
    // Create test team lead user
    const teamLeadUserId = await ctx.db.insert("users", {
      workosId: "test-team-lead-permissions",
      email: "lead@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Find Team Lead role
    const teamLeadRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "team-lead"))
      .first();
    
    if (!teamLeadRole) throw new Error("Team Lead role not found - run seed first");
    
    // Assign Team Lead role
    await ctx.db.insert("userRoles", {
      userId: teamLeadUserId,
      roleId: teamLeadRole._id,
      assignedBy: teamLeadUserId,
      assignedAt: Date.now(),
    });
    
    // Test 1: Check if team lead CAN update their own team
    const canUpdateOwnTeam = await hasPermission(ctx, teamLeadUserId, "teams.update", {
      resourceOwnerId: teamLeadUserId, // Same as user
    });
    
    // Test 2: Check if team lead CANNOT update another team
    const otherUserId = await ctx.db.insert("users", {
      workosId: "other-user-2",
      email: "other2@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    const canUpdateOtherTeam = await hasPermission(ctx, teamLeadUserId, "teams.update", {
      resourceOwnerId: otherUserId,
    });
    
    // Test 3: Check if team lead CANNOT create teams
    const canCreateTeams = await hasPermission(ctx, teamLeadUserId, "teams.create");
    
    // Test 4: Get all permissions
    const allPermissions = await getUserPermissions(ctx, teamLeadUserId);
    
    return {
      success: true,
      tests: {
        canUpdateOwnTeam, // Should be TRUE
        canUpdateOtherTeam, // Should be FALSE
        canCreateTeams, // Should be FALSE
        permissionCount: allPermissions.length,
        permissions: allPermissions.map((p) => ({
          slug: p.permissionSlug,
          scope: p.scope,
          role: p.roleSlug,
        })),
      },
    };
  },
});

export const testMultiRoleUser = mutation({
  args: {},
  handler: async (ctx) => {
    // Create user
    const userId = await ctx.db.insert("users", {
      workosId: "test-multi-role",
      email: "multi@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Find Team Lead and Billing Admin roles
    const teamLeadRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "team-lead"))
      .first();
    
    const billingRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "billing-admin"))
      .first();
    
    if (!teamLeadRole || !billingRole) {
      throw new Error("Roles not found - run seed first");
    }
    
    // Assign both roles
    await ctx.db.insert("userRoles", {
      userId,
      roleId: teamLeadRole._id,
      assignedBy: userId,
      assignedAt: Date.now(),
    });
    
    await ctx.db.insert("userRoles", {
      userId,
      roleId: billingRole._id,
      assignedBy: userId,
      assignedAt: Date.now(),
    });
    
    // Test: Has team management permissions (from Team Lead)
    const canManageTeam = await hasPermission(ctx, userId, "teams.update", {
      resourceOwnerId: userId,
    });
    
    // Test: Has billing permissions (from Billing Admin)
    const canManageBilling = await hasPermission(ctx, userId, "organizations.manage-billing");
    
    // Get all permissions
    const allPermissions = await getUserPermissions(ctx, userId);
    const allRoles = await getUserRoles(ctx, userId);
    
    return {
      success: true,
      tests: {
        canManageTeam, // Should be TRUE
        canManageBilling, // Should be TRUE
        roleCount: allRoles.length, // Should be 2
        permissionCount: allPermissions.length,
        roles: allRoles.map((r) => r.role?.slug),
      },
    };
  },
});

export const testAuditLog = mutation({
  args: {},
  handler: async (ctx) => {
    // Create user and assign admin role
    const userId = await ctx.db.insert("users", {
      workosId: "test-audit-log",
      email: "audit@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    const adminRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "admin"))
      .first();
    
    if (!adminRole) throw new Error("Admin role not found");
    
    await ctx.db.insert("userRoles", {
      userId,
      roleId: adminRole._id,
      assignedBy: userId,
      assignedAt: Date.now(),
    });
    
    // Perform permission check (should create audit log entry)
    await hasPermission(ctx, userId, "teams.create");
    
    // Query audit log
    const auditLogs = await ctx.db
      .query("permissionAuditLog")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    return {
      success: true,
      auditLogCount: auditLogs.length, // Should be > 0
      latestLog: auditLogs[0],
    };
  },
});

