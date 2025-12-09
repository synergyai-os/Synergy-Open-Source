import { query } from '../../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../../sessionValidation';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import type { Doc, Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import { ensureWorkspaceMembership } from './proposalAccess';
import type { ProposalStatus } from './proposalTypes';

async function listProposalsQuery(
	ctx: QueryCtx,
	args: {
		sessionId: string;
		workspaceId: Id<'workspaces'>;
		status?: ProposalStatus;
		circleId?: Id<'circles'>;
		creatorId?: Id<'users'>;
		limit?: number;
	}
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

	let proposals: Doc<'circleProposals'>[];

	if (args.circleId) {
		proposals = await ctx.db
			.query('circleProposals')
			.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
			.collect();
		proposals = proposals.filter((p) => p.workspaceId === args.workspaceId);
	} else if (args.status) {
		proposals = await ctx.db
			.query('circleProposals')
			.withIndex('by_workspace_status', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('status', args.status)
			)
			.collect();
	} else if (args.creatorId) {
		proposals = await ctx.db
			.query('circleProposals')
			.withIndex('by_creator', (q) => q.eq('createdBy', args.creatorId))
			.collect();
		proposals = proposals.filter((p) => p.workspaceId === args.workspaceId);
	} else {
		proposals = await ctx.db
			.query('circleProposals')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect();
	}

	if (args.status && args.circleId) {
		proposals = proposals.filter((p) => p.status === args.status);
	}
	if (args.creatorId && !args.creatorId) {
		proposals = proposals.filter((p) => p.createdBy === args.creatorId);
	}

	proposals.sort((a, b) => b.createdAt - a.createdAt);

	const limit = args.limit ?? 50;
	return proposals.slice(0, limit);
}

async function getProposalQuery(
	ctx: QueryCtx,
	args: { sessionId: string; proposalId: Id<'circleProposals'> }
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const proposal = await ctx.db.get(args.proposalId);
	if (!proposal) return null;

	await ensureWorkspaceMembership(ctx, proposal.workspaceId, userId);

	const evolutions = await ctx.db
		.query('proposalEvolutions')
		.withIndex('by_proposal_order', (q) => q.eq('proposalId', args.proposalId))
		.collect();

	const objections = await ctx.db
		.query('proposalObjections')
		.withIndex('by_proposal', (q) => q.eq('proposalId', args.proposalId))
		.collect();

	const attachments = await ctx.db
		.query('proposalAttachments')
		.withIndex('by_proposal', (q) => q.eq('proposalId', args.proposalId))
		.collect();

	const creator = await ctx.db.get(proposal.createdBy);

	let targetEntity: { type: string; name: string } | null = null;
	if (proposal.entityType === 'circle') {
		const circle = await ctx.db.get(proposal.entityId as Id<'circles'>);
		if (circle) {
			targetEntity = { type: 'circle', name: circle.name };
		}
	} else {
		const role = await ctx.db.get(proposal.entityId as Id<'circleRoles'>);
		if (role) {
			targetEntity = { type: 'role', name: role.name };
		}
	}

	return {
		...proposal,
		evolutions,
		objections,
		attachments,
		creator: creator ? { id: creator._id, name: creator.name, email: creator.email } : null,
		targetEntity
	};
}

async function getProposalByAgendaItemQuery(
	ctx: QueryCtx,
	args: { sessionId: string; agendaItemId: Id<'meetingAgendaItems'> }
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const proposal = await ctx.db
		.query('circleProposals')
		.withIndex('by_agendaItem', (q) => q.eq('agendaItemId', args.agendaItemId))
		.first();

	if (!proposal) return null;

	await ensureWorkspaceMembership(ctx, proposal.workspaceId, userId);

	return proposal;
}

async function listProposalsByCircleQuery(
	ctx: QueryCtx,
	args: { sessionId: string; circleId: Id<'circles'>; includeTerminal?: boolean }
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const circle = await ctx.db.get(args.circleId);
	if (!circle) return [];

	await ensureWorkspaceMembership(ctx, circle.workspaceId, userId);

	let proposals = await ctx.db
		.query('circleProposals')
		.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
		.collect();

	if (!args.includeTerminal) {
		const terminalStates: ProposalStatus[] = ['approved', 'rejected', 'withdrawn'];
		proposals = proposals.filter((p) => !terminalStates.includes(p.status as ProposalStatus));
	}

	proposals.sort((a, b) => b.createdAt - a.createdAt);

	return proposals;
}

async function listMyDraftProposalsQuery(
	ctx: QueryCtx,
	args: { sessionId: string; workspaceId: Id<'workspaces'> }
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

	const proposals = await ctx.db
		.query('circleProposals')
		.withIndex('by_creator', (q) => q.eq('createdBy', userId))
		.collect();

	return proposals
		.filter((p) => p.workspaceId === args.workspaceId && p.status === 'draft')
		.sort((a, b) => b.updatedAt - a.updatedAt);
}

async function listForMeetingImportQuery(
	ctx: QueryCtx,
	args: { sessionId: string; meetingId: Id<'meetings'> }
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const meeting = await ctx.db.get(args.meetingId);
	if (!meeting) throw createError(ErrorCodes.MEETING_NOT_FOUND, 'Meeting not found');

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

	if (!meeting.circleId) {
		return [];
	}

	let proposals = await ctx.db
		.query('circleProposals')
		.withIndex('by_circle', (q) => q.eq('circleId', meeting.circleId))
		.collect();

	proposals = proposals.filter(
		(p) => p.status === 'submitted' && p.workspaceId === meeting.workspaceId && !p.meetingId
	);

	proposals.sort((a, b) => b.createdAt - a.createdAt);

	return proposals;
}

const listProposalsArgs = {
	sessionId: v.string(),
	workspaceId: v.id('workspaces'),
	status: v.optional(
		v.union(
			v.literal('draft'),
			v.literal('submitted'),
			v.literal('in_meeting'),
			v.literal('objections'),
			v.literal('integrated'),
			v.literal('approved'),
			v.literal('rejected'),
			v.literal('withdrawn')
		)
	),
	circleId: v.optional(v.id('circles')),
	creatorId: v.optional(v.id('users')),
	limit: v.optional(v.number())
};

export { listProposalsQuery };

export const list = query({
	args: listProposalsArgs,
	handler: async (ctx, args): Promise<Doc<'circleProposals'>[]> => listProposalsQuery(ctx, args)
});

export const get = query({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals')
	},
	handler: async (ctx, args) => getProposalQuery(ctx, args)
});

export const getByAgendaItem = query({
	args: {
		sessionId: v.string(),
		agendaItemId: v.id('meetingAgendaItems')
	},
	handler: async (ctx, args) => getProposalByAgendaItemQuery(ctx, args)
});

export const listByCircle = query({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		includeTerminal: v.optional(v.boolean())
	},
	handler: async (ctx, args): Promise<Doc<'circleProposals'>[]> => {
		const proposals = await listProposalsByCircleQuery(ctx, args);
		return proposals ?? [];
	}
});

export const myListDrafts = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args): Promise<Doc<'circleProposals'>[]> => {
		const proposals = await listMyDraftProposalsQuery(ctx, args);
		return proposals ?? [];
	}
});

export const listForMeetingImport = query({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args): Promise<Doc<'circleProposals'>[]> => {
		const proposals = await listForMeetingImportQuery(ctx, args);
		return proposals ?? [];
	}
});
