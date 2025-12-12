/**
 * Composable for managing circle proposals
 *
 * Provides reactive access to proposals and mutation helpers.
 * Follows Svelte 5 composable patterns with function parameters for reactivity.
 *
 * @see convex/proposals.ts for backend implementation
 */

import { browser } from '$app/environment';
import { useQuery, useConvexClient } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import { invariant } from '$lib/utils/invariant';

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

export interface Proposal {
	_id: Id<'circleProposals'>;
	workspaceId: Id<'workspaces'>;
	entityType: 'circle' | 'role';
	entityId: string;
	circleId?: Id<'circles'>;
	title: string;
	description: string;
	status: ProposalStatus;
	meetingId?: Id<'meetings'>;
	agendaItemId?: Id<'meetingAgendaItems'>;
	createdByPersonId: Id<'people'>;
	createdAt: number;
	updatedAt: number;
	submittedAt?: number;
	processedAt?: number;
	processedByPersonId?: Id<'people'>;
}

export interface ProposalEvolution {
	_id: Id<'proposalEvolutions'>;
	proposalId: Id<'circleProposals'>;
	fieldPath: string;
	fieldLabel: string;
	beforeValue?: string;
	afterValue?: string;
	changeType: 'add' | 'update' | 'remove';
	order: number;
	createdAt: number;
}

export interface ProposalWithDetails extends Proposal {
	evolutions: ProposalEvolution[];
	objections: unknown[];
	attachments: unknown[];
	creator: { id: Id<'people'>; name: string; email: string } | null;
	targetEntity: { type: string; name: string } | null;
}

export interface UseProposalsParams {
	sessionId: () => string | undefined;
	workspaceId: () => string | undefined;
	circleId?: () => string | undefined;
}

export interface UseProposalParams {
	sessionId: () => string | undefined;
	proposalId: () => string | undefined;
}

// ============================================================================
// COMPOSABLES
// ============================================================================

/**
 * Composable for listing proposals
 *
 * @example
 * ```svelte
 * const proposals = useProposals({
 *   sessionId: () => $page.data.sessionId,
 *   workspaceId: () => $page.data.workspaceId,
 *   circleId: () => selectedCircle?.circleId
 * });
 *
 * {#each proposals.items as proposal}
 *   <ProposalCard {proposal} />
 * {/each}
 * ```
 */
export function useProposals(params: UseProposalsParams) {
	const getSessionId = params.sessionId;
	const getWorkspaceId = params.workspaceId;
	const getCircleId = params.circleId;

	// Query proposals for circle (if provided) or workspace
	const proposalsQuery = $derived(
		browser && getSessionId() && getWorkspaceId()
			? getCircleId?.()
				? useQuery(api.core.proposals.index.listByCircle, () => ({
						sessionId: getSessionId()!,
						circleId: getCircleId!() as Id<'circles'>,
						includeTerminal: false
					}))
				: useQuery(api.core.proposals.index.list, () => ({
						sessionId: getSessionId()!,
						workspaceId: getWorkspaceId()! as Id<'workspaces'>,
						limit: 50
					}))
			: null
	);

	// Derived values
	const itemsValue = $derived((proposalsQuery?.data ?? []) as Proposal[]);
	const isLoadingValue = $derived(proposalsQuery?.isLoading ?? false);
	const errorValue = $derived(proposalsQuery?.error ?? null);

	return {
		get items() {
			return itemsValue;
		},
		get isLoading() {
			return isLoadingValue;
		},
		get error() {
			return errorValue;
		},
		// Convenience getters
		get draftCount() {
			return itemsValue.filter((p) => p.status === 'draft').length;
		},
		get submittedCount() {
			return itemsValue.filter((p) => p.status === 'submitted').length;
		},
		get pendingCount() {
			return itemsValue.filter((p) => ['draft', 'submitted', 'in_meeting'].includes(p.status))
				.length;
		}
	};
}

/**
 * Composable for a single proposal with full details
 */
