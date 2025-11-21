<script lang="ts">
	/**
	 * Reusable Form Textarea Component
	 *
	 * Consistent textarea with label, using design tokens throughout.
	 * Ensures all textareas have the same styling across the app.
	 */

	type Props = {
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
</script>

<div class="flex flex-col gap-form-field">
	{#if label}
		<label for={inputId} class="text-small font-medium text-label-primary">
			{label}
			{#if required}
				<span class="text-accent-primary">*</span>
			{/if}
		</label>
	{/if}
	<textarea
		{id}
		{placeholder}
		{rows}
		{required}
		{disabled}
		bind:value
		class="resize-y rounded-input border border-base bg-input px-input-x py-input-y text-primary transition-all placeholder:text-tertiary focus:ring-2 focus:ring-accent-primary focus:outline-none {customClass}"
		>{value}</textarea
	>
</div>
