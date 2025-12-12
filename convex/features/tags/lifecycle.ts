import { mutation } from '../../_generated/server';
import { v } from 'convex/values';

import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import {
	ensureCircleMembership,
	ensureWorkspaceMembership,
	getActorFromSession,
	type ActorContext
} from './access';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { normalizeTagName } from '../readwise/utils';
import type { TagOwnership } from './validation';
import { ensureParentChainValid, ensureUniqueTagName, validateTagName } from './validation';

type WorkspaceId = Id<'workspaces'>;
type CircleId = Id<'circles'>;

export interface CreateTagArgs {
	sessionId: string;
	displayName: string;
	color: string;
	parentId?: Id<'tags'>;
	ownership?: TagOwnership;
	workspaceId?: WorkspaceId;
	circleId?: CircleId;
}

export async function createTagInternal(
	ctx: MutationCtx,
	args: CreateTagArgs
): Promise<Id<'tags'>> {
	const actor = await getActorFromSession(ctx, args.sessionId, args.workspaceId);
	const ownership: TagOwnership = args.ownership ?? 'workspace';
	if (ownership !== 'circle' && args.circleId) {
		throw createError(
			ErrorCodes.TAG_INVALID_OWNERSHIP,
			'circleId is only allowed when ownership is "circle"'
		);
	}

	const workspaceId = args.workspaceId ?? actor.workspaceId;
	await ensureWorkspaceMembership(ctx, workspaceId, actor.personId);

	let circleId: Id<'circles'> | undefined = undefined;
	if (ownership === 'circle') {
		if (!args.circleId) {
			throw createError(ErrorCodes.TAG_CIRCLE_REQUIRED, 'circleId is required for circle tags');
		}
		const circle = await ctx.db.get(args.circleId);
		if (!circle) throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
		if (circle.workspaceId !== workspaceId) {
			throw createError(ErrorCodes.TAG_PARENT_WORKSPACE_MISMATCH, 'Circle must match workspace');
		}
		await ensureCircleMembership(ctx, args.circleId, actor.personId);
		circleId = args.circleId;
	}

	const { normalizedName } = validateTagName(args.displayName);
	await ensureUniqueTagName(ctx, ownership, workspaceId, circleId, normalizedName);
	await ensureParentChainValid(ctx, args.parentId, actor, workspaceId, circleId);

	return ctx.db.insert('tags', {
		personId: actor.personId,
		name: normalizedName,
		displayName: args.displayName,
		color: args.color,
		parentId: args.parentId,
		createdAt: Date.now(),
		workspaceId,
		circleId,
		ownershipType: ownership
	});
}

export const createTag = mutation({
	args: {
		sessionId: v.string(),
		displayName: v.string(),
		color: v.string(),
		parentId: v.optional(v.id('tags')),
		ownership: v.optional(v.union(v.literal('user'), v.literal('workspace'), v.literal('circle'))),
		workspaceId: v.optional(v.id('workspaces')),
		circleId: v.optional(v.id('circles'))
	},
	handler: (ctx, args) => createTagInternal(ctx, args)
});

export interface ShareTagArgs {
	sessionId: string;
	tagId: Id<'tags'>;
	shareWith: Exclude<TagOwnership, 'user'>;
	workspaceId?: WorkspaceId;
	circleId?: CircleId;
}

async function ensureShareTarget(
	ctx: MutationCtx,
	actor: ActorContext,
	shareWith: Exclude<TagOwnership, 'user'>,
	workspaceId?: WorkspaceId,
	circleId?: CircleId
): Promise<{ workspaceId?: WorkspaceId; circleId?: CircleId }> {
	if (shareWith === 'workspace') {
		if (!workspaceId) {
			throw createError(
				ErrorCodes.VALIDATION_REQUIRED_FIELD,
				'workspaceId is required when sharing with workspace'
			);
		}
		await ensureWorkspaceMembership(ctx, workspaceId, actor.personId);
		if (actor.workspaceId !== workspaceId) {
			throw createError(
				ErrorCodes.WORKSPACE_ACCESS_DENIED,
				'You can only share tags within your workspace'
			);
		}
		return { workspaceId, circleId: undefined };
	}

	if (!circleId) {
		throw createError(
			ErrorCodes.VALIDATION_REQUIRED_FIELD,
			'circleId is required when sharing with circle'
		);
	}
	await ensureCircleMembership(ctx, circleId, actor.personId);
	const circle = await ctx.db.get(circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}
	if (circle.workspaceId !== actor.workspaceId) {
		throw createError(ErrorCodes.WORKSPACE_ACCESS_DENIED, 'Circle must belong to your workspace');
	}
	return { workspaceId: circle.workspaceId, circleId };
}

