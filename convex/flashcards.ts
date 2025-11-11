import { query, mutation, action } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { getAuthUserId } from './auth';
import { createEmptyCard, fsrs, Rating, State, type Card } from 'ts-fsrs';
import { loadPrompt } from './promptUtils';
import { getTagDescendantsForTags } from './tags';
import type { Id } from './_generated/dataModel';

/**
 * Convert FSRS State enum to lowercase string for database storage
 */
function stateToString(state: State): 'new' | 'learning' | 'review' | 'relearning' {
	switch (state) {
		case State.New:
			return 'new';
		case State.Learning:
			return 'learning';
		case State.Review:
			return 'review';
		case State.Relearning:
			return 'relearning';
		default:
			return 'new';
	}
}

/**
 * Convert lowercase string to FSRS State enum
 */
function stringToState(state: string): State {
	switch (state) {
		case 'new':
			return State.New;
		case 'learning':
			return State.Learning;
		case 'review':
			return State.Review;
		case 'relearning':
			return State.Relearning;
		default:
			return State.New;
	}
}

/**
 * Create a new flashcard from AI-generated content
 */
export const createFlashcard = mutation({
	args: {
		question: v.string(),
		answer: v.string(),
		sourceInboxItemId: v.optional(v.id('inboxItems')),
		sourceType: v.optional(v.string()),
		tagIds: v.optional(v.array(v.id('tags')))
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Get user's algorithm settings (default to FSRS)
		const settings = await ctx.db
			.query('userAlgorithmSettings')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.first();

		const algorithm = settings?.defaultAlgorithm || 'fsrs';

		// Initialize FSRS card
		const fsrsCard = createEmptyCard(new Date());
		const f = fsrs();

		// Get scheduling for "new" card (we'll use Good rating as default for new cards)
		const scheduling = f.repeat(fsrsCard, new Date());
		const newCardState = scheduling[Rating.Good].card;

		// Create flashcard in database
		const flashcardId = await ctx.db.insert('flashcards', {
			userId,
			question: args.question,
			answer: args.answer,
			sourceInboxItemId: args.sourceInboxItemId,
			sourceType: args.sourceType,
			algorithm,
			fsrsStability: newCardState.stability,
			fsrsDifficulty: newCardState.difficulty,
			fsrsDue: newCardState.due.getTime(), // Convert Date to timestamp
			fsrsState: stateToString(newCardState.state),
			reps: newCardState.reps,
			lapses: newCardState.lapses,
			lastReviewAt: newCardState.last_review?.getTime(),
			createdAt: Date.now()
		});

		// Add tags if provided
		if (args.tagIds && args.tagIds.length > 0) {
			for (const tagId of args.tagIds) {
				await ctx.db.insert('flashcardTags', {
					flashcardId,
					tagId
				});
			}
		}

		return flashcardId;
	}
});

/**
 * Create multiple flashcards (batch operation)
 */
export const createFlashcards = mutation({
	args: {
		flashcards: v.array(
			v.object({
				question: v.string(),
				answer: v.string()
			})
		),
		sourceInboxItemId: v.optional(v.id('inboxItems')),
		sourceType: v.optional(v.string()),
		tagIds: v.optional(v.array(v.id('tags')))
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Get user's algorithm settings
		const settings = await ctx.db
			.query('userAlgorithmSettings')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.first();

		const algorithm = settings?.defaultAlgorithm || 'fsrs';
		const f = fsrs();
		const now = new Date();

		const flashcardIds: string[] = [];

		// Create each flashcard
		for (const flashcard of args.flashcards) {
			const fsrsCard = createEmptyCard(now);
			const scheduling = f.repeat(fsrsCard, now);
			const newCardState = scheduling[Rating.Good].card;

			const flashcardId = await ctx.db.insert('flashcards', {
				userId,
				question: flashcard.question,
				answer: flashcard.answer,
				sourceInboxItemId: args.sourceInboxItemId,
				sourceType: args.sourceType,
				algorithm,
				fsrsStability: newCardState.stability,
				fsrsDifficulty: newCardState.difficulty,
				fsrsDue: newCardState.due.getTime(),
				fsrsState: stateToString(newCardState.state),
				reps: newCardState.reps,
				lapses: newCardState.lapses,
				lastReviewAt: newCardState.last_review?.getTime(),
				createdAt: Date.now()
			});

			flashcardIds.push(flashcardId);

			// Add tags if provided
			if (args.tagIds && args.tagIds.length > 0) {
				for (const tagId of args.tagIds) {
					await ctx.db.insert('flashcardTags', {
						flashcardId,
						tagId
					});
				}
			}
		}

		return flashcardIds;
	}
});

