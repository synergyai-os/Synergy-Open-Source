/**
 * Report proposals lacking personId fields.
 *
 * Run:
 *   npx convex run admin/reportMissingProposalPersons
 */

import { internalQuery } from '../_generated/server';

export default internalQuery(async ({ db }) => {
	const missing: Array<{
		proposalId: string;
		workspaceId: string;
		legacyCreatedBy?: string;
		legacyProcessedBy?: string;
	}> = [];

	const proposals = await db.query('circleProposals').collect();
	for (const proposal of proposals) {
		const needsCreatedBy = !proposal.createdByPersonId && (proposal as any).createdBy;
		const needsProcessedBy = !proposal.processedByPersonId && (proposal as any).processedBy;
		if (needsCreatedBy || needsProcessedBy) {
			missing.push({
				proposalId: proposal._id,
				workspaceId: proposal.workspaceId,
				legacyCreatedBy: (proposal as any).createdBy,
				legacyProcessedBy: (proposal as any).processedBy
			});
		}
	}

	return {
		totalMissing: missing.length,
		byWorkspace: groupByWorkspace(missing),
		samples: missing.slice(0, 50)
	};
});

function groupByWorkspace(
	rows: Array<{ workspaceId: string; legacyCreatedBy?: string; legacyProcessedBy?: string }>
) {
	const grouped: Record<
		string,
		{ count: number; legacyUsers: Record<string, number>; processedUsers: Record<string, number> }
	> = {};

	for (const row of rows) {
		if (!grouped[row.workspaceId]) {
			grouped[row.workspaceId] = { count: 0, legacyUsers: {}, processedUsers: {} };
		}
		grouped[row.workspaceId].count++;
		if (row.legacyCreatedBy) {
			grouped[row.workspaceId].legacyUsers[row.legacyCreatedBy] =
				(grouped[row.workspaceId].legacyUsers[row.legacyCreatedBy] ?? 0) + 1;
		}
		if (row.legacyProcessedBy) {
			grouped[row.workspaceId].processedUsers[row.legacyProcessedBy] =
				(grouped[row.workspaceId].processedUsers[row.legacyProcessedBy] ?? 0) + 1;
		}
	}

	return grouped;
}
