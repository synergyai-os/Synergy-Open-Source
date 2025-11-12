/**
 * Inbox Queries and Mutations
 *
 * Handles querying inbox items and marking them as processed.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from './auth';
import { validateSession } from './sessionValidation';

/**
 * List all inbox items for the current user
 * Optionally filter by type (readwise_highlight, photo_note, manual_text, etc.)
 * Filters by workspace context (personal, organization, or team)
 * Returns items with basic display info (title, snippet, tags) for inbox list
 * 
 * TODO: Once WorkOS adds 'aud' claim to password auth tokens, migrate to JWT-based auth
 * and remove explicit userId parameter
 */
export const listInboxItems = query({
	args: {
		userId: v.id('users'), // Required: passed from authenticated SvelteKit session
		filterType: v.optional(v.string()), // Optional type filter
		processed: v.optional(v.boolean()), // Optional processed filter
		organizationId: v.optional(v.union(v.id('organizations'), v.null())), // Workspace context
		teamId: v.optional(v.id('teams')) // Team context
	},
	handler: async (ctx, args) => {
		// Validate session (prevents impersonation)
		await validateSession(ctx, args.userId);
		const userId = args.userId;

		let itemsQuery = ctx.db.query('inboxItems').withIndex('by_user', (q) => q.eq('userId', userId));

		// Apply processed filter if provided
		if (args.processed !== undefined) {
			itemsQuery = ctx.db
				.query('inboxItems')
				.withIndex('by_user_processed', (q) =>
					q.eq('userId', userId).eq('processed', args.processed as boolean)
				);
		}

		let items = await itemsQuery.collect();

		// Filter by workspace context
		if (args.organizationId === null) {
			// Personal workspace: show only user-owned items (no org/team)
			items = items.filter((item) => !item.organizationId && !item.teamId);
		} else if (args.organizationId !== undefined) {
			// Organization workspace: show org-owned items
			if (args.teamId) {
				// Team context: show only team items
				items = items.filter((item) => item.teamId === args.teamId);
			} else {
				// Org context: show org items (not team-specific)
				items = items.filter((item) => item.organizationId === args.organizationId && !item.teamId);
			}
		}
		// If no workspace filter provided, show all (backwards compatibility)

		// Filter by type if provided
		const filteredItems = args.filterType
			? items.filter((item) => item.type === args.filterType)
			: items;

		// Enrich items with display info based on type
		const enrichedItems = await Promise.all(
			filteredItems.map(async (item) => {
				if (item.type === 'readwise_highlight') {
					// Get highlight for title/snippet
					const highlight = await ctx.db.get(item.highlightId);
					if (!highlight) {
						return {
							...item,
							title: 'Unknown Highlight',
							snippet: '',
							tags: []
						};
					}

					// Get source for title
					const source = await ctx.db.get(highlight.sourceId);
					const title = source ? source.title : 'Unknown Source';

					// Get tags
					const highlightTags = await ctx.db
						.query('highlightTags')
						.withIndex('by_highlight', (q) => q.eq('highlightId', highlight._id))
						.collect();

					const sourceTags = source
						? await ctx.db
								.query('sourceTags')
								.withIndex('by_source', (q) => q.eq('sourceId', source._id))
								.collect()
						: [];

					const allTagIds = [
						...highlightTags.map((ht) => ht.tagId),
						...sourceTags.map((st) => st.tagId)
					];
					const uniqueTagIds = Array.from(new Set(allTagIds));
					const tags = await Promise.all(uniqueTagIds.map((tagId) => ctx.db.get(tagId)));
					const tagNames = tags.filter((t) => t !== null).map((t) => t!.displayName);

					// Snippet is first part of highlight text (max 100 chars)
					const snippet =
						highlight.text.length > 100 ? highlight.text.substring(0, 100) + '...' : highlight.text;

					return {
						...item,
						title,
						snippet,
						tags: tagNames
					};
				} else if (item.type === 'note') {
					// Get note title and content snippet
					const title = item.title || 'Untitled Note';

					// Extract snippet from markdown or ProseMirror content
					let snippet = '';
					if (item.contentMarkdown) {
						// Remove markdown formatting and get first 100 chars
						snippet = item.contentMarkdown
							.replace(/^---[\s\S]*?---/, '') // Remove frontmatter
							.replace(/[#*_`\[\]]/g, '') // Remove markdown symbols
							.trim();

						if (snippet.length > 100) {
							snippet = snippet.substring(0, 100) + '...';
						}
					} else if (item.content) {
						// Try to extract text from ProseMirror JSON
						try {
							const proseMirrorDoc = JSON.parse(item.content);
							const extractText = (node: any): string => {
								if (node.text) return node.text;
								if (node.content) {
									return node.content.map(extractText).join(' ');
								}
								return '';
							};
							snippet = extractText(proseMirrorDoc).trim();
							if (snippet.length > 100) {
								snippet = snippet.substring(0, 100) + '...';
							}
						} catch {
							snippet = 'No preview available';
						}
					}

					// TODO: Get tags for notes (when note tagging is implemented)
					const tags: string[] = [];

					return {
						...item,
						title,
						snippet,
						tags
					};
				}

				// For other types, return with placeholder data
				return {
					...item,
					title: 'Unknown Item',
					snippet: '',
					tags: []
				};
			})
		);

		// Sort by createdAt descending (newest first)
		return enrichedItems.sort((a, b) => b.createdAt - a.createdAt);
	}
});

/**
 * Get a single inbox item by ID
 */
export const getInboxItem = query({
	args: {
		inboxItemId: v.id('inboxItems')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return null;
		}

		const item = await ctx.db.get(args.inboxItemId);

		// Verify the item belongs to the user
		if (!item || item.userId !== userId) {
			return null;
		}

		return item;
	}
});

/**
 * Get inbox item with full details (author, source, tags, etc.)
 * This is useful for displaying detailed information in the inbox UI
 */
export const getInboxItemWithDetails = query({
	args: {
		inboxItemId: v.id('inboxItems')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return null;
		}

		const item = await ctx.db.get(args.inboxItemId);

		// Verify the item belongs to the user
		if (!item || item.userId !== userId) {
			return null;
		}

		// Get details based on item type
		if (item.type === 'readwise_highlight') {
			// Get highlight details
			const highlight = await ctx.db.get(item.highlightId);
			if (!highlight) {
				return {
					...item,
					highlight: null,
					source: null,
					author: null,
					tags: []
				};
			}

			// Get source details
			const source = await ctx.db.get(highlight.sourceId);
			if (!source) {
				return {
					...item,
					highlight,
					source: null,
					author: null,
					tags: []
				};
			}

			// Get primary author
			const author = await ctx.db.get(source.authorId);

			// Get all authors for this source
			const sourceAuthors = await ctx.db
				.query('sourceAuthors')
				.withIndex('by_source', (q) => q.eq('sourceId', source._id))
				.collect();

			const allAuthorIds = [source.authorId, ...sourceAuthors.map((sa) => sa.authorId)];
			const uniqueAuthorIds = Array.from(new Set(allAuthorIds));
			const allAuthors = await Promise.all(uniqueAuthorIds.map((authorId) => ctx.db.get(authorId)));

			// Get tags for the highlight (if any)
			const highlightTags = await ctx.db
				.query('highlightTags')
				.withIndex('by_highlight', (q) => q.eq('highlightId', highlight._id))
				.collect();

			const tagIds = highlightTags.map((ht) => ht.tagId);
			const tags = await Promise.all(tagIds.map((tagId) => ctx.db.get(tagId)));

			// Get tags for the source (if any)
			const sourceTags = await ctx.db
				.query('sourceTags')
				.withIndex('by_source', (q) => q.eq('sourceId', source._id))
				.collect();

			const sourceTagIds = sourceTags.map((st) => st.tagId);
			const sourceTagsData = await Promise.all(sourceTagIds.map((tagId) => ctx.db.get(tagId)));

			// Combine highlight and source tags (unique)
			const allTagIds = Array.from(new Set([...tagIds, ...sourceTagIds]));
			const allTagsData = await Promise.all(allTagIds.map((tagId) => ctx.db.get(tagId)));

			return {
				...item,
				highlight,
				source,
				author, // Primary author
				authors: allAuthors.filter((a) => a !== null), // All authors
				tags: allTagsData.filter((t) => t !== null)
			};
		}

		// For other types, just return the item
		return item;
	}
});

