/**
 * Circle Proposals Module
 *
 * Implements governance-based change management for circles and roles.
 * Any workspace member can create proposals; changes require meeting approval.
 *
 * State Machine:
 * draft → submitted → in_meeting → [objections → integrated →] approved/rejected
 *                  ↘ withdrawn
 *
 * @see src/lib/modules/org-chart/docs/EDIT_CIRCLE_IMPLEMENTATION.md
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { slugifyName, ensureUniqueSlug } from './core/circles';

// ============================================================================
// TYPES
// ============================================================================

export type ProposalStatus =
	| 'draft'
	| 'submitted'
	| 'in_meeting'
	| 'objections'
	| 'integrated'
	| 'approved'
	| 'rejected'
	| 'withdrawn';

// Valid state transitions (for reference, not currently enforced)
// const VALID_TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
// 	draft: ['submitted', 'withdrawn'],
// 	submitted: ['in_meeting', 'withdrawn'],
// 	in_meeting: ['objections', 'integrated', 'rejected'],
// 	objections: ['integrated', 'rejected'],
// 	integrated: ['approved', 'rejected'],
// 	approved: [], // Terminal
// 	rejected: [], // Terminal
// 	withdrawn: [] // Terminal
// };

// ============================================================================
// HELPERS
// ============================================================================

async function ensureWorkspaceMembership(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<void> {
	const membership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();

	if (!membership) {
		throw new Error('You do not have access to this workspace');
	}
}

async function getNextAgendaOrder(ctx: MutationCtx, meetingId: Id<'meetings'>): Promise<number> {
	const existingItems = await ctx.db
		.query('meetingAgendaItems')
		.withIndex('by_meeting', (q) => q.eq('meetingId', meetingId))
		.collect();

	return existingItems.length > 0 ? Math.max(...existingItems.map((i) => i.order)) + 1 : 1;
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new proposal
 *
 * Any workspace member can create proposals - no special permission required.
 * Proposals start in 'draft' status.
 */
export const create = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		entityType: v.union(v.literal('circle'), v.literal('role')),
		entityId: v.string(),
		title: v.string(),
		description: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Any workspace member can create proposals
		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

		// Verify entity exists
		if (args.entityType === 'circle') {
			const circle = await ctx.db.get(args.entityId as Id<'circles'>);
			if (!circle) throw new Error('Circle not found');
			if (circle.workspaceId !== args.workspaceId) {
				throw new Error('Circle does not belong to this workspace');
			}
		} else {
			const role = await ctx.db.get(args.entityId as Id<'circleRoles'>);
			if (!role) throw new Error('Role not found');
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
			createdBy: userId,
			createdAt: now,
			updatedAt: now
		});

		return { proposalId };
	}
});

/**
 * Add an evolution (proposed change) to a proposal
 *
 * Only the proposal creator can add evolutions.
 * Only works on draft proposals.
 */
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
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const proposal = await ctx.db.get(args.proposalId);
		if (!proposal) throw new Error('Proposal not found');
		if (proposal.createdBy !== userId) {
			throw new Error('Only the proposal creator can add evolutions');
		}
		if (proposal.status !== 'draft') {
			throw new Error('Can only edit draft proposals');
		}

		// Get current max order
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
});

/**
 * Remove an evolution from a proposal
 *
 * Only the proposal creator can remove evolutions.
 * Only works on draft proposals.
 */
export const removeEvolution = mutation({
	args: {
		sessionId: v.string(),
		evolutionId: v.id('proposalEvolutions')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const evolution = await ctx.db.get(args.evolutionId);
		if (!evolution) throw new Error('Evolution not found');

		const proposal = await ctx.db.get(evolution.proposalId);
		if (!proposal) throw new Error('Proposal not found');
		if (proposal.createdBy !== userId) {
			throw new Error('Only the proposal creator can remove evolutions');
		}
		if (proposal.status !== 'draft') {
			throw new Error('Can only edit draft proposals');
		}

		await ctx.db.delete(args.evolutionId);
		await ctx.db.patch(proposal._id, { updatedAt: Date.now() });

		return { success: true };
	}
});

/**
 * Submit a proposal to a governance meeting
 *
 * Creates a generic agenda item in the meeting (loose coupling).
 * Stores the agenda item reference on the proposal.
 */
