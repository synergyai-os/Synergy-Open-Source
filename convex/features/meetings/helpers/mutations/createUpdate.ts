import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { MutationCtx } from '../../../../_generated/server';
import { createError, ErrorCodes } from '../../../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../../../infrastructure/sessionValidation';
import { ensureWorkspaceMembership, requireMeeting, requireTemplate } from '../access';

type CreateArgs = {
	sessionId: string;
	workspaceId: Id<'workspaces'>;
	circleId?: Id<'circles'>;
	templateId: Id<'meetingTemplates'>;
	title: string;
	startTime: number;
	duration: number;
	visibility: 'public' | 'private';
	recurrence?: {
		frequency: 'daily' | 'weekly' | 'monthly';
		interval: number;
		daysOfWeek?: number[];
		endDate?: number;
	};
	invitations?: Array<{
		invitationType: 'user' | 'circle';
		userId?: Id<'users'>;
		circleId?: Id<'circles'>;
	}>;
};

type UpdateArgs = {
	sessionId: string;
	meetingId: Id<'meetings'>;
	title?: string;
	startTime?: number;
	duration?: number;
	visibility?: 'public' | 'private';
	templateId?: Id<'meetingTemplates'>;
	recurrence?: {
		frequency: 'daily' | 'weekly' | 'monthly';
		interval: number;
		daysOfWeek?: number[];
		endDate?: number;
	};
};

export const createMeetingArgs = {
	sessionId: v.string(),
	workspaceId: v.id('workspaces'),
	circleId: v.optional(v.id('circles')),
	templateId: v.id('meetingTemplates'),
	title: v.string(),
	startTime: v.number(),
	duration: v.number(),
	visibility: v.union(v.literal('public'), v.literal('private')),
	recurrence: v.optional(
		v.object({
			frequency: v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly')),
			interval: v.number(),
			daysOfWeek: v.optional(v.array(v.number())),
			endDate: v.optional(v.number())
		})
	),
	invitations: v.optional(
		v.array(
			v.object({
				invitationType: v.union(v.literal('user'), v.literal('circle')),
				userId: v.optional(v.id('users')),
				circleId: v.optional(v.id('circles'))
			})
		)
	)
};

export async function createMeeting(
	ctx: MutationCtx,
	args: CreateArgs
): Promise<{ meetingId: Id<'meetings'> }> {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	await ensureWorkspaceMembership(ctx, args.workspaceId, userId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	if (args.circleId) {
		const circle = await ctx.db.get(args.circleId);
		if (!circle) throw createError(ErrorCodes.GENERIC_ERROR, 'Circle not found');
		if (circle.workspaceId !== args.workspaceId) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Circle does not belong to this workspace');
		}
	}

	const template = await ctx.db.get(args.templateId);
	if (!template) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Template not found');
	}
	if (template.workspaceId !== args.workspaceId) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Template does not belong to this workspace');
	}

	const meetingId = await ctx.db.insert('meetings', {
		workspaceId: args.workspaceId,
		circleId: args.circleId,
		templateId: args.templateId,
		title: args.title,
		startTime: args.startTime,
		duration: args.duration,
		visibility: args.visibility,
		recurrence: args.recurrence,
		createdAt: Date.now(),
		createdBy: userId,
		updatedAt: Date.now()
	});

	if (args.invitations?.length) {
		for (const invitation of args.invitations) {
			if (invitation.invitationType === 'user' && !invitation.userId) {
				throw createError(
					ErrorCodes.GENERIC_ERROR,
					'userId is required when invitationType is "user"'
				);
			}
			if (invitation.invitationType === 'circle' && !invitation.circleId) {
				throw createError(
					ErrorCodes.GENERIC_ERROR,
					'circleId is required when invitationType is "circle"'
				);
			}

			if (invitation.invitationType === 'user' && invitation.userId) {
				await ensureWorkspaceMembership(ctx, args.workspaceId, invitation.userId, {
					errorCode: ErrorCodes.GENERIC_ERROR,
					message: 'Workspace membership required'
				});
			} else if (invitation.invitationType === 'circle' && invitation.circleId) {
				const circle = await ctx.db.get(invitation.circleId);
				if (!circle) throw createError(ErrorCodes.GENERIC_ERROR, 'Circle not found');
				if (circle.workspaceId !== args.workspaceId) {
					throw createError(ErrorCodes.GENERIC_ERROR, 'Circle does not belong to this workspace');
				}
			}

			await ctx.db.insert('meetingInvitations', {
				meetingId,
				invitationType: invitation.invitationType,
				userId: invitation.userId,
				circleId: invitation.circleId,
				status: 'pending',
				respondedAt: undefined,
				lastSentAt: Date.now(),
				createdAt: Date.now(),
				createdBy: userId
			});
		}
	}

	return { meetingId };
}

export const updateMeetingArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings'),
	title: v.optional(v.string()),
	startTime: v.optional(v.number()),
	duration: v.optional(v.number()),
	visibility: v.optional(v.union(v.literal('public'), v.literal('private'))),
	templateId: v.optional(v.id('meetingTemplates')),
	recurrence: v.optional(
		v.object({
			frequency: v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly')),
			interval: v.number(),
			daysOfWeek: v.optional(v.array(v.number())),
			endDate: v.optional(v.number())
		})
	)
};

export async function updateMeeting(
	ctx: MutationCtx,
	args: UpdateArgs
): Promise<{ success: true }> {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.GENERIC_ERROR);

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	const updates: Partial<{
		title: string;
		startTime: number;
		duration: number;
		visibility: 'public' | 'private';
		templateId: Id<'meetingTemplates'>;
		recurrence:
			| {
					frequency: 'daily' | 'weekly' | 'monthly';
					interval: number;
					daysOfWeek?: number[];
					endDate?: number;
			  }
			| undefined;
		updatedAt: number;
	}> = { updatedAt: Date.now() };

	if (args.title !== undefined) updates.title = args.title;
	if (args.startTime !== undefined) updates.startTime = args.startTime;
	if (args.duration !== undefined) updates.duration = args.duration;
	if (args.visibility !== undefined) updates.visibility = args.visibility;
	if (args.templateId !== undefined) {
		const template = await requireTemplate(ctx, args.templateId, ErrorCodes.GENERIC_ERROR);
		if (template.workspaceId !== meeting.workspaceId) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Template does not belong to this workspace');
		}
		updates.templateId = args.templateId;
	}
	if (args.recurrence !== undefined) updates.recurrence = args.recurrence;

	await ctx.db.patch(args.meetingId, updates);
	return { success: true };
}
