import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../../_generated/dataModel';
import { createError, ErrorCodes } from '../../../infrastructure/errors/codes';
import { findLeadRoleTemplate, isWorkspaceAdmin, updateLeadRolesFromTemplate } from './rules';
import { requireWorkspacePersonFromSession } from '../roleAccess';

export const create = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		name: v.string(),
		description: v.optional(v.string()),
		isCore: v.optional(v.boolean()),
		isRequired: v.optional(v.boolean())
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

		if (args.isRequired === true) {
			const existingLeadTemplate = await findLeadRoleTemplate(ctx, args.workspaceId);
			if (existingLeadTemplate) {
				throw createError(
					ErrorCodes.VALIDATION_INVALID_FORMAT,
					'A Lead role template already exists for this workspace. Archive or modify the existing Lead template first.'
				);
			}
		}

		const now = Date.now();

		const templateId = await ctx.db.insert('roleTemplates', {
			workspaceId: args.workspaceId,
			name: trimmedName,
			description: args.description,
			isCore: args.isCore ?? false,
			isRequired: args.isRequired ?? false,
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
		isRequired: v.optional(v.boolean())
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
			isRequired?: boolean;
			updatedAt: number;
			updatedByPersonId: Id<'people'>;
		} = {
			updatedAt: Date.now(),
			updatedByPersonId: personId
		};

		const wasLeadTemplate = template.isRequired === true;
		const willBeLeadTemplate = args.isRequired === true;

		if (willBeLeadTemplate && !wasLeadTemplate) {
			const existingLeadTemplate = await findLeadRoleTemplate(ctx, workspaceId);
			if (existingLeadTemplate && existingLeadTemplate !== args.templateId) {
				throw createError(
					ErrorCodes.VALIDATION_INVALID_FORMAT,
					'A Lead role template already exists for this workspace. Archive or modify the existing Lead template first.'
				);
			}
		}

		if (args.name !== undefined) {
			updates.name = args.name.trim();
		}

		if (args.description !== undefined) {
			updates.description = args.description;
		}

		if (args.isCore !== undefined) {
			updates.isCore = args.isCore;
		}

		if (args.isRequired !== undefined) {
			updates.isRequired = args.isRequired;
		}

		await ctx.db.patch(args.templateId, updates);

		const updatedTemplate = await ctx.db.get(args.templateId);
		if (updatedTemplate && (wasLeadTemplate || willBeLeadTemplate)) {
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

		if (template.isRequired) {
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
