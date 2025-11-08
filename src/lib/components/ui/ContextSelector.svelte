<script lang="ts">
	/**
	 * Context Selector Component (Linear-style PAI/Template)
	 * 
	 * Atomic component for selecting context/template/team
	 * Follows pattern: ui-patterns.md#L680 (Atomic Design)
	 */
	
	type Context = {
		id: string;
		name: string;
		icon: string;
		type: 'team' | 'template' | 'workspace';
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
	class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-transparent border border-base hover:bg-hover transition-colors text-secondary"
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
	<svg class="w-3 h-3 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
	</svg>
</button>

