<script lang="ts">
	/**
	 * Reusable Form Input Component
	 *
	 * Consistent text input with label, using design tokens throughout.
	 * Ensures all form inputs have the same styling across the app.
	 */

	type Props = {
		id?: string;
		name?: string;
		label?: string;
		placeholder?: string;
		value?: string;
		type?: 'text' | 'email' | 'password' | 'url';
		required?: boolean;
		disabled?: boolean;
		autocomplete?: string;
		class?: string; // Allow custom classes for specific cases
	};

	let {
		id,
		name,
		label,
		placeholder = '',
		value = $bindable(''),
		type = 'text',
		required = false,
		disabled = false,
		autocomplete,
		class: customClass = ''
	}: Props = $props();

	// Generate ID if not provided
	const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
</script>

<div class="flex flex-col gap-form-field">
	{#if label}
		<label for={inputId} class="text-sm font-medium text-label-primary">
			{label}
			{#if required}
				<span class="text-accent-primary">*</span>
			{/if}
		</label>
	{/if}
	<input
		{id}
		{name}
		{type}
		{placeholder}
		{required}
		{disabled}
		autocomplete={(autocomplete as any) || undefined}
		bind:value
		class="rounded-input border border-base bg-input px-input-x py-input-y text-primary transition-all placeholder:text-tertiary focus:ring-2 focus:ring-accent-primary focus:outline-none {customClass}"
	/>
</div>
