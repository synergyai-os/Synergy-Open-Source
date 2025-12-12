import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { ensureWorkspaceMembership } from './proposalAccess';
import type { ProposalStatus } from './proposalTypes';
import { getPersonForSessionAndWorkspace } from '../people/queries';

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
