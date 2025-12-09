import type { Doc, Id } from '../../_generated/dataModel';

export interface TagWithHierarchy {
	_id: Id<'tags'>;
	userId: Id<'users'>;
	name: string;
	displayName: string;
	color: string;
	parentId: Id<'tags'> | undefined;
	externalId: number | undefined;
	createdAt: number;
	level: number;
	children?: TagWithHierarchy[];
}

export type TagDoc = Doc<'tags'>;
