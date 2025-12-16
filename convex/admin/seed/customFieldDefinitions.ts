/**
 * System Custom Field Definitions
 *
 * Creates the system field definitions for circles and roles per SYOS-790.
 * These are workspace-scoped definitions that exist on all entities of their type.
 * Users can rename these but cannot delete them.
 *
 * System Fields:
 * - Circle fields: purpose, domains, accountabilities, policies, decision_rights, notes
 * - Role fields: purpose, accountabilities, steering_metrics, decision_rights, role_filling,
 *   domains, policies, notes (matches Role & Decision Rights Charter + additional fields)
 *
 * Note: Role holders are tracked via the `assignments` table, not custom fields.
 */

import type { MutationCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';

/**
 * System field definition structure
 */
interface CustomFieldDefinition {
	entityType: 'circle' | 'role';
	systemKey: string;
	name: string;
	order: number;
}

/**
 * System field definitions per SYOS-790
 *
 * These are the default fields that exist on all circles and roles.
 * They are workspace-scoped (created per workspace) but follow a standard schema.
 */
const SYSTEM_FIELD_DEFINITIONS: CustomFieldDefinition[] = [
	// Circle fields (keeping existing structure)
	{ entityType: 'circle', systemKey: 'purpose', name: 'Purpose', order: 0 },
	{ entityType: 'circle', systemKey: 'domains', name: 'Domains', order: 1 },
	{ entityType: 'circle', systemKey: 'accountabilities', name: 'Accountabilities', order: 2 },
	{ entityType: 'circle', systemKey: 'policies', name: 'Policies', order: 3 },
	{ entityType: 'circle', systemKey: 'decision_rights', name: 'Decision Rights', order: 4 },
	{ entityType: 'circle', systemKey: 'notes', name: 'Notes', order: 5 },
	// Role fields (matching Role & Decision Rights Charter + additional fields)
	{ entityType: 'role', systemKey: 'purpose', name: 'Role Purpose', order: 0 },
	{ entityType: 'role', systemKey: 'accountabilities', name: 'Accountabilities', order: 1 },
	{ entityType: 'role', systemKey: 'steering_metrics', name: 'Steering Metrics', order: 2 },
	{ entityType: 'role', systemKey: 'decision_rights', name: 'Decision Rights', order: 3 },
	{ entityType: 'role', systemKey: 'role_filling', name: 'Role Filling', order: 4 },
	{ entityType: 'role', systemKey: 'domains', name: 'Domains', order: 5 },
	{ entityType: 'role', systemKey: 'policies', name: 'Policies', order: 6 },
	{ entityType: 'role', systemKey: 'notes', name: 'Notes', order: 7 }
	// Note: Role Holder(s) is tracked via assignments table, not a custom field
];

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
			isSystemField: true,
			isRequired: false, // System fields exist but values are optional
			fieldType: 'longText', // Default to longText for all system fields
			options: undefined,
			searchable: true, // Include in search
			aiIndexed: true, // Include in AI context
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
