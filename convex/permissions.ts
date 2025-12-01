/**
 * Permission Helpers for Multi-Tenancy
 *
 * These functions provide access control patterns for future multi-tenancy support.
 * Currently, all functions return user-scoped access only (no org/team logic yet).
 *
 * When multi-tenancy is implemented, these functions will be updated to:
 * - Query workspaceMembers/teamMembers tables
 * - Check org/team membership
 * - Handle purchased content
 * - Support content ownership types
 */

import { internalQuery } from './_generated/server';
import { v } from 'convex/values';
import type { QueryCtx, MutationCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';

/**
 * Get user's accessible workspace IDs
 * FUTURE: Query workspaceMembers table
 * CURRENT: Returns empty array (user-scoped only)
 */
export async function getUserWorkspaceIds(
	ctx: QueryCtx | MutationCtx,
	userId: string
): Promise<string[]> {
	const normalizedUserId = userId as Id<'users'>;

	const memberships = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_user', (q) => q.eq('userId', normalizedUserId))
		.collect();

	return memberships.map((membership) => membership.workspaceId);
}

/**
 * Internal query: Get user's workspace IDs (for use in actions)
 */
export const getUserOrganizationIdsQuery = internalQuery({
	args: {
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const memberships = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.collect();

		return memberships.map((membership) => membership.workspaceId);
	}
});

/**
 * Get user's accessible circle IDs
 * Query circleMembers table - excludes archived memberships
 * Note: Uses by_user index + filter since by_user_archived index doesn't exist yet
 */
export async function getUserCircleIds(
	ctx: QueryCtx | MutationCtx,
	userId: string
): Promise<string[]> {
	const normalizedUserId = userId as Id<'users'>;

	// Only get active memberships (exclude archived)
	// TODO: Add by_user_archived index to schema for better performance
	const memberships = await ctx.db
		.query('circleMembers')
		.withIndex('by_user', (q) => q.eq('userId', normalizedUserId))
		.filter((q) => q.eq(q.field('archivedAt'), undefined))
		.collect();

	return memberships.map((membership) => membership.circleId);
}

/**
 * Check if user can access content
 * FUTURE: Check org/team membership, ownership, purchased content
 * CURRENT: Only checks userId match
 */
export async function canAccessContent(
	ctx: QueryCtx | MutationCtx,
	userId: string,
	content: { userId: string; workspaceId?: string; circleId?: string; ownershipType?: string }
): Promise<boolean> {
	if (content.userId === userId) {
		return true;
	}

	const [workspaceIds, circleIds] = await Promise.all([
		getUserWorkspaceIds(ctx, userId),
		getUserCircleIds(ctx, userId)
	]);

	if (content.workspaceId && workspaceIds.includes(content.workspaceId)) {
		return true;
	}

	if (content.circleId && circleIds.includes(content.circleId)) {
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
	workspaceIds: string[];
	circleIds: string[];
}> {
	const [workspaceIds, circleIds] = await Promise.all([
		getUserWorkspaceIds(ctx, userId),
		getUserCircleIds(ctx, userId)
	]);

	return {
		userId,
		workspaceIds,
		circleIds
	};
}
