/**
 * Custom Fields Business Rules
 *
 * Pure helpers + validation functions for custom fields feature.
 * Follows architecture.md pattern: business logic extracted from handlers.
 */

import type { MutationCtx, QueryCtx } from '../../_generated/server';
import type { Doc, Id } from '../../_generated/dataModel';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { requirePermission as _requirePermission } from '../../infrastructure/rbac/permissions';
import { requireWorkspaceAdminOrOwner } from '../../core/workspaces/access';
import { getPersonByUserAndWorkspace } from '../../core/people/queries';
import type { CustomFieldType, CustomFieldValue } from './schema';

type AnyCtx = QueryCtx | MutationCtx;

/**
 * Check if person can define custom fields in workspace.
 * Requires workspace admin or owner role.
 */
export async function canDefineField(
	ctx: AnyCtx,
	userId: Id<'users'>,
	workspaceId: Id<'workspaces'>
): Promise<void> {
	await requireWorkspaceAdminOrOwner(
		ctx,
		workspaceId,
		userId,
		'Must be workspace admin or owner to define custom fields'
	);
}

/**
 * Check if person can set custom field values.
 * For now, requires workspace membership. Future: entity-specific permissions.
 */
export async function canSetValue(
	ctx: AnyCtx,
	userId: Id<'users'>,
	workspaceId: Id<'workspaces'>,
	_entityType: string,
	_entityId: string
): Promise<void> {
	// Ensure person is workspace member
	await getPersonByUserAndWorkspace(ctx, userId, workspaceId);
	// TODO: Add entity-specific permission checks (e.g., circle lead for circles)
}

/**
 * Validate field value matches field type.
 * Throws if validation fails.
 */
export function validateFieldType(value: CustomFieldValue, fieldType: CustomFieldType): void {
	switch (fieldType) {
		case 'text':
		case 'longText':
		case 'url':
		case 'email':
			if (typeof value !== 'string') {
				throw createError(
					ErrorCodes.VALIDATION_INVALID_FORMAT,
					`Value must be a string for ${fieldType} field`
				);
			}
			if (fieldType === 'url' && value && !isValidUrl(value)) {
				throw createError(ErrorCodes.VALIDATION_INVALID_FORMAT, 'Invalid URL format');
			}
			if (fieldType === 'email' && value && !isValidEmail(value)) {
				throw createError(ErrorCodes.VALIDATION_INVALID_FORMAT, 'Invalid email format');
			}
			break;

		case 'number':
			if (typeof value !== 'number') {
				throw createError(ErrorCodes.VALIDATION_INVALID_FORMAT, 'Value must be a number');
			}
			break;

		case 'boolean':
			if (typeof value !== 'boolean') {
				throw createError(ErrorCodes.VALIDATION_INVALID_FORMAT, 'Value must be a boolean');
			}
			break;

		case 'date':
			if (typeof value !== 'string') {
				throw createError(
					ErrorCodes.VALIDATION_INVALID_FORMAT,
					'Value must be an ISO 8601 date string'
				);
			}
			if (value && !isValidDate(value)) {
				throw createError(
					ErrorCodes.VALIDATION_INVALID_FORMAT,
					'Invalid date format (must be ISO 8601)'
				);
			}
			break;

		case 'select':
			if (typeof value !== 'string') {
				throw createError(
					ErrorCodes.VALIDATION_INVALID_FORMAT,
					'Value must be a string for select field'
				);
			}
			break;

		case 'multiSelect':
			if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
				throw createError(
					ErrorCodes.VALIDATION_INVALID_FORMAT,
					'Value must be an array of strings for multiSelect field'
				);
			}
			break;

		case 'textList':
			if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
				throw createError(
					ErrorCodes.VALIDATION_INVALID_FORMAT,
					'Value must be an array of strings for textList field'
				);
			}
			break;

		default:
			throw createError(ErrorCodes.VALIDATION_INVALID_FORMAT, `Unknown field type: ${fieldType}`);
	}
}

/**
 * Validate select/multiSelect value is in allowed options.
 */
export function validateSelectOptions(
	value: CustomFieldValue,
	fieldType: CustomFieldType,
	options: string[] | undefined
): void {
	if (fieldType === 'select' && options) {
		if (typeof value !== 'string' || !options.includes(value)) {
			throw createError(
				ErrorCodes.VALIDATION_INVALID_FORMAT,
				`Value must be one of: ${options.join(', ')}`
			);
		}
	}

	if (fieldType === 'multiSelect' && options) {
		if (!Array.isArray(value) || !value.every((v) => options.includes(v))) {
			throw createError(
				ErrorCodes.VALIDATION_INVALID_FORMAT,
				`All values must be from: ${options.join(', ')}`
			);
		}
	}
}

/**
 * Extract searchable text from value for indexing.
 */
