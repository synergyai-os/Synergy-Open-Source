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
	import DecisionsList from './DecisionsList.svelte';
	import ActionItemsList from './ActionItemsList.svelte';
	import { useAgendaNotes } from '../composables/useAgendaNotes.svelte';
	import type { Id } from '$lib/convex';
	import { Button, Text, Heading, Icon } from '$lib/components/atoms';

	interface Props {
		item?: {
			_id: Id<'meetingAgendaItems'>;
			title: string;
			notes?: string;
			isProcessed?: boolean;
			creatorName: string;
		};
		meetingId?: Id<'meetings'>;
		organizationId?: Id<'organizations'>;
		circleId?: Id<'circles'>;
		sessionId?: string;
		isSecretary: boolean; // SYOS-222: Role-based rendering
		onMarkProcessed: (itemId: Id<'meetingAgendaItems'>) => void;
		isClosed: boolean;
	}

	const {
		item,
		meetingId,
		organizationId,
		circleId,
		sessionId,
		isSecretary,
		onMarkProcessed,
		isClosed
	}: Props = $props();

	// Notes composable - only for secretary mode
	const notes = isSecretary
		? useAgendaNotes({
				agendaItemId: () => (item?._id ? item._id : ('' as Id<'meetingAgendaItems'>)),
				initialNotes: () => item?.notes,
				sessionId: () => sessionId
			})
		: null;

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
			<Heading level="h3" size="h3" class="mt-content-section">No Agenda Item Selected</Heading>
			<Text variant="body" size="base" color="secondary" as="p" class="mt-spacing-text-gap">
				Click an agenda item from the sidebar to start processing
			</Text>
		</div>
	</div>
{:else}
	<!-- Active Agenda Item -->
	<div class="flex h-full flex-col">
		<!-- Item Header -->
		<div class="border-border-base px-inbox-container py-system-header border-b bg-elevated">
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<Heading level="h2" size="h1">
						{item.title}
					</Heading>
					<div
						class="mt-spacing-text-gap text-body-sm text-text-tertiary flex items-center gap-fieldGroup"
					>
						<Text variant="body" size="sm" color="tertiary" as="span"
							>Added by {item.creatorName}</Text
						>
						{#if item.isProcessed}
							<span class="text-success-text flex items-center gap-fieldGroup">
								<Icon type="check" size="sm" />
								<Text variant="body" size="sm" color="success" as="span">Processed</Text>
							</span>
						{/if}
					</div>
				</div>

				<!-- Mark as Processed Button (Secretary only) -->
				{#if !item.isProcessed && !isClosed && isSecretary}
					<Button variant="primary" onclick={() => onMarkProcessed(item._id)}>
						Mark as Processed
					</Button>
				{/if}
			</div>
		</div>

		<!-- Notes Editor (SYOS-222) -->
		<div class="px-inbox-container py-system-content flex-1 overflow-y-auto">
			{#if browser && item}
				<div class="flex flex-col gap-section-gap">
					{#if isSecretary}
						<!-- SECRETARY MODE: Local state with auto-save -->
						<!-- Save State Indicator -->
						{#if notes && notes.saveState !== 'idle'}
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

						<!-- Editor: Local state, no remount on backend updates -->
						{#if notes}
							<NoteEditor
								content={notes.localNotes}
								title={item.title}
								onContentChange={notes.handleNotesChange}
								placeholder="Take notes for this agenda item..."
								readonly={isClosed}
								showToolbar={!isClosed}
								compact={false}
							/>
						{/if}
					{:else}
						<!-- READER MODE: Backend state with remount on changes -->
						{#key item.notes}
							<NoteEditor
								content={item.notes || ''}
								title={item.title}
								placeholder="No notes yet..."
								readonly={true}
								showToolbar={false}
								compact={false}
							/>
						{/key}
					{/if}

					<!-- Action Items List (SYOS-223) -->
					{#if meetingId && organizationId && sessionId}
						<ActionItemsList
							agendaItemId={item._id}
							{meetingId}
							{sessionId}
							{organizationId}
							{circleId}
							readonly={isClosed}
						/>
					{/if}

					<!-- Decisions List (SYOS-224) -->
					{#if meetingId}
						<DecisionsList agendaItemId={item._id} {meetingId} {sessionId} readonly={isClosed} />
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
