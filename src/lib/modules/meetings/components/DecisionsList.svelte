<script lang="ts">
	/**
	 * Decisions List Component (SYOS-224)
	 * Refactored (SYOS-470): Separation of concerns - UI only
	 *
	 * Inline UI for logging decisions linked to agenda items.
	 * Features:
	 * - List of decisions for current agenda item
	 * - Inline "Add Decision" form (title + markdown description)
	 * - Edit existing decisions in place
	 * - Delete decisions with hover actions
	 * - Display timestamp
	 */

	import { browser } from '$app/environment';
	import type { Id } from '$lib/convex';
	import { useDecisions } from '../composables/useDecisions.svelte';
	import { useDecisionsForm } from '../composables/useDecisionsForm.svelte';

	interface Props {
		agendaItemId: Id<'meetingAgendaItems'>;
		meetingId: Id<'meetings'>;
		sessionId?: string;
		readonly?: boolean;
	}

	const { agendaItemId, meetingId, sessionId, readonly = false }: Props = $props();

	// Data composable
	const decisionsData = useDecisions({
		agendaItemId: () => agendaItemId,
		sessionId: () => sessionId
	});

	// Form composable
	const decisionsForm = useDecisionsForm({
		sessionId: () => sessionId ?? '',
		meetingId: () => meetingId,
		agendaItemId: () => agendaItemId,
		readonly: () => readonly
	});

	// Derived getters for template
	const decisions = $derived(decisionsData.decisions);
	const isAdding = $derived(decisionsForm.isAdding);
	const editingId = $derived(decisionsForm.editingId);
	const error = $derived(decisionsForm.error);
	const isSaving = $derived(decisionsForm.isSaving);
</script>

