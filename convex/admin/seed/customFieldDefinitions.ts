/**
 * System Custom Field Definitions
 *
 * Creates the system field definitions for circles and roles per SYOS-790.
 * These are workspace-scoped definitions that exist on all entities of their type.
 * Users can rename these but cannot delete them.
 *
 * System Fields:
 * - Circle fields: purpose, domain, accountability, policy, decision_right, note
 * - Role fields: purpose, decision_right, accountability, domain, policy, steering_metric, note
 *
 * Note: Role holders are tracked via the `assignments` table, not custom fields.
 *
 * @see SYOS-955: SYSTEM_FIELD_DEFINITIONS constant (single source of truth)
 * @see SYOS-959: Update seeding to use SYSTEM_FIELD_DEFINITIONS
 */

import type { MutationCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { SYSTEM_FIELD_DEFINITIONS } from '../../features/customFields/constants';

/**
 * Create system custom field definitions for a workspace
 *
 * Idempotent - checks for existing definitions before creating.
 * Definitions are workspace-scoped and created by the workspace creator.
 *
 * @param ctx - Mutation context
 * @param workspaceId - Workspace to seed definitions for
 * @param personId - Person creating the definitions (workspace creator)
 * @returns Summary of created/skipped definitions
 */
export async function createSystemCustomFieldDefinitions(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	personId: Id<'people'>
): Promise<{ created: number; skipped: number }> {
	const now = Date.now();
	let created = 0;
	let skipped = 0;

	console.log(`📋 Creating system custom field definitions for workspace ${workspaceId}...`);

	// Get all existing definitions for this workspace once (more efficient)
	const existingDefinitions = await ctx.db
		.query('customFieldDefinitions')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.filter((q) => q.eq(q.field('archivedAt'), undefined))
		.collect();

	for (const field of SYSTEM_FIELD_DEFINITIONS) {
		// Check if this specific definition already exists
		// Must match on workspaceId + entityType + systemKey
		const existing = existingDefinitions.find(
			(d) =>
				d.workspaceId === workspaceId &&
				d.entityType === field.entityType &&
				d.systemKey === field.systemKey &&
				!d.archivedAt
		);

		if (existing) {
			console.log(
				`  ⏭️  Field "${field.name}" (${field.entityType}, ${field.systemKey}) already exists, skipping...`
			);
			skipped++;
			continue;
		}

		// Create system field definition
		await ctx.db.insert('customFieldDefinitions', {
			workspaceId,
			entityType: field.entityType,
			name: field.name,
			description: undefined,
			order: field.order,
			systemKey: field.systemKey,
			isSystemField: field.isSystemField,
			isRequired: field.isRequired,
			fieldType: field.fieldType,
			options: undefined,
			searchable: field.searchable,
			aiIndexed: field.aiIndexed,
			createdAt: now,
			createdByPersonId: personId,
			updatedAt: now,
			updatedByPersonId: undefined,
			archivedAt: undefined,
			archivedByPersonId: undefined
		});

		console.log(`  ✅ Created field: ${field.name} (${field.entityType}, ${field.systemKey})`);
		created++;
	}

	console.log(
		`📋 Custom field definitions ready: ${created} created, ${skipped} already existed (${SYSTEM_FIELD_DEFINITIONS.length} total)\n`
	);

	return { created, skipped };
}
