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
	 * DESIGN SYSTEM EXCEPTION: SVG/D3 Visualization (SYOS-522)
	 *
	 * This component uses SVG with hardcoded pixel dimensions because:
	 * 1. CSS-based sizing (recipes/utility classes) unreliable for SVG in some browsers
	 * 2. Requires explicit HTML width/height attributes
	 * 3. Token mapping via JavaScript computed styles (where dynamic needed)
	 *
	 * Approved exception - see dev-docs/2-areas/patterns/recipe-system.md (SVG Exception Pattern)
	 */
	interface Props {
		message?: string;
		size?: 'sm' | 'md' | 'lg';
		fullHeight?: boolean;
	}

	let { message = 'Loading...', size = 'md', fullHeight = false }: Props = $props();

	// Map size to explicit pixel dimensions for SVG (doubled from design tokens for visibility)
	// SVG elements require explicit pixel values - CSS custom properties don't work reliably
	// Exception: Hardcoded values allowed for SVG sizing
	// Base sizes: xs=12px, sm=16px, md=20px → Doubled: sm=24px, md=32px, lg=40px
	const sizeStyle = $derived(
		size === 'sm'
			? 'width: 24px; height: 24px;' // 2x --size-icon-xs (12px)
			: size === 'lg'
				? 'width: 40px; height: 40px;' // 2x --size-icon-md (20px)
				: 'width: 32px; height: 32px;' // 2x --size-icon-sm (16px) - md default
	);
</script>

{#if fullHeight}
	<div class="flex h-full w-full items-center justify-center">
		<div class="flex flex-col items-center gap-2">
			<!-- Loading Spinner -->
			<svg
				class="text-accent-primary animate-spin"
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
	<div class="flex flex-col items-center gap-2" style="padding-block: var(--spacing-8);">
		<!-- Loading Spinner -->
		<svg
			class="text-accent-primary animate-spin"
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