{#if browser && sessionId}
	<div class="flex flex-col gap-content-section">
		<!-- Section Header -->
		<div class="flex items-center justify-between">
			<h4 class="text-body-sm font-medium text-primary">Decisions</h4>
			{#if !readonly && !isAdding && !editingId}
				<button
					onclick={decisionsForm.startAdding}
					class="text-body-sm flex items-center gap-icon rounded-button bg-elevated px-nav-item py-nav-item text-secondary transition-colors hover:bg-hover-solid hover:text-primary"
				>
					<svg class="icon-sm flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					Add Decision
				</button>
			{/if}
		</div>

		<!-- Error Message -->
		{#if error}
			<div class="text-body-sm rounded-button bg-error-bg px-card py-header text-error-text">
				{error}
			</div>
		{/if}

		<!-- Add Decision Form -->
		{#if isAdding}
			<div class="p-card rounded-button border-2 border-accent-primary bg-elevated">
				<div class="flex flex-col gap-icon">
					<!-- Title Input -->
					<div>
						<label
							for="new-decision-title"
							class="text-body-sm mb-form-field-gap block font-medium text-primary"
						>
							Title
						</label>
						<input
							id="new-decision-title"
							type="text"
							bind:value={decisionsForm.newTitle}
							placeholder="Decision title..."
							class="text-body-sm w-full rounded-input border border-base bg-surface px-input-x py-input-y text-primary placeholder:text-tertiary focus:border-accent-primary focus:outline-none"
						/>
					</div>

					<!-- Description Textarea -->
					<div>
						<label
							for="new-decision-description"
							class="text-body-sm mb-form-field-gap block font-medium text-primary"
						>
							Description (optional)
						</label>
						<textarea
							id="new-decision-description"
							bind:value={decisionsForm.newDescription}
							placeholder="Add context or details..."
							rows="4"
							class="text-body-sm w-full rounded-input border border-base bg-surface px-input-x py-input-y text-primary placeholder:text-tertiary focus:border-accent-primary focus:outline-none"
						></textarea>
					</div>

					<!-- Form Actions -->
					<div class="flex justify-end gap-icon">
						<button
							onclick={decisionsForm.cancelAdding}
							disabled={isSaving}
							class="rounded-button px-button-x py-button-y text-button text-secondary transition-colors hover:bg-hover-solid hover:text-primary disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							onclick={decisionsForm.handleCreate}
							disabled={isSaving || !decisionsForm.newTitle.trim()}
							class="rounded-button bg-accent-primary px-button-x py-button-y text-button font-medium text-primary transition-colors hover:bg-accent-hover disabled:opacity-50"
						>
							{isSaving ? 'Creating...' : 'Create Decision'}
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Decisions List -->
		{#if decisions.length > 0}
			<div class="flex flex-col gap-icon">
				{#each decisions as decision (decision._id)}
					<div
						role="region"
						aria-label="Decision card"
						class="rounded-card border border-base bg-elevated transition-all hover:border-elevated"
						onmouseenter={() => {
							decisionsForm.hoveredId = decision._id;
						}}
						onmouseleave={() => {
							decisionsForm.hoveredId = null;
						}}
					>
						{#if editingId === decision._id}
							<!-- Edit Mode -->
							<div class="p-card">
								<div class="flex flex-col gap-icon">
									<!-- Title Input -->
									<div>
										<label
											for="edit-decision-title-{decision._id}"
											class="text-body-sm mb-form-field-gap block font-medium text-primary"
										>
											Title
										</label>
										<input
											id="edit-decision-title-{decision._id}"
											type="text"
											bind:value={decisionsForm.editTitle}
											placeholder="Decision title..."
											class="text-body-sm w-full rounded-input border border-base bg-surface px-input-x py-input-y text-primary placeholder:text-tertiary focus:border-accent-primary focus:outline-none"
										/>
									</div>

									<!-- Description Textarea -->
									<div>
										<label
											for="edit-decision-description-{decision._id}"
											class="text-body-sm mb-form-field-gap block font-medium text-primary"
										>
											Description (optional)
										</label>
										<textarea
											id="edit-decision-description-{decision._id}"
											bind:value={decisionsForm.editDescription}
											placeholder="Add context or details..."
											rows="4"
											class="text-body-sm w-full rounded-input border border-base bg-surface px-input-x py-input-y text-primary placeholder:text-tertiary focus:border-accent-primary focus:outline-none"
										></textarea>
									</div>

									<!-- Form Actions -->
									<div class="flex justify-end gap-icon">
										<button
											onclick={decisionsForm.cancelEditing}
											disabled={isSaving}
											class="rounded-button px-button-x py-button-y text-button text-secondary transition-colors hover:bg-hover-solid hover:text-primary disabled:opacity-50"
										>
											Cancel
										</button>
										<button
											onclick={() => decisionsForm.handleUpdate(decision._id)}
											disabled={isSaving || !decisionsForm.editTitle.trim()}
											class="rounded-button bg-accent-primary px-button-x py-button-y text-button font-medium text-primary transition-colors hover:bg-accent-hover disabled:opacity-50"
										>
											{isSaving ? 'Saving...' : 'Save Changes'}
										</button>
									</div>
								</div>
							</div>
						{:else}
							<!-- View Mode -->
							<div class="p-card">
								<div class="flex items-start justify-between gap-content-section">
									<div class="flex flex-1 flex-col gap-icon">
										<!-- Title -->
										<h5 class="font-medium text-primary">{decision.title}</h5>

										<!-- Description -->
										{#if decision.description}
											<div class="text-body-sm whitespace-pre-wrap text-secondary">
												{decision.description}
											</div>
										{/if}

										<!-- Timestamp -->
										<div class="flex items-center gap-icon text-label text-tertiary">
											<svg
												class="icon-xs flex-shrink-0"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											<span>{decisionsForm.formatTimestamp(decision.decidedAt)}</span>
										</div>
									</div>

									<!-- Hover Actions -->
									{#if !readonly && decisionsForm.hoveredId === decision._id}
										<div class="gap-icon-sm flex">
											<button
												onclick={() => decisionsForm.startEditing(decision)}
												class="rounded-button p-control-button-padding text-secondary transition-colors hover:bg-hover-solid hover:text-primary"
												aria-label="Edit decision"
											>
												<svg
													class="icon-sm flex-shrink-0"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
													/>
												</svg>
											</button>
											<button
												onclick={() => decisionsForm.handleDelete(decision._id)}
												class="rounded-button p-control-button-padding text-secondary transition-colors hover:bg-destructive-hover hover:text-error-text"
												aria-label="Delete decision"
											>
												<svg
													class="icon-sm flex-shrink-0"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										</div>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{:else if !isAdding}
			<!-- Empty State -->
			<div
				class="py-section-spacing-small rounded-card border border-dashed border-base bg-surface px-card text-center"
			>
				<svg
					class="mx-auto icon-lg text-tertiary"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
					/>
				</svg>
				<p class="mt-spacing-text-gap text-body-sm text-secondary">No decisions recorded yet</p>
				{#if !readonly}
					<button
						onclick={decisionsForm.startAdding}
						class="mt-icon text-body-sm text-accent-primary hover:underline"
					>
						Add the first decision
					</button>
				{/if}
			</div>
		{/if}
	</div>
{:else if !browser}
	<!-- SSR placeholder -->
	<div class="text-body-sm text-tertiary italic">Loading decisions...</div>
{/if}
