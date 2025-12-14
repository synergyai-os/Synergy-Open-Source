/**
 * Migration: circleItems → customFields
 *
 * Migrates data from legacy circleItems tables to new customFields tables.
 *
 * Migration Mapping:
 * - circleItemCategories → customFieldDefinitions
 * - circleItems → customFieldValues
 * - Audit fields: createdBy/updatedBy (userId) → createdByPersonId/updatedByPersonId (personId)
 *
 * Prerequisites:
 * - SYOS-844: customFieldDefinitions table must exist
 * - SYOS-845: customFieldValues table must exist
 * - Tables must be registered in convex/schema.ts
 *
 * Run with:
 *   npx convex run admin/migrations/migrateCircleItemsToCustomFields:migrateCircleItemsToCustomFields
 *
 * Edge Case Handling (SYOS-847):
 * - userId not found in people table → Uses fallback person (workspace owner or any active person)
 * - Multiple people for same userId+workspace → Should not happen (IDENT-06 invariant), uses first match
 * - createdBy is null → Uses fallback person (required by schema)
 * - updatedBy is null → Preserved as undefined (optional field)
 *
 * @see SYOS-846 (Migration script)
 * @see SYOS-847 (Audit field mapping: createdBy → createdByPersonId)
 * @see SYOS-790 (Custom fields feature)
 * @see SYOS-844 (customFieldDefinitions table)
 * @see SYOS-845 (customFieldValues table)
 */

import { internalMutation } from '../../_generated/server';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { findPersonByUserAndWorkspace } from '../../core/people/queries';

type CircleItemCategoryDoc = Doc<'circleItemCategories'>;
type CircleItemDoc = Doc<'circleItems'>;
type _CustomFieldDefinitionDoc = Doc<'customFieldDefinitions'>;
type _CustomFieldValueDoc = Doc<'customFieldValues'>;

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
 * Check if a category has already been migrated by looking for a definition
 * with matching workspaceId, entityType, name, and order.
 * Returns false if table/index doesn't exist yet (safe to proceed).
 */
async function isCategoryMigrated(
	ctx: MutationCtx,
	category: CircleItemCategoryDoc
): Promise<boolean> {
	try {
		// Try to query - if table/index doesn't exist, catch and return false
		const existing = await ctx.db
			.query('customFieldDefinitions')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', category.workspaceId))
			.filter((q) =>
				q.and(
					q.eq(q.field('entityType'), category.entityType),
					q.eq(q.field('name'), category.name),
					q.eq(q.field('order'), category.order),
					q.eq(q.field('createdAt'), category.createdAt)
				)
			)
			.first();

		return existing !== null;
	} catch (error: any) {
		// If index/table doesn't exist yet, assume nothing migrated
		if (error?.message?.includes('not found') || error?.message?.includes('Index')) {
			return false;
		}
		// Re-throw other errors
		throw error;
	}
}

/**
 * Check if a circleItem has already been migrated by looking for a value
 * with matching definitionId, entityId, and entityType.
 * Returns false if table/index doesn't exist yet (safe to proceed).
 */
async function isCircleItemMigrated(
	ctx: MutationCtx,
	item: CircleItemDoc,
	definitionId: Id<'customFieldDefinitions'>
): Promise<boolean> {
	try {
		// Try to query - if table/index doesn't exist, catch and return false
		const existing = await ctx.db
			.query('customFieldValues')
			.withIndex('by_definition', (q) => q.eq('definitionId', definitionId))
			.filter((q) =>
				q.and(
					q.eq(q.field('entityId'), item.entityId),
					q.eq(q.field('entityType'), item.entityType)
				)
			)
			.first();

		return existing !== null;
	} catch (error: any) {
		// If index/table doesn't exist yet, assume nothing migrated
		if (error?.message?.includes('not found') || error?.message?.includes('Index')) {
			return false;
		}
		// Re-throw other errors
		throw error;
	}
}

/**
 * Migrate circleItemCategories to customFieldDefinitions
 */
