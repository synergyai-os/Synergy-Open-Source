import type { Change } from 'convex-helpers/server/triggers';
import type { DataModel, Doc } from '../../_generated/dataModel';

export type EntityType = 'circle' | 'circleRole' | 'assignment' | 'circleMember';

export type ChangeType = 'create' | 'update' | 'archive' | 'restore';

export type EntityDocByType = {
	circle: Doc<'circles'>;
	circleRole: Doc<'circleRoles'>;
	assignment: Doc<'assignments'>;
	circleMember: Doc<'circleMembers'>;
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
	assignment: Pick<
		EntityDocByType['assignment'],
		'circleId' | 'personId' | 'roleId' | 'status' | 'endedAt'
	>;
	circleMember: Pick<EntityDocByType['circleMember'], 'circleId' | 'personId' | 'archivedAt'>;
};

export type Snapshot<T extends EntityType> = SnapshotByType[T] | undefined;
