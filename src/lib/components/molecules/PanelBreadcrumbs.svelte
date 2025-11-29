<script lang="ts">
	import type { UseNavigationStack } from '$lib/modules/core/composables/useNavigationStack.svelte';

	let {
		navigationStack,
		onBreadcrumbClick
	}: {
		navigationStack: UseNavigationStack;
		onBreadcrumbClick: (index: number) => void;
	} = $props();

	// Get all layers except the current one (for breadcrumbs)
	const breadcrumbLayers = $derived(navigationStack.stack.slice(0, -1));
</script>

{#each breadcrumbLayers as layer, index (layer.id)}
	<button
		type="button"
		class="panel-breadcrumb-bar hover:panel-breadcrumb-bar-hover"
		style="left: {index * 48}px;"
		onclick={() => onBreadcrumbClick(index)}
		aria-label="Go back to {layer.name}"
	>
		<span class="panel-breadcrumb-text">
			<!-- Icon based on layer type -->
			{#if layer.type === 'circle'}
				<svg class="icon-xs inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="9" stroke-width="2"></circle>
				</svg>
			{:else if layer.type === 'role'}
				<svg class="icon-xs inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					></path>
				</svg>
			{/if}
			{layer.name}
		</span>
	</button>
{/each}
