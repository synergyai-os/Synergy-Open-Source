/**
 * Readwise Sync Mutations
 *
 * Internal mutations for syncing Readwise data.
 * These must be in a separate file without "use node" because mutations
 * cannot be defined in Node.js files (only actions can).
 */

import { internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { normalizeAuthorName, parseISODate, normalizeTagName } from './readwiseUtils';

/**
 * Internal mutation: Update sync progress
 */
export const updateSyncProgress = internalMutation({
	args: {
		userId: v.id('users'),
		step: v.string(),
		current: v.number(),
		total: v.optional(v.number()),
		message: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { userId, step, current, total, message } = args;
		const now = Date.now();

		// Find existing progress record
		const existing = await ctx.db
			.query('syncProgress')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.first();

		if (existing) {
			// Update existing
			await ctx.db.patch(existing._id, {
				step,
				current,
				total,
				message,
				updatedAt: now
			});
			return existing._id;
		} else {
			// Create new
			const progressId = await ctx.db.insert('syncProgress', {
				userId,
				step,
				current,
				total,
				message,
				startedAt: now,
				updatedAt: now
			});
			return progressId;
		}
	}
});

/**
 * Internal mutation: Clear sync progress
 */
export const clearSyncProgress = internalMutation({
	args: {
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const { userId } = args;
		const existing = await ctx.db
			.query('syncProgress')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.first();

		if (existing) {
			await ctx.db.delete(existing._id);
		}
	}
});

/**
 * Internal mutation: Find or create author
 */
export const findOrCreateAuthor = internalMutation({
	args: {
		userId: v.id('users'),
		authorName: v.string()
	},
	handler: async (ctx, args) => {
		const { userId, authorName } = args;
		const normalizedName = normalizeAuthorName(authorName);

		// Check if author exists
		const existing = await ctx.db
			.query('authors')
			.withIndex('by_user_name', (q) => q.eq('userId', userId).eq('name', normalizedName))
			.first();

		if (existing) {
			return existing._id;
		}

		// Create new author
		const authorId = await ctx.db.insert('authors', {
			userId,
			name: normalizedName,
			displayName: authorName,
			createdAt: Date.now()
		});

		return authorId;
	}
});

/**
 * Internal mutation: Find or create source
 */
export const findOrCreateSource = internalMutation({
	args: {
		userId: v.id('users'),
		primaryAuthorId: v.id('authors'),
		readwiseSource: v.any() // Readwise source object
	},
	handler: async (ctx, args) => {
		const { userId, primaryAuthorId, readwiseSource } = args;
		const externalId = String(readwiseSource.id);

		// Check if source exists
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
			// Update existing source
			await ctx.db.patch(existing._id, sourceData);
			return existing._id;
		} else {
			// Create new source
			const sourceId = await ctx.db.insert('sources', sourceData);
			return sourceId;
		}
	}
});

/**
 * Internal mutation: Link author to source
 */
export const linkAuthorToSource = internalMutation({
	args: {
		sourceId: v.id('sources'),
		authorId: v.id('authors')
	},
	handler: async (ctx, args) => {
		const { sourceId, authorId } = args;

		// Check if link already exists
		const existing = await ctx.db
			.query('sourceAuthors')
			.withIndex('by_source_author', (q) => q.eq('sourceId', sourceId).eq('authorId', authorId))
			.first();

		if (existing) {
			return existing._id;
		}

		// Create link
		return await ctx.db.insert('sourceAuthors', {
			sourceId,
			authorId
		});
	}
});

/**
 * Internal mutation: Find or create tag
 */
export const findOrCreateTag = internalMutation({
	args: {
		userId: v.id('users'),
		organizationId: v.id('organizations'), // REQUIRED: Users always have at least one organization
		tagName: v.string(),
		externalId: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const { userId, organizationId, tagName, externalId } = args;
		const normalizedName = normalizeTagName(tagName);

		// Check if tag exists for this organization
		const existing = await ctx.db
			.query('tags')
			.withIndex('by_organization_name', (q) =>
				q.eq('organizationId', organizationId).eq('name', normalizedName)
			)
			.first();

		if (existing) {
			// Update externalId if provided and missing
			if (externalId && !existing.externalId) {
				await ctx.db.patch(existing._id, { externalId });
			}
			return existing._id;
		}

		// Create new tag with default color (grey) - always scoped to organization
		// Default color: #94a3b8 (slate-400) - matches TAG_COLORS[0]
		const tagId = await ctx.db.insert('tags', {
			userId,
			name: normalizedName,
			displayName: tagName,
			externalId,
			color: '#94a3b8', // Default grey color (required field)
			createdAt: Date.now(),
			organizationId, // REQUIRED: Tags must belong to an organization
			ownershipType: 'organization' // Tags from Readwise sync are organization-scoped
		});

		return tagId;
	}
});

/**
 * Internal mutation: Link tag to source
 */
export const linkTagToSource = internalMutation({
	args: {
		sourceId: v.id('sources'),
		tagId: v.id('tags')
	},
	handler: async (ctx, args) => {
		const { sourceId, tagId } = args;

		// Check if link already exists
		const existing = await ctx.db
			.query('sourceTags')
			.withIndex('by_source_tag', (q) => q.eq('sourceId', sourceId).eq('tagId', tagId))
			.first();

		if (existing) {
			return existing._id;
		}

		// Create link
		return await ctx.db.insert('sourceTags', {
			sourceId,
			tagId
		});
	}
});

