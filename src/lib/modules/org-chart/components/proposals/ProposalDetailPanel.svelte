<script lang="ts">
	/**
	 * ProposalDetailPanel Component
	 *
	 * Full view of a proposal with all details.
	 * Shows status, evolutions, objections, and available actions.
	 * Uses StackedPanel for consistent navigation UX with org-chart.
	 */
	import { browser } from '$app/environment';
	import { Button, Icon, Heading } from '$lib/components/atoms';
	import type { IconType } from '$lib/components/atoms/iconRegistry';
	import ProposalStatusBadge from '$lib/components/molecules/ProposalStatusBadge.svelte';
	import ProposalEvolutionList from '$lib/components/molecules/ProposalEvolutionList.svelte';
	import StackedPanel from '$lib/components/organisms/StackedPanel.svelte';
	import type { ProposalWithDetails, ProposalStatus } from '../../composables/useProposals.svelte';
	import type { Id } from '$lib/convex/_generated/dataModel';
import type { UseNavigationStack } from '$lib/modules/core/api';

	type Props = {
		proposal: ProposalWithDetails | null;
		/** Current user ID (to show different actions based on ownership) */
		currentUserId?: string;
		/** Whether proposal is loading */
		isLoading?: boolean;
		/** Error state */
		error?: unknown | null;
		/** Whether proposal mutations are loading */
		isMutating?: boolean;
		/** Whether panel is open */
		isOpen: boolean;
		/** Navigation stack for panel management */
		navigationStack: UseNavigationStack;
		/** Handler for withdraw action */
		onWithdraw?: () => void;
		/** Handler to edit proposal (only for draft) */
		onEdit?: () => void;
		/** Handler to submit to meeting */
		onSubmitToMeeting?: () => void;
		/** Handler to close panel */
		onClose: () => void;
		/** Function to check if this panel is topmost */
		isTopmost: () => boolean;
		class?: string;
	};

	let {
		proposal,
		currentUserId,
		isLoading = false,
		error = null,
		isMutating = false,
		isOpen,
		navigationStack,
		onWithdraw,
		onEdit,
		onSubmitToMeeting,
		onClose,
		isTopmost,
		class: className = ''
	}: Props = $props();

	// Check if current user is the proposal creator
	const isCreator = $derived(proposal ? currentUserId === proposal.createdBy : false);

	// Check what actions are available based on status
	const canEdit = $derived(proposal ? isCreator && proposal.status === 'draft' : false);
	const canSubmit = $derived(
		proposal ? isCreator && proposal.status === 'draft' && proposal.evolutions.length > 0 : false
	);
	const canWithdraw = $derived(
		proposal ? isCreator && !['approved', 'rejected', 'withdrawn'].includes(proposal.status) : false
	);

	// Format dates
	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			year: new Date(timestamp).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
			hour: 'numeric',
			minute: '2-digit'
		});
	};

	// Status timeline
	const statusTimeline = $derived.by(() => {
		if (!proposal) return [];
		const events: { label: string; date: number; status: ProposalStatus }[] = [
			{ label: 'Created', date: proposal.createdAt, status: 'draft' }
		];

		if (proposal.submittedAt) {
			events.push({ label: 'Submitted', date: proposal.submittedAt, status: 'submitted' });
		}

		if (proposal.processedAt) {
			events.push({
				label: proposal.status === 'approved' ? 'Approved' : 'Rejected',
				date: proposal.processedAt,
				status: proposal.status as ProposalStatus
			});
		}

		return events;
	});

	// Breadcrumb icon renderer (optional - can return null for no icon)
	// Returns IconType for rendering with Icon component (secure, no HTML injection)
	// Note: Using 'document' icon for proposals (no dedicated proposal icon in registry)
	function renderBreadcrumbIcon(layerType: string): IconType | null {
		if (layerType === 'proposal') {
			return 'document';
		}
		return null;
	}

	// Handle breadcrumb click
	function handleBreadcrumbClick(index: number) {
		const targetLayer = navigationStack.getLayer(index);
		if (!targetLayer) return;

		// Jump to that layer in the stack
		navigationStack.jumpTo(index);

		// Close panel if jumping back to root
		if (index === 0) {
			onClose();
		}
	}
</script>

