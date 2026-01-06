/**
 * Proposal mutations - Write operations
 */

import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { ensureWorkspaceMembership, getNextAgendaOrder, ensureUniqueCircleSlug } from './rules';
import type { ProposalStatus } from './schema';
import { getPersonForSessionAndWorkspace } from '../people/queries';
import { calculateAuthority, getAuthorityContext, isCircleLead } from '../authority';
import { slugifyName } from '../circles/slug';
import { LEAD_AUTHORITY } from '../circles';
import {
	isCustomField,
	findCustomFieldValueBySystemKey,
	setCustomFieldValueBySystemKey,
	archiveCustomFieldValueBySystemKey
} from '../../infrastructure/customFields/helpers';
import {
	notifyProposalCreated,
	notifyProposalApproved,
	notifyProposalRejected
} from './notifications';

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
	handler: async (ctx, args) => createProposalMutation(ctx, args)
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
			leadAuthority: v.optional(v.string()),
			representsToParent: v.optional(v.boolean())
		})
	},
	handler: async (ctx, args) => createProposalFromDiffMutation(ctx, args)
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

export const saveAndApprove = mutation({
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
			leadAuthority: v.optional(v.string()),
			representsToParent: v.optional(v.boolean())
		})
	},
	handler: async (ctx, args) => saveAndApproveMutation(ctx, args)
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
			leadAuthority?: string;
			representsToParent?: boolean;
		};
	}
) {
	const { person } = await getPersonForSessionAndWorkspace(ctx, args.sessionId, args.workspaceId);
	await ensureWorkspaceMembership(ctx, args.workspaceId, person._id);

	const { proposalId } = await createFromDiffInternal(ctx, {
		personId: person._id,
		workspaceId: args.workspaceId,
		entityType: args.entityType,
		entityId: args.entityId,
		title: args.title,
		description: args.description,
		editedValues: args.editedValues
	});

	await notifyProposalCreated(ctx, proposalId);

	return { proposalId };
}

/**
 * Internal helper to create a proposal from a diff.
 * Used by createFromDiff and saveAndApprove mutations.
 */
async function createFromDiffInternal(
	ctx: MutationCtx,
	args: {
		personId: Id<'people'>;
		workspaceId: Id<'workspaces'>;
		entityType: 'circle' | 'role';
		entityId: string;
		title: string;
		description: string;
		editedValues: {
			name?: string;
			purpose?: string;
			leadAuthority?: string;
			representsToParent?: boolean;
		};
	}
): Promise<{ proposalId: Id<'circleProposals'> }> {
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
		createdByPersonId: args.personId,
		createdAt: now,
		updatedAt: now
	});

	const fieldLabels: Record<string, string> = {
		name: 'Name',
		purpose: 'Purpose',
		leadAuthority: 'Lead Authority',
		representsToParent: 'Represents to Parent Circle'
	};

	let order = 0;
	for (const [field, label] of Object.entries(fieldLabels)) {
		if (!(field in args.editedValues)) continue;

		// Read current value: schema field vs custom field (SYOS-989)
		let currentValue: unknown;
		if (await isCustomField(ctx, args.workspaceId, field)) {
			// Read from customFieldValues
			currentValue = await findCustomFieldValueBySystemKey(ctx, {
				workspaceId: args.workspaceId,
				entityType: args.entityType,
				entityId: args.entityId,
				systemKey: field
			});
		} else {
			// Read from entity schema
			currentValue = (entity as Record<string, unknown>)[field];
		}

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

	await notifyProposalRejected(ctx, args.proposalId);

	return { success: true };
}

