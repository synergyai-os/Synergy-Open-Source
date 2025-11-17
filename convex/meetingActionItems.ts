/**
 * Meeting Action Items Module - CRUD operations for action items
 *
 * SYOS-219: Backend support for capturing action items during meetings
 *
 * Supports:
 * - Polymorphic assignment (user OR role)
 * - Type classification (next-step vs project)
 * - Status tracking (todo, in-progress, done)
 * - Traceability to agenda items
 * - Dashboard queries (by assignee)
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';

/**
 * Helper: Verify user has access to organization
 */
async function ensureOrganizationMembership(
	ctx: QueryCtx | MutationCtx,
	organizationId: Id<'organizations'>,
	userId: Id<'users'>
): Promise<void> {
	const membership = await ctx.db
		.query('organizationMembers')
		.withIndex('by_organization_user', (q) =>
			q.eq('organizationId', organizationId).eq('userId', userId)
		)
		.first();

	if (!membership) {
		throw new Error('User is not a member of this organization');
	}
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all action items with optional filters
 */
export const list = query({
	args: {
		sessionId: v.string(),
		organizationId: v.id('organizations'),
		status: v.optional(v.union(v.literal('todo'), v.literal('in-progress'), v.literal('done'))),
		type: v.optional(v.union(v.literal('next-step'), v.literal('project')))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, args.organizationId, userId);

		// Get all meetings in org
		const meetings = await ctx.db
			.query('meetings')
			.withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
			.collect();

		const meetingIds = meetings.map((m) => m._id);

		// Get all action items for these meetings
		const allActions = await Promise.all(
			meetingIds.map((meetingId) =>
				ctx.db
					.query('meetingActionItems')
					.withIndex('by_meeting', (q) => q.eq('meetingId', meetingId))
					.collect()
			)
		);

		let items = allActions.flat();

		// Apply filters
		if (args.status) {
			items = items.filter((item) => item.status === args.status);
		}

		if (args.type) {
			items = items.filter((item) => item.type === args.type);
		}

		return items;
	}
});

/**
 * List action items for a specific meeting
 */
export const listByMeeting = query({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get meeting to verify org access
		const meeting = await ctx.db.get(args.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Get all action items for this meeting
		const items = await ctx.db
			.query('meetingActionItems')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.collect();

		return items;
	}
});

/**
 * List action items for a specific agenda item
 */