/**
 * Internal mutation: Find or create highlight
 */
export const findOrCreateHighlight = internalMutation({
	args: {
		userId: v.id('users'),
		sourceId: v.id('sources'),
		readwiseHighlight: v.any() // Readwise highlight object
	},
	handler: async (ctx, args) => {
		const { userId, sourceId, readwiseHighlight } = args;
		const externalId = String(readwiseHighlight.id);

		// Check if highlight exists
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
			externalUrl: readwiseHighlight.url || '', // Convert null to empty string (schema requires string)
			highlightedAt,
			updatedAt,
			createdAt: existing?.createdAt || now,
			lastSyncedAt: now
		};

		if (existing) {
			// Update existing highlight
			await ctx.db.patch(existing._id, highlightData);
			return existing._id;
		} else {
			// Create new highlight
			const highlightId = await ctx.db.insert('highlights', highlightData);
			return highlightId;
		}
	}
});

/**
 * Internal mutation: Find or create inbox item
 */
export const findOrCreateInboxItem = internalMutation({
	args: {
		userId: v.id('users'),
		highlightId: v.id('highlights')
	},
	handler: async (ctx, args) => {
		const { userId, highlightId } = args;

		// Check if inbox item already exists for this highlight
		const existing = await ctx.db
			.query('inboxItems')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.filter((q) =>
				q.and(
					q.eq(q.field('type'), 'readwise_highlight'),
					q.eq(q.field('highlightId'), highlightId)
				)
			)
			.first();

		if (existing) {
			// Inbox item exists, check if it was already processed
			// If processed, we might want to recreate it if highlight was updated
			// For now, just return the existing one
			return existing._id;
		}

		// Create new inbox item
		const inboxItemId = await ctx.db.insert('inboxItems', {
			type: 'readwise_highlight' as const,
			userId,
			highlightId,
			processed: false,
			createdAt: Date.now()
		});

		return inboxItemId;
	}
});

/**
 * Internal query: Check if highlight exists by externalId
 */
export const checkHighlightExists = internalQuery({
	args: {
		userId: v.id('users'),
		externalId: v.string()
	},
	handler: async (ctx, args) => {
		const { externalId } = args;

		const existing = await ctx.db
			.query('highlights')
			.withIndex('by_external_id', (q) => q.eq('externalId', externalId))
			.first();

		return !!existing;
	}
});

/**
 * Internal query: Get sourceId for a book_id (Readwise external ID)
 */
export const getSourceIdByBookId = internalQuery({
	args: {
		userId: v.id('users'),
		bookId: v.string() // Readwise book_id (externalId)
	},
	handler: async (ctx, args) => {
		const { bookId } = args;

		const source = await ctx.db
			.query('sources')
			.withIndex('by_external_id', (q) => q.eq('externalId', bookId))
			.first();

		return source?._id || null;
	}
});

/**
 * Internal query: Get highlightId by externalId
 */
export const getHighlightIdByExternalId = internalQuery({
	args: {
		userId: v.id('users'),
		externalId: v.string()
	},
	handler: async (ctx, args) => {
		const { externalId } = args;

		const highlight = await ctx.db
			.query('highlights')
			.withIndex('by_external_id', (q) => q.eq('externalId', externalId))
			.first();

		return highlight?._id || null;
	}
});

/**
 * Internal query: Check if inbox item exists for a highlight
 */
export const checkInboxItemExists = internalQuery({
	args: {
		userId: v.id('users'),
		highlightId: v.id('highlights')
	},
	handler: async (ctx, args) => {
		const { userId, highlightId } = args;

		const existing = await ctx.db
			.query('inboxItems')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.filter((q) =>
				q.and(
					q.eq(q.field('type'), 'readwise_highlight'),
					q.eq(q.field('highlightId'), highlightId)
				)
			)
			.first();

		return !!existing;
	}
});

/**
 * Internal query: Check if inbox item was newly created
 */
export const wasInboxItemNew = internalQuery({
	args: {
		inboxItemId: v.id('inboxItems'),
		highlightId: v.id('highlights')
	},
	handler: async (ctx, args) => {
		// This is a simple check - if the inbox item was just created, it's new
		// We can check the createdAt vs current time, but for simplicity,
		// we'll just assume if we're calling this right after creation, it's new
		// Actually, let's check if it was created recently (within last minute)
		const inboxItem = await ctx.db.get(args.inboxItemId);
		if (!inboxItem) {
			return false;
		}

		const now = Date.now();
		const createdAt = inboxItem.createdAt;
		// If created within last 5 seconds, consider it new
		return now - createdAt < 5000;
	}
});

/**
 * Internal mutation: Update last sync time
 */
export const updateLastSyncTime = internalMutation({
	args: {
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const { userId } = args;
		const now = Date.now();

		// Find or create user settings
		const settings = await ctx.db
			.query('userSettings')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.first();

		if (settings) {
			// Update existing
			await ctx.db.patch(settings._id, {
				lastReadwiseSyncAt: now
			});
		} else {
			// Create new (shouldn't happen, but handle it)
			await ctx.db.insert('userSettings', {
				userId,
				lastReadwiseSyncAt: now
			});
		}
	}
});
