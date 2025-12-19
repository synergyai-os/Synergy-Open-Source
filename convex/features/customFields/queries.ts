/**
 * Custom Fields Queries
 *
 * Read operations for custom field definitions and values.
 * Follows architecture.md pattern: thin handlers delegating to helpers.
 */

import { query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id as _Id } from '../../_generated/dataModel';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { getPersonByUserAndWorkspace as _getPersonByUserAndWorkspace } from '../../core/people/queries';
import { requireWorkspaceMembership } from '../../core/workspaces/access';
import type { CustomFieldEntityType as _CustomFieldEntityType } from './schema';

export const listDefinitions = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		entityType: v.optional(
			v.union(
				v.literal('circle'),
				v.literal('role'),
				v.literal('person'),
				v.literal('inboxItem'),
				v.literal('task'),
				v.literal('project'),
				v.literal('meeting')
			)
		)
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		await requireWorkspaceMembership(ctx, args.workspaceId, userId);

		let query = ctx.db
			.query('customFieldDefinitions')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.filter((q) => q.eq(q.field('archivedAt'), undefined));

		if (args.entityType) {
			query = query.filter((q) => q.eq(q.field('entityType'), args.entityType));
		}

		const definitions = await query.collect();
		return definitions.sort((a, b) => a.order - b.order);
	}
});

export const getDefinition = query({
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

		await requireWorkspaceMembership(ctx, definition.workspaceId, userId);
		return definition;
	}
});

export const listValues = query({
	args: {
		sessionId: v.string(),
		entityType: v.union(
			v.literal('circle'),
			v.literal('role'),
			v.literal('person'),
			v.literal('inboxItem'),
			v.literal('task'),
			v.literal('project'),
			v.literal('meeting')
		),
		entityId: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const values = await ctx.db
			.query('customFieldValues')
			.withIndex('by_entity', (q) =>
				q.eq('entityType', args.entityType).eq('entityId', args.entityId)
			)
			.collect();

		// Get workspace from first value (all should have same workspace)
		if (values.length > 0) {
			await requireWorkspaceMembership(ctx, values[0].workspaceId, userId);
		}

		// Sort by order field for textList items (default to 0 for legacy records)
		return values.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
	}
});

export const getValue = query({
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

		await requireWorkspaceMembership(ctx, definition.workspaceId, userId);

		// For textList fields, return all values sorted by order
		if (definition.fieldType === 'textList') {
			const values = await ctx.db
				.query('customFieldValues')
				.withIndex('by_definition_entity', (q) =>
					q.eq('definitionId', args.definitionId).eq('entityId', args.entityId)
				)
				.collect();

			// Sort by order field (default to 0 for legacy records without order)
			return values.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
		}

		// For single-value fields, return first record
		const value = await ctx.db
			.query('customFieldValues')
			.withIndex('by_definition_entity', (q) =>
				q.eq('definitionId', args.definitionId).eq('entityId', args.entityId)
			)
			.first();

		return value ?? null;
	}
});
