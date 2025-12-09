<script lang="ts">
	/**
	 * My Proposals Page - Phase 2 (SYOS-665)
	 *
	 * Displays all proposals created by the current user, grouped by status:
	 * - Active: submitted, in_meeting
	 * - Completed: approved, rejected, withdrawn
	 */

	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { getContext } from 'svelte';
	import { useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { useProposalMutations } from '$lib/modules/org-chart/composables/useProposals.svelte';
	import ProposalCard from '$lib/modules/org-chart/components/proposals/ProposalCard.svelte';
	import ProposalDetailPanel from '$lib/modules/org-chart/components/proposals/ProposalDetailPanel.svelte';
	import { Button, Heading, Text } from '$lib/components/atoms';
	import { PageHeader } from '$lib/components/molecules';
	import * as ScrollArea from '$lib/components/atoms/ScrollArea.svelte';
	import {
		scrollAreaRootRecipe,
		scrollAreaViewportRecipe,
		scrollAreaScrollbarRecipe,
		scrollAreaThumbRecipe
	} from '$lib/design-system/recipes';
	import { useNavigationStack } from '$lib/modules/core/composables/useNavigationStack.svelte';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import type {
		Proposal,
		ProposalWithDetails
	} from '$lib/modules/org-chart/composables/useProposals.svelte';

	// Get sessionId from page data
	const getSessionId = () => $page.data.sessionId;

	// Get workspaces context
	const organizationsContext = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const activeWorkspace = $derived(() => {
		if (!organizationsContext) return null;
		return organizationsContext.activeWorkspace ?? null;
	});
	const workspaceId = $derived(() => {
		const org = activeWorkspace();
		return org?.workspaceId ?? undefined;
	});

	// Get current user ID
	const currentUserId = $derived(() => $page.data.user?.userId);

	// Query all proposals for this workspace, filtered by creator
	const getWorkspaceId = () => workspaceId();
	const proposalsQuery = $derived(
		browser && getSessionId() && getWorkspaceId() && currentUserId()
			? useQuery(api.proposals.list, () => ({
					sessionId: getSessionId()!,
					workspaceId: getWorkspaceId()! as Id<'workspaces'>,
					creatorId: currentUserId()! as Id<'users'>,
					limit: 100 // Get all user's proposals
				}))
			: null
	);

	const allProposals = $derived((proposalsQuery?.data ?? []) as Proposal[]);
	const isLoading = $derived(proposalsQuery?.isLoading ?? false);
	const error = $derived(proposalsQuery?.error ?? null);

	// Group proposals by status
	const activeProposals = $derived(
		allProposals.filter((p) => ['submitted', 'in_meeting'].includes(p.status))
	);
	const completedProposals = $derived(
		allProposals.filter((p) => ['approved', 'rejected', 'withdrawn'].includes(p.status))
	);

	// Navigation stack for panel management
	const navigationStack = useNavigationStack();

	// Selected proposal state
	let selectedProposalId: Id<'circleProposals'> | null = $state(null);

	// Query selected proposal details
	const selectedProposalQuery = $derived(
		browser && getSessionId() && selectedProposalId
			? useQuery(api.proposals.get, () => ({
					sessionId: getSessionId()!,
					proposalId: selectedProposalId!
				}))
			: null
	);

	const selectedProposal = $derived(selectedProposalQuery?.data as ProposalWithDetails | null);
	const selectedProposalIsLoading = $derived(selectedProposalQuery?.isLoading ?? false);
	const selectedProposalError = $derived(selectedProposalQuery?.error ?? null);

	// Proposal mutations
	const mutations = useProposalMutations({
		sessionId: () => getSessionId(),
		workspaceId: () => getWorkspaceId()
	});

	// Check if proposal panel is topmost
	function isProposalPanelTopmost() {
		const currentLayer = navigationStack.currentLayer;
		return currentLayer?.type === 'proposal' && currentLayer?.id === selectedProposalId;
	}

	// Handlers
	function handleProposalClick(proposal: Proposal) {
		selectedProposalId = proposal._id;
		// Push to navigation stack
		navigationStack.push({
			type: 'proposal',
			id: proposal._id,
			name: proposal.title
		});
	}

	function handleCloseDetail() {
		selectedProposalId = null;
		// Pop from navigation stack
		navigationStack.pop();
	}

	async function handleWithdraw() {
		if (!selectedProposalId) return;
		try {
			await mutations.withdraw(selectedProposalId);
			// Close detail panel after successful withdraw
			selectedProposalId = null;
		} catch (err) {
			console.error('Failed to withdraw proposal:', err);
			// Error is tracked in mutations.error
		}
	}
</script>

<div class="flex h-full flex-col bg-base">
	<!-- Header -->
	<PageHeader>
		{#snippet titleSlot()}
			<Text variant="label" size="sm" color="secondary" weight="normal">My Proposals</Text>
		{/snippet}
	</PageHeader>

	<!-- Content -->
	<ScrollArea.Root class={scrollAreaRootRecipe()}>
		<ScrollArea.Viewport class={scrollAreaViewportRecipe()}>
			<div class="max-w-container mx-auto px-page py-page">
				{#if isLoading}
					<div class="flex h-64 items-center justify-center">
						<Text variant="body" color="secondary">Loading proposals...</Text>
					</div>
				{:else if error}
					<div class="flex h-64 flex-col items-center justify-center">
						<Text variant="body" color="error" class="mb-2">
							Failed to load proposals: {error?.message ?? 'Unknown error'}
						</Text>
						<Button variant="outline" size="sm" onclick={() => window.location.reload()}>
							Reload Page
						</Button>
					</div>
				{:else if allProposals.length === 0}
					<!-- Empty State -->
					<div class="flex h-64 flex-col items-center justify-center">
						<div class="mb-4 text-6xl">📝</div>
						<Heading level={3} class="mb-2">No proposals yet</Heading>
						<Text variant="body" color="secondary" class="max-w-md text-center">
							Create your first proposal by editing a circle or role and clicking "Save as
							Proposal".
						</Text>
					</div>
				{:else}
					<div class="flex flex-col gap-section">
						<!-- Active Proposals Section -->
						{#if activeProposals.length > 0}
							<section>
								<Heading level={5} color="secondary" class="mb-header">
									Active ({activeProposals.length})
								</Heading>
								<div class="flex flex-col gap-fieldGroup">
									{#each activeProposals as proposal (proposal._id)}
										<ProposalCard {proposal} onClick={() => handleProposalClick(proposal)} />
									{/each}
								</div>
							</section>
						{/if}

						<!-- Completed Proposals Section -->
						{#if completedProposals.length > 0}
							<section>
								<Heading level={5} color="secondary" class="mb-header">
									Completed ({completedProposals.length})
								</Heading>
								<div class="flex flex-col gap-fieldGroup">
									{#each completedProposals as proposal (proposal._id)}
										<ProposalCard {proposal} onClick={() => handleProposalClick(proposal)} />
									{/each}
								</div>
							</section>
						{/if}
					</div>
				{/if}
			</div>
		</ScrollArea.Viewport>
		<ScrollArea.Scrollbar class={scrollAreaScrollbarRecipe()} orientation="vertical">
			<ScrollArea.Thumb class={scrollAreaThumbRecipe()} />
		</ScrollArea.Scrollbar>
	</ScrollArea.Root>

	<!-- Detail Panel - Uses StackedPanel for consistent UX -->
	{#if browser}
		<ProposalDetailPanel
			proposal={selectedProposal}
			currentUserId={currentUserId()}
			isLoading={selectedProposalIsLoading}
			error={selectedProposalError}
			isMutating={mutations.isWithdrawing}
			isOpen={selectedProposalId !== null}
			{navigationStack}
			onWithdraw={handleWithdraw}
			onClose={handleCloseDetail}
			isTopmost={isProposalPanelTopmost}
		/>
	{/if}
</div>
