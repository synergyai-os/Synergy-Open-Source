/**
 * Custom Fields Constants
 *
 * Master list of system field definitions that get seeded per workspace.
 * These define the standard fields that exist for roles and circles.
 *
 * @see SYOS-955: Create SYSTEM_FIELD_DEFINITIONS constant
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
 * Role fields: Define the standard structure of a role in the organization
 * - Purpose: Why this role exists
 * - Decision Rights: What decisions this role can make
 * - Accountabilities: What this role is accountable for delivering
 * - Domains: What areas this role has authority over
 * - Policies: Rules and constraints for this role
 * - Steering Metrics: How this role measures success
 * - Notes: Additional context and information
 *
 * Circle fields: Define the standard structure of a circle in the organization
 * - Purpose: Why this circle exists
 * - Domains: What areas this circle has authority over
 * - Accountabilities: What this circle is accountable for delivering
 * - Policies: Rules and constraints for this circle
 * - Decision Rights: What decisions this circle can make
 * - Notes: Additional context and information
 */
export const SYSTEM_FIELD_DEFINITIONS = [
	// ========================================================================
	// Role Fields
	// ========================================================================
	{
		entityType: 'role' as const,
		systemKey: 'purpose',
		name: 'Purpose',
		fieldType: 'text' as const,
		isRequired: true,
		isSystemField: true,
		searchable: true,
		aiIndexed: true,
		order: 1
	},
	{
		entityType: 'role' as const,
		systemKey: 'decision_right',
		name: 'Decision Rights',
		fieldType: 'textList' as const,
		isRequired: true,
		isSystemField: true,
		searchable: true,
		aiIndexed: true,
		order: 2
	},
	{
		entityType: 'role' as const,
		systemKey: 'accountability',
		name: 'Accountabilities',
		fieldType: 'textList' as const,
		isRequired: false,
		isSystemField: true,
		searchable: true,
		aiIndexed: true,
		order: 3
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
		order: 4
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
		order: 5
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
		order: 6
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
		order: 7
	},

	// ========================================================================
	// Circle Fields
	// ========================================================================
	{
		entityType: 'circle' as const,
		systemKey: 'purpose',
		name: 'Purpose',
		fieldType: 'text' as const,
		isRequired: true,
		isSystemField: true,
		searchable: true,
		aiIndexed: true,
		order: 1
	},
	{
		entityType: 'circle' as const,
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
		entityType: 'circle' as const,
		systemKey: 'accountability',
		name: 'Accountabilities',
		fieldType: 'textList' as const,
		isRequired: false,
		isSystemField: true,
		searchable: true,
		aiIndexed: true,
		order: 3
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
		order: 4
	},
	{
		entityType: 'circle' as const,
		systemKey: 'decision_right',
		name: 'Decision Rights',
		fieldType: 'textList' as const,
		isRequired: false,
		isSystemField: true,
		searchable: true,
		aiIndexed: true,
		order: 5
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
		order: 6
	}
] as const satisfies readonly SystemFieldDefinitionTemplate[];

/**
 * Type representing a single system field definition.
 * Extracted from the SYSTEM_FIELD_DEFINITIONS array.
 */
export type SystemFieldDefinition = (typeof SYSTEM_FIELD_DEFINITIONS)[number];
