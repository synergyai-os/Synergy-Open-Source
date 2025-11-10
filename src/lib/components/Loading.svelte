<script lang="ts">
	/**
	 * Loading Component
	 *
	 * Unified loading state component that uses design tokens.
	 * Use this component throughout the app for consistent loading states.
	 *
	 * Props:
	 * - message: Optional custom loading message (default: "Loading...")
	 * - size: Spinner size - 'sm' | 'md' | 'lg' (default: 'md')
	 * - fullHeight: Whether to take full height of container (default: false)
	 */
	interface Props {
		message?: string;
		size?: 'sm' | 'md' | 'lg';
		fullHeight?: boolean;
	}

	let { message = 'Loading...', size = 'md', fullHeight = false }: Props = $props();
</script>

{#if fullHeight}
	<div class="flex h-full w-full items-center justify-center">
		<div class="flex flex-col items-center gap-icon">
			<!-- Loading Spinner -->
			<svg
				class="animate-spin text-accent-primary {size === 'sm'
					? 'h-4 w-4'
					: size === 'lg'
						? 'h-12 w-12'
						: 'h-8 w-8'}"
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
				<p class="text-sm font-medium text-secondary">{message}</p>
			{/if}
		</div>
	</div>
{:else}
	<div class="flex flex-col items-center gap-icon py-readable-quote">
		<!-- Loading Spinner -->
		<svg
			class="animate-spin text-accent-primary {size === 'sm'
				? 'h-4 w-4'
				: size === 'lg'
					? 'h-12 w-12'
					: 'h-8 w-8'}"
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
			<p class="text-sm font-medium text-secondary">{message}</p>
		{/if}
	</div>
{/if}
