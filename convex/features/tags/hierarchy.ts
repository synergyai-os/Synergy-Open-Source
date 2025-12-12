import type { MutationCtx, QueryCtx } from '../../_generated/server';
import type { Doc, Id } from '../../_generated/dataModel';
import type { TagWithHierarchy } from './types';

export function calculateTagTree(tags: Doc<'tags'>[]): TagWithHierarchy[] {
	const tagMap = new Map<Id<'tags'>, TagWithHierarchy>();
	const rootTags: TagWithHierarchy[] = [];

	for (const tag of tags) {
		const tagWithHierarchy: TagWithHierarchy = {
			_id: tag._id,
			personId: tag.personId,
			name: tag.name,
			displayName: tag.displayName,
			color: tag.color,
			parentId: tag.parentId,
			externalId: tag.externalId,
			createdAt: tag._creationTime,
			level: 0,
			children: []
		};
		tagMap.set(tag._id, tagWithHierarchy);
	}

	for (const tag of tagMap.values()) {
		if (tag.parentId) {
			const parent = tagMap.get(tag.parentId);
			if (parent) {
				parent.children = parent.children || [];
				parent.children.push(tag);
				tag.level = (parent.level ?? 0) + 1;
			} else {
				tag.parentId = undefined;
				rootTags.push(tag);
			}
		} else {
			rootTags.push(tag);
		}
	}

	const flattened: TagWithHierarchy[] = [];
	const traverse = (node: TagWithHierarchy) => {
		flattened.push(node);
		if (node.children) {
			node.children.forEach(traverse);
		}
	};
	rootTags.forEach(traverse);
	return flattened;
}

async function listTagChildren(
	ctx: QueryCtx | MutationCtx,
	tagId: Id<'tags'>,
	personId: Id<'people'>
): Promise<Doc<'tags'>[]> {
	return ctx.db
		.query('tags')
		.withIndex('by_person_parent', (q) => q.eq('personId', personId).eq('parentId', tagId))
		.collect();
}

export async function getTagDescendants(
	ctx: QueryCtx | MutationCtx,
	tagId: Id<'tags'>,
	personId: Id<'people'>
): Promise<Id<'tags'>[]> {
	const descendants: Id<'tags'>[] = [tagId];
	const queue: Id<'tags'>[] = [tagId];

	while (queue.length > 0) {
		const currentTagId = queue.shift()!;
		const children = await listTagChildren(ctx, currentTagId, personId);
		for (const child of children) {
			descendants.push(child._id);
			queue.push(child._id);
		}
	}

	return descendants;
}

export async function getTagDescendantsForTags(
	ctx: QueryCtx | MutationCtx,
	tagIds: Id<'tags'>[],
	personId: Id<'people'>
): Promise<Id<'tags'>[]> {
	if (tagIds.length === 0) return [];
	const allDescendants = new Set<Id<'tags'>>();

	for (const tagId of tagIds) {
		const descendants = await getTagDescendants(ctx, tagId, personId);
		for (const descId of descendants) {
			allDescendants.add(descId);
		}
	}

	return Array.from(allDescendants);
}
