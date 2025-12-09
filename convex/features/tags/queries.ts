import { query } from '../../_generated/server';
import { v } from 'convex/values';

import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import type { Doc, Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import { calculateTagTree } from './hierarchy';
import type { TagWithHierarchy } from './types';

type WorkspaceId = Id<'workspaces'>;

async function listTagsForUserWorkspace(
	ctx: QueryCtx,
	userId: Id<'users'>,
	workspaceId?: WorkspaceId
): Promise<Doc<'tags'>[]> {
	let tags: Doc<'tags'>[] = [];
	if (workspaceId) {
		tags = await ctx.db
			.query('tags')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();
		tags = tags.filter((tag) => !tag.workspaceId || tag.workspaceId === workspaceId);
	} else {
		tags = await ctx.db
			.query('tags')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();
	}
	return tags;
}

export const listAllTags = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.optional(v.id('workspaces'))
	},
	handler: async (ctx, args): Promise<TagWithHierarchy[]> => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const tags = await listTagsForUserWorkspace(ctx, userId, args.workspaceId);
		return calculateTagTree(tags);
	}
});

export const listUserTags = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.optional(v.id('workspaces'))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const tags = await listTagsForUserWorkspace(ctx, userId, args.workspaceId);
		return tags.map((tag) => ({
			_id: tag._id,
			displayName: tag.displayName ?? tag.name,
			color: tag.color,
			ownershipType: tag.ownershipType ?? undefined,
			workspaceId: tag.workspaceId ?? undefined,
			circleId: tag.circleId ?? undefined,
			userId: tag.userId,
			createdAt: tag.createdAt
		}));
	}
});

export async function listTagsForEntity(
	ctx: QueryCtx,
	entity: 'highlights' | 'flashcards',
	entityId: Id<'highlights'> | Id<'flashcards'>,
	sessionId: string
) {
	await validateSessionAndGetUserId(ctx, sessionId);

	const assignments =
		entity === 'highlights'
			? await ctx.db
					.query('highlightTags')
					.withIndex('by_highlight', (q) => q.eq('highlightId', entityId as Id<'highlights'>))
					.collect()
			: await ctx.db
					.query('flashcardTags')
					.withIndex('by_flashcard', (q) => q.eq('flashcardId', entityId as Id<'flashcards'>))
					.collect();

	const tagIds = assignments.map((assignment) => assignment.tagId);
	const tags = await Promise.all(tagIds.map((tagId) => ctx.db.get(tagId)));
	return tags.filter((t): t is NonNullable<typeof t> => t !== null);
}

export const listTagsForHighlight = query({
	args: {
		sessionId: v.string(),
		highlightId: v.id('highlights')
	},
	handler: (ctx, args) => listTagsForEntity(ctx, 'highlights', args.highlightId, args.sessionId)
});

export const listTagsForFlashcard = query({
	args: {
		sessionId: v.string(),
		flashcardId: v.id('flashcards')
	},
	handler: (ctx, args) => listTagsForEntity(ctx, 'flashcards', args.flashcardId, args.sessionId)
});

export async function getTagItemCountHandler(
	ctx: QueryCtx,
	args: { sessionId: string; tagId: Id<'tags'> }
) {
	await validateSessionAndGetUserId(ctx, args.sessionId);

	const highlightAssignments = await ctx.db
		.query('highlightTags')
		.withIndex('by_tag', (q) => q.eq('tagId', args.tagId))
		.collect();

	const flashcardCount = 0;

	return {
		highlights: highlightAssignments.length,
		flashcards: flashcardCount,
		total: highlightAssignments.length + flashcardCount
	};
}

export const getTagItemCount = query({
	args: {
		sessionId: v.string(),
		tagId: v.id('tags')
	},
	handler: getTagItemCountHandler
});
