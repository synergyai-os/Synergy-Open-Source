import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { MutationCtx } from '../../../../_generated/server';
import { createError, ErrorCodes } from '../../../../infrastructure/errors/codes';
import {
	ensureWorkspaceMembership,
	requireMeeting,
	requireWorkspacePersonFromSession
} from '../access';

type CancelArgs = { sessionId: string; meetingId: Id<'meetings'> };
type RestoreArgs = { sessionId: string; meetingId: Id<'meetings'> };

export const updateMeetingCancelArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings')
};

export async function updateMeetingCancel(
	ctx: MutationCtx,
	args: CancelArgs
): Promise<{ success: true }> {
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.MEETING_NOT_FOUND);
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
		throw createError(ErrorCodes.GENERIC_ERROR, 'Cannot cancel a meeting that has started');
	}

	if (meeting.canceledAt) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Meeting already canceled');
	}

	const now = Date.now();

	await ctx.db.patch(args.meetingId, {
		canceledAt: now,
		updatedAt: now
	});

	return { success: true };
}

export const restoreMeetingArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings')
};

export async function restoreMeeting(
	ctx: MutationCtx,
	args: RestoreArgs
): Promise<{ success: true }> {
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.MEETING_NOT_FOUND);
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

	const now = Date.now();

	await ctx.db.patch(args.meetingId, {
		canceledAt: undefined,
		deletedAt: undefined,
		updatedAt: now
	});

	return { success: true };
}
