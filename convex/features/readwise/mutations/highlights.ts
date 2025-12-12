import type { MutationCtx } from '../../../_generated/server';
import type { Id } from '../../../_generated/dataModel';
import { parseISODate } from '../utils';
import type { ReadwiseHighlight } from '../../../../src/lib/types/readwise';
import { createError, ErrorCodes } from '../../../infrastructure/errors/codes';

export async function createHighlightIfMissingImpl(
	ctx: MutationCtx,
	args: {
		userId: Id<'users'>;
		sourceId: Id<'sources'>;
		readwiseHighlight: ReadwiseHighlight;
	}
) {
	const { userId, sourceId, readwiseHighlight } = args;
	const externalId = String(readwiseHighlight.id);
	const existing = await ctx.db
		.query('highlights')
		.withIndex('by_external_id', (q) => q.eq('externalId', externalId))
		.first();

	const now = Date.now();
	const updatedAt = parseISODate(readwiseHighlight.updated) || now;
	const highlightedAt = parseISODate(readwiseHighlight.highlighted_at);

	const highlightData = {
		userId,
		sourceId,
		text: readwiseHighlight.text,
		location: readwiseHighlight.location || undefined,
		locationType: readwiseHighlight.location_type || undefined,
		note: readwiseHighlight.note || undefined,
		color: readwiseHighlight.color || undefined,
		externalId,
		externalUrl: readwiseHighlight.url || '',
		highlightedAt,
		updatedAt,
		createdAt: existing?.createdAt || now,
		lastSyncedAt: now
	};

	if (existing) {
		await ctx.db.patch(existing._id, highlightData);
		return existing._id;
	}

	return ctx.db.insert('highlights', highlightData);
}

export async function createInboxItemIfMissingImpl(
	ctx: MutationCtx,
	args: { userId: Id<'users'>; workspaceId: Id<'workspaces'>; highlightId: Id<'highlights'> }
) {
	const { userId, workspaceId, highlightId } = args;
	const person = await ctx.db
		.query('people')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();

	if (!person) {
		throw createError(
			ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED,
			'User is not a member of workspace'
		);
	}

	const existing = await ctx.db
		.query('inboxItems')
		.withIndex('by_person', (q) => q.eq('personId', person._id))
		.filter((q) =>
			q.and(q.eq(q.field('type'), 'readwise_highlight'), q.eq(q.field('highlightId'), highlightId))
		)
		.first();

	if (existing) return existing._id;

	return ctx.db.insert('inboxItems', {
		type: 'readwise_highlight' as const,
		personId: person._id,
		highlightId,
		processed: false,
		createdAt: Date.now(),
		workspaceId
	});
}
