/**
 * Version History Capture and Query Functions
 *
 * Provides functions to capture version history for org chart entities
 * and query historical changes.
 *
 * TRIGGER PATTERN:
 * Instead of using convex-helpers triggers (which require customMutation wrapper),
 * we call capture functions directly in mutations for explicit control:
 *
 * // In mutation handler:
 * const newCircle = await ctx.db.get(circleId);
 * await captureCreate(ctx, 'circle', newCircle);
 *
 * // For updates:
 * await captureUpdate(ctx, 'circle', oldCircle, newCircle);
 *
 * // For archives:
 * await captureArchive(ctx, 'circle', oldCircle, archivedCircle);
 *
 * FUTURE: To use automatic triggers, refactor mutations to use customMutation:
 * ```typescript
 * import { customMutation, customCtx } from 'convex-helpers/server/customFunctions';
 * import { mutation } from './_generated/server';
 * import triggers from './orgChartTriggers';
 *
 * export const mutation = customMutation(mutation, customCtx(triggers.wrapDB));
 * ```
 */

import type { Change } from 'convex-helpers/server/triggers';
import type { DataModel } from './_generated/dataModel';
import type { Doc, Id } from './_generated/dataModel';
import { query } from './_generated/server';
import type { MutationCtx } from './_generated/server';
import { v } from 'convex/values';

type EntityType =
	| 'circle'
	| 'circleRole'
	| 'userCircleRole'
	| 'circleMember'
	| 'circleItemCategory'
	| 'circleItem';

type ChangeType = 'create' | 'update' | 'archive' | 'restore';

type EntityDocByType = {
	circle: Doc<'circles'>;
	circleRole: Doc<'circleRoles'>;
	userCircleRole: Doc<'userCircleRoles'>;
	circleMember: Doc<'circleMembers'>;
	circleItemCategory: Doc<'circleItemCategories'>;
	circleItem: Doc<'circleItems'>;
};

type EntityDoc = EntityDocByType[EntityType];
type EntityId = EntityDoc['_id'];
type OrgVersionHistoryInsert = Omit<Doc<'orgVersionHistory'>, '_id' | '_creationTime'>;
type OrgEntityChange = Change<DataModel, EntityDoc>;

type SnapshotByType = {
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
		'userId' | 'circleRoleId' | 'scope' | 'archivedAt'
	>;
	circleMember: Pick<EntityDocByType['circleMember'], 'circleId' | 'userId' | 'archivedAt'>;
	circleItemCategory: Pick<
		EntityDocByType['circleItemCategory'],
		'workspaceId' | 'entityType' | 'name' | 'order' | 'isDefault' | 'archivedAt'
	>;
	circleItem: Pick<
		EntityDocByType['circleItem'],
		'categoryId' | 'entityType' | 'entityId' | 'content' | 'order' | 'archivedAt'
	>;
};

type Snapshot<T extends EntityType> = SnapshotByType[T] | undefined;

/**
 * Extract relevant fields from a document based on entity type
 */
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
				userId: doc.userId,
				circleRoleId: doc.circleRoleId,
				scope: doc.scope,
				archivedAt: doc.archivedAt
			};
		case 'circleMember':
			return {
				circleId: doc.circleId,
				userId: doc.userId,
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

/**
 * Get workspace ID from document based on entity type
 */
function getWorkspaceId(
	entityType: EntityType,
	doc: EntityDoc | undefined
): Id<'workspaces'> | null {
	if (!doc) return null;

	switch (entityType) {
		case 'circle':
			return doc.workspaceId;
		case 'circleRole':
			return doc.workspaceId;
		case 'circleItemCategory':
		case 'circleItem':
			return doc.workspaceId || null;
		case 'userCircleRole':
			// Need to look up role -> circle to get workspaceId
			return null; // Will be resolved in captureVersionHistory
		case 'circleMember':
			// Need to look up circle to get workspaceId
			return null; // Will be resolved in captureVersionHistory
		default:
			return null;
	}
}

/**
 * Get user ID who made the change (from updatedBy, createdBy, or archivedBy)
 */
function getChangedBy(doc: EntityDoc | undefined): Id<'users'> | null {
	return doc?.updatedBy || doc?.createdBy || doc?.archivedBy || null;
}

/**
 * Capture version history for an org chart entity change
 *
 * This function can be called:
 * 1. From triggers (automatically)
 * 2. Explicitly from mutations (for explicit control)
 */
export async function captureVersionHistory(
	ctx: MutationCtx,
	entityType: EntityType,
	change: OrgEntityChange
): Promise<void> {
	// Determine change type
	let changeType: ChangeType;

	if (change.operation === 'insert') {
		changeType = 'create';
	} else if (change.operation === 'update') {
		// Check if this is an archive or restore
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
		// Hard delete - treat as archive
		changeType = 'archive';
	} else {
		// Unknown operation - skip
		return;
	}

	// Get the document (newDoc for insert/update, oldDoc for delete)
	const doc = change.newDoc || change.oldDoc;
	if (!doc) {
		return;
	}

	const entityId: EntityId | undefined = change.newDoc?._id ?? change.oldDoc?._id;
	if (!entityId) {
		return;
	}

	// Get user who made the change
	const changedBy = getChangedBy(doc);
	if (!changedBy) {
		// Skip if we can't determine who made the change
		return;
	}

	// Get workspace ID
	let workspaceId: Id<'workspaces'> | null = getWorkspaceId(entityType, doc);

	// For entities that don't have workspaceId directly, look it up
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
		// Skip if we can't determine workspace
		return;
	}

	// Extract relevant fields for before/after snapshots
	const before = change.oldDoc ? extractEntityFields(entityType, change.oldDoc) : undefined;
	const after = change.newDoc ? extractEntityFields(entityType, change.newDoc) : undefined;

	// Build the version history record based on entity type
	const changedAt = Date.now();

	// Create the version history record using discriminated union
	const historyRecord: OrgVersionHistoryInsert = {
		entityType,
		workspaceId,
		entityId,
		changeType,
		changedBy,
		changedAt,
		before,
		after
	};

	// Insert into version history table
	await ctx.db.insert('orgVersionHistory', historyRecord);
}

