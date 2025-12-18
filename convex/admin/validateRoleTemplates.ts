/**
 * Validation Queries for Role Templates
 *
 * Use these queries to debug why Core Roles aren't showing up:
 * 1. Check if system role templates exist
 * 2. Check if roles exist in a circle
 * 3. Check if templates are being used correctly
 */

import { query } from '../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../infrastructure/sessionValidation';
import { createError, ErrorCodes } from '../infrastructure/errors/codes';

/**
 * Query: Check if system role templates exist
 * Returns all system-level templates (workspaceId = undefined)
 */
export const checkSystemTemplates = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		await validateSessionAndGetUserId(ctx, args.sessionId);

		const systemTemplates = await ctx.db
			.query('roleTemplates')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
			.collect();

		return {
			count: systemTemplates.length,
			templates: systemTemplates.map((t) => ({
				_id: t._id,
				name: t.name,
				roleType: t.roleType,
				description: t.description,
				isCore: t.isCore,
				appliesTo: t.appliesTo,
				archivedAt: t.archivedAt,
				workspaceId: t.workspaceId // DIAGNOSTIC: Include workspaceId to verify it's undefined
			}))
		};
	}
});

/**
 * DIAGNOSTIC: Deep dive into template query behavior
 * Tests different query patterns to isolate the bug
 */
export const diagnosticTemplateQuery = query({
	args: {
		sessionId: v.string(),
		circleType: v.union(
			v.literal('hierarchy'),
			v.literal('empowered_team'),
			v.literal('guild'),
			v.literal('hybrid')
		)
	},
	handler: async (ctx, args) => {
		await validateSessionAndGetUserId(ctx, args.sessionId);

		// Test 1: Query ALL templates (no filters)
		const allTemplates = await ctx.db.query('roleTemplates').collect();

		// Test 2: Query using index with workspaceId = undefined
		const byWorkspaceIndex = await ctx.db
			.query('roleTemplates')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
			.collect();

		// Test 3: Filter by appliesTo only (no workspaceId filter)
		const byAppliesTo = allTemplates.filter((t) => t.appliesTo === args.circleType);

		// Test 4: Filter by appliesTo AND archivedAt (no workspaceId filter)
		const byAppliesToAndArchived = allTemplates.filter(
			(t) => t.appliesTo === args.circleType && t.archivedAt === undefined
		);

		// Test 5: Full query as used in code
		const fullQuery = await ctx.db
			.query('roleTemplates')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
			.filter((q) =>
				q.and(q.eq(q.field('appliesTo'), args.circleType), q.eq(q.field('archivedAt'), undefined))
			)
			.collect();

		// Test 6: Check workspaceId values in all templates
		const workspaceIdAnalysis = {
			undefined: allTemplates.filter((t) => t.workspaceId === undefined).length,
			defined: allTemplates.filter((t) => t.workspaceId !== undefined).length,
			null: allTemplates.filter((t) => t.workspaceId === null).length
		};

		return {
			circleType: args.circleType,
			counts: {
				allTemplates: allTemplates.length,
				byWorkspaceIndex: byWorkspaceIndex.length,
				byAppliesTo: byAppliesTo.length,
				byAppliesToAndArchived: byAppliesToAndArchived.length,
				fullQuery: fullQuery.length
			},
			workspaceIdAnalysis,
			byAppliesToTemplates: byAppliesTo.map((t) => ({
				name: t.name,
				roleType: t.roleType,
				workspaceId: t.workspaceId,
				archivedAt: t.archivedAt
			})),
			fullQueryTemplates: fullQuery.map((t) => ({
				name: t.name,
				roleType: t.roleType,
				workspaceId: t.workspaceId,
				archivedAt: t.archivedAt
			}))
		};
	}
});

/**
 * Query: Check core templates for a workspace
 * Returns system-level and workspace-level core templates
 */
export const checkCoreTemplates = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const person = await ctx.db
			.query('people')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		if (!person) {
			throw createError(
				ErrorCodes.WORKSPACE_ACCESS_DENIED,
				'You do not have access to this workspace'
			);
		}

		// Get system-level core templates
		const systemCoreTemplates = await ctx.db
			.query('roleTemplates')
			.withIndex('by_core', (q) => q.eq('workspaceId', undefined).eq('isCore', true))
			.filter((q) => q.eq(q.field('archivedAt'), undefined))
			.collect();

		// Get workspace-level core templates
		const workspaceCoreTemplates = await ctx.db
			.query('roleTemplates')
			.withIndex('by_core', (q) => q.eq('workspaceId', args.workspaceId).eq('isCore', true))
			.filter((q) => q.eq(q.field('archivedAt'), undefined))
			.collect();

		return {
			system: {
				count: systemCoreTemplates.length,
				templates: systemCoreTemplates.map((t) => ({
					_id: t._id,
					name: t.name,
					roleType: t.roleType,
					description: t.description,
					isCore: t.isCore,
					appliesTo: t.appliesTo
				}))
			},
			workspace: {
				count: workspaceCoreTemplates.length,
				templates: workspaceCoreTemplates.map((t) => ({
					_id: t._id,
					name: t.name,
					roleType: t.roleType,
					description: t.description,
					isCore: t.isCore,
					appliesTo: t.appliesTo
				}))
			},
			total: systemCoreTemplates.length + workspaceCoreTemplates.length
		};
	}
});

