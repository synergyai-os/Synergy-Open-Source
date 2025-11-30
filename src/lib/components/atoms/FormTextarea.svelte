<script lang="ts">
	import { formTextareaRecipe, type FormTextareaVariantProps } from '$lib/design-system/recipes';
	import Text from './Text.svelte';

	type Props = FormTextareaVariantProps & {
		id?: string;
		label?: string;
		placeholder?: string;
		value?: string;
		rows?: number;
		required?: boolean;
		disabled?: boolean;
		class?: string; // Allow custom classes for specific cases
	};

	let {
		size = 'md',
		id,
		label,
		placeholder = '',
		value = $bindable(''),
		rows = 4,
		required = false,
		disabled = false,
		class: customClass = ''
	}: Props = $props();

	// Generate ID if not provided
	const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

	// Apply recipe with size variant and custom classes
	const textareaClasses = $derived([formTextareaRecipe({ size }), customClass]);
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
	<textarea {id} {placeholder} {rows} {required} {disabled} bind:value class={textareaClasses}
		>{value}</textarea
	>
</div>
