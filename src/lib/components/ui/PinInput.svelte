<script lang="ts">
	/**
	 * PIN Input Component - 6-digit verification code input
	 *
	 * Wraps Bits UI PinInput with design tokens for consistent styling.
	 * Auto-submits when all 6 digits are entered.
	 */
	import { PinInput as PinInputPrimitive, REGEXP_ONLY_DIGITS } from 'bits-ui';

	type Props = {
		value?: string;
		label?: string;
		error?: string | null;
		disabled?: boolean;
		onComplete?: (value: string) => void;
	};

	let {
		value = $bindable(''),
		label,
		error = null,
		disabled = false,
		onComplete
	}: Props = $props();

	// Auto-submit when all 6 digits are entered
	$effect(() => {
		if (value.length === 6 && onComplete) {
			onComplete(value);
		}
	});

	const inputId = `pin-input-${Math.random().toString(36).substring(7)}`;
</script>

<div class="flex flex-col gap-form-field">
	{#if label}
		<label for={inputId} class="text-sm font-medium text-label-primary">
			{label}
		</label>
	{/if}

	<PinInputPrimitive.Root
		bind:value
		pattern={REGEXP_ONLY_DIGITS}
		{disabled}
		maxlength={6}
		id={inputId}
		class="gap-input-group flex justify-center"
		onpaste={(e) => {
			// Handle paste event to extract 6-digit codes from clipboard
			const pastedText = e.clipboardData?.getData('text');
			if (pastedText) {
				const sixDigitMatch = pastedText.match(/\b\d{6}\b/);
				if (sixDigitMatch) {
					e.preventDefault();
					value = sixDigitMatch[0];
					console.log('📋 Pasted 6-digit code from clipboard');
				}
			}
		}}
	>
		{#snippet children({ cells })}
			{#each cells as cell, index (index)}
				<PinInputPrimitive.Cell
					{cell}
					class="size-pin-cell rounded-input border-2 border-base bg-input text-center font-bold text-primary caret-accent-primary transition-all duration-200 placeholder:text-tertiary focus:border-accent-primary focus:shadow-pin-glow focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 {error
						? 'border-error'
						: ''}"
					style="font-size: var(--size-pin-cell-text); line-height: var(--size-pin-cell);"
				>
					<!-- Display the character in the cell -->
					{#if cell.char !== null}
						{cell.char}
					{/if}
					<!-- Show fake caret when cell is focused and empty -->
					{#if cell.hasFakeCaret}
						<div class="animate-pulse">|</div>
					{/if}
				</PinInputPrimitive.Cell>
			{/each}
		{/snippet}
	</PinInputPrimitive.Root>

	{#if error}
		<p class="text-sm text-error">{error}</p>
	{/if}
</div>
