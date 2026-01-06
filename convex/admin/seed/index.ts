/**
 * Seed Database Entry Point
 *
 * Provides the main seedDatabase() mutation to populate a fresh database
 * with system role templates and optionally bootstrap a demo workspace.
 *
 * Usage:
 *   npx convex run admin/seed:seedDatabase
 *   npx convex run admin/seed:seedDatabase --arg includeDemo=true
 */

import { internalMutation } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import { createSystemRoleTemplates } from './roleTemplates';
import { createMinimumViableWorkspace } from './bootstrap';
import { LEAD_AUTHORITY } from '../../core/circles/constants';
import { internal } from '../../_generated/api';

/**
 * Seed the database with system data
 *
 * This is the main entry point for seeding. It:
 * 1. Creates system role templates (Circle Lead, Steward, Facilitator, Secretary)
 * 2. Optionally creates a demo workspace with root circle
 *
 * Idempotent - safe to run multiple times (skips existing records).
 *
 * @param args.includeDemo - If true, creates a demo workspace
 */
export const seedDatabase = internalMutation({
	args: {
		includeDemo: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const includeDemo = args.includeDemo ?? false;

		console.log('🌱 Starting database seed...\n');
		console.log(`Options:`);
		console.log(`  - Include demo workspace: ${includeDemo}\n`);

		// ========================================================================
		// Step 1: Create System Role Templates
		// ========================================================================
		const templatesResult = await createSystemRoleTemplates(ctx);

		// Backfill any existing circle roles created from templates with missing governance fields.
		// This handles older DBs where templates existed but lacked DR-011 defaults.
		const backfillResult = await ctx.runMutation(
			internal.admin.migrations.backfillRoleGovernanceFieldsFromTemplates
				.backfillRoleGovernanceFieldsFromTemplates,
			{ onlySystemTemplates: true }
		);

		// Find Circle Lead template for demo workspace (decides authority)
		// Use roleType + appliesTo instead of name to be dynamic
		const circleLead = await ctx.db
			.query('roleTemplates')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
			.filter((q) =>
				q.and(
					q.eq(q.field('roleType'), 'circle_lead'),
					q.eq(q.field('appliesTo'), LEAD_AUTHORITY.DECIDES),
					q.eq(q.field('archivedAt'), undefined)
				)
			)
			.first();

		if (!circleLead) {
			throw new Error(
				'ERR_SEED_FAILED: Circle Lead template for decides authority not found after creation'
			);
		}

		// ========================================================================
		// Step 2: Create Demo Workspace (Optional)
		// ========================================================================
		let demoWorkspace: {
			workspaceId: Id<'workspaces'>;
			rootCircleId: Id<'circles'> | null;
			leadRoleId: Id<'circleRoles'> | null;
			skipped: boolean;
		} | null = null;

		if (includeDemo) {
			// Check if demo workspace already exists
			const existing = await ctx.db
				.query('workspaces')
				.withIndex('by_slug', (q) => q.eq('slug', 'demo'))
				.first();

			if (existing) {
				console.log('🏢 Demo workspace already exists, skipping...\n');
				demoWorkspace = {
					workspaceId: existing._id,
					rootCircleId: null,
					leadRoleId: null,
					skipped: true
				};
			} else {
				const result = await createMinimumViableWorkspace(ctx, {
					workspaceName: 'Demo Workspace',
					workspaceSlug: 'demo',
					rootCircleName: 'Company',
					rootCirclePurpose: 'Build great products and serve our customers',
					circleLeadTemplateId: circleLead._id
				});

				demoWorkspace = {
					...result,
					skipped: false
				};
			}
		}

		// ========================================================================
		// Summary
		// ========================================================================
		console.log('✅ Database seed complete!\n');
		console.log('Summary:');
		console.log(
			`  - Role templates: ${templatesResult.created} created, ${templatesResult.updated} updated, ${templatesResult.skipped} existed`
		);
		console.log(
			`  - Role governance backfill: ${backfillResult.patched} roles patched (${backfillResult.checked} checked)`
		);
		if (demoWorkspace) {
			if (demoWorkspace.skipped) {
				console.log(`  - Demo workspace: Already existed`);
			} else {
				console.log(`  - Demo workspace: Created`);
			}
		} else {
			console.log(`  - Demo workspace: Skipped`);
		}
		console.log('');

		return {
			success: true,
			roleTemplates: templatesResult,
			demoWorkspace
		};
	}
});

/**
 * Seed only system role templates (no demo workspace)
 *
 * Convenience mutation for when you only need templates.
 */
export const seedRoleTemplatesOnly = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🌱 Seeding role templates only...\n');
		const result = await createSystemRoleTemplates(ctx);
		console.log('✅ Done!\n');
		return result;
	}
});
