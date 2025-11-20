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
			<svg
				class="mx-auto h-12 w-12 text-text-tertiary"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
				/>
			</svg>
			<h3 class="mt-4 text-lg font-semibold text-text-primary">No Agenda Item Selected</h3>
			<p class="mt-2 text-text-secondary">
				Click an agenda item from the sidebar to start processing
			</p>
		</div>
	</div>
{:else}
	<!-- Active Agenda Item -->
	<div class="flex h-full flex-col">
		<!-- Item Header -->
		<div class="border-b border-border-base bg-elevated px-inbox-container py-system-header">
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<h2 class="text-2xl font-bold text-text-primary">{item.title}</h2>
					<div class="mt-2 flex items-center gap-icon text-sm text-text-tertiary">
						<span>Added by {item.creatorName}</span>
						{#if item.isProcessed}
							<span class="flex items-center gap-1 text-green-600">
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
								Processed
							</span>
						{/if}
					</div>
				</div>

				<!-- Mark as Processed Button (Secretary only) -->
				{#if !item.isProcessed && !isClosed && isSecretary}
					<button
						onclick={() => onMarkProcessed(item._id)}
						class="rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
					>
						Mark as Processed
					</button>
				{/if}
			</div>
		</div>

		<!-- Notes Editor (SYOS-222) -->
		<div class="flex-1 overflow-y-auto px-inbox-container py-system-content">
			{#if browser && item}
				<div class="space-y-6">
					{#if isSecretary}
						<!-- SECRETARY MODE: Local state with auto-save -->
						<!-- Save State Indicator -->
						{#if notes && notes.saveState !== 'idle'}
							<div class="flex items-center gap-2 text-sm">
								{#if notes.saveState === 'saving'}
									<span class="text-text-tertiary">Saving...</span>
								{:else if notes.saveState === 'saved'}
									<span class="flex items-center gap-1 text-green-600">
										<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 13l4 4L19 7"
											/>
										</svg>
										Saved
									</span>
								{:else if notes.saveState === 'error'}
									<span class="text-red-600">{notes.saveError || 'Failed to save'}</span>
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
				<div class="text-sm text-text-tertiary italic">Loading editor...</div>
			{:else}
				<p class="text-sm text-text-tertiary italic">No notes yet for this agenda item</p>
			{/if}
		</div>
	</div>
{/if}
