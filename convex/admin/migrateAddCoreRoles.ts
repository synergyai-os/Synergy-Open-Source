/**
 * Migration: Add Core Roles to Existing Circles
 *
 * This migration finds all circles that are missing core roles (especially Lead roles)
 * and creates them from the system templates.
 *
 * Run with: npx convex run admin/migrateAddCoreRoles:migrateWorkspace --workspaceId YOUR_WORKSPACE_ID
 */

import { internalMutation, mutation } from '../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../infrastructure/sessionValidation';
import type { Id } from '../_generated/dataModel';
import { createError, ErrorCodes } from '../infrastructure/errors/codes';

/**
 * Migration: Add core roles to all circles in a workspace
 * Only workspace admins can run this
 */
export const migrateWorkspace = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user is workspace admin
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

		if (membership.role !== 'owner' && membership.role !== 'admin') {
			throw createError(
				ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
				'Only workspace admins can run this migration'
			);
		}

		// Get all active circles in workspace
		const circles = await ctx.db
			.query('circles')
			.withIndex('by_workspace_archived', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('archivedAt', undefined)
			)
			.collect();

		const results = {
			circlesProcessed: 0,
			rolesCreated: 0,
			errors: [] as string[]
		};

		// Process each circle
		for (const circle of circles) {
			try {
				// Get all system core templates
				const systemCoreTemplates = await ctx.db
					.query('roleTemplates')
					.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
					.filter((q) => q.eq(q.field('isCore'), true) && q.eq(q.field('archivedAt'), undefined))
					.collect();

				if (systemCoreTemplates.length === 0) {
					results.errors.push(`Circle "${circle.name}": No core role templates found`);
					results.circlesProcessed++;
					continue;
				}

				// Get existing roles in circle
				const existingRoles = await ctx.db
					.query('circleRoles')
					.withIndex('by_circle_archived', (q) =>
						q.eq('circleId', circle._id).eq('archivedAt', undefined)
					)
					.collect();

				// Track which templates have been linked
				const linkedTemplateIds = new Set<Id<'roleTemplates'>>();
				let rolesLinked = 0;

				// For each core template, try to link existing role or create new one
				for (const template of systemCoreTemplates) {
					// Check if role already linked to this template
					const alreadyLinked = existingRoles.some((role) => role.templateId === template._id);
					if (alreadyLinked) {
						linkedTemplateIds.add(template._id);
						continue;
					}

					// Try to find unlinked role with matching name
					const unlinkedRole = existingRoles.find(
						(role) =>
							!role.templateId &&
							role.name.toLowerCase().trim() === template.name.toLowerCase().trim()
					);

					if (unlinkedRole) {
						// Link existing role to template
						await ctx.db.patch(unlinkedRole._id, {
							templateId: template._id,
							purpose: template.description,
							updatedAt: Date.now(),
							updatedBy: userId
						});
						linkedTemplateIds.add(template._id);
						rolesLinked++;
					}
				}

				// If any core templates are still missing, create them
				const missingTemplates = systemCoreTemplates.filter((t) => !linkedTemplateIds.has(t._id));

				if (missingTemplates.length > 0) {
					// Create roles for missing templates
					const now = Date.now();
					for (const template of missingTemplates) {
						await ctx.db.insert('circleRoles', {
							circleId: circle._id,
							workspaceId: circle.workspaceId,
							name: template.name,
							purpose: template.description,
							templateId: template._id,
							status: 'active',
							isHiring: false,
							createdAt: now,
							updatedAt: now,
							updatedBy: userId
						});
						rolesLinked++;
					}
				}

				if (rolesLinked > 0) {
					results.rolesCreated += rolesLinked;
				}

				results.circlesProcessed++;
			} catch (error) {
				results.errors.push(
					`Circle "${circle.name}": ${error instanceof Error ? error.message : String(error)}`
				);
			}
		}

		return {
			success: true,
			...results
		};
	}
});

/**
 * Internal migration: Add core roles to all circles in a workspace
 * Can be called from other mutations/actions
 */
export const migrateWorkspaceInternal = internalMutation({
	args: {
		workspaceId: v.id('workspaces'),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		// Get all active circles in workspace
		const circles = await ctx.db
			.query('circles')
			.withIndex('by_workspace_archived', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('archivedAt', undefined)
			)
			.collect();

		const results = {
			circlesProcessed: 0,
			rolesCreated: 0,
			errors: [] as string[]
		};

		// Process each circle
		for (const circle of circles) {
			try {
				// Get all system core templates
				const systemCoreTemplates = await ctx.db
					.query('roleTemplates')
					.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
					.filter((q) => q.eq(q.field('isCore'), true) && q.eq(q.field('archivedAt'), undefined))
					.collect();

				if (systemCoreTemplates.length === 0) {
					results.errors.push(`Circle "${circle.name}": No core role templates found`);
					results.circlesProcessed++;
					continue;
				}

				// Get existing roles in circle
				const existingRoles = await ctx.db
					.query('circleRoles')
					.withIndex('by_circle_archived', (q) =>
						q.eq('circleId', circle._id).eq('archivedAt', undefined)
					)
					.collect();

				// Track which templates have been linked
				const linkedTemplateIds = new Set<Id<'roleTemplates'>>();
				let rolesLinked = 0;

				// For each core template, try to link existing role or create new one
				for (const template of systemCoreTemplates) {
					// Check if role already linked to this template
					const alreadyLinked = existingRoles.some((role) => role.templateId === template._id);
					if (alreadyLinked) {
						linkedTemplateIds.add(template._id);
						continue;
					}

					// Try to find unlinked role with matching name
					const unlinkedRole = existingRoles.find(
						(role) =>
							!role.templateId &&
							role.name.toLowerCase().trim() === template.name.toLowerCase().trim()
					);

					if (unlinkedRole) {
						// Link existing role to template
						await ctx.db.patch(unlinkedRole._id, {
							templateId: template._id,
							purpose: template.description,
							updatedAt: Date.now(),
							updatedBy: args.userId
						});
						linkedTemplateIds.add(template._id);
						rolesLinked++;
					}
				}

				// If any core templates are still missing, create them
				const missingTemplates = systemCoreTemplates.filter((t) => !linkedTemplateIds.has(t._id));

				if (missingTemplates.length > 0) {
					// Create roles for missing templates
					const now = Date.now();
					for (const template of missingTemplates) {
						await ctx.db.insert('circleRoles', {
							circleId: circle._id,
							workspaceId: circle.workspaceId,
							name: template.name,
							purpose: template.description,
							templateId: template._id,
							status: 'active',
							isHiring: false,
							createdAt: now,
							updatedAt: now,
							updatedBy: args.userId
						});
						rolesLinked++;
					}
				}

				if (rolesLinked > 0) {
					results.rolesCreated += rolesLinked;
				}

				results.circlesProcessed++;
			} catch (error) {
				results.errors.push(
					`Circle "${circle.name}": ${error instanceof Error ? error.message : String(error)}`
				);
			}
		}

		return {
			success: true,
			...results
		};
	}
});
