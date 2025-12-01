/**
 * Migration: Create Root Circles for Existing Workspaces
 *
 * This migration creates root circles for workspaces that don't have one.
 * Root circles are identified by parentCircleId = undefined.
 *
 * Run with: npx convex run admin/migrateRootCircles:migrateRootCircles
 */

import { internalMutation } from '../_generated/server';
import type { Id } from '../_generated/dataModel';

/**
 * Helper function to get workspace owner (first owner/admin member)
 */
async function getWorkspaceOwner(
	ctx: { db: { query: (table: string) => any } },
	workspaceId: Id<'workspaces'>
): Promise<Id<'users'> | null> {
	const members = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	// Find first owner or admin
	const owner = members.find((m) => m.role === 'owner' || m.role === 'admin');
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
 * Create root circles for workspaces that don't have one
 * This is idempotent - safe to run multiple times
 */
export const migrateRootCircles = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🔄 Starting migration: Root Circle Backfill');
		console.log('  Creating root circles for workspaces without one\n');

		const workspaces = await ctx.db.query('workspaces').collect();
		let created = 0;
		let skipped = 0;
		let errors = 0;

		for (const workspace of workspaces) {
			try {
				// Check if workspace already has a root circle
				const existingRoot = await ctx.db
					.query('circles')
					.withIndex('by_workspace', (q) => q.eq('workspaceId', workspace._id))
					.filter((q) => q.eq(q.field('parentCircleId'), undefined))
					.first();

				if (existingRoot) {
					console.log(`⏭️  Workspace ${workspace.name} already has root circle, skipping...`);
					skipped++;
					continue;
				}

				// Get workspace owner for createdBy
				const ownerId = await getWorkspaceOwner(ctx, workspace._id);
				if (!ownerId) {
					console.log(`⚠️  Workspace ${workspace.name} has no members, cannot create root circle`);
					errors++;
					continue;
				}

				// Create root circle
				const now = Date.now();
				await ctx.db.insert('circles', {
					workspaceId: workspace._id,
					name: 'General Circle',
					slug: 'general-circle',
					parentCircleId: undefined, // undefined = root circle
					createdAt: now,
					updatedAt: now,
					updatedBy: ownerId
				});

				console.log(`✅ Created root circle for workspace: ${workspace.name}`);
				created++;
			} catch (error) {
				console.error(`❌ Error creating root circle for workspace ${workspace.name}:`, error);
				errors++;
			}
		}

		// ============================================================================
		// SUMMARY
		// ============================================================================
		console.log('\n✅ Migration complete!');
		console.log(`- Root circles created: ${created}`);
		console.log(`- Workspaces skipped (already have root): ${skipped}`);
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
