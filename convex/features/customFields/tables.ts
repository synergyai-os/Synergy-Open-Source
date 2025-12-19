import { defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Supported entity types for custom fields.
 * Extensible: add new entity types as needed.
 */
export const customFieldEntityTypes = v.union(
	v.literal('circle'),
	v.literal('role'),
	v.literal('person'),
	v.literal('inboxItem'),
	v.literal('task'),
	v.literal('project'),
	v.literal('meeting')
);

/**
 * Supported field types for custom field definitions.
 * Each type determines validation and UI rendering.
 */
export const customFieldTypes = v.union(
	v.literal('text'), // Single line text
	v.literal('longText'), // Multi-line text (textarea)
	v.literal('textList'), // Array of free-text items
	v.literal('number'), // Numeric value
	v.literal('boolean'), // True/false toggle
	v.literal('date'), // Date picker
	v.literal('select'), // Single select from options
	v.literal('multiSelect'), // Multiple select from options
	v.literal('url'), // URL with validation
	v.literal('email') // Email with validation
);

/**
 * customFieldDefinitions - Defines custom fields for a workspace
 *
 * This table stores the schema/definition of custom fields that can be
 * applied to various entity types (circles, roles, people, etc.).
 *
 * Key concepts:
 * - System fields: Pre-defined fields that are required but can be relabeled
 *   (e.g., "Purpose" for circles, "Accountabilities" for roles)
 * - User fields: Custom fields created by workspace users
 *
 * @see XDOM-01: All audit fields use personId, not userId
 * @see SYOS-790: Custom fields feature design
 */
export const customFieldDefinitionsTable = defineTable({
	// Workspace scoping
	workspaceId: v.id('workspaces'),

	// Which entity type this field applies to
	entityType: customFieldEntityTypes,

	// Field metadata
	name: v.string(), // Display name (user can customize for system fields)
	description: v.optional(v.string()), // Help text shown in UI
	order: v.number(), // Display order within entity type

	// System field configuration
	systemKey: v.optional(v.string()), // Internal key for system fields (e.g., 'purpose', 'accountabilities')
	isSystemField: v.boolean(), // True if this is a pre-defined system field
	isRequired: v.boolean(), // True if value must be set

	// Field type and validation
	fieldType: customFieldTypes,
	options: v.optional(v.array(v.string())), // For select/multiSelect: available options

	// AI and search optimization
	searchable: v.boolean(), // Include in full-text search
	aiIndexed: v.boolean(), // Include in AI context/embeddings

	// Audit fields (using personId per XDOM-01 invariant)
	createdAt: v.number(),
	createdByPersonId: v.id('people'),
	updatedAt: v.number(),
	updatedByPersonId: v.optional(v.id('people')),

	// Soft delete (per architecture.md pattern)
	archivedAt: v.optional(v.number()),
	archivedByPersonId: v.optional(v.id('people'))
})
	// Primary lookup: all definitions for a workspace
	.index('by_workspace', ['workspaceId'])
	// Filtered lookup: definitions for specific entity type in workspace
	.index('by_workspace_entity', ['workspaceId', 'entityType'])
	// System field lookup: find by systemKey for migrations/seeding
	.index('by_workspace_system_key', ['workspaceId', 'systemKey'])
	// Search index for searchable definitions
	.index('by_searchable', ['workspaceId', 'searchable'])
	// AI index for AI-indexed definitions
	.index('by_ai_indexed', ['workspaceId', 'aiIndexed']);

/**
 * customFieldValues - Stores values for custom fields on entities
 *
 * This table stores the actual values of custom fields for specific entities.
 * It's a sparse table: only entities with values have records.
 *
 * Value storage:
 * - value: JSON-encoded value (string, number, boolean, array, etc.)
 * - searchText: Denormalized text for full-text search (extracted from value)
 *
 * @see XDOM-01: All audit fields use personId, not userId
 * @see SYOS-790: Custom fields feature design
 */
export const customFieldValuesTable = defineTable({
	// Workspace scoping (denormalized for efficient queries)
	workspaceId: v.id('workspaces'),

	// Links to definition
	definitionId: v.id('customFieldDefinitions'),

	// Target entity
	entityType: customFieldEntityTypes, // Denormalized from definition for efficient queries
	entityId: v.string(), // ID of the target entity (circle, role, person, etc.)

	// Value storage
	value: v.string(), // JSON-encoded value
	searchText: v.optional(v.string()), // Extracted text for search indexing
	order: v.optional(v.number()), // For textList items; undefined for single-value fields

	// Audit fields (using personId per XDOM-01 invariant)
	createdAt: v.number(),
	createdByPersonId: v.id('people'),
	updatedAt: v.number(),
	updatedByPersonId: v.optional(v.id('people'))
})
	// Primary lookup: all values for a specific entity
	.index('by_entity', ['entityType', 'entityId'])
	// Get specific value: definition + entity combo
	.index('by_definition_entity', ['definitionId', 'entityId'])
	// Workspace-wide queries
	.index('by_workspace', ['workspaceId'])
	// Filter by entity type in workspace
	.index('by_workspace_entity', ['workspaceId', 'entityType'])
	// Search optimization: find values by definition
	.index('by_definition', ['definitionId']);
