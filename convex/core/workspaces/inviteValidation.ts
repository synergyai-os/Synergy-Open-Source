import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { getUserEmail } from './user';

export function ensureInviteEmailFormat(email?: string) {
	if (!email) return;

	const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z0-9]{2,}$/;
	if (!emailRegex.test(email.trim())) {
		throw createError(
			ErrorCodes.VALIDATION_INVALID_FORMAT,
			'Invalid email format. Please enter a valid email address.'
		);
	}
}

export async function ensureNoExistingEmailInvite(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	email?: string
) {
	if (!email) return;

	const existingEmailInvite = await ctx.db
		.query('workspaceInvites')
		.withIndex('by_email', (q) => q.eq('email', email))
		.first();

	if (existingEmailInvite && existingEmailInvite.workspaceId === workspaceId) {
		throw createError(ErrorCodes.INVITE_ALREADY_EXISTS, 'An invite for this email already exists');
	}
}

export async function ensureNoExistingUserInvite(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	invitedUserId?: Id<'users'>
) {
	if (!invitedUserId) return;

	const existingUserInvite = await ctx.db
		.query('workspaceInvites')
		.withIndex('by_user', (q) => q.eq('invitedUserId', invitedUserId))
		.first();

	if (existingUserInvite && existingUserInvite.workspaceId === workspaceId) {
		throw createError(ErrorCodes.INVITE_ALREADY_EXISTS, 'This user already has an invite');
	}
}

export async function ensureUserNotAlreadyMember(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	invitedUserId?: Id<'users'>
) {
	if (!invitedUserId) return;

	const alreadyMember = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) =>
			q.eq('workspaceId', workspaceId).eq('userId', invitedUserId)
		)
		.first();

	if (alreadyMember) {
		throw createError(
			ErrorCodes.WORKSPACE_ALREADY_MEMBER,
			'User is already a member of this workspace'
		);
	}
}

export async function ensureInviteEmailMatchesUser(
	ctx: QueryCtx | MutationCtx,
	invite: Doc<'workspaceInvites'>,
	userId: Id<'users'>
) {
	const inviteEmail = invite.email ? invite.email.toLowerCase() : null;
	if (!inviteEmail) return;

	const userEmail = await getUserEmail(ctx, userId);
	if (userEmail && inviteEmail !== userEmail.toLowerCase()) {
		throw createError(
			ErrorCodes.INVITE_EMAIL_MISMATCH,
			'This invite is addressed to a different email'
		);
	}
}
