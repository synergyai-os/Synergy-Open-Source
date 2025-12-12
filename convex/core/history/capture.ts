import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import type {
	EntityDoc,
	EntityDocByType,
	EntityId,
	EntityType,
	OrgEntityChange,
	Snapshot
} from './types';
import type { ChangeType } from './types';
import type { OrgVersionHistoryInsert } from './types';

function extractEntityFields<T extends EntityType>(
	entityType: T,
	doc: EntityDocByType[T] | undefined
): Snapshot<T> {
	if (!doc) return undefined;

	switch (entityType) {
		case 'circle':
			return {
				name: doc.name,
				slug: doc.slug,
				purpose: doc.purpose,
				parentCircleId: doc.parentCircleId,
				status: doc.status,
				circleType: doc.circleType,
				decisionModel: doc.decisionModel,
				archivedAt: doc.archivedAt
			};
		case 'circleRole':
			return {
				circleId: doc.circleId,
				name: doc.name,
				purpose: doc.purpose,
				templateId: doc.templateId,
				status: doc.status,
				isHiring: doc.isHiring,
				archivedAt: doc.archivedAt
			};
		case 'userCircleRole':
			return {
				personId: doc.personId,
				circleRoleId: doc.circleRoleId,
				scope: doc.scope,
				archivedAt: doc.archivedAt
			};
		case 'circleMember':
			return {
				circleId: doc.circleId,
				personId: doc.personId,
				archivedAt: doc.archivedAt
			};
		case 'circleItemCategory':
			return {
				workspaceId: doc.workspaceId,
				entityType: doc.entityType,
				name: doc.name,
				order: doc.order,
				isDefault: doc.isDefault,
				archivedAt: doc.archivedAt
			};
		case 'circleItem':
			return {
				categoryId: doc.categoryId,
				entityType: doc.entityType,
				entityId: doc.entityId,
				content: doc.content,
				order: doc.order,
				archivedAt: doc.archivedAt
			};
		default:
			return undefined as Snapshot<T>;
	}
}

function getWorkspaceId(
	entityType: EntityType,
	doc: EntityDoc | undefined
): Id<'workspaces'> | null {
	if (!doc) return null;

	switch (entityType) {
		case 'circle':
		case 'circleRole':
			return doc.workspaceId;
		case 'circleItemCategory':
		case 'circleItem':
			return doc.workspaceId || null;
		case 'userCircleRole':
			return null; // resolved during recording
		case 'circleMember':
			return null; // resolved during recording
		default:
			return null;
	}
}

function getChangedByPersonId(doc: EntityDoc | undefined): Id<'people'> | null {
	// TODO: SYOS-791 - history remains person-based; upstream docs use personId fields.
	// For now, map personId to an auth id only when present.
	const maybePerson: any = doc;
	return (
		maybePerson?.updatedByPersonId ||
		maybePerson?.createdByPersonId ||
		maybePerson?.archivedByPersonId ||
		null
	);
}

export async function recordVersionHistory(
	ctx: MutationCtx,
	entityType: EntityType,
	change: OrgEntityChange
): Promise<void> {
	let changeType: ChangeType;

	if (change.operation === 'insert') {
		changeType = 'create';
	} else if (change.operation === 'update') {
		const oldArchived = change.oldDoc?.archivedAt;
		const newArchived = change.newDoc?.archivedAt;

		if (!oldArchived && newArchived) {
			changeType = 'archive';
		} else if (oldArchived && !newArchived) {
			changeType = 'restore';
		} else {
			changeType = 'update';
		}
	} else if (change.operation === 'delete') {
		changeType = 'archive';
	} else {
		return;
	}

	const doc = change.newDoc || change.oldDoc;
	if (!doc) {
		return;
	}

	const entityId: EntityId | undefined = change.newDoc?._id ?? change.oldDoc?._id;
	if (!entityId) {
		return;
	}

	const changedByPersonId = getChangedByPersonId(doc);
	if (!changedByPersonId) {
		return;
	}

	let workspaceId: Id<'workspaces'> | null = getWorkspaceId(entityType, doc);

	if (!workspaceId) {
		if (entityType === 'circleRole' && doc.circleId) {
			const circle = await ctx.db.get(doc.circleId);
			workspaceId = circle?.workspaceId || null;
		} else if (entityType === 'userCircleRole' && doc.circleRoleId) {
			const role = await ctx.db.get(doc.circleRoleId);
			if (role?.circleId) {
				const circle = await ctx.db.get(role.circleId);
				workspaceId = circle?.workspaceId || null;
			}
		} else if (entityType === 'circleMember' && doc.circleId) {
			const circle = await ctx.db.get(doc.circleId);
			workspaceId = circle?.workspaceId || null;
		}
	}

	if (!workspaceId) {
		return;
	}

	const before = change.oldDoc ? extractEntityFields(entityType, change.oldDoc) : undefined;
	const after = change.newDoc ? extractEntityFields(entityType, change.newDoc) : undefined;

	const changedAt = Date.now();

	const historyRecord: OrgVersionHistoryInsert = {
		entityType,
		workspaceId,
		entityId,
		changeType,
		changedByPersonId,
		changedAt,
		before,
		after
	};

	await ctx.db.insert('orgVersionHistory', historyRecord);
}

export async function recordCreateHistory<T extends EntityType>(
	ctx: MutationCtx,
	entityType: T,
	newDoc: EntityDocByType[T]
): Promise<void> {
	const change: OrgEntityChange = {
		id: newDoc._id,
		operation: 'insert',
		oldDoc: null,
		newDoc
	};
	await recordVersionHistory(ctx, entityType, change);
}

export async function recordUpdateHistory<T extends EntityType>(
	ctx: MutationCtx,
	entityType: T,
	oldDoc: EntityDocByType[T],
	newDoc: EntityDocByType[T]
): Promise<void> {
	const change: OrgEntityChange = {
		id: newDoc._id,
		operation: 'update',
		oldDoc,
		newDoc
	};
	await recordVersionHistory(ctx, entityType, change);
}

export async function recordArchiveHistory<T extends EntityType>(
	ctx: MutationCtx,
	entityType: T,
	oldDoc: EntityDocByType[T],
	newDoc: EntityDocByType[T]
): Promise<void> {
	const change: OrgEntityChange = {
		id: newDoc._id,
		operation: 'update',
		oldDoc,
		newDoc
	};
	await recordVersionHistory(ctx, entityType, change);
}

export async function recordRestoreHistory<T extends EntityType>(
	ctx: MutationCtx,
	entityType: T,
	oldDoc: EntityDocByType[T],
	newDoc: EntityDocByType[T]
): Promise<void> {
	const change: OrgEntityChange = {
		id: newDoc._id,
		operation: 'update',
		oldDoc,
		newDoc
	};
	await recordVersionHistory(ctx, entityType, change);
}

export { extractEntityFields };