async function saveAndApproveMutation(
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
			leadAuthority?: string;
			representsToParent?: boolean;
		};
	}
): Promise<{ proposalId: Id<'circleProposals'> }> {
	// 1. Validate session and get user
	const { person } = await getPersonForSessionAndWorkspace(ctx, args.sessionId, args.workspaceId);
	await ensureWorkspaceMembership(ctx, args.workspaceId, person._id);

	// 2. Verify this is a hierarchy circle
	const circle =
		args.entityType === 'circle'
			? await ctx.db.get(args.entityId as Id<'circles'>)
			: await ctx.db
					.get(args.entityId as Id<'circleRoles'>)
					.then((role) => (role ? ctx.db.get(role.circleId) : null));

	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	if (circle.leadAuthority !== LEAD_AUTHORITY.DECIDES) {
		throw createError(
			ErrorCodes.PROPOSAL_ACCESS_DENIED,
			'Auto-approve only available for circles where lead decides'
		);
	}

	// 3. Verify user is circle lead
	const authorityContext = await getAuthorityContext(ctx, {
		personId: person._id,
		circleId: circle._id
	});

	if (!isCircleLead(authorityContext)) {
		throw createError(
			ErrorCodes.PROPOSAL_ACCESS_DENIED,
			'Only circle lead can auto-approve proposals'
		);
	}

	// 4. Create proposal (reuse createFromDiff logic)
	const { proposalId } = await createFromDiffInternal(ctx, {
		personId: person._id,
		workspaceId: args.workspaceId,
		entityType: args.entityType,
		entityId: args.entityId,
		title: args.title,
		description: args.description,
		editedValues: args.editedValues
	});

	// 5. Auto-approve (this creates orgVersionHistory entry)
	await approveInternal(ctx, {
		proposalId,
		approverPersonId: person._id
	});

	await notifyProposalCreated(ctx, proposalId);
	await notifyProposalApproved(ctx, proposalId);

	return { proposalId };
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

	const result = await approveInternal(ctx, {
		proposalId: args.proposalId,
		approverPersonId: person._id
	});

	await notifyProposalApproved(ctx, args.proposalId);

	return result;
}

/**
 * Internal helper to approve a proposal and create version history.
 * Used by approve and saveAndApprove mutations.
 */
