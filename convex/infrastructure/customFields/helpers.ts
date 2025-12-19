/**
 * Custom Fields Infrastructure Helpers
 *
 * Cross-cutting utilities for custom field value creation.
 * Lives in infrastructure layer so core domains can use it (Principle #5).
 *
 * @see SYOS-960: Update role creation to use customFieldValues
 * @see SYOS-984: Helpers for reading/writing custom field values by systemKey
 */

import type { Id, Doc } from '../../_generated/dataModel';
import type { QueryCtx, MutationCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../errors/codes';

/**
 * Check if a field is a custom field (stored in customFieldValues)
 * by querying the customFieldDefinitions table.
 *
 * @see SYOS-989: Database-driven custom field detection
 *
 * @param ctx - Query or Mutation context with db access
 * @param workspaceId - Workspace ID
 * @param field - Field name (systemKey) to check
 * @returns true if the field exists in customFieldDefinitions, false otherwise
 */
export async function isCustomField(
	ctx: { db: QueryCtx['db'] | MutationCtx['db'] },
	workspaceId: Id<'workspaces'>,
	field: string
): Promise<boolean> {
	const definition = await ctx.db
		.query('customFieldDefinitions')
		.withIndex('by_workspace_system_key', (q) =>
			q.eq('workspaceId', workspaceId).eq('systemKey', field)
		)
		.first();

	return definition !== null;
}

/**
 * Context type for database operations in mutations (write operations)
 */
type DbContext = MutationCtx;

/**
 * Find a custom field value by systemKey for an entity
 *
 * This helper reads custom field values using the systemKey (e.g., 'purpose')
 * instead of the definitionId. Used for proposal diffing.
 *
 * @see SYOS-984: Update createFromDiff for customFields migration
 *
 * @param ctx - Query/Mutation context with db access
 * @param args - Lookup parameters
 * @returns The field value as string, or null if not found
 */
export async function findCustomFieldValueBySystemKey(
	ctx: DbContext,
	args: {
		workspaceId: Id<'workspaces'>;
		entityType: 'circle' | 'role';
		entityId: string;
		systemKey: string;
	}
): Promise<string | null> {
	// First, find the definition by systemKey
	const definition = (await ctx.db
		.query('customFieldDefinitions')
		.withIndex('by_workspace_system_key', (q) =>
			q.eq('workspaceId', args.workspaceId).eq('systemKey', args.systemKey)
		)
		.first()) as Doc<'customFieldDefinitions'> | null;

	if (!definition) {
		return null;
	}

	// Then find the value for this definition and entity
	const value = (await ctx.db
		.query('customFieldValues')
		.withIndex('by_definition_entity', (q) =>
			q.eq('definitionId', definition._id).eq('entityId', args.entityId)
		)
		.first()) as Doc<'customFieldValues'> | null;

	return value?.value ?? null;
}

/**
 * Set a custom field value by systemKey for an entity
 *
 * Creates or updates the custom field value. Used when approving proposals.
 *
 * @see SYOS-984: Update approve mutation for customFields migration
 *
 * @param ctx - Mutation context with db access
 * @param args - Set parameters
 * @returns The value ID (new or existing)
 */
export async function setCustomFieldValueBySystemKey(
	ctx: DbContext,
	args: {
		workspaceId: Id<'workspaces'>;
		entityType: 'circle' | 'role';
		entityId: string;
		systemKey: string;
		value: string;
		updatedByPersonId: Id<'people'>;
	}
): Promise<Id<'customFieldValues'> | null> {
	// First, find the definition by systemKey
	const definition = (await ctx.db
		.query('customFieldDefinitions')
		.withIndex('by_workspace_system_key', (q) =>
			q.eq('workspaceId', args.workspaceId).eq('systemKey', args.systemKey)
		)
		.first()) as Doc<'customFieldDefinitions'> | null;

	if (!definition) {
		console.warn(
			`[setCustomFieldValueBySystemKey] Definition not found for systemKey "${args.systemKey}" in workspace ${args.workspaceId}`
		);
		return null;
	}

	const now = Date.now();

	// Check if value already exists
	const existing = (await ctx.db
		.query('customFieldValues')
		.withIndex('by_definition_entity', (q) =>
			q.eq('definitionId', definition._id).eq('entityId', args.entityId)
		)
		.first()) as Doc<'customFieldValues'> | null;

	if (existing) {
		await ctx.db.patch(existing._id, {
			value: args.value,
			searchText: args.value,
			updatedAt: now,
			updatedByPersonId: args.updatedByPersonId
		});
		return existing._id;
	}

	// Create new value
	return await ctx.db.insert('customFieldValues', {
		workspaceId: args.workspaceId,
		definitionId: definition._id,
		entityType: args.entityType,
		entityId: args.entityId,
		value: args.value,
		searchText: args.value,
		createdAt: now,
		createdByPersonId: args.updatedByPersonId,
		updatedAt: now,
		updatedByPersonId: args.updatedByPersonId
	});
}

/**
 * Delete a custom field value by systemKey for an entity
 *
 * Used when a proposal removes a custom field value.
 *
 * @see SYOS-984: Update approve mutation for customFields migration
 */
export async function archiveCustomFieldValueBySystemKey(
	ctx: DbContext,
	args: {
		workspaceId: Id<'workspaces'>;
		entityId: string;
		systemKey: string;
	}
): Promise<void> {
	// First, find the definition by systemKey
	const definition = (await ctx.db
		.query('customFieldDefinitions')
		.withIndex('by_workspace_system_key', (q) =>
			q.eq('workspaceId', args.workspaceId).eq('systemKey', args.systemKey)
		)
		.first()) as Doc<'customFieldDefinitions'> | null;

	if (!definition) {
		return;
	}

	// Find and delete the value
	const value = (await ctx.db
		.query('customFieldValues')
		.withIndex('by_definition_entity', (q) =>
			q.eq('definitionId', definition._id).eq('entityId', args.entityId)
		)
		.first()) as Doc<'customFieldValues'> | null;

	if (value) {
		await ctx.db.delete(value._id);
	}
}

/**
 * Create customFieldValues from template defaultFieldValues
 *
 * This helper is used when core domains (roles, circles) create entities from templates.
 * For each field in template.defaultFieldValues:
 * 1. Look up customFieldDefinition by systemKey
 * 2. Create one customFieldValues record per value (for searchability)
 * 3. Populate searchText for indexing
 *
 * @see SYOS-960: Update role creation to use customFieldValues
 *
 * @param ctx - Mutation context
 * @param args - Configuration object
 * @param args.workspaceId - Workspace ID
 * @param args.entityType - Entity type ('role' or 'circle')
 * @param args.entityId - Entity ID (role or circle ID as string)
 * @param args.templateDefaultFieldValues - Array of { systemKey, values } from template
 * @param args.createdByPersonId - Person creating the entity
 * @param args.workspacePhase - Workspace phase ('design' | 'active') - validation skipped in design phase (SYOS-996)
 * @throws {Error} If required fields are missing for roles (GOV-02, GOV-03) in active phase
 */
export async function createCustomFieldValuesFromTemplate(
	ctx: { db: { query: any; insert: any } },
	args: {
		workspaceId: Id<'workspaces'>;
		entityType: 'role' | 'circle';
		entityId: string;
		templateDefaultFieldValues: Array<{ systemKey: string; values: string[] }>;
		createdByPersonId: Id<'people'>;
		workspacePhase?: 'design' | 'active';
	}
): Promise<void> {
	const now = Date.now();

	// Track required fields for validation (GOV-02, GOV-03)
	const hasRequiredFields = {
		purpose: false,
		decision_right: false
	};

	for (const fieldDefault of args.templateDefaultFieldValues) {
		// Look up definition by systemKey
		const definition = await ctx.db
			.query('customFieldDefinitions')
			.withIndex('by_workspace_system_key', (q: any) =>
				q.eq('workspaceId', args.workspaceId).eq('systemKey', fieldDefault.systemKey)
			)
			.first();

		if (!definition) {
			// Log warning but don't fail - template might reference fields that don't exist yet
			// TODO: Replace with structured logging before production
			console.warn(
				`[createCustomFieldValuesFromTemplate] Definition not found for systemKey "${fieldDefault.systemKey}" in workspace ${args.workspaceId}`
			);
			continue;
		}

		// Track if we have required fields
		if (fieldDefault.systemKey === 'purpose' && fieldDefault.values.length > 0) {
			hasRequiredFields.purpose = true;
		}
		if (fieldDefault.systemKey === 'decision_right' && fieldDefault.values.length > 0) {
			hasRequiredFields.decision_right = true;
		}

		// Create one record per value (for searchability per SYOS-960)
		for (const value of fieldDefault.values) {
			await ctx.db.insert('customFieldValues', {
				workspaceId: args.workspaceId,
				definitionId: definition._id,
				entityType: args.entityType,
				entityId: args.entityId,
				value, // Plain string - no JSON encoding needed (SYOS-963)
				searchText: value, // Plain string for search indexing
				createdByPersonId: args.createdByPersonId,
				createdAt: now,
				updatedAt: now,
				updatedByPersonId: args.createdByPersonId
			});
		}
	}

	// Validate required fields for roles (GOV-02, GOV-03)
	// Only enforce during active phase - design phase allows incomplete roles (SYOS-996)
	if (args.entityType === 'role' && args.workspacePhase !== 'design') {
		if (!hasRequiredFields.purpose) {
			throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, 'GOV-02: Role purpose is required');
		}
		if (!hasRequiredFields.decision_right) {
			throw createError(
				ErrorCodes.VALIDATION_REQUIRED_FIELD,
				'GOV-03: Role must have at least one decision right'
			);
		}
	}
}
