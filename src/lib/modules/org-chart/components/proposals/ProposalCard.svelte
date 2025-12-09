<script lang="ts">
	/**
	 * ProposalCard Component
	 *
	 * List item for displaying a proposal summary.
	 * Shows title, status, creator, and creation date.
	 */
	import { Icon } from '$lib/components/atoms';
	import ProposalStatusBadge from '$lib/components/molecules/ProposalStatusBadge.svelte';
	import type { Proposal } from '../../composables/useProposals.svelte';

	type Props = {
		proposal: Proposal;
		onClick?: () => void;
		showTarget?: boolean;
		targetName?: string;
		creatorName?: string;
		class?: string;
	};

	let {
		proposal,
		onClick,
		showTarget = false,
		targetName,
		creatorName,
		class: className = ''
	}: Props = $props();

	// Format date for display
	const formattedDate = $derived.by(() => {
		const date = new Date(proposal.createdAt);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
		});
	});
</script>

<button
	type="button"
	class="
		focus:ring-primary w-full
		overflow-hidden rounded-card
		border border-default bg-surface
		inset-sm text-left
		transition-colors duration-150
		hover:bg-hover focus:ring-2 focus:ring-offset-1 focus:outline-none
		{className}
	"
	onclick={onClick}
>
	<div class="flex items-start justify-between gap-card">
		<!-- Left: Title and metadata -->
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-fieldGroup mb-header">
				<ProposalStatusBadge status={proposal.status} />
				{#if showTarget && targetName}
					<span class="text-small text-secondary">→ {targetName}</span>
				{/if}
			</div>

			<h4 class="truncate text-body font-medium text-primary">
				{proposal.title}
			</h4>

			<p class="text-small line-clamp-2 text-secondary mt-fieldGroup">
				{proposal.description}
			</p>

			<div class="text-small flex items-center gap-fieldGroup text-tertiary mt-fieldGroup">
				{#if creatorName}
					<span>{creatorName}</span>
					<span>•</span>
				{/if}
				<span>{formattedDate}</span>
				{#if proposal.submittedAt && proposal.status !== 'draft'}
					<span
						>• Submitted {new Date(proposal.submittedAt).toLocaleDateString('en-US', {
							month: 'short',
							day: 'numeric'
						})}</span
					>
				{/if}
			</div>
		</div>

		<!-- Right: Arrow indicator -->
		{#if onClick}
			<div class="flex-shrink-0 text-tertiary">
				<Icon name="chevron-right" size="sm" />
			</div>
		{/if}
	</div>
</button>
