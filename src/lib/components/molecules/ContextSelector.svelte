<script lang="ts">
	/**
	 * Context Selector Component (Linear-style PAI/Template)
	 *
	 * Atomic component for selecting context/template/circle
	 * Follows pattern: ui-patterns.md#L680 (Atomic Design)
	 *
	 * DESIGN SYSTEM EXCEPTION: Menu item spacing and typography (SYOS-585)
	 *
	 * Menu items use non-standard spacing and typography values:
	 * - spacing.menu.item.x = 0.625rem (10px) - optimal for menu item padding
	 * - typography.fontSize.button = 0.875rem (14px) - button text size
	 *
	 * These values are hardcoded because they don't reference base tokens.
	 * See: dev-docs/2-areas/design/token-file-split-exception-mapping.md
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
	class="gap-2-wide border-base inline-flex items-center rounded-button border bg-transparent px-[0.625rem] py-1 text-[0.875rem] font-medium text-secondary transition-colors hover:bg-hover"
	disabled={readonly}
	onclick={() => !readonly && onChange?.(context)}
	tabindex={tabIndex}
>
	{#if context}
		<span class="text-body leading-none">{context.icon}</span>
		<span>{context.name}</span>
	{:else}
		<span class="text-tertiary">Select context</span>
	{/if}
	<svg class="icon-xs text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
	</svg>
</button>
