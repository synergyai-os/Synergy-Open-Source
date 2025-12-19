<script lang="ts">
	/**
	 * CustomFieldSection - Renders a custom field with its header and value(s)
	 *
	 * This is a reusable molecule component for displaying and editing custom fields.
	 * It handles different field types (text, longText, textList) automatically.
	 *
	 * @see architecture.md → "Frontend Patterns" → "Components"
	 */

	import { browser } from '$app/environment';
	import type { CustomFieldWithValue } from '$lib/composables/useCustomFields.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import Icon from '$lib/components/atoms/Icon.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
	import * as Tooltip from '$lib/components/atoms/Tooltip.svelte';
	import {
		tooltipContentRecipe,
		formInputRecipe,
		formTextareaRecipe
	} from '$lib/design-system/recipes';

	type Props = {
		field: CustomFieldWithValue;
		canEdit: boolean;
		editReason?: string;
		onSave: (value: unknown) => Promise<void>;
		onDelete: () => Promise<void>;
		placeholder?: string;
	};

	let { field, canEdit, editReason, onSave, onDelete, placeholder }: Props = $props();

	// Field type helpers
	const isTextList = $derived(field.definition.fieldType === 'textList');
	const isLongText = $derived(field.definition.fieldType === 'longText');

	// Get values based on field type
	const listItems = $derived<string[]>(
		isTextList && Array.isArray(field.parsedValue) ? (field.parsedValue as string[]) : []
	);
	const singleValue = $derived<string>(
		!isTextList && typeof field.parsedValue === 'string' ? field.parsedValue : ''
	);
	const isEmpty = $derived(isTextList ? listItems.length === 0 : !singleValue);

	// Default placeholder based on field name
	const effectivePlaceholder = $derived(
		placeholder ?? `Add ${field.definition.name.toLowerCase()}`
	);

	// Get singular form of field name for "Add X" button
	const singularName = $derived.by(() => {
		const name = field.definition.name;
		if (name === 'Accountabilities') return 'Accountability';
		if (name === 'Decision Rights') return 'Decision Right';
		if (name.endsWith('ies')) return name.slice(0, -3) + 'y';
		if (name.endsWith('s')) return name.slice(0, -1);
		return name;
	});

	// Edit states for single value
	let isEditingSingle = $state(false);
	let editSingleValue = $state('');
	let isSaving = $state(false);
	let singleInputRef: HTMLInputElement | HTMLTextAreaElement | null = $state(null);

	// Edit states for list
	let isAdding = $state(false);
	let addingValue = $state('');
	let addingInputRef: HTMLInputElement | null = $state(null);
	let editingIndex = $state<number | null>(null);
	let editingItemValue = $state('');
	let editingItemRef: HTMLInputElement | null = $state(null);

	// Sync edit value when not editing
	$effect(() => {
		if (!isEditingSingle) {
			editSingleValue = singleValue;
		}
	});

	// Focus single input when editing
	$effect(() => {
		if (isEditingSingle && browser && singleInputRef) {
			singleInputRef.focus();
			if (!isLongText && singleInputRef instanceof HTMLInputElement) {
				singleInputRef.select();
			}
		}
	});

	// Focus add input
	$effect(() => {
		if (isAdding && browser && addingInputRef) {
			addingInputRef.focus();
		}
	});

	// Focus editing item input
	$effect(() => {
		if (editingIndex !== null && browser && editingItemRef) {
			editingItemRef.focus();
			editingItemRef.select();
		}
	});

	// Single value handlers
	async function handleSingleSave() {
		if (editSingleValue.trim() === singleValue.trim() || isSaving) {
			isEditingSingle = false;
			return;
		}
		try {
			isSaving = true;
			if (!editSingleValue.trim()) {
				await onDelete();
			} else {
				await onSave(editSingleValue.trim());
			}
			isEditingSingle = false;
		} catch {
			// Keep editing mode open on error
		} finally {
			isSaving = false;
		}
	}

	function handleSingleCancel() {
		editSingleValue = singleValue;
		isEditingSingle = false;
	}

	function handleSingleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !isLongText) {
			e.preventDefault();
			handleSingleSave();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			handleSingleCancel();
		}
	}

	function handleSingleBlur() {
		setTimeout(() => {
			if (!isSaving) handleSingleSave();
		}, 200);
	}

	// List handlers
	async function handleAddItem() {
		if (!addingValue.trim()) {
			isAdding = false;
			addingValue = '';
			return;
		}
		try {
			isSaving = true;
			const newItems = [...listItems, addingValue.trim()];
			await onSave(newItems);
			isAdding = false;
			addingValue = '';
		} catch {
			// Keep input open on error
		} finally {
			isSaving = false;
		}
	}

	function startEditingItem(index: number) {
		editingIndex = index;
		editingItemValue = listItems[index];
	}

	async function handleSaveItem() {
		if (editingIndex === null) return;
		const trimmed = editingItemValue.trim();
		const original = listItems[editingIndex];

		if (trimmed === original) {
			editingIndex = null;
			editingItemValue = '';
			return;
		}

		try {
			isSaving = true;
			if (!trimmed) {
				// Delete if empty
				const updatedItems = listItems.filter((_, i) => i !== editingIndex);
				if (updatedItems.length === 0) {
					await onDelete();
				} else {
					await onSave(updatedItems);
				}
			} else {
				// Update item
				const updatedItems = [...listItems];
				updatedItems[editingIndex] = trimmed;
				await onSave(updatedItems);
			}
			editingIndex = null;
			editingItemValue = '';
		} catch {
			// Keep editing on error
		} finally {
			isSaving = false;
		}
	}

	async function handleDeleteItem(index: number) {
		try {
			isSaving = true;
			const updatedItems = listItems.filter((_, i) => i !== index);
			if (updatedItems.length === 0) {
				await onDelete();
			} else {
				await onSave(updatedItems);
			}
		} finally {
			isSaving = false;
		}
	}

	function handleAddingKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleAddItem();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			isAdding = false;
			addingValue = '';
		}
	}

	function handleAddingBlur() {
		setTimeout(() => handleAddItem(), 200);
	}

	function handleEditingItemKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSaveItem();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			editingIndex = null;
			editingItemValue = '';
		}
	}

	function handleEditingItemBlur() {
		setTimeout(() => {
			if (!isSaving && editingIndex !== null) handleSaveItem();
		}, 200);
	}

	const inputClasses = $derived(formInputRecipe({ size: 'md' }));
	const textareaClasses = $derived(formTextareaRecipe({ size: 'md' }));