export function useProposal(params: UseProposalParams) {
	const getSessionId = params.sessionId;
	const getProposalId = params.proposalId;

	const proposalQuery = $derived(
		browser && getSessionId() && getProposalId()
			? useQuery(api.core.proposals.index.get, () => ({
					sessionId: getSessionId()!,
					proposalId: getProposalId()! as Id<'circleProposals'>
				}))
			: null
	);

	const dataValue = $derived(proposalQuery?.data as ProposalWithDetails | null);
	const isLoadingValue = $derived(proposalQuery?.isLoading ?? false);
	const errorValue = $derived(proposalQuery?.error ?? null);

	return {
		get data() {
			return dataValue;
		},
		get isLoading() {
			return isLoadingValue;
		},
		get error() {
			return errorValue;
		},
		// Convenience getters
		get evolutions() {
			return dataValue?.evolutions ?? [];
		},
		get objections() {
			return dataValue?.objections ?? [];
		},
		get isEditable() {
			return dataValue?.status === 'draft';
		},
		get canWithdraw() {
			const terminal = ['approved', 'rejected', 'withdrawn'];
			return dataValue ? !terminal.includes(dataValue.status) : false;
		}
	};
}

/**
 * Composable for user's draft proposals
 */
export function useMyDrafts(params: {
	sessionId: () => string | undefined;
	workspaceId: () => string | undefined;
}) {
	const draftsQuery = $derived(
		browser && params.sessionId() && params.workspaceId()
			? useQuery(api.core.proposals.index.myListDrafts, () => ({
					sessionId: params.sessionId()!,
					workspaceId: params.workspaceId()! as Id<'workspaces'>
				}))
			: null
	);

	return {
		get items() {
			return (draftsQuery?.data ?? []) as Proposal[];
		},
		get isLoading() {
			return draftsQuery?.isLoading ?? false;
		},
		get error() {
			return draftsQuery?.error ?? null;
		},
		get count() {
			return (draftsQuery?.data ?? []).length;
		}
	};
}

// ============================================================================
// MUTATIONS
// ============================================================================

export interface UseProposalMutationsParams {
	sessionId: () => string | undefined;
	workspaceId: () => string | undefined;
}

/**
 * Composable for proposal mutations
 *
 * @example
 * ```svelte
 * const mutations = useProposalMutations({
 *   sessionId: () => $page.data.sessionId,
 *   workspaceId: () => $page.data.workspaceId
 * });
 *
 * async function handleCreate() {
 *   const { proposalId } = await mutations.create({
 *     entityType: 'circle',
 *     entityId: circle.circleId,
 *     title: 'Change circle name',
 *     description: 'Proposing to rename for clarity'
 *   });
 * }
 * ```
 */
