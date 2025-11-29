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
	import { Button, Text, Icon } from '$lib/components/atoms';

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
	<div class="gap-content-section flex flex-col">
		<!-- Section Header -->
		<div class="flex items-center justify-between">
			<Text variant="body" size="sm" color="default" as="h4" class="font-medium">Decisions</Text>
			{#if !readonly && !isAdding && !editingId}
				<Button variant="outline" size="sm" onclick={decisionsForm.startAdding}>
					<Icon type="add" size="sm" />
					Add Decision
				</Button>
			{/if}
		</div>

		<!-- Error Message -->
		{#if error}
			<div class="text-body-sm bg-error-bg px-card py-header text-error-text rounded-button">
				{error}
			</div>
		{/if}

		<!-- Add Decision Form -->
		{#if isAdding}
			<div class="p-card border-accent-primary rounded-button border-2 bg-elevated">
				<div class="flex flex-col gap-fieldGroup">
					<!-- Title Input -->
					<div>
						<label for="new-decision-title">
							<Text
								variant="body"
								size="sm"
								color="default"
								as="span"
								class="mb-form-field-gap block font-medium"
							>
								Title
							</Text>
						</label>
						<input
							id="new-decision-title"
							type="text"
							bind:value={decisionsForm.newTitle}
							placeholder="Decision title..."
							class="text-body-sm border-base focus:border-accent-primary w-full rounded-input border bg-surface px-input-x py-input-y text-primary placeholder:text-tertiary focus:outline-none"
						/>
					</div>

					<!-- Description Textarea -->
					<div>
						<label for="new-decision-description">
							<Text
								variant="body"
								size="sm"
								color="default"
								as="span"
								class="mb-form-field-gap block font-medium"
							>
								Description (optional)
							</Text>
						</label>
						<textarea
							id="new-decision-description"
							bind:value={decisionsForm.newDescription}
							placeholder="Add context or details..."
							rows="4"
							class="text-body-sm border-base focus:border-accent-primary w-full rounded-input border bg-surface px-input-x py-input-y text-primary placeholder:text-tertiary focus:outline-none"
						></textarea>
					</div>

					<!-- Form Actions -->
					<div class="flex justify-end gap-fieldGroup">
						<Button variant="outline" onclick={decisionsForm.cancelAdding} disabled={isSaving}>
							Cancel
						</Button>
						<Button
							variant="primary"
							onclick={decisionsForm.handleCreate}
							disabled={isSaving || !decisionsForm.newTitle.trim()}
						>
							{isSaving ? 'Creating...' : 'Create Decision'}
						</Button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Decisions List -->
		{#if decisions.length > 0}
			<div class="flex flex-col gap-fieldGroup">
				{#each decisions as decision (decision._id)}
					<div
						role="region"
						aria-label="Decision card"
						class="border-base hover:border-elevated rounded-card border bg-elevated transition-all"
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
								<div class="flex flex-col gap-fieldGroup">
									<!-- Title Input -->
									<div>
										<label for="edit-decision-title-{decision._id}">
											<Text
												variant="body"
												size="sm"
												color="default"
												as="span"
												class="mb-form-field-gap block font-medium"
											>
												Title
											</Text>
										</label>
										<input
											id="edit-decision-title-{decision._id}"
											type="text"
											bind:value={decisionsForm.editTitle}
											placeholder="Decision title..."
											class="text-body-sm border-base focus:border-accent-primary w-full rounded-input border bg-surface px-input-x py-input-y text-primary placeholder:text-tertiary focus:outline-none"
										/>
									</div>

									<!-- Description Textarea -->
									<div>
										<label for="edit-decision-description-{decision._id}">
											<Text
												variant="body"
												size="sm"
												color="default"
												as="span"
												class="mb-form-field-gap block font-medium"
											>
												Description (optional)
											</Text>
										</label>
										<textarea
											id="edit-decision-description-{decision._id}"
											bind:value={decisionsForm.editDescription}
											placeholder="Add context or details..."
											rows="4"
											class="text-body-sm border-base focus:border-accent-primary w-full rounded-input border bg-surface px-input-x py-input-y text-primary placeholder:text-tertiary focus:outline-none"
										></textarea>
									</div>

									<!-- Form Actions -->
									<div class="flex justify-end gap-fieldGroup">
										<Button
											variant="outline"
											onclick={decisionsForm.cancelEditing}
											disabled={isSaving}
										>
											Cancel
										</Button>
										<Button
											variant="primary"
											onclick={() => decisionsForm.handleUpdate(decision._id)}
											disabled={isSaving || !decisionsForm.editTitle.trim()}
										>
											{isSaving ? 'Saving...' : 'Save Changes'}
										</Button>
									</div>
								</div>
							</div>
						{:else}
							<!-- View Mode -->
							<div class="p-card">
								<div class="gap-content-section flex items-start justify-between">
									<div class="flex flex-1 flex-col gap-fieldGroup">
										<!-- Title -->
										<Text variant="body" size="base" color="default" as="h5" class="font-medium"
											>{decision.title}</Text
										>

										<!-- Description -->
										{#if decision.description}
											<Text
												variant="body"
												size="sm"
												color="secondary"
												as="div"
												class="whitespace-pre-wrap"
											>
												{decision.description}
											</Text>
										{/if}

										<!-- Timestamp -->
										<div class="flex items-center gap-fieldGroup text-label text-tertiary">
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
											<Text variant="label" color="tertiary" as="span"
												>{decisionsForm.formatTimestamp(decision.decidedAt)}</Text
											>
										</div>
									</div>

									<!-- Hover Actions -->
									{#if !readonly && decisionsForm.hoveredId === decision._id}
										<div class="flex gap-fieldGroup">
											<Button
												variant="ghost"
												size="sm"
												iconOnly
												onclick={() => decisionsForm.startEditing(decision)}
												ariaLabel="Edit decision"
											>
												<Icon type="edit" size="sm" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												iconOnly
												onclick={() => decisionsForm.handleDelete(decision._id)}
												ariaLabel="Delete decision"
												class="hover:bg-destructive-hover hover:text-error-text"
											>
												<Icon type="delete" size="sm" />
											</Button>
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
				class="border-base px-card rounded-card border border-dashed bg-surface py-section-gap text-center"
			>
				<div class="mx-auto">
					<Icon type="dashboard" size="lg" color="tertiary" />
				</div>
				<Text variant="body" size="sm" color="secondary" as="p" class="mt-spacing-text-gap"
					>No decisions recorded yet</Text
				>
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
	<Text variant="body" size="sm" color="tertiary" as="div" class="italic">Loading decisions...</Text
	>
{/if}