/**
 * Query: Check roles in a circle and their template links
 */
export const checkCircleRoles = query({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const circle = await ctx.db.get(args.circleId);
		if (!circle) {
			throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
		}

		const person = await ctx.db
			.query('people')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', circle.workspaceId).eq('userId', userId)
			)
			.first();

		if (!person) {
			throw createError(
				ErrorCodes.WORKSPACE_ACCESS_DENIED,
				'You do not have access to this workspace'
			);
		}

		// Get all active roles in circle
		const roles = await ctx.db
			.query('circleRoles')
			.withIndex('by_circle_archived', (q) =>
				q.eq('circleId', args.circleId).eq('archivedAt', undefined)
			)
			.collect();

		// Enrich roles with template information
		const rolesWithTemplates = await Promise.all(
			roles.map(async (role) => {
				const template = role.templateId ? await ctx.db.get(role.templateId) : null;

				return {
					roleId: role._id,
					name: role.name,
					purpose: role.purpose,
					templateId: role.templateId,
					template: template
						? {
								_id: template._id,
								name: template.name,
								roleType: template.roleType,
								isCore: template.isCore,
								appliesTo: template.appliesTo,
								archivedAt: template.archivedAt
							}
						: null,
					isLeadRole: template?.roleType === 'circle_lead',
					isCoreRole: template?.isCore === true
				};
			})
		);

		return {
			circleId: args.circleId,
			circleName: circle.name,
			roleCount: roles.length,
			roles: rolesWithTemplates,
			coreRoles: rolesWithTemplates.filter((r) => r.isCoreRole),
			leadRoles: rolesWithTemplates.filter((r) => r.isLeadRole)
		};
	}
});

/**
 * Query: Comprehensive validation for a workspace
 * Checks templates, circles, and roles
 */
export const validateWorkspace = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const person = await ctx.db
			.query('people')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		if (!person) {
			throw createError(
				ErrorCodes.WORKSPACE_ACCESS_DENIED,
				'You do not have access to this workspace'
			);
		}

		// Get all circles
		const circles = await ctx.db
			.query('circles')
			.withIndex('by_workspace_archived', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('archivedAt', undefined)
			)
			.collect();

		// Get core templates
		const systemCoreTemplates = await ctx.db
			.query('roleTemplates')
			.withIndex('by_core', (q) => q.eq('workspaceId', undefined).eq('isCore', true))
			.filter((q) => q.eq(q.field('archivedAt'), undefined))
			.collect();

		const workspaceCoreTemplates = await ctx.db
			.query('roleTemplates')
			.withIndex('by_core', (q) => q.eq('workspaceId', args.workspaceId).eq('isCore', true))
			.filter((q) => q.eq(q.field('archivedAt'), undefined))
			.collect();

		// Check each circle for roles
		const circleChecks = await Promise.all(
			circles.map(async (circle) => {
				const roles = await ctx.db
					.query('circleRoles')
					.withIndex('by_circle_archived', (q) =>
						q.eq('circleId', circle._id).eq('archivedAt', undefined)
					)
					.collect();

				const rolesWithTemplates = await Promise.all(
					roles.map(async (role) => {
						const template = role.templateId ? await ctx.db.get(role.templateId) : null;
						return {
							name: role.name,
							templateId: role.templateId,
							isCore: template?.isCore === true,
							isLead: template?.roleType === 'circle_lead'
						};
					})
				);

				return {
					circleId: circle._id,
					circleName: circle.name,
					roleCount: roles.length,
					hasLeadRole: rolesWithTemplates.some((r) => r.isLead),
					coreRoleCount: rolesWithTemplates.filter((r) => r.isCore).length
				};
			})
		);

		return {
			workspaceId: args.workspaceId,
			summary: {
				systemCoreTemplates: systemCoreTemplates.length,
				workspaceCoreTemplates: workspaceCoreTemplates.length,
				totalCircles: circles.length,
				circlesWithoutLeadRole: circleChecks.filter((c) => !c.hasLeadRole).length,
				circlesWithoutCoreRoles: circleChecks.filter((c) => c.coreRoleCount === 0).length
			},
			issues: [
				...(systemCoreTemplates.length === 0
					? [
							'⚠️ No system role templates found. Run: npx convex run admin/seedRoleTemplates:seedRoleTemplates'
						]
					: []),
				...(circleChecks.filter((c) => !c.hasLeadRole).length > 0
					? [`⚠️ ${circleChecks.filter((c) => !c.hasLeadRole).length} circle(s) missing Lead role`]
					: []),
				...(circleChecks.filter((c) => c.coreRoleCount === 0).length > 0
					? [
							`⚠️ ${circleChecks.filter((c) => c.coreRoleCount === 0).length} circle(s) have no core roles`
						]
					: [])
			],
			circles: circleChecks,
			templates: {
				system: systemCoreTemplates.map((t) => ({
					name: t.name,
					roleType: t.roleType,
					isCore: t.isCore,
					appliesTo: t.appliesTo
				})),
				workspace: workspaceCoreTemplates.map((t) => ({
					name: t.name,
					roleType: t.roleType,
					isCore: t.isCore,
					appliesTo: t.appliesTo
				}))
			}
		};
	}
});
