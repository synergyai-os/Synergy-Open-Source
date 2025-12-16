import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { findPersonByUserAndWorkspace } from '../../core/people/queries';

/**
 * Generate a unique invite code
 */
export function ensureInviteCode(prefix: string): string {
	const random = Math.random().toString(36).slice(2, 8).toUpperCase();
	const randomTrailing = Math.random().toString(10).slice(2, 6);
	return `${prefix}-${random}-${randomTrailing}`;
}

/**
 * Validate email format for invites
 */
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

/**
 * Ensure no existing invite for the same email in the workspace
 */
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

/**
 * Ensure no existing invite for the same user in the workspace
 */
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

/**
 * Ensure user is not already a member of the workspace
 */
export async function ensureUserNotAlreadyMember(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	invitedUserId?: Id<'users'>
) {
	if (!invitedUserId) return;

	const person = await findPersonByUserAndWorkspace(ctx, invitedUserId, workspaceId);
	if (person && person.status === 'active') {
		throw createError(
			ErrorCodes.WORKSPACE_ALREADY_MEMBER,
			'User is already a member of this workspace'
		);
	}
}

/**
 * Ensure invite email matches the accepting user's email
 */
export async function ensureInviteEmailMatchesUser(
	ctx: QueryCtx | MutationCtx,
	invite: Doc<'workspaceInvites'>,
	userId: Id<'users'>
) {
	const inviteEmail = invite.email ? invite.email.toLowerCase() : null;
	if (!inviteEmail) return;

	const user = await ctx.db.get(userId);
	const userEmail = user ? ((user as Record<string, unknown>).email as string | null) : null;

	if (userEmail && inviteEmail !== userEmail.toLowerCase()) {
		throw createError(
			ErrorCodes.INVITE_EMAIL_MISMATCH,
			'This invite is addressed to a different email'
		);
	}
}
