/**
 * Migration: Seed System-Level Role Templates
 *
 * This migration creates system-level role templates that are available to all workspaces.
 * System templates have workspaceId = undefined.
 *
 * Default system templates:
 * - Circle Lead (core, required)
 * - Facilitator (core, optional)
 * - Secretary (core, optional)
 *
 * Run with: npx convex run admin/seedRoleTemplates:seedRoleTemplates
 */

import { internalMutation } from '../_generated/server';
import type { MutationCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';
import { createError, ErrorCodes } from '../infrastructure/errors/codes';

/**
 * Helper function to get any user ID (for system operations)
 */
async function getAnyUserId(ctx: MutationCtx): Promise<Id<'users'> | null> {
	const user = await ctx.db.query('users').first();
	return user?._id ?? null;
}

/**
 * Seed system-level role templates
 * This is idempotent - safe to run multiple times (checks for existing templates)
 */
export const seedRoleTemplates = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🔄 Starting migration: Role Templates Seeding');
		console.log('  Creating system-level role templates\n');

		// Get a system user ID for createdBy
		const systemUserId = await getAnyUserId(ctx);
		if (!systemUserId) {
			throw createError(
				ErrorCodes.GENERIC_ERROR,
				'No users found in database. Cannot create role templates.'
			);
		}

		// System-level templates configuration
		const systemTemplates = [
			{
				name: 'Circle Lead',
				description: 'Leads the circle and coordinates work',
				isCore: true,
				isRequired: true
			},
			{
				name: 'Facilitator',
				description: 'Facilitates meetings and governance',
				isCore: true,
				isRequired: false
			},
			{
				name: 'Secretary',
				description: 'Manages records and communications',
				isCore: true,
				isRequired: false
			}
		];

		let created = 0;
		let skipped = 0;
		let errors = 0;

		const now = Date.now();

		for (const template of systemTemplates) {
			try {
				// Check if system template already exists (workspaceId = undefined)
				const existing = await ctx.db
					.query('roleTemplates')
					.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
					.filter((q) => q.eq(q.field('name'), template.name))
					.first();

				if (existing) {
					console.log(`⏭️  System template "${template.name}" already exists, skipping...`);
					skipped++;
					continue;
				}

				// Create system template (workspaceId = undefined)
				await ctx.db.insert('roleTemplates', {
					workspaceId: undefined, // System-level template
					name: template.name,
					description: template.description,
					isCore: template.isCore,
					isRequired: template.isRequired,
					createdAt: now,
					createdBy: systemUserId,
					updatedAt: now
				});

				console.log(`✅ Created system template: ${template.name}`);
				created++;
			} catch (error) {
				console.error(`❌ Error creating template "${template.name}":`, error);
				errors++;
			}
		}

		// ============================================================================
		// SUMMARY
		// ============================================================================
		console.log('\n✅ Migration complete!');
		console.log(`- Templates created: ${created}`);
		console.log(`- Templates skipped (already exist): ${skipped}`);
		console.log(`- Errors: ${errors}`);
		console.log(`- Total templates processed: ${systemTemplates.length}`);

		return {
			success: true,
			created,
			skipped,
			errors,
			totalTemplates: systemTemplates.length
		};
	}
});
