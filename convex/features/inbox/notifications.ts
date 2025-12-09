import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';

export async function notifyInboxItemCreated(
	_ctx: MutationCtx,
	_inboxItemId: Id<'inboxItems'>,
	_userId: string
) {
	// Placeholder for future notification plumbing (email, in-app, etc.)
	return;
}

export async function notifyInboxItemProcessed(
	_ctx: MutationCtx,
	_inboxItemId: Id<'inboxItems'>,
	_userId: string
) {
	// Placeholder for future notification plumbing (email, in-app, etc.)
	return;
}

export async function notifyInboxItemArchived(
	_ctx: MutationCtx,
	_inboxItemId: Id<'inboxItems'>,
	_userId: string
) {
	// Placeholder for future notification plumbing (email, in-app, etc.)
	return;
}

export async function notifyInboxItemRestored(
	_ctx: MutationCtx,
	_inboxItemId: Id<'inboxItems'>,
	_userId: string
) {
	// Placeholder for future notification plumbing (email, in-app, etc.)
	return;
}