async function migrateCategories(ctx: MutationCtx): Promise<{
	migrated: number;
	skipped: number;
	errors: number;
	definitionMap: Map<Id<'circleItemCategories'>, Id<'customFieldDefinitions'>>;
	edgeCaseStats: {
		createdByNull: number;
		createdByNotFound: number;
		updatedByNull: number;
		updatedByNotFound: number;
		archivedByNull: number;
		archivedByNotFound: number;
	};
}> {
	console.log('🔄 Starting migration: circleItemCategories → customFieldDefinitions');

	const categories = await ctx.db.query('circleItemCategories').collect();
	const definitionMap = new Map<Id<'circleItemCategories'>, Id<'customFieldDefinitions'>>();
	let migrated = 0;
	let skipped = 0;
	let errors = 0;
	const edgeCaseStats = {
		createdByNull: 0,
		createdByNotFound: 0,
		updatedByNull: 0,
		updatedByNotFound: 0,
		archivedByNull: 0,
		archivedByNotFound: 0
	};

	for (const category of categories) {
		try {
			// Skip archived categories
			if (category.archivedAt) {
				skipped++;
				continue;
			}

			// Check if already migrated
			if (await isCategoryMigrated(ctx, category)) {
				// Find the existing definition to add to map
				try {
					const existing = await ctx.db
						.query('customFieldDefinitions')
						.withIndex('by_workspace', (q) => q.eq('workspaceId', category.workspaceId))
						.filter((q) =>
							q.and(
								q.eq(q.field('entityType'), category.entityType),
								q.eq(q.field('name'), category.name),
								q.eq(q.field('order'), category.order),
								q.eq(q.field('createdAt'), category.createdAt)
							)
						)
						.first();

					if (existing) {
						definitionMap.set(category._id, existing._id);
						skipped++;
						continue;
					}
				} catch (error: any) {
					// If index doesn't exist, proceed with migration
					if (error?.message?.includes('not found') || error?.message?.includes('Index')) {
						// Continue to migration
					} else {
						throw error;
					}
				}
			}

			// Check if workspace has people before attempting migration
			// Skip abandoned workspaces (no people) per SYOS-847 edge case handling
			if (!(await workspaceHasPeople(ctx, category.workspaceId))) {
				console.warn(
					`⚠️  Category ${category._id}: Workspace ${category.workspaceId} has no people, skipping (abandoned workspace)`
				);
				skipped++;
				continue;
			}

			// Resolve userId → personId for audit fields
			// Handle edge cases with logging per SYOS-847
			let createdByPersonId: Id<'people'>;
			if (!category.createdBy) {
				// Edge case: createdBy is null - use fallback person (required by schema)
				edgeCaseStats.createdByNull++;
				console.warn(
					`⚠️  Category ${category._id}: createdBy is null, using fallback person for workspace ${category.workspaceId}`
				);
				createdByPersonId = await findFallbackPerson(ctx, category.workspaceId);
			} else {
				const resolved = await resolvePersonId(ctx, category.createdBy, category.workspaceId);
				createdByPersonId = resolved.personId;
				if (resolved.usedFallback) {
					edgeCaseStats.createdByNotFound++;
					console.warn(
						`⚠️  Category ${category._id}: userId ${category.createdBy} not found in people table for workspace ${category.workspaceId}, using fallback person`
					);
				}
			}

			let updatedByPersonId: Id<'people'> | undefined;
			if (!category.updatedBy) {
				// Edge case: updatedBy is null - preserve as undefined (optional field)
				edgeCaseStats.updatedByNull++;
				updatedByPersonId = undefined;
			} else {
				const resolved = await resolvePersonId(ctx, category.updatedBy, category.workspaceId);
				updatedByPersonId = resolved.personId;
				if (resolved.usedFallback) {
					edgeCaseStats.updatedByNotFound++;
					console.warn(
						`⚠️  Category ${category._id}: updatedBy userId ${category.updatedBy} not found in people table for workspace ${category.workspaceId}, using fallback person`
					);
				}
			}

			let archivedByPersonId: Id<'people'> | undefined;
			if (category.archivedBy) {
				const resolved = await resolvePersonId(ctx, category.archivedBy, category.workspaceId);
				archivedByPersonId = resolved.personId;
				if (resolved.usedFallback) {
					edgeCaseStats.archivedByNotFound++;
					console.warn(
						`⚠️  Category ${category._id}: archivedBy userId ${category.archivedBy} not found in people table for workspace ${category.workspaceId}, using fallback person`
					);
				}
			} else if (category.archivedAt) {
				// Edge case: archivedAt is set but archivedBy is null
				edgeCaseStats.archivedByNull++;
				archivedByPersonId = undefined;
			}

			// Create new definition
			const definitionId = await ctx.db.insert('customFieldDefinitions', {
				workspaceId: category.workspaceId,
				entityType: category.entityType,
				name: category.name,
				description: undefined, // Legacy table doesn't have description
				order: category.order,
				systemKey: undefined, // Not a system field
				isSystemField: false,
				isRequired: false,
				fieldType: 'longText', // Default to longText (multi-line text)
				options: undefined,
				searchable: true,
				aiIndexed: false,
				createdAt: category.createdAt,
				createdByPersonId,
				updatedAt: category.updatedAt,
				updatedByPersonId,
				archivedAt: category.archivedAt,
				archivedByPersonId
			});

			definitionMap.set(category._id, definitionId);
			migrated++;
		} catch (error) {
			errors++;
			console.error(`❌ Failed to migrate category ${category._id}:`, error);
		}
	}

	console.log(`✅ Category migration complete:`);
	console.log(`   - Migrated: ${migrated}`);
	console.log(`   - Skipped (archived/already migrated/abandoned workspace): ${skipped}`);
	console.log(`   - Errors: ${errors}`);
	console.log(`   - Total processed: ${categories.length}`);
	console.log(`   - Edge case statistics:`);
	console.log(`     * createdBy null: ${edgeCaseStats.createdByNull}`);
	console.log(`     * createdBy userId not found: ${edgeCaseStats.createdByNotFound}`);
	console.log(`     * updatedBy null: ${edgeCaseStats.updatedByNull}`);
	console.log(`     * updatedBy userId not found: ${edgeCaseStats.updatedByNotFound}`);
	console.log(`     * archivedBy null: ${edgeCaseStats.archivedByNull}`);
	console.log(`     * archivedBy userId not found: ${edgeCaseStats.archivedByNotFound}`);

	return { migrated, skipped, errors, definitionMap, edgeCaseStats };
}

