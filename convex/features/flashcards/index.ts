import { query, mutation } from '../../_generated/server';
import { v } from 'convex/values';
import type { Query } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';

import { requireUserId } from './auth';
import {
	createFlashcardForUser,
	createFlashcardsForUser,
	updateFlashcardContent,
	archiveFlashcardForUser
} from './lifecycle';
import { fetchFlashcardsFromSource } from './importFlashcards';
import { listDueFlashcards, listUserFlashcards, listCollections } from './queries';
import { findFlashcard, findFlashcardTags } from './lookups';
import { reviewFlashcard } from './review';

/**
 * Create a single flashcard
 */
export const createFlashcard = mutation({
	args: {
		sessionId: v.string(),
		question: v.string(),
		answer: v.string(),
		sourceInboxItemId: v.optional(v.id('inboxItems')),
		sourceType: v.optional(v.string()),
		tagIds: v.optional(v.array(v.id('tags')))
	},
	handler: async (ctx, args): Promise<Id<'flashcards'>> => createFlashcardForUser(ctx, args)
});

/**
 * Create multiple flashcards (batch operation)
 */
export const createFlashcards = mutation({
	args: {
		sessionId: v.string(),
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
	handler: async (ctx, args): Promise<Id<'flashcards'>[]> =>
		createFlashcardsForUser(ctx, args, args.flashcards)
});

/**
 * Review a flashcard (update FSRS state based on rating)
 */
export const updateFlashcardReview = mutation({
	args: {
		sessionId: v.string(),
		flashcardId: v.id('flashcards'),
		rating: v.union(v.literal('again'), v.literal('hard'), v.literal('good'), v.literal('easy')),
		reviewTime: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx, args.sessionId);
		return reviewFlashcard(ctx, { ...args, userId });
	}
});

/**
 * Update flashcard question and answer
 */
export const updateFlashcard = mutation({
	args: {
		sessionId: v.string(),
		flashcardId: v.id('flashcards'),
		question: v.optional(v.string()),
		answer: v.optional(v.string())
	},
	handler: async (ctx, args) => updateFlashcardContent(ctx, args)
});

/**
 * Delete a flashcard
 */
export const archiveFlashcard = mutation({
	args: {
		sessionId: v.string(),
		flashcardId: v.id('flashcards')
	},
	handler: async (ctx, args) => archiveFlashcardForUser(ctx, args)
});

/**
 * Get flashcards due for review
 */
export const getDueFlashcards = query({
	args: {
		sessionId: v.string(),
		limit: v.optional(v.number()),
		algorithm: v.optional(v.string()),
		tagIds: v.optional(v.array(v.id('tags')))
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx, args.sessionId);
		const limit = args.limit ?? 10;
		const algorithm = args.algorithm ?? 'fsrs';
		return listDueFlashcards(ctx, userId, limit, algorithm, args.tagIds ?? undefined);
	}
});

/**
 * Get all flashcards for a user
 */
export const getUserFlashcards = query({
	args: {
		sessionId: v.string(),
		tagIds: v.optional(v.array(v.id('tags')))
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx, args.sessionId);
		return listUserFlashcards(ctx, userId, args.tagIds ?? undefined);
	}
});

/**
 * Get flashcards grouped by collections (tags)
 */
type FlashcardCollection = {
	tagId: Id<'tags'>;
	name: string;
	color: string;
	count: number;
	dueCount: number;
};

export const listFlashcardsByCollection: Query<{ sessionId: string }, FlashcardCollection[]> =
	query({
		args: {
			sessionId: v.string()
		},
		handler: async (ctx, args) => {
			const userId = await requireUserId(ctx, args.sessionId);
			return listCollections(ctx, userId);
		}
	});

/**
 * Get a single flashcard by ID
 */
export { findFlashcard, findFlashcardTags, fetchFlashcardsFromSource };
