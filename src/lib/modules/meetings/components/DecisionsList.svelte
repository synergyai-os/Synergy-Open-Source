<script lang="ts">
	/**
	 * Decisions List Component (SYOS-224)
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
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import type { Id } from '$lib/convex';

	interface Props {
		agendaItemId: Id<'meetingAgendaItems'>;
		meetingId: Id<'meetings'>;
		sessionId?: string;
		readonly?: boolean;
	}

	const { agendaItemId, meetingId, sessionId, readonly = false }: Props = $props();

	// Convex client for mutations
	const convexClient = browser ? useConvexClient() : null;

	// Reactive query for decisions
	const decisionsQuery = useQuery(api.meetingDecisions.listByAgendaItem, () => {
		if (!sessionId) throw new Error('sessionId required');
		return { sessionId, agendaItemId };
	});

	const decisions = $derived(decisionsQuery?.data ?? []);

	// Form state (single $state object with getters)
	const state = $state({
		isAdding: false,
		editingId: null as Id<'meetingDecisions'> | null,
		newTitle: '',
		newDescription: '',
		editTitle: '',
		editDescription: '',
		hoveredId: null as Id<'meetingDecisions'> | null,
		error: null as string | null,
		isSaving: false
	});

	// Getters (only for values used in template)
	const isAdding = $derived(state.isAdding);
	const editingId = $derived(state.editingId);
	const newTitle = $derived(state.newTitle);
	const editTitle = $derived(state.editTitle);
	const hoveredId = $derived(state.hoveredId);
	const error = $derived(state.error);
	const isSaving = $derived(state.isSaving);

	// Sort decisions by decidedAt (newest first)
	const sortedDecisions = $derived([...decisions].sort((a, b) => b.decidedAt - a.decidedAt));

	// Actions
	function startAdding() {
		state.isAdding = true;
		state.editingId = null;
		state.newTitle = '';
		state.newDescription = '';
		state.error = null;
	}

	function cancelAdding() {
		state.isAdding = false;
		state.newTitle = '';
		state.newDescription = '';
		state.error = null;
	}

	async function handleCreate() {
		if (!sessionId || !convexClient) return;
		if (!state.newTitle.trim()) {
			state.error = 'Title is required';
			return;
		}

		state.isSaving = true;
		state.error = null;

		try {
			await convexClient.mutation(api.meetingDecisions.create, {
				sessionId,
				meetingId,
				agendaItemId,
				title: state.newTitle.trim(),
				description: state.newDescription.trim()
			});

			// Reset form
			state.isAdding = false;
			state.newTitle = '';
			state.newDescription = '';
		} catch (err) {
			state.error = err instanceof Error ? err.message : 'Failed to create decision';
		} finally {
			state.isSaving = false;
		}
	}

	function startEditing(decision: {
		_id: Id<'meetingDecisions'>;
		title: string;
		description: string;
	}) {
		state.editingId = decision._id;
		state.editTitle = decision.title;
		state.editDescription = decision.description;
		state.isAdding = false;
		state.error = null;
	}

	function cancelEditing() {
		state.editingId = null;
		state.editTitle = '';
		state.editDescription = '';
		state.error = null;
	}

	async function handleUpdate(decisionId: Id<'meetingDecisions'>) {
		if (!sessionId || !convexClient) return;
		if (!state.editTitle.trim()) {
			state.error = 'Title is required';
			return;
		}

		state.isSaving = true;
		state.error = null;

		try {
			await convexClient.mutation(api.meetingDecisions.update, {
				sessionId,
				decisionId,
				title: state.editTitle.trim(),
				description: state.editDescription.trim()
			});

			// Reset editing state
			state.editingId = null;
			state.editTitle = '';
			state.editDescription = '';
		} catch (err) {
			state.error = err instanceof Error ? err.message : 'Failed to update decision';
		} finally {
			state.isSaving = false;
		}
	}

	async function handleDelete(decisionId: Id<'meetingDecisions'>) {
		if (!sessionId || !convexClient) return;

		state.error = null;

		try {
			await convexClient.mutation(api.meetingDecisions.remove, {
				sessionId,
				decisionId
			});
		} catch (err) {
			state.error = err instanceof Error ? err.message : 'Failed to delete decision';
		}
	}

	// Format timestamp
	function formatTimestamp(timestamp: number): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;

		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
		});
	}
</script>

{#if browser && sessionId}
	<div class="flex flex-col gap-content-section">
		<!-- Section Header -->
		<div class="flex items-center justify-between">
			<h4 class="text-body-sm font-medium text-primary">Decisions</h4>
			{#if !readonly && !isAdding && !editingId}
				<button
					onclick={startAdding}
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
							bind:value={state.newTitle}
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
							bind:value={state.newDescription}
							placeholder="Add context or details..."
							rows="4"
							class="text-body-sm w-full rounded-input border border-base bg-surface px-input-x py-input-y text-primary placeholder:text-tertiary focus:border-accent-primary focus:outline-none"
						></textarea>
					</div>

					<!-- Form Actions -->
					<div class="flex justify-end gap-icon">
						<button
							onclick={cancelAdding}
							disabled={isSaving}
							class="rounded-button px-button-x py-button-y text-button text-secondary transition-colors hover:bg-hover-solid hover:text-primary disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							onclick={handleCreate}
							disabled={isSaving || !newTitle.trim()}
							class="rounded-button bg-accent-primary px-button-x py-button-y text-button font-medium text-primary transition-colors hover:bg-accent-hover disabled:opacity-50"
						>
							{isSaving ? 'Creating...' : 'Create Decision'}
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Decisions List -->
		{#if sortedDecisions.length > 0}
			<div class="flex flex-col gap-icon">
				{#each sortedDecisions as decision (decision._id)}
					<div
						role="region"
						aria-label="Decision card"
						class="rounded-card border border-base bg-elevated transition-all hover:border-elevated"
						onmouseenter={() => {
							state.hoveredId = decision._id;
						}}
						onmouseleave={() => {
							state.hoveredId = null;
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
											bind:value={state.editTitle}
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
											bind:value={state.editDescription}
											placeholder="Add context or details..."
											rows="4"
											class="text-body-sm w-full rounded-input border border-base bg-surface px-input-x py-input-y text-primary placeholder:text-tertiary focus:border-accent-primary focus:outline-none"
										></textarea>
									</div>

									<!-- Form Actions -->
									<div class="flex justify-end gap-icon">
										<button
											onclick={cancelEditing}
											disabled={isSaving}
											class="rounded-button px-button-x py-button-y text-button text-secondary transition-colors hover:bg-hover-solid hover:text-primary disabled:opacity-50"
										>
											Cancel
										</button>
										<button
											onclick={() => handleUpdate(decision._id)}
											disabled={isSaving || !editTitle.trim()}
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
											<span>{formatTimestamp(decision.decidedAt)}</span>
										</div>
									</div>

									<!-- Hover Actions -->
									{#if !readonly && hoveredId === decision._id}
										<div class="gap-icon-sm flex">
											<button
												onclick={() => startEditing(decision)}
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
												onclick={() => handleDelete(decision._id)}
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
						onclick={startAdding}
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
