<script lang="ts">
	import type { FullAutoFill } from 'svelte/elements';
	import { formInputRecipe, type FormInputVariantProps } from '$lib/design-system/recipes';
	import Text from './Text.svelte';

	type Props = FormInputVariantProps & {
		id?: string;
		name?: string;
		label?: string;
		placeholder?: string;
		value?: string;
		type?: 'text' | 'email' | 'password' | 'url' | 'date' | 'time' | 'number';
		required?: boolean;
		disabled?: boolean;
		autocomplete?: FullAutoFill | null | undefined;
		min?: string | number;
		max?: string | number;
		class?: string; // Allow custom classes for specific cases
		onkeydown?: ((e: KeyboardEvent) => void) | undefined;
	};

	let {
		size = 'md',
		id,
		name,
		label,
		placeholder = '',
		value = $bindable(''),
		type = 'text',
		required = false,
		disabled = false,
		autocomplete,
		min,
		max,
		class: customClass = '',
		onkeydown
	}: Props = $props();

	// Generate ID if not provided
	const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

	// Apply recipe with size variant and custom classes
	const inputClasses = $derived([formInputRecipe({ size }), customClass]);
</script>

<div class="flex flex-col gap-2">
	{#if label}
		<label for={inputId}>
			<Text variant="body" size="sm" color="default" as="span" class="font-medium">
				{label}
				{#if required}
					<span class="text-brand">*</span>
				{/if}
			</Text>
		</label>
	{/if}
	<input
		{id}
		{name}
		{type}
		{placeholder}
		{required}
		{disabled}
		autocomplete={autocomplete ?? undefined}
		{min}
		{max}
		bind:value
		{onkeydown}
		class={inputClasses}
	/>
</div>
