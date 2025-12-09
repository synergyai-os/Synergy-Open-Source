/**
 * Role Templates - Reusable role definitions
 *
 * Role templates define reusable role configurations that can be marked as:
 * - Core roles: Auto-created in new circles
 * - Required roles: Lead role - cannot be deleted, syncs to all existing roles
 *
 * System-level templates (workspaceId = undefined) are available to all workspaces.
 * Workspace-level templates are specific to a workspace.
 */

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { captureUpdate } from './orgVersionHistory';
import { createError, ErrorCodes } from './infrastructure/errors/codes';

/**
 * Helper: Check if user is workspace admin or owner
 */
async function isWorkspaceAdmin(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<boolean> {
	const membership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();

	if (!membership) {
		return false;
	}

	return membership.role === 'owner' || membership.role === 'admin';
}

/**
 * Helper: Get Lead role template for a workspace
 * Returns the template with isRequired: true (system or workspace level)
 */
async function getLeadRoleTemplate(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>
): Promise<Id<'roleTemplates'> | null> {
	// Check workspace-level templates first
	const workspaceLeadTemplate = await ctx.db
		.query('roleTemplates')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.filter((q) => q.eq(q.field('isRequired'), true).eq(q.field('archivedAt'), undefined))
		.first();

	if (workspaceLeadTemplate) {
		return workspaceLeadTemplate._id;
	}

	// Check system-level templates
	const systemLeadTemplate = await ctx.db
		.query('roleTemplates')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
		.filter((q) => q.eq(q.field('isRequired'), true).eq(q.field('archivedAt'), undefined))
		.first();

	return systemLeadTemplate?._id ?? null;
}

/**
 * Helper: Sync all Lead roles from template
 * Updates all roles created from this template with template's name and description
 */
async function syncLeadRolesFromTemplate(
	ctx: MutationCtx,
	templateId: Id<'roleTemplates'>,
	userId: Id<'users'>
): Promise<void> {
	const template = await ctx.db.get(templateId);
	if (!template || !template.isRequired) {
		return; // Only sync Lead role templates
	}

	// Find all roles created from this template (active roles only)
	const roles = await ctx.db
		.query('circleRoles')
		.withIndex('by_template', (q) => q.eq('templateId', templateId))
		.filter((q) => q.eq(q.field('archivedAt'), undefined))
		.collect();

	const now = Date.now();

	// Update all roles with template's current name and description
	for (const role of roles) {
		const oldRole = { ...role };

		await ctx.db.patch(role._id, {
			name: template.name,
			purpose: template.description, // Template description becomes role purpose
			updatedAt: now,
			updatedBy: userId
		});

		// Capture version history for each synced role
		const updatedRole = await ctx.db.get(role._id);
		if (updatedRole) {
			await captureUpdate(ctx, 'circleRole', oldRole, updatedRole);
		}
	}
}

/**
 * Query: List role templates for a workspace
 */
export const list = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user has access to workspace
		const membership = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		if (!membership) {
			throw createError(
				ErrorCodes.WORKSPACE_ACCESS_DENIED,
				'You do not have access to this workspace'
			);
		}

		// Get workspace-level templates
		const workspaceTemplates = args.includeArchived
			? await ctx.db
					.query('roleTemplates')
					.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
					.collect()
			: await ctx.db
					.query('roleTemplates')
					.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
					.filter((q) => q.eq(q.field('archivedAt'), undefined))
					.collect();

		// Get system-level templates (available to all workspaces)
		const systemTemplates = args.includeArchived
			? await ctx.db
					.query('roleTemplates')
					.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
					.collect()
			: await ctx.db
					.query('roleTemplates')
					.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
					.filter((q) => q.eq(q.field('archivedAt'), undefined))
					.collect();

		return {
			workspace: workspaceTemplates,
			system: systemTemplates
		};
	}
});

/**
 * Mutation: Create a new role template
 * Only workspace admins can create workspace-level templates
 */
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
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Only workspace admins can create templates
		const userIsAdmin = await isWorkspaceAdmin(ctx, args.workspaceId, userId);
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

		// Validation: Only one template per workspace can have isRequired: true
		if (args.isRequired === true) {
			const existingLeadTemplate = await getLeadRoleTemplate(ctx, args.workspaceId);
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
			createdBy: userId,
			updatedAt: now
		});

		return { templateId };
	}
});

/**
 * Mutation: Update a role template
 * Only workspace admins can update templates
 * If Lead template is updated, sync changes to all existing Lead roles
 */
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
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const template = await ctx.db.get(args.templateId);
		if (!template) {
			throw createError(ErrorCodes.TEMPLATE_NOT_FOUND, 'Template not found');
		}

		// Determine workspace ID (system templates have workspaceId = undefined)
		const workspaceId = template.workspaceId;
		if (!workspaceId) {
			throw createError(ErrorCodes.AUTHZ_INSUFFICIENT_RBAC, 'System templates cannot be modified');
		}

		// Only workspace admins can update templates
		const userIsAdmin = await isWorkspaceAdmin(ctx, workspaceId, userId);
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
			updatedBy: Id<'users'>;
		} = {
			updatedAt: Date.now(),
			updatedBy: userId
		};

		// Track if this is becoming a Lead template or was already a Lead template
		const wasLeadTemplate = template.isRequired === true;
		const willBeLeadTemplate = args.isRequired === true;

		// Validation: Only one template per workspace can have isRequired: true
		if (willBeLeadTemplate && !wasLeadTemplate) {
			const existingLeadTemplate = await getLeadRoleTemplate(ctx, workspaceId);
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

		// If this is/was a Lead template and name or description changed, sync to all roles
		const updatedTemplate = await ctx.db.get(args.templateId);
		if (updatedTemplate && (wasLeadTemplate || willBeLeadTemplate)) {
			if (args.name !== undefined || args.description !== undefined) {
				await syncLeadRolesFromTemplate(ctx, args.templateId, userId);
			}
		}

		return { success: true };
	}
});

/**
 * Mutation: Archive a role template (soft delete)
 * Only workspace admins can archive templates
 * Cannot archive Lead template unless another Lead template exists
 */
export const archive = mutation({
	args: {
		sessionId: v.string(),
		templateId: v.id('roleTemplates')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const template = await ctx.db.get(args.templateId);
		if (!template) {
			throw createError(ErrorCodes.TEMPLATE_NOT_FOUND, 'Template not found');
		}

		// System templates cannot be archived
		if (!template.workspaceId) {
			throw createError(ErrorCodes.AUTHZ_INSUFFICIENT_RBAC, 'System templates cannot be archived');
		}

		// Only workspace admins can archive templates
		const userIsAdmin = await isWorkspaceAdmin(ctx, template.workspaceId, userId);
		if (!userIsAdmin) {
			throw createError(
				ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
				'Only workspace admins can archive role templates'
			);
		}

		// Check if already archived
		if (template.archivedAt) {
			return { success: true };
		}

		// Validation: Cannot archive Lead template unless another Lead template exists
		if (template.isRequired) {
			const existingLeadTemplate = await getLeadRoleTemplate(ctx, template.workspaceId);
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
			archivedBy: userId,
			updatedAt: now,
			updatedBy: userId
		});

		return { success: true };
	}
});
