<script lang="ts">
	import { Combobox as BitsCombobox } from 'bits-ui';
	import {
		comboboxTriggerRecipe,
		comboboxInputRecipe,
		comboboxContentRecipe,
		comboboxViewportRecipe,
		comboboxItemRecipe
	} from '$lib/design-system/recipes';
	import Text from './Text.svelte';
	import Icon from './Icon.svelte';

	type Option = {
		value: string;
		label: string;
		disabled?: boolean;
	};

	type Props = {
		id?: string;
		name?: string;
		label?: string;
		placeholder?: string;
		value?: string;
		options: Option[];
		required?: boolean;
		disabled?: boolean;
		allowDeselect?: boolean;
		showLabel?: boolean; // Variant: with or without label
		class?: string;
		maxHeight?: string; // Max height for dropdown (default: 20rem / ~320px, shows ~5-7 items)
	};

	let {
		id,
		name,
		label,
		placeholder = '',
		value = $bindable(''),
		options,
		required = false,
		disabled = false,
		allowDeselect = false,
		showLabel = true,
		class: customClass = '',
		maxHeight = '14rem' // Default: ~224px, shows ~4-5 items (30% smaller than original)
	}: Props = $props();

	// Generate ID if not provided
	const comboboxId = id || `combobox-${Math.random().toString(36).substr(2, 9)}`;

	// Combobox open state - controls dropdown visibility
	let open = $state(false);

	// Search/filter state
	let searchValue = $state('');

	// Filter options based on search
	const filteredOptions = $derived.by(() => {
		if (searchValue === '') return options;
		const searchLower = searchValue.toLowerCase();
		return options.filter((opt) => opt.label.toLowerCase().includes(searchLower));
	});

	// Find selected option label for display
	const selectedLabel = $derived.by(() => {
		if (!value) return placeholder || 'Select an option';
		return options.find((opt) => opt.value === value)?.label || placeholder || 'Select an option';
	});

	// Handle value change
	function handleValueChange(newValue: string | undefined) {
		if (newValue === undefined && allowDeselect) {
			value = '';
			searchValue = '';
		} else if (newValue !== undefined) {
			value = newValue;
			// Clear search when item is selected so Input shows selected label in placeholder
			searchValue = '';
		}
	}

	// Handle combobox open/close to reset search
	function handleOpenChangeComplete(isOpen: boolean) {
		if (!isOpen) {
			searchValue = '';
		}
	}

	// Handle input change for search
	function handleInputChange(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		searchValue = target.value;
		// Open combobox when user starts typing
		if (!open) {
			open = true;
		}
	}

	// Handle input click/focus to open combobox
	function handleInputClick() {
		if (!open) {
			open = true;
		}
	}

	function handleInputFocus() {
		if (!open) {
			open = true;
		}
	}

	// Recipe classes
	const inputClasses = $derived([comboboxInputRecipe(), customClass]);
	const contentClasses = $derived(comboboxContentRecipe());
	const viewportClasses = $derived(comboboxViewportRecipe());
</script>

<div class="flex flex-col gap-fieldGroup">
	{#if showLabel && label}
		<label for={comboboxId}>
			<Text variant="body" size="sm" color="default" as="span" class="font-medium">
				{label}
				{#if required}
					<span class="text-brand">*</span>
				{/if}
			</Text>
		</label>
	{/if}
	<BitsCombobox.Root
		type="single"
		bind:value
		bind:open
		onValueChange={handleValueChange}
		onOpenChangeComplete={handleOpenChangeComplete}
		{disabled}
		{allowDeselect}
		items={filteredOptions}
	>
		<div class="relative flex items-center">
			<BitsCombobox.Input
				{id}
				{name}
				bind:value={searchValue}
				oninput={handleInputChange}
				onclick={handleInputClick}
				onfocus={handleInputFocus}
				class={inputClasses}
				placeholder={selectedLabel}
				aria-label={label || placeholder || 'Search options'}
			/>
			<BitsCombobox.Trigger
				class="absolute flex-shrink-0"
				style="inset-inline-end: var(--spacing-input-x);"
				aria-label="Toggle dropdown"
			>
				<Icon type="chevron-down" size="sm" color="tertiary" />
			</BitsCombobox.Trigger>
		</div>
		<BitsCombobox.Portal>
			<BitsCombobox.Content
				class={contentClasses}
				sideOffset={4}
				side="bottom"
				align="start"
				collisionPadding={8}
			>
				<!--
					Dropdown Background Gradient
					- Uses brand hue (195) at 5% opacity for subtle depth
					- Matches login page aesthetic but more subtle for smaller surface
					- Radial gradient positioned at top center for natural light feel
				-->
				<div
					class="pointer-events-none absolute inset-0 bg-radial-[at_50%_0%] from-[oklch(55%_0.12_195_/_0.05)] via-[oklch(55%_0.06_195_/_0.02)] to-transparent"
					aria-hidden="true"
				></div>
				<div class="relative">
					<BitsCombobox.Viewport
						class={viewportClasses}
						style="max-height: {maxHeight}; overflow-y: auto;"
					>
						{#each filteredOptions as option (option.value)}
							<BitsCombobox.Item
								value={option.value}
								label={option.label}
								disabled={option.disabled}
								class={comboboxItemRecipe({ disabled: option.disabled })}
							>
								{#snippet children({ selected })}
									{option.label}
									{#if selected}
										<div class="ml-auto">
											<Icon type="check" size="sm" />
										</div>
									{/if}
								{/snippet}
							</BitsCombobox.Item>
						{:else}
							<Text variant="body" size="sm" color="tertiary" as="div" class="px-button py-button">
								No results found
							</Text>
						{/each}
					</BitsCombobox.Viewport>
				</div>
			</BitsCombobox.Content>
		</BitsCombobox.Portal>
	</BitsCombobox.Root>
</div>
