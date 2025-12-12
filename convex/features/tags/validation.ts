import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { normalizeTagName } from '../readwise/utils';
import { ensureCircleMembership, ensureTagAccess, type ActorContext } from './access';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';

type WorkspaceId = Id<'workspaces'>;
type CircleId = Id<'circles'>;

export type TagOwnership = 'user' | 'workspace' | 'circle';

export interface OwnershipContext {
	ownership: TagOwnership;
	workspaceId?: WorkspaceId;
	circleId?: CircleId;
}

export function validateTagName(displayName: string): { normalizedName: string } {
	const normalizedName = normalizeTagName(displayName);
	if (!normalizedName || normalizedName.length === 0) {
		throw createError(ErrorCodes.TAG_NAME_REQUIRED, 'Tag name cannot be empty');
	}
	if (normalizedName.length > 50) {
		throw createError(ErrorCodes.TAG_NAME_TOO_LONG, 'Tag name cannot exceed 50 characters');
	}
	return { normalizedName };
}

export async function ensureUniqueTagName(
	ctx: MutationCtx,
	ownership: TagOwnership,
	workspaceId: WorkspaceId | undefined,
	circleId: CircleId | undefined,
	normalizedName: string
): Promise<void> {
	if (!workspaceId) {
		throw createError(
			ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED,
			'Workspace is required when creating tags'
		);
	}

	let existing: Doc<'tags'> | null = null;
	if (ownership === 'user') {
		existing = await ctx.db
			.query('tags')
			.withIndex('by_workspace_name', (q) =>
				q.eq('workspaceId', workspaceId).eq('name', normalizedName)
			)
			.filter((q) => q.eq(q.field('ownershipType'), 'user'))
			.first();
	} else if (ownership === 'workspace') {
		existing = await ctx.db
			.query('tags')
			.withIndex('by_workspace_name', (q) =>
				q.eq('workspaceId', workspaceId).eq('name', normalizedName)
			)
			.first();
	} else if (ownership === 'circle' && circleId) {
		existing = await ctx.db
			.query('tags')
			.withIndex('by_circle_name', (q) => q.eq('circleId', circleId).eq('name', normalizedName))
			.first();
	}

	if (existing) {
		throw createError(ErrorCodes.TAG_ALREADY_EXISTS, `Tag "${normalizedName}" already exists`);
	}
}

export async function ensureParentChainValid(
	ctx: MutationCtx,
	parentId: Id<'tags'> | undefined,
	actor: ActorContext,
	workspaceId: WorkspaceId,
	circleId: CircleId | undefined
): Promise<void> {
	if (!parentId) return;

	let currentParentId: Id<'tags'> | undefined = parentId;
	const visited = new Set<Id<'tags'>>();

	while (currentParentId) {
		if (visited.has(currentParentId)) {
			throw createError(
				ErrorCodes.TAG_CIRCULAR_REFERENCE,
				'Circular reference detected in parent chain'
			);
		}
		visited.add(currentParentId);

		const parentTag: Doc<'tags'> | null = await ctx.db.get(currentParentId);
		if (!parentTag) {
			throw createError(ErrorCodes.TAG_PARENT_NOT_FOUND, 'Parent tag not found');
		}
		await ensureTagAccess(ctx, actor, parentTag);
		if (parentTag.workspaceId !== workspaceId) {
			throw createError(
				ErrorCodes.TAG_PARENT_WORKSPACE_MISMATCH,
				'Parent tag must belong to the same workspace'
			);
		}
		if ((parentTag.circleId ?? undefined) !== (circleId ?? undefined)) {
			throw createError(
				ErrorCodes.TAG_PARENT_CIRCLE_MISMATCH,
				'Parent tag must belong to the same circle'
			);
		}
		if (parentTag.circleId) {
			await ensureCircleMembership(ctx, parentTag.circleId, actor.personId);
		}
		currentParentId = parentTag.parentId;
	}
}