export const submit = mutation({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals'),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const proposal = await ctx.db.get(args.proposalId);
		if (!proposal) throw new Error('Proposal not found');
		if (proposal.createdBy !== userId) {
			throw new Error('Only the proposal creator can submit');
		}
		if (proposal.status !== 'draft') {
			throw new Error('Can only submit draft proposals');
		}

		// Verify meeting exists
		const meeting = await ctx.db.get(args.meetingId);
		if (!meeting) throw new Error('Meeting not found');

		// Verify proposal has at least one evolution
		const evolutions = await ctx.db
			.query('proposalEvolutions')
			.withIndex('by_proposal', (q) => q.eq('proposalId', args.proposalId))
			.first();
		if (!evolutions) {
			throw new Error('Proposal must have at least one proposed change');
		}

		// Create generic agenda item (loose coupling with meetings module)
		const agendaItemId = await ctx.db.insert('meetingAgendaItems', {
			meetingId: args.meetingId,
			title: `📋 Proposal: ${proposal.title}`,
			order: await getNextAgendaOrder(ctx, args.meetingId),
			status: 'todo',
			createdBy: userId,
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
});

/**
 * Withdraw a proposal
 *
 * Creator can withdraw at any non-terminal state.
 */
export const withdraw = mutation({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const proposal = await ctx.db.get(args.proposalId);
		if (!proposal) throw new Error('Proposal not found');
		if (proposal.createdBy !== userId) {
			throw new Error('Only the proposal creator can withdraw');
		}

		const terminalStates: ProposalStatus[] = ['approved', 'rejected', 'withdrawn'];
		if (terminalStates.includes(proposal.status as ProposalStatus)) {
			throw new Error('Cannot withdraw a proposal that has already been finalized');
		}

		await ctx.db.patch(args.proposalId, {
			status: 'withdrawn',
			updatedAt: Date.now()
		});

		return { success: true };
	}
});

/**
 * Import proposals into a meeting
 *
 * Transitions proposals from 'submitted' → 'in_meeting' and creates agenda items.
 * Any workspace member can import proposals into a meeting (transparency).
 *
 * @param proposalIds Array of proposal IDs to import
 * @param meetingId Meeting to import into
 */
export const importToMeeting = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings'),
		proposalIds: v.array(v.id('circleProposals'))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify meeting exists and user has access
		const meeting = await ctx.db.get(args.meetingId);
		if (!meeting) throw new Error('Meeting not found');
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Verify meeting has a circleId (required for proposal filtering)
		if (!meeting.circleId) {
			throw new Error('Cannot import proposals into a meeting without a circle');
		}

		const now = Date.now();
		const agendaItemIds: Id<'meetingAgendaItems'>[] = [];

		// Process each proposal
		for (const proposalId of args.proposalIds) {
			const proposal = await ctx.db.get(proposalId);
			if (!proposal) {
				throw new Error(`Proposal ${proposalId} not found`);
			}

			// Verify proposal is in correct state
			if (proposal.status !== 'submitted') {
				throw new Error(`Proposal ${proposal.title} is not in submitted status`);
			}

			// Verify proposal belongs to meeting's circle
			if (proposal.circleId !== meeting.circleId) {
				throw new Error(`Proposal ${proposal.title} does not belong to this meeting's circle`);
			}

			// Verify proposal is not already linked to a meeting
			if (proposal.meetingId) {
				throw new Error(`Proposal ${proposal.title} is already linked to a meeting`);
			}

			// Verify proposal has at least one evolution
			const evolutions = await ctx.db
				.query('proposalEvolutions')
				.withIndex('by_proposal', (q) => q.eq('proposalId', proposalId))
				.first();
			if (!evolutions) {
				throw new Error(`Proposal ${proposal.title} must have at least one proposed change`);
			}

			// Create agenda item
			const agendaItemId = await ctx.db.insert('meetingAgendaItems', {
				meetingId: args.meetingId,
				title: `📋 Proposal: ${proposal.title}`,
				order: await getNextAgendaOrder(ctx, args.meetingId),
				status: 'todo',
				createdBy: userId,
				createdAt: now
			});

			// Update proposal: link to meeting, change status
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
});

/**
 * Start processing a proposal in a meeting
 *
 * Called by recorder when the proposal's agenda item becomes active.
 */