{#if browser}
	<StackedPanel
		{isOpen}
		{navigationStack}
		{onClose}
		onBreadcrumbClick={handleBreadcrumbClick}
		{isTopmost}
		iconRenderer={renderBreadcrumbIcon}
	>
		{#snippet children(panelContext)}
			{#if isLoading}
				<!-- Loading State -->
				<div class="flex h-full items-center justify-center">
					<div class="text-center">
						<svg
							class="mx-auto size-icon-xl animate-spin text-tertiary"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						<p class="text-body text-secondary mb-header">Loading proposal details...</p>
					</div>
				</div>
			{:else if error}
				<!-- Error State -->
				<div class="flex h-full items-center justify-center">
					<div class="text-center">
						<p class="text-body font-medium text-error">Failed to load proposal</p>
						<p class="text-body text-secondary mb-header">
							{error instanceof Error ? error.message : String(error)}
						</p>
						<Button variant="outline" size="sm" onclick={onClose}>Close</Button>
					</div>
				</div>
			{:else if proposal}
				<div class="flex h-full flex-col {className}">
					<!-- Header -->
					<header class="flex items-start justify-between border-b border-default card-padding">
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-fieldGroup mb-header">
								{#if panelContext.isMobile && panelContext.canGoBack && panelContext.onBack}
									<Button
										variant="ghost"
										size="sm"
										iconOnly
										onclick={panelContext.onBack}
										aria-label="Go back"
									>
										<Icon type="chevron-left" size="sm" />
									</Button>
								{/if}
								<ProposalStatusBadge status={proposal.status} size="md" />
								{#if proposal.targetEntity}
									<span class="text-body text-secondary">
										→ {proposal.targetEntity.name} ({proposal.targetEntity.type})
									</span>
								{/if}
							</div>
							<Heading level={2} color="primary">
								{proposal.title}
							</Heading>
						</div>

						<Button variant="ghost" size="sm" iconOnly onclick={onClose} aria-label="Close panel">
							<Icon type="close" size="sm" />
						</Button>
					</header>

					<!-- Content -->
					<div class="flex flex-1 flex-col gap-section overflow-y-auto card-padding">
						<!-- Description -->
						<section>
							<h3 class="text-body font-medium text-secondary mb-header">Description</h3>
							<p class="text-body whitespace-pre-wrap text-primary">
								{proposal.description}
							</p>
						</section>

						<!-- Timeline -->
						<section>
							<h3 class="text-body font-medium text-secondary mb-header">Timeline</h3>
							<div class="flex flex-col gap-fieldGroup">
								{#each statusTimeline as event (event.date)}
									<div class="flex items-center gap-content text-body">
										<div class="bg-primary size-icon-sm rounded-full"></div>
										<span class="font-medium text-primary">{event.label}</span>
										<span class="text-tertiary">{formatDate(event.date)}</span>
									</div>
								{/each}
							</div>
						</section>

						<!-- Creator info -->
						{#if proposal.creator}
							<section>
								<h3 class="text-body font-medium text-secondary mb-header">Created by</h3>
								<div class="flex items-center gap-fieldGroup">
									<div
										class="bg-surface-alt flex size-icon-lg items-center justify-center rounded-full text-body font-medium text-primary"
									>
										{proposal.creator.name?.charAt(0) ?? proposal.creator.email.charAt(0)}
									</div>
									<div>
										<p class="text-body font-medium text-primary">
											{proposal.creator.name ?? 'Unknown'}
										</p>
										<p class="text-small text-tertiary">{proposal.creator.email}</p>
									</div>
								</div>
							</section>
						{/if}

						<!-- Proposed Changes -->
						<section>
							<h3 class="text-body font-medium text-secondary mb-header">
								Proposed Changes ({proposal.evolutions.length})
							</h3>
							<ProposalEvolutionList evolutions={proposal.evolutions} editable={false} />
						</section>

						<!-- Objections (if any) -->
						{#if proposal.objections.length > 0}
							<section>
								<h3 class="text-body font-medium text-secondary mb-header">
									Objections ({proposal.objections.length})
								</h3>
								<div class="flex flex-col gap-fieldGroup">
									{#each proposal.objections as objection}
										<div class="bg-error/10 border-error/20 rounded-card border inset-sm">
											<p class="text-body text-error">{objection.objectionText}</p>
										</div>
									{/each}
								</div>
							</section>
						{/if}
					</div>

					<!-- Actions Footer -->
					{#if canEdit || canSubmit || canWithdraw}
						<div class="border-t border-default card-padding">
							<div class="flex items-center justify-between gap-content">
								<!-- Left: Secondary actions -->
								<div class="flex gap-fieldGroup">
									{#if canWithdraw}
										<Button
											variant="ghost"
											size="sm"
											onclick={onWithdraw}
											disabled={isMutating}
											class="hover:bg-error/10 text-error"
										>
											<Icon type="close" size="sm" />
											Withdraw
										</Button>
									{/if}
								</div>

								<!-- Right: Primary actions -->
								<div class="flex gap-fieldGroup">
									{#if canEdit}
										<Button variant="secondary" size="sm" onclick={onEdit} disabled={isMutating}>
											<Icon type="edit" size="sm" />
											Edit
										</Button>
									{/if}
									{#if canSubmit}
										<Button
											variant="primary"
											size="sm"
											onclick={onSubmitToMeeting}
											disabled={isMutating}
										>
											<Icon type="send" size="sm" />
											Submit to Meeting
										</Button>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		{/snippet}
	</StackedPanel>
{/if}
