import type { MutationCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { parseTagName } from '../../readwiseUtils';

export async function createTagIfMissingImpl(
	ctx: MutationCtx,
	args: {
		userId: Id<'users'>;
		workspaceId: Id<'workspaces'>;
		tagName: string;
		externalId?: number;
	}
) {
	const { userId, workspaceId, tagName, externalId } = args;
	const normalizedName = parseTagName(tagName);
	const existing = await ctx.db
		.query('tags')
		.withIndex('by_workspace_name', (q) =>
			q.eq('workspaceId', workspaceId).eq('name', normalizedName)
		)
		.first();

	if (existing) {
		if (externalId && !existing.externalId) {
			await ctx.db.patch(existing._id, { externalId });
		}
		return existing._id;
	}

	return ctx.db.insert('tags', {
		userId,
		name: normalizedName,
		displayName: tagName,
		externalId,
		color: '#94a3b8',
		createdAt: Date.now(),
		workspaceId,
		ownershipType: 'workspace'
	});
}

export async function linkTagToSourceImpl(
	ctx: MutationCtx,
	args: { sourceId: Id<'sources'>; tagId: Id<'tags'> }
) {
	const { sourceId, tagId } = args;
	const existing = await ctx.db
		.query('sourceTags')
		.withIndex('by_source_tag', (q) => q.eq('sourceId', sourceId).eq('tagId', tagId))
		.first();
	if (existing) return existing._id;
	return ctx.db.insert('sourceTags', { sourceId, tagId });
}
