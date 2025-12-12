import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

type AnyCtx = QueryCtx | MutationCtx;
type PersonDoc = Doc<'people'>;

export async function requirePerson(ctx: AnyCtx, personId: Id<'people'>): Promise<PersonDoc> {
	const person = await ctx.db.get(personId);
	if (!person) {
		throw createError(ErrorCodes.PERSON_NOT_FOUND, 'Person not found');
	}
	return person;
}

export async function requireActivePerson(ctx: AnyCtx, personId: Id<'people'>): Promise<PersonDoc> {
	const person = await requirePerson(ctx, personId);
	if (!isPersonActive(person)) {
		throw createError(ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED, 'Person is not active');
	}
	return person;
}

export function isPersonActive(person: PersonDoc): boolean {
	return person.status === 'active';
}

export function isPersonInvited(person: PersonDoc): boolean {
	return person.status === 'invited';
}

export function canPersonBeArchived(person: PersonDoc): boolean {
	return person.status !== 'archived';
}

export async function isWorkspaceOwner(ctx: AnyCtx, personId: Id<'people'>): Promise<boolean> {
	const person = await requireActivePerson(ctx, personId);
	return person.workspaceRole === 'owner';
}

export async function isWorkspaceAdmin(ctx: AnyCtx, personId: Id<'people'>): Promise<boolean> {
	const person = await requireActivePerson(ctx, personId);
	return person.workspaceRole === 'owner' || person.workspaceRole === 'admin';
}

export async function canInvitePeople(ctx: AnyCtx, personId: Id<'people'>): Promise<boolean> {
	return isWorkspaceAdmin(ctx, personId);
}

/**
 * Returns the canonical email for a person.
 * - If linked to a user, source comes from users.email.
 * - Otherwise falls back to people.email (invite state).
 */
export async function getPersonEmail(ctx: QueryCtx, person: Doc<'people'>): Promise<string | null> {
	if (person.userId) {
		const user = await ctx.db.get(person.userId);
		return user?.email ?? null;
	}
	return person.email ?? null;
}

export async function canArchivePerson(
	ctx: AnyCtx,
	actorPersonId: Id<'people'>,
	targetPersonId: Id<'people'>
): Promise<boolean> {
	const actor = await requireActivePerson(ctx, actorPersonId);
	const target = await requirePerson(ctx, targetPersonId);

	if (target.status === 'archived') return false;
	if (actor.workspaceId !== target.workspaceId) return false;

	// Owners/admins can archive active/invited people; only owners can archive owners.
	const actorIsOwner = actor.workspaceRole === 'owner';
	const actorIsAdmin = actor.workspaceRole === 'admin' || actorIsOwner;

	if (!actorIsAdmin) return false;

	if (target.workspaceRole !== 'owner') {
		return true;
	}

	if (!actorIsOwner) return false;

	const ownerCount = await countActiveOwners(ctx, target.workspaceId);
	return ownerCount > 1;
}

async function countActiveOwners(ctx: AnyCtx, workspaceId: Id<'workspaces'>): Promise<number> {
	const owners = await ctx.db
		.query('people')
		.withIndex('by_workspace_status', (q) =>
			q.eq('workspaceId', workspaceId).eq('status', 'active')
		)
		.collect();

	return owners.filter((person) => person.workspaceRole === 'owner').length;
}