export function extractSearchText(
	value: CustomFieldValue,
	fieldType: CustomFieldType
): string | undefined {
	switch (fieldType) {
		case 'text':
		case 'longText':
		case 'url':
		case 'email':
			return typeof value === 'string' ? value : undefined;

		case 'number':
			return typeof value === 'number' ? String(value) : undefined;

		case 'boolean':
			return typeof value === 'boolean' ? (value ? 'true' : 'false') : undefined;

		case 'date':
			return typeof value === 'string' ? value : undefined;

		case 'select':
			return typeof value === 'string' ? value : undefined;

		case 'multiSelect':
			return Array.isArray(value) ? value.join(' ') : undefined;

		case 'textList':
			return Array.isArray(value) ? value.join(' ') : undefined;

		default:
			return undefined;
	}
}

// Helper functions

function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

function isValidDate(dateString: string): boolean {
	const date = new Date(dateString);
	return !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0];
}

// ============================================================================
// Mutation Helpers
// ============================================================================

/**
 * Require definition exists and is not archived.
 * Throws if definition not found or archived.
 *
 * @param ctx - Query or mutation context
 * @param definitionId - ID of definition to require
 * @returns The active definition
 */
export async function requireActiveDefinition(
	ctx: AnyCtx,
	definitionId: Id<'customFieldDefinitions'>
): Promise<Doc<'customFieldDefinitions'>> {
	const definition = await ctx.db.get(definitionId);
	if (!definition) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Custom field definition not found');
	}
	if (definition.archivedAt) {
		throw createError(
			ErrorCodes.VALIDATION_INVALID_FORMAT,
			'Cannot operate on archived definition'
		);
	}
	return definition;
}

/**
 * Assert entity type matches definition entity type.
 * Throws if mismatch.
 *
 * @param definitionEntityType - Entity type from definition
 * @param argsEntityType - Entity type from mutation args
 */
export function assertEntityTypeMatch(definitionEntityType: string, argsEntityType: string): void {
	if (definitionEntityType !== argsEntityType) {
		throw createError(ErrorCodes.VALIDATION_INVALID_FORMAT, 'Entity type mismatch');
	}
}

/**
 * Upsert textList values using diff-based approach.
 * Only updates changed items, preserves _id stability.
 *
 * @param ctx - Mutation context
 * @param definition - Custom field definition
 * @param entityId - Target entity ID
 * @param newValues - New array of string values
 * @param personId - Person making the change
 * @returns ID of first value (for backward compatibility)
 */
export async function upsertTextListValues(
	ctx: MutationCtx,
	definition: Doc<'customFieldDefinitions'>,
	entityId: string,
	newValues: string[],
	personId: Id<'people'>
): Promise<Id<'customFieldValues'> | null> {
	// Get existing values
	const existing = await ctx.db
		.query('customFieldValues')
		.withIndex('by_definition_entity', (q) =>
			q.eq('definitionId', definition._id).eq('entityId', entityId)
		)
		.collect();

	const existingMap = new Map(existing.map((e) => [e.value, e]));
	const newSet = new Set(newValues);
	const now = Date.now();

	// Delete removed items
	for (const [value, record] of existingMap) {
		if (!newSet.has(value)) {
			await ctx.db.delete(record._id);
		}
	}

	// Update existing (order may have changed) or insert new
	let firstId: Id<'customFieldValues'> | null = null;
	for (let i = 0; i < newValues.length; i++) {
		const value = newValues[i];
		const existingRecord = existingMap.get(value);

		if (existingRecord) {
			// Update order if changed
			if (existingRecord.order !== i) {
				await ctx.db.patch(existingRecord._id, {
					order: i,
					updatedAt: now,
					updatedByPersonId: personId
				});
			}
			firstId ??= existingRecord._id;
		} else {
			// Insert new
			const id = await ctx.db.insert('customFieldValues', {
				workspaceId: definition.workspaceId,
				definitionId: definition._id,
				entityType: definition.entityType,
				entityId,
				value,
				searchText: value,
				order: i,
				createdAt: now,
				createdByPersonId: personId,
				updatedAt: now,
				updatedByPersonId: personId
			});
			firstId ??= id;
		}
	}

	return firstId;
}

/**
 * Upsert single-value field.
 * Updates existing record or creates new one.
 *
 * @param ctx - Mutation context
 * @param definition - Custom field definition
 * @param entityId - Target entity ID
 * @param value - New value
 * @param personId - Person making the change
 * @returns ID of the value record
 */
export async function upsertSingleValue(
	ctx: MutationCtx,
	definition: Doc<'customFieldDefinitions'>,
	entityId: string,
	value: CustomFieldValue,
	personId: Id<'people'>
): Promise<Id<'customFieldValues'>> {
	const existing = await ctx.db
		.query('customFieldValues')
		.withIndex('by_definition_entity', (q) =>
			q.eq('definitionId', definition._id).eq('entityId', entityId)
		)
		.first();

	const now = Date.now();
	const searchText = extractSearchText(value, definition.fieldType);

	const valueData = {
		workspaceId: definition.workspaceId,
		definitionId: definition._id,
		entityType: definition.entityType,
		entityId,
		value: String(value), // Plain string - no JSON encoding needed (SYOS-963)
		searchText,
		updatedAt: now,
		updatedByPersonId: personId
	};

	if (existing) {
		await ctx.db.patch(existing._id, valueData);
		return existing._id;
	} else {
		return await ctx.db.insert('customFieldValues', {
			...valueData,
			createdAt: now,
			createdByPersonId: personId
		});
	}
}
