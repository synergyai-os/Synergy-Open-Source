import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../../sessionValidation';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { slugifyName } from '../circles/slug';
import { ensureUniqueCircleSlug } from './proposalAccess';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

async function rejectProposalMutation(
	ctx: MutationCtx,
	args: { sessionId: string; proposalId: Id<'circleProposals'> }
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const proposal = await ctx.db.get(args.proposalId);
	if (!proposal) throw createError(ErrorCodes.PROPOSAL_NOT_FOUND, 'Proposal not found');
	if (proposal.status !== 'in_meeting' && proposal.status !== 'integrated') {
		throw createError(
			ErrorCodes.PROPOSAL_INVALID_STATE,
			'Proposal must be in meeting or integrated to reject'
		);
	}

	if (!proposal.meetingId) {
		throw createError(
			ErrorCodes.PROPOSAL_INVALID_STATE,
			'Proposal must be linked to a meeting to reject'
		);
	}
	const meeting = await ctx.db.get(proposal.meetingId);
	if (!meeting) {
		throw createError(ErrorCodes.MEETING_NOT_FOUND, 'Linked meeting not found');
	}
	if (meeting.recorderId !== userId) {
		throw createError(
			ErrorCodes.PROPOSAL_ACCESS_DENIED,
			'Only the meeting recorder can reject proposals'
		);
	}

	await ctx.db.patch(args.proposalId, {
		status: 'rejected',
		processedAt: Date.now(),
		processedBy: userId,
		updatedAt: Date.now()
	});

	return { success: true };
}

async function approveProposal(
	ctx: MutationCtx,
	args: { sessionId: string; proposalId: Id<'circleProposals'> }
): Promise<{ success: true; versionHistoryId: Id<'orgVersionHistory'> }> {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const proposal = await ctx.db.get(args.proposalId);
	if (!proposal) throw createError(ErrorCodes.PROPOSAL_NOT_FOUND, 'Proposal not found');
	if (proposal.status !== 'in_meeting' && proposal.status !== 'integrated') {
		throw createError(
			ErrorCodes.PROPOSAL_INVALID_STATE,
			'Proposal must be in meeting or integrated to approve'
		);
	}

	if (!proposal.meetingId) {
		throw createError(
			ErrorCodes.PROPOSAL_INVALID_STATE,
			'Proposal must be linked to a meeting to approve'
		);
	}
	const meeting = await ctx.db.get(proposal.meetingId);
	if (!meeting) {
		throw createError(ErrorCodes.MEETING_NOT_FOUND, 'Linked meeting not found');
	}
	if (meeting.recorderId !== userId) {
		throw createError(
			ErrorCodes.PROPOSAL_ACCESS_DENIED,
			'Only the meeting recorder can approve proposals'
		);
	}

	const entity =
		proposal.entityType === 'circle'
			? await ctx.db.get(proposal.entityId as Id<'circles'>)
			: await ctx.db.get(proposal.entityId as Id<'circleRoles'>);

	if (!entity) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Target entity no longer exists - was it deleted?');
	}

	const beforeDoc = { ...entity };

	const evolutions = await ctx.db
		.query('proposalEvolutions')
		.withIndex('by_proposal', (q) => q.eq('proposalId', args.proposalId))
		.collect();

	if (evolutions.length === 0) {
		throw createError(ErrorCodes.PROPOSAL_INVALID_STATE, 'Proposal has no changes to apply');
	}

	const updates: Partial<Doc<'circles'>> | Partial<Doc<'circleRoles'>> = {
		updatedAt: Date.now(),
		updatedBy: userId
	};

	for (const evolution of evolutions) {
		const afterValue = evolution.afterValue ? JSON.parse(evolution.afterValue) : undefined;

		if (evolution.changeType !== 'remove' && afterValue !== undefined) {
			(updates as Record<string, unknown>)[evolution.fieldPath] = afterValue;
		}
	}

	if (proposal.entityType === 'circle') {
		const circleUpdates = updates as Partial<Doc<'circles'>>;
		if (circleUpdates.name) {
			const slugBase = slugifyName(circleUpdates.name);
			circleUpdates.slug = await ensureUniqueCircleSlug(ctx, entity.workspaceId, slugBase);
		}
		await ctx.db.patch(proposal.entityId as Id<'circles'>, circleUpdates);
	} else {
		await ctx.db.patch(
			proposal.entityId as Id<'circleRoles'>,
			updates as Partial<Doc<'circleRoles'>>
		);
	}

	const afterDoc = await ctx.db.get(proposal.entityId as Id<'circles'> | Id<'circleRoles'>);
	if (!afterDoc) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Failed to retrieve updated entity');
	}

	const changeDescription = `Approved via proposal: ${proposal.title}`;

	let versionHistoryId: Id<'orgVersionHistory'>;

	if (proposal.entityType === 'circle') {
		const circleBefore = beforeDoc as Doc<'circles'>;
		const circleAfter = afterDoc as Doc<'circles'>;
		versionHistoryId = await ctx.db.insert('orgVersionHistory', {
			entityType: 'circle',
			workspaceId: proposal.workspaceId,
			entityId: proposal.entityId as Id<'circles'>,
			changeType: 'update',
			changedBy: userId,
			changedAt: Date.now(),
			changeDescription,
			before: {
				name: circleBefore.name,
				slug: circleBefore.slug,
				purpose: circleBefore.purpose,
				parentCircleId: circleBefore.parentCircleId,
				status: circleBefore.status,
				circleType: circleBefore.circleType,
				decisionModel: circleBefore.decisionModel,
				archivedAt: circleBefore.archivedAt
			},
			after: {
				name: circleAfter.name,
				slug: circleAfter.slug,
				purpose: circleAfter.purpose,
				parentCircleId: circleAfter.parentCircleId,
				status: circleAfter.status,
				circleType: circleAfter.circleType,
				decisionModel: circleAfter.decisionModel,
				archivedAt: circleAfter.archivedAt
			}
		});
	} else {
		const roleBefore = beforeDoc as Doc<'circleRoles'>;
		const roleAfter = afterDoc as Doc<'circleRoles'>;
		versionHistoryId = await ctx.db.insert('orgVersionHistory', {
			entityType: 'circleRole',
			workspaceId: proposal.workspaceId,
			entityId: proposal.entityId as Id<'circleRoles'>,
			changeType: 'update',
			changedBy: userId,
			changedAt: Date.now(),
			changeDescription,
			before: {
				circleId: roleBefore.circleId,
				name: roleBefore.name,
				purpose: roleBefore.purpose,
				templateId: roleBefore.templateId,
				status: roleBefore.status,
				isHiring: roleBefore.isHiring,
				archivedAt: roleBefore.archivedAt
			},
			after: {
				circleId: roleAfter.circleId,
				name: roleAfter.name,
				purpose: roleAfter.purpose,
				templateId: roleAfter.templateId,
				status: roleAfter.status,
				isHiring: roleAfter.isHiring,
				archivedAt: roleAfter.archivedAt
			}
		});
	}

	await ctx.db.patch(args.proposalId, {
		status: 'approved',
		processedAt: Date.now(),
		processedBy: userId,
		versionHistoryEntryId: versionHistoryId,
		updatedAt: Date.now()
	});

	return { success: true, versionHistoryId };
}

export const approve = mutation({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals')
	},
	handler: async (ctx, args) => approveProposal(ctx, args)
});

export const reject = mutation({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals')
	},
	handler: async (ctx, args) => rejectProposalMutation(ctx, args)
});
