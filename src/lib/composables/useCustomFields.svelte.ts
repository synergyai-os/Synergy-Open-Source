/**
 * Composable for managing custom fields for entities (roles, circles, etc.)
 *
 * Provides reactive queries and mutations for custom field definitions and values.
 * This is a shared composable that can be used across all modules.
 *
 * @see convex/features/customFields/ for backend implementation
 * @see architecture.md → "Frontend Patterns" → "Composables Pattern"
 */

import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
import { useConvexClient } from 'convex-svelte';
import { api } from '$lib/convex';
import type { Id } from '$lib/convex/_generated/dataModel';
import { invariant } from '$lib/utils/invariant';

export interface CustomFieldDefinition {
	_id: Id<'customFieldDefinitions'>;
	name: string;
	description?: string;
	order: number;
	systemKey?: string;
	isSystemField: boolean;
	fieldType:
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
	options?: string[];
}

export interface CustomFieldValue {
	_id: Id<'customFieldValues'>;
	definitionId: Id<'customFieldDefinitions'>;
	value: string; // JSON-encoded
	parsedValue: unknown; // Parsed JSON value
}

export interface CustomFieldWithValue {
	definition: CustomFieldDefinition;
	value: CustomFieldValue | null;
	parsedValue: unknown | null;
}

export type CustomFieldEntityType =
	| 'circle'
	| 'role'
	| 'person'
	| 'inboxItem'
	| 'task'
	| 'project'
	| 'meeting';

export interface UseCustomFieldsOptions {
	sessionId: () => string | undefined;
	workspaceId: () => string | undefined;
	entityType: () => CustomFieldEntityType | null;
	entityId: () => string | null;
}

export interface UseCustomFieldsReturn {
	// Queries
	fields: CustomFieldWithValue[];
	isLoading: boolean;
	error: unknown;

	// Helpers
	getFieldBySystemKey: (systemKey: string) => CustomFieldWithValue | null;
	getFieldByName: (name: string) => CustomFieldWithValue | null;

	// Mutations
	setFieldValue: (definitionId: Id<'customFieldDefinitions'>, value: unknown) => Promise<void>;
	deleteFieldValue: (definitionId: Id<'customFieldDefinitions'>) => Promise<void>;
}

/**
 * Hook to manage custom fields reactively
 *
 * Returns fields in order defined by `definition.order` from database.
 * Iterate over `fields` array rather than looking up individual fields.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useCustomFields } from '$lib/composables/useCustomFields.svelte';
 *
 *   const customFields = useCustomFields({
 *     sessionId: () => $page.data.sessionId,
 *     workspaceId: () => workspaceId,
 *     entityType: () => 'circle',
 *     entityId: () => circle?.circleId ?? null
 *   });
 * </script>
 *
 * {#each customFields.fields as field (field.definition._id)}
 *   <CustomFieldSection {field} />
 * {/each}
 * ```
 */
