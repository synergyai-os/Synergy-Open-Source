/**
 * Lead Authority Migration
 *
 * SYOS-1077: Clean migration to Lead Authority model
 *
 * Since we have zero production users, we can do a clean migration:
 * 1. Delete all existing circles, roles, assignments
 * 2. Delete all existing role templates
 * 3. Re-run seed data with new model
 *
 * This migration is safe because:
 * - No production data exists
 * - All test data can be regenerated
 * - Seed scripts are idempotent and up-to-date
 */

import { internalMutation } from '../../_generated/server';
import { createSystemRoleTemplates } from '../seed/roleTemplates';

export const cleanAndReseed = internalMutation({
	handler: async (ctx) => {
		console.log('🔄 Starting Lead Authority Migration...\n');

		// ============================================================================
		// Step 1: Delete existing data
		// ============================================================================
		console.log('📦 Step 1: Cleaning existing data...');

		// Delete assignments first (depends on roles and circles)
		const assignments = await ctx.db.query('assignments').collect();
		console.log(`  Deleting ${assignments.length} assignments...`);
		for (const assignment of assignments) {
			await ctx.db.delete(assignment._id);
		}

		// Delete circle members
		const circleMembers = await ctx.db.query('circleMembers').collect();
		console.log(`  Deleting ${circleMembers.length} circle members...`);
		for (const member of circleMembers) {
			await ctx.db.delete(member._id);
		}

		// Delete circle roles
		const roles = await ctx.db.query('circleRoles').collect();
		console.log(`  Deleting ${roles.length} circle roles...`);
		for (const role of roles) {
			await ctx.db.delete(role._id);
		}

		// Delete circles
		const circles = await ctx.db.query('circles').collect();
		console.log(`  Deleting ${circles.length} circles...`);
		for (const circle of circles) {
			await ctx.db.delete(circle._id);
		}

		// Delete existing role templates
		const templates = await ctx.db.query('roleTemplates').collect();
		console.log(`  Deleting ${templates.length} role templates...`);
		for (const template of templates) {
			await ctx.db.delete(template._id);
		}

		console.log('✅ Data cleanup complete\n');

		// ============================================================================
		// Step 2: Re-seed with new model
		// ============================================================================
		console.log('🌱 Step 2: Re-seeding with Lead Authority model...');

		const result = await createSystemRoleTemplates(ctx);

		console.log(
			`✅ Migration complete!\n` +
				`   - ${result.created} new templates created\n` +
				`   - ${result.updated} templates updated\n` +
				`   - ${result.skipped} templates unchanged\n` +
				`   - Total: ${result.created + result.updated + result.skipped} templates (7 expected)\n`
		);

		return {
			success: true,
			templatesCreated: result.created,
			templatesUpdated: result.updated,
			templatesSkipped: result.skipped,
			totalTemplates: result.created + result.updated + result.skipped
		};
	}
});
