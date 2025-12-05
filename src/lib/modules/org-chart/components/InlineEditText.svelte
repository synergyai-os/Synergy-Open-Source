<script lang="ts">
	import { browser } from '$app/environment';
	import { formInputRecipe, formTextareaRecipe } from '$lib/design-system/recipes';
	import { toast } from '$lib/utils/toast';
	import Text from '$lib/components/atoms/Text.svelte';

	type Props = {
		value: string;
		onSave: (newValue: string) => Promise<void>;
		multiline?: boolean;
		placeholder?: string;
		maxRows?: number;
		disabled?: boolean;
		className?: string;
		size?: 'sm' | 'md' | 'lg';
	};

	let {
		value,
		onSave,
		multiline = false,
		placeholder = '',
		maxRows = 4,
		disabled = false,
		className = '',
		size = 'md'
	}: Props = $props();

	let isEditing = $state(false);
	let editValue = $state(value);
	let isSaving = $state(false);
	let inputRef: HTMLInputElement | HTMLTextAreaElement | null = $state(null);

	// Sync external value changes
	$effect(() => {
		if (!isEditing) {
			editValue = value;
		}
	});

	// Focus input when entering edit mode
	$effect(() => {
		if (isEditing && browser && inputRef) {
			inputRef.focus();
			// Select all text for single-line inputs
			if (!multiline && inputRef instanceof HTMLInputElement) {
				inputRef.select();
			}
		}
	});

	async function handleSave() {
		if (editValue.trim() === value.trim() || isSaving) {
			isEditing = false;
			return;
		}

		try {
			isSaving = true;
			await onSave(editValue.trim());
			isEditing = false;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to save changes';
			toast.error(message);
			// Keep editing mode open on error so user can retry
		} finally {
			isSaving = false;
		}
	}

	function handleCancel() {
		editValue = value; // Reset to original value
		isEditing = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !multiline) {
			e.preventDefault();
			handleSave();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			handleCancel();
		}
	}

	function handleBlur() {
		// Small delay to allow click events (like save button) to fire first
		setTimeout(() => {
			if (!isSaving) {
				handleSave();
			}
		}, 200);
	}

	const inputClasses = $derived(
		multiline ? formTextareaRecipe({ size }) : formInputRecipe({ size })
	);
	const displayClasses = $derived([
		'cursor-text hover:bg-surface-hover rounded-button px-button py-button transition-colors',
		disabled ? 'cursor-not-allowed opacity-60' : '',
		className
	]);
</script>

{#if isEditing && !disabled}
	<div class="relative">
		{#if multiline}
			<textarea
				bind:this={inputRef}
				bind:value={editValue}
				{placeholder}
				rows={maxRows}
				onkeydown={handleKeydown}
				onblur={handleBlur}
				disabled={isSaving}
				class={inputClasses}
			/>
		{:else}
			<input
				bind:this={inputRef}
				type="text"
				bind:value={editValue}
				{placeholder}
				onkeydown={handleKeydown}
				onblur={handleBlur}
				disabled={isSaving}
				class={inputClasses}
			/>
		{/if}
		{#if isSaving}
			<div class="absolute top-2 right-2 text-xs text-secondary">Saving...</div>
		{/if}
	</div>
{:else}
	<div
		class={displayClasses}
		data-inline-edit="true"
		onclick={() => {
			if (!disabled) {
				isEditing = true;
			}
		}}
		role="button"
		tabindex="0"
		onkeydown={(e) => {
			if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
				e.preventDefault();
				isEditing = true;
			}
		}}
		title={disabled ? undefined : 'Click to edit'}
	>
		{#if value || placeholder}
			<Text variant="body" {size} color="default">
				{value || placeholder}
			</Text>
		{:else}
			<Text variant="body" {size} color="tertiary">
				{placeholder || 'Click to edit'}
			</Text>
		{/if}
	</div>
{/if}