/**
 * Review a flashcard (update FSRS state based on rating)
 */
export const reviewFlashcard = mutation({
	args: {
		flashcardId: v.id('flashcards'),
		rating: v.union(v.literal('again'), v.literal('hard'), v.literal('good'), v.literal('easy')),
		reviewTime: v.optional(v.number()) // Time spent in seconds
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Get flashcard
		const flashcard = await ctx.db.get(args.flashcardId);
		if (!flashcard) {
			throw new Error('Flashcard not found');
		}

		if (flashcard.userId !== userId) {
			throw new Error('Not authorized');
		}

		if (flashcard.algorithm !== 'fsrs') {
			throw new Error(`Algorithm ${flashcard.algorithm} not yet supported`);
		}

		// Convert FSRS rating string to enum
		const ratingMap: Record<string, Rating> = {
			again: Rating.Again,
			hard: Rating.Hard,
			good: Rating.Good,
			easy: Rating.Easy
		};

		const fsrsRating = ratingMap[args.rating];
		if (!fsrsRating) {
			throw new Error(`Invalid rating: ${args.rating}`);
		}

		// Reconstruct FSRS card from database state
		const fsrsCard: Card = {
			due: flashcard.fsrsDue ? new Date(flashcard.fsrsDue) : new Date(),
			stability: flashcard.fsrsStability || 0,
			difficulty: flashcard.fsrsDifficulty || 0,
			elapsed_days: flashcard.lastReviewAt
				? Math.floor((Date.now() - flashcard.lastReviewAt) / (1000 * 60 * 60 * 24))
				: 0,
			scheduled_days: 0,
			learning_steps: 0,
			reps: flashcard.reps,
			lapses: flashcard.lapses,
			state: stringToState(flashcard.fsrsState || 'new'),
			last_review: flashcard.lastReviewAt ? new Date(flashcard.lastReviewAt) : undefined
		};

		// Get FSRS scheduler
		const f = fsrs();
		const now = new Date();
		const scheduling = f.repeat(fsrsCard, now);
		const result = scheduling[fsrsRating];

		// Update flashcard with new FSRS state
		await ctx.db.patch(args.flashcardId, {
			fsrsStability: result.card.stability,
			fsrsDifficulty: result.card.difficulty,
			fsrsDue: result.card.due.getTime(),
			fsrsState: stateToString(result.card.state),
			reps: result.card.reps,
			lapses: result.card.lapses,
			lastReviewAt: now.getTime()
		});

		// Create review record
		await ctx.db.insert('flashcardReviews', {
			flashcardId: args.flashcardId,
			userId,
			rating: args.rating,
			algorithm: flashcard.algorithm,
			reviewTime: args.reviewTime,
			reviewedAt: now.getTime(),
			fsrsLog: {
				stability: result.log.stability,
				difficulty: result.log.difficulty,
				scheduledDays: result.log.scheduled_days,
				elapsedDays: result.log.elapsed_days
			}
		});

		return {
			success: true,
			nextDue: result.card.due.getTime()
		};
	}
});

/**
 * Update flashcard question and answer
 */
export const updateFlashcard = mutation({
	args: {
		flashcardId: v.id('flashcards'),
		question: v.optional(v.string()),
		answer: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const flashcard = await ctx.db.get(args.flashcardId);
		if (!flashcard) {
			throw new Error('Flashcard not found');
		}

		if (flashcard.userId !== userId) {
			throw new Error('Not authorized');
		}

		const updates: {
			question?: string;
			answer?: string;
		} = {};

		if (args.question !== undefined) {
			updates.question = args.question;
		}

		if (args.answer !== undefined) {
			updates.answer = args.answer;
		}

		await ctx.db.patch(args.flashcardId, updates);

		return { success: true };
	}
});

/**
 * Delete a flashcard
 */
export const deleteFlashcard = mutation({
	args: {
		flashcardId: v.id('flashcards')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const flashcard = await ctx.db.get(args.flashcardId);
		if (!flashcard) {
			throw new Error('Flashcard not found');
		}

		if (flashcard.userId !== userId) {
			throw new Error('Not authorized');
		}

		// Delete flashcard-tag relationships
		const flashcardTags = await ctx.db
			.query('flashcardTags')
			.withIndex('by_flashcard', (q) => q.eq('flashcardId', args.flashcardId))
			.collect();

		for (const ft of flashcardTags) {
			await ctx.db.delete(ft._id);
		}

		// Delete flashcard reviews
		const reviews = await ctx.db
			.query('flashcardReviews')
			.withIndex('by_flashcard', (q) => q.eq('flashcardId', args.flashcardId))
			.collect();

		for (const review of reviews) {
			await ctx.db.delete(review._id);
		}

		// Delete flashcard
		await ctx.db.delete(args.flashcardId);

		return { success: true };
	}
});

