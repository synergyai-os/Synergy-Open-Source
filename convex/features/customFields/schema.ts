/**
 * Custom Fields Schema Types
 *
 * Type definitions and aliases for the custom fields feature.
 *
 * @see tables.ts for table definitions
 * @see README.md for feature documentation
 */

import type { Doc, Id } from '../../_generated/dataModel';

// ============================================================================
// Document Types
// ============================================================================

/**
 * A custom field definition document.
 * Defines the schema for a custom field in a workspace.
 */
export type CustomFieldDefinitionDoc = Doc<'customFieldDefinitions'>;

/**
 * A custom field value document.
 * Stores the actual value of a custom field for a specific entity.
 */
export type CustomFieldValueDoc = Doc<'customFieldValues'>;

// ============================================================================
// ID Types
// ============================================================================

export type CustomFieldDefinitionId = Id<'customFieldDefinitions'>;
export type CustomFieldValueId = Id<'customFieldValues'>;

// ============================================================================
// Entity Types
// ============================================================================

/**
 * Supported entity types for custom fields.
 * Must match the union in tables.ts.
 */
export type CustomFieldEntityType =
	| 'circle'
	| 'role'
	| 'person'
	| 'inboxItem'
	| 'task'
	| 'project'
	| 'meeting';

// ============================================================================
// Field Types
// ============================================================================

/**
 * Supported field types for custom field definitions.
 * Must match the union in tables.ts.
 */
export type CustomFieldType =
	| 'text'
	| 'longText'
	| 'textList'
	| 'number'
	| 'boolean'
	| 'date'
	| 'select'
	| 'multiSelect'
	| 'url'
	| 'email';

// ============================================================================
// System Field Keys
// ============================================================================

/**
 * Known system field keys for circles.
 * These are pre-defined fields that every circle has.
 */
export type CircleSystemFieldKey = 'purpose' | 'domain' | 'strategy';

/**
 * Known system field keys for roles.
 * These are pre-defined fields that every role has.
 */
export type RoleSystemFieldKey = 'purpose' | 'accountabilities' | 'domains';

/**
 * All known system field keys.
 */
export type SystemFieldKey = CircleSystemFieldKey | RoleSystemFieldKey;

// ============================================================================
// Value Types
// ============================================================================

/**
 * Typed value representations for different field types.
 * Used when parsing the JSON-encoded value string.
 */
export type TextValue = string;
export type LongTextValue = string;
export type NumberValue = number;
export type BooleanValue = boolean;
export type DateValue = string; // ISO 8601 date string
export type SelectValue = string;
export type MultiSelectValue = string[];
export type UrlValue = string;
export type EmailValue = string;

/**
 * Union of all possible custom field values.
 */
export type CustomFieldValue =
	| TextValue
	| LongTextValue
	| NumberValue
	| BooleanValue
	| DateValue
	| SelectValue
	| MultiSelectValue
	| UrlValue
	| EmailValue;

// ============================================================================
// API Types
// ============================================================================

/**
 * Input for creating a custom field definition.
 */
export interface CreateCustomFieldDefinitionInput {
	workspaceId: Id<'workspaces'>;
	entityType: CustomFieldEntityType;
	name: string;
	description?: string;
	order: number;
	systemKey?: string;
	isSystemField: boolean;
	isRequired: boolean;
	fieldType: CustomFieldType;
	options?: string[];
	searchable: boolean;
	aiIndexed: boolean;
}

/**
 * Input for updating a custom field definition.
 */
export interface UpdateCustomFieldDefinitionInput {
	name?: string;
	description?: string;
	order?: number;
	isRequired?: boolean;
	options?: string[];
	searchable?: boolean;
	aiIndexed?: boolean;
}

/**
 * Input for setting a custom field value.
 */
export interface SetCustomFieldValueInput {
	workspaceId: Id<'workspaces'>;
	definitionId: Id<'customFieldDefinitions'>;
	entityType: CustomFieldEntityType;
	entityId: string;
	value: CustomFieldValue;
}

// ============================================================================
// View Types
// ============================================================================

/**
 * A custom field definition with its current value for a specific entity.
 * Used in UI to display field definitions alongside their values.
 */
export interface CustomFieldWithValue {
	definition: CustomFieldDefinitionDoc;
	value: CustomFieldValueDoc | null;
	parsedValue: CustomFieldValue | null;
}

/**
 * All custom fields for an entity, grouped by their definitions.
 */
export interface EntityCustomFields {
	entityType: CustomFieldEntityType;
	entityId: string;
	fields: CustomFieldWithValue[];
}
