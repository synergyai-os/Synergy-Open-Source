<script lang="ts">
	/**
	 * PIN Input Component - 6-digit verification code input
	 *
	 * Wraps Bits UI PinInput with design tokens for consistent styling.
	 * Auto-submits when all 6 digits are entered.
	 * Uses Recipe System (CVA) for type-safe variant management.
	 * See: src/lib/design-system/recipes/pinInput.recipe.ts
	 */
	import { PinInput as PinInputPrimitive, REGEXP_ONLY_DIGITS } from 'bits-ui';
	import {
		pinInputRootRecipe,
		pinInputCellRecipe,
		pinInputLabelRecipe,
		pinInputErrorRecipe
	} from '$lib/design-system/recipes';

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

	// Apply recipes for styling
	const rootClasses = $derived(pinInputRootRecipe());
	const cellClasses = $derived(pinInputCellRecipe({ error: !!error }));
	const labelClasses = $derived(pinInputLabelRecipe());
	const errorClasses = $derived(pinInputErrorRecipe());
</script>

<div class="gap-form flex flex-col">
	{#if label}
		<label for={inputId} class={labelClasses}>
			{label}
		</label>
	{/if}

	<PinInputPrimitive.Root
		bind:value
		pattern={REGEXP_ONLY_DIGITS}
		{disabled}
		maxlength={6}
		id={inputId}
		class={rootClasses}
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
					data-testid="pin-input-cell-{index}"
					class={cellClasses}
					style="width: 4rem; height: 4rem; font-size: 2rem;"
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
		<p class={errorClasses}>{error}</p>
	{/if}
</div>
