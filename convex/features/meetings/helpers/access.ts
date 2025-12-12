import type { Id } from '../../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../../_generated/server';
import { createError, ErrorCodes } from '../../../infrastructure/errors/codes';
import { calculateAuthority, getAuthorityContextFromAssignments } from '../../../core/authority';
import { getPersonById, getPersonForSessionAndWorkspace } from '../../../core/people/queries';
import { requireActivePerson } from '../../../core/people/rules';

type Ctx = QueryCtx | MutationCtx;
type WorkspaceAccessOverrides = { errorCode?: ErrorCodes; message?: string };

export async function ensureWorkspaceMembership(
	ctx: Ctx,
	workspaceId: Id<'workspaces'>,
	personId: Id<'people'>,
	{
		errorCode = ErrorCodes.WORKSPACE_ACCESS_DENIED,
		message = 'Workspace membership required'
	}: WorkspaceAccessOverrides = {}
): Promise<void> {
	const person = await requireActivePerson(ctx, personId);
	if (person.workspaceId !== workspaceId) {
		throw createError(errorCode, message);
	}
}

export async function requireWorkspacePersonFromSession(
	ctx: Ctx,
	sessionId: string,
	workspaceId: Id<'workspaces'>,
	overrides?: WorkspaceAccessOverrides
): Promise<{ personId: Id<'people'> }> {
	const { person } = await getPersonForSessionAndWorkspace(ctx, sessionId, workspaceId);
	await ensureWorkspaceMembership(ctx, workspaceId, person._id, overrides);
	return { personId: person._id };
}

export async function requirePersonById(
	ctx: Ctx,
	personId: Id<'people'>,
	workspaceId?: Id<'workspaces'>,
	overrides?: WorkspaceAccessOverrides
): Promise<{ personId: Id<'people'> }> {
	const person = await getPersonById(ctx, personId);
	if (workspaceId) {
		await ensureWorkspaceMembership(ctx, workspaceId, personId, overrides);
	}
	return { personId: person._id };
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

export async function getMeetingAuthority(
	ctx: Ctx,
	meeting: { circleId?: Id<'circles'> },
	personId: Id<'people'>
) {
	if (!meeting.circleId) return null;

	const authorityCtx = await getAuthorityContextFromAssignments(ctx, {
		personId,
		circleId: meeting.circleId
	});
	return calculateAuthority(authorityCtx);
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
