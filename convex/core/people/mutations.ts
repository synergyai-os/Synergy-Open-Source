import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { findPersonByEmailAndWorkspace, getNormalizedEmail } from './queries';
import { canArchivePerson, canInvitePeople, requireActivePerson, requirePerson } from './rules';

type PersonDoc = Doc<'people'>;

type InviteArgs = {
	workspaceId: Id<'workspaces'>;
	email: string;
	workspaceRole: PersonDoc['workspaceRole'];
	invitedByPersonId?: Id<'people'> | null;
	displayName?: string | null;
	userId?: Id<'users'> | null;
};

type AcceptInviteArgs = {
	personId: Id<'people'>;
	userId: Id<'users'>;
};

type ArchivePersonArgs = {
	personId: Id<'people'>;
	archivedByPersonId: Id<'people'>;
};

type UpdatePersonArgs = {
	personId: Id<'people'>;
	displayName?: string | null;
	workspaceRole?: PersonDoc['workspaceRole'];
	updatedByPersonId?: Id<'people'>;
};

type LinkPersonArgs = {
	personId: Id<'people'>;
	userId: Id<'users'>;
};

export async function invitePerson(ctx: MutationCtx, args: InviteArgs): Promise<Id<'people'>> {
	const normalizedEmail = getNormalizedEmail(args.email);

	const workspace = await ctx.db.get(args.workspaceId);
	if (!workspace) {
		throw createError(ErrorCodes.WORKSPACE_NOT_FOUND, 'Workspace not found');
	}

	if (args.invitedByPersonId) {
		const canInvite = await canInvitePeople(ctx, args.invitedByPersonId);
		if (!canInvite) {
			throw createError(ErrorCodes.WORKSPACE_ACCESS_DENIED, 'You cannot invite people');
		}
		const inviter = await requireActivePerson(ctx, args.invitedByPersonId);
		if (inviter.workspaceId !== args.workspaceId) {
			throw createError(ErrorCodes.WORKSPACE_ACCESS_DENIED, 'Inviter must be in workspace');
		}
	}

	const existingByEmail = await findPersonByEmailAndWorkspace(
		ctx,
		args.workspaceId,
		normalizedEmail
	);
	if (existingByEmail) {
		if (existingByEmail.status === 'archived') {
			if (existingByEmail.userId && args.userId && existingByEmail.userId !== args.userId) {
				throw createError(
					ErrorCodes.INVITE_USER_MISMATCH,
					'Archived person is linked to a different user'
				);
			}

			await ctx.db.patch(existingByEmail._id, {
				status: 'invited',
				invitedAt: Date.now(),
				invitedBy: args.invitedByPersonId ?? undefined,
				joinedAt: undefined,
				archivedAt: undefined,
				archivedBy: undefined,
				workspaceRole: args.workspaceRole,
				displayName: args.displayName ?? existingByEmail.displayName,
				userId: args.userId ?? existingByEmail.userId
			});
			return existingByEmail._id;
		}

		throw createError(
			ErrorCodes.INVITE_ALREADY_EXISTS,
			'An invite or person with this email already exists in the workspace'
		);
	}

	if (args.userId) {
		const existingByUser = await ctx.db
			.query('people')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', args.userId)
			)
			.first();

		if (existingByUser && existingByUser.status !== 'archived') {
			throw createError(
				ErrorCodes.WORKSPACE_ALREADY_MEMBER,
				'User is already a member of this workspace'
			);
		}
	}

	return ctx.db.insert('people', {
		workspaceId: args.workspaceId,
		userId: args.userId ?? undefined,
		email: normalizedEmail,
		displayName: args.displayName ?? undefined,
		workspaceRole: args.workspaceRole,
		status: 'invited',
		invitedAt: Date.now(),
		invitedBy: args.invitedByPersonId ?? undefined,
		joinedAt: undefined,
		archivedAt: undefined,
		archivedBy: undefined
	});
}

export async function acceptInvite(ctx: MutationCtx, args: AcceptInviteArgs): Promise<PersonDoc> {
	const person = await requirePerson(ctx, args.personId);

	if (person.status === 'archived') {
		throw createError(ErrorCodes.INVITE_REVOKED, 'Invite has been archived');
	}

	if (person.userId && person.userId !== args.userId) {
		throw createError(ErrorCodes.INVITE_USER_MISMATCH, 'Invite belongs to a different user');
	}

	if (person.status === 'active' && person.userId === args.userId) {
		return person;
	}

	await ctx.db.patch(person._id, {
		userId: args.userId,
		email: undefined,
		status: 'active',
		joinedAt: Date.now(),
		archivedAt: undefined,
		archivedBy: undefined
	});

	return (await ctx.db.get(person._id)) as PersonDoc;
}

