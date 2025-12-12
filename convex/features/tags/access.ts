import { validateSessionAndGetUserId as validateSession } from '../../infrastructure/sessionValidation';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { getPersonByUserAndWorkspace, listWorkspacesForUser } from '../../core/people/queries';
import { requireActivePerson } from '../../core/people/rules';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';

type WorkspaceId = Id<'workspaces'>;
type CircleId = Id<'circles'>;
type AnyCtx = MutationCtx | QueryCtx;

export type ActorContext = {
	personId: Id<'people'>;
	workspaceId: WorkspaceId;
	user: Id<'users'>;
};

async function resolveWorkspace(ctx: AnyCtx, user: Id<'users'>, workspaceId?: WorkspaceId) {
	if (workspaceId) return workspaceId;

	const workspaces = await listWorkspacesForUser(ctx, user);
	if (workspaces.length === 0) {
		throw createError(
			ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED,
			'Workspace membership required for tags'
		);
	}
	return workspaces[0];
}

export async function getActorFromSession(
	ctx: AnyCtx,
	sessionId: string,
	workspaceId?: WorkspaceId
): Promise<ActorContext> {
	const sessionResult = await validateSession(ctx, sessionId);
	const actorUser = sessionResult.session.convexUserId;
	const resolvedWorkspaceId = await resolveWorkspace(ctx, actorUser, workspaceId);
	const person = await getPersonByUserAndWorkspace(ctx, actorUser, resolvedWorkspaceId);
	const activePerson = await requireActivePerson(ctx, person._id);

	return {
		personId: activePerson._id,
		workspaceId: resolvedWorkspaceId,
		user: actorUser
	};
}

export async function ensureWorkspaceMembership(
	ctx: AnyCtx,
	workspaceId: WorkspaceId,
	personId: Id<'people'>
): Promise<void> {
	const person = await requireActivePerson(ctx, personId);
	if (person.workspaceId !== workspaceId) {
		throw createError(
			ErrorCodes.WORKSPACE_ACCESS_DENIED,
			'You do not have access to this workspace'
		);
	}
}

export async function ensureCircleMembership(
	ctx: AnyCtx,
	circleId: CircleId,
	personId: Id<'people'>
): Promise<void> {
	const membership = await ctx.db
		.query('circleMembers')
		.withIndex('by_circle_person', (q) => q.eq('circleId', circleId).eq('personId', personId))
		.first();

	if (!membership) {
		throw createError(ErrorCodes.AUTHZ_NOT_CIRCLE_MEMBER, 'You do not have access to this circle');
	}
}

export async function ensureTagAccess(
	ctx: AnyCtx,
	actor: ActorContext,
	tag: Doc<'tags'>
): Promise<void> {
	if (tag.personId === actor.personId) return;

	if (tag.ownershipType === 'workspace' && tag.workspaceId === actor.workspaceId) {
		return;
	}

	if (tag.ownershipType === 'circle' && tag.circleId) {
		await ensureCircleMembership(ctx, tag.circleId, actor.personId);
		return;
	}

	throw createError(ErrorCodes.TAG_ACCESS_DENIED, 'You do not have access to this tag');
}

export async function listCircleIdsForPerson(ctx: AnyCtx, personId: Id<'people'>) {
	const memberships = await ctx.db
		.query('circleMembers')
		.withIndex('by_person', (q) => q.eq('personId', personId))
		.collect();

	return memberships
		.filter((membership) => !membership.archivedAt)
		.map((membership) => membership.circleId);
}
