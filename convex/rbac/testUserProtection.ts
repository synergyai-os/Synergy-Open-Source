/**
 * Manual Test: User Management Protection (Direct)
 * 
 * Test permission checks for user management operations.
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { hasPermission } from "./permissions";

export const testAdminCanInviteUser = mutation({
  args: {},
  handler: async (ctx) => {
    // Create admin user
    const adminUserId = await ctx.db.insert("users", {
      workosId: "test-admin-invite-user",
      email: "admin@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org",
      slug: "test-org",
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Assign Admin role
    const adminRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "admin"))
      .first();
    
    if (!adminRole) throw new Error("Admin role not found");
    
    await ctx.db.insert("userRoles", {
      userId: adminUserId,
      roleId: adminRole._id,
      organizationId: orgId,
      assignedBy: adminUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Check if admin can invite users
    const canInvite = await hasPermission(ctx, adminUserId, "users.invite", {
      organizationId: orgId,
    });
    
    return {
      success: true,
      canInviteUser: canInvite, // Should be TRUE
    };
  },
});

export const testManagerCanInviteUser = mutation({
  args: {},
  handler: async (ctx) => {
    // Create manager user
    const managerUserId = await ctx.db.insert("users", {
      workosId: "test-manager-invite-user",
      email: "manager@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org Manager",
      slug: "test-org-manager",
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Assign Manager role
    const managerRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "manager"))
      .first();
    
    if (!managerRole) throw new Error("Manager role not found");
    
    await ctx.db.insert("userRoles", {
      userId: managerUserId,
      roleId: managerRole._id,
      organizationId: orgId,
      assignedBy: managerUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Check if manager can invite users
    const canInvite = await hasPermission(ctx, managerUserId, "users.invite", {
      organizationId: orgId,
    });
    
    return {
      success: true,
      canInviteUser: canInvite, // Should be TRUE
    };
  },
});

export const testTeamLeadCannotInviteUser = mutation({
  args: {},
  handler: async (ctx) => {
    // Create team lead user
    const teamLeadUserId = await ctx.db.insert("users", {
      workosId: "test-team-lead-invite-user",
      email: "lead@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org Lead",
      slug: "test-org-lead",
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Assign Team Lead role
    const teamLeadRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "team-lead"))
      .first();
    
    if (!teamLeadRole) throw new Error("Team Lead role not found");
    
    await ctx.db.insert("userRoles", {
      userId: teamLeadUserId,
      roleId: teamLeadRole._id,
      organizationId: orgId,
      assignedBy: teamLeadUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Check if team lead can invite users
    const canInvite = await hasPermission(ctx, teamLeadUserId, "users.invite", {
      organizationId: orgId,
    });
    
    return {
      success: true,
      canInviteUser: canInvite, // Should be FALSE
    };
  },
});

export const testAdminCanRemoveUser = mutation({
  args: {},
  handler: async (ctx) => {
    // Create admin user
    const adminUserId = await ctx.db.insert("users", {
      workosId: "test-admin-remove-user",
      email: "admin2@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org Remove",
      slug: "test-org-remove",
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Assign Admin role
    const adminRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "admin"))
      .first();
    
    if (!adminRole) throw new Error("Admin role not found");
    
    await ctx.db.insert("userRoles", {
      userId: adminUserId,
      roleId: adminRole._id,
      organizationId: orgId,
      assignedBy: adminUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Check if admin can remove users
    const canRemove = await hasPermission(ctx, adminUserId, "users.remove", {
      organizationId: orgId,
    });
    
    return {
      success: true,
      canRemoveUser: canRemove, // Should be TRUE
    };
  },
});

export const testManagerCannotRemoveUser = mutation({
  args: {},
  handler: async (ctx) => {
    // Create manager user
    const managerUserId = await ctx.db.insert("users", {
      workosId: "test-manager-remove-user",
      email: "manager2@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org Manager Remove",
      slug: "test-org-manager-remove",
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Assign Manager role
    const managerRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "manager"))
      .first();
    
    if (!managerRole) throw new Error("Manager role not found");
    
    await ctx.db.insert("userRoles", {
      userId: managerUserId,
      roleId: managerRole._id,
      organizationId: orgId,
      assignedBy: managerUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Check if manager can remove users
    const canRemove = await hasPermission(ctx, managerUserId, "users.remove", {
      organizationId: orgId,
    });
    
    return {
      success: true,
      canRemoveUser: canRemove, // Should be FALSE
    };
  },
});

export const testUserCanEditOwnProfile = mutation({
  args: {},
  handler: async (ctx) => {
    // Create member user
    const memberUserId = await ctx.db.insert("users", {
      workosId: "test-member-edit-profile",
      email: "member@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org Profile",
      slug: "test-org-profile",
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Assign Member role
    const memberRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "member"))
      .first();
    
    if (!memberRole) throw new Error("Member role not found");
    
    await ctx.db.insert("userRoles", {
      userId: memberUserId,
      roleId: memberRole._id,
      organizationId: orgId,
      assignedBy: memberUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Check if member can edit their own profile
    const canEditOwn = await hasPermission(ctx, memberUserId, "users.manage-profile", {
      resourceOwnerId: memberUserId, // Editing own profile
    });
    
    return {
      success: true,
      canEditOwnProfile: canEditOwn, // Should be TRUE
    };
  },
});

export const testUserCannotEditOthersProfile = mutation({
  args: {},
  handler: async (ctx) => {
    // Create member user
    const memberUserId = await ctx.db.insert("users", {
      workosId: "test-member-edit-other",
      email: "member2@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create other user
    const otherUserId = await ctx.db.insert("users", {
      workosId: "test-other-user",
      email: "other@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org Profile Other",
      slug: "test-org-profile-other",
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Assign Member role
    const memberRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "member"))
      .first();
    
    if (!memberRole) throw new Error("Member role not found");
    
    await ctx.db.insert("userRoles", {
      userId: memberUserId,
      roleId: memberRole._id,
      organizationId: orgId,
      assignedBy: memberUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Check if member can edit other user's profile
    const canEditOther = await hasPermission(ctx, memberUserId, "users.manage-profile", {
      resourceOwnerId: otherUserId, // Editing other user's profile
    });
    
    return {
      success: true,
      canEditOthersProfile: canEditOther, // Should be FALSE
    };
  },
});

export const testAdminCanEditAnyProfile = mutation({
  args: {},
  handler: async (ctx) => {
    // Create admin user
    const adminUserId = await ctx.db.insert("users", {
      workosId: "test-admin-edit-profile",
      email: "admin3@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create other user
    const otherUserId = await ctx.db.insert("users", {
      workosId: "test-other-user-2",
      email: "other2@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org Admin Profile",
      slug: "test-org-admin-profile",
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Assign Admin role
    const adminRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "admin"))
      .first();
    
    if (!adminRole) throw new Error("Admin role not found");
    
    await ctx.db.insert("userRoles", {
      userId: adminUserId,
      roleId: adminRole._id,
      organizationId: orgId,
      assignedBy: adminUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Check if admin can edit any profile
    const canEditAny = await hasPermission(ctx, adminUserId, "users.manage-profile", {
      resourceOwnerId: otherUserId, // Editing other user's profile
    });
    
    return {
      success: true,
      canEditAnyProfile: canEditAny, // Should be TRUE
    };
  },
});

