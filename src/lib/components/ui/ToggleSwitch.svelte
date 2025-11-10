<script lang="ts">
	/**
	 * Toggle Switch Component (Linear-style)
	 *
	 * Atomic component for on/off switches
	 * Follows pattern: ui-patterns.md#L680 (Atomic Design)
	 */

	type Props = {
		checked: boolean;
		onChange?: (checked: boolean) => void;
		label?: string;
		disabled?: boolean;
	};

	let { checked = false, onChange, label, disabled = false }: Props = $props();
</script>

<label class="inline-flex cursor-pointer items-center gap-2">
	{#if label}
		<span class="text-sm text-secondary">{label}</span>
	{/if}
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		aria-label={label || 'Toggle'}
		{disabled}
		class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors {checked
			? 'bg-accent-primary'
			: 'bg-base'} {disabled ? 'cursor-not-allowed opacity-50' : ''}"
		onclick={() => !disabled && onChange?.(!checked)}
	>
		<span
			class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {checked
				? 'translate-x-5'
				: 'translate-x-0.5'}"
		></span>
	</button>
</label>