export const startProcessing = mutation({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const proposal = await ctx.db.get(args.proposalId);
		if (!proposal) throw new Error('Proposal not found');
		if (proposal.status !== 'submitted') {
			throw new Error('Proposal must be submitted to start processing');
		}

		// Verify user is recorder of the meeting
		const meeting = await ctx.db.get(proposal.meetingId!);
		if (!meeting) throw new Error('Linked meeting not found');
		if (meeting.recorderId !== userId) {
			throw new Error('Only the meeting recorder can process proposals');
		}

		await ctx.db.patch(args.proposalId, {
			status: 'in_meeting',
			updatedAt: Date.now()
		});

		return { success: true };
	}
});

/**
 * Helper: Ensure unique circle slug within workspace
 * Application layer function that combines DB query with pure slug logic
 */
async function ensureUniqueCircleSlug(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	baseSlug: string
): Promise<string> {
	const existingCircles = await ctx.db
		.query('circles')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	const existingSlugs = new Set(existingCircles.map((circle) => circle.slug));
	return ensureUniqueSlug(baseSlug, existingSlugs);
}

/**
 * Approve a proposal and auto-apply changes
 *
 * Only the meeting recorder can approve proposals.
 * Changes are automatically applied to the target entity with version history tracking.
 */
export const approve = mutation({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// 1. Get proposal with evolutions
		const proposal = await ctx.db.get(args.proposalId);
		if (!proposal) throw new Error('Proposal not found');
		if (proposal.status !== 'in_meeting' && proposal.status !== 'integrated') {
			throw new Error('Proposal must be in meeting or integrated to approve');
		}

		// 2. Verify user is recorder of linked meeting
		if (!proposal.meetingId) {
			throw new Error('Proposal must be linked to a meeting to approve');
		}
		const meeting = await ctx.db.get(proposal.meetingId);
		if (!meeting) {
			throw new Error('Linked meeting not found');
		}
		if (meeting.recorderId !== userId) {
			throw new Error('Only the meeting recorder can approve proposals');
		}

		// 3. Get target entity (with conflict detection)
		const entity =
			proposal.entityType === 'circle'
				? await ctx.db.get(proposal.entityId as Id<'circles'>)
				: await ctx.db.get(proposal.entityId as Id<'circleRoles'>);

		if (!entity) {
			throw new Error('Target entity no longer exists - was it deleted?');
		}

		// 4. Capture before state for version history
		const beforeDoc = { ...entity };

		// 5. Get evolutions and build update object
		const evolutions = await ctx.db
			.query('proposalEvolutions')
			.withIndex('by_proposal', (q) => q.eq('proposalId', args.proposalId))
			.collect();

		if (evolutions.length === 0) {
			throw new Error('Proposal has no changes to apply');
		}

		// Build update object with proper typing
		const updates: Partial<Doc<'circles'>> | Partial<Doc<'circleRoles'>> = {
			updatedAt: Date.now(),
			updatedBy: userId
		};

		for (const evolution of evolutions) {
			// Parse JSON values
			const afterValue = evolution.afterValue ? JSON.parse(evolution.afterValue) : undefined;

			// Apply update (only if afterValue exists - removes handled separately)
			if (evolution.changeType !== 'remove' && afterValue !== undefined) {
				(updates as Record<string, unknown>)[evolution.fieldPath] = afterValue;
			}
		}

		// 6. Apply changes
		if (proposal.entityType === 'circle') {
			const circleUpdates = updates as Partial<Doc<'circles'>>;
			// Handle slug regeneration if name changed
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

		// 7. Capture version history with proposal reference
		const afterDoc = await ctx.db.get(proposal.entityId as Id<'circles'> | Id<'circleRoles'>);
		if (!afterDoc) {
			throw new Error('Failed to retrieve updated entity');
		}

		const changeDescription = `Approved via proposal: ${proposal.title}`;

		// Create version history entry manually (since captureUpdate doesn't support changeDescription)
		// Need to match the discriminated union schema exactly
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

		// 8. Update proposal status
		await ctx.db.patch(args.proposalId, {
			status: 'approved',
			processedAt: Date.now(),
			processedBy: userId,
			versionHistoryEntryId: versionHistoryId,
			updatedAt: Date.now()
		});

		return { success: true, versionHistoryId };
	}
});

/**
 * Reject a proposal
 *
 * Only the meeting recorder can reject proposals.
 * This updates the proposal status without applying any changes.
 */
