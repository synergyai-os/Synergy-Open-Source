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
import { mutation, query } from '../../_generated/server';
import type { Doc } from '../../_generated/dataModel';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import {
	getTaskWithAccess,
	listTasks,
	listTasksByAgendaItem,
	listTasksByAssignee,
	listTasksByMeeting
} from './queries';
import { updateTaskAssignee } from './assignments';
import { createTask, updateTaskDetails, updateTaskRemoval, updateTaskStatus } from './lifecycle';

const taskStatusSchema = v.union(v.literal('todo'), v.literal('in-progress'), v.literal('done'));

export const list = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		status: v.optional(taskStatusSchema)
	},
	handler: async (ctx, args): Promise<Doc<'tasks'>[]> => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const tasks = await listTasks(ctx, { ...args, userId });
		return tasks ?? [];
	}
});

export const listByMeeting = query({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args): Promise<Doc<'tasks'>[]> => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const tasks = await listTasksByMeeting(ctx, { meetingId: args.meetingId, userId });
		return tasks ?? [];
	}
});

export const listByAgendaItem = query({
	args: {
		sessionId: v.string(),
		agendaItemId: v.id('meetingAgendaItems')
	},
	handler: async (ctx, args): Promise<Doc<'tasks'>[]> => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const tasks = await listTasksByAgendaItem(ctx, { agendaItemId: args.agendaItemId, userId });
		return tasks ?? [];
	}
});

export const listByAssignee = query({
	args: {
		sessionId: v.string(),
		assigneeUserId: v.optional(v.id('users')),
		status: v.optional(taskStatusSchema)
	},
	handler: async (ctx, args): Promise<Doc<'tasks'>[]> => {
		const { userId: currentUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const tasks = await listTasksByAssignee(ctx, {
			currentUserId,
			targetUserId: args.assigneeUserId,
			status: args.status
		});
		return tasks ?? [];
	}
});

export const get = query({
	args: {
		sessionId: v.string(),
		actionItemId: v.id('tasks')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		return getTaskWithAccess(ctx, { taskId: args.actionItemId, userId });
	}
});

export const create = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		meetingId: v.optional(v.id('meetings')),
		agendaItemId: v.optional(v.id('meetingAgendaItems')),
		projectId: v.optional(v.id('projects')),
		circleId: v.optional(v.id('circles')),
		assigneeType: v.union(v.literal('user'), v.literal('role')),
		assigneeUserId: v.optional(v.id('users')),
		assigneeRoleId: v.optional(v.id('circleRoles')),
		description: v.string(),
		dueDate: v.optional(v.number()),
		status: v.optional(taskStatusSchema)
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const { actionItemId } = await createTask(ctx, { ...args, userId });
		return { actionItemId };
	}
});

export const update = mutation({
	args: {
		sessionId: v.string(),
		actionItemId: v.id('tasks'),
		description: v.optional(v.string()),
		dueDate: v.optional(v.number()),
		circleId: v.optional(v.id('circles')),
		projectId: v.optional(v.union(v.id('projects'), v.null()))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		return updateTaskDetails(ctx, { ...args, userId });
	}
});

export const updateStatus = mutation({
	args: {
		sessionId: v.string(),
		actionItemId: v.id('tasks'),
		status: taskStatusSchema
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		return updateTaskStatus(ctx, { ...args, userId });
	}
});

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
		return updateTaskAssignee(ctx, { ...args, userId });
	}
});

export const remove = mutation({
	args: {
		sessionId: v.string(),
		actionItemId: v.id('tasks')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		return updateTaskRemoval(ctx, { ...args, userId });
	}
});