export async function createTagShareInternal(
	ctx: MutationCtx,
	args: ShareTagArgs
): Promise<Id<'tags'>> {
	const tag = await ctx.db.get(args.tagId);
	if (!tag) throw createError(ErrorCodes.TAG_NOT_FOUND, 'Tag not found');
	const actor = await getActorFromSession(ctx, args.sessionId, tag.workspaceId);
	await ensureWorkspaceMembership(ctx, tag.workspaceId, actor.personId);

	if (tag.personId !== actor.personId) {
		throw createError(ErrorCodes.TAG_ACCESS_DENIED, 'You can only share tags you own');
	}
	if (tag.ownershipType && tag.ownershipType !== 'user') {
		throw createError(ErrorCodes.TAG_ALREADY_SHARED, 'Tag is already shared');
	}

	const targets = await ensureShareTarget(
		ctx,
		actor,
		args.shareWith,
		args.workspaceId,
		args.circleId
	);
	const normalizedName = normalizeTagName(tag.name);
	let existing = null;
	if (args.shareWith === 'workspace' && targets.workspaceId) {
		existing = await ctx.db
			.query('tags')
			.withIndex('by_workspace_name', (q) =>
				q.eq('workspaceId', targets.workspaceId!).eq('name', normalizedName)
			)
			.first();
	} else if (args.shareWith === 'circle' && targets.circleId) {
		existing = await ctx.db
			.query('tags')
			.withIndex('by_circle_name', (q) =>
				q.eq('circleId', targets.circleId!).eq('name', normalizedName)
			)
			.first();
	}

	if (existing) {
		throw createError(
			ErrorCodes.TAG_ALREADY_EXISTS,
			`A tag named "${tag.displayName}" already exists in this ${args.shareWith}`
		);
	}

	await ctx.db.patch(args.tagId, {
		ownershipType: args.shareWith,
		workspaceId: targets.workspaceId,
		circleId: targets.circleId
	});

	const tagAssignments = await ctx.db
		.query('highlightTags')
		.withIndex('by_tag', (q) => q.eq('tagId', args.tagId))
		.collect();

	let highlightsTransferred = 0;
	for (const assignment of tagAssignments) {
		const highlight = await ctx.db.get(assignment.highlightId);
		if (highlight) {
			await ctx.db.patch(assignment.highlightId, {
				ownershipType: args.shareWith,
				workspaceId: targets.workspaceId,
				circleId: targets.circleId
			});
			highlightsTransferred++;
		}
	}

	const workspace = targets.workspaceId ? await ctx.db.get(targets.workspaceId) : null;
	const circle = targets.circleId ? await ctx.db.get(targets.circleId) : null;

	console.log('📊 [TAG TRANSFERRED]', {
		tagId: args.tagId,
		tagName: tag.displayName,
		transferredBy: actor.personId,
		transferTo: args.shareWith,
		workspaceId: targets.workspaceId,
		organizationName: workspace?.name,
		circleId: targets.circleId,
		circleName: circle?.name,
		highlightsTransferred
	});

	return args.tagId;
}

export const createTagShare = mutation({
	args: {
		sessionId: v.string(),
		tagId: v.id('tags'),
		shareWith: v.union(v.literal('workspace'), v.literal('circle')),
		workspaceId: v.optional(v.id('workspaces')),
		circleId: v.optional(v.id('circles'))
	},
	handler: (ctx, args): Promise<Id<'tags'>> => createTagShareInternal(ctx, args)
});
