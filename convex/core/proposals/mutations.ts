/**
 * Proposal mutations - Write operations
 */

import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { ensureWorkspaceMembership, getNextAgendaOrder, ensureUniqueCircleSlug } from './proposalAccess';
import type { ProposalStatus } from './schema';
import { getPersonForSessionAndWorkspace } from '../people/queries';
import { calculateAuthority, getAuthorityContext } from '../authority';
import { slugifyName } from '../circles/slug';

// ============================================================================
// Draft Mutations
// ============================================================================

export const create = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		entityType: v.union(v.literal('circle'), v.literal('role')),
		entityId: v.string(),
		title: v.string(),
		description: v.string()
	},
	handler: async (ctx, args): Promise<Id<'circleProposals'>> => createProposalMutation(ctx, args)
});

export const addEvolution = mutation({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals'),
		fieldPath: v.string(),
		fieldLabel: v.string(),
		beforeValue: v.optional(v.string()),
		afterValue: v.optional(v.string()),
		changeType: v.union(v.literal('add'), v.literal('update'), v.literal('remove'))
	},
	handler: async (ctx, args) => addProposalEvolutionMutation(ctx, args)
});

export const removeEvolution = mutation({
	args: {
		sessionId: v.string(),
		evolutionId: v.id('proposalEvolutions')
	},
	handler: async (ctx, args) => removeProposalEvolutionMutation(ctx, args)
});

export const withdraw = mutation({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals')
	},
	handler: async (ctx, args) => withdrawProposalMutation(ctx, args)
});

export const createFromDiff = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		entityType: v.union(v.literal('circle'), v.literal('role')),
		entityId: v.string(),
		title: v.string(),
		description: v.string(),
		editedValues: v.object({
			name: v.optional(v.string()),
			purpose: v.optional(v.string()),
			circleType: v.optional(v.string()),
			decisionModel: v.optional(v.string()),
			representsToParent: v.optional(v.boolean())
		})
	},
	handler: async (ctx, args): Promise<Id<'circleProposals'>> =>
		createProposalFromDiffMutation(ctx, args)
});

// ============================================================================
// Meeting Mutations
// ============================================================================

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

// ============================================================================
// Decision Mutations
// ============================================================================

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

// ============================================================================
// Draft Mutation Helpers
// ============================================================================