/**
 * Mark an inbox item as processed
 * This removes it from the inbox workflow (user has reviewed it)
 */
export const markProcessed = mutation({
	args: {
		inboxItemId: v.id('inboxItems')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const item = await ctx.db.get(args.inboxItemId);

		// Verify the item belongs to the user
		if (!item || item.userId !== userId) {
			throw new Error('Inbox item not found or access denied');
		}

		// Mark as processed
		await ctx.db.patch(args.inboxItemId, {
			processed: true,
			processedAt: Date.now()
		});

		return args.inboxItemId;
	}
});

/**
 * Query: Get sync progress for current user
 */
export const getSyncProgress = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return null;
		}

		const progress = await ctx.db
			.query('syncProgress')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.first();

		return progress
			? {
					step: progress.step,
					current: progress.current,
					total: progress.total,
					message: progress.message
				}
			: null;
	}
});

/**
 * Quick Create: Create a manual note and add to inbox
 */
export const createNoteInInbox = mutation({
	args: {
		text: v.string(),
		title: v.optional(v.string()),
		tagIds: v.optional(v.array(v.id('tags')))
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Create inbox item (manual_text type)
		const inboxItemId = await ctx.db.insert('inboxItems', {
			type: 'manual_text',
			userId,
			processed: false,
			createdAt: Date.now(),
			text: args.text,
			bookTitle: args.title
		});

		// TODO: Once notes table exists, create note entity and link it

		return { inboxItemId };
	}
});

