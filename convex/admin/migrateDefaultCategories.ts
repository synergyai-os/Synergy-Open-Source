/**
 * Migration: Create Default Item Categories for Existing Workspaces
 *
 * This migration creates default circle and role item categories for workspaces
 * that don't have them yet.
 *
 * Default circle categories: Purpose, Domains, Accountabilities, Policies, Decision Rights, Notes
 * Default role categories: Purpose, Domains, Accountabilities, Policies, Decision Rights, Notes
 *
 * Run with: npx convex run admin/migrateDefaultCategories:migrateDefaultCategories
 */

import { internalMutation } from '../_generated/server';
import type { MutationCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';

/**
 * Helper function to get workspace owner (first owner/admin member)
 */
async function getWorkspaceOwner(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>
): Promise<Id<'users'> | null> {
	const people = await ctx.db
		.query('people')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	// Find first owner or admin
	const owner = people.find((p) => p.workspaceRole === 'owner' || p.workspaceRole === 'admin');
	if (owner) {
		return owner.userId;
	}

	// Fallback to first member
	if (members.length > 0) {
		return members[0].userId;
	}

	return null;
}

/**
 * Create default item categories for workspaces that don't have them
 * This is idempotent - safe to run multiple times
 */
export const migrateDefaultCategories = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🔄 Starting migration: Default Categories Backfill');
		console.log('  Creating default item categories for workspaces\n');

		const workspaces = await ctx.db.query('workspaces').collect();
		let created = 0;
		let skipped = 0;
		let errors = 0;

		// Default categories configuration
		const circleCategories = [
			{ name: 'Purpose', order: 0 },
			{ name: 'Domains', order: 1 },
			{ name: 'Accountabilities', order: 2 },
			{ name: 'Policies', order: 3 },
			{ name: 'Decision Rights', order: 4 },
			{ name: 'Notes', order: 5 }
		];

		const roleCategories = [
			{ name: 'Purpose', order: 0 },
			{ name: 'Domains', order: 1 },
			{ name: 'Accountabilities', order: 2 },
			{ name: 'Policies', order: 3 },
			{ name: 'Decision Rights', order: 4 },
			{ name: 'Notes', order: 5 }
		];

		for (const workspace of workspaces) {
			try {
				// Check if workspace already has categories
				const existingCategories = await ctx.db
					.query('circleItemCategories')
					.withIndex('by_workspace', (q) => q.eq('workspaceId', workspace._id))
					.first();

				if (existingCategories) {
					console.log(`⏭️  Workspace ${workspace.name} already has categories, skipping...`);
					skipped++;
					continue;
				}

				// Get workspace owner for createdBy
				const ownerId = await getWorkspaceOwner(ctx, workspace._id);
				if (!ownerId) {
					console.log(`⚠️  Workspace ${workspace.name} has no members, cannot create categories`);
					errors++;
					continue;
				}

				const now = Date.now();
				let workspaceCreated = 0;

				// Create circle categories
				for (const category of circleCategories) {
					await ctx.db.insert('circleItemCategories', {
						workspaceId: workspace._id,
						entityType: 'circle',
						name: category.name,
						order: category.order,
						isDefault: true,
						createdAt: now,
						createdBy: ownerId,
						updatedAt: now
					});
					workspaceCreated++;
				}

				// Create role categories
				for (const category of roleCategories) {
					await ctx.db.insert('circleItemCategories', {
						workspaceId: workspace._id,
						entityType: 'role',
						name: category.name,
						order: category.order,
						isDefault: true,
						createdAt: now,
						createdBy: ownerId,
						updatedAt: now
					});
					workspaceCreated++;
				}

				console.log(
					`✅ Created ${workspaceCreated} default categories for workspace: ${workspace.name}`
				);
				created++;
			} catch (error) {
				console.error(`❌ Error creating categories for workspace ${workspace.name}:`, error);
				errors++;
			}
		}

		// ============================================================================
		// SUMMARY
		// ============================================================================
		console.log('\n✅ Migration complete!');
		console.log(`- Workspaces with categories created: ${created}`);
		console.log(`- Workspaces skipped (already have categories): ${skipped}`);
		console.log(`- Errors: ${errors}`);
		console.log(`- Total workspaces processed: ${workspaces.length}`);

		return {
			success: true,
			created,
			skipped,
			errors,
			totalWorkspaces: workspaces.length
		};
	}
});