export function useCustomFields(options: UseCustomFieldsOptions): UseCustomFieldsReturn {
	const convexClient = browser ? useConvexClient() : null;
	const getSessionId = options.sessionId;
	const getWorkspaceId = options.workspaceId;
	const getEntityType = options.entityType;
	const getEntityId = options.entityId;

	// Query: Get all field definitions for entity type
	const definitionsQuery = $derived(
		browser && getSessionId() && getWorkspaceId() && getEntityType()
			? useQuery(api.features.customFields.queries.listDefinitions, () => {
					const sessionId = getSessionId();
					const workspaceId = getWorkspaceId();
					const entityType = getEntityType();
					invariant(
						sessionId && workspaceId && entityType,
						'sessionId, workspaceId, and entityType required'
					);
					return {
						sessionId,
						workspaceId: workspaceId as Id<'workspaces'>,
						entityType: entityType as CustomFieldEntityType
					};
				})
			: null
	);

	// Query: Get all values for entity
	const valuesQuery = $derived(
		browser && getSessionId() && getEntityType() && getEntityId()
			? useQuery(api.features.customFields.queries.listValues, () => {
					const sessionId = getSessionId();
					const entityType = getEntityType();
					const entityId = getEntityId();
					invariant(
						sessionId && entityType && entityId,
						'sessionId, entityType, and entityId required'
					);
					return {
						sessionId,
						entityType: entityType as CustomFieldEntityType,
						entityId
					};
				})
			: null
	);

	// Combine definitions with values
	const fields = $derived.by(() => {
		const definitions = definitionsQuery?.data ?? [];
		const values = valuesQuery?.data ?? [];

		// SYOS-963: Group values by definitionId to handle multi-value fields
		// Multi-value fields (accountabilities, domains, etc.) have multiple rows with same definitionId
		const valueGroups: Record<string, CustomFieldValue[]> = {};
		for (const value of values) {
			// Values are stored as plain strings - no JSON parsing needed (SYOS-963)
			if (!valueGroups[value.definitionId]) {
				valueGroups[value.definitionId] = [];
			}
			valueGroups[value.definitionId].push({
				_id: value._id,
				definitionId: value.definitionId,
				value: value.value,
				parsedValue: value.value // Plain string
			});
		}

		// Combine definitions with their values
		return definitions.map((def): CustomFieldWithValue => {
			const fieldValues = valueGroups[def._id] ?? [];

			// Determine if this field should return array or single value based on fieldType
			// textList fields return arrays, all other types return single values (SYOS-967)
			const isMultiValueField = def.fieldType === 'textList';

			if (isMultiValueField) {
				// Return array of parsed values for multi-value fields
				return {
					definition: {
						_id: def._id,
						name: def.name,
						description: def.description,
						order: def.order,
						systemKey: def.systemKey,
						isSystemField: def.isSystemField,
						fieldType: def.fieldType,
						options: def.options
					},
					value: fieldValues[0] ?? null, // Keep first for backward compat
					parsedValue: fieldValues.map((v) => v.parsedValue) // Array of values
				};
			} else {
				// Return single value for single-value fields (purpose, notes, etc.)
				return {
					definition: {
						_id: def._id,
						name: def.name,
						description: def.description,
						order: def.order,
						systemKey: def.systemKey,
						isSystemField: def.isSystemField,
						fieldType: def.fieldType,
						options: def.options
					},
					value: fieldValues[0] ?? null,
					parsedValue: fieldValues[0]?.parsedValue ?? null // Single value
				};
			}
		});
	});

	// Helper: Get field by system key (use sparingly - prefer iterating over fields)
	function getFieldBySystemKey(systemKey: string): CustomFieldWithValue | null {
		return fields.find((f) => f.definition.systemKey === systemKey) ?? null;
	}

	// Helper: Get field by name (use sparingly - prefer iterating over fields)
	function getFieldByName(name: string): CustomFieldWithValue | null {
		return fields.find((f) => f.definition.name === name) ?? null;
	}

	// Mutation: Set field value
	async function setFieldValue(
		definitionId: Id<'customFieldDefinitions'>,
		value: unknown
	): Promise<void> {
		invariant(convexClient, 'Convex client not available');
		const sessionId = getSessionId();
		const entityType = getEntityType();
		const entityId = getEntityId();
		invariant(sessionId && entityType && entityId, 'sessionId, entityType, and entityId required');

		await convexClient.mutation(api.features.customFields.mutations.setValue, {
			sessionId,
			definitionId,
			entityType: entityType as CustomFieldEntityType,
			entityId,
			value
		});
	}

	// Mutation: Delete field value
	async function deleteFieldValue(definitionId: Id<'customFieldDefinitions'>): Promise<void> {
		invariant(convexClient, 'Convex client not available');
		const sessionId = getSessionId();
		const entityId = getEntityId();
		invariant(sessionId && entityId, 'sessionId and entityId required');

		await convexClient.mutation(api.features.customFields.mutations.archiveValue, {
			sessionId,
			definitionId,
			entityId
		});
	}

	return {
		get fields() {
			return fields;
		},
		get isLoading() {
			return definitionsQuery?.isLoading ?? valuesQuery?.isLoading ?? false;
		},
		get error() {
			return definitionsQuery?.error ?? valuesQuery?.error ?? null;
		},
		getFieldBySystemKey,
		getFieldByName,
		setFieldValue,
		deleteFieldValue
	};
}
