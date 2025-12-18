import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../../_generated/dataModel';
import { CIRCLE_TYPES, type CircleType } from '../../../core/circles';
import { createError, ErrorCodes } from '../../../infrastructure/errors/codes';
import { findLeadRoleTemplate, isWorkspaceAdmin, updateLeadRolesFromTemplate } from './rules';
import { requireWorkspacePersonFromSession } from '../roleAccess';
import { ROLE_TYPES } from '../constants';

export const create = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		name: v.string(),
		roleType: v.union(v.literal('circle_lead'), v.literal('structural'), v.literal('custom')),
		defaultFieldValues: v.array(
			v.object({
				systemKey: v.string(),
				values: v.array(v.string())
			})
		),
		description: v.optional(v.string()),
		isCore: v.optional(v.boolean()),
		appliesTo: v.union(
			v.literal(CIRCLE_TYPES.HIERARCHY),
			v.literal(CIRCLE_TYPES.EMPOWERED_TEAM),
			v.literal(CIRCLE_TYPES.GUILD),
			v.literal(CIRCLE_TYPES.HYBRID)
		)
	},
	handler: async (ctx, args) => {
		const personId = await requireWorkspacePersonFromSession(ctx, args.sessionId, args.workspaceId);

		const userIsAdmin = await isWorkspaceAdmin(ctx, args.workspaceId, personId);
		if (!userIsAdmin) {
			throw createError(
				ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
				'Only workspace admins can create role templates'
			);
		}

		const trimmedName = args.name.trim();
		if (!trimmedName) {
			throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, 'Template name is required');
		}

		const now = Date.now();

		const templateId = await ctx.db.insert('roleTemplates', {
			workspaceId: args.workspaceId,
			name: trimmedName,
			roleType: args.roleType,
			defaultFieldValues: args.defaultFieldValues,
			description: args.description,
			isCore: args.isCore ?? false,
			appliesTo: args.appliesTo,
			createdAt: now,
			createdByPersonId: personId,
			updatedAt: now
		});

		return { templateId };
	}
});

export const update = mutation({
	args: {
		sessionId: v.string(),
		templateId: v.id('roleTemplates'),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		isCore: v.optional(v.boolean()),
		appliesTo: v.optional(
			v.union(
				v.literal(CIRCLE_TYPES.HIERARCHY),
				v.literal(CIRCLE_TYPES.EMPOWERED_TEAM),
				v.literal(CIRCLE_TYPES.GUILD),
				v.literal(CIRCLE_TYPES.HYBRID)
			)
		)
	},
	handler: async (ctx, args) => {
		const template = await ctx.db.get(args.templateId);
		if (!template) {
			throw createError(ErrorCodes.TEMPLATE_NOT_FOUND, 'Template not found');
		}

		const workspaceId = template.workspaceId;
		if (!workspaceId) {
			throw createError(ErrorCodes.AUTHZ_INSUFFICIENT_RBAC, 'System templates cannot be modified');
		}

		const personId = await requireWorkspacePersonFromSession(ctx, args.sessionId, workspaceId);
		const userIsAdmin = await isWorkspaceAdmin(ctx, workspaceId, personId);
		if (!userIsAdmin) {
			throw createError(
				ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
				'Only workspace admins can update role templates'
			);
		}

		const updates: {
			name?: string;
			description?: string;
			isCore?: boolean;
			appliesTo?: CircleType;
			updatedAt: number;
			updatedByPersonId: Id<'people'>;
		} = {
			updatedAt: Date.now(),
			updatedByPersonId: personId
		};

		const wasLeadTemplate = template.roleType === ROLE_TYPES.CIRCLE_LEAD;

		if (args.name !== undefined) {
			updates.name = args.name.trim();
		}

		if (args.description !== undefined) {
			updates.description = args.description;
		}

		if (args.isCore !== undefined) {
			updates.isCore = args.isCore;
		}

		if (args.appliesTo !== undefined) {
			updates.appliesTo = args.appliesTo;
		}

		await ctx.db.patch(args.templateId, updates);

		const updatedTemplate = await ctx.db.get(args.templateId);
		if (updatedTemplate && wasLeadTemplate) {
			if (args.name !== undefined || args.description !== undefined) {
				await updateLeadRolesFromTemplate(ctx, args.templateId, personId);
			}
		}

		return { success: true };
	}
});

export const archive = mutation({
	args: {
		sessionId: v.string(),
		templateId: v.id('roleTemplates')
	},
	handler: async (ctx, args) => {
		const template = await ctx.db.get(args.templateId);
		if (!template) {
			throw createError(ErrorCodes.TEMPLATE_NOT_FOUND, 'Template not found');
		}

		if (!template.workspaceId) {
			throw createError(ErrorCodes.AUTHZ_INSUFFICIENT_RBAC, 'System templates cannot be archived');
		}

		const personId = await requireWorkspacePersonFromSession(
			ctx,
			args.sessionId,
			template.workspaceId
		);
		const userIsAdmin = await isWorkspaceAdmin(ctx, template.workspaceId, personId);
		if (!userIsAdmin) {
			throw createError(
				ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
				'Only workspace admins can archive role templates'
			);
		}

		if (template.archivedAt) {
			return { success: true };
		}

		if (template.roleType === ROLE_TYPES.CIRCLE_LEAD) {
			const existingLeadTemplate = await findLeadRoleTemplate(ctx, template.workspaceId);
			if (!existingLeadTemplate || existingLeadTemplate === args.templateId) {
				throw createError(
					ErrorCodes.VALIDATION_INVALID_FORMAT,
					'Cannot archive the Lead role template. Every workspace must have at least one Lead role template. Create a new Lead template first, or modify the existing one instead.'
				);
			}
		}

		const now = Date.now();

		await ctx.db.patch(args.templateId, {
			archivedAt: now,
			archivedByPersonId: personId,
			updatedAt: now,
			updatedByPersonId: personId
		});

		return { success: true };
	}
});
