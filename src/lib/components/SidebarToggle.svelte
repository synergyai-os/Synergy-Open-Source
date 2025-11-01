<script lang="ts">
	interface Props {
		sidebarCollapsed: boolean;
		onToggle: () => void;
		isMobile?: boolean;
	}

	let { sidebarCollapsed, onToggle, isMobile = false }: Props = $props();
</script>

<button
	type="button"
	class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-hover-solid transition-colors text-secondary hover:text-primary"
	onclick={onToggle}
	aria-label={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
	title={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
>
	{#if sidebarCollapsed}
		<!-- Hamburger icon (when collapsed - click to open) -->
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 6h16M4 12h16M4 18h16"
			/>
		</svg>
	{:else}
		<!-- Chevron left icon (when expanded - click to close) -->
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 19l-7-7 7-7"
			/>
		</svg>
	{/if}
</button>

