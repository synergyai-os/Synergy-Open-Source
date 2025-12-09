import type { Id } from '../../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../../_generated/server';
import { createError, ErrorCodes } from '../../../infrastructure/errors/codes';

type Ctx = QueryCtx | MutationCtx;

export async function ensureWorkspaceMembership(
	ctx: Ctx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>,
	{
		errorCode = ErrorCodes.WORKSPACE_ACCESS_DENIED,
		message = 'Workspace membership required'
	}: { errorCode?: ErrorCodes; message?: string } = {}
): Promise<void> {
	const membership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();

	if (!membership) {
		throw createError(errorCode, message);
	}
}

export async function requireMeeting(
	ctx: Ctx,
	meetingId: Id<'meetings'>,
	errorCode: ErrorCodes = ErrorCodes.GENERIC_ERROR
) {
	const meeting = await ctx.db.get(meetingId);
	if (!meeting) {
		throw createError(errorCode, 'Meeting not found');
	}
	return meeting;
}

export async function requireTemplate(
	ctx: Ctx,
	templateId: Id<'meetingTemplates'>,
	errorCode: ErrorCodes = ErrorCodes.TEMPLATE_NOT_FOUND
) {
	const template = await ctx.db.get(templateId);
	if (!template) {
		throw createError(errorCode, 'Template not found');
	}
	return template;
}

export async function requireCircle(
	ctx: Ctx,
	circleId: Id<'circles'>,
	errorCode: ErrorCodes = ErrorCodes.GENERIC_ERROR
) {
	const circle = await ctx.db.get(circleId);
	if (!circle) {
		throw createError(errorCode, 'Circle not found');
	}
	return circle;
}
