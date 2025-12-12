import { mutation } from '../../_generated/server';
import { v } from 'convex/values';

import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import {
	ensureCircleMembership,
	ensureTagAccess,
	ensureWorkspaceMembership,
	getActorFromSession,
	type ActorContext
} from './access';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';

type EntityType = 'highlights' | 'flashcards';
type EntityScope = { workspaceId: Id<'workspaces'>; circleId?: Id<'circles'> };

const ENTITY_CONFIG: Record<
	EntityType,
	{ label: string; notFound: ErrorCodes; accessDenied: ErrorCodes }
> = {
	highlights: {
		label: 'Highlight',
		notFound: ErrorCodes.HIGHLIGHT_NOT_FOUND,
		accessDenied: ErrorCodes.HIGHLIGHT_ACCESS_DENIED
	},
	flashcards: {
		label: 'Flashcard',
		notFound: ErrorCodes.FLASHCARD_NOT_FOUND,
		accessDenied: ErrorCodes.FLASHCARD_ACCESS_DENIED
	}
};

async function resolveEntityScope(
	ctx: MutationCtx,
	entityType: EntityType,
	entityId: Id<'highlights'> | Id<'flashcards'>,
	sessionId: string
): Promise<{ actor: ActorContext; scope: EntityScope }> {
	const config = ENTITY_CONFIG[entityType];
	const entity =
		entityType === 'highlights'
			? await ctx.db.get(entityId as Id<'highlights'>)
			: await ctx.db.get(entityId as Id<'flashcards'>);

	if (!entity) {
		throw createError(config.notFound, `${config.label} not found`);
	}

	if (!entity.workspaceId) {
		throw createError(ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED, 'Workspace is required');
	}

	const actor = await getActorFromSession(ctx, sessionId, entity.workspaceId);

	try {
		await ensureWorkspaceMembership(ctx, entity.workspaceId, actor.personId);
		if (entity.circleId) {
			await ensureCircleMembership(ctx, entity.circleId, actor.personId);
		}
	} catch (_err) {
		throw createError(config.accessDenied, `${config.label} not found or access denied`);
	}

	return {
		actor,
		scope: {
			workspaceId: entity.workspaceId,
			circleId: entity.circleId ?? undefined
		}
	};
}

async function assignTagsToEntity(
	ctx: MutationCtx,
	entityType: EntityType,
	entityId: Id<'highlights'> | Id<'flashcards'>,
	tagIds: Id<'tags'>[],
	sessionId: string
): Promise<void> {
	const { actor, scope } = await resolveEntityScope(ctx, entityType, entityId, sessionId);
	const tags = await Promise.all(tagIds.map((tagId) => ctx.db.get(tagId)));

	for (const tag of tags) {
		if (!tag) {
			throw createError(ErrorCodes.TAG_NOT_FOUND, 'One or more tags not found');
		}

		await ensureTagAccess(ctx, actor, tag);

		if (tag.workspaceId !== scope.workspaceId) {
			throw createError(ErrorCodes.TAG_ACCESS_DENIED, 'Tag belongs to a different workspace');
		}

		if (tag.circleId && tag.circleId !== scope.circleId) {
			throw createError(ErrorCodes.TAG_ACCESS_DENIED, 'Tag belongs to a different circle');
		}

		if (!tag.circleId && scope.circleId) {
			// Circle-scoped entities require circle-compatible tags
			throw createError(ErrorCodes.TAG_ACCESS_DENIED, 'Circle items require circle tags');
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
	return assignTagsToEntity(ctx, 'highlights', args.highlightId, args.tagIds, args.sessionId);
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
	return assignTagsToEntity(ctx, 'flashcards', args.flashcardId, args.tagIds, args.sessionId);
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
	const { actor, scope } = await resolveEntityScope(
		ctx,
		'highlights',
		args.highlightId,
		args.sessionId
	);

	const tag = await ctx.db.get(args.tagId);
	if (!tag) {
		throw createError(ErrorCodes.TAG_NOT_FOUND, 'Tag not found');
	}
	await ensureTagAccess(ctx, actor, tag);
	if (tag.workspaceId !== scope.workspaceId) {
		throw createError(ErrorCodes.TAG_ACCESS_DENIED, 'Tag belongs to a different workspace');
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
