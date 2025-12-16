/**
 * Reset Workspace After Onboarding
 *
 * Completely deletes all workspace-related data created during onboarding.
 * This is a destructive operation - use with caution!
 *
 * Deletes in dependency order to respect foreign key constraints:
 * 1. Child records (assignments, circleMembers, customFieldValues, etc.)
 * 2. Parent records (circles, circleRoles, people, etc.)
 * 3. Workspace itself
 *
 * @see architecture.md - Admin Tooling section
 */

import { internalMutation } from '../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../_generated/dataModel';
import type { MutationCtx } from '../_generated/server';

/**
 * Shared deletion logic for a single workspace
 */
async function deleteWorkspaceData(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>
): Promise<Record<string, number>> {
	const deletedCounts: Record<string, number> = {};

	// Get all circles and people first (needed for queries)
	const circles = await ctx.db
		.query('circles')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	const people = await ctx.db
		.query('people')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	// ============================================================================
	// Phase 1: Delete child records (those that reference other tables)
	// ============================================================================

	// Delete assignments (references circleId, roleId, personId)
	const assignmentSet = new Set<Id<'assignments'>>();
	for (const circle of circles) {
		const circleAssignments = await ctx.db
			.query('assignments')
			.withIndex('by_circle', (q) => q.eq('circleId', circle._id))
			.collect();
		for (const assignment of circleAssignments) {
			assignmentSet.add(assignment._id);
		}
	}
	for (const person of people) {
		const personAssignments = await ctx.db
			.query('assignments')
			.withIndex('by_person', (q) => q.eq('personId', person._id))
			.collect();
		for (const assignment of personAssignments) {
			assignmentSet.add(assignment._id);
		}
	}
	for (const assignmentId of assignmentSet) {
		await ctx.db.delete(assignmentId);
	}
	deletedCounts.assignments = assignmentSet.size;
	console.log(`  ✅ Deleted ${assignmentSet.size} assignments`);

	// Delete circleMembers (references circleId, personId)
	const circleMemberSet = new Set<Id<'circleMembers'>>();
	for (const circle of circles) {
		const members = await ctx.db
			.query('circleMembers')
			.withIndex('by_circle', (q) => q.eq('circleId', circle._id))
			.collect();
		for (const member of members) {
			circleMemberSet.add(member._id);
		}
	}
	for (const memberId of circleMemberSet) {
		await ctx.db.delete(memberId);
	}
	deletedCounts.circleMembers = circleMemberSet.size;
	console.log(`  ✅ Deleted ${circleMemberSet.size} circle members`);

	// Delete customFieldValues (references customFieldDefinitions)
	const customFieldDefs = await ctx.db
		.query('customFieldDefinitions')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();
	let customFieldValuesCount = 0;
	for (const def of customFieldDefs) {
		const values = await ctx.db
			.query('customFieldValues')
			.withIndex('by_definition', (q) => q.eq('definitionId', def._id))
			.collect();
		for (const value of values) {
			await ctx.db.delete(value._id);
			customFieldValuesCount++;
		}
	}
	deletedCounts.customFieldValues = customFieldValuesCount;
	console.log(`  ✅ Deleted ${customFieldValuesCount} custom field values`);

	// Delete workspaceRoles (references personId, workspaceId)
	const workspaceRoleSet = new Set<Id<'workspaceRoles'>>();
	for (const person of people) {
		const roles = await ctx.db
			.query('workspaceRoles')
			.withIndex('by_person', (q) => q.eq('personId', person._id))
			.collect();
		for (const role of roles) {
			// Only delete if it's for this workspace
			if (role.workspaceId === workspaceId) {
				workspaceRoleSet.add(role._id);
			}
		}
	}
	for (const roleId of workspaceRoleSet) {
		await ctx.db.delete(roleId);
	}
	deletedCounts.workspaceRoles = workspaceRoleSet.size;
	console.log(`  ✅ Deleted ${workspaceRoleSet.size} workspace roles`);

	// Delete workspaceInvites (references workspaceId)
	const invites = await ctx.db
		.query('workspaceInvites')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();
	for (const invite of invites) {
		await ctx.db.delete(invite._id);
	}
	deletedCounts.workspaceInvites = invites.length;
	console.log(`  ✅ Deleted ${invites.length} workspace invites`);

	// ============================================================================
	// Phase 2: Delete parent records (circles, roles, people, etc.)
	// ============================================================================

	// Delete circleRoles (references circleId)
	const circleRoleSet = new Set<Id<'circleRoles'>>();
	for (const circle of circles) {
		const roles = await ctx.db
			.query('circleRoles')
			.withIndex('by_circle', (q) => q.eq('circleId', circle._id))
			.collect();
		for (const role of roles) {
			circleRoleSet.add(role._id);
		}
	}
	for (const roleId of circleRoleSet) {
		await ctx.db.delete(roleId);
	}
	deletedCounts.circleRoles = circleRoleSet.size;
	console.log(`  ✅ Deleted ${circleRoleSet.size} circle roles`);

	// Delete circles (references workspaceId)
	for (const circle of circles) {
		await ctx.db.delete(circle._id);
	}
	deletedCounts.circles = circles.length;
	console.log(`  ✅ Deleted ${circles.length} circles`);

	// Delete customFieldDefinitions (references workspaceId)
	for (const def of customFieldDefs) {
		await ctx.db.delete(def._id);
	}
	deletedCounts.customFieldDefinitions = customFieldDefs.length;
	console.log(`  ✅ Deleted ${customFieldDefs.length} custom field definitions`);

	// Delete meetingTemplateSteps (references meetingTemplates)
	const meetingTemplates = await ctx.db
		.query('meetingTemplates')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();
	let templateStepsCount = 0;
	for (const template of meetingTemplates) {
		const steps = await ctx.db
			.query('meetingTemplateSteps')
			.withIndex('by_template', (q) => q.eq('templateId', template._id))
			.collect();
		for (const step of steps) {
			await ctx.db.delete(step._id);
			templateStepsCount++;
		}
	}
	deletedCounts.meetingTemplateSteps = templateStepsCount;
	console.log(`  ✅ Deleted ${templateStepsCount} meeting template steps`);

	// Delete meetingTemplates (references workspaceId)
	for (const template of meetingTemplates) {
		await ctx.db.delete(template._id);
	}
	deletedCounts.meetingTemplates = meetingTemplates.length;
	console.log(`  ✅ Deleted ${meetingTemplates.length} meeting templates`);

	// Delete orgVersionHistory (references workspaceId)
	const history = await ctx.db
		.query('orgVersionHistory')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();
	for (const entry of history) {
		await ctx.db.delete(entry._id);
	}
	deletedCounts.orgVersionHistory = history.length;
	console.log(`  ✅ Deleted ${history.length} org version history entries`);

	// Delete onboardingProgress (references personId, workspaceId)
	const onboardingProgress = await ctx.db
		.query('onboardingProgress')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();
	for (const progress of onboardingProgress) {
		await ctx.db.delete(progress._id);
	}
	deletedCounts.onboardingProgress = onboardingProgress.length;
	console.log(`  ✅ Deleted ${onboardingProgress.length} onboarding progress records`);

	// Delete workspace settings (references workspaceId)
	const workspaceSettings = await ctx.db
		.query('workspaceSettings')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();
	for (const setting of workspaceSettings) {
		await ctx.db.delete(setting._id);
	}
	deletedCounts.workspaceSettings = workspaceSettings.length;
	console.log(`  ✅ Deleted ${workspaceSettings.length} workspace settings`);

	const workspaceOrgSettings = await ctx.db
		.query('workspaceOrgSettings')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();
	for (const setting of workspaceOrgSettings) {
		await ctx.db.delete(setting._id);
	}
	deletedCounts.workspaceOrgSettings = workspaceOrgSettings.length;
	console.log(`  ✅ Deleted ${workspaceOrgSettings.length} workspace org settings`);

	// Delete workspaceAliases (references workspaceId)
	// Note: workspaceAliases only has by_slug index, so we query all and filter
	const allAliases = await ctx.db.query('workspaceAliases').collect();
	const workspaceAliases = allAliases.filter((a) => a.workspaceId === workspaceId);
	for (const alias of workspaceAliases) {
		await ctx.db.delete(alias._id);
	}
	deletedCounts.workspaceAliases = workspaceAliases.length;
	console.log(`  ✅ Deleted ${workspaceAliases.length} workspace aliases`);

	// Delete people (references workspaceId)
	for (const person of people) {
		await ctx.db.delete(person._id);
	}
	deletedCounts.people = people.length;
	console.log(`  ✅ Deleted ${people.length} people`);

	// ============================================================================
	// Phase 3: Delete workspace itself
	// ============================================================================

	await ctx.db.delete(workspaceId);
	deletedCounts.workspaces = 1;
	console.log(`  ✅ Deleted workspace`);

	return deletedCounts;
}