/**
 * Migrate circleItems to customFieldValues
 */
async function migrateCircleItems(
	ctx: MutationCtx,
	definitionMap: Map<Id<'circleItemCategories'>, Id<'customFieldDefinitions'>>
): Promise<{
	migrated: number;
	skipped: number;
	errors: number;
	edgeCaseStats: {
		createdByNull: number;
		createdByNotFound: number;
		updatedByNull: number;
		updatedByNotFound: number;
	};
}> {
	console.log('🔄 Starting migration: circleItems → customFieldValues');

	const items = await ctx.db.query('circleItems').collect();
	let migrated = 0;
	let skipped = 0;
	let errors = 0;
	const edgeCaseStats = {
		createdByNull: 0,
		createdByNotFound: 0,
		updatedByNull: 0,
		updatedByNotFound: 0
	};

	for (const item of items) {
		try {
			// Skip archived items
			if (item.archivedAt) {
				skipped++;
				continue;
			}

			// Get the corresponding definition ID
			const definitionId = definitionMap.get(item.categoryId);
			if (!definitionId) {
				// Category not migrated or archived - skip this item
				skipped++;
				continue;
			}

			// Check if already migrated
			if (await isCircleItemMigrated(ctx, item, definitionId)) {
				skipped++;
				continue;
			}

			// Check if workspace has people before attempting migration
			// Skip abandoned workspaces (no people) per SYOS-847 edge case handling
			if (!(await workspaceHasPeople(ctx, item.workspaceId))) {
				console.warn(
					`⚠️  CircleItem ${item._id}: Workspace ${item.workspaceId} has no people, skipping (abandoned workspace)`
				);
				skipped++;
				continue;
			}

			// Resolve userId → personId for audit fields
			// Handle edge cases with logging per SYOS-847
			let createdByPersonId: Id<'people'>;
			if (!item.createdBy) {
				// Edge case: createdBy is null - use fallback person (required by schema)
				edgeCaseStats.createdByNull++;
				console.warn(
					`⚠️  CircleItem ${item._id}: createdBy is null, using fallback person for workspace ${item.workspaceId}`
				);
				createdByPersonId = await findFallbackPerson(ctx, item.workspaceId);
			} else {
				const resolved = await resolvePersonId(ctx, item.createdBy, item.workspaceId);
				createdByPersonId = resolved.personId;
				if (resolved.usedFallback) {
					edgeCaseStats.createdByNotFound++;
					console.warn(
						`⚠️  CircleItem ${item._id}: userId ${item.createdBy} not found in people table for workspace ${item.workspaceId}, using fallback person`
					);
				}
			}

			let updatedByPersonId: Id<'people'> | undefined;
			if (!item.updatedBy) {
				// Edge case: updatedBy is null - preserve as undefined (optional field)
				edgeCaseStats.updatedByNull++;
				updatedByPersonId = undefined;
			} else {
				const resolved = await resolvePersonId(ctx, item.updatedBy, item.workspaceId);
				updatedByPersonId = resolved.personId;
				if (resolved.usedFallback) {
					edgeCaseStats.updatedByNotFound++;
					console.warn(
						`⚠️  CircleItem ${item._id}: updatedBy userId ${item.updatedBy} not found in people table for workspace ${item.workspaceId}, using fallback person`
					);
				}
			}

			// Convert content to JSON-encoded value
			// Content is already a string, so we JSON-encode it
			const value = JSON.stringify(item.content);

			// Create new value record
			await ctx.db.insert('customFieldValues', {
				workspaceId: item.workspaceId,
				definitionId,
				entityType: item.entityType,
				entityId: item.entityId,
				value,
				searchText: item.content, // Copy content as search text
				createdAt: item.createdAt,
				createdByPersonId,
				updatedAt: item.updatedAt,
				updatedByPersonId
			});

			migrated++;
		} catch (error) {
			errors++;
			console.error(`❌ Failed to migrate circleItem ${item._id}:`, error);
		}
	}

	console.log(`✅ CircleItem migration complete:`);
	console.log(`   - Migrated: ${migrated}`);
	console.log(
		`   - Skipped (archived/already migrated/missing category/abandoned workspace): ${skipped}`
	);
	console.log(`   - Errors: ${errors}`);
	console.log(`   - Total processed: ${items.length}`);
	console.log(`   - Edge case statistics:`);
	console.log(`     * createdBy null: ${edgeCaseStats.createdByNull}`);
	console.log(`     * createdBy userId not found: ${edgeCaseStats.createdByNotFound}`);
	console.log(`     * updatedBy null: ${edgeCaseStats.updatedByNull}`);
	console.log(`     * updatedBy userId not found: ${edgeCaseStats.updatedByNotFound}`);

	return { migrated, skipped, errors, edgeCaseStats };
}

