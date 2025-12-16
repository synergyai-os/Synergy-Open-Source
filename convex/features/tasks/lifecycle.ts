import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { getPersonByUserAndWorkspace } from '../../core/people/queries';
import {
	ensureWorkspaceMembership,
	getAgendaItemOrThrow,
	getMeetingForTaskOrThrow,
	getProjectOrThrow,
	getTaskWithMeetingAccess
} from './access';
import type { TaskAssigneeType, TaskStatus } from './types';

export type CreateTaskArgs = {
	workspaceId: Id<'workspaces'>;
	meetingId?: Id<'meetings'>;
	agendaItemId?: Id<'meetingAgendaItems'>;
	projectId?: Id<'projects'>;
	circleId?: Id<'circles'>;
	assigneeType: TaskAssigneeType;
	assigneeUserId?: Id<'users'>;
	assigneeRoleId?: Id<'circleRoles'>;
	description: string;
	dueDate?: number;
	status?: TaskStatus;
	userId: Id<'users'>;
};

export async function createTask(
	ctx: MutationCtx,
	args: CreateTaskArgs
): Promise<{
	actionItemId: Id<'tasks'>;
}> {
	ensureValidAssignee(args.assigneeType, args.assigneeUserId, args.assigneeRoleId);

	await ensureWorkspaceMembership(ctx, args.workspaceId, args.userId);

	const meeting = args.meetingId ? await getMeetingForTaskOrThrow(ctx, args.meetingId) : null;

	if (meeting && meeting.workspaceId !== args.workspaceId) {
		throw createError(
			ErrorCodes.WORKSPACE_ACCESS_DENIED,
			'Meeting does not belong to this workspace'
		);
	}

	if (args.agendaItemId) {
		const agendaItem = await getAgendaItemOrThrow(ctx, args.agendaItemId);
		ensureAgendaItemBelongsToMeeting(agendaItem.meetingId, args.meetingId);
	}

	if (args.projectId) {
		const project = await getProjectOrThrow(ctx, args.projectId);
		ensureProjectBelongsToWorkspace(project.workspaceId, args.workspaceId);
	}

	// Convert userId to personId for audit field (XDOM-01/XDOM-02 compliance)
	const person = await getPersonByUserAndWorkspace(ctx, args.userId, args.workspaceId);
	const createdByPersonId = person._id;

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
		createdByPersonId
	});

	return { actionItemId };
}

export type UpdateTaskArgs = {
	actionItemId: Id<'tasks'>;
	description?: string;
	dueDate?: number;
	projectId?: Id<'projects'> | null;
	circleId?: Id<'circles'>;
	userId: Id<'users'>;
};

export async function updateTaskDetails(ctx: MutationCtx, args: UpdateTaskArgs) {
	const { task } = await getTaskWithMeetingAccess(ctx, args.actionItemId, args.userId);

	if (args.projectId !== undefined && args.projectId) {
		const project = await getProjectOrThrow(ctx, args.projectId);
		ensureProjectBelongsToWorkspace(project.workspaceId, task.workspaceId);
	}

	const updates = createTaskUpdatePayload(args);

	await ctx.db.patch(args.actionItemId, updates);

	return { success: true };
}

export type UpdateStatusArgs = {
	actionItemId: Id<'tasks'>;
	status: TaskStatus;
	userId: Id<'users'>;
};

export async function updateTaskStatus(ctx: MutationCtx, args: UpdateStatusArgs) {
	await getTaskWithMeetingAccess(ctx, args.actionItemId, args.userId);

	await ctx.db.patch(args.actionItemId, {
		status: args.status,
		updatedAt: Date.now()
	});

	return { success: true };
}

export type RemoveTaskArgs = {
	actionItemId: Id<'tasks'>;
	userId: Id<'users'>;
};

export async function updateTaskRemoval(ctx: MutationCtx, args: RemoveTaskArgs) {
	await getTaskWithMeetingAccess(ctx, args.actionItemId, args.userId);

	await ctx.db.delete(args.actionItemId);

	return { success: true };
}

export function ensureValidAssignee(
	assigneeType: TaskAssigneeType,
	assigneeUserId?: Id<'users'>,
	assigneeRoleId?: Id<'circleRoles'>
) {
	if (assigneeType === 'user' && !assigneeUserId) {
		throw createError(
			ErrorCodes.VALIDATION_REQUIRED_FIELD,
			'assigneeUserId is required when assigneeType is user'
		);
	}

	if (assigneeType === 'role' && !assigneeRoleId) {
		throw createError(
			ErrorCodes.VALIDATION_REQUIRED_FIELD,
			'assigneeRoleId is required when assigneeType is role'
		);
	}
}

function ensureAgendaItemBelongsToMeeting(
	agendaItemMeetingId: Id<'meetings'>,
	meetingId?: Id<'meetings'>
) {
	if (!meetingId || agendaItemMeetingId !== meetingId) {
		throw createError(ErrorCodes.AGENDA_ITEM_NOT_FOUND, 'Agenda item not found');
	}
}

function ensureProjectBelongsToWorkspace(
	projectWorkspaceId: Id<'workspaces'>,
	workspaceId: Id<'workspaces'>
) {
	if (projectWorkspaceId !== workspaceId) {
		throw createError(
			ErrorCodes.WORKSPACE_ACCESS_DENIED,
			'Project does not belong to this workspace'
		);
	}
}

function createTaskUpdatePayload(args: UpdateTaskArgs) {
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

	return updates;
}