/**
 * Reset a single workspace by deleting all onboarding-related data
 *
 * Usage:
 *   npx convex run internal.admin.resetWorkspace.resetWorkspace --arg '{"workspaceId": "..."}'
 *
 * @param workspaceId - The workspace to reset
 * @returns Count of deleted records by table
 */
export const resetWorkspace = internalMutation({
	args: {
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { workspaceId } = args;

		console.log(`🗑️  Resetting workspace: ${workspaceId}`);

		const deletedCounts = await deleteWorkspaceData(ctx, workspaceId);

		console.log(`\n✅ Workspace reset complete!`);
		console.log(`📊 Deletion summary:`, deletedCounts);

		return deletedCounts;
	}
});

/**
 * Delete ALL workspaces and their data
 *
 * ⚠️ WARNING: This deletes EVERY workspace in the database!
 * Use with extreme caution - this is irreversible!
 *
 * Usage:
 *   npx convex run internal.admin.resetWorkspace.deleteAllWorkspaces
 *
 * @returns Summary of deleted workspaces
 */
export const deleteAllWorkspaces = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log(`🗑️  DELETING ALL WORKSPACES...`);
		console.log(`⚠️  This is a destructive operation!`);

		// Get all workspaces
		const allWorkspaces = await ctx.db.query('workspaces').collect();

		console.log(`\nFound ${allWorkspaces.length} workspace(s) to delete\n`);

		const results: Array<{
			workspaceId: Id<'workspaces'>;
			workspaceName: string;
			deletedCounts: Record<string, number>;
		}> = [];

		for (const workspace of allWorkspaces) {
			console.log(`\n${'='.repeat(60)}`);
			console.log(`Deleting workspace: ${workspace.name} (${workspace._id})`);
			console.log(`${'='.repeat(60)}`);

			const deletedCounts = await deleteWorkspaceData(ctx, workspace._id);
			results.push({
				workspaceId: workspace._id,
				workspaceName: workspace.name,
				deletedCounts
			});
		}

		console.log(`\n\n${'='.repeat(60)}`);
		console.log(`✅ All workspaces deleted!`);
		console.log(`${'='.repeat(60)}`);
		console.log(`\nSummary:`);
		for (const result of results) {
			console.log(`  - ${result.workspaceName}: ${JSON.stringify(result.deletedCounts)}`);
		}

		return {
			totalWorkspaces: allWorkspaces.length,
			results
		};
	}
});
