import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { findPersonByUserAndWorkspace } from '../people/queries';

/**
 * Validate email format for invites
 *
 * Note: Copied from features/invites/rules.ts to avoid layer dependency violation.
 * Per architecture Trade-off Guidance: "Explicit boundaries > DRY across domains"
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
 * Ensure user is not already a member of the workspace
 *
 * Note: Copied from features/invites/rules.ts to avoid layer dependency violation.
 * Per architecture Trade-off Guidance: "Explicit boundaries > DRY across domains"
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
