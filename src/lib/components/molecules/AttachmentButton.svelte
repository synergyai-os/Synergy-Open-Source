<script lang="ts">
	/**
	 * Attachment Button Component (Linear-style)
	 *
	 * Atomic component for file attachments
	 * Follows pattern: ui-patterns.md#L680 (Atomic Design)
	 */

	type Props = {
		count?: number;
		onClick?: () => void;
		disabled?: boolean;
	};

	let { count = 0, onClick, disabled = false }: Props = $props();
</script>

<button
	type="button"
	class="inline-flex items-center gap-icon-wide rounded-button px-section py-section text-tertiary transition-colors hover:bg-hover-solid"
	{disabled}
	onclick={() => !disabled && onClick?.()}
	aria-label="Attach files"
>
	<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
		/>
	</svg>
	{#if count > 0}
		<span class="text-label font-medium">{count}</span>
	{/if}
</button>
