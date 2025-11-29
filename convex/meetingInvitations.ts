/**
 * Meeting Invitations Module - CRUD operations for meeting invitations
 *
 * Handles invitations to meetings:
 * - Can invite specific users or entire circles
 * - Creates inbox items for invited users (via Core module)
 * - Dynamic resolution: Users who join circles after meeting creation are considered invited
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Id } from './_generated/dataModel';
import type { QueryCtx, MutationCtx } from './_generated/server';

/**
 * Helper: Verify user has access to workspace
 */
async function ensureWorkspaceMembership(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<void> {
	const membership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();

	if (!membership) {
		throw new Error('User is not a member of this workspace');
	}
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all invitations for a meeting
 */
export const listByMeeting = query({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get meeting to verify workspace access
		const meeting = await ctx.db.get(args.meetingId);
		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Get all invitations for this meeting
		const invitations = await ctx.db
			.query('meetingInvitations')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.collect();

		// Resolve user/circle names for display
		const invitationsWithNames = await Promise.all(
			invitations.map(async (invitation) => {
				if (invitation.invitationType === 'user' && invitation.userId) {
					const user = await ctx.db.get(invitation.userId);
					return {
						...invitation,
						userName: user?.name ?? user?.email ?? 'Unknown User'
					};
				} else if (invitation.invitationType === 'circle' && invitation.circleId) {
					const circle = await ctx.db.get(invitation.circleId);
					return {
						...invitation,
						circleName: circle?.name ?? 'Unknown Circle'
					};
				}
				return invitation;
			})
		);

		return invitationsWithNames;
	}
});

/**
 * Check if a user is invited to a meeting
 * (considers both direct invitations and circle membership)
 */
export const isUserInvited = query({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings'),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const { userId: currentUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get meeting
		const meeting = await ctx.db.get(args.meetingId);
		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify current user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, currentUserId);

		// Public meetings: all workspace members are considered invited
		if (meeting.visibility === 'public') {
			return true;
		}

		// Private meetings: check direct invitations and circle membership
		const invitations = await ctx.db
			.query('meetingInvitations')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.collect();

		// Check direct user invitation
		const directInvitation = invitations.find(
			(inv) => inv.invitationType === 'user' && inv.userId === args.userId
		);
		if (directInvitation) {
			return true;
		}

		// Check circle invitations - see if user is member of any invited circle
		const circleInvitations = invitations.filter(
			(inv) => inv.invitationType === 'circle' && inv.circleId
		);

		for (const circleInvitation of circleInvitations) {
			if (!circleInvitation.circleId) continue;

			// Check if user is member of this circle
			const membership = await ctx.db
				.query('circleMembers')
				.withIndex('by_circle_user', (q) =>
					q.eq('circleId', circleInvitation.circleId).eq('userId', args.userId)
				)
				.first();

			if (membership) {
				return true;
			}
		}

		// Also check if meeting is linked to a circle and user is member
		if (meeting.circleId) {
			const circleMembership = await ctx.db
				.query('circleMembers')
				.withIndex('by_circle_user', (q) =>
					q.eq('circleId', meeting.circleId).eq('userId', args.userId)
				)
				.first();

			if (circleMembership) {
				return true;
			}
		}

		return false;
	}
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create an invitation to a meeting
 * Creates inbox items for invited users (if user) or circle members (if circle)
 */
export const createInvitation = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings'),
		invitationType: v.union(v.literal('user'), v.literal('circle')),
		userId: v.optional(v.id('users')),
		circleId: v.optional(v.id('circles'))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Validate exactly one ID is provided
		if (args.invitationType === 'user' && !args.userId) {
			throw new Error('userId is required when invitationType is "user"');
		}
		if (args.invitationType === 'circle' && !args.circleId) {
			throw new Error('circleId is required when invitationType is "circle"');
		}

		// Get meeting to verify workspace access
		const meeting = await ctx.db.get(args.meetingId);
		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Check if invitation already exists
		const existingInvitation = await ctx.db
			.query('meetingInvitations')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.filter((q) => {
				if (args.invitationType === 'user') {
					return q.and(
						q.eq(q.field('invitationType'), 'user'),
						q.eq(q.field('userId'), args.userId)
					);
				} else {
					return q.and(
						q.eq(q.field('invitationType'), 'circle'),
						q.eq(q.field('circleId'), args.circleId)
					);
				}
			})
			.first();

		if (existingInvitation) {
			throw new Error('Invitation already exists');
		}

		// Verify invited user/circle belongs to workspace
		if (args.invitationType === 'user' && args.userId) {
			await ensureWorkspaceMembership(ctx, meeting.workspaceId, args.userId);
		} else if (args.invitationType === 'circle' && args.circleId) {
			const circle = await ctx.db.get(args.circleId);
			if (!circle) {
				throw new Error('Circle not found');
			}
			if (circle.workspaceId !== meeting.workspaceId) {
				throw new Error('Circle does not belong to this workspace');
			}
		}

		// Create invitation
		const invitationId = await ctx.db.insert('meetingInvitations', {
			meetingId: args.meetingId,
			invitationType: args.invitationType,
			userId: args.userId,
			circleId: args.circleId,
			createdAt: Date.now(),
			createdBy: userId
		});

		// TODO: Create inbox items for invited users
		// - If user: create inbox item for that user
		// - If circle: create inbox items for all circle members
		// This will be implemented when inbox item type for meetings is added

		return { invitationId };
	}
});

/**
 * Remove an invitation from a meeting
 */
export const removeInvitation = mutation({
	args: {
		sessionId: v.string(),
		invitationId: v.id('meetingInvitations')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get invitation
		const invitation = await ctx.db.get(args.invitationId);
		if (!invitation) {
			throw new Error('Invitation not found');
		}

		// Get meeting to verify workspace access
		const meeting = await ctx.db.get(invitation.meetingId);
		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Delete invitation
		await ctx.db.delete(args.invitationId);

		return { success: true };
	}
});