/**
 * Get flashcards due for review
 */
export const getDueFlashcards = query({
	args: {
		limit: v.optional(v.number()),
		algorithm: v.optional(v.string()),
		tagIds: v.optional(v.array(v.id('tags')))
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const algorithm = args.algorithm || 'fsrs';
		const limit = args.limit || 10;
		const now = Date.now();

		// Query due cards
		let dueCards = await ctx.db
			.query('flashcards')
			.withIndex('by_user_due', (q) =>
				q.eq('userId', userId).eq('algorithm', algorithm).lte('fsrsDue', now)
			)
			.order('asc')
			.take(limit * 2); // Get more than needed in case we filter by tags

		// Filter by tags if provided
		if (args.tagIds && args.tagIds.length > 0) {
			// Get all descendant tag IDs (including the selected tags themselves)
			const allTagIds = await getTagDescendantsForTags(ctx, args.tagIds, userId);

			// Get all flashcard-tag relationships for these tags
			const flashcardTagRelations = await Promise.all(
				allTagIds.map((tagId) =>
					ctx.db
						.query('flashcardTags')
						.withIndex('by_tag', (q) => q.eq('tagId', tagId))
						.collect()
				)
			);

			// Create a set of flashcard IDs that have at least one of the selected tags
			const validFlashcardIds = new Set<Id<'flashcards'>>();
			for (const relations of flashcardTagRelations) {
				for (const relation of relations) {
					validFlashcardIds.add(relation.flashcardId);
				}
			}

			// Filter due cards to only include those with matching tags
			dueCards = dueCards.filter((card) => validFlashcardIds.has(card._id));
		}

		// Limit to requested amount
		return dueCards.slice(0, limit);
	}
});

/**
 * Get all flashcards for a user
 */
export const getUserFlashcards = query({
	args: {
		tagIds: v.optional(v.array(v.id('tags')))
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		let flashcards = await ctx.db
			.query('flashcards')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();

		// Filter by tags if provided
		if (args.tagIds && args.tagIds.length > 0) {
			// Get all descendant tag IDs (including the selected tags themselves)
			const allTagIds = await getTagDescendantsForTags(ctx, args.tagIds, userId);

			// Get all flashcard-tag relationships for these tags
			const flashcardTagRelations = await Promise.all(
				allTagIds.map((tagId) =>
					ctx.db
						.query('flashcardTags')
						.withIndex('by_tag', (q) => q.eq('tagId', tagId))
						.collect()
				)
			);

			// Create a set of flashcard IDs that have at least one of the selected tags
			const validFlashcardIds = new Set<Id<'flashcards'>>();
			for (const relations of flashcardTagRelations) {
				for (const relation of relations) {
					validFlashcardIds.add(relation.flashcardId);
				}
			}

			// Filter flashcards to only include those with matching tags
			flashcards = flashcards.filter((card) => validFlashcardIds.has(card._id));
		}

		return flashcards;
	}
});

/**
 * Get flashcards grouped by collections (tags)
 * Returns collections with card counts and due counts
 */
export const getFlashcardsByCollection = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Get all user tags
		const tags = await ctx.db
			.query('tags')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();

		// Get all flashcards
		const flashcards = await ctx.db
			.query('flashcards')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();

		// Get all flashcard-tag relationships
		const flashcardTags = await ctx.db.query('flashcardTags').collect();

		// Create a map of tagId -> flashcardIds
		const tagToFlashcards = new Map<Id<'tags'>, Set<Id<'flashcards'>>>();
		for (const ft of flashcardTags) {
			// Verify flashcard belongs to user
			const flashcard = flashcards.find((f) => f._id === ft.flashcardId);
			if (!flashcard || flashcard.userId !== userId) continue;

			if (!tagToFlashcards.has(ft.tagId)) {
				tagToFlashcards.set(ft.tagId, new Set());
			}
			tagToFlashcards.get(ft.tagId)!.add(ft.flashcardId);
		}

		// Build collection data
		const now = Date.now();
		const collections = tags.map((tag) => {
			const flashcardIds = tagToFlashcards.get(tag._id) || new Set();
			const collectionFlashcards = flashcards.filter((f) => flashcardIds.has(f._id));
			const dueCount = collectionFlashcards.filter((f) => f.fsrsDue && f.fsrsDue <= now).length;

			return {
				tagId: tag._id,
				name: tag.displayName,
				color: tag.color,
				count: collectionFlashcards.length,
				dueCount
			};
		});

		// Sort by count (descending), then by name
		collections.sort((a, b) => {
			if (b.count !== a.count) return b.count - a.count;
			return a.name.localeCompare(b.name);
		});

		return collections;
	}
});

