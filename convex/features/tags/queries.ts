import { query } from '../../_generated/server';
import { v } from 'convex/values';

import type { Doc, Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { calculateTagTree } from './hierarchy';
import type { TagWithHierarchy } from './types';
import {
	ensureCircleMembership,
	ensureTagAccess,
	ensureWorkspaceMembership,
	getActorFromSession,
	listCircleIdsForPerson,
	type ActorContext
} from './access';

type WorkspaceId = Id<'workspaces'>;
type EntityType = 'highlights' | 'flashcards';
type EntityScope = { workspaceId: WorkspaceId; circleId?: Id<'circles'> };

async function listAccessibleTags(ctx: QueryCtx, actor: ActorContext): Promise<Doc<'tags'>[]> {
	const circleIds = await listCircleIdsForPerson(ctx, actor.personId);

	const personal = await ctx.db
		.query('tags')
		.withIndex('by_person', (q) => q.eq('personId', actor.personId))
		.collect();

	const workspaceScoped = await ctx.db
		.query('tags')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', actor.workspaceId))
		.collect();

	const accessible = new Map<Id<'tags'>, Doc<'tags'>>();

	for (const tag of personal) {
		if (tag.workspaceId === actor.workspaceId) {
			accessible.set(tag._id, tag);
		}
	}

	for (const tag of workspaceScoped) {
		if (tag.ownershipType === 'workspace' && tag.workspaceId === actor.workspaceId) {
			accessible.set(tag._id, tag);
		}

		if (
			tag.ownershipType === 'circle' &&
			tag.circleId &&
			tag.workspaceId === actor.workspaceId &&
			circleIds.includes(tag.circleId)
		) {
			accessible.set(tag._id, tag);
		}
	}

	return Array.from(accessible.values());
}

async function resolveEntityScope(
	ctx: QueryCtx,
	entityType: EntityType,
	entityId: Id<'highlights'> | Id<'flashcards'>,
	sessionId: string
): Promise<{ actor: ActorContext; scope: EntityScope }> {
	const entity =
		entityType === 'highlights'
			? await ctx.db.get(entityId as Id<'highlights'>)
			: await ctx.db.get(entityId as Id<'flashcards'>);

	if (!entity) {
		throw createError(
			entityType === 'highlights' ? ErrorCodes.HIGHLIGHT_NOT_FOUND : ErrorCodes.FLASHCARD_NOT_FOUND,
			`${entityType === 'highlights' ? 'Highlight' : 'Flashcard'} not found`
		);
	}

	if (!entity.workspaceId) {
		throw createError(ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED, 'Workspace is required');
	}

	const actor = await getActorFromSession(ctx, sessionId, entity.workspaceId);
	await ensureWorkspaceMembership(ctx, entity.workspaceId, actor.personId);
	if (entity.circleId) {
		await ensureCircleMembership(ctx, entity.circleId, actor.personId);
	}

	return {
		actor,
		scope: { workspaceId: entity.workspaceId, circleId: entity.circleId ?? undefined }
	};
}

export const listAllTags = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.optional(v.id('workspaces'))
	},
	handler: async (ctx, args): Promise<TagWithHierarchy[]> => {
		const actor = await getActorFromSession(ctx, args.sessionId, args.workspaceId);
		const tags = await listAccessibleTags(ctx, actor);
		return calculateTagTree(tags);
	}
});

export const listUserTags = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.optional(v.id('workspaces'))
	},
	handler: async (ctx, args) => {
		const actor = await getActorFromSession(ctx, args.sessionId, args.workspaceId);
		const tags = await listAccessibleTags(ctx, actor);
		return tags.map((tag) => ({
			_id: tag._id,
			displayName: tag.displayName ?? tag.name,
			color: tag.color,
			ownershipType: tag.ownershipType ?? undefined,
			workspaceId: tag.workspaceId ?? undefined,
			circleId: tag.circleId ?? undefined,
			personId: tag.personId,
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
	const { actor, scope } = await resolveEntityScope(ctx, entity, entityId, sessionId);

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
	const accessible = [];
	for (const tag of tags) {
		if (!tag) continue;
		if (tag.workspaceId !== scope.workspaceId) continue;
		if (tag.circleId && tag.circleId !== scope.circleId) continue;
		try {
			await ensureTagAccess(ctx, actor, tag);
			accessible.push(tag);
		} catch {
			continue;
		}
	}
	return accessible;
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
	await getActorFromSession(ctx, args.sessionId);

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