export const reject = mutation({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// 1. Get proposal
		const proposal = await ctx.db.get(args.proposalId);
		if (!proposal) throw new Error('Proposal not found');
		if (proposal.status !== 'in_meeting' && proposal.status !== 'integrated') {
			throw new Error('Proposal must be in meeting or integrated to reject');
		}

		// 2. Verify user is recorder of linked meeting
		if (!proposal.meetingId) {
			throw new Error('Proposal must be linked to a meeting to reject');
		}
		const meeting = await ctx.db.get(proposal.meetingId);
		if (!meeting) {
			throw new Error('Linked meeting not found');
		}
		if (meeting.recorderId !== userId) {
			throw new Error('Only the meeting recorder can reject proposals');
		}

		// 3. Update proposal status
		await ctx.db.patch(args.proposalId, {
			status: 'rejected',
			processedAt: Date.now(),
			processedBy: userId,
			updatedAt: Date.now()
		});

		return { success: true };
	}
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List proposals with filters
 *
 * Uses indexes for efficient querying.
 */
export const list = query({
	args: {
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
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

		// Use most selective index based on provided filters
		let proposals: Doc<'circleProposals'>[];

		if (args.circleId) {
			// Use by_circle index
			proposals = await ctx.db
				.query('circleProposals')
				.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
				.collect();
			// Filter to workspace (should already be correct, but verify)
			proposals = proposals.filter((p) => p.workspaceId === args.workspaceId);
		} else if (args.status) {
			// Use by_workspace_status index for status filter
			proposals = await ctx.db
				.query('circleProposals')
				.withIndex('by_workspace_status', (q) =>
					q.eq('workspaceId', args.workspaceId).eq('status', args.status!)
				)
				.collect();
		} else if (args.creatorId) {
			// Use by_creator index
			proposals = await ctx.db
				.query('circleProposals')
				.withIndex('by_creator', (q) => q.eq('createdBy', args.creatorId!))
				.collect();
			proposals = proposals.filter((p) => p.workspaceId === args.workspaceId);
		} else {
			// Use by_workspace index
			proposals = await ctx.db
				.query('circleProposals')
				.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
				.collect();
		}

		// Apply remaining filters
		if (args.status && args.circleId) {
			proposals = proposals.filter((p) => p.status === args.status);
		}
		if (args.creatorId && !args.creatorId) {
			proposals = proposals.filter((p) => p.createdBy === args.creatorId);
		}

		// Sort by creation date, newest first
		proposals.sort((a, b) => b.createdAt - a.createdAt);

		// Apply limit
		const limit = args.limit ?? 50;
		proposals = proposals.slice(0, limit);

		return proposals;
	}
});

/**
 * Get a single proposal with all related data
 */
export const get = query({
	args: {
		sessionId: v.string(),
		proposalId: v.id('circleProposals')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const proposal = await ctx.db.get(args.proposalId);
		if (!proposal) return null;

		await ensureWorkspaceMembership(ctx, proposal.workspaceId, userId);

		// Get evolutions
		const evolutions = await ctx.db
			.query('proposalEvolutions')
			.withIndex('by_proposal_order', (q) => q.eq('proposalId', args.proposalId))
			.collect();

		// Get objections
		const objections = await ctx.db
			.query('proposalObjections')
			.withIndex('by_proposal', (q) => q.eq('proposalId', args.proposalId))
			.collect();

		// Get attachments
		const attachments = await ctx.db
			.query('proposalAttachments')
			.withIndex('by_proposal', (q) => q.eq('proposalId', args.proposalId))
			.collect();

		// Get creator info
		const creator = await ctx.db.get(proposal.createdBy);

		// Get target entity info
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
});

/**
 * Get proposal by agenda item ID
 *
 * Enables loose coupling: meetings module can query if an agenda item
 * has a linked proposal without knowing about proposal internals.
 */
export const getByAgendaItem = query({
	args: {
		sessionId: v.string(),
		agendaItemId: v.id('meetingAgendaItems')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const proposal = await ctx.db
			.query('circleProposals')
			.withIndex('by_agendaItem', (q) => q.eq('agendaItemId', args.agendaItemId))
			.first();

		if (!proposal) return null;

		await ensureWorkspaceMembership(ctx, proposal.workspaceId, userId);

		return proposal;
	}
});

/**
 * Get proposals for a specific circle
 *
 * Useful for showing pending proposals in circle detail view.
 */
export const listByCircle = query({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		includeTerminal: v.optional(v.boolean()) // Include approved/rejected/withdrawn
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get circle to verify workspace access
		const circle = await ctx.db.get(args.circleId);
		if (!circle) return [];

		await ensureWorkspaceMembership(ctx, circle.workspaceId, userId);

		let proposals = await ctx.db
			.query('circleProposals')
			.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
			.collect();

		// Filter out terminal states unless requested
		if (!args.includeTerminal) {
			const terminalStates: ProposalStatus[] = ['approved', 'rejected', 'withdrawn'];
			proposals = proposals.filter((p) => !terminalStates.includes(p.status as ProposalStatus));
		}

		// Sort by creation date, newest first
		proposals.sort((a, b) => b.createdAt - a.createdAt);

		return proposals;
	}
});

/**
 * Get user's draft proposals
 *
 * Useful for "My Drafts" view.
 */
export const listMyDrafts = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
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
});