/**
 * Get version history for a specific entity
 */
export const getEntityHistory = query({
	args: {
		entityType: v.union(
			v.literal('circle'),
			v.literal('circleRole'),
			v.literal('userCircleRole'),
			v.literal('circleMember'),
			v.literal('circleItemCategory'),
			v.literal('circleItem')
		),
		entityId: v.string(), // Accept string to handle different ID types
		limit: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 50;

		// Query version history by entity
		const history = await ctx.db
			.query('orgVersionHistory')
			.withIndex('by_entity', (q) =>
				q.eq('entityType', args.entityType).eq('entityId', args.entityId)
			)
			.order('desc')
			.take(limit);

		return history;
	}
});

/**
 * Get workspace timeline (all changes in a workspace)
 */
export const getWorkspaceTimeline = query({
	args: {
		workspaceId: v.id('workspaces'),
		limit: v.optional(v.number()),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 100;

		const historyQuery = ctx.db
			.query('orgVersionHistory')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.order('desc');

		// Apply date filters if provided
		// Note: We need to filter in code since the index is on workspaceId + changedAt
		// but we can't filter changedAt directly in the index query
		const results = await historyQuery.take(limit * 2); // Get more to account for filtering

		let filtered = results;

		if (args.startDate !== undefined) {
			filtered = filtered.filter((record) => record.changedAt >= args.startDate!);
		}

		if (args.endDate !== undefined) {
			filtered = filtered.filter((record) => record.changedAt <= args.endDate!);
		}

		// Return limited results
		return filtered.slice(0, limit);
	}
});

/**
 * Get all changes by a specific user in a workspace
 */
export const getUserChanges = query({
	args: {
		userId: v.id('users'),
		workspaceId: v.optional(v.id('workspaces')),
		limit: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 100;

		const userQuery = ctx.db
			.query('orgVersionHistory')
			.withIndex('by_user', (q) => q.eq('changedBy', args.userId))
			.order('desc');

		const results = await userQuery.take(limit * 2); // Get more to account for filtering

		// Filter by workspace if provided
		let filtered = results;
		if (args.workspaceId !== undefined) {
			filtered = filtered.filter((record) => record.workspaceId === args.workspaceId);
		}

		return filtered.slice(0, limit);
	}
});

/**
 * Explicit helper functions for calling from mutations
 * These create the change object and call captureVersionHistory
 */

/**
 * Capture version history for a create operation
 */
export async function captureCreate<T extends EntityType>(
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
	await captureVersionHistory(ctx, entityType, change);
}

/**
 * Capture version history for an update operation
 */
export async function captureUpdate<T extends EntityType>(
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
	await captureVersionHistory(ctx, entityType, change);
}

/**
 * Capture version history for an archive operation
 */
export async function captureArchive<T extends EntityType>(
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
	await captureVersionHistory(ctx, entityType, change);
}

/**
 * Capture version history for a restore operation
 */
export async function captureRestore<T extends EntityType>(
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
	await captureVersionHistory(ctx, entityType, change);
}
