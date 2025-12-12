import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const flashcardsTable = defineTable({
	userId: v.id('users'),
	question: v.string(),
	answer: v.string(),
	sourceInboxItemId: v.optional(v.id('inboxItems')),
	sourceType: v.optional(v.string()),
	workspaceId: v.optional(v.id('workspaces')),
	circleId: v.optional(v.id('circles')),
	ownershipType: v.optional(
		v.union(v.literal('user'), v.literal('workspace'), v.literal('circle'), v.literal('purchased'))
	),
	algorithm: v.string(),
	fsrsStability: v.optional(v.number()),
	fsrsDifficulty: v.optional(v.number()),
	fsrsDue: v.optional(v.number()),
	fsrsState: v.optional(
		v.union(v.literal('new'), v.literal('learning'), v.literal('review'), v.literal('relearning'))
	),
	reps: v.number(),
	lapses: v.number(),
	lastReviewAt: v.optional(v.number()),
	createdAt: v.number()
})
	.index('by_user', ['userId'])
	.index('by_user_algorithm', ['userId', 'algorithm'])
	.index('by_user_due', ['userId', 'algorithm', 'fsrsDue'])
	.index('by_source', ['sourceInboxItemId'])
	.index('by_workspace', ['workspaceId'])
	.index('by_circle', ['circleId']);

export const flashcardReviewsTable = defineTable({
	flashcardId: v.id('flashcards'),
	userId: v.id('users'),
	rating: v.union(v.literal('again'), v.literal('hard'), v.literal('good'), v.literal('easy')),
	algorithm: v.string(),
	reviewTime: v.optional(v.number()),
	reviewedAt: v.number(),
	fsrsLog: v.optional(
		v.object({
			stability: v.number(),
			difficulty: v.number(),
			scheduledDays: v.number(),
			elapsedDays: v.number()
		})
	)
})
	.index('by_flashcard', ['flashcardId'])
	.index('by_user', ['userId'])
	.index('by_user_reviewed', ['userId', 'reviewedAt']);

export const userAlgorithmSettingsTable = defineTable({
	userId: v.id('users'),
	defaultAlgorithm: v.string(),
	fsrsParams: v.optional(
		v.object({
			enableFuzz: v.optional(v.boolean()),
			maximumInterval: v.optional(v.number()),
			requestRetention: v.optional(v.number())
		})
	),
	createdAt: v.number(),
	updatedAt: v.number()
}).index('by_user', ['userId']);

export const flashcardTagsTable = defineTable({
	flashcardId: v.id('flashcards'),
	tagId: v.id('tags')
})
	.index('by_flashcard', ['flashcardId'])
	.index('by_tag', ['tagId'])
	.index('by_flashcard_tag', ['flashcardId', 'tagId']);
