import { normalizeTagName } from '../../readwiseUtils';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { canAccessContent } from '../../permissions';

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
	let existing: Doc<'tags'> | null = null;
	if (ownership === 'user' && workspaceId) {
		existing = await ctx.db
			.query('tags')
			.withIndex('by_workspace_name', (q) =>
				q.eq('workspaceId', workspaceId).eq('name', normalizedName)
			)
			.filter((q) => q.eq(q.field('ownershipType'), 'user'))
			.first();
	} else if (ownership === 'workspace' && workspaceId) {
		existing = await ctx.db
			.query('tags')
			.withIndex('by_workspace_name', (q) =>
				q.eq('workspaceId', workspaceId).eq('name', normalizedName)
			)
			.first();
	} else if (ownership === 'circle' && circleId && workspaceId) {
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
	userId: Id<'users'>,
	workspaceId: WorkspaceId | undefined,
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
		if (parentTag.userId !== userId) {
			const hasAccess = await canAccessContent(ctx, userId, {
				userId: parentTag.userId,
				workspaceId: parentTag.workspaceId ?? undefined,
				circleId: parentTag.circleId ?? undefined
			});
			if (!hasAccess) {
				throw createError(
					ErrorCodes.TAG_PARENT_ACCESS_DENIED,
					'Parent tag does not belong to current user scope'
				);
			}
		}
		if (parentTag.workspaceId !== workspaceId) {
			throw createError(
				ErrorCodes.TAG_PARENT_WORKSPACE_MISMATCH,
				'Parent tag must belong to the same workspace'
			);
		}
		if (parentTag.circleId !== circleId) {
			throw createError(
				ErrorCodes.TAG_PARENT_CIRCLE_MISMATCH,
				'Parent tag must belong to the same circle'
			);
		}
		currentParentId = parentTag.parentId;
	}
}
