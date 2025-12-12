<script lang="ts">
	/**
	 * Agenda Item View Component
	 *
	 * Displays the active agenda item in full view during meeting.
	 * Features:
	 * - Show item title and metadata
	 * - Markdown notes editor with auto-save (SYOS-222)
	 * - "Mark as Processed" button
	 * - Empty state when no item selected
	 * - Proposal support: Shows ProposalAgendaItem if item is linked to a proposal
	 */

	import { browser } from '$app/environment';
	import { getContext, onDestroy } from 'svelte';
	import ActionItemsList from './ActionItemsList.svelte';
	import ProposalAgendaItem from './ProposalAgendaItem.svelte';
	import { useAgendaNotes } from '../composables/useAgendaNotes.svelte';
	import { useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { Button, Text, Heading, Icon } from '$lib/components/atoms';
	import type { CoreModuleAPI } from '$lib/modules/core/api';
	import { invariant } from '$lib/utils/invariant';

	interface Props {
		item?: {
			_id: Id<'meetingAgendaItems'>;
			title: string;
			notes?: string;
			status: 'todo' | 'processed' | 'rejected';
			creatorName: string;
		};
		meetingId?: Id<'meetings'>;
		workspaceId?: Id<'workspaces'>;
		circleId?: Id<'circles'>;
		sessionId?: string;
		onMarkStatus: (itemId: Id<'meetingAgendaItems'>, status: 'processed' | 'rejected') => void;
		isClosed: boolean;
		isRecorder: boolean;
	}

	const {
		item,
		meetingId,
		workspaceId,
		circleId,
		sessionId,
		onMarkStatus,
		isClosed,
		isRecorder
	}: Props = $props();

	const coreAPI = getContext<CoreModuleAPI | undefined>('core-api');
	const NoteEditor = coreAPI?.NoteEditor;

	// Check if this agenda item is linked to a proposal
	// Wrap in $derived to make query creation reactive
	const proposalQuery = $derived(
		browser && item?._id && sessionId
			? useQuery(api.core.proposals.index.getByAgendaItem, () => {
					invariant(item?._id && sessionId, 'Agenda item ID and sessionId required');
					return {
						sessionId,
						agendaItemId: item._id
					};
				})
			: null
	);

	const linkedProposal = $derived(proposalQuery?.data ?? null);
	const isProposal = $derived(linkedProposal !== null);

	// Notes composable - editable for all users (only used for non-proposal items)
	const notes = useAgendaNotes({
		agendaItemId: () => (item?._id ? item._id : ('' as Id<'meetingAgendaItems'>)),
		initialNotes: () => item?.notes,
		sessionId: () => sessionId
	});

	// Save immediately on destroy (navigation) - secretary only
	onDestroy(() => {
		if (notes) {
			void notes.saveImmediately();
		}
	});

	// Handlers for proposal actions
	function handleProposalApprove() {
		// ProposalAgendaItem handles the mutation, this is just for callback
		// The agenda item status will be updated by ProposalAgendaItem
	}

	function handleProposalReject() {
		// ProposalAgendaItem handles the mutation, this is just for callback
		// The agenda item status will be updated by ProposalAgendaItem
	}
</script>

{#if !item}
	<!-- Empty State - No item selected -->
	<div class="flex h-full items-center justify-center">
		<div class="text-center">
			<div class="mx-auto">
				<Icon type="dashboard" size="xl" color="tertiary" />
			</div>
			<Heading level="h3" size="h3" class="mb-header">No Agenda Item Selected</Heading>
			<Text variant="body" size="base" color="secondary" as="p" class="mt-fieldGroup">
				Click an agenda item from the sidebar to start processing
			</Text>
		</div>
	</div>
{:else if isProposal && linkedProposal}
	<!-- Proposal Agenda Item - Show ProposalAgendaItem component -->
	<ProposalAgendaItem
		proposalId={linkedProposal._id}
		agendaItemId={item._id}
		meetingId={meetingId!}
		sessionId={sessionId!}
		{isRecorder}
		{isClosed}
		onApprove={handleProposalApprove}
		onReject={handleProposalReject}
	/>
{:else}
	<!-- Active Agenda Item -->
	<div class="flex h-full flex-col">
		<!-- Item Header -->
		<div class="border-border-base bg-elevated px-page py-stack-header border-b">
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<Heading level="h2" size="h1">
						{item.title}
					</Heading>
					<div
						class="text-body-sm text-text-tertiary gap-fieldGroup mt-fieldGroup flex items-center"
					>
						<Text variant="body" size="sm" color="tertiary" as="span"
							>Added by {item.creatorName}</Text
						>
						{#if item.status === 'processed'}
							<span class="text-success-text gap-fieldGroup flex items-center">
								<Icon type="check" size="sm" />
								<Text variant="body" size="sm" color="success" as="span">Processed</Text>
							</span>
						{:else if item.status === 'rejected'}
							<span class="text-error-text gap-fieldGroup flex items-center">
								<Icon type="close" size="sm" />
								<Text variant="body" size="sm" color="error" as="span">Rejected</Text>
							</span>
						{/if}
					</div>
				</div>

				<!-- Mark Status Buttons (recorder only) -->
				{#if item.status === 'todo' && !isClosed && isRecorder}
					<div class="gap-fieldGroup flex">
						<Button variant="primary" onclick={() => onMarkStatus(item._id, 'processed')}>
							Mark as Processed
						</Button>
						<Button variant="outline" onclick={() => onMarkStatus(item._id, 'rejected')}>
							Reject
						</Button>
					</div>
				{/if}
			</div>
		</div>

		<!-- Notes Editor (SYOS-222) -->
		<div class="px-page py-page flex-1 overflow-y-auto">
			{#if browser && item}
				<div class="gap-section flex flex-col">
					<!-- Notes Editor: Editable for all users -->
					<!-- Save State Indicator -->
					{#if notes.saveState !== 'idle'}
						<div class="text-body-sm gap-fieldGroup flex items-center">
							{#if notes.saveState === 'saving'}
								<Text variant="body" size="sm" color="tertiary" as="span">Saving...</Text>
							{:else if notes.saveState === 'saved'}
								<span class="text-success-text gap-fieldGroup flex items-center">
									<Icon type="check" size="sm" />
									<Text variant="body" size="sm" color="success" as="span">Saved</Text>
								</span>
							{:else if notes.saveState === 'error'}
								<Text variant="body" size="sm" color="error" as="span"
									>{notes.saveError || 'Failed to save'}</Text
								>
							{/if}
						</div>
					{/if}

					<!-- Editor: Local state with auto-save -->
					{#if NoteEditor}
						<NoteEditor
							content={notes.localNotes}
							title={item.title}
							onContentChange={notes.handleNotesChange}
							placeholder="Take notes for this agenda item..."
							readonly={isClosed}
							showToolbar={!isClosed}
							compact={false}
						/>
					{:else}
						<Text variant="body" size="sm" color="tertiary" as="p" class="italic"
							>Note editor unavailable</Text
						>
					{/if}

					<!-- Action Items List (SYOS-223) -->
					{#if meetingId && workspaceId && sessionId}
						<ActionItemsList
							agendaItemId={item._id}
							{meetingId}
							{sessionId}
							{workspaceId}
							{circleId}
							readonly={isClosed}
						/>
					{/if}
				</div>
			{:else if !browser}
				<!-- SSR placeholder -->
				<Text variant="body" size="sm" color="tertiary" as="div" class="italic"
					>Loading editor...</Text
				>
			{:else}
				<Text variant="body" size="sm" color="tertiary" as="p" class="italic"
					>No notes yet for this agenda item</Text
				>
			{/if}
		</div>
	</div>
{/if}
