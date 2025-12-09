import { internalMutation, mutation, query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import {
	getWorkspaceOwnerCount,
	listWorkspaceMemberships,
	requireWorkspaceAdminOrOwner,
	requireWorkspaceMembership
} from './access';
import { findUserEmailField, findUserNameField } from './user';

export const removeOrganizationMember = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		return removeMember(ctx, { ...args, actingUserId });
	}
});

type WorkspaceMemberSummary = {
	userId: Id<'users'>;
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
	handler: async (ctx, args) => createMemberWithoutInvite(ctx, args)
});

export async function removeMember(
	ctx: MutationCtx,
	args: { workspaceId: Id<'workspaces'>; userId: Id<'users'>; actingUserId: Id<'users'> }
) {
	await requireWorkspaceAdminOrOwner(
		ctx,
		args.workspaceId,
		args.actingUserId,
		'Only admins/owners can remove members'
	);

	const targetMembership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) =>
			q.eq('workspaceId', args.workspaceId).eq('userId', args.userId)
		)
		.first();

	if (!targetMembership) {
		throw createError(ErrorCodes.WORKSPACE_ACCESS_DENIED, 'User is not a member of this workspace');
	}

	if (targetMembership.role === 'owner') {
		const ownerCount = await getWorkspaceOwnerCount(ctx, args.workspaceId);
		if (ownerCount === 1) {
			throw createError(ErrorCodes.WORKSPACE_LAST_OWNER, 'Cannot remove the last owner');
		}
	}

	await ctx.db.delete(targetMembership._id);
	return { success: true };
}

async function listMembersForWorkspace(ctx: MutationCtx, workspaceId: Id<'workspaces'>) {
	const memberships = await listWorkspaceMemberships(ctx, workspaceId);

	const members = await Promise.all(
		memberships.map(async (membership) => getMemberFromMembership(ctx, membership))
	);

	return members.filter((member): member is NonNullable<typeof member> => member !== null);
}

async function getMemberFromMembership(ctx: MutationCtx, membership: Doc<'workspaceMembers'>) {
	const user = await ctx.db.get(membership.userId);
	if (!user) return null;

	const email = findUserEmailField(user);
	const name = findUserNameField(user);

	return {
		userId: membership.userId,
		email: email ?? '',
		name: name ?? '',
		role: membership.role,
		joinedAt: membership.joinedAt
	};
}

async function createMemberWithoutInvite(
	ctx: MutationCtx,
	args: { workspaceId: Id<'workspaces'>; userId: Id<'users'>; role: 'owner' | 'admin' | 'member' }
) {
	const workspace = await ctx.db.get(args.workspaceId);
	if (!workspace) {
		throw createError(ErrorCodes.WORKSPACE_NOT_FOUND, 'Organization not found');
	}

	const user = await ctx.db.get(args.userId);
	if (!user) {
		throw createError(ErrorCodes.PERSON_NOT_FOUND, 'User not found');
	}

	const existing = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) =>
			q.eq('workspaceId', args.workspaceId).eq('userId', args.userId)
		)
		.first();

	if (existing) {
		console.log(`User ${args.userId} is already a member of org ${args.workspaceId}`);
		return existing._id;
	}

	const membershipId = await ctx.db.insert('workspaceMembers', {
		workspaceId: args.workspaceId,
		userId: args.userId,
		role: args.role,
		joinedAt: Date.now()
	});

	console.log(`✅ Added user ${args.userId} to org ${args.workspaceId} with role ${args.role}`);
	return membershipId;
}
