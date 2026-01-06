import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../../_generated/dataModel';
import { LEAD_AUTHORITY, type LeadAuthority } from '../../../core/circles';
import { createError, ErrorCodes } from '../../../infrastructure/errors/codes';
import { findLeadRoleTemplate, isWorkspaceAdmin, updateLeadRolesFromTemplate } from './rules';
import { requireWorkspacePersonFromSession } from '../roleAccess';
import { ROLE_TYPES } from '../constants';

function getDefaultPurposeFromFieldValues(
	defaultFieldValues: Array<{ systemKey: string; values: string[] }>
): string {
	const match = defaultFieldValues.find((f) => f.systemKey === 'purpose');
	const value = match?.values?.[0] ?? '';
	return value.trim();
}

function listDefaultDecisionRightsFromFieldValues(
	defaultFieldValues: Array<{ systemKey: string; values: string[] }>
): string[] {
	const match = defaultFieldValues.find((f) => f.systemKey === 'decision_right');
	return (match?.values ?? []).map((v) => v.trim()).filter(Boolean);
}

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
			v.literal(LEAD_AUTHORITY.DECIDES),
			v.literal(LEAD_AUTHORITY.FACILITATES),
			v.literal(LEAD_AUTHORITY.CONVENES)
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
		// DR-011: Store governance defaults directly on the template schema fields.
		// Keep legacy `defaultFieldValues` for backward compatibility (older UI code/tests).
		const defaultPurpose = getDefaultPurposeFromFieldValues(args.defaultFieldValues);
		const defaultDecisionRights = listDefaultDecisionRightsFromFieldValues(args.defaultFieldValues);

		if (!defaultPurpose) {
			throw createError(
				ErrorCodes.VALIDATION_REQUIRED_FIELD,
				'Template purpose is required (GOV-02)'
			);
		}
		if (defaultDecisionRights.length === 0) {
			throw createError(
				ErrorCodes.VALIDATION_REQUIRED_FIELD,
				'Template must have at least one decision right (GOV-03)'
			);
		}

		const templateId = await ctx.db.insert('roleTemplates', {
			workspaceId: args.workspaceId,
			name: trimmedName,
			roleType: args.roleType,
			defaultPurpose,
			defaultDecisionRights,
			// Legacy/back-compat field (schemaless storage); avoid relying on it going forward.
			defaultFieldValues: args.defaultFieldValues,
			description: args.description,
			isCore: args.isCore ?? false,
			appliesTo: args.appliesTo,
			createdAt: now,
			createdByPersonId: personId,
			updatedAt: now,
			updatedByPersonId: personId
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
				v.literal(LEAD_AUTHORITY.DECIDES),
				v.literal(LEAD_AUTHORITY.FACILITATES),
				v.literal(LEAD_AUTHORITY.CONVENES)
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
			appliesTo?: LeadAuthority;
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
