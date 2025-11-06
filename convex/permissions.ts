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

/**
 * Get user's accessible organization IDs
 * FUTURE: Query organizationMembers table
 * CURRENT: Returns empty array (user-scoped only)
 */
export async function getUserOrganizationIds(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<string[]> {
  // TODO: Future implementation
  // const memberships = await ctx.db
  //   .query("organizationMembers")
  //   .withIndex("by_user", (q) => q.eq("userId", userId))
  //   .collect();
  // return memberships.map(m => m.organizationId);
  
  return []; // User-scoped only for now
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
  // TODO: Future implementation
  // const memberships = await ctx.db
  //   .query("teamMembers")
  //   .withIndex("by_user", (q) => q.eq("userId", userId))
  //   .collect();
  // return memberships.map(m => m.teamId);
  
  return []; // User-scoped only for now
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
  // Current: User-scoped only
  if (content.userId === userId) {
    return true;
  }
  
  // TODO: Future implementation
  // - Check organizationId membership (if content.organizationId exists)
  // - Check teamId membership (if content.teamId exists)
  // - Check purchased content (if ownershipType === "purchased")
  // - Check ownershipType permissions (org/team members can access org/team content)
  // const orgIds = await getUserOrganizationIds(ctx, userId);
  // const teamIds = await getUserTeamIds(ctx, userId);
  // if (content.organizationId && orgIds.includes(content.organizationId)) {
  //   return true;
  // }
  // if (content.teamId && teamIds.includes(content.teamId)) {
  //   return true;
  // }
  // if (content.ownershipType === "purchased") {
  //   // Check if user has purchased this content
  //   // ...
  // }
  
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
): Promise<{ userId: string }> {
  // Current: User-scoped only
  return { userId };
  
  // TODO: Future implementation
  // When implementing multi-tenancy, this will need to be handled differently
  // because Convex queries with indexes don't support $or directly.
  // Options:
  // 1. Query user content, org content, and team content separately, then combine
  // 2. Use a different index pattern (e.g., composite index on userId + organizationId)
  // 3. Use full table scan with filter (less efficient, but works for small datasets)
  //
  // Example approach:
  // const orgIds = await getUserOrganizationIds(ctx, userId);
  // const teamIds = await getUserTeamIds(ctx, userId);
  // 
  // // Query user-owned content
  // const userContent = await ctx.db
  //   .query("flashcards")
  //   .withIndex("by_user", (q) => q.eq("userId", userId))
  //   .collect();
  // 
  // // Query org-owned content
  // const orgContent = orgIds.length > 0
  //   ? await Promise.all(
  //       orgIds.map(orgId =>
  //         ctx.db
  //           .query("flashcards")
  //           .withIndex("by_organization", (q) => q.eq("organizationId", orgId))
  //           .collect()
  //       )
  //     ).then(results => results.flat())
  //   : [];
  // 
  // // Query team-owned content
  // const teamContent = teamIds.length > 0
  //   ? await Promise.all(
  //       teamIds.map(teamId =>
  //         ctx.db
  //           .query("flashcards")
  //           .withIndex("by_team", (q) => q.eq("teamId", teamId))
  //           .collect()
  //       )
  //     ).then(results => results.flat())
  //   : [];
  // 
  // // Combine and deduplicate
  // const allContent = [...userContent, ...orgContent, ...teamContent];
  // const uniqueContent = Array.from(new Map(allContent.map(item => [item._id, item])).values());
  // return uniqueContent;
}

