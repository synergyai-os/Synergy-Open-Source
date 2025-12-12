import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { MutationCtx } from '../../../../_generated/server';
import { createError, ErrorCodes } from '../../../../infrastructure/errors/codes';
import {
	ensureWorkspaceMembership,
	requireMeeting,
	requireWorkspacePersonFromSession
} from '../access';

type StartMeetingArgs = { sessionId: string; meetingId: Id<'meetings'> };
type AdvanceStepArgs = { sessionId: string; meetingId: Id<'meetings'>; newStep: string };
type CloseMeetingArgs = { sessionId: string; meetingId: Id<'meetings'> };
type SetRecorderArgs = {
	sessionId: string;
	meetingId: Id<'meetings'>;
	recorderPersonId: Id<'people'>;
};
type SetActiveAgendaItemArgs = {
	sessionId: string;
	meetingId: Id<'meetings'>;
	agendaItemId?: Id<'meetingAgendaItems'>;
};

export const startMeetingArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings')
};

export async function startMeetingSession(
	ctx: MutationCtx,
	args: StartMeetingArgs
): Promise<{ success: true }> {
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.GENERIC_ERROR);
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId,
		{
			errorCode: ErrorCodes.GENERIC_ERROR,
			message: 'Workspace membership required'
		}
	);

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, personId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	if (meeting.startedAt) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Meeting already started');
	}

	await ctx.db.patch(args.meetingId, {
		startedAt: Date.now(),
		currentStep: 'check-in',
		recorderPersonId: personId,
		updatedAt: Date.now()
	});

	return { success: true };
}

export const advanceMeetingArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings'),
	newStep: v.string()
};

export async function advanceMeetingStep(
	ctx: MutationCtx,
	args: AdvanceStepArgs
): Promise<{ success: true }> {
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.GENERIC_ERROR);
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId,
		{
			errorCode: ErrorCodes.GENERIC_ERROR,
			message: 'Workspace membership required'
		}
	);

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, personId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	if (meeting.recorderPersonId !== personId) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Only the recorder can advance steps');
	}

	const validSteps = ['check-in', 'agenda', 'closing'];
	if (!validSteps.includes(args.newStep)) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Invalid step');
	}

	await ctx.db.patch(args.meetingId, {
		currentStep: args.newStep,
		updatedAt: Date.now()
	});

	return { success: true };
}

export const closeMeetingArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings')
};

export async function closeMeetingSession(
	ctx: MutationCtx,
	args: CloseMeetingArgs
): Promise<{ success: true }> {
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.GENERIC_ERROR);
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId,
		{
			errorCode: ErrorCodes.GENERIC_ERROR,
			message: 'Workspace membership required'
		}
	);

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, personId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	if (meeting.recorderPersonId !== personId) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Only the recorder can close the meeting');
	}

	await ctx.db.patch(args.meetingId, {
		closedAt: Date.now(),
		updatedAt: Date.now()
	});

	return { success: true };
}

export const setRecorderArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings'),
	recorderPersonId: v.id('people')
};

export async function setMeetingRecorder(
	ctx: MutationCtx,
	args: SetRecorderArgs
): Promise<{ success: true }> {
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.GENERIC_ERROR);
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId,
		{
			errorCode: ErrorCodes.GENERIC_ERROR,
			message: 'Workspace membership required'
		}
	);

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, personId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	if (!meeting.startedAt) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Meeting must be started before setting recorder');
	}

	const recorderAttendee = await ctx.db
		.query('meetingAttendees')
		.withIndex('by_meeting_person', (q) =>
			q.eq('meetingId', args.meetingId).eq('personId', args.recorderPersonId)
		)
		.first();

	if (!recorderAttendee) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Recorder must be an attendee of the meeting');
	}

	await ctx.db.patch(args.meetingId, {
		recorderPersonId: args.recorderPersonId,
		updatedAt: Date.now()
	});

	return { success: true };
}

export const setActiveAgendaItemArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings'),
	agendaItemId: v.optional(v.id('meetingAgendaItems'))
};

export async function setActiveAgendaItemMutation(
	ctx: MutationCtx,
	args: SetActiveAgendaItemArgs
): Promise<{ success: true }> {
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.GENERIC_ERROR);
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId,
		{
			errorCode: ErrorCodes.GENERIC_ERROR,
			message: 'Workspace membership required'
		}
	);

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, personId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	if (meeting.recorderPersonId !== personId) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Only the recorder can set the active agenda item');
	}

	if (!meeting.startedAt) {
		throw createError(
			ErrorCodes.GENERIC_ERROR,
			'Meeting must be started before setting active agenda item'
		);
	}

	if (args.agendaItemId) {
		const agendaItem = await ctx.db.get(args.agendaItemId);
		if (!agendaItem || agendaItem.meetingId !== args.meetingId) {
			throw createError(
				ErrorCodes.GENERIC_ERROR,
				'Agenda item not found or does not belong to this meeting'
			);
		}
	}

	await ctx.db.patch(args.meetingId, {
		activeAgendaItemId: args.agendaItemId,
		updatedAt: Date.now()
	});

	return { success: true };
}