/**
 * Quick Create: Create a flashcard and add to inbox
 */
export const createFlashcardInInbox = mutation({
	args: {
		question: v.string(),
		answer: v.string(),
		tagIds: v.optional(v.array(v.id('tags')))
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// 1. Create flashcard
		const flashcardId = await ctx.db.insert('flashcards', {
			userId,
			question: args.question,
			answer: args.answer,
			algorithm: 'fsrs',
			reps: 0,
			lapses: 0,
			createdAt: Date.now()
		});

		// 2. Create inbox item pointing to the flashcard content
		const inboxItemId = await ctx.db.insert('inboxItems', {
			type: 'manual_text',
			userId,
			processed: false,
			createdAt: Date.now(),
			text: `Q: ${args.question}\n\nA: ${args.answer}`,
			bookTitle: 'Flashcard'
		});

		// 3. Assign tags to flashcard if provided
		if (args.tagIds) {
			for (const tagId of args.tagIds) {
				await ctx.db.insert('flashcardTags', {
					flashcardId,
					tagId
				});
			}
		}

		return { flashcardId, inboxItemId };
	}
});

/**
 * Quick Create: Create a manual highlight and add to inbox
 */
export const createHighlightInInbox = mutation({
	args: {
		text: v.string(),
		sourceTitle: v.optional(v.string()),
		note: v.optional(v.string()),
		tagIds: v.optional(v.array(v.id('tags')))
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// 1. Get or create "Manual" source
		const manualSourceTitle = args.sourceTitle || 'Manual Entry';
		let source = await ctx.db
			.query('sources')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.filter((q) => q.eq(q.field('title'), manualSourceTitle))
			.first();

		if (!source) {
			// Create a placeholder author for manual entries
			let manualAuthor = await ctx.db
				.query('authors')
				.withIndex('by_user_name', (q) => q.eq('userId', userId).eq('name', 'manual'))
				.first();

			if (!manualAuthor) {
				const authorId = await ctx.db.insert('authors', {
					userId,
					name: 'manual',
					displayName: 'Manual Entry',
					createdAt: Date.now()
				});
				manualAuthor = await ctx.db.get(authorId);
			}

			// Create manual source
			const sourceId = await ctx.db.insert('sources', {
				userId,
				authorId: manualAuthor!._id,
				title: manualSourceTitle,
				category: 'manual',
				sourceType: 'manual',
				externalId: `manual_${Date.now()}`,
				numHighlights: 1,
				updatedAt: Date.now(),
				createdAt: Date.now()
			});
			source = await ctx.db.get(sourceId);
		}

		// 2. Create highlight
		const highlightId = await ctx.db.insert('highlights', {
			userId,
			sourceId: source!._id,
			text: args.text,
			note: args.note,
			externalId: `manual_${Date.now()}`,
			externalUrl: '',
			updatedAt: Date.now(),
			createdAt: Date.now()
		});

		// 3. Create inbox item
		const inboxItemId = await ctx.db.insert('inboxItems', {
			type: 'readwise_highlight',
			userId,
			processed: false,
			createdAt: Date.now(),
			highlightId
		});

		// 4. Assign tags if provided
		if (args.tagIds) {
			for (const tagId of args.tagIds) {
				await ctx.db.insert('highlightTags', {
					highlightId,
					tagId
				});
			}
		}

		return { highlightId, inboxItemId };
	}
});
