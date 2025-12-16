/**
 * Migration: tasks.createdBy → tasks.createdByPersonId
 *
 * Migrates the `createdBy` field from `v.id('users')` to `createdByPersonId: v.id('people')`
 * in the tasks table to comply with XDOM-01 and XDOM-02 invariants.
 *
 * Prerequisites:
 * - Schema must be updated: `createdByPersonId: v.id('people')` in tasks table
 * - Old field `createdBy` must still exist in data (for migration)
 *
 * Run with:
 *   npx convex run admin/migrations/migrateTasksAuditFields:migrateTasksAuditFields
 *
 * Edge Case Handling:
 * - userId not found in people table → Uses fallback person (workspace owner or any active person)
 * - createdBy is null → Uses fallback person (required by schema)
 * - Workspace has no people → Skips task (abandoned workspace)
 *
 * @see SYOS-852 (Migration task)
 * @see SYOS-842 (Schema validation violations)
 * @see convex/admin/invariants/INVARIANTS.md (XDOM-01, XDOM-02)
 */

import { internalMutation } from '../../_generated/server';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { findPersonByUserAndWorkspace } from '../../core/people/queries';

type TaskDoc = Doc<'tasks'>;

/**
 * Helper to resolve userId to personId for a workspace.
 * Falls back to workspace owner if person not found (for legacy data).
 *
 * @returns Object with personId and a flag indicating if fallback was used
 */
async function resolvePersonId(
	ctx: MutationCtx,
	userId: Id<'users'>,
	workspaceId: Id<'workspaces'>
): Promise<{ personId: Id<'people'>; usedFallback: boolean }> {
	const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId);
	if (person) {
		return { personId: person._id, usedFallback: false };
	}

	// Fallback: find workspace owner or any active person
	const fallbackPersonId = await findFallbackPerson(ctx, workspaceId);
	return { personId: fallbackPersonId, usedFallback: true };
}

/**
 * Check if workspace has any people (active or inactive).
 * Used to detect abandoned workspaces before attempting migration.
 */
async function workspaceHasPeople(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>
): Promise<boolean> {
	const anyPerson = await ctx.db
		.query('people')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.first();
	return anyPerson !== null;
}

/**
 * Find a fallback person for a workspace (owner first, then any active person).
 * Used when original creator cannot be determined.
 *
 * @throws Error if no person found (should be checked with workspaceHasPeople first)
 */
async function findFallbackPerson(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>
): Promise<Id<'people'>> {
	// Try to find workspace owner
	const owner = await ctx.db
		.query('people')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.filter((q) => q.eq(q.field('workspaceRole'), 'owner'))
		.first();

	if (owner) return owner._id;

	// Fallback to any active person in the workspace
	const anyPerson = await ctx.db
		.query('people')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.filter((q) => q.eq(q.field('status'), 'active'))
		.first();

	if (anyPerson) return anyPerson._id;

	// Last resort: any person in workspace (even if inactive)
	const anyPersonAtAll = await ctx.db
		.query('people')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.first();

	if (anyPersonAtAll) return anyPersonAtAll._id;

	throw new Error(
		`No person found in workspace ${workspaceId} to use as fallback for audit fields.`
	);
}

/**
 * Check if a task has already been migrated by checking if createdByPersonId exists.
 */
async function isTaskMigrated(ctx: MutationCtx, task: TaskDoc): Promise<boolean> {
	// Check if createdByPersonId field exists (new schema)
	const currentTask = await ctx.db.get(task._id);
	return (
		currentTask !== null &&
		'createdByPersonId' in currentTask &&
		currentTask.createdByPersonId !== undefined
	);
}

/**
 * Migrate tasks table: createdBy → createdByPersonId
 */
export const migrateTasksAuditFields = internalMutation({
	args: {},
	handler: async (
		ctx
	): Promise<{
		migrated: number;
		skipped: number;
		errors: number;
		edgeCaseStats: {
			createdByNull: number;
			createdByNotFound: number;
			noPeopleInWorkspace: number;
		};
	}> => {
		console.log('🔄 Starting migration: tasks.createdBy → tasks.createdByPersonId');

		const tasks = await ctx.db.query('tasks').collect();
		let migrated = 0;
		let skipped = 0;
		let errors = 0;
		const edgeCaseStats = {
			createdByNull: 0,
			createdByNotFound: 0,
			noPeopleInWorkspace: 0
		};

		for (const task of tasks) {
			try {
				// Check if already migrated
				if (await isTaskMigrated(ctx, task)) {
					skipped++;
					continue;
				}

				// Check if workspace has people before attempting migration
				// Skip abandoned workspaces (no people) per edge case handling
				if (!(await workspaceHasPeople(ctx, task.workspaceId))) {
					console.warn(
						`⚠️  Task ${task._id}: Workspace ${task.workspaceId} has no people, skipping (abandoned workspace)`
					);
					edgeCaseStats.noPeopleInWorkspace++;
					skipped++;
					continue;
				}

				// Get legacy createdBy field (cast to access old field)
				const legacyCreatedBy = (task as any).createdBy as Id<'users'> | undefined;

				// Resolve userId → personId for audit field
				// Handle edge cases with logging
				let createdByPersonId: Id<'people'>;
				if (!legacyCreatedBy) {
					// Edge case: createdBy is null - use fallback person (required by schema)
					edgeCaseStats.createdByNull++;
					console.warn(
						`⚠️  Task ${task._id}: createdBy is null, using fallback person for workspace ${task.workspaceId}`
					);
					createdByPersonId = await findFallbackPerson(ctx, task.workspaceId);
				} else {
					const resolved = await resolvePersonId(ctx, legacyCreatedBy, task.workspaceId);
					createdByPersonId = resolved.personId;
					if (resolved.usedFallback) {
						edgeCaseStats.createdByNotFound++;
						console.warn(
							`⚠️  Task ${task._id}: userId ${legacyCreatedBy} not found in people table for workspace ${task.workspaceId}, using fallback person`
						);
					}
				}

				// Update task with new field
				// Note: The old `createdBy` field will remain in the data but is ignored
				// since it's no longer in the schema. Convex will handle this gracefully.
				await ctx.db.patch(task._id, {
					createdByPersonId
				});

				migrated++;
			} catch (error) {
				errors++;
				console.error(`❌ Failed to migrate task ${task._id}:`, error);
			}
		}

		console.log(`✅ Tasks migration complete:`);
		console.log(`   - Migrated: ${migrated}`);
		console.log(`   - Skipped (already migrated/abandoned workspace): ${skipped}`);
		console.log(`   - Errors: ${errors}`);
		console.log(`   - Total processed: ${tasks.length}`);
		console.log(`   - Edge case statistics:`);
		console.log(`     * createdBy null: ${edgeCaseStats.createdByNull}`);
		console.log(`     * createdBy userId not found: ${edgeCaseStats.createdByNotFound}`);
		console.log(`     * no people in workspace: ${edgeCaseStats.noPeopleInWorkspace}`);

		return { migrated, skipped, errors, edgeCaseStats };
	}
});
