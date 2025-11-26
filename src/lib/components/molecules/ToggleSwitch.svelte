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
		<span class="text-button text-secondary">{label}</span>
	{/if}
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		aria-label={label || 'Toggle'}
		{disabled}
		class="relative inline-flex h-6 w-11 items-center rounded-avatar transition-colors {checked
			? 'bg-accent-primary'
			: 'bg-toggle-off'} {disabled ? 'cursor-not-allowed opacity-50' : ''}"
		onclick={() => !disabled && onChange?.(!checked)}
	>
		<span
			class="inline-block icon-sm transform rounded-avatar bg-elevated transition-transform {checked
				? 'translate-x-6'
				: 'translate-x-1'}"
		></span>
	</button>
</label>
