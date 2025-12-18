import type { MutationCtx } from '../../../_generated/server';
import type { Id } from '../../../_generated/dataModel';
import { getPersonByUserAndWorkspace } from '../../../core/people/queries';
import { parseTagName } from '../utils';

export async function createTagIfMissingImpl(
	ctx: MutationCtx,
	args: {
		personId: Id<'people'>;
		workspaceId: Id<'workspaces'>;
		tagName: string;
		externalId?: number;
	}
) {
	const { personId, workspaceId, tagName, externalId } = args;
	const normalizedName = parseTagName(tagName);
	const person = await ctx.db.get(personId);
	if (!person) {
		throw createError(ErrorCodes.PERSON_NOT_FOUND, 'Person not found');
	}
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
		personId: person._id,
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
