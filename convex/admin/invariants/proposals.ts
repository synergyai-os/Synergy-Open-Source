import { internalQuery } from '../../_generated/server';
import { makeResult, type InvariantResult } from './types';

const VALID_PROPOSAL_STATUS = new Set([
	'draft',
	'submitted',
	'in_meeting',
	'objections',
	'integrated',
	'approved',
	'rejected',
	'withdrawn'
]);

export const checkPROP01 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const proposals = await ctx.db.query('circleProposals').collect();
		const workspaces = await ctx.db.query('workspaces').collect();
		const workspaceIds = new Set(workspaces.map((workspace) => workspace._id.toString()));

		const violations = proposals
			.filter(
				(proposal) => !proposal.workspaceId || !workspaceIds.has(proposal.workspaceId.toString())
			)
			.map((proposal) => proposal._id.toString());

		return makeResult({
			id: 'PROP-01',
			name: 'Every proposal.workspaceId points to existing workspace',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All proposals reference valid workspaces'
					: `${violations.length} proposals reference missing workspaces`
		});
	}
});

export const checkPROP02 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const proposals = await ctx.db.query('circleProposals').collect();
		const circles = await ctx.db.query('circles').collect();
		const circleIds = new Set(circles.map((circle) => circle._id.toString()));

		const violations = proposals
			.filter((proposal) => proposal.circleId && !circleIds.has(proposal.circleId.toString()))
			.map((proposal) => proposal._id.toString());

		return makeResult({
			id: 'PROP-02',
			name: 'Every proposal.circleId points to existing circle',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All proposals reference valid circles'
					: `${violations.length} proposals reference missing circles`
		});
	}
});

export const checkPROP03 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const proposals = await ctx.db.query('circleProposals').collect();
		const people = await ctx.db.query('people').collect();
		const personIds = new Set(people.map((person) => person._id.toString()));

		const violations = proposals
			.filter(
				(proposal) =>
					!proposal.createdByPersonId || !personIds.has(proposal.createdByPersonId.toString())
			)
			.map((proposal) => proposal._id.toString());

		return makeResult({
			id: 'PROP-03',
			name: 'Every proposal.createdByPersonId points to existing person',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All proposals reference valid creators'
					: `${violations.length} proposals reference missing people`
		});
	}
});

export const checkPROP04 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const violations = (await ctx.db.query('circleProposals').collect())
			.filter((proposal) => !VALID_PROPOSAL_STATUS.has(proposal.status))
			.map((proposal) => proposal._id.toString());

		return makeResult({
			id: 'PROP-04',
			name: 'Proposal status is valid enum value',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'All proposals use valid status values'
					: `${violations.length} proposals with invalid status`
		});
	}
});

export const checkPROP05 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const proposals = await ctx.db.query('circleProposals').collect();

		const violations = proposals
			.filter((proposal) => proposal.status !== 'draft' && proposal.submittedAt === undefined)
			.map((proposal) => proposal._id.toString());

		return makeResult({
			id: 'PROP-05',
			name: 'Proposal state transitions follow state machine',
			severity: 'critical',
			violations,
			message:
				violations.length === 0
					? 'Proposal lifecycle markers align with states'
					: `${violations.length} proposal(s) missing submittedAt for non-draft states`
		});
	}
});

export const checkPROP06 = internalQuery({
	args: {},
	handler: async (ctx): Promise<InvariantResult> => {
		const violations = (
			await ctx.db
				.query('circleProposals')
				.filter((q) => q.eq(q.field('status'), 'approved'))
				.collect()
		)
			.filter((proposal) => proposal.processedAt === undefined)
			.map((proposal) => proposal._id.toString());

		return makeResult({
			id: 'PROP-06',
			name: 'Approved proposals have processedAt timestamp',
			severity: 'warning',
			violations,
			message:
				violations.length === 0
					? 'All approved proposals record processedAt'
					: `${violations.length} approved proposal(s) missing processedAt`
		});
	}
});
