import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { findPersonByUserAndWorkspace } from '../../core/people/queries';

type Ctx = QueryCtx | MutationCtx;

export async function ensureWorkspaceMembership(
	ctx: Ctx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<void> {
	const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId);
	if (!person || person.status !== 'active') {
		throw createError(ErrorCodes.WORKSPACE_ACCESS_DENIED, 'Workspace membership required');
	}
}

export async function getTaskOrThrow(ctx: Ctx, taskId: Id<'tasks'>) {
	const task = await ctx.db.get(taskId);

	if (!task) {
		throw createError(ErrorCodes.TASK_NOT_FOUND, 'Task not found');
	}

	return task;
}

export async function getMeetingForTaskOrThrow(ctx: Ctx, meetingId?: Id<'meetings'>) {
	if (!meetingId) {
		throw createError(ErrorCodes.MEETING_NOT_FOUND, 'Meeting not found');
	}

	const meeting = await ctx.db.get(meetingId);

	if (!meeting) {
		throw createError(ErrorCodes.MEETING_NOT_FOUND, 'Meeting not found');
	}

	return meeting;
}

export async function getAgendaItemOrThrow(ctx: Ctx, agendaItemId: Id<'meetingAgendaItems'>) {
	const agendaItem = await ctx.db.get(agendaItemId);

	if (!agendaItem) {
		throw createError(ErrorCodes.AGENDA_ITEM_NOT_FOUND, 'Agenda item not found');
	}

	return agendaItem;
}

export async function getProjectOrThrow(ctx: Ctx, projectId: Id<'projects'>) {
	const project = await ctx.db.get(projectId);

	if (!project) {
		throw createError(ErrorCodes.PROJECT_NOT_FOUND, 'Project not found');
	}

	return project;
}

export async function getTaskWithMeetingAccess(
	ctx: Ctx,
	taskId: Id<'tasks'>,
	userId: Id<'users'>
): Promise<{
	task: Doc<'tasks'>;
	meeting?: Doc<'meetings'>;
}> {
	const task = await getTaskOrThrow(ctx, taskId);

	if (task.meetingId) {
		const meeting = await getMeetingForTaskOrThrow(ctx, task.meetingId);
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);
		return { task, meeting };
	}

	await ensureWorkspaceMembership(ctx, task.workspaceId, userId);

	return { task };
}