async function approveInternal(
	ctx: MutationCtx,
	args: {
		proposalId: Id<'circleProposals'>;
		approverPersonId: Id<'people'>;
	}
): Promise<{ success: true; versionHistoryId: Id<'orgVersionHistory'> }> {
	const proposal = await ctx.db.get(args.proposalId);
	if (!proposal) throw createError(ErrorCodes.PROPOSAL_NOT_FOUND, 'Proposal not found');

	const proposalEntity = await getProposalEntity(ctx, proposal);
	const entity = proposalEntity.entity;

	const evolutions = await ctx.db
		.query('proposalEvolutions')
		.withIndex('by_proposal', (q) => q.eq('proposalId', args.proposalId))
		.collect();

	if (evolutions.length === 0) {
		throw createError(ErrorCodes.PROPOSAL_INVALID_STATE, 'Proposal has no changes to apply');
	}

	// DR-011: Read purpose directly from entity schema (not customFieldValues)
	const purposeBefore =
		proposal.entityType === 'circle'
			? (entity as Doc<'circles'>).purpose
			: (entity as Doc<'circleRoles'>).purpose;

	// Separate schema field updates from custom field updates (SYOS-984)
	const schemaUpdates: Partial<Doc<'circles'>> | Partial<Doc<'circleRoles'>> = {
		updatedAt: Date.now(),
		updatedByPersonId: args.approverPersonId
	};

	for (const evolution of evolutions) {
		const afterValue = evolution.afterValue ? JSON.parse(evolution.afterValue) : undefined;
		const fieldPath = evolution.fieldPath;

		if (await isCustomField(ctx, proposal.workspaceId, fieldPath)) {
			// Write to customFieldValues (SYOS-989)
			if (evolution.changeType === 'remove') {
				await archiveCustomFieldValueBySystemKey(ctx, {
					workspaceId: proposal.workspaceId,
					entityId: proposal.entityId,
					systemKey: fieldPath
				});
			} else if (afterValue !== undefined) {
				await setCustomFieldValueBySystemKey(ctx, {
					workspaceId: proposal.workspaceId,
					entityType: proposal.entityType,
					entityId: proposal.entityId,
					systemKey: fieldPath,
					value: String(afterValue),
					updatedByPersonId: args.approverPersonId
				});
			}
		} else {
			// Schema field - add to entity updates
			if (evolution.changeType !== 'remove' && afterValue !== undefined) {
				(schemaUpdates as Record<string, unknown>)[fieldPath] = afterValue;
			}
		}
	}

	// Apply schema field updates to entity
	if (proposal.entityType === 'circle') {
		const circleUpdates = schemaUpdates as Partial<Doc<'circles'>>;
		if (circleUpdates.name) {
			const slugBase = slugifyName(circleUpdates.name);
			circleUpdates.slug = await ensureUniqueCircleSlug(ctx, entity.workspaceId, slugBase);
		}
		await ctx.db.patch(proposal.entityId as Id<'circles'>, circleUpdates);
	} else {
		await ctx.db.patch(
			proposal.entityId as Id<'circleRoles'>,
			schemaUpdates as Partial<Doc<'circleRoles'>>
		);
	}

	const afterDoc = await ctx.db.get(proposal.entityId as Id<'circles'> | Id<'circleRoles'>);
	if (!afterDoc) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Failed to retrieve updated entity');
	}

	// DR-011: Read purpose directly from entity schema (not customFieldValues)
	const purposeAfter =
		proposal.entityType === 'circle'
			? (afterDoc as Doc<'circles'>).purpose
			: (afterDoc as Doc<'circleRoles'>).purpose;

	const changeDescription = `Approved via proposal: ${proposal.title}`;

	let versionHistoryId: Id<'orgVersionHistory'>;

	if (proposal.entityType === 'circle') {
		const circleAfter = afterDoc as Doc<'circles'>;
		versionHistoryId = await ctx.db.insert('orgVersionHistory', {
			entityType: 'circle',
			workspaceId: proposal.workspaceId,
			entityId: proposal.entityId as Id<'circles'>,
			changeType: 'update',
			changedByPersonId: args.approverPersonId,
			changedAt: Date.now(),
			changeDescription,
			before: {
				name: entity.name,
				slug: (entity as Doc<'circles'>).slug,
				purpose: purposeBefore, // DR-011: Read from schema
				parentCircleId: (entity as Doc<'circles'>).parentCircleId,
				status: entity.status,
				circleType: undefined, // SYOS-1077: Legacy field preserved for history
				decisionModel: undefined, // SYOS-1077: Legacy field preserved for history
				archivedAt: entity.archivedAt
			},
			after: {
				name: circleAfter.name,
				slug: circleAfter.slug,
				purpose: purposeAfter, // DR-011: Read from schema
				parentCircleId: circleAfter.parentCircleId,
				status: circleAfter.status,
				circleType: undefined, // SYOS-1077: Legacy field preserved for history
				decisionModel: undefined, // SYOS-1077: Legacy field preserved for history
				archivedAt: circleAfter.archivedAt
			}
		});
	} else {
		const roleAfter = afterDoc as Doc<'circleRoles'>;
		versionHistoryId = await ctx.db.insert('orgVersionHistory', {
			entityType: 'circleRole',
			workspaceId: proposal.workspaceId,
			entityId: proposal.entityId as Id<'circleRoles'>,
			changeType: 'update',
			changedByPersonId: args.approverPersonId,
			changedAt: Date.now(),
			changeDescription,
			before: {
				circleId: (entity as Doc<'circleRoles'>).circleId,
				name: entity.name,
				purpose: purposeBefore, // DR-011: Read from schema
				templateId: (entity as Doc<'circleRoles'>).templateId,
				status: entity.status,
				isHiring: (entity as Doc<'circleRoles'>).isHiring,
				archivedAt: entity.archivedAt
			},
			after: {
				circleId: roleAfter.circleId,
				name: roleAfter.name,
				purpose: purposeAfter, // DR-011: Read from schema
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
		processedByPersonId: args.approverPersonId,
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