export const listByAgendaItem = query({
	args: {
		sessionId: v.string(),
		agendaItemId: v.id('meetingAgendaItems')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get agenda item
		const agendaItem = await ctx.db.get(args.agendaItemId);

		if (!agendaItem) {
			throw new Error('Agenda item not found');
		}

		// Get meeting to verify org access
		const meeting = await ctx.db.get(agendaItem.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Get all action items for this agenda item
		const items = await ctx.db
			.query('meetingActionItems')
			.withIndex('by_agenda_item', (q) => q.eq('agendaItemId', args.agendaItemId))
			.collect();

		return items;
	}
});

/**
 * List action items assigned to a specific user (for dashboard)
 */
export const listByAssignee = query({
	args: {
		sessionId: v.string(),
		userId: v.optional(v.id('users')), // Optional: defaults to current user
		status: v.optional(v.union(v.literal('todo'), v.literal('in-progress'), v.literal('done')))
	},
	handler: async (ctx, args) => {
		const { userId: currentUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Default to current user if not specified
		const targetUserId = args.userId ?? currentUserId;

		// Get all action items assigned to this user
		const items = await ctx.db
			.query('meetingActionItems')
			.withIndex('by_assignee_user', (q) => q.eq('assigneeUserId', targetUserId))
			.collect();

		// Filter by status if provided
		if (args.status) {
			return items.filter((item) => item.status === args.status);
		}

		return items;
	}
});

/**
 * Get a single action item by ID
 */
export const get = query({
	args: {
		sessionId: v.string(),
		actionItemId: v.id('meetingActionItems')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const actionItem = await ctx.db.get(args.actionItemId);

		if (!actionItem) {
			throw new Error('Action item not found');
		}

		// Get meeting to verify org access
		const meeting = await ctx.db.get(actionItem.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		return actionItem;
	}
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new action item
 */
export const create = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings'),
		agendaItemId: v.id('meetingAgendaItems'),
		circleId: v.optional(v.id('circles')),
		type: v.union(v.literal('next-step'), v.literal('project')),
		assigneeType: v.union(v.literal('user'), v.literal('role')),
		assigneeUserId: v.optional(v.id('users')),
		assigneeRoleId: v.optional(v.id('circleRoles')),
		description: v.string(),
		dueDate: v.optional(v.number()),
		status: v.optional(v.union(v.literal('todo'), v.literal('in-progress'), v.literal('done')))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Validate assignee fields
		if (args.assigneeType === 'user' && !args.assigneeUserId) {
			throw new Error('assigneeUserId is required when assigneeType is "user"');
		}

		if (args.assigneeType === 'role' && !args.assigneeRoleId) {
			throw new Error('assigneeRoleId is required when assigneeType is "role"');
		}

		// Get meeting to verify org access
		const meeting = await ctx.db.get(args.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Verify agenda item belongs to this meeting
		const agendaItem = await ctx.db.get(args.agendaItemId);

		if (!agendaItem || agendaItem.meetingId !== args.meetingId) {
			throw new Error('Agenda item not found or does not belong to this meeting');
		}

		// Create action item
		const actionItemId = await ctx.db.insert('meetingActionItems', {
			meetingId: args.meetingId,
			agendaItemId: args.agendaItemId,
			circleId: args.circleId,
			type: args.type,
			assigneeType: args.assigneeType,
			assigneeUserId: args.assigneeUserId,
			assigneeRoleId: args.assigneeRoleId,
			description: args.description,
			dueDate: args.dueDate,
			status: args.status ?? 'todo',
			createdAt: Date.now(),
			createdBy: userId
		});

		return { actionItemId };
	}
});

/**
 * Update action item details
 */
export const update = mutation({
	args: {
		sessionId: v.string(),
		actionItemId: v.id('meetingActionItems'),
		description: v.optional(v.string()),
		dueDate: v.optional(v.number()),
		type: v.optional(v.union(v.literal('next-step'), v.literal('project'))),
		circleId: v.optional(v.id('circles'))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get action item
		const actionItem = await ctx.db.get(args.actionItemId);

		if (!actionItem) {
			throw new Error('Action item not found');
		}

		// Get meeting to verify org access
		const meeting = await ctx.db.get(actionItem.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Build update object (only include defined fields)
		const updates: {
			description?: string;
			dueDate?: number;
			type?: 'next-step' | 'project';
			circleId?: Id<'circles'>;
			updatedAt: number;
		} = {
			updatedAt: Date.now()
		};

		if (args.description !== undefined) updates.description = args.description;
		if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
		if (args.type !== undefined) updates.type = args.type;
		if (args.circleId !== undefined) updates.circleId = args.circleId;

		// Update action item
		await ctx.db.patch(args.actionItemId, updates);

		return { success: true };
	}
});

/**
 * Update action item status
 */
export const updateStatus = mutation({
	args: {
		sessionId: v.string(),
		actionItemId: v.id('meetingActionItems'),
		status: v.union(v.literal('todo'), v.literal('in-progress'), v.literal('done'))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get action item
		const actionItem = await ctx.db.get(args.actionItemId);

		if (!actionItem) {
			throw new Error('Action item not found');
		}

		// Get meeting to verify org access
		const meeting = await ctx.db.get(actionItem.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Update status
		await ctx.db.patch(args.actionItemId, {
			status: args.status,
			updatedAt: Date.now()
		});

		return { success: true };
	}
});

/**
 * Update action item assignee (user or role)
 */
export const updateAssignee = mutation({
	args: {
		sessionId: v.string(),
		actionItemId: v.id('meetingActionItems'),
		assigneeType: v.union(v.literal('user'), v.literal('role')),
		assigneeUserId: v.optional(v.id('users')),
		assigneeRoleId: v.optional(v.id('circleRoles'))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Validate assignee fields
		if (args.assigneeType === 'user' && !args.assigneeUserId) {
			throw new Error('assigneeUserId is required when assigneeType is "user"');
		}

		if (args.assigneeType === 'role' && !args.assigneeRoleId) {
			throw new Error('assigneeRoleId is required when assigneeType is "role"');
		}

		// Get action item
		const actionItem = await ctx.db.get(args.actionItemId);

		if (!actionItem) {
			throw new Error('Action item not found');
		}

		// Get meeting to verify org access
		const meeting = await ctx.db.get(actionItem.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Update assignee
		await ctx.db.patch(args.actionItemId, {
			assigneeType: args.assigneeType,
			assigneeUserId: args.assigneeUserId,
			assigneeRoleId: args.assigneeRoleId,
			updatedAt: Date.now()
		});

		return { success: true };
	}
});

/**
 * Delete an action item
 */
export const remove = mutation({
	args: {
		sessionId: v.string(),
		actionItemId: v.id('meetingActionItems')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get action item
		const actionItem = await ctx.db.get(args.actionItemId);

		if (!actionItem) {
			throw new Error('Action item not found');
		}

		// Get meeting to verify org access
		const meeting = await ctx.db.get(actionItem.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Delete action item
		await ctx.db.delete(args.actionItemId);

		return { success: true };
	}
});
