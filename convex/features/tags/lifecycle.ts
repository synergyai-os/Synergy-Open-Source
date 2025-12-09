import { mutation } from '../../_generated/server';
import { v } from 'convex/values';

import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { normalizeTagName } from '../../readwiseUtils';
import { ensureOwnershipContext, ensureWorkspaceMembership } from './access';
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
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const ownership: TagOwnership = args.ownership ?? 'workspace';
	if (ownership !== 'circle' && args.circleId) {
		throw createError(
			ErrorCodes.TAG_INVALID_OWNERSHIP,
			'circleId is only allowed when ownership is "circle"'
		);
	}
	const ownershipContext = await ensureOwnershipContext(
		ctx,
		userId,
		ownership,
		args.workspaceId,
		args.circleId
	);

	const { normalizedName } = validateTagName(args.displayName);
	await ensureUniqueTagName(
		ctx,
		ownershipContext.ownership,
		ownershipContext.workspaceId,
		ownershipContext.circleId,
		normalizedName
	);
	await ensureParentChainValid(
		ctx,
		args.parentId,
		userId,
		ownershipContext.workspaceId,
		ownershipContext.circleId
	);

	return ctx.db.insert('tags', {
		userId,
		name: normalizedName,
		displayName: args.displayName,
		color: args.color,
		parentId: args.parentId,
		createdAt: Date.now(),
		workspaceId: ownershipContext.workspaceId,
		circleId: ownershipContext.circleId,
		ownershipType: ownershipContext.ownership
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
	userId: Id<'users'>,
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
		await ensureWorkspaceMembership(ctx, userId, workspaceId);
		return { workspaceId, circleId: undefined };
	}

	if (!circleId) {
		throw createError(
			ErrorCodes.VALIDATION_REQUIRED_FIELD,
			'circleId is required when sharing with circle'
		);
	}
	const circleMembership = await ctx.db
		.query('circleMembers')
		.withIndex('by_circle_user', (q) => q.eq('circleId', circleId).eq('userId', userId))
		.first();
	if (!circleMembership) {
		throw createError(ErrorCodes.AUTHZ_NOT_CIRCLE_MEMBER, 'You are not a member of this circle');
	}

	const circle = await ctx.db.get(circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}
	return { workspaceId: circle.workspaceId, circleId };
}

export async function createTagShareInternal(
	ctx: MutationCtx,
	args: ShareTagArgs
): Promise<Id<'tags'>> {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const tag = await ctx.db.get(args.tagId);
	if (!tag) throw createError(ErrorCodes.TAG_NOT_FOUND, 'Tag not found');
	if (tag.userId !== userId) {
		throw createError(ErrorCodes.TAG_ACCESS_DENIED, 'You can only share tags you own');
	}
	if (tag.ownershipType && tag.ownershipType !== 'user') {
		throw createError(ErrorCodes.TAG_ALREADY_SHARED, 'Tag is already shared');
	}

	const targets = await ensureShareTarget(
		ctx,
		userId,
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
		transferredBy: userId,
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
