import { internal } from '../../_generated/api';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { requireCanInviteMembers } from './access';
import { ensureInviteCode } from './inviteCodes';
import {
	ensureInviteEmailFormat,
	ensureInviteEmailMatchesUser,
	ensureNoExistingEmailInvite,
	ensureNoExistingUserInvite,
	ensureUserNotAlreadyMember
} from './inviteValidation';
import { getPublicAppUrl } from './urls';
import { describeUserDisplayName, getUserEmail } from './user';
export async function findActiveInviteByCode(ctx: QueryCtx | MutationCtx, code: string) {
	const invite = await ctx.db
		.query('workspaceInvites')
		.withIndex('by_code', (q) => q.eq('code', code))
		.first();

	if (!invite) return null;
	if (invite.revokedAt) return null;
	if (invite.expiresAt && invite.expiresAt < Date.now()) return null;
	if (invite.acceptedAt) return null;
	return invite;
}
export async function createWorkspaceInviteRecord(
	ctx: MutationCtx,
	args: {
		workspaceId: Id<'workspaces'>;
		email?: string;
		invitedUserId?: Id<'users'>;
		role?: 'owner' | 'admin' | 'member';
		userId: Id<'users'>;
	}
): Promise<{ inviteId: Id<'workspaceInvites'>; code: string }> {
	const normalizedEmail = args.email?.trim();

	if (!normalizedEmail && !args.invitedUserId) {
		throw createError(
			ErrorCodes.VALIDATION_REQUIRED_FIELD,
			'Either email or invitedUserId must be provided'
		);
	}

	await requireCanInviteMembers(ctx, args.workspaceId, args.userId);
	ensureInviteEmailFormat(normalizedEmail);

	const emailToUse = normalizedEmail ? normalizedEmail.toLowerCase() : undefined;
	await ensureNoExistingEmailInvite(ctx, args.workspaceId, emailToUse);
	await ensureNoExistingUserInvite(ctx, args.workspaceId, args.invitedUserId);
	await ensureUserNotAlreadyMember(ctx, args.workspaceId, args.invitedUserId);

	const code = ensureInviteCode('ORG');
	const inviteId = await ctx.db.insert('workspaceInvites', {
		workspaceId: args.workspaceId,
		invitedUserId: args.invitedUserId,
		email: emailToUse,
		role: args.role ?? 'member',
		invitedBy: args.userId,
		code,
		createdAt: Date.now()
	});

	if (emailToUse) {
		await sendInviteEmail(ctx, {
			inviteId,
			workspaceId: args.workspaceId,
			invitedBy: args.userId,
			email: emailToUse,
			role: args.role ?? 'member',
			code
		});
	}
	return { inviteId, code };
}
export async function sendInviteEmail(
	ctx: MutationCtx,
	args: {
		inviteId: Id<'workspaceInvites'>;
		workspaceId: Id<'workspaces'>;
		invitedBy: Id<'users'>;
		email: string;
		role: 'owner' | 'admin' | 'member';
		code: string;
	}
) {
	const workspace = await ctx.db.get(args.workspaceId);
	const inviter = await ctx.db.get(args.invitedBy);
	if (!workspace || !inviter) return;

	const inviterName = describeUserDisplayName(inviter);
	const inviteLink = `${getPublicAppUrl()}/invite?code=${args.code}`;

	await ctx.scheduler.runAfter(0, internal.infrastructure.email.sendOrganizationInviteEmail, {
		email: args.email,
		inviteLink,
		organizationName: workspace.name,
		inviterName,
		role: args.role
	});
}
export async function acceptWorkspaceInvite(
	ctx: MutationCtx,
	code: string,
	userId: Id<'users'>,
	options: { markAccepted: boolean }
): Promise<{ workspaceId: Id<'workspaces'> }> {
	const invite = await findActiveInviteByCode(ctx, code);
	if (!invite) {
		throw createError(ErrorCodes.INVITE_NOT_FOUND, 'Invite not found or already used');
	}

	if (invite.invitedUserId && invite.invitedUserId !== userId) {
		throw createError(
			ErrorCodes.INVITE_USER_MISMATCH,
			'This invite is addressed to a different user'
		);
	}

	await ensureInviteEmailMatchesUser(ctx, invite, userId);

	const existingMembership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) =>
			q.eq('workspaceId', invite.workspaceId).eq('userId', userId)
		)
		.first();

	if (!existingMembership) {
		await ctx.db.insert('workspaceMembers', {
			workspaceId: invite.workspaceId,
			userId,
			role: invite.role,
			joinedAt: Date.now()
		});
	}

	if (options.markAccepted) {
		await ctx.db.patch(invite._id, {
			acceptedAt: Date.now()
		});
	}

	await ctx.db.delete(invite._id);

	return {
		workspaceId: invite.workspaceId
	};
}
export async function declineWorkspaceInvite(
	ctx: MutationCtx,
	inviteId: Id<'workspaceInvites'>,
	userId: Id<'users'>
) {
	const invite = await ctx.db.get(inviteId);
	if (!invite) return;

	if (invite.invitedUserId && invite.invitedUserId !== userId) {
		throw createError(ErrorCodes.INVITE_USER_MISMATCH, 'Cannot decline invite for another user');
	}

	if (invite.email) {
		const userEmail = await getUserEmail(ctx, userId);
		if (userEmail && userEmail.toLowerCase() !== invite.email.toLowerCase()) {
			throw createError(
				ErrorCodes.INVITE_EMAIL_MISMATCH,
				'Cannot decline invite for another email'
			);
		}
	}
	await ctx.db.delete(inviteId);
}
export async function resendInviteEmail(
	ctx: MutationCtx,
	inviteId: Id<'workspaceInvites'>,
	userId: Id<'users'>
) {
	const invite = await ctx.db.get(inviteId);
	if (!invite) {
		throw createError(ErrorCodes.INVITE_NOT_FOUND, 'Invite not found');
	}

	await requireCanInviteMembers(ctx, invite.workspaceId, userId);

	if (!invite.email) {
		throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, 'Cannot resend invite without email');
	}

	if (invite.acceptedAt) {
		throw createError(ErrorCodes.INVITE_ALREADY_ACCEPTED, 'Invite already accepted');
	}

	if (invite.revokedAt) {
		throw createError(ErrorCodes.INVITE_REVOKED, 'Invite has been revoked');
	}

	const workspace = await ctx.db.get(invite.workspaceId);
	if (!workspace) {
		throw createError(ErrorCodes.WORKSPACE_NOT_FOUND, 'Organization not found');
	}

	const inviter = await ctx.db.get(invite.invitedBy);
	const inviterName = describeUserDisplayName(inviter);
	const inviteLink = `${getPublicAppUrl()}/invite?code=${invite.code}`;

	await ctx.scheduler.runAfter(0, internal.infrastructure.email.sendOrganizationInviteEmail, {
		email: invite.email,
		inviteLink,
		organizationName: workspace.name,
		inviterName,
		role: invite.role
	});
	return { success: true };
}
