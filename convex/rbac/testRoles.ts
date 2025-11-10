/**
 * Manual Test: Role Management
 * 
 * Run from Convex dashboard to manually verify role assignment/revocation.
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const testAssignRole = mutation({
  args: {},
  handler: async (ctx) => {
    // Create admin user
    const adminUserId = await ctx.db.insert("users", {
      workosId: "test-admin-assign-role",
      email: "admin@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create target user
    const targetUserId = await ctx.db.insert("users", {
      workosId: "test-target-user",
      email: "target@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Find Admin role and assign to admin user
    const adminRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "admin"))
      .first();
    
    if (!adminRole) throw new Error("Admin role not found");
    
    await ctx.db.insert("userRoles", {
      userId: adminUserId,
      roleId: adminRole._id,
      assignedBy: adminUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Admin assigns Team Lead role to target user
    const result = await ctx.runMutation(api.rbac.roles.assignRole, {
      userId: adminUserId,
      targetUserId,
      roleSlug: "team-lead",
    });
    
    // Verify role was assigned
    const userRoles = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .filter((q) => q.eq(q.field("revokedAt"), undefined))
      .collect();
    
    // Verify audit log
    const auditLogs = await ctx.db
      .query("permissionAuditLog")
      .withIndex("by_user", (q) => q.eq("userId", adminUserId))
      .filter((q) => q.eq(q.field("action"), "assign_role"))
      .collect();
    
    return {
      success: true,
      assignResult: result,
      userRolesCount: userRoles.length, // Should be 1
      auditLogsCount: auditLogs.length, // Should be > 0
    };
  },
});

export const testRevokeRole = mutation({
  args: {},
  handler: async (ctx) => {
    // Create admin user
    const adminUserId = await ctx.db.insert("users", {
      workosId: "test-admin-revoke-role",
      email: "admin2@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create target user
    const targetUserId = await ctx.db.insert("users", {
      workosId: "test-target-user-2",
      email: "target2@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Find Admin role and assign to admin user
    const adminRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "admin"))
      .first();
    
    if (!adminRole) throw new Error("Admin role not found");
    
    await ctx.db.insert("userRoles", {
      userId: adminUserId,
      roleId: adminRole._id,
      assignedBy: adminUserId,
      assignedAt: Date.now(),
    });
    
    // Assign Team Lead role to target user first
    const assignResult = await ctx.runMutation(api.rbac.roles.assignRole, {
      userId: adminUserId,
      targetUserId,
      roleSlug: "team-lead",
    });
    
    // Test: Revoke the role
    const revokeResult = await ctx.runMutation(api.rbac.roles.revokeRole, {
      userId: adminUserId,
      userRoleId: assignResult.userRoleId,
    });
    
    // Verify role was revoked
    const userRole = await ctx.db.get(assignResult.userRoleId);
    
    // Verify audit logs
    const auditLogs = await ctx.db
      .query("permissionAuditLog")
      .withIndex("by_user", (q) => q.eq("userId", adminUserId))
      .filter((q) => q.eq(q.field("action"), "revoke_role"))
      .collect();
    
    return {
      success: true,
      revokeResult,
      roleRevoked: userRole?.revokedAt !== undefined, // Should be true
      auditLogsCount: auditLogs.length, // Should be > 0
    };
  },
});

export const testResourceScopedRole = mutation({
  args: {},
  handler: async (ctx) => {
    // Create admin user
    const adminUserId = await ctx.db.insert("users", {
      workosId: "test-admin-scoped",
      email: "admin3@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create target user
    const targetUserId = await ctx.db.insert("users", {
      workosId: "test-target-user-3",
      email: "target3@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create an organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org",
      slug: "test-org",
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create a team
    const teamId = await ctx.db.insert("teams", {
      organizationId: orgId,
      name: "Test Team",
      slug: "test-team",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Find Admin role and assign to admin user
    const adminRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "admin"))
      .first();
    
    if (!adminRole) throw new Error("Admin role not found");
    
    await ctx.db.insert("userRoles", {
      userId: adminUserId,
      roleId: adminRole._id,
      assignedBy: adminUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Assign Team Lead role scoped to specific team
    const result = await ctx.runMutation(api.rbac.roles.assignRole, {
      userId: adminUserId,
      targetUserId,
      roleSlug: "team-lead",
      organizationId: orgId,
      teamId,
      resourceType: "team",
      resourceId: teamId,
    });
    
    // Verify role was assigned with scope
    const userRole = await ctx.db.get(result.userRoleId);
    
    return {
      success: true,
      assignResult: result,
      roleHasOrgScope: userRole?.organizationId === orgId, // Should be true
      roleHasTeamScope: userRole?.teamId === teamId, // Should be true
      roleResourceType: userRole?.resourceType, // Should be "team"
    };
  },
});

export const testNonAdminCannotAssignRole = mutation({
  args: {},
  handler: async (ctx) => {
    // Create regular member user
    const memberUserId = await ctx.db.insert("users", {
      workosId: "test-member-no-assign",
      email: "member@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create target user
    const targetUserId = await ctx.db.insert("users", {
      workosId: "test-target-user-4",
      email: "target4@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Find Member role and assign to member user
    const memberRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "member"))
      .first();
    
    if (!memberRole) throw new Error("Member role not found");
    
    await ctx.db.insert("userRoles", {
      userId: memberUserId,
      roleId: memberRole._id,
      assignedBy: memberUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Member tries to assign role (should fail)
    let errorMessage = "";
    try {
      await ctx.runMutation(api.rbac.roles.assignRole, {
        userId: memberUserId,
        targetUserId,
        roleSlug: "team-lead",
      });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Unknown error";
    }
    
    return {
      success: true,
      permissionDenied: errorMessage.includes("Permission denied"), // Should be true
      errorMessage,
    };
  },
});

export const testRoleAuditLog = mutation({
  args: {},
  handler: async (ctx) => {
    // Create admin user
    const adminUserId = await ctx.db.insert("users", {
      workosId: "test-admin-audit",
      email: "admin4@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create target user
    const targetUserId = await ctx.db.insert("users", {
      workosId: "test-target-user-5",
      email: "target5@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Find Admin role and assign to admin user
    const adminRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "admin"))
      .first();
    
    if (!adminRole) throw new Error("Admin role not found");
    
    await ctx.db.insert("userRoles", {
      userId: adminUserId,
      roleId: adminRole._id,
      assignedBy: adminUserId,
      assignedAt: Date.now(),
    });
    
    // Assign and revoke role
    const assignResult = await ctx.runMutation(api.rbac.roles.assignRole, {
      userId: adminUserId,
      targetUserId,
      roleSlug: "team-lead",
    });
    
    await ctx.runMutation(api.rbac.roles.revokeRole, {
      userId: adminUserId,
      userRoleId: assignResult.userRoleId,
    });
    
    // Check audit log
    const assignLogs = await ctx.db
      .query("permissionAuditLog")
      .withIndex("by_action", (q) => q.eq("action", "assign_role"))
      .collect();
    
    const revokeLogs = await ctx.db
      .query("permissionAuditLog")
      .withIndex("by_action", (q) => q.eq("action", "revoke_role"))
      .collect();
    
    return {
      success: true,
      assignLogsCount: assignLogs.length, // Should be > 0
      revokeLogsCount: revokeLogs.length, // Should be > 0
      latestAssignLog: assignLogs[assignLogs.length - 1],
      latestRevokeLog: revokeLogs[revokeLogs.length - 1],
    };
  },
});