export function useProposalMutations(params: UseProposalMutationsParams) {
	const getSessionId = params.sessionId;
	const getWorkspaceId = params.workspaceId;
	const client = useConvexClient();

	// Track pending states
	const state = $state({
		isCreating: false,
		isAddingEvolution: false,
		isSubmitting: false,
		isWithdrawing: false,
		isImporting: false,
		error: null as string | null
	});

	async function create(args: {
		entityType: 'circle' | 'role';
		entityId: string;
		title: string;
		description: string;
	}): Promise<{ proposalId: Id<'circleProposals'> }> {
		const sessionId = getSessionId();
		const workspaceId = getWorkspaceId();
		invariant(sessionId && workspaceId, 'Session and workspace required');

		state.isCreating = true;
		state.error = null;
		try {
			const result = await client.mutation(api.core.proposals.index.create, {
				sessionId,
				workspaceId: workspaceId as Id<'workspaces'>,
				...args
			});
			return result;
		} catch (e) {
			state.error = e instanceof Error ? e.message : 'Failed to create proposal';
			throw e;
		} finally {
			state.isCreating = false;
		}
	}

	async function addEvolution(args: {
		proposalId: Id<'circleProposals'>;
		fieldPath: string;
		fieldLabel: string;
		beforeValue?: string;
		afterValue?: string;
		changeType: 'add' | 'update' | 'remove';
	}): Promise<{ evolutionId: Id<'proposalEvolutions'> }> {
		const sessionId = getSessionId();
		invariant(sessionId, 'Session required');

		state.isAddingEvolution = true;
		state.error = null;
		try {
			const result = await client.mutation(api.core.proposals.index.addEvolution, {
				sessionId,
				...args
			});
			return result;
		} catch (e) {
			state.error = e instanceof Error ? e.message : 'Failed to add evolution';
			throw e;
		} finally {
			state.isAddingEvolution = false;
		}
	}

	async function removeEvolution(evolutionId: Id<'proposalEvolutions'>): Promise<void> {
		const sessionId = getSessionId();
		invariant(sessionId, 'Session required');

		state.error = null;
		try {
			await client.mutation(api.core.proposals.index.removeEvolution, {
				sessionId,
				evolutionId
			});
		} catch (e) {
			state.error = e instanceof Error ? e.message : 'Failed to remove evolution';
			throw e;
		}
	}

	async function submit(args: {
		proposalId: Id<'circleProposals'>;
		meetingId: Id<'meetings'>;
	}): Promise<{ agendaItemId: Id<'meetingAgendaItems'> }> {
		const sessionId = getSessionId();
		invariant(sessionId, 'Session required');

		state.isSubmitting = true;
		state.error = null;
		try {
			const result = await client.mutation(api.core.proposals.index.submit, {
				sessionId,
				...args
			});
			return { agendaItemId: result.agendaItemId! };
		} catch (e) {
			state.error = e instanceof Error ? e.message : 'Failed to submit proposal';
			throw e;
		} finally {
			state.isSubmitting = false;
		}
	}

	async function withdraw(proposalId: Id<'circleProposals'>): Promise<void> {
		const sessionId = getSessionId();
		invariant(sessionId, 'Session required');

		state.isWithdrawing = true;
		state.error = null;
		try {
			await client.mutation(api.core.proposals.index.withdraw, {
				sessionId,
				proposalId
			});
		} catch (e) {
			state.error = e instanceof Error ? e.message : 'Failed to withdraw proposal';
			throw e;
		} finally {
			state.isWithdrawing = false;
		}
	}

	async function importToMeeting(args: {
		meetingId: Id<'meetings'>;
		proposalIds: Id<'circleProposals'>[];
	}): Promise<{ agendaItemIds: Id<'meetingAgendaItems'>[] }> {
		const sessionId = getSessionId();
		invariant(sessionId, 'Session required');

		state.isImporting = true;
		state.error = null;
		try {
			const result = await client.mutation(api.core.proposals.index.importToMeeting, {
				sessionId,
				...args
			});
			return { agendaItemIds: result.agendaItemIds };
		} catch (e) {
			state.error = e instanceof Error ? e.message : 'Failed to import proposals';
			throw e;
		} finally {
			state.isImporting = false;
		}
	}

	async function startProcessing(proposalId: Id<'circleProposals'>): Promise<void> {
		const sessionId = getSessionId();
		invariant(sessionId, 'Session required');

		state.error = null;
		try {
			await client.mutation(api.core.proposals.index.startProcessing, {
				sessionId,
				proposalId
			});
		} catch (e) {
			state.error = e instanceof Error ? e.message : 'Failed to start processing';
			throw e;
		}
	}

	return {
		// Actions
		create,
		addEvolution,
		removeEvolution,
		submit,
		withdraw,
		importToMeeting,
		startProcessing,
		// State
		get isCreating() {
			return state.isCreating;
		},
		get isAddingEvolution() {
			return state.isAddingEvolution;
		},
		get isSubmitting() {
			return state.isSubmitting;
		},
		get isWithdrawing() {
			return state.isWithdrawing;
		},
		get isImporting() {
			return state.isImporting;
		},
		get error() {
			return state.error;
		},
		clearError() {
			state.error = null;
		}
	};
}
