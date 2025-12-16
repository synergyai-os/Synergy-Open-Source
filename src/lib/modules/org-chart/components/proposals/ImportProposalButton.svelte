<script lang="ts">
	/**
	 * ImportProposalButton Component
	 *
	 * Button to trigger the import proposal modal.
	 * Shows count badge if proposals are available.
	 *
	 * SYOS-666 Phase 3: Meeting Import
	 */

	import { browser } from '$app/environment';
	import { useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { Button, Icon } from '$lib/components/atoms';
	import ImportProposalModal from './ImportProposalModal.svelte';

	type Props = {
		meetingId: Id<'meetings'>;
		sessionId: string;
		workspaceId: Id<'workspaces'>;
		onImportComplete?: () => void;
	};

	let { meetingId, sessionId, workspaceId, onImportComplete }: Props = $props();

	// Query meeting first to check if it has a circleId
	const meetingQuery = $derived(
		browser && sessionId && meetingId
			? useQuery(api.features.meetings.meetings.get, () => ({
					sessionId,
					meetingId
				}))
			: null
	);

	const meeting = $derived(meetingQuery?.data);
	const hasCircleId = $derived(!!meeting?.circleId);

	// Query importable proposals count (only if meeting has circleId)
	const proposalsQuery = $derived(
		browser && sessionId && meetingId && hasCircleId
			? useQuery(api.core.proposals.index.listForMeetingImport, () => ({
					sessionId,
					meetingId
				}))
			: null
	);

	const proposals = $derived((proposalsQuery?.data ?? []) as unknown[]);
	const proposalCount = $derived(proposals.length);

	// Modal state
	let modalOpen = $state(false);
</script>

<Button variant="outline" size="sm" onclick={() => (modalOpen = true)}>
	<Icon name="plus" size="sm" />
	Import Proposal
	{#if proposalCount > 0}
		<span
			class="bg-accent-primary text-primary ml-1 rounded-full px-1.5 py-0.5 text-xs font-medium"
		>
			{proposalCount}
		</span>
	{/if}
</Button>

<ImportProposalModal
	open={modalOpen}
	{meetingId}
	{sessionId}
	{workspaceId}
	onOpenChange={(open) => (modalOpen = open)}
	{onImportComplete}
/>
