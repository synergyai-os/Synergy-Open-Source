<script lang="ts">
	import { Select } from 'bits-ui';
	import { formInputRecipe, type FormInputVariantProps } from '$lib/design-system/recipes';
	import Text from './Text.svelte';
	import Icon from './Icon.svelte';

	type Option = {
		value: string;
		label: string;
		disabled?: boolean;
	};

	type Props = FormInputVariantProps & {
		id?: string;
		name?: string;
		label?: string;
		placeholder?: string;
		value?: string;
		options: Option[];
		required?: boolean;
		disabled?: boolean;
		allowDeselect?: boolean;
		class?: string;
	};

	let {
		size = 'md',
		id,
		name,
		label,
		placeholder = '',
		value = $bindable(''),
		options,
		required = false,
		disabled = false,
		allowDeselect = false,
		class: customClass = ''
	}: Props = $props();

	// Generate ID if not provided
	const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

	// Apply recipe for trigger styling (same as input) with size variant
	// Add flex layout for proper text + icon alignment
	const triggerClasses = $derived([
		'flex items-center justify-between',
		formInputRecipe({ size }),
		customClass
	]);

	// Find selected option label
	const selectedLabel = $derived.by(() => {
		if (!value) return placeholder || 'Select an option';
		return options.find((opt) => opt.value === value)?.label || placeholder || 'Select an option';
	});

	// Handle value change
	function handleValueChange(newValue: string | undefined) {
		if (newValue === undefined && allowDeselect) {
			value = '';
		} else if (newValue !== undefined) {
			value = newValue;
		}
	}
</script>

<div class="gap-form-field-gap flex flex-col">
	{#if label}
		<label for={selectId}>
			<Text variant="body" size="sm" color="default" as="span" class="font-medium">
				{label}
				{#if required}
					<span class="text-brand">*</span>
				{/if}
			</Text>
		</label>
	{/if}
	<Select.Root
		type="single"
		bind:value
		onValueChange={handleValueChange}
		{disabled}
		{allowDeselect}
		items={options}
	>
		<Select.Trigger {id} {name} class={triggerClasses} aria-label={label || placeholder}>
			<span class="flex-1 truncate text-left" data-placeholder={!value}>{selectedLabel}</span>
			<div class="ml-fieldGroup flex-shrink-0">
				<Icon type="chevron-down" size="sm" color="tertiary" />
			</div>
		</Select.Trigger>
		<Select.Portal>
			<!--
				Select Content
				- z-50: Acceptable exception (z-index for dropdown overlay)
				- py-1: Acceptable exception (minimal dropdown container padding - 4px)
				- See missing-styles.md for documentation
			-->
			<Select.Content
				class="border-base z-50 min-w-[var(--bits-select-anchor-width)] rounded-modal border bg-elevated py-1 shadow-card"
				sideOffset={4}
			>
				<!--
					Select Viewport
					- p-1: Acceptable exception (minimal dropdown viewport padding - 4px)
					- See missing-styles.md for documentation
				-->
				<Select.Viewport class="p-1">
					{#each options as option (option.value)}
						<!--
							Select Item
							- data-disabled:opacity-50: Acceptable exception (Bits UI data attribute for disabled state)
							- See missing-styles.md for documentation
						-->
						<Select.Item
							value={option.value}
							label={option.label}
							disabled={option.disabled}
							class="text-body-sm flex cursor-pointer items-center gap-fieldGroup rounded-button px-button py-button text-primary transition-colors outline-none hover:bg-subtle focus:bg-subtle data-disabled:pointer-events-none data-disabled:opacity-50"
						>
							{#snippet children({ selected })}
								{option.label}
								{#if selected}
									<div class="ml-auto">
										<Icon type="check" size="sm" />
									</div>
								{/if}
							{/snippet}
						</Select.Item>
					{/each}
				</Select.Viewport>
			</Select.Content>
		</Select.Portal>
	</Select.Root>
</div>
