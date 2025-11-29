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
	 */

	import { browser } from '$app/environment';
	import { onDestroy } from 'svelte';
	import NoteEditor from '$lib/modules/core/components/notes/NoteEditor.svelte';
	import ActionItemsList from './ActionItemsList.svelte';
	import { useAgendaNotes } from '../composables/useAgendaNotes.svelte';
	import type { Id } from '$lib/convex';
	import { Button, Text, Heading, Icon } from '$lib/components/atoms';

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

	// Notes composable - editable for all users
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
{:else}
	<!-- Active Agenda Item -->
	<div class="flex h-full flex-col">
		<!-- Item Header -->
		<div class="border-border-base border-b bg-elevated px-page py-stack-header">
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<Heading level="h2" size="h1">
						{item.title}
					</Heading>
					<div
						class="text-body-sm text-text-tertiary flex items-center gap-fieldGroup mt-fieldGroup"
					>
						<Text variant="body" size="sm" color="tertiary" as="span"
							>Added by {item.creatorName}</Text
						>
						{#if item.status === 'processed'}
							<span class="text-success-text flex items-center gap-fieldGroup">
								<Icon type="check" size="sm" />
								<Text variant="body" size="sm" color="success" as="span">Processed</Text>
							</span>
						{:else if item.status === 'rejected'}
							<span class="text-error-text flex items-center gap-fieldGroup">
								<Icon type="close" size="sm" />
								<Text variant="body" size="sm" color="error" as="span">Rejected</Text>
							</span>
						{/if}
					</div>
				</div>

				<!-- Mark Status Buttons (recorder only) -->
				{#if item.status === 'todo' && !isClosed && isRecorder}
					<div class="flex gap-fieldGroup">
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
		<div class="flex-1 overflow-y-auto px-page py-page">
			{#if browser && item}
				<div class="flex flex-col gap-section">
					<!-- Notes Editor: Editable for all users -->
					<!-- Save State Indicator -->
					{#if notes.saveState !== 'idle'}
						<div class="text-body-sm flex items-center gap-fieldGroup">
							{#if notes.saveState === 'saving'}
								<Text variant="body" size="sm" color="tertiary" as="span">Saving...</Text>
							{:else if notes.saveState === 'saved'}
								<span class="text-success-text flex items-center gap-fieldGroup">
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
					<NoteEditor
						content={notes.localNotes}
						title={item.title}
						onContentChange={notes.handleNotesChange}
						placeholder="Take notes for this agenda item..."
						readonly={isClosed}
						showToolbar={!isClosed}
						compact={false}
					/>

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
