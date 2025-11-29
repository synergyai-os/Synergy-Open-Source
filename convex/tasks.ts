/**
 * Tasks Module - CRUD operations for tasks
 *
 * Tasks can exist standalone or be linked to meetings/projects.
 * Supports:
 * - Polymorphic assignment (user OR role)
 * - Status tracking (todo, in-progress, done)
 * - Traceability to agenda items and meetings
 * - Optional linking to projects for external tool sync
 * - Dashboard queries (by assignee, workspace, meeting)
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';

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
 * List all action items with optional filters
 */
export const list = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		status: v.optional(v.union(v.literal('todo'), v.literal('in-progress'), v.literal('done')))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

		// Get all tasks for this workspace (tasks can exist standalone or be linked to meetings)
		let items = await ctx.db
			.query('tasks')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect();

		// Apply filters
		if (args.status) {
			items = items.filter((item) => item.status === args.status);
		}

		// Type filter removed - all tasks are individual tasks (no type field)

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

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Get all tasks for this meeting
		const items = await ctx.db
			.query('tasks')
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

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Get all tasks for this agenda item
		const items = await ctx.db
			.query('tasks')
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

		// Get all tasks assigned to this user
		const items = await ctx.db
			.query('tasks')
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
		actionItemId: v.id('tasks')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const task = await ctx.db.get(args.actionItemId);

		if (!task) {
			throw new Error('Task not found');
		}

		// Verify user has access to workspace (tasks can exist standalone or be linked to meetings)
		await ensureWorkspaceMembership(ctx, task.workspaceId, userId);

		return task;
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
		workspaceId: v.id('workspaces'), // Required: all tasks belong to a workspace
		meetingId: v.optional(v.id('meetings')), // Optional: task can exist standalone
		agendaItemId: v.optional(v.id('meetingAgendaItems')), // Optional: traceability to agenda item
		projectId: v.optional(v.id('projects')), // Optional: link to project
		circleId: v.optional(v.id('circles')),
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

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

		// If meetingId provided, verify meeting exists and belongs to workspace
		if (args.meetingId) {
			const meeting = await ctx.db.get(args.meetingId);
			if (!meeting) {
				throw new Error('Meeting not found');
			}
			if (meeting.workspaceId !== args.workspaceId) {
				throw new Error('Meeting does not belong to this workspace');
			}

			// If agendaItemId provided, verify it belongs to this meeting
			if (args.agendaItemId) {
				const agendaItem = await ctx.db.get(args.agendaItemId);
				if (!agendaItem || agendaItem.meetingId !== args.meetingId) {
					throw new Error('Agenda item not found or does not belong to this meeting');
				}
			}
		} else if (args.agendaItemId) {
			// Can't have agendaItemId without meetingId
			throw new Error('agendaItemId requires meetingId');
		}

		// If projectId provided, verify project exists and belongs to workspace
		if (args.projectId) {
			const project = await ctx.db.get(args.projectId);
			if (!project) {
				throw new Error('Project not found');
			}
			if (project.workspaceId !== args.workspaceId) {
				throw new Error('Project does not belong to this workspace');
			}
		}

		// Create action item (always individual task, no type field)
		const actionItemId = await ctx.db.insert('tasks', {
			workspaceId: args.workspaceId,
			meetingId: args.meetingId,
			agendaItemId: args.agendaItemId,
			projectId: args.projectId,
			circleId: args.circleId,
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
		actionItemId: v.id('tasks'),
		description: v.optional(v.string()),
		dueDate: v.optional(v.number()),
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

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// If projectId provided, verify project exists and belongs to workspace
		if (args.projectId !== undefined) {
			if (args.projectId) {
				const project = await ctx.db.get(args.projectId);
				if (!project) {
					throw new Error('Project not found');
				}
				if (project.workspaceId !== actionItem.workspaceId) {
					throw new Error('Project does not belong to this workspace');
				}
			}
		}

		// Build update object (only include defined fields)
		const updates: {
			description?: string;
			dueDate?: number;
			projectId?: Id<'projects'> | null;
			circleId?: Id<'circles'>;
			updatedAt: number;
		} = {
			updatedAt: Date.now()
		};

		if (args.description !== undefined) updates.description = args.description;
		if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
		if (args.projectId !== undefined) updates.projectId = args.projectId || null;
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
		actionItemId: v.id('tasks'),
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

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

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
		actionItemId: v.id('tasks'),
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

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

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
		actionItemId: v.id('tasks')
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

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Delete action item
		await ctx.db.delete(args.actionItemId);

		return { success: true };
	}
});
