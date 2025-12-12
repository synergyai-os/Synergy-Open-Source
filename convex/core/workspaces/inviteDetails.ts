import type { Doc, Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { describeUserDisplayName, getUserEmail } from './user';

export type WorkspaceInviteDetails = {
	inviteId: Id<'workspaceInvites'>;
	workspaceId: Id<'workspaces'>;
	organizationName: string;
	role: string;
	invitedBy: Id<'users'>;
	invitedByName: string;
	code: string;
	createdAt: number;
};

export async function listInvitesForUser(ctx: QueryCtx, userId: Id<'users'>) {
	const email = await getUserEmail(ctx, userId);

	const invitesByUser = await ctx.db
		.query('workspaceInvites')
		.withIndex('by_user', (q) => q.eq('invitedUserId', userId))
		.collect();

	const invitesByEmail = email
		? await ctx.db
				.query('workspaceInvites')
				.withIndex('by_email', (q) => q.eq('email', email.toLowerCase()))
				.collect()
		: [];

	const inviteMap = new Map<string, Doc<'workspaceInvites'>>();
	for (const invite of invitesByUser) {
		inviteMap.set(invite._id, invite);
	}
	for (const invite of invitesByEmail) {
		inviteMap.set(invite._id, invite);
	}

	return Promise.all(Array.from(inviteMap.values()).map((invite) => getInviteDetails(ctx, invite)));
}

export async function getInviteDetails(ctx: QueryCtx, invite: Doc<'workspaceInvites'>) {
	const workspace = await ctx.db.get(invite.workspaceId);
	if (!workspace) {
		throw createError(ErrorCodes.WORKSPACE_NOT_FOUND, 'Organization not found');
	}

	const inviter = await ctx.db.get(invite.invitedBy);
	const inviterName = describeUserDisplayName(inviter);

	return {
		inviteId: invite._id,
		workspaceId: invite.workspaceId,
		organizationName: workspace.name,
		role: invite.role,
		invitedBy: invite.invitedBy,
		invitedByName: inviterName,
		code: invite.code,
		createdAt: invite.createdAt
	};
}

export async function getInvitePreview(ctx: QueryCtx, invite: Doc<'workspaceInvites'>) {
	const workspace = await ctx.db.get(invite.workspaceId);
	if (!workspace) {
		return null;
	}

	const inviter = await ctx.db.get(invite.invitedBy);
	const inviterName = describeUserDisplayName(inviter);

	return {
		type: 'workspace' as const,
		workspaceId: invite.workspaceId,
		organizationName: workspace.name,
		inviterName,
		role: invite.role,
		email: invite.email ?? undefined,
		invitedUserId: invite.invitedUserId ?? undefined
	};
}

export async function listWorkspaceInvitesForOrg(ctx: QueryCtx, workspaceId: Id<'workspaces'>) {
	const invites = await ctx.db
		.query('workspaceInvites')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	const memberships = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	const memberUserIds = new Set(memberships.map((m) => m.userId));
	const memberEmails = await listMemberEmails(ctx, memberships);

	return Promise.all(
		invites.map(async (invite) => {
			const hasJoined =
				(invite.invitedUserId && memberUserIds.has(invite.invitedUserId)) ||
				(invite.email && memberEmails.has(invite.email.toLowerCase()));

			const inviter = await ctx.db.get(invite.invitedBy);

			return {
				inviteId: invite._id,
				email: invite.email ?? '',
				role: invite.role,
				status: hasJoined ? ('accepted' as const) : ('pending' as const),
				invitedAt: invite.createdAt,
				invitedBy: invite.invitedBy,
				invitedByName: describeUserDisplayName(inviter)
			};
		})
	);
}

async function listMemberEmails(ctx: QueryCtx, memberships: Doc<'workspaceMembers'>[]) {
	const emails = new Set<string>();
	for (const membership of memberships) {
		const user = await ctx.db.get(membership.userId);
		const email = user ? (user as Record<string, unknown>).email : null;
		if (typeof email === 'string') {
			emails.add(email.toLowerCase());
		}
	}
	return emails;
}