async function createProposalMutation(
	ctx: MutationCtx,
	args: {
		sessionId: string;
		workspaceId: Id<'workspaces'>;
		entityType: 'circle' | 'role';
		entityId: string;
		title: string;
		description: string;
	}
) {
	const { person } = await getPersonForSessionAndWorkspace(ctx, args.sessionId, args.workspaceId);
	await ensureWorkspaceMembership(ctx, args.workspaceId, person._id);

	if (args.entityType === 'circle') {
		const circle = await ctx.db.get(args.entityId as Id<'circles'>);
		if (!circle) throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
		if (circle.workspaceId !== args.workspaceId) {
			throw createError(
				ErrorCodes.PROPOSAL_WORKSPACE_MISMATCH,
				'Circle does not belong to this workspace'
			);
		}
	} else {
		const role = await ctx.db.get(args.entityId as Id<'circleRoles'>);
		if (!role) throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	const now = Date.now();
	const proposalId = await ctx.db.insert('circleProposals', {
		workspaceId: args.workspaceId,
		entityType: args.entityType,
		entityId: args.entityId,
		circleId: args.entityType === 'circle' ? (args.entityId as Id<'circles'>) : undefined,
		title: args.title,
		description: args.description,
		status: 'draft',
		createdByPersonId: person._id,
		createdAt: now,
		updatedAt: now
	});

	return { proposalId };
}

async function addProposalEvolutionMutation(
	ctx: MutationCtx,
	args: {
		sessionId: string;
		proposalId: Id<'circleProposals'>;
		fieldPath: string;
		fieldLabel: string;
		beforeValue?: string;
		afterValue?: string;
		changeType: 'add' | 'update' | 'remove';
	}
) {
	const proposal = await ctx.db.get(args.proposalId);
	if (!proposal) throw createError(ErrorCodes.PROPOSAL_NOT_FOUND, 'Proposal not found');
	const { person } = await getPersonForSessionAndWorkspace(
		ctx,
		args.sessionId,
		proposal.workspaceId
	);
	if (proposal.createdByPersonId !== person._id) {
		throw createError(
			ErrorCodes.PROPOSAL_ACCESS_DENIED,
			'Only the proposal creator can add evolutions'
		);
	}
	if (proposal.status !== 'draft') {
		throw createError(ErrorCodes.PROPOSAL_INVALID_STATE, 'Can only edit draft proposals');
	}

	const existingEvolutions = await ctx.db
		.query('proposalEvolutions')
		.withIndex('by_proposal', (q) => q.eq('proposalId', args.proposalId))
		.collect();
	const maxOrder = existingEvolutions.reduce((max, e) => Math.max(max, e.order), -1);

	const evolutionId = await ctx.db.insert('proposalEvolutions', {
		proposalId: args.proposalId,
		fieldPath: args.fieldPath,
		fieldLabel: args.fieldLabel,
		beforeValue: args.beforeValue,
		afterValue: args.afterValue,
		changeType: args.changeType,
		order: maxOrder + 1,
		createdAt: Date.now()
	});

	await ctx.db.patch(args.proposalId, { updatedAt: Date.now() });

	return { evolutionId };
}

async function removeProposalEvolutionMutation(
	ctx: MutationCtx,
	args: { sessionId: string; evolutionId: Id<'proposalEvolutions'> }
) {
	const evolution = await ctx.db.get(args.evolutionId);
	if (!evolution) throw createError(ErrorCodes.GENERIC_ERROR, 'Evolution not found');

	const proposal = await ctx.db.get(evolution.proposalId);
	if (!proposal) throw createError(ErrorCodes.PROPOSAL_NOT_FOUND, 'Proposal not found');
	const { person } = await getPersonForSessionAndWorkspace(
		ctx,
		args.sessionId,
		proposal.workspaceId
	);
	if (proposal.createdByPersonId !== person._id) {
		throw createError(
			ErrorCodes.PROPOSAL_ACCESS_DENIED,
			'Only the proposal creator can remove evolutions'
		);
	}
	if (proposal.status !== 'draft') {
		throw createError(ErrorCodes.PROPOSAL_INVALID_STATE, 'Can only edit draft proposals');
	}

	await ctx.db.delete(args.evolutionId);
	await ctx.db.patch(proposal._id, { updatedAt: Date.now() });

	return { success: true };
}

async function withdrawProposalMutation(
	ctx: MutationCtx,
	args: { sessionId: string; proposalId: Id<'circleProposals'> }
) {
	const proposal = await ctx.db.get(args.proposalId);
	if (!proposal) throw createError(ErrorCodes.PROPOSAL_NOT_FOUND, 'Proposal not found');
	const { person } = await getPersonForSessionAndWorkspace(
		ctx,
		args.sessionId,
		proposal.workspaceId
	);
	if (proposal.createdByPersonId !== person._id) {
		throw createError(ErrorCodes.PROPOSAL_ACCESS_DENIED, 'Only the proposal creator can withdraw');
	}

	const terminalStates: ProposalStatus[] = ['approved', 'rejected', 'withdrawn'];
	if (terminalStates.includes(proposal.status as ProposalStatus)) {
		throw createError(
			ErrorCodes.PROPOSAL_INVALID_STATE,
			'Cannot withdraw a proposal that has already been finalized'
		);
	}

	await ctx.db.patch(args.proposalId, {
		status: 'withdrawn',
		updatedAt: Date.now()
	});

	return { success: true };
}

async function createProposalFromDiffMutation(
	ctx: MutationCtx,
	args: {
		sessionId: string;
		workspaceId: Id<'workspaces'>;
		entityType: 'circle' | 'role';
		entityId: string;
		title: string;
		description: string;
		editedValues: {
			name?: string;
			purpose?: string;
			circleType?: string;
			decisionModel?: string;
			representsToParent?: boolean;
		};
	}
) {
	const { person } = await getPersonForSessionAndWorkspace(ctx, args.sessionId, args.workspaceId);
	await ensureWorkspaceMembership(ctx, args.workspaceId, person._id);

	const entity =
		args.entityType === 'circle'
			? await ctx.db.get(args.entityId as Id<'circles'>)
			: await ctx.db.get(args.entityId as Id<'circleRoles'>);

	if (!entity) throw createError(ErrorCodes.GENERIC_ERROR, 'Entity not found');

	if (entity.workspaceId !== args.workspaceId) {
		throw createError(
			ErrorCodes.PROPOSAL_WORKSPACE_MISMATCH,
			'Entity does not belong to this workspace'
		);
	}

	const now = Date.now();
	const proposalId = await ctx.db.insert('circleProposals', {
		workspaceId: args.workspaceId,
		entityType: args.entityType,
		entityId: args.entityId,
		circleId:
			args.entityType === 'circle'
				? (args.entityId as Id<'circles'>)
				: (entity as Doc<'circleRoles'>).circleId,
		title: args.title.trim(),
		description: args.description.trim(),
		status: 'submitted',
		createdByPersonId: person._id,
		createdAt: now,
		updatedAt: now
	});

	const fieldLabels: Record<string, string> = {
		name: 'Name',
		purpose: 'Purpose',
		circleType: 'Circle Type',
		decisionModel: 'Decision Model',
		representsToParent: 'Represents to Parent Circle'
	};

	let order = 0;
	for (const [field, label] of Object.entries(fieldLabels)) {
		if (!(field in args.editedValues)) continue;

		const currentValue = (entity as Record<string, unknown>)[field];
		const editedValue = (args.editedValues as Record<string, unknown>)[field];

		const currentValueStr =
			currentValue !== undefined && currentValue !== null ? JSON.stringify(currentValue) : '';
		const editedValueStr =
			editedValue !== undefined && editedValue !== null ? JSON.stringify(editedValue) : '';

		if (editedValueStr !== currentValueStr) {
			await ctx.db.insert('proposalEvolutions', {
				proposalId,
				fieldPath: field,
				fieldLabel: label,
				beforeValue:
					currentValue !== undefined && currentValue !== null
						? JSON.stringify(currentValue)
						: undefined,
				afterValue: JSON.stringify(editedValue),
				changeType: currentValue === undefined || currentValue === null ? 'add' : 'update',
				order: order++,
				createdAt: now
			});
		}
	}

	return { proposalId };
}

// ============================================================================
// Meeting Mutation Helpers
// ============================================================================

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

// ============================================================================
// Decision Mutation Helpers
// ============================================================================

async function rejectProposalMutation(
	ctx: MutationCtx,
	args: { sessionId: string; proposalId: Id<'circleProposals'> }
) {
	const proposal = await ctx.db.get(args.proposalId);
	if (!proposal) throw createError(ErrorCodes.PROPOSAL_NOT_FOUND, 'Proposal not found');
	const { person } = await getPersonForSessionAndWorkspace(
		ctx,
		args.sessionId,
		proposal.workspaceId
	);
	await ensureWorkspaceMembership(ctx, proposal.workspaceId, person._id);

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
	if (meeting.recorderPersonId !== person._id) {
		throw createError(
			ErrorCodes.PROPOSAL_ACCESS_DENIED,
			'Only the meeting recorder can reject proposals'
		);
	}

	const { circleId } = await getProposalEntity(ctx, proposal);
	const authority = await requireProposalAuthority(ctx, person._id, circleId);

	if (!authority.canRaiseObjections) {
		throw createError(ErrorCodes.PROPOSAL_ACCESS_DENIED, 'Insufficient authority to reject');
	}

	await ctx.db.patch(args.proposalId, {
		status: 'rejected',
		processedAt: Date.now(),
		processedByPersonId: person._id,
		updatedAt: Date.now()
	});

	return { success: true };
}

async function approveProposal(
	ctx: MutationCtx,
	args: { sessionId: string; proposalId: Id<'circleProposals'> }
): Promise<{ success: true; versionHistoryId: Id<'orgVersionHistory'> }> {
	const proposal = await ctx.db.get(args.proposalId);
	if (!proposal) throw createError(ErrorCodes.PROPOSAL_NOT_FOUND, 'Proposal not found');
	const { person } = await getPersonForSessionAndWorkspace(
		ctx,
		args.sessionId,
		proposal.workspaceId
	);
	await ensureWorkspaceMembership(ctx, proposal.workspaceId, person._id);

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
	if (meeting.recorderPersonId !== person._id) {
		throw createError(
			ErrorCodes.PROPOSAL_ACCESS_DENIED,
			'Only the meeting recorder can approve proposals'
		);
	}

	const proposalEntity = await getProposalEntity(ctx, proposal);
	const authority = await requireProposalAuthority(ctx, person._id, proposalEntity.circleId);

	if (!authority.canApproveProposals) {
		throw createError(ErrorCodes.PROPOSAL_ACCESS_DENIED, 'Insufficient authority to approve');
	}

	const entity = proposalEntity.entity;

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
		updatedByPersonId: person._id
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
			changedByPersonId: person._id,
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
			changedByPersonId: person._id,
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
		processedByPersonId: person._id,
		versionHistoryEntryId: versionHistoryId,
		updatedAt: Date.now()
	});

	return { success: true, versionHistoryId };
}

// ============================================================================
// Shared Helpers
// ============================================================================

async function getProposalEntity(
	ctx: MutationCtx,
	proposal: Doc<'circleProposals'>
): Promise<{
	circleId: Id<'circles'>;
	workspaceId: Id<'workspaces'>;
	entity: Doc<'circles'> | Doc<'circleRoles'>;
}> {
	if (proposal.entityType === 'circle') {
		const circle = await ctx.db.get(proposal.entityId as Id<'circles'>);
		if (!circle) {
			throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Target circle not found');
		}
		return { circleId: circle._id, workspaceId: circle.workspaceId, entity: circle };
	}

	const role = await ctx.db.get(proposal.entityId as Id<'circleRoles'>);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Target role not found');
	}

	return { circleId: role.circleId, workspaceId: role.workspaceId, entity: role };
}

async function requireProposalAuthority(
	ctx: MutationCtx,
	personId: Id<'people'>,
	circleId: Id<'circles'>
) {
	const authorityContext = await getAuthorityContext(ctx, { personId, circleId });
	return calculateAuthority(authorityContext);
}
