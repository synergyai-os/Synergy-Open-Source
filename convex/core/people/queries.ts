import type { Doc, Id } from '../../_generated/dataModel';
import { query } from '../../_generated/server';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { USER_ID_FIELD } from './constants';
import { getPersonEmail, requireActivePerson, requirePerson } from './rules';

type AnyCtx = QueryCtx | MutationCtx;
type PersonDoc = Doc<'people'>;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function getPersonById(ctx: AnyCtx, personId: Id<'people'>): Promise<PersonDoc> {
	return requirePerson(ctx, personId);
}

export async function getMyPerson(
	ctx: AnyCtx,
	sessionId: string,
	workspaceId: Id<'workspaces'>
): Promise<PersonDoc> {
	const { userId } = await validateSessionAndGetUserId(ctx, sessionId);
	return getPersonByUserAndWorkspace(ctx, userId, workspaceId);
}

export async function getPersonForSessionAndWorkspace(
	ctx: AnyCtx,
	sessionId: string,
	workspaceId?: Id<'workspaces'> | null
): Promise<{ person: PersonDoc; workspaceId: Id<'workspaces'>; linkedUser: Id<'users'> }> {
	const { userId } = await validateSessionAndGetUserId(ctx, sessionId);
	const resolvedWorkspaceId = await resolveWorkspace(ctx, userId, workspaceId);
	const person = await getPersonByUserAndWorkspace(ctx, userId, resolvedWorkspaceId);
	const activePerson = await requireActivePerson(ctx, person._id);
	const linkedUser = activePerson[USER_ID_FIELD];
	if (!linkedUser) {
		throw createError(ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED, 'Person is missing linked user');
	}
	return { person: activePerson, workspaceId: resolvedWorkspaceId, linkedUser };
}

async function resolveWorkspace(
	ctx: AnyCtx,
	userId: Id<'users'>,
	workspaceId?: Id<'workspaces'> | null
): Promise<Id<'workspaces'>> {
	if (workspaceId) return workspaceId;

	const workspaceIds = await listWorkspacesForUser(ctx, userId);
	if (workspaceIds.length === 0) {
		throw createError(
			ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED,
			'Workspace membership required for person context'
		);
	}

	return workspaceIds[0];
}

export async function getPersonByUserAndWorkspace(
	ctx: AnyCtx,
	userId: Id<'users'>,
	workspaceId: Id<'workspaces'>
): Promise<PersonDoc> {
	const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId);
	if (!person) {
		throw createError(
			ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED,
			'User is not a member of this workspace'
		);
	}
	return person;
}

export async function getPersonByEmailAndWorkspace(
	ctx: AnyCtx,
	workspaceId: Id<'workspaces'>,
	email: string
): Promise<PersonDoc> {
	const person = await findPersonByEmailAndWorkspace(ctx, workspaceId, email);
	if (!person) {
		throw createError(ErrorCodes.PERSON_NOT_FOUND, 'Person not found for workspace and email');
	}
	return person;
}

export async function listPeopleInWorkspace(
	ctx: AnyCtx,
	workspaceId: Id<'workspaces'>,
	options?: { status?: PersonDoc['status'] }
): Promise<PersonDoc[]> {
	if (options?.status) {
		return ctx.db
			.query('people')
			.withIndex('by_workspace_status', (q) =>
				q.eq('workspaceId', workspaceId).eq('status', options.status)
			)
			.collect();
	}

	return ctx.db
		.query('people')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();
}

export async function listWorkspacesForUser(
	ctx: AnyCtx,
	userId: Id<'users'>
): Promise<Id<'workspaces'>[]> {
	const people = await ctx.db
		.query('people')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();

	// Exclude archived records; dedupe workspaceIds
	const activeWorkspaceIds = new Set(
		people.filter((person) => person.status !== 'archived').map((person) => person.workspaceId)
	);

	return Array.from(activeWorkspaceIds);
}

export async function findPersonByUserAndWorkspace(
	ctx: AnyCtx,
	userId: Id<'users'>,
	workspaceId: Id<'workspaces'>
): Promise<PersonDoc | null> {
	return ctx.db
		.query('people')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();
}

export async function findPersonByEmailAndWorkspace(
	ctx: AnyCtx,
	workspaceId: Id<'workspaces'>,
	email: string
): Promise<PersonDoc | null> {
	const normalized = normalizeEmail(email);
	return ctx.db
		.query('people')
		.withIndex('by_workspace_email', (q) =>
			q.eq('workspaceId', workspaceId).eq('email', normalized)
		)
		.first();
}

export function getNormalizedEmail(email: string): string {
	return normalizeEmail(email);
}

export const getPersonForWorkspace = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const person = await getMyPerson(ctx, args.sessionId, args.workspaceId);
		return {
			personId: person._id,
			workspaceId: person.workspaceId,
			status: person.status,
			displayName: person.displayName,
			email: await getPersonEmail(ctx, person)
		};
	}
});
