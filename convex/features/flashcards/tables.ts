import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const flashcardsTable = defineTable({
	personId: v.id('people'),
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
	.index('by_person', ['personId'])
	.index('by_person_algorithm', ['personId', 'algorithm'])
	.index('by_person_due', ['personId', 'algorithm', 'fsrsDue'])
	.index('by_source', ['sourceInboxItemId'])
	.index('by_workspace', ['workspaceId'])
	.index('by_circle', ['circleId']);

export const flashcardReviewsTable = defineTable({
	flashcardId: v.id('flashcards'),
	personId: v.id('people'),
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
	.index('by_person', ['personId'])
	.index('by_person_reviewed', ['personId', 'reviewedAt']);

export const userAlgorithmSettingsTable = defineTable({
	personId: v.id('people'),
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
}).index('by_person', ['personId']);

export const flashcardTagsTable = defineTable({
	flashcardId: v.id('flashcards'),
	tagId: v.id('tags')
})
	.index('by_flashcard', ['flashcardId'])
	.index('by_tag', ['tagId'])
	.index('by_flashcard_tag', ['flashcardId', 'tagId']);
