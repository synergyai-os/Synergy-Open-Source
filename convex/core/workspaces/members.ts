import { internalMutation, mutation, query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import {
	getWorkspaceOwnerCount,
	requireWorkspaceAdminOrOwner,
	requireWorkspaceMembership
} from './access';
// SYOS-855: User helpers merged into lifecycle.ts
import { findUserEmailField, findUserNameField } from './lifecycle';
import { findPersonByUserAndWorkspace, listPeopleInWorkspace } from '../people/queries';
import { archivePerson } from '../people/mutations';

export const removeOrganizationMember = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		memberUserId: v.id('users')
	},
	handler: async (ctx, args) => {
		const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		return removeMember(ctx, { ...args, actingUserId });
	}
});

type WorkspaceMemberSummary = {
	userId: Id<'users'>;
	personId?: Id<'people'>;
	email: string;
	name: string;
	role: 'owner' | 'admin' | 'member';
	joinedAt: number;
};

export const listMembers = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args): Promise<WorkspaceMemberSummary[]> => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		await requireWorkspaceMembership(ctx, args.workspaceId, userId);
		const members = await listMembersForWorkspace(ctx, args.workspaceId);
		return members ?? [];
	}
});

export const addMemberDirect = internalMutation({
	args: {
		workspaceId: v.id('workspaces'),
		userId: v.id('users'),
		role: v.union(v.literal('owner'), v.literal('admin'), v.literal('member'))
	},
	handler: async (ctx, args) => {
		const personId = await createMemberWithoutInvite(ctx, args);
		// SYOS-814 Phase 3: Return personId instead of membershipId
		return personId;
	}
});

export async function removeMember(
	ctx: MutationCtx,
	args: {
		workspaceId: Id<'workspaces'>;
		memberUserId: Id<'users'>;
		actingUserId: Id<'users'>;
	}
) {
	await requireWorkspaceAdminOrOwner(
		ctx,
		args.workspaceId,
		args.actingUserId,
		'Only admins/owners can remove members'
	);

	const targetPerson = await findPersonByUserAndWorkspace(ctx, args.memberUserId, args.workspaceId);
	if (!targetPerson || targetPerson.status !== 'active') {
		throw createError(ErrorCodes.WORKSPACE_ACCESS_DENIED, 'User is not a member of this workspace');
	}

	if (targetPerson.workspaceRole === 'owner') {
		const ownerCount = await getWorkspaceOwnerCount(ctx, args.workspaceId);
		if (ownerCount === 1) {
			throw createError(ErrorCodes.WORKSPACE_LAST_OWNER, 'Cannot remove the last owner');
		}
	}

	// Archive the person instead of deleting (preserves history)
	const actingPerson = await findPersonByUserAndWorkspace(ctx, args.actingUserId, args.workspaceId);
	if (!actingPerson) {
		throw createError(
			ErrorCodes.WORKSPACE_ACCESS_DENIED,
			'Actor is not a member of this workspace'
		);
	}

	await archivePerson(ctx, {
		personId: targetPerson._id,
		archivedByPersonId: actingPerson._id
	});

	return { success: true };
}

// SYOS-814 Phase 3: Migrated to use people table
async function listMembersForWorkspace(ctx: MutationCtx | QueryCtx, workspaceId: Id<'workspaces'>) {
	const activePeople = await listPeopleInWorkspace(ctx, workspaceId, { status: 'active' });

	const members = await Promise.all(
		activePeople.map(async (person) => getMemberFromPerson(ctx, person))
	);

	return members.filter((member): member is NonNullable<typeof member> => member !== null);
}

async function getMemberFromPerson(ctx: MutationCtx | QueryCtx, person: Doc<'people'>) {
	if (!person.userId) return null; // Skip invited-only people

	const user = await ctx.db.get(person.userId);
	if (!user) return null;

	const email = findUserEmailField(user);
	const name = findUserNameField(user);

	return {
		userId: person.userId,
		personId: person._id,
		email: email ?? '',
		name: name ?? '',
		role: person.workspaceRole,
		joinedAt: person.joinedAt ?? person.invitedAt ?? person.createdAt
	};
}

async function createMemberWithoutInvite(
	ctx: MutationCtx,
	args: { workspaceId: Id<'workspaces'>; userId: Id<'users'>; role: 'owner' | 'admin' | 'member' }
): Promise<Id<'people'>> {
	const workspace = await ctx.db.get(args.workspaceId);
	if (!workspace) {
		throw createError(ErrorCodes.WORKSPACE_NOT_FOUND, 'Organization not found');
	}

	const user = await ctx.db.get(args.userId);
	if (!user) {
		throw createError(ErrorCodes.PERSON_NOT_FOUND, 'User not found');
	}

	const now = Date.now();

	// SYOS-814 Phase 3: Check for existing people record
	const existingPerson = await findPersonByUserAndWorkspace(ctx, args.userId, args.workspaceId);
	if (existingPerson && existingPerson.status === 'active') {
		console.log(`User ${args.userId} is already a member of org ${args.workspaceId}`);
		return existingPerson._id;
	}

	// Create people record (organizational identity)
	const userName = findUserNameField(user);
	const userEmail = findUserEmailField(user);
	const displayName = userName || userEmail?.split('@')[0] || 'Unknown';

	const personId = await ctx.db.insert('people', {
		workspaceId: args.workspaceId,
		userId: args.userId,
		displayName,
		email: undefined, // Email comes from user lookup, not stored per people/README.md
		workspaceRole: args.role,
		status: 'active',
		createdAt: now,
		invitedAt: now,
		invitedBy: undefined, // Direct add, no inviter
		joinedAt: now,
		archivedAt: undefined,
		archivedBy: undefined
	});

	console.log(`✅ Added user ${args.userId} to org ${args.workspaceId} with role ${args.role}`);
	return personId;
}
