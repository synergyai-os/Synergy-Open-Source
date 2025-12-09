<script lang="ts">
	/**
	 * ProposalForm Component
	 *
	 * Form for creating and editing proposals.
	 * Allows adding proposed changes (evolutions) to describe what should change.
	 */
	import { Button, Icon } from '$lib/components/atoms';
	import FormInput from '$lib/components/atoms/FormInput.svelte';
	import FormTextarea from '$lib/components/atoms/FormTextarea.svelte';
	import ProposalEvolutionList from '$lib/components/molecules/ProposalEvolutionList.svelte';
	import type { ProposalEvolution } from '../../composables/useProposals.svelte';

	type Props = {
		/** Mode: create new or edit existing */
		mode: 'create' | 'edit';
		/** Target entity type */
		entityType: 'circle' | 'role';
		/** Target entity name (for display) */
		entityName: string;
		/** Initial title (for edit mode) */
		initialTitle?: string;
		/** Initial description (for edit mode) */
		initialDescription?: string;
		/** Existing evolutions (for edit mode) */
		evolutions?: ProposalEvolution[];
		/** Submit handler */
		onSubmit: (data: { title: string; description: string }) => Promise<void>;
		/** Cancel handler */
		onCancel: () => void;
		/** Add evolution handler (for edit mode) */
		onAddEvolution?: (evolution: {
			fieldPath: string;
			fieldLabel: string;
			beforeValue?: string;
			afterValue?: string;
			changeType: 'add' | 'update' | 'remove';
		}) => Promise<void>;
		/** Remove evolution handler */
		onRemoveEvolution?: (evolutionId: string) => void;
		/** Loading state */
		isLoading?: boolean;
		class?: string;
	};

	let {
		mode,
		entityType,
		entityName,
		initialTitle = '',
		initialDescription = '',
		evolutions = [],
		onSubmit,
		onCancel,
		onAddEvolution,
		onRemoveEvolution,
		isLoading = false,
		class: className = ''
	}: Props = $props();

	// Form state
	let title = $state(initialTitle);
	let description = $state(initialDescription);
	let error = $state<string | null>(null);

	// Evolution form state (inline add)
	let showAddEvolution = $state(false);
	let evolutionFieldLabel = $state('');
	let evolutionBeforeValue = $state('');
	let evolutionAfterValue = $state('');
	let evolutionChangeType = $state<'add' | 'update' | 'remove'>('update');

	// Validation
	const isValid = $derived(title.trim().length > 0 && description.trim().length > 0);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!isValid || isLoading) return;

		error = null;
		try {
			await onSubmit({ title: title.trim(), description: description.trim() });
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save proposal';
		}
	}

	async function handleAddEvolution() {
		if (!onAddEvolution || !evolutionFieldLabel.trim()) return;

		try {
			await onAddEvolution({
				fieldPath: evolutionFieldLabel.toLowerCase().replace(/\s+/g, '_'),
				fieldLabel: evolutionFieldLabel.trim(),
				beforeValue:
					evolutionChangeType !== 'add' ? JSON.stringify(evolutionBeforeValue.trim()) : undefined,
				afterValue:
					evolutionChangeType !== 'remove' ? JSON.stringify(evolutionAfterValue.trim()) : undefined,
				changeType: evolutionChangeType
			});
			// Reset form
			evolutionFieldLabel = '';
			evolutionBeforeValue = '';
			evolutionAfterValue = '';
			evolutionChangeType = 'update';
			showAddEvolution = false;
		} catch {
			// Error handled by parent
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-6 {className}">
	<!-- Header -->
	<div class="border-border border-b pb-4">
		<h2 class="text-lg font-semibold text-primary">
			{mode === 'create' ? 'Create Proposal' : 'Edit Proposal'}
		</h2>
		<p class="mt-1 text-sm text-secondary">
			Propose changes to <span class="font-medium">{entityName}</span>
			({entityType})
		</p>
	</div>

	<!-- Error message -->
	{#if error}
		<div class="bg-error/10 border-error/20 px-card-compact py-card-compact rounded-card border">
			<p class="text-sm text-error">{error}</p>
		</div>
	{/if}

	<!-- Title -->
	<FormInput
		label="Title"
		placeholder="Brief summary of your proposed change"
		bind:value={title}
		required
	/>

	<!-- Description -->
	<FormTextarea
		label="Description"
		placeholder="Explain why this change is needed and what problem it solves"
		bind:value={description}
		rows={4}
		required
	/>

	<!-- Evolutions section (only shown in edit mode or after initial create) -->
	{#if mode === 'edit' || evolutions.length > 0}
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<h3 class="text-sm font-medium text-primary">Proposed Changes</h3>
				{#if onAddEvolution}
					<Button variant="ghost" size="sm" onclick={() => (showAddEvolution = !showAddEvolution)}>
						<Icon name="plus" size="xs" />
						Add Change
					</Button>
				{/if}
			</div>

			<!-- Add evolution form -->
			{#if showAddEvolution && onAddEvolution}
				<div class="bg-surface-alt border-border p-card-compact space-y-3 rounded-card border">
					<FormInput
						label="Field Name"
						placeholder="e.g., Purpose, Name, Domain"
						bind:value={evolutionFieldLabel}
					/>

					<div class="flex gap-2">
						<label class="flex cursor-pointer items-center gap-1 text-sm">
							<input
								type="radio"
								name="changeType"
								value="update"
								checked={evolutionChangeType === 'update'}
								onchange={() => (evolutionChangeType = 'update')}
								class="accent-primary"
							/>
							Change
						</label>
						<label class="flex cursor-pointer items-center gap-1 text-sm">
							<input
								type="radio"
								name="changeType"
								value="add"
								checked={evolutionChangeType === 'add'}
								onchange={() => (evolutionChangeType = 'add')}
								class="accent-primary"
							/>
							Add
						</label>
						<label class="flex cursor-pointer items-center gap-1 text-sm">
							<input
								type="radio"
								name="changeType"
								value="remove"
								checked={evolutionChangeType === 'remove'}
								onchange={() => (evolutionChangeType = 'remove')}
								class="accent-primary"
							/>
							Remove
						</label>
					</div>

					{#if evolutionChangeType !== 'add'}
						<FormInput
							label="Current Value"
							placeholder="What it is now"
							bind:value={evolutionBeforeValue}
						/>
					{/if}

					{#if evolutionChangeType !== 'remove'}
						<FormInput
							label="New Value"
							placeholder="What it should be"
							bind:value={evolutionAfterValue}
						/>
					{/if}

					<div class="flex justify-end gap-2">
						<Button variant="ghost" size="sm" onclick={() => (showAddEvolution = false)}>
							Cancel
						</Button>
						<Button
							variant="primary"
							size="sm"
							onclick={handleAddEvolution}
							disabled={!evolutionFieldLabel.trim()}
						>
							Add
						</Button>
					</div>
				</div>
			{/if}

			<!-- Evolutions list -->
			<ProposalEvolutionList {evolutions} editable={mode === 'edit'} onRemove={onRemoveEvolution} />
		</div>
	{/if}

	<!-- Actions -->
	<div class="border-border flex justify-end gap-3 border-t pt-4">
		<Button variant="ghost" onclick={onCancel} disabled={isLoading}>Cancel</Button>
		<Button type="submit" variant="primary" disabled={!isValid || isLoading}>
			{#if isLoading}
				<Icon name="loader" size="sm" class="animate-spin" />
			{/if}
			{mode === 'create' ? 'Create Proposal' : 'Save Changes'}
		</Button>
	</div>
</form>