/**
 * List proposals available for import into a meeting
 *
 * Filters by:
 * - Meeting's circle (smart filtering)
 * - Status: 'submitted' (ready to import)
 * - Not already linked to a meeting
 *
 * Used by meeting import UI to show proposals relevant to the meeting's circle.
 */
export const listForMeetingImport = query({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get meeting to verify access and get circleId
		const meeting = await ctx.db.get(args.meetingId);
		if (!meeting) throw new Error('Meeting not found');

		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// If meeting has no circleId, return empty (no proposals to import)
		if (!meeting.circleId) {
			return [];
		}

		// Query proposals for this circle with status 'submitted'
		// Only proposals not already linked to a meeting
		let proposals = await ctx.db
			.query('circleProposals')
			.withIndex('by_circle', (q) => q.eq('circleId', meeting.circleId))
			.collect();

		// Filter: status = 'submitted' AND not already linked to a meeting
		proposals = proposals.filter(
			(p) => p.status === 'submitted' && p.workspaceId === meeting.workspaceId && !p.meetingId
		);

		// Sort by creation date, newest first
		proposals.sort((a, b) => b.createdAt - a.createdAt);

		return proposals;
	}
});

/**
 * Create a proposal from diff (auto-capture changes)
 *
 * When user edits a circle/role and clicks "Save as Proposal", automatically
 * capture all field changes as evolutions.
 *
 * Algorithm:
 * 1. Get current entity state from DB
 * 2. Create proposal with status 'submitted' (MVP: no draft status)
 * 3. Compare current DB values vs edited form values
 * 4. Create evolutions only for changed fields
 */
export const createFromDiff = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		entityType: v.union(v.literal('circle'), v.literal('role')),
		entityId: v.string(),
		title: v.string(),
		description: v.string(),
		// Current form values (what user edited to)
		editedValues: v.object({
			name: v.optional(v.string()),
			purpose: v.optional(v.string()),
			circleType: v.optional(v.string()),
			decisionModel: v.optional(v.string()),
			representsToParent: v.optional(v.boolean())
		})
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

		// 1. Get current entity state
		const entity =
			args.entityType === 'circle'
				? await ctx.db.get(args.entityId as Id<'circles'>)
				: await ctx.db.get(args.entityId as Id<'circleRoles'>);

		if (!entity) throw new Error('Entity not found');

		// Verify workspace matches
		if (entity.workspaceId !== args.workspaceId) {
			throw new Error('Entity does not belong to this workspace');
		}

		// 2. Create proposal (status: 'submitted' - MVP: no draft status)
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
			status: 'submitted', // MVP: directly submitted (no draft)
			createdBy: userId,
			createdAt: now,
			updatedAt: now
		});

		// 3. Calculate and insert evolutions
		const fieldLabels: Record<string, string> = {
			name: 'Name',
			purpose: 'Purpose',
			circleType: 'Circle Type',
			decisionModel: 'Decision Model',
			representsToParent: 'Represents to Parent Circle'
		};

		let order = 0;
		for (const [field, label] of Object.entries(fieldLabels)) {
			// Only process fields that exist in editedValues
			if (!(field in args.editedValues)) continue;

			const currentValue = (entity as Record<string, unknown>)[field];
			const editedValue = (args.editedValues as Record<string, unknown>)[field];

			// Only create evolution if value changed
			// Compare stringified values for consistency
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
});
