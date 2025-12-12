/**
 * Migration: Archive abandoned workspaces (SYOS-811)
 *
 * Run with:
 * npx convex run admin/migrateArchiveAbandonedWorkspaces:archiveAbandonedWorkspaces
 */

import { internalMutation } from '../_generated/server';

export const archiveAbandonedWorkspaces = internalMutation({
	args: {},
	handler: async (ctx) => {
		console.log('🔄 Starting migration: Archive abandoned workspaces (SYOS-811)');

		const [workspaces, people] = await Promise.all([
			ctx.db.query('workspaces').collect(),
			ctx.db.query('people').collect()
		]);

		const activeWorkspaceIds = new Set<string>();
		for (const person of people) {
			if (person.status === 'active' && person.workspaceId) {
				activeWorkspaceIds.add(person.workspaceId.toString());
			}
		}

		let archivedCount = 0;
		const now = Date.now();

		for (const workspace of workspaces) {
			if (workspace.archivedAt) continue;
			if (activeWorkspaceIds.has(workspace._id.toString())) continue;

			await ctx.db.patch(workspace._id, {
				archivedAt: now,
				archivedReason: 'abandoned_no_active_people',
				updatedAt: now
			});
			archivedCount++;
		}

		console.log(`✅ Archived ${archivedCount} abandoned workspace(s)`);

		return {
			success: true,
			archivedCount
		};
	}
});
