import type { MutationCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { parseAuthorName, parseISODate } from '../../readwiseUtils';
import type { ReadwiseSource } from '../../../src/lib/types/readwise';

export async function createAuthorIfMissingImpl(
	ctx: MutationCtx,
	args: { userId: Id<'users'>; authorName: string }
) {
	const { userId, authorName } = args;
	const normalizedName = parseAuthorName(authorName);
	const existing = await ctx.db
		.query('authors')
		.withIndex('by_user_name', (q) => q.eq('userId', userId).eq('name', normalizedName))
		.first();
	if (existing) return existing._id;

	return ctx.db.insert('authors', {
		userId,
		name: normalizedName,
		displayName: authorName,
		createdAt: Date.now()
	});
}

export async function createSourceIfMissingImpl(
	ctx: MutationCtx,
	args: { userId: Id<'users'>; primaryAuthorId: Id<'authors'>; readwiseSource: ReadwiseSource }
) {
	const { userId, primaryAuthorId, readwiseSource } = args;
	const externalId = String(readwiseSource.id);
	const existing = await ctx.db
		.query('sources')
		.withIndex('by_external_id', (q) => q.eq('externalId', externalId))
		.first();

	const now = Date.now();
	const updatedAt = parseISODate(readwiseSource.updated) || now;
	const lastHighlightAt = parseISODate(readwiseSource.last_highlight_at);

	const sourceData = {
		userId,
		authorId: primaryAuthorId,
		title: readwiseSource.title,
		category: readwiseSource.category,
		sourceType: readwiseSource.source,
		externalId,
		sourceUrl: readwiseSource.source_url || undefined,
		coverImageUrl: readwiseSource.cover_image_url || undefined,
		highlightsUrl: readwiseSource.highlights_url || undefined,
		asin: readwiseSource.asin || undefined,
		documentNote: readwiseSource.document_note || undefined,
		numHighlights: readwiseSource.num_highlights || 0,
		lastHighlightAt,
		updatedAt,
		createdAt: existing?.createdAt || now
	};

	if (existing) {
		await ctx.db.patch(existing._id, sourceData);
		return existing._id;
	}

	return ctx.db.insert('sources', sourceData);
}

export async function linkAuthorToSourceImpl(
	ctx: MutationCtx,
	args: { sourceId: Id<'sources'>; authorId: Id<'authors'> }
) {
	const { sourceId, authorId } = args;
	const existing = await ctx.db
		.query('sourceAuthors')
		.withIndex('by_source_author', (q) => q.eq('sourceId', sourceId).eq('authorId', authorId))
		.first();
	if (existing) return existing._id;
	return ctx.db.insert('sourceAuthors', { sourceId, authorId });
}
