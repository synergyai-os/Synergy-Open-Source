/**
 * Audit: report users with workspace membership but missing people rows.
 *
 * Run:
 *   npx convex run admin/reportMissingUsersPeople
 */

import { internalQuery } from '../_generated/server';

export default internalQuery(async ({ db }) => {
	const memberships = await db.query('workspaceMembers').collect();

	const missing: Array<{
		workspaceId: string;
		userId: string;
		role: string;
	}> = [];

	for (const membership of memberships) {
		const existingPerson = await db
			.query('people')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', membership.workspaceId).eq('userId', membership.userId)
			)
			.first();

		if (!existingPerson) {
			missing.push({
				workspaceId: membership.workspaceId,
				userId: membership.userId,
				role: membership.role
			});
		}
	}

	return {
		totalMissing: missing.length,
		byWorkspace: groupByWorkspace(missing),
		samples: missing.slice(0, 50)
	};
});

function groupByWorkspace(rows: Array<{ workspaceId: string; userId: string; role: string }>) {
	const grouped: Record<string, { count: number; users: Record<string, number>; roles: string[] }> =
		{};

	for (const row of rows) {
		if (!grouped[row.workspaceId]) {
			grouped[row.workspaceId] = { count: 0, users: {}, roles: [] };
		}
		grouped[row.workspaceId].count++;
		grouped[row.workspaceId].users[row.userId] =
			(grouped[row.workspaceId].users[row.userId] ?? 0) + 1;
		grouped[row.workspaceId].roles.push(row.role);
	}

	return grouped;
}