</script>

<div>
	<h4 class="text-button text-tertiary mb-header font-medium tracking-wide uppercase">
		{field.definition.name}
	</h4>

	{#if isTextList}
		<!-- Multi-value field (Domains, Accountabilities, etc.) -->
		<div class="space-y-2">
			{#if isEmpty}
				{#if canEdit}
					{#if isAdding}
						<input
							bind:this={addingInputRef}
							bind:value={addingValue}
							placeholder={effectivePlaceholder}
							onkeydown={handleAddingKeydown}
							onblur={handleAddingBlur}
							class={inputClasses}
						/>
					{:else}
						<Button variant="ghost" size="sm" onclick={() => (isAdding = true)}>
							<span class="gap-button flex items-center">
								<Icon type="plus" size="sm" />
								<span>Add {singularName}</span>
							</span>
						</Button>
					{/if}
				{:else if editReason}
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger>
								<Text variant="body" size="md" color="tertiary">
									No {field.definition.name.toLowerCase()} set
								</Text>
							</Tooltip.Trigger>
							<Tooltip.Portal>
								<Tooltip.Content class={tooltipContentRecipe()}>
									<p class="text-primary text-sm">{editReason}</p>
								</Tooltip.Content>
							</Tooltip.Portal>
						</Tooltip.Root>
					</Tooltip.Provider>
				{:else}
					<Text variant="body" size="md" color="tertiary">
						No {field.definition.name.toLowerCase()} set
					</Text>
				{/if}
			{:else}
				{#each listItems as item, index (index)}
					<div class="gap-button flex items-start">
						<div class="flex-1">
							{#if canEdit && editingIndex === index}
								<input
									bind:this={editingItemRef}
									bind:value={editingItemValue}
									placeholder={effectivePlaceholder}
									onkeydown={handleEditingItemKeydown}
									onblur={handleEditingItemBlur}
									class={inputClasses}
								/>
							{:else if canEdit}
								<div
									class="hover:bg-surface-hover rounded-button px-button py-button cursor-text transition-colors"
									onclick={() => startEditingItem(index)}
									role="button"
									tabindex="0"
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											startEditingItem(index);
										}
									}}
									title="Click to edit"
								>
									<Text variant="body" size="md" color="default">{item}</Text>
								</div>
							{:else if editReason}
								<Tooltip.Provider>
									<Tooltip.Root>
										<Tooltip.Trigger>
											<Text variant="body" size="md" color="default">{item}</Text>
										</Tooltip.Trigger>
										<Tooltip.Portal>
											<Tooltip.Content class={tooltipContentRecipe()}>
												<p class="text-primary text-sm">{editReason}</p>
											</Tooltip.Content>
										</Tooltip.Portal>
									</Tooltip.Root>
								</Tooltip.Provider>
							{:else}
								<Text variant="body" size="md" color="default">{item}</Text>
							{/if}
						</div>
						{#if canEdit}
							<Button
								variant="ghost"
								size="sm"
								iconOnly
								onclick={() => handleDeleteItem(index)}
								ariaLabel="Delete {singularName}"
								class="hover:bg-error-hover text-error"
							>
								<Icon type="trash" size="sm" />
							</Button>
						{/if}
					</div>
				{/each}
				{#if canEdit}
					{#if isAdding}
						<input
							bind:this={addingInputRef}
							bind:value={addingValue}
							placeholder={effectivePlaceholder}
							onkeydown={handleAddingKeydown}
							onblur={handleAddingBlur}
							class={inputClasses}
						/>
					{:else}
						<Button variant="ghost" size="sm" onclick={() => (isAdding = true)}>
							<span class="gap-button flex items-center">
								<Icon type="plus" size="sm" />
								<span>Add {singularName}</span>
							</span>
						</Button>
					{/if}
				{/if}
			{/if}
		</div>
	{:else}
		<!-- Single value field (Purpose, Notes, etc.) -->
		{#if isEditingSingle && canEdit}
			<div class="relative">
				{#if isLongText}
					<textarea
						bind:this={singleInputRef}
						bind:value={editSingleValue}
						placeholder={effectivePlaceholder}
						rows={4}
						onkeydown={handleSingleKeydown}
						onblur={handleSingleBlur}
						disabled={isSaving}
						class={textareaClasses}
					></textarea>
				{:else}
					<input
						bind:this={singleInputRef}
						type="text"
						bind:value={editSingleValue}
						placeholder={effectivePlaceholder}
						onkeydown={handleSingleKeydown}
						onblur={handleSingleBlur}
						disabled={isSaving}
						class={inputClasses}
					/>
				{/if}
				{#if isSaving}
					<div class="text-secondary absolute top-2 right-2 text-xs">Saving...</div>
				{/if}
			</div>
		{:else if canEdit}
			<div
				class="hover:bg-surface-hover rounded-button px-button py-button cursor-text transition-colors"
				onclick={() => (isEditingSingle = true)}
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						isEditingSingle = true;
					}
				}}
				title="Click to edit"
			>
				{#if singleValue}
					<Text variant="body" size="md" color="default">
						{singleValue}
					</Text>
				{:else}
					<Text variant="body" size="md" color="tertiary">
						{effectivePlaceholder}
					</Text>
				{/if}
			</div>
		{:else if editReason}
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<p class="text-button text-secondary leading-relaxed break-words">
							{singleValue || `No ${field.definition.name.toLowerCase()} set`}
						</p>
					</Tooltip.Trigger>
					<Tooltip.Portal>
						<Tooltip.Content class={tooltipContentRecipe()}>
							<p class="text-primary text-sm">{editReason}</p>
						</Tooltip.Content>
					</Tooltip.Portal>
				</Tooltip.Root>
			</Tooltip.Provider>
		{:else}
			<p class="text-button text-secondary leading-relaxed break-words">
				{singleValue || `No ${field.definition.name.toLowerCase()} set`}
			</p>
		{/if}
	{/if}
</div>
