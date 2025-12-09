import type { Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import {
	ensureWorkspaceMembership,
	getAgendaItemOrThrow,
	getMeetingForTaskOrThrow,
	getTaskOrThrow
} from './access';
import type { TaskStatus } from './types';

type ListTasksArgs = {
	workspaceId: Id<'workspaces'>;
	status?: TaskStatus;
	userId: Id<'users'>;
};

export async function listTasks(ctx: QueryCtx, args: ListTasksArgs) {
	await ensureWorkspaceMembership(ctx, args.workspaceId, args.userId);

	let items = await ctx.db
		.query('tasks')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
		.collect();

	if (args.status) {
		items = items.filter((item) => item.status === args.status);
	}

	return items;
}

type ListTasksByMeetingArgs = {
	meetingId: Id<'meetings'>;
	userId: Id<'users'>;
};

export async function listTasksByMeeting(ctx: QueryCtx, args: ListTasksByMeetingArgs) {
	const meeting = await getMeetingForTaskOrThrow(ctx, args.meetingId);

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, args.userId);

	return ctx.db
		.query('tasks')
		.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
		.collect();
}

type ListTasksByAgendaArgs = {
	agendaItemId: Id<'meetingAgendaItems'>;
	userId: Id<'users'>;
};

export async function listTasksByAgendaItem(ctx: QueryCtx, args: ListTasksByAgendaArgs) {
	const agendaItem = await getAgendaItemOrThrow(ctx, args.agendaItemId);
	const meeting = await getMeetingForTaskOrThrow(ctx, agendaItem.meetingId);

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, args.userId);

	return ctx.db
		.query('tasks')
		.withIndex('by_agenda_item', (q) => q.eq('agendaItemId', args.agendaItemId))
		.collect();
}

type ListTasksByAssigneeArgs = {
	currentUserId: Id<'users'>;
	targetUserId?: Id<'users'>;
	status?: TaskStatus;
};

export async function listTasksByAssignee(ctx: QueryCtx, args: ListTasksByAssigneeArgs) {
	const assigneeUserId = getTargetUserId(args.targetUserId, args.currentUserId);

	const items = await ctx.db
		.query('tasks')
		.withIndex('by_assignee_user', (q) => q.eq('assigneeUserId', assigneeUserId))
		.collect();

	if (args.status) {
		return items.filter((item) => item.status === args.status);
	}

	return items;
}

type GetTaskWithAccessArgs = {
	taskId: Id<'tasks'>;
	userId: Id<'users'>;
};

export async function getTaskWithAccess(ctx: QueryCtx, args: GetTaskWithAccessArgs) {
	const task = await getTaskOrThrow(ctx, args.taskId);

	await ensureWorkspaceMembership(ctx, task.workspaceId, args.userId);

	return task;
}

function getTargetUserId(targetUserId: Id<'users'> | undefined, currentUserId: Id<'users'>) {
	return targetUserId ?? currentUserId;
}
