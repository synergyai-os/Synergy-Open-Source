/**
 * Custom Fields Mutations
 *
 * Write operations for custom field definitions and values.
 * Follows architecture.md pattern: thin handlers (≤20 lines) delegating to helpers.
 */

import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { getPersonByUserAndWorkspace } from '../../core/people/queries';
import {
	canDefineField,
	canSetValue,
	validateFieldType,
	validateSelectOptions,
	extractSearchText
} from './rules';
import type { CustomFieldEntityType as _CustomFieldEntityType } from './schema';

export const createDefinition = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		entityType: v.union(
			v.literal('circle'),
			v.literal('role'),
			v.literal('person'),
			v.literal('inboxItem'),
			v.literal('task'),
			v.literal('project'),
			v.literal('meeting')
		),
		name: v.string(),
		description: v.optional(v.string()),
		order: v.number(),
		systemKey: v.optional(v.string()),
		isSystemField: v.boolean(),
		isRequired: v.boolean(),
		fieldType: v.union(
			v.literal('text'),
			v.literal('longText'),
			v.literal('number'),
			v.literal('boolean'),
			v.literal('date'),
			v.literal('select'),
			v.literal('multiSelect'),
			v.literal('url'),
			v.literal('email')
		),
		options: v.optional(v.array(v.string())),
		searchable: v.boolean(),
		aiIndexed: v.boolean()
	},
	handler: async (ctx, args): Promise<Id<'customFieldDefinitions'>> => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		await canDefineField(ctx, userId, args.workspaceId);
		const person = await getPersonByUserAndWorkspace(ctx, userId, args.workspaceId);

		const now = Date.now();
		return await ctx.db.insert('customFieldDefinitions', {
			workspaceId: args.workspaceId,
			entityType: args.entityType,
			name: args.name.trim(),
			description: args.description?.trim(),
			order: args.order,
			systemKey: args.systemKey,
			isSystemField: args.isSystemField,
			isRequired: args.isRequired,
			fieldType: args.fieldType,
			options: args.options,
			searchable: args.searchable,
			aiIndexed: args.aiIndexed,
			createdAt: now,
			createdByPersonId: person._id,
			updatedAt: now,
			updatedByPersonId: undefined,
			archivedAt: undefined,
			archivedByPersonId: undefined
		});
	}
});

export const updateDefinition = mutation({
	args: {
		sessionId: v.string(),
		definitionId: v.id('customFieldDefinitions'),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		order: v.optional(v.number()),
		isRequired: v.optional(v.boolean()),
		options: v.optional(v.array(v.string())),
		searchable: v.optional(v.boolean()),
		aiIndexed: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const definition = await ctx.db.get(args.definitionId);
		if (!definition) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Custom field definition not found');
		}

		if (definition.archivedAt) {
			throw createError(ErrorCodes.VALIDATION_INVALID_FORMAT, 'Cannot update archived definition');
		}

		await canDefineField(ctx, userId, definition.workspaceId);
		const person = await getPersonByUserAndWorkspace(ctx, userId, definition.workspaceId);

		await ctx.db.patch(args.definitionId, {
			...(args.name !== undefined && { name: args.name.trim() }),
			...(args.description !== undefined && { description: args.description?.trim() }),
			...(args.order !== undefined && { order: args.order }),
			...(args.isRequired !== undefined && { isRequired: args.isRequired }),
			...(args.options !== undefined && { options: args.options }),
			...(args.searchable !== undefined && { searchable: args.searchable }),
			...(args.aiIndexed !== undefined && { aiIndexed: args.aiIndexed }),
			updatedAt: Date.now(),
			updatedByPersonId: person._id
		});
	}
});

export const archiveDefinition = mutation({
	args: {
		sessionId: v.string(),
		definitionId: v.id('customFieldDefinitions')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const definition = await ctx.db.get(args.definitionId);
		if (!definition) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Custom field definition not found');
		}

		if (definition.isSystemField) {
			throw createError(ErrorCodes.VALIDATION_INVALID_FORMAT, 'Cannot archive system field');
		}

		await canDefineField(ctx, userId, definition.workspaceId);
		const person = await getPersonByUserAndWorkspace(ctx, userId, definition.workspaceId);

		const now = Date.now();
		await ctx.db.patch(args.definitionId, {
			archivedAt: now,
			archivedByPersonId: person._id,
			updatedAt: now,
			updatedByPersonId: person._id
		});
	}
});

export const setValue = mutation({
	args: {
		sessionId: v.string(),
		definitionId: v.id('customFieldDefinitions'),
		entityType: v.union(
			v.literal('circle'),
			v.literal('role'),
			v.literal('person'),
			v.literal('inboxItem'),
			v.literal('task'),
			v.literal('project'),
			v.literal('meeting')
		),
		entityId: v.string(),
		value: v.any() // JSON-encoded value
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const definition = await ctx.db.get(args.definitionId);
		if (!definition) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Custom field definition not found');
		}

		if (definition.archivedAt) {
			throw createError(
				ErrorCodes.VALIDATION_INVALID_FORMAT,
				'Cannot set value for archived definition'
			);
		}

		if (definition.entityType !== args.entityType) {
			throw createError(ErrorCodes.VALIDATION_INVALID_FORMAT, 'Entity type mismatch');
		}

		await canSetValue(ctx, userId, definition.workspaceId, args.entityType, args.entityId);
		validateFieldType(args.value, definition.fieldType);
		validateSelectOptions(args.value, definition.fieldType, definition.options);

		const person = await getPersonByUserAndWorkspace(ctx, userId, definition.workspaceId);
		const searchText = extractSearchText(args.value, definition.fieldType);

		// Check if value already exists
		const existing = await ctx.db
			.query('customFieldValues')
			.withIndex('by_definition_entity', (q) =>
				q.eq('definitionId', args.definitionId).eq('entityId', args.entityId)
			)
			.first();

		const now = Date.now();
		const valueData = {
			workspaceId: definition.workspaceId,
			definitionId: args.definitionId,
			entityType: args.entityType,
			entityId: args.entityId,
			value: String(args.value), // Plain string - no JSON encoding needed (SYOS-963)
			searchText,
			updatedAt: now,
			updatedByPersonId: person._id
		};

		if (existing) {
			await ctx.db.patch(existing._id, valueData);
			return existing._id;
		} else {
			return await ctx.db.insert('customFieldValues', {
				...valueData,
				createdAt: now,
				createdByPersonId: person._id
			});
		}
	}
});

export const archiveValue = mutation({
	args: {
		sessionId: v.string(),
		definitionId: v.id('customFieldDefinitions'),
		entityId: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const definition = await ctx.db.get(args.definitionId);
		if (!definition) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Custom field definition not found');
		}

		if (definition.isRequired) {
			throw createError(
				ErrorCodes.VALIDATION_INVALID_FORMAT,
				'Cannot delete value for required field'
			);
		}

		await canSetValue(ctx, userId, definition.workspaceId, definition.entityType, args.entityId);

		const value = await ctx.db
			.query('customFieldValues')
			.withIndex('by_definition_entity', (q) =>
				q.eq('definitionId', args.definitionId).eq('entityId', args.entityId)
			)
			.first();

		if (value) {
			await ctx.db.delete(value._id);
		}
	}
});
