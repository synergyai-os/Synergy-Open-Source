import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { getNextAgendaOrder } from './proposalAccess';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { getPersonForSessionAndWorkspace } from '../people/queries';

export const submit = mutation({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals'),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => submitProposalMutation(ctx, args)
});

export const importToMeeting = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings'),
		proposalIds: v.array(v.id('circleProposals'))
	},
	handler: async (ctx, args) => importProposalsToMeetingMutation(ctx, args)
});

export const startProcessing = mutation({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals')
	},
	handler: async (ctx, args) => startProcessingProposalMutation(ctx, args)
});

async function submitProposalMutation(
	ctx: MutationCtx,
	args: { sessionId: string; proposalId: Id<'circleProposals'>; meetingId: Id<'meetings'> }
) {
	const proposal = await ctx.db.get(args.proposalId);
	if (!proposal) throw createError(ErrorCodes.PROPOSAL_NOT_FOUND, 'Proposal not found');
	const { person } = await getPersonForSessionAndWorkspace(
		ctx,
		args.sessionId,
		proposal.workspaceId
	);
	if (proposal.createdByPersonId !== person._id) {
		throw createError(ErrorCodes.PROPOSAL_ACCESS_DENIED, 'Only the proposal creator can submit');
	}
	if (proposal.status !== 'draft') {
		throw createError(ErrorCodes.PROPOSAL_INVALID_STATE, 'Can only submit draft proposals');
	}

	const meeting = await ctx.db.get(args.meetingId);
	if (!meeting) throw createError(ErrorCodes.MEETING_NOT_FOUND, 'Meeting not found');
	if (meeting.workspaceId !== proposal.workspaceId) {
		throw createError(
			ErrorCodes.PROPOSAL_WORKSPACE_MISMATCH,
			'Meeting and proposal belong to different workspaces'
		);
	}
	// Ensure the submitting person belongs to the meeting workspace
	await getPersonForSessionAndWorkspace(ctx, args.sessionId, meeting.workspaceId);

	const evolutions = await ctx.db
		.query('proposalEvolutions')
		.withIndex('by_proposal', (q) => q.eq('proposalId', args.proposalId))
		.first();
	if (!evolutions) {
		throw createError(
			ErrorCodes.VALIDATION_REQUIRED_FIELD,
			'Proposal must have at least one proposed change'
		);
	}

	const agendaItemId = await ctx.db.insert('meetingAgendaItems', {
		meetingId: args.meetingId,
		title: `📋 Proposal: ${proposal.title}`,
		order: await getNextAgendaOrder(ctx, args.meetingId),
		status: 'todo',
		createdByPersonId: person._id,
		createdAt: Date.now()
	});

	const now = Date.now();
	await ctx.db.patch(args.proposalId, {
		status: 'submitted',
		meetingId: args.meetingId,
		agendaItemId,
		submittedAt: now,
		updatedAt: now
	});

	return { success: true, agendaItemId };
}

async function importProposalsToMeetingMutation(
	ctx: MutationCtx,
	args: { sessionId: string; meetingId: Id<'meetings'>; proposalIds: Id<'circleProposals'>[] }
) {
	const meeting = await ctx.db.get(args.meetingId);
	if (!meeting) throw createError(ErrorCodes.MEETING_NOT_FOUND, 'Meeting not found');
	const { person } = await getPersonForSessionAndWorkspace(
		ctx,
		args.sessionId,
		meeting.workspaceId
	);

	if (!meeting.circleId) {
		throw createError(
			ErrorCodes.MEETING_CIRCLE_MISMATCH,
			'Cannot import proposals into a meeting without a circle'
		);
	}

	const now = Date.now();
	const agendaItemIds: Id<'meetingAgendaItems'>[] = [];

	for (const proposalId of args.proposalIds) {
		const proposal = await ctx.db.get(proposalId);
		if (!proposal) {
			throw createError(ErrorCodes.PROPOSAL_NOT_FOUND, `Proposal ${proposalId} not found`);
		}

		if (proposal.status !== 'submitted') {
			throw createError(
				ErrorCodes.PROPOSAL_INVALID_STATE,
				`Proposal ${proposal.title} is not in submitted status`
			);
		}

		if (proposal.circleId !== meeting.circleId) {
			throw createError(
				ErrorCodes.PROPOSAL_WORKSPACE_MISMATCH,
				`Proposal ${proposal.title} does not belong to this meeting's circle`
			);
		}

		if (proposal.meetingId) {
			throw createError(
				ErrorCodes.PROPOSAL_INVALID_STATE,
				`Proposal ${proposal.title} is already linked to a meeting`
			);
		}

		const evolutions = await ctx.db
			.query('proposalEvolutions')
			.withIndex('by_proposal', (q) => q.eq('proposalId', proposalId))
			.first();
		if (!evolutions) {
			throw createError(
				ErrorCodes.VALIDATION_REQUIRED_FIELD,
				`Proposal ${proposal.title} must have at least one proposed change`
			);
		}

		const agendaItemId = await ctx.db.insert('meetingAgendaItems', {
			meetingId: args.meetingId,
			title: `📋 Proposal: ${proposal.title}`,
			order: await getNextAgendaOrder(ctx, args.meetingId),
			status: 'todo',
			createdByPersonId: person._id,
			createdAt: now
		});

		await ctx.db.patch(proposalId, {
			status: 'in_meeting',
			meetingId: args.meetingId,
			agendaItemId,
			updatedAt: now
		});

		agendaItemIds.push(agendaItemId);
	}

	return { success: true, agendaItemIds };
}

async function startProcessingProposalMutation(
	ctx: MutationCtx,
	args: { sessionId: string; proposalId: Id<'circleProposals'> }
) {
	const proposal = await ctx.db.get(args.proposalId);
	if (!proposal) throw createError(ErrorCodes.PROPOSAL_NOT_FOUND, 'Proposal not found');
	if (proposal.status !== 'submitted') {
		throw createError(
			ErrorCodes.PROPOSAL_INVALID_STATE,
			'Proposal must be submitted to start processing'
		);
	}

	const meeting = await ctx.db.get(proposal.meetingId!);
	if (!meeting) throw createError(ErrorCodes.MEETING_NOT_FOUND, 'Linked meeting not found');
	const { person } = await getPersonForSessionAndWorkspace(
		ctx,
		args.sessionId,
		meeting.workspaceId
	);
	if (meeting.recorderPersonId !== person._id) {
		throw createError(
			ErrorCodes.PROPOSAL_ACCESS_DENIED,
			'Only the meeting recorder can process proposals'
		);
	}

	await ctx.db.patch(args.proposalId, {
		status: 'in_meeting',
		updatedAt: Date.now()
	});

	return { success: true };
}
