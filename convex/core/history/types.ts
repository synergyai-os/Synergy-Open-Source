import type { Change } from 'convex-helpers/server/triggers';
import type { DataModel, Doc } from '../../_generated/dataModel';

export type EntityType =
	| 'circle'
	| 'circleRole'
	| 'userCircleRole'
	| 'circleMember'
	| 'circleItemCategory'
	| 'circleItem';

export type ChangeType = 'create' | 'update' | 'archive' | 'restore';

export type EntityDocByType = {
	circle: Doc<'circles'>;
	circleRole: Doc<'circleRoles'>;
	userCircleRole: Doc<'userCircleRoles'>;
	circleMember: Doc<'circleMembers'>;
	circleItemCategory: Doc<'circleItemCategories'>;
	circleItem: Doc<'circleItems'>;
};

export type EntityDoc = EntityDocByType[EntityType];
export type EntityId = EntityDoc['_id'];

export type OrgVersionHistoryInsert = Omit<Doc<'orgVersionHistory'>, '_id' | '_creationTime'>;
export type OrgEntityChange = Change<DataModel, EntityDoc>;

export type SnapshotByType = {
	circle: Pick<
		EntityDocByType['circle'],
		| 'name'
		| 'slug'
		| 'purpose'
		| 'parentCircleId'
		| 'status'
		| 'circleType'
		| 'decisionModel'
		| 'archivedAt'
	>;
	circleRole: Pick<
		EntityDocByType['circleRole'],
		'circleId' | 'name' | 'purpose' | 'templateId' | 'status' | 'isHiring' | 'archivedAt'
	>;
	userCircleRole: Pick<
		EntityDocByType['userCircleRole'],
		'personId' | 'circleRoleId' | 'scope' | 'archivedAt'
	>;
	circleMember: Pick<EntityDocByType['circleMember'], 'circleId' | 'personId' | 'archivedAt'>;
	circleItemCategory: Pick<
		EntityDocByType['circleItemCategory'],
		'workspaceId' | 'entityType' | 'name' | 'order' | 'isDefault' | 'archivedAt'
	>;
	circleItem: Pick<
		EntityDocByType['circleItem'],
		'categoryId' | 'entityType' | 'entityId' | 'content' | 'order' | 'archivedAt'
	>;
};

export type Snapshot<T extends EntityType> = SnapshotByType[T] | undefined;
