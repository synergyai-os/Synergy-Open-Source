/**
 * Manual Test: Team Management Protection
 * 
 * Test that RBAC permission checks protect team operations correctly.
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const testAdminCanCreateTeam = mutation({
  args: {},
  handler: async (ctx) => {
    // Create admin user
    const adminUserId = await ctx.db.insert("users", {
      workosId: "test-admin-create-team",
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
    
    // Add admin to org
    await ctx.db.insert("organizationMembers", {
      organizationId: orgId,
      userId: adminUserId,
      role: "admin",
      joinedAt: Date.now(),
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
    
    // Test: Admin creates team (should succeed)
    const result = await ctx.runMutation(api.teams.createTeam, {
      organizationId: orgId,
      name: "Test Team",
    });
    
    return {
      success: true,
      teamCreated: result.teamId !== undefined,
      teamId: result.teamId,
    };
  },
});

export const testMemberCannotCreateTeam = mutation({
  args: {},
  handler: async (ctx) => {
    // Create member user
    const memberUserId = await ctx.db.insert("users", {
      workosId: "test-member-create-team",
      email: "member@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org 2",
      slug: "test-org-2",
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Add member to org
    await ctx.db.insert("organizationMembers", {
      organizationId: orgId,
      userId: memberUserId,
      role: "member",
      joinedAt: Date.now(),
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
    
    // Test: Member tries to create team (should fail)
    let errorMessage = "";
    try {
      await ctx.runMutation(api.teams.createTeam, {
        organizationId: orgId,
        name: "Should Fail",
      });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Unknown error";
    }
    
    return {
      success: true,
      permissionDenied: errorMessage.includes("Permission denied"),
      errorMessage,
    };
  },
});

export const testTeamLeadCanInviteToOwnTeam = mutation({
  args: {},
  handler: async (ctx) => {
    // Create team lead user
    const teamLeadUserId = await ctx.db.insert("users", {
      workosId: "test-team-lead-invite",
      email: "lead@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org 3",
      slug: "test-org-3",
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create team
    const teamId = await ctx.db.insert("teams", {
      organizationId: orgId,
      name: "Team Lead's Team",
      slug: "team-leads-team",
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
      teamId,
      resourceType: "team",
      resourceId: teamId,
      assignedBy: teamLeadUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Team Lead invites to their own team (should succeed)
    const result = await ctx.runMutation(api.teams.createTeamInvite, {
      teamId,
      email: "newmember@test.com",
      role: "member",
    });
    
    return {
      success: true,
      inviteCreated: result.inviteId !== undefined,
      inviteId: result.inviteId,
    };
  },
});

export const testTeamLeadCannotInviteToOtherTeam = mutation({
  args: {},
  handler: async (ctx) => {
    // Create team lead user
    const teamLeadUserId = await ctx.db.insert("users", {
      workosId: "test-team-lead-other",
      email: "lead2@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org 4",
      slug: "test-org-4",
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create team lead's team
    const ownTeamId = await ctx.db.insert("teams", {
      organizationId: orgId,
      name: "Own Team",
      slug: "own-team",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create other team
    const otherTeamId = await ctx.db.insert("teams", {
      organizationId: orgId,
      name: "Other Team",
      slug: "other-team",
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
      teamId: ownTeamId,
      resourceType: "team",
      resourceId: ownTeamId,
      assignedBy: teamLeadUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Team Lead tries to invite to other team (should fail)
    let errorMessage = "";
    try {
      await ctx.runMutation(api.teams.createTeamInvite, {
        teamId: otherTeamId,
        email: "newmember2@test.com",
        role: "member",
      });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Unknown error";
    }
    
    return {
      success: true,
      permissionDenied: errorMessage.includes("Permission denied"),
      errorMessage,
    };
  },
});

export const testTeamLeadCanUpdateOwnTeam = mutation({
  args: {},
  handler: async (ctx) => {
    // Create team lead user
    const teamLeadUserId = await ctx.db.insert("users", {
      workosId: "test-team-lead-update",
      email: "lead3@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org 5",
      slug: "test-org-5",
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create team
    const teamId = await ctx.db.insert("teams", {
      organizationId: orgId,
      name: "Original Name",
      slug: "original-name",
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
      teamId,
      resourceType: "team",
      resourceId: teamId,
      assignedBy: teamLeadUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Team Lead updates their own team (should succeed)
    const result = await ctx.runMutation(api.teams.updateTeam, {
      teamId,
      name: "Updated Name",
    });
    
    // Verify update
    const updatedTeam = await ctx.db.get(teamId);
    
    return {
      success: true,
      teamUpdated: result.success,
      newName: updatedTeam?.name,
    };
  },
});

export const testTeamLeadCannotDeleteTeam = mutation({
  args: {},
  handler: async (ctx) => {
    // Create team lead user
    const teamLeadUserId = await ctx.db.insert("users", {
      workosId: "test-team-lead-delete",
      email: "lead4@test.com",
      emailVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Org 6",
      slug: "test-org-6",
      plan: "free",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create team
    const teamId = await ctx.db.insert("teams", {
      organizationId: orgId,
      name: "Team to Delete",
      slug: "team-to-delete",
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
      teamId,
      resourceType: "team",
      resourceId: teamId,
      assignedBy: teamLeadUserId,
      assignedAt: Date.now(),
    });
    
    // Test: Team Lead tries to delete team (should fail - even their own)
    let errorMessage = "";
    try {
      await ctx.runMutation(api.teams.deleteTeam, {
        teamId,
      });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Unknown error";
    }
    
    return {
      success: true,
      permissionDenied: errorMessage.includes("Permission denied"),
      errorMessage,
    };
  },
});