export async function archivePerson(
	ctx: MutationCtx,
	args: ArchivePersonArgs
): Promise<{ archived: boolean }> {
	const target = await requirePerson(ctx, args.personId);
	const actor = await requireActivePerson(ctx, args.archivedByPersonId);

	if (actor.workspaceId !== target.workspaceId) {
		throw createError(ErrorCodes.WORKSPACE_ACCESS_DENIED, 'Cannot archive across workspaces');
	}

	const allowed = await canArchivePerson(ctx, args.archivedByPersonId, args.personId);
	if (!allowed) {
		if (target.workspaceRole === 'owner') {
			throw createError(ErrorCodes.WORKSPACE_LAST_OWNER, 'Cannot archive the last owner');
		}
		throw createError(ErrorCodes.WORKSPACE_ACCESS_DENIED, 'You cannot archive this person');
	}

	await ctx.db.patch(target._id, {
		status: 'archived',
		archivedAt: Date.now(),
		archivedBy: actor._id
	});

	return { archived: true };
}

export async function updatePerson(ctx: MutationCtx, args: UpdatePersonArgs): Promise<PersonDoc> {
	const person = await requirePerson(ctx, args.personId);
	const updatedFields: Partial<Omit<PersonDoc, '_id' | '_creationTime'>> = {};

	if (args.displayName !== undefined) {
		updatedFields.displayName = args.displayName ?? undefined;
	}

	if (args.workspaceRole && args.workspaceRole !== person.workspaceRole) {
		if (!args.updatedByPersonId) {
			throw createError(
				ErrorCodes.WORKSPACE_ACCESS_DENIED,
				'updatedByPersonId is required to change workspaceRole'
			);
		}

		const canUpdateRole = await isRoleChangeAllowed(
			ctx,
			args.updatedByPersonId,
			person,
			args.workspaceRole
		);
		if (!canUpdateRole) {
			throw createError(ErrorCodes.WORKSPACE_ACCESS_DENIED, 'Insufficient permissions');
		}

		updatedFields.workspaceRole = args.workspaceRole;
	}

	if (Object.keys(updatedFields).length === 0) {
		return person;
	}

	await ctx.db.patch(person._id, updatedFields);
	return (await ctx.db.get(person._id)) as PersonDoc;
}

export async function linkPersonToUser(ctx: MutationCtx, args: LinkPersonArgs): Promise<PersonDoc> {
	const person = await requirePerson(ctx, args.personId);

	if (person.userId && person.userId !== args.userId) {
		throw createError(ErrorCodes.INVITE_USER_MISMATCH, 'Person already linked to another user');
	}

	const nextStatus = person.status === 'archived' ? 'archived' : 'active';
	await ctx.db.patch(person._id, {
		userId: args.userId,
		email: undefined,
		status: nextStatus,
		joinedAt: person.joinedAt ?? Date.now()
	});

	return (await ctx.db.get(person._id)) as PersonDoc;
}

async function isRoleChangeAllowed(
	ctx: MutationCtx,
	updatedByPersonId: Id<'people'>,
	person: PersonDoc,
	nextRole: PersonDoc['workspaceRole']
): Promise<boolean> {
	const actor = await requireActivePerson(ctx, updatedByPersonId);
	if (actor.workspaceId !== person.workspaceId) return false;

	const actorIsOwner = actor.workspaceRole === 'owner';
	const actorIsAdmin = actor.workspaceRole === 'admin' || actorIsOwner;
	if (!actorIsAdmin) return false;

	// Prevent removing the last owner
	if (person.workspaceRole === 'owner' && nextRole !== 'owner') {
		const ownerCount = await getActiveOwnerCount(ctx, person.workspaceId);
		if (ownerCount <= 1) {
			return false;
		}
	}

	return true;
}

async function getActiveOwnerCount(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>
): Promise<number> {
	const activePeople = await ctx.db
		.query('people')
		.withIndex('by_workspace_status', (q) =>
			q.eq('workspaceId', workspaceId).eq('status', 'active')
		)
		.collect();

	return activePeople.filter((p) => p.workspaceRole === 'owner').length;
}