/**
 * Get a single flashcard by ID
 */
export const getFlashcard = query({
	args: {
		flashcardId: v.id('flashcards')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const flashcard = await ctx.db.get(args.flashcardId);
		if (!flashcard) {
			return null;
		}

		if (flashcard.userId !== userId) {
			throw new Error('Not authorized');
		}

		return flashcard;
	}
});

/**
 * Get tags for a flashcard
 */
export const getFlashcardTags = query({
	args: {
		flashcardId: v.id('flashcards')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Verify flashcard belongs to user
		const flashcard = await ctx.db.get(args.flashcardId);
		if (!flashcard || flashcard.userId !== userId) {
			throw new Error('Not authorized');
		}

		// Get flashcard-tag relationships
		const flashcardTags = await ctx.db
			.query('flashcardTags')
			.withIndex('by_flashcard', (q) => q.eq('flashcardId', args.flashcardId))
			.collect();

		// Get tag details
		const tags = await Promise.all(flashcardTags.map((ft) => ctx.db.get(ft.tagId)));

		// Filter out null tags and return
		return tags.filter((t): t is NonNullable<typeof t> => t !== null);
	}
});

/**
 * Generate flashcards from text input using Claude API
 */
export const generateFlashcard = action({
	args: {
		text: v.string(),
		sourceTitle: v.optional(v.string()),
		sourceAuthor: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Get encrypted API key using internal query from settings
		const keys: { claudeApiKey: string | null; readwiseApiKey: string | null } | null =
			await ctx.runQuery(internal.settings.getEncryptedKeysInternal, {});

		if (!keys?.claudeApiKey) {
			throw new Error('Claude API key not configured. Please add your API key in Settings.');
		}

		// Decrypt API key using cryptoActions (which has "use node")
		const apiKey: string = await ctx.runAction(internal.cryptoActions.decryptApiKey, {
			encryptedApiKey: keys.claudeApiKey
		});

		// Load prompt template with variables
		const prompt = loadPrompt('flashcard-generation', {
			text: args.text,
			source: {
				title: args.sourceTitle,
				author: args.sourceAuthor
			}
		});

		try {
			const response: Response = await fetch('https://api.anthropic.com/v1/messages', {
				method: 'POST',
				headers: {
					'x-api-key': apiKey,
					'anthropic-version': '2023-06-01',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					model: 'claude-3-haiku-20240307',
					max_tokens: 500,
					messages: [
						{
							role: 'user',
							content: prompt
						}
					]
				})
			});

			if (!response.ok) {
				const errorBody = await response.text();
				let errorMessage = `Claude API error: ${response.status} ${response.statusText}`;
				try {
					const errorJson = JSON.parse(errorBody);
					errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
				} catch {
					if (errorBody) {
						errorMessage = errorBody.length > 200 ? errorBody.substring(0, 200) + '...' : errorBody;
					}
				}
				throw new Error(errorMessage);
			}

			const data: {
				content?: Array<{ text?: string }>;
			} = await response.json();
			const content: string = data.content?.[0]?.text || '';

			// Try to parse JSON from response
			let flashcards: Array<{ question: string; answer: string }>;
			try {
				// Extract JSON from response (might have markdown code blocks)
				const jsonMatch = content.match(/\[[\s\S]*\]/);
				if (jsonMatch) {
					flashcards = JSON.parse(jsonMatch[0]);
					// Ensure it's an array
					if (!Array.isArray(flashcards)) {
						flashcards = [flashcards];
					}
				} else {
					// Try single object format
					const objMatch = content.match(/\{[\s\S]*\}/);
					if (objMatch) {
						const singleCard = JSON.parse(objMatch[0]);
						flashcards = [singleCard];
					} else {
						throw new Error('No JSON found in response');
					}
				}
			} catch (parseError) {
				// If parsing fails, return a single flashcard with raw content
				flashcards = [
					{
						question: 'Generated Question',
						answer: content
					}
				];
			}

			return {
				success: true,
				flashcards,
				rawResponse: content
			};
		} catch (error) {
			throw new Error(
				`Failed to generate flashcard: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}
});
