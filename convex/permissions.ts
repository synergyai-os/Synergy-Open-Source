/**
 * Permission Helpers for Multi-Tenancy
 * 
 * These functions provide access control patterns for future multi-tenancy support.
 * Currently, all functions return user-scoped access only (no org/team logic yet).
 * 
 * When multi-tenancy is implemented, these functions will be updated to:
 * - Query organizationMembers/teamMembers tables
 * - Check org/team membership
 * - Handle purchased content
 * - Support content ownership types
 */

import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Get user's accessible organization IDs
 * FUTURE: Query organizationMembers table
 * CURRENT: Returns empty array (user-scoped only)
 */
export async function getUserOrganizationIds(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<string[]> {
  const normalizedUserId = userId as Id<"users">;

  const memberships = await ctx.db
    .query("organizationMembers")
    .withIndex("by_user", (q) => q.eq("userId", normalizedUserId))
    .collect();

  return memberships.map((membership) => membership.organizationId);
}

/**
 * Get user's accessible team IDs
 * FUTURE: Query teamMembers table
 * CURRENT: Returns empty array (user-scoped only)
 */
export async function getUserTeamIds(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<string[]> {
  const normalizedUserId = userId as Id<"users">;

  const memberships = await ctx.db
    .query("teamMembers")
    .withIndex("by_user", (q) => q.eq("userId", normalizedUserId))
    .collect();

  return memberships.map((membership) => membership.teamId);
}

/**
 * Check if user can access content
 * FUTURE: Check org/team membership, ownership, purchased content
 * CURRENT: Only checks userId match
 */
export async function canAccessContent(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  content: { userId: string; organizationId?: string; teamId?: string; ownershipType?: string }
): Promise<boolean> {
  if (content.userId === userId) {
    return true;
  }

  const [organizationIds, teamIds] = await Promise.all([
    getUserOrganizationIds(ctx, userId),
    getUserTeamIds(ctx, userId)
  ]);

  if (content.organizationId && organizationIds.includes(content.organizationId)) {
    return true;
  }

  if (content.teamId && teamIds.includes(content.teamId)) {
    return true;
  }

  return false;
}

/**
 * Build query filter for user's accessible content
 * FUTURE: Include org/team content in query
 * CURRENT: Only filters by userId
 * 
 * Note: Convex queries don't support $or directly in withIndex.
 * When implementing, may need to use multiple queries and combine results,
 * or use a different query pattern.
 */
export async function getContentAccessFilter(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<{
  userId: string;
  organizationIds: string[];
  teamIds: string[];
}> {
  const [organizationIds, teamIds] = await Promise.all([
    getUserOrganizationIds(ctx, userId),
    getUserTeamIds(ctx, userId)
  ]);

  return {
    userId,
    organizationIds,
    teamIds
  };
}

