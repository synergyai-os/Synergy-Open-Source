/**
 * Migration: proposals userId → personId
 *
 * Backfills proposal identity fields to personId for security/workspace isolation.
 *
 * Run:
 *   npx convex run admin/migrateProposalsToPerson
 */

import { internalMutation } from '../_generated/server';

type WorkspaceUserKey = string;

export default internalMutation(async ({ db }) => {
	console.log('Starting proposals → personId migration');

	// Build workspace-user → personId map
	const people = await db.query('people').collect();
	const personMap = new Map<WorkspaceUserKey, string>();
	for (const person of people) {
		const userId = (person as any).userId;
		if (!userId) continue;
		personMap.set(makeKey(person.workspaceId, userId), person._id);
	}
	console.log(`Loaded ${personMap.size} active person mappings`);

	let proposalsUpdated = 0;
	let proposalsMissing = 0;
	let objectionsUpdated = 0;
	let objectionsMissing = 0;
	let attachmentsUpdated = 0;
	let attachmentsMissing = 0;

	// Migrate circleProposals
	const proposals = await db.query('circleProposals').collect();
	for (const proposal of proposals) {
		const updates: Record<string, any> = {};
		const legacyCreatedBy = (proposal as any).createdBy;
		if (!proposal.createdByPersonId && legacyCreatedBy) {
			const personId = personMap.get(makeKey(proposal.workspaceId, legacyCreatedBy));
			if (personId) {
				updates.createdByPersonId = personId;
			} else {
				proposalsMissing++;
			}
		}

		const legacyProcessedBy = (proposal as any).processedBy;
		if (!proposal.processedByPersonId && legacyProcessedBy) {
			const personId = personMap.get(makeKey(proposal.workspaceId, legacyProcessedBy));
			if (personId) {
				updates.processedByPersonId = personId;
			} else {
				proposalsMissing++;
			}
		}

		if (Object.keys(updates).length > 0) {
			await db.patch(proposal._id, updates);
			proposalsUpdated++;
		}
	}

	// Migrate proposalObjections
	const objections = await db.query('proposalObjections').collect();
	for (const objection of objections) {
		const updates: Record<string, any> = {};
		const legacyRaisedBy = (objection as any).raisedBy;
		if (!objection.raisedByPersonId && legacyRaisedBy) {
			const proposal = await db.get(objection.proposalId);
			if (proposal) {
				const personId = personMap.get(makeKey(proposal.workspaceId, legacyRaisedBy));
				if (personId) {
					updates.raisedByPersonId = personId;
				} else {
					objectionsMissing++;
				}
			}
		}

		const legacyValidatedBy = (objection as any).validatedBy;
		if (!objection.validatedByPersonId && legacyValidatedBy) {
			const proposal = await db.get(objection.proposalId);
			if (proposal) {
				const personId = personMap.get(makeKey(proposal.workspaceId, legacyValidatedBy));
				if (personId) {
					updates.validatedByPersonId = personId;
				} else {
					objectionsMissing++;
				}
			}
		}

		if (Object.keys(updates).length > 0) {
			await db.patch(objection._id, updates);
			objectionsUpdated++;
		}
	}

	// Migrate proposalAttachments
	const attachments = await db.query('proposalAttachments').collect();
	for (const attachment of attachments) {
		const updates: Record<string, any> = {};
		const legacyUploadedBy = (attachment as any).uploadedBy;
		if (!attachment.uploadedByPersonId && legacyUploadedBy) {
			// Need workspace to resolve; fetch proposal
			const proposal = await db.get(attachment.proposalId);
			if (proposal) {
				const personId = personMap.get(makeKey(proposal.workspaceId, legacyUploadedBy));
				if (personId) {
					updates.uploadedByPersonId = personId;
				} else {
					attachmentsMissing++;
				}
			}
		}

		if (Object.keys(updates).length > 0) {
			await db.patch(attachment._id, updates);
			attachmentsUpdated++;
		}
	}

	console.log('Migration complete');
	console.log(
		JSON.stringify(
			{
				proposalsUpdated,
				proposalsMissing,
				objectionsUpdated,
				objectionsMissing,
				attachmentsUpdated,
				attachmentsMissing
			},
			null,
			2
		)
	);

	return {
		success: true,
		proposalsUpdated,
		proposalsMissing,
		objectionsUpdated,
		objectionsMissing,
		attachmentsUpdated,
		attachmentsMissing
	};
});

function makeKey(workspaceId: string, userId: string): WorkspaceUserKey {
	return `${workspaceId}:${userId}`;
}
