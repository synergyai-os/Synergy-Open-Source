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
		focus:ring-primary rounded-card
		border-default bg-surface
		inset-sm hover:bg-hover w-full
		overflow-hidden border
		text-left transition-colors
		duration-150 focus:ring-2 focus:ring-offset-1 focus:outline-none
		{className}
	"
	onclick={onClick}
>
	<div class="gap-card flex items-start justify-between">
		<!-- Left: Title and metadata -->
		<div class="min-w-0 flex-1">
			<div class="gap-fieldGroup mb-header flex items-center">
				<ProposalStatusBadge status={proposal.status} />
				{#if showTarget && targetName}
					<span class="text-small text-secondary">→ {targetName}</span>
				{/if}
			</div>

			<h4 class="text-body text-primary truncate font-medium">
				{proposal.title}
			</h4>

			<p class="text-small text-secondary mt-fieldGroup line-clamp-2">
				{proposal.description}
			</p>

			<div class="text-small gap-fieldGroup text-tertiary mt-fieldGroup flex items-center">
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
			<div class="text-tertiary flex-shrink-0">
				<Icon name="chevron-right" size="sm" />
			</div>
		{/if}
	</div>
</button>
