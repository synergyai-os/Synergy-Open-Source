import { mutation } from '../../_generated/server';
import { v } from 'convex/values';

import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { canAccessContent } from '../../permissions';

export async function assignTagsToEntity(
	ctx: MutationCtx,
	userId: Id<'users'>,
	entityType: 'highlights' | 'flashcards',
	entityId: Id<'highlights'> | Id<'flashcards'>,
	tagIds: Id<'tags'>[]
): Promise<void> {
	const entityLabel = entityType === 'highlights' ? 'Highlight' : 'Flashcard';
	const notFoundCode =
		entityType === 'highlights' ? ErrorCodes.HIGHLIGHT_NOT_FOUND : ErrorCodes.FLASHCARD_NOT_FOUND;
	const accessDeniedCode =
		entityType === 'highlights'
			? ErrorCodes.HIGHLIGHT_ACCESS_DENIED
			: ErrorCodes.FLASHCARD_ACCESS_DENIED;
	const entity =
		entityType === 'highlights'
			? await ctx.db.get(entityId as Id<'highlights'>)
			: await ctx.db.get(entityId as Id<'flashcards'>);
	if (!entity) {
		throw createError(notFoundCode, `${entityLabel} not found`);
	}
	if (!('userId' in entity) || entity.userId !== userId) {
		throw createError(accessDeniedCode, `${entityLabel} not found or access denied`);
	}

	const tags = await Promise.all(tagIds.map((tagId) => ctx.db.get(tagId)));
	for (const tag of tags) {
		if (!tag) {
			throw createError(ErrorCodes.TAG_NOT_FOUND, 'One or more tags not found');
		}
		if (tag.userId !== userId) {
			const hasAccess = await canAccessContent(ctx, userId, {
				userId: tag.userId,
				workspaceId: tag.workspaceId ?? undefined,
				circleId: tag.circleId ?? undefined
			});
			if (!hasAccess) {
				throw createError(ErrorCodes.TAG_ACCESS_DENIED, 'One or more tags are not accessible');
			}
		}
	}

	const existingAssignments =
		entityType === 'highlights'
			? await ctx.db
					.query('highlightTags')
					.withIndex('by_highlight', (q) => q.eq('highlightId', entityId as Id<'highlights'>))
					.collect()
			: await ctx.db
					.query('flashcardTags')
					.withIndex('by_flashcard', (q) => q.eq('flashcardId', entityId as Id<'flashcards'>))
					.collect();

	for (const assignment of existingAssignments) {
		await ctx.db.delete(assignment._id);
	}

	for (const tagId of tagIds) {
		if (entityType === 'highlights') {
			await ctx.db.insert('highlightTags', {
				highlightId: entityId as Id<'highlights'>,
				tagId
			});
		} else {
			await ctx.db.insert('flashcardTags', {
				flashcardId: entityId as Id<'flashcards'>,
				tagId
			});
		}
	}
}

export async function updateHighlightTagAssignmentsHandler(
	ctx: MutationCtx,
	args: {
		sessionId: string;
		highlightId: Id<'highlights'>;
		tagIds: Id<'tags'>[];
	}
): Promise<void> {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	return assignTagsToEntity(ctx, userId, 'highlights', args.highlightId, args.tagIds);
}

export const updateHighlightTagAssignments = mutation({
	args: {
		sessionId: v.string(),
		highlightId: v.id('highlights'),
		tagIds: v.array(v.id('tags'))
	},
	handler: updateHighlightTagAssignmentsHandler
});

export async function updateFlashcardTagAssignmentsHandler(
	ctx: MutationCtx,
	args: {
		sessionId: string;
		flashcardId: Id<'flashcards'>;
		tagIds: Id<'tags'>[];
	}
): Promise<void> {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	return assignTagsToEntity(ctx, userId, 'flashcards', args.flashcardId, args.tagIds);
}

export const updateFlashcardTagAssignments = mutation({
	args: {
		sessionId: v.string(),
		flashcardId: v.id('flashcards'),
		tagIds: v.array(v.id('tags'))
	},
	handler: updateFlashcardTagAssignmentsHandler
});

export async function archiveHighlightTagAssignmentHandler(
	ctx: MutationCtx,
	args: { sessionId: string; highlightId: Id<'highlights'>; tagId: Id<'tags'> }
): Promise<Id<'tags'>> {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const highlight = await ctx.db.get(args.highlightId);
	if (!highlight || highlight.userId !== userId) {
		throw createError(ErrorCodes.HIGHLIGHT_ACCESS_DENIED, 'Highlight not found or access denied');
	}

	const assignment = await ctx.db
		.query('highlightTags')
		.withIndex('by_highlight_tag', (q) =>
			q.eq('highlightId', args.highlightId).eq('tagId', args.tagId)
		)
		.first();

	if (assignment) {
		await ctx.db.delete(assignment._id);
	}

	return args.tagId;
}

export const archiveHighlightTagAssignment = mutation({
	args: {
		sessionId: v.string(),
		highlightId: v.id('highlights'),
		tagId: v.id('tags')
	},
	handler: archiveHighlightTagAssignmentHandler
});
