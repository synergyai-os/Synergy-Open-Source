/**
 * Custom Fields Business Rules
 *
 * Pure helpers + validation functions for custom fields feature.
 * Follows architecture.md pattern: business logic extracted from handlers.
 */

import type { MutationCtx, QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
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
