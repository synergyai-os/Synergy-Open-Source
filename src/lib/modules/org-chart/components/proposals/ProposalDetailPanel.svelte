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
	import Loading from '$lib/components/atoms/Loading.svelte';
	import ProposalStatusBadge from '$lib/components/molecules/ProposalStatusBadge.svelte';
	import ProposalEvolutionList from '$lib/components/molecules/ProposalEvolutionList.svelte';
	import StackedPanel from '$lib/components/organisms/StackedPanel.svelte';
	import type { ProposalWithDetails, ProposalStatus } from '../../composables/useProposals.svelte';
	import type { UseNavigationStack } from '$lib/modules/core/api';

	type Props = {
		proposal: ProposalWithDetails | null;
		/** Current person ID (to show different actions based on ownership) */
		currentPersonId?: string;
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
		currentPersonId,
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

	// Keep a stable copy of the last-loaded proposal to prevent full-panel flashes if `isLoading`
	// toggles briefly (e.g., URL-driven state updates).
	const stable = $state({
		proposal: null as ProposalWithDetails | null
	});
	const lastLoaded = $state({
		proposalId: null as string | null
	});
	const incomingProposalId = $derived(proposal?._id ?? null);

	$effect(() => {
		// Clear stable state when the panel closes to avoid showing stale content on next open.
		if (!isOpen) {
			stable.proposal = null;
			lastLoaded.proposalId = null;
			return;
		}
		if (proposal) {
			stable.proposal = proposal;
		}
	});

	const displayProposal = $derived(proposal ?? stable.proposal);
	$effect(() => {
		if (displayProposal?._id) {
			lastLoaded.proposalId = displayProposal._id as unknown as string;
		}
	});

	const shouldShowContentLoadingOverlay = $derived(
		isLoading &&
			!!displayProposal &&
			(!incomingProposalId || lastLoaded.proposalId !== (incomingProposalId as unknown as string))
	);

	// Check if current person is the proposal creator
	const isCreator = $derived(
		displayProposal ? currentPersonId === displayProposal.createdByPersonId : false
	);

	// Check what actions are available based on status
	const canEdit = $derived(
		displayProposal ? isCreator && displayProposal.status === 'draft' : false
	);
	const canSubmit = $derived(
		displayProposal
			? isCreator && displayProposal.status === 'draft' && displayProposal.evolutions.length > 0
			: false
	);
	const canWithdraw = $derived(
		displayProposal
			? isCreator && !['approved', 'rejected', 'withdrawn'].includes(displayProposal.status)
			: false
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
		if (!displayProposal) return [];
		const events: { label: string; date: number; status: ProposalStatus }[] = [
			{ label: 'Created', date: displayProposal.createdAt, status: 'draft' }
		];

		if (displayProposal.submittedAt) {
			events.push({ label: 'Submitted', date: displayProposal.submittedAt, status: 'submitted' });
		}

		if (displayProposal.processedAt) {
			events.push({
				label: displayProposal.status === 'approved' ? 'Approved' : 'Rejected',
				date: displayProposal.processedAt,
				status: displayProposal.status as ProposalStatus
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
				{#if !displayProposal}
					<!-- Initial load (no stable proposal yet) -->
					<Loading message="Loading proposal details..." size="md" fullHeight={true} />
				{:else}
					<!-- Keep panel structure stable; show overlay on content only -->
					<div class="flex h-full flex-col {className}">
						<!-- Header -->
						<header class="border-default card-padding flex items-start justify-between border-b">
							<div class="min-w-0 flex-1">
								<div class="gap-fieldGroup mb-header flex items-center">
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
									<ProposalStatusBadge status={displayProposal.status} size="md" />
									{#if displayProposal.targetEntity}
										<span class="text-body text-secondary">
											→ {displayProposal.targetEntity.name} ({displayProposal.targetEntity.type})
										</span>
									{/if}
								</div>
								<Heading level={2} color="primary">
									{displayProposal.title}
								</Heading>
							</div>

							<Button variant="ghost" size="sm" iconOnly onclick={onClose} aria-label="Close panel">
								<Icon type="close" size="sm" />
							</Button>
						</header>

						<!-- Content -->
						<div class="relative flex-1 overflow-y-auto">
							<div class="gap-section card-padding flex flex-col">
								<!-- Description -->
								<section>
									<h3 class="text-body text-secondary mb-header font-medium">Description</h3>
									<p class="text-body text-primary whitespace-pre-wrap">
										{displayProposal.description}
									</p>
								</section>

								<!-- Timeline -->
								<section>
									<h3 class="text-body text-secondary mb-header font-medium">Timeline</h3>
									<div class="gap-fieldGroup flex flex-col">
										{#each statusTimeline as event (event.date)}
											<div class="gap-content text-body flex items-center">
												<div class="bg-primary size-icon-sm rounded-full"></div>
												<span class="text-primary font-medium">{event.label}</span>
												<span class="text-tertiary">{formatDate(event.date)}</span>
											</div>
										{/each}
									</div>
								</section>

								<!-- Creator info -->
								{#if displayProposal.creator}
									<section>
										<h3 class="text-body text-secondary mb-header font-medium">Created by</h3>
										<div class="gap-fieldGroup flex items-center">
											<div
												class="bg-surface-alt size-icon-lg text-body text-primary flex items-center justify-center rounded-full font-medium"
											>
												{displayProposal.creator.name?.charAt(0) ??
													displayProposal.creator.email.charAt(0)}
											</div>
											<div>
												<p class="text-body text-primary font-medium">
													{displayProposal.creator.name ?? 'Unknown'}
												</p>
												<p class="text-small text-tertiary">{displayProposal.creator.email}</p>
											</div>
										</div>
									</section>
								{/if}

								<!-- Proposed Changes -->
								<section>
									<h3 class="text-body text-secondary mb-header font-medium">
										Proposed Changes ({displayProposal.evolutions.length})
									</h3>
									<ProposalEvolutionList evolutions={displayProposal.evolutions} editable={false} />
								</section>

								<!-- Objections (if any) -->
								{#if displayProposal.objections.length > 0}
									<section>
										<h3 class="text-body text-secondary mb-header font-medium">
											Objections ({displayProposal.objections.length})
										</h3>
										<div class="gap-fieldGroup flex flex-col">
											{#each displayProposal.objections as objection (objection._id || objection.objectionText)}
												<div class="bg-error/10 border-error/20 rounded-card inset-sm border">
													<p class="text-body text-error">{objection.objectionText}</p>
												</div>
											{/each}
										</div>
									</section>
								{/if}
							</div>

							{#if shouldShowContentLoadingOverlay}
								<div class="bg-surface/80 absolute inset-0 flex items-center justify-center">
									<Loading message="Loading..." size="md" />
								</div>
							{/if}
						</div>

						<!-- Actions Footer -->
						{#if canEdit || canSubmit || canWithdraw}
							<div class="border-default card-padding border-t">
								<div class="gap-content flex items-center justify-between">
									<!-- Left: Secondary actions -->
									<div class="gap-fieldGroup flex">
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
									<div class="gap-fieldGroup flex">
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
			{:else if error}
				<!-- Error State -->
				<div class="flex h-full items-center justify-center">
					<div class="text-center">
						<p class="text-body text-error font-medium">Failed to load proposal</p>
						<p class="text-body text-secondary mb-header">
							{error instanceof Error ? error.message : String(error)}
						</p>
						<Button variant="outline" size="sm" onclick={onClose}>Close</Button>
					</div>
				</div>
			{:else if displayProposal}
				<!-- Loaded proposal with no loading -->
				<div class="flex h-full flex-col {className}">
					<!-- Header -->
					<header class="border-default card-padding flex items-start justify-between border-b">
						<div class="min-w-0 flex-1">
							<div class="gap-fieldGroup mb-header flex items-center">
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
								<ProposalStatusBadge status={displayProposal.status} size="md" />
								{#if displayProposal.targetEntity}
									<span class="text-body text-secondary">
										→ {displayProposal.targetEntity.name} ({displayProposal.targetEntity.type})
									</span>
								{/if}
							</div>
							<Heading level={2} color="primary">
								{displayProposal.title}
							</Heading>
						</div>

						<Button variant="ghost" size="sm" iconOnly onclick={onClose} aria-label="Close panel">
							<Icon type="close" size="sm" />
						</Button>
					</header>

					<!-- Content -->
					<div class="relative flex-1 overflow-y-auto">
						<div class="gap-section card-padding flex flex-col">
							<!-- Description -->
							<section>
								<h3 class="text-body text-secondary mb-header font-medium">Description</h3>
								<p class="text-body text-primary whitespace-pre-wrap">
									{displayProposal.description}
								</p>
							</section>

							<!-- Timeline -->
							<section>
								<h3 class="text-body text-secondary mb-header font-medium">Timeline</h3>
								<div class="gap-fieldGroup flex flex-col">
									{#each statusTimeline as event (event.date)}
										<div class="gap-content text-body flex items-center">
											<div class="bg-primary size-icon-sm rounded-full"></div>
											<span class="text-primary font-medium">{event.label}</span>
											<span class="text-tertiary">{formatDate(event.date)}</span>
										</div>
									{/each}
								</div>
							</section>

							<!-- Creator info -->
							{#if displayProposal.creator}
								<section>
									<h3 class="text-body text-secondary mb-header font-medium">Created by</h3>
									<div class="gap-fieldGroup flex items-center">
										<div
											class="bg-surface-alt size-icon-lg text-body text-primary flex items-center justify-center rounded-full font-medium"
										>
											{displayProposal.creator.name?.charAt(0) ??
												displayProposal.creator.email.charAt(0)}
										</div>
										<div>
											<p class="text-body text-primary font-medium">
												{displayProposal.creator.name ?? 'Unknown'}
											</p>
											<p class="text-small text-tertiary">{displayProposal.creator.email}</p>
										</div>
									</div>
								</section>
							{/if}

							<!-- Proposed Changes -->
							<section>
								<h3 class="text-body text-secondary mb-header font-medium">
									Proposed Changes ({displayProposal.evolutions.length})
								</h3>
								<ProposalEvolutionList evolutions={displayProposal.evolutions} editable={false} />
							</section>

							<!-- Objections (if any) -->
							{#if displayProposal.objections.length > 0}
								<section>
									<h3 class="text-body text-secondary mb-header font-medium">
										Objections ({displayProposal.objections.length})
									</h3>
									<div class="gap-fieldGroup flex flex-col">
										{#each displayProposal.objections as objection (objection._id || objection.objectionText)}
											<div class="bg-error/10 border-error/20 rounded-card inset-sm border">
												<p class="text-body text-error">{objection.objectionText}</p>
											</div>
										{/each}
									</div>
								</section>
							{/if}
						</div>

						{#if shouldShowContentLoadingOverlay}
							<div class="bg-surface/80 absolute inset-0 flex items-center justify-center">
								<Loading message="Loading..." size="md" />
							</div>
						{/if}
					</div>

					<!-- Actions Footer -->
					{#if canEdit || canSubmit || canWithdraw}
						<div class="border-default card-padding border-t">
							<div class="gap-content flex items-center justify-between">
								<!-- Left: Secondary actions -->
								<div class="gap-fieldGroup flex">
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
								<div class="gap-fieldGroup flex">
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
			{:else}
				<!-- Empty State -->
				<div class="flex h-full items-center justify-center">
					<p class="text-body text-secondary">No proposal selected</p>
				</div>
			{/if}
		{/snippet}
	</StackedPanel>
{/if}
