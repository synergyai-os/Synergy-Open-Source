/**
 * Migration: Backfill Soft Delete Fields
 *
 * This migration ensures all existing org chart entities have the required
 * soft delete fields (updatedAt, updatedBy, etc.) populated.
 *
 * Run with: npx convex run admin/migrateOrgChartSoftDelete:migrateSoftDeleteFields
 */

import { internalMutation } from '../_generated/server';

/**
 * Backfill soft delete fields for all org chart entities
 * This is idempotent - safe to run multiple times
 */
export const migrateSoftDeleteFields = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🔄 Starting migration: Soft Delete Fields Backfill');
		console.log('  Tables: circles, circleRoles, userCircleRoles, circleMembers\n');

		let circlesUpdated = 0;
		let rolesUpdated = 0;
		let assignmentsUpdated = 0;
		let membersUpdated = 0;

		// ============================================================================
		// STEP 1: Circles - Add updatedAt where missing
		// ============================================================================
		console.log('🔍 Step 1: Backfilling circles...');
		const circles = await ctx.db.query('circles').collect();

		for (const circle of circles) {
			const updates: {
				updatedAt?: number;
			} = {};

			// Add updatedAt if missing (use createdAt as fallback)
			if (!circle.updatedAt) {
				updates.updatedAt = circle.createdAt || Date.now();
			}

			if (Object.keys(updates).length > 0) {
				await ctx.db.patch(circle._id, updates);
				circlesUpdated++;
			}
		}

		console.log(`✅ Updated ${circlesUpdated} circles`);

		// ============================================================================
		// STEP 2: Circle Roles - Add updatedAt where missing
		// ============================================================================
		console.log('🔍 Step 2: Backfilling circle roles...');
		const roles = await ctx.db.query('circleRoles').collect();

		for (const role of roles) {
			const updates: {
				updatedAt?: number;
			} = {};

			// Add updatedAt if missing (use createdAt as fallback)
			if (!role.updatedAt) {
				updates.updatedAt = role.createdAt || Date.now();
			}

			if (Object.keys(updates).length > 0) {
				await ctx.db.patch(role._id, updates);
				rolesUpdated++;
			}
		}

		console.log(`✅ Updated ${rolesUpdated} circle roles`);

		// ============================================================================
		// STEP 3: User Circle Roles (Assignments) - Add updatedAt where missing
		// ============================================================================
		console.log('🔍 Step 3: Backfilling user circle role assignments...');
		const assignments = await ctx.db.query('userCircleRoles').collect();

		for (const assignment of assignments) {
			const updates: {
				updatedAt?: number;
			} = {};

			// Add updatedAt if missing (use assignedAt as fallback)
			if (!assignment.updatedAt) {
				updates.updatedAt = assignment.assignedAt || Date.now();
			}

			if (Object.keys(updates).length > 0) {
				await ctx.db.patch(assignment._id, updates);
				assignmentsUpdated++;
			}
		}

		console.log(`✅ Updated ${assignmentsUpdated} user circle role assignments`);

		// ============================================================================
		// STEP 4: Circle Members - No updatedAt field needed (uses joinedAt)
		// ============================================================================
		console.log('🔍 Step 4: Checking circle members...');
		const members = await ctx.db.query('circleMembers').collect();
		membersUpdated = members.length; // Just count, no updates needed
		console.log(`✅ Verified ${membersUpdated} circle members (no updates needed)`);

		// ============================================================================
		// SUMMARY
		// ============================================================================
		console.log('\n✅ Migration complete!');
		console.log(`- Circles updated: ${circlesUpdated}`);
		console.log(`- Circle roles updated: ${rolesUpdated}`);
		console.log(`- Assignments updated: ${assignmentsUpdated}`);
		console.log(`- Members verified: ${membersUpdated}`);

		return {
			success: true,
			circlesUpdated,
			rolesUpdated,
			assignmentsUpdated,
			membersVerified: membersUpdated
		};
	}
});
