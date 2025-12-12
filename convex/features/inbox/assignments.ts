import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { findInboxItemOwnedByPerson } from './access';

export async function ensureInboxOwnership(
	ctx: MutationCtx,
	inboxItemId: Id<'inboxItems'>,
	personId: Id<'people'>
) {
	const item = await findInboxItemOwnedByPerson(ctx, inboxItemId, personId);
	if (!item) {
		throw createError(ErrorCodes.INBOX_ITEM_NOT_FOUND, 'Inbox item not found or access denied');
	}
	return item;
}

export async function ensureInboxAssignmentRecorded(
	_ctx: MutationCtx,
	inboxItemId: Id<'inboxItems'>,
	personId: Id<'people'>
) {
	// Placeholder for future assignment tracking (e.g., audit log or delegation)
	return { inboxItemId, personId };
}
