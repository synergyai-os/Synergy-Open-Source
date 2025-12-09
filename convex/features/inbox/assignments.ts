import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { findInboxItemOwnedByUser } from './access';

export async function ensureInboxOwnership(
	ctx: MutationCtx,
	inboxItemId: Id<'inboxItems'>,
	userId: string
) {
	const item = await findInboxItemOwnedByUser(ctx, inboxItemId, userId);
	if (!item) {
		throw createError(ErrorCodes.INBOX_ITEM_NOT_FOUND, 'Inbox item not found or access denied');
	}
	return item;
}

export async function ensureInboxAssignmentRecorded(
	_ctx: MutationCtx,
	inboxItemId: Id<'inboxItems'>,
	userId: string
) {
	// Placeholder for future assignment tracking (e.g., audit log or delegation)
	return { inboxItemId, userId };
}
