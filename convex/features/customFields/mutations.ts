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
	requireActiveDefinition,
	assertEntityTypeMatch,
	upsertTextListValues,
	upsertSingleValue
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
			v.literal('textList'),
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
		const definition = await requireActiveDefinition(ctx, args.definitionId);

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
		const definition = await requireActiveDefinition(ctx, args.definitionId);

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
	handler: async (ctx, args): Promise<Id<'customFieldValues'> | null> => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const definition = await requireActiveDefinition(ctx, args.definitionId);

		assertEntityTypeMatch(definition.entityType, args.entityType);
		await canSetValue(ctx, userId, definition.workspaceId, args.entityType, args.entityId);
		validateFieldType(args.value, definition.fieldType);
		validateSelectOptions(args.value, definition.fieldType, definition.options);

		const person = await getPersonByUserAndWorkspace(ctx, userId, definition.workspaceId);

		if (definition.fieldType === 'textList') {
			return await upsertTextListValues(ctx, definition, args.entityId, args.value, person._id);
		}
		return await upsertSingleValue(ctx, definition, args.entityId, args.value, person._id);
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
		const definition = await requireActiveDefinition(ctx, args.definitionId);

		if (definition.isRequired) {
			throw createError(
				ErrorCodes.VALIDATION_INVALID_FORMAT,
				'Cannot delete value for required field'
			);
		}

		await canSetValue(ctx, userId, definition.workspaceId, definition.entityType, args.entityId);

		// Delete all values for this definition + entity (handles both single-value and textList)
		const values = await ctx.db
			.query('customFieldValues')
			.withIndex('by_definition_entity', (q) =>
				q.eq('definitionId', args.definitionId).eq('entityId', args.entityId)
			)
			.collect();

		for (const value of values) {
			await ctx.db.delete(value._id);
		}
	}
});
