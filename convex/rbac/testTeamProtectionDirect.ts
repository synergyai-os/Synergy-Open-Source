/**
 * Manual Test: Team Management Protection (Direct)
 * 
 * Test permission checks directly without going through auth layer.
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { hasPermission } from "./permissions";

export const testAdminCanCreateTeam = mutation({
  args: {},
  handler: async (ctx) => {
    // Create admin user
    const adminUserId = await ctx.db.insert("users", {
      workosId: "test-admin-create-direct",
      email: "admin@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org Direct",
      slug: "test-org-direct",
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
    
    // Test: Check if admin can create team
    const canCreate = await hasPermission(ctx, adminUserId, "teams.create", {
      organizationId: orgId,
    });
    
    return {
      success: true,
      canCreateTeam: canCreate, // Should be TRUE
    };
  },
});

export const testMemberCannotCreateTeam = mutation({
  args: {},
  handler: async (ctx) => {
    // Create member user
    const memberUserId = await ctx.db.insert("users", {
      workosId: "test-member-create-direct",
      email: "member@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org Member",
      slug: "test-org-member",
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
    
    // Test: Check if member can create team
    const canCreate = await hasPermission(ctx, memberUserId, "teams.create", {
      organizationId: orgId,
    });
    
    return {
      success: true,
      canCreateTeam: canCreate, // Should be FALSE
    };
  },
});

export const testTeamLeadCanInviteToOwnTeam = mutation({
  args: {},
  handler: async (ctx) => {
    // Create team lead user
    const teamLeadUserId = await ctx.db.insert("users", {
      workosId: "test-team-lead-invite-direct",
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
    
    // Create team
    const teamId = await ctx.db.insert("teams", {
      organizationId: orgId,
      name: "Lead's Team",
      slug: "leads-team",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Add team lead as team admin
    await ctx.db.insert("teamMembers", {
      teamId,
      userId: teamLeadUserId,
      role: "admin",
      joinedAt: Date.now(),
    });
    
    // Assign Team Lead role scoped to this team
    const teamLeadRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "team-lead"))
      .first();
    
    if (!teamLeadRole) throw new Error("Team Lead role not found");
    
    await ctx.db.insert("userRoles", {
      userId: teamLeadUserId,
      roleId: teamLeadRole._id,
      organizationId: orgId,
      teamId,
      resourceType: "team",
      resourceId: teamId,
      assignedBy: teamLeadUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Check if team lead can invite to their own team
    const canInvite = await hasPermission(ctx, teamLeadUserId, "teams.add-members", {
      organizationId: orgId,
      teamId,
      resourceType: "team",
      resourceId: teamId,
      resourceOwnerId: teamLeadUserId, // Team lead "owns" this team
    });
    
    return {
      success: true,
      canInviteToOwnTeam: canInvite, // Should be TRUE
    };
  },
});

export const testTeamLeadCannotInviteToOtherTeam = mutation({
  args: {},
  handler: async (ctx) => {
    // Create team lead user
    const teamLeadUserId = await ctx.db.insert("users", {
      workosId: "test-team-lead-other-direct",
      email: "lead2@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org Other",
      slug: "test-org-other",
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create team lead's team
    const ownTeamId = await ctx.db.insert("teams", {
      organizationId: orgId,
      name: "Own Team",
      slug: "own-team-2",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create other team
    const otherTeamId = await ctx.db.insert("teams", {
      organizationId: orgId,
      name: "Other Team",
      slug: "other-team-2",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Add team lead as admin to their own team only
    await ctx.db.insert("teamMembers", {
      teamId: ownTeamId,
      userId: teamLeadUserId,
      role: "admin",
      joinedAt: Date.now(),
    });
    
    // Assign Team Lead role scoped to own team
    const teamLeadRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "team-lead"))
      .first();
    
    if (!teamLeadRole) throw new Error("Team Lead role not found");
    
    await ctx.db.insert("userRoles", {
      userId: teamLeadUserId,
      roleId: teamLeadRole._id,
      organizationId: orgId,
      teamId: ownTeamId,
      resourceType: "team",
      resourceId: ownTeamId,
      assignedBy: teamLeadUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Check if team lead can invite to other team (with wrong owner)
    const canInvite = await hasPermission(ctx, teamLeadUserId, "teams.add-members", {
      organizationId: orgId,
      teamId: otherTeamId,
      resourceType: "team",
      resourceId: otherTeamId,
      resourceOwnerId: teamLeadUserId, // Claiming ownership but NOT admin of other team
    });
    
    return {
      success: true,
      canInviteToOtherTeam: canInvite, // Should be FALSE
    };
  },
});

export const testTeamLeadCanUpdateOwnTeam = mutation({
  args: {},
  handler: async (ctx) => {
    // Create team lead user
    const teamLeadUserId = await ctx.db.insert("users", {
      workosId: "test-team-lead-update-direct",
      email: "lead3@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org Update",
      slug: "test-org-update",
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create team
    const teamId = await ctx.db.insert("teams", {
      organizationId: orgId,
      name: "Team to Update",
      slug: "team-to-update",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Add team lead as team admin
    await ctx.db.insert("teamMembers", {
      teamId,
      userId: teamLeadUserId,
      role: "admin",
      joinedAt: Date.now(),
    });
    
    // Assign Team Lead role scoped to this team
    const teamLeadRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "team-lead"))
      .first();
    
    if (!teamLeadRole) throw new Error("Team Lead role not found");
    
    await ctx.db.insert("userRoles", {
      userId: teamLeadUserId,
      roleId: teamLeadRole._id,
      organizationId: orgId,
      teamId,
      resourceType: "team",
      resourceId: teamId,
      assignedBy: teamLeadUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Check if team lead can update their own team
    const canUpdate = await hasPermission(ctx, teamLeadUserId, "teams.update", {
      organizationId: orgId,
      teamId,
      resourceType: "team",
      resourceId: teamId,
      resourceOwnerId: teamLeadUserId,
    });
    
    return {
      success: true,
      canUpdateOwnTeam: canUpdate, // Should be TRUE
    };
  },
});

export const testTeamLeadCannotDeleteTeam = mutation({
  args: {},
  handler: async (ctx) => {
    // Create team lead user
    const teamLeadUserId = await ctx.db.insert("users", {
      workosId: "test-team-lead-delete-direct",
      email: "lead4@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org Delete",
      slug: "test-org-delete",
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create team
    const teamId = await ctx.db.insert("teams", {
      organizationId: orgId,
      name: "Team to Delete",
      slug: "team-to-delete-2",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Add team lead as team admin
    await ctx.db.insert("teamMembers", {
      teamId,
      userId: teamLeadUserId,
      role: "admin",
      joinedAt: Date.now(),
    });
    
    // Assign Team Lead role scoped to this team
    const teamLeadRole = await ctx.db
      .query("roles")
      .withIndex("by_slug", (q) => q.eq("slug", "team-lead"))
      .first();
    
    if (!teamLeadRole) throw new Error("Team Lead role not found");
    
    await ctx.db.insert("userRoles", {
      userId: teamLeadUserId,
      roleId: teamLeadRole._id,
      organizationId: orgId,
      teamId,
      resourceType: "team",
      resourceId: teamId,
      assignedBy: teamLeadUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Check if team lead can delete team (even their own)
    const canDelete = await hasPermission(ctx, teamLeadUserId, "teams.delete", {
      organizationId: orgId,
      teamId,
      resourceType: "team",
      resourceId: teamId,
      resourceOwnerId: undefined, // Explicitly not allowed for "own" scope
    });
    
    return {
      success: true,
      canDeleteTeam: canDelete, // Should be FALSE
    };
  },
});

