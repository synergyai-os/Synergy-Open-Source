/**
 * Custom Fields Constants
 *
 * Master list of system field definitions that get seeded per workspace.
 * These define the standard OPTIONAL fields that exist for roles and circles.
 *
 * DR-011: Governance fields (purpose, decisionRights) are stored directly on
 * core schema tables (circles, circleRoles), NOT in customFieldValues.
 * Only workspace-configurable fields are defined here.
 *
 * @see DR-011 in dev-docs/master-docs/architecture.md
 * @see tables.ts for table schema
 * @see schema.ts for type definitions
 */

import type { CustomFieldEntityType, CustomFieldType } from './schema';

/**
 * System field definition template.
 * Used for seeding system fields in new workspaces.
 *
 * Note: Workspace-specific fields (workspaceId, audit fields) are not included
 * as they are added during the seeding process.
 */
export interface SystemFieldDefinitionTemplate {
	entityType: CustomFieldEntityType;
	systemKey: string;
	name: string;
	fieldType: CustomFieldType;
	isRequired: boolean;
	isSystemField: boolean;
	searchable: boolean;
	aiIndexed: boolean;
	order: number;
}

/**
 * Master list of system field definitions.
 * These are seeded into customFieldDefinitions table for each workspace.
 *
 * DR-011: GOVERNANCE FIELDS ARE NOT INCLUDED HERE
 * - Purpose (role/circle): Stored on schema - GOV-02 invariant
 * - Decision Rights (role): Stored on schema - GOV-03 invariant
 *
 * Role fields (workspace-configurable):
 * - Accountabilities: What this role is accountable for delivering
 * - Domains: What areas this role has authority over
 * - Policies: Rules and constraints for this role
 * - Steering Metrics: How this role measures success
 * - Notes: Additional context and information
 *
 * Circle fields (workspace-configurable):
 * - Domains: What areas this circle has authority over
 * - Accountabilities: What this circle is accountable for delivering
 * - Policies: Rules and constraints for this circle
 * - Notes: Additional context and information
 */
export const SYSTEM_FIELD_DEFINITIONS = [
	// ========================================================================
	// Role Fields (workspace-configurable, NOT governance fields)
	// Note: purpose and decision_right are now on schema (DR-011)
	// ========================================================================
	{
		entityType: 'role' as const,
		systemKey: 'accountability',
		name: 'Accountabilities',
		fieldType: 'textList' as const,
		isRequired: false,
		isSystemField: true,
		searchable: true,
		aiIndexed: true,
		order: 1
	},
	{
		entityType: 'role' as const,
		systemKey: 'domain',
		name: 'Domains',
		fieldType: 'textList' as const,
		isRequired: false,
		isSystemField: true,
		searchable: true,
		aiIndexed: true,
		order: 2
	},
	{
		entityType: 'role' as const,
		systemKey: 'policy',
		name: 'Policies',
		fieldType: 'textList' as const,
		isRequired: false,
		isSystemField: true,
		searchable: true,
		aiIndexed: true,
		order: 3
	},
	{
		entityType: 'role' as const,
		systemKey: 'steering_metric',
		name: 'Steering Metrics',
		fieldType: 'textList' as const,
		isRequired: false,
		isSystemField: true,
		searchable: true,
		aiIndexed: true,
		order: 4
	},
	{
		entityType: 'role' as const,
		systemKey: 'note',
		name: 'Notes',
		fieldType: 'longText' as const,
		isRequired: false,
		isSystemField: true,
		searchable: true,
		aiIndexed: true,
		order: 5
	},

	// ========================================================================
	// Circle Fields (workspace-configurable, NOT governance fields)
	// Note: purpose is now on schema (DR-011)
	// ========================================================================
	{
		entityType: 'circle' as const,
		systemKey: 'domain',
		name: 'Domains',
		fieldType: 'textList' as const,
		isRequired: false,
		isSystemField: true,
		searchable: true,
		aiIndexed: true,
		order: 1
	},
	{
		entityType: 'circle' as const,
		systemKey: 'accountability',
		name: 'Accountabilities',
		fieldType: 'textList' as const,
		isRequired: false,
		isSystemField: true,
		searchable: true,
		aiIndexed: true,
		order: 2
	},
	{
		entityType: 'circle' as const,
		systemKey: 'policy',
		name: 'Policies',
		fieldType: 'textList' as const,
		isRequired: false,
		isSystemField: true,
		searchable: true,
		aiIndexed: true,
		order: 3
	},
	{
		entityType: 'circle' as const,
		systemKey: 'note',
		name: 'Notes',
		fieldType: 'longText' as const,
		isRequired: false,
		isSystemField: true,
		searchable: true,
		aiIndexed: true,
		order: 4
	}
] as const satisfies readonly SystemFieldDefinitionTemplate[];

/**
 * Type representing a single system field definition.
 * Extracted from the SYSTEM_FIELD_DEFINITIONS array.
 */
export type SystemFieldDefinition = (typeof SYSTEM_FIELD_DEFINITIONS)[number];

// ============================================================================
// History Tracking Configuration
// ============================================================================

/**
 * Entity types that have governance history tracking enabled.
 * These entities will have custom field changes recorded in the history system.
 *
 * Note: History tracking implementation is pending - this constant establishes
 * the foundation for future history feature (SYOS-994).
 */
export const HISTORY_TRACKED_ENTITY_TYPES = ['circle', 'role'] as const;

/**
 * Check if an entity type has history tracking enabled.
 *
 * @param entityType - The entity type to check
 * @returns True if history tracking is enabled for this entity type
 */
export function isHistoryTracked(entityType: string): boolean {
	return HISTORY_TRACKED_ENTITY_TYPES.includes(
		entityType as (typeof HISTORY_TRACKED_ENTITY_TYPES)[number]
	);
}
