<script lang="ts">
	/**
	 * ProposalAgendaItem Component
	 *
	 * Displays a proposal in meeting context with diff view and approve/reject actions.
	 * Used when an agenda item is linked to a proposal.
	 *
	 * Features:
	 * - Shows proposal title and description
	 * - Displays diff view of proposed changes
	 * - Approve/Reject buttons (recorder only)
	 * - Real-time status updates
	 */

	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { toast } from 'svelte-sonner';
	import { Button, Heading, Text, Icon } from '$lib/components/atoms';
	import ProposalEvolutionList from '$lib/components/molecules/ProposalEvolutionList.svelte';
	import ProposalStatusBadge from '$lib/components/molecules/ProposalStatusBadge.svelte';

	interface Props {
		proposalId: Id<'circleProposals'>;
		agendaItemId: Id<'meetingAgendaItems'>;
		meetingId: Id<'meetings'>;
		sessionId: string;
		isRecorder: boolean;
		isClosed: boolean;
		onApprove?: () => void;
		onReject?: () => void;
	}

	const {
		proposalId,
		agendaItemId,
		meetingId: _meetingId,
		sessionId,
		isRecorder,
		isClosed,
		onApprove,
		onReject
	}: Props = $props();

	const convexClient = useConvexClient();

	// Fetch proposal with details
	const proposalQuery = useQuery(api.core.proposals.index.get, {
		sessionId,
		proposalId
	});

	const proposal = $derived(proposalQuery?.data ?? null);
	const isLoading = $derived(proposalQuery === undefined);
	const error = $derived(proposalQuery?.error);

	// Handle approve
	async function handleApprove() {
		if (!isRecorder || isClosed) return;

		try {
			await convexClient.mutation(api.core.proposals.index.approve, {
				sessionId,
				proposalId
			});

			// Mark agenda item as processed
			await convexClient.mutation(api.features.meetings.agendaItems.markStatus, {
				sessionId,
				agendaItemId,
				status: 'processed'
			});

			toast.success('Proposal approved and changes applied');
			onApprove?.();
		} catch (err) {
			console.error('Failed to approve proposal:', err);
			toast.error(err instanceof Error ? err.message : 'Failed to approve proposal');
		}
	}

	// Handle reject
	async function handleReject() {
		if (!isRecorder || isClosed) return;

		try {
			await convexClient.mutation(api.core.proposals.index.reject, {
				sessionId,
				proposalId
			});

			// Mark agenda item as rejected
			await convexClient.mutation(api.features.meetings.agendaItems.markStatus, {
				sessionId,
				agendaItemId,
				status: 'rejected'
			});

			toast.success('Proposal rejected');
			onReject?.();
		} catch (err) {
			console.error('Failed to reject proposal:', err);
			toast.error(err instanceof Error ? err.message : 'Failed to reject proposal');
		}
	}

	// Check if proposal can be approved/rejected
	const canApprove = $derived(
		isRecorder && !isClosed && proposal?.status === 'in_meeting' && proposal.evolutions.length > 0
	);
	const canReject = $derived(isRecorder && !isClosed && proposal?.status === 'in_meeting');
</script>

{#if isLoading}
	<div class="flex h-full items-center justify-center">
		<div class="text-center">
			<div
				class="size-icon-lg rounded-avatar border-accent-primary inline-block animate-spin border-4 border-solid border-r-transparent"
			></div>
			<Text variant="body" color="secondary" class="mt-text-gap">Loading proposal...</Text>
		</div>
	</div>
{:else if error}
	<div class="flex h-full items-center justify-center">
		<div class="text-center">
			<Icon type="alert-circle" size="xl" color="error" />
			<Heading level="h3" size="h3" class="mt-header text-error-text"
				>Error Loading Proposal</Heading
			>
			<Text variant="body" color="secondary" class="mt-text-gap">
				{error instanceof Error ? error.message : 'Failed to load proposal'}
			</Text>
		</div>
	</div>
{:else if !proposal}
	<div class="flex h-full items-center justify-center">
		<div class="text-center">
			<Icon type="alert-circle" size="xl" color="tertiary" />
			<Heading level="h3" size="h3" class="mt-header">Proposal Not Found</Heading>
			<Text variant="body" color="secondary" class="mt-text-gap">
				This proposal may have been deleted or you don't have access to it.
			</Text>
		</div>
	</div>
{:else}
	<div class="flex h-full flex-col">
		<!-- Header -->
		<div class="border-border-base bg-elevated px-page py-stack-header border-b">
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<div class="mb-fieldGroup gap-fieldGroup flex items-center">
						<Heading level="h2" size="h1">{proposal.title}</Heading>
						<ProposalStatusBadge status={proposal.status} />
					</div>
					<div class="text-body-sm text-text-tertiary gap-fieldGroup flex items-center">
						{#if proposal.creator}
							<Text variant="body" size="sm" color="tertiary" as="span"
								>Proposed by {proposal.creator.name}</Text
							>
						{/if}
						{#if proposal.targetEntity}
							<span class="text-text-tertiary">•</span>
							<Text variant="body" size="sm" color="tertiary" as="span"
								>Target: {proposal.targetEntity.name} ({proposal.targetEntity.type})</Text
							>
						{/if}
					</div>
					{#if proposal.description}
						<Text variant="body" size="sm" color="secondary" class="mt-fieldGroup">
							{proposal.description}
						</Text>
					{/if}
				</div>

				<!-- Action Buttons (recorder only) -->
				{#if canApprove || canReject}
					<div class="gap-fieldGroup flex">
						{#if canApprove}
							<Button variant="primary" onclick={handleApprove}>Approve</Button>
						{/if}
						{#if canReject}
							<Button variant="outline" onclick={handleReject}>Reject</Button>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Content: Proposed Changes -->
		<div class="px-page py-page flex-1 overflow-y-auto">
			{#if proposal.evolutions.length === 0}
				<div class="py-stack-item text-center">
					<Icon type="alert-circle" size="lg" color="tertiary" />
					<Heading level="h3" size="h3" class="mt-header">No Proposed Changes</Heading>
					<Text variant="body" color="secondary" class="mt-text-gap">
						This proposal doesn't have any changes defined.
					</Text>
				</div>
			{:else}
				<div class="gap-section flex flex-col">
					<div>
						<Heading level="h3" size="h3" class="mb-header">Proposed Changes</Heading>
						<Text variant="body" size="sm" color="secondary" class="mb-content">
							Review the changes below. Approving will apply these changes to the
							{proposal.entityType === 'circle' ? ' circle' : ' role'}.
						</Text>
					</div>

					<ProposalEvolutionList evolutions={proposal.evolutions} />
				</div>
			{/if}
		</div>
	</div>
{/if}
