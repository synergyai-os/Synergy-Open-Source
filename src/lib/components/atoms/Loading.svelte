<script lang="ts">
	/**
	 * Loading Component
	 *
	 * Unified loading state component with size variants.
	 * Use this component throughout the app for consistent loading states.
	 *
	 * Props:
	 * - message: Optional custom loading message (default: "Loading...")
	 * - size: Spinner size - 'sm' | 'md' | 'lg' (default: 'md')
	 * - fullHeight: Whether to take full height of container (default: false)
	 *
	 * Note: Uses manual style mapping for SVG sizing due to browser CSS limitations.
	 * CVA recipe system doesn't work reliably for SVG elements.
	 */
	interface Props {
		message?: string;
		size?: 'sm' | 'md' | 'lg';
		fullHeight?: boolean;
	}

	let { message = 'Loading...', size = 'md', fullHeight = false }: Props = $props();

	// Map size to CSS custom properties for SVG dimensions
	// SVG elements need explicit width/height via style attribute for reliable cross-browser sizing
	// sm: 12px (icon-xs), md: 16px (icon-sm - default), lg: 20px (icon-md)
	const sizeStyle = $derived(
		size === 'sm'
			? 'width: var(--size-icon-xs); height: var(--size-icon-xs);' // 12px
			: size === 'lg'
				? 'width: var(--size-icon-md); height: var(--size-icon-md);' // 20px
				: 'width: var(--size-icon-sm); height: var(--size-icon-sm);' // 16px (md - default)
	);
</script>

{#if fullHeight}
	<div class="flex h-full w-full items-center justify-center">
		<div class="flex flex-col items-center gap-icon">
			<!-- Loading Spinner -->
			<svg
				class="animate-spin text-accent-primary"
				style={sizeStyle}
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
				/>
			</svg>
			<!-- Loading Message -->
			{#if message}
				<p class="text-button font-medium text-secondary">{message}</p>
			{/if}
		</div>
	</div>
{:else}
	<div class="flex flex-col items-center gap-icon py-readable-quote">
		<!-- Loading Spinner -->
		<svg
			class="animate-spin text-accent-primary"
			style={sizeStyle}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
			/>
		</svg>
		<!-- Loading Message -->
		{#if message}
			<p class="text-button font-medium text-secondary">{message}</p>
		{/if}
	</div>
{/if}
