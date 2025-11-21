<script lang="ts">
	/**
	 * Context Selector Component (Linear-style PAI/Template)
	 *
	 * Atomic component for selecting context/template/circle
	 * Follows pattern: ui-patterns.md#L680 (Atomic Design)
	 */

	type Context = {
		id: string;
		name: string;
		icon: string;
		type: 'circle' | 'template' | 'workspace';
	};

	type Props = {
		context?: Context;
		onChange?: (context: Context | undefined) => void;
		readonly?: boolean;
		tabIndex?: number; // Control focus order
	};

	let { context, onChange, readonly = false, tabIndex }: Props = $props();
</script>

<button
	type="button"
	class="inline-flex items-center gap-icon-wide rounded-button border border-base bg-transparent px-menu-item py-section text-button font-medium text-secondary transition-colors hover:bg-hover"
	disabled={readonly}
	onclick={() => !readonly && onChange?.(context)}
	tabindex={tabIndex}
>
	{#if context}
		<span class="text-base leading-none">{context.icon}</span>
		<span>{context.name}</span>
	{:else}
		<span class="text-tertiary">Select context</span>
	{/if}
	<svg class="icon-xs text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
	</svg>
</button>
