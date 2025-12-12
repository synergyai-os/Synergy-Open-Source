import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const inboxItemsTable = defineTable(
	v.union(
		v.object({
			type: v.literal('readwise_highlight'),
			personId: v.id('people'),
			processed: v.boolean(),
			processedAt: v.optional(v.number()),
			createdAt: v.number(),
			highlightId: v.id('highlights'),
			workspaceId: v.optional(v.id('workspaces')),
			circleId: v.optional(v.id('circles')),
			ownershipType: v.optional(
				v.union(
					v.literal('user'),
					v.literal('workspace'),
					v.literal('circle'),
					v.literal('purchased')
				)
			)
		}),
		v.object({
			type: v.literal('photo_note'),
			personId: v.id('people'),
			processed: v.boolean(),
			processedAt: v.optional(v.number()),
			createdAt: v.number(),
			imageFileId: v.id('_storage'),
			transcribedText: v.optional(v.string()),
			source: v.optional(v.string()),
			ocrStatus: v.optional(
				v.union(v.literal('pending'), v.literal('completed'), v.literal('failed'))
			),
			workspaceId: v.optional(v.id('workspaces')),
			circleId: v.optional(v.id('circles')),
			ownershipType: v.optional(
				v.union(
					v.literal('user'),
					v.literal('workspace'),
					v.literal('circle'),
					v.literal('purchased')
				)
			)
		}),
		v.object({
			type: v.literal('manual_text'),
			personId: v.id('people'),
			processed: v.boolean(),
			processedAt: v.optional(v.number()),
			createdAt: v.number(),
			text: v.string(),
			bookTitle: v.optional(v.string()),
			pageNumber: v.optional(v.number()),
			workspaceId: v.optional(v.id('workspaces')),
			circleId: v.optional(v.id('circles')),
			ownershipType: v.optional(
				v.union(
					v.literal('user'),
					v.literal('workspace'),
					v.literal('circle'),
					v.literal('purchased')
				)
			)
		}),
		v.object({
			type: v.literal('note'),
			personId: v.id('people'),
			processed: v.boolean(),
			processedAt: v.optional(v.number()),
			createdAt: v.number(),
			updatedAt: v.optional(v.number()),
			title: v.optional(v.string()),
			content: v.string(),
			contentMarkdown: v.optional(v.string()),
			isAIGenerated: v.optional(v.boolean()),
			aiGeneratedAt: v.optional(v.number()),
			embeddings: v.optional(
				v.array(
					v.object({
						type: v.string(),
						url: v.string(),
						metadata: v.optional(v.any())
					})
				)
			),
			blogCategory: v.optional(v.string()),
			publishedTo: v.optional(v.string()),
			slug: v.optional(v.string()),
			workspaceId: v.optional(v.id('workspaces')),
			circleId: v.optional(v.id('circles')),
			ownershipType: v.optional(
				v.union(
					v.literal('user'),
					v.literal('workspace'),
					v.literal('circle'),
					v.literal('purchased')
				)
			)
		})
	)
)
	.index('by_person', ['personId'])
	.index('by_person_type', ['personId', 'type'])
	.index('by_person_processed', ['personId', 'processed'])
	.index('by_workspace', ['workspaceId'])
	.index('by_circle', ['circleId']);