/**
 * Main migration function
 */
export const migrateCircleItemsToCustomFields = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🚀 Starting migration: circleItems → customFields');
		console.log('='.repeat(60));

		// Step 1: Migrate categories first (definitions)
		const categoryResult = await migrateCategories(ctx);

		// Step 2: Migrate items (values) using the definition map
		const itemResult = await migrateCircleItems(ctx, categoryResult.definitionMap);

		// Summary
		console.log('='.repeat(60));
		console.log('📊 Migration Summary:');
		console.log(`   Categories:`);
		console.log(`     - Migrated: ${categoryResult.migrated}`);
		console.log(`     - Skipped: ${categoryResult.skipped}`);
		console.log(`     - Errors: ${categoryResult.errors}`);
		console.log(`   CircleItems:`);
		console.log(`     - Migrated: ${itemResult.migrated}`);
		console.log(`     - Skipped: ${itemResult.skipped}`);
		console.log(`     - Errors: ${itemResult.errors}`);
		console.log(`   Edge Cases (Categories):`);
		console.log(`     - createdBy null: ${categoryResult.edgeCaseStats.createdByNull}`);
		console.log(
			`     - createdBy userId not found: ${categoryResult.edgeCaseStats.createdByNotFound}`
		);
		console.log(`     - updatedBy null: ${categoryResult.edgeCaseStats.updatedByNull}`);
		console.log(
			`     - updatedBy userId not found: ${categoryResult.edgeCaseStats.updatedByNotFound}`
		);
		console.log(`     - archivedBy null: ${categoryResult.edgeCaseStats.archivedByNull}`);
		console.log(
			`     - archivedBy userId not found: ${categoryResult.edgeCaseStats.archivedByNotFound}`
		);
		console.log(`   Edge Cases (CircleItems):`);
		console.log(`     - createdBy null: ${itemResult.edgeCaseStats.createdByNull}`);
		console.log(`     - createdBy userId not found: ${itemResult.edgeCaseStats.createdByNotFound}`);
		console.log(`     - updatedBy null: ${itemResult.edgeCaseStats.updatedByNull}`);
		console.log(`     - updatedBy userId not found: ${itemResult.edgeCaseStats.updatedByNotFound}`);
		console.log('='.repeat(60));
		console.log('✅ Migration complete!');
		console.log('');
		console.log('📋 Next Steps:');
		console.log(
			'   1. Verify XDOM-01 invariant passes: npx convex run admin/invariants/crossDomain:checkXDOM01'
		);
		console.log(
			'   2. Verify no userId references remain in circleItems/circleItemCategories tables'
		);
		console.log('   3. Review edge case warnings above for any data quality issues');

		return {
			categories: {
				migrated: categoryResult.migrated,
				skipped: categoryResult.skipped,
				errors: categoryResult.errors,
				edgeCaseStats: categoryResult.edgeCaseStats
			},
			circleItems: {
				migrated: itemResult.migrated,
				skipped: itemResult.skipped,
				errors: itemResult.errors,
				edgeCaseStats: itemResult.edgeCaseStats
			}
		};
	}
});
