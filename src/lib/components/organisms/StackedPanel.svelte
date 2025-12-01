<script lang="ts">
	import { browser } from '$app/environment';
	import type { UseNavigationStack } from '$lib/modules/core/composables/useNavigationStack.svelte';
	import { PanelBreadcrumbs } from '$lib/components/molecules';
	import {
		stackedPanelRecipe,
		stackedPanelBackdropRecipe,
		stackedPanelContentRecipe
	} from '$lib/design-system/recipes';

	interface StackedPanelProps {
		isOpen: boolean;
		navigationStack: UseNavigationStack;
		onClose: () => void;
		onBreadcrumbClick: (index: number) => void;
		isTopmost: () => boolean; // Function to check if this panel is the topmost layer
		iconRenderer?: (layerType: string) => string | null; // Optional icon renderer for breadcrumbs (returns HTML string)
		children: import('svelte').Snippet;
	}

	let {
		isOpen,
		navigationStack,
		onClose,
		onBreadcrumbClick,
		isTopmost,
		iconRenderer,
		children
	}: StackedPanelProps = $props();

	const currentZIndex = $derived(navigationStack.currentLayer?.zIndex ?? 60);

	// Breadcrumb calculations
	const breadcrumbCount = $derived(Math.max(0, navigationStack.depth - 1));
	const hasBreadcrumbs = $derived(breadcrumbCount > 0);
	// Read breadcrumb width from base spacing token (spacing.12 = 3rem = 48px)
	// Technical constant (not design value): rem-to-px conversion factor
	const REM_TO_PX_FACTOR = 16; // Standard browser rem base (not a design token)
	// Initialize breadcrumb width from token (read once when component mounts)
	let breadcrumbWidthPx = $state(0);
	$effect(() => {
		if (!browser) return;
		// Read from base spacing token (spacing.12 = 3rem = 48px)
		const spacing12Value = getComputedStyle(document.documentElement)
			.getPropertyValue('--spacing-12')
			.trim();
		if (spacing12Value) {
			const remValue = parseFloat(spacing12Value);
			breadcrumbWidthPx = remValue * REM_TO_PX_FACTOR;
		}
	});
	// Use spacing-12 token value
	const breadcrumbWidth = $derived(
		breadcrumbWidthPx ||
			(browser
				? (() => {
						const spacing12 = getComputedStyle(document.documentElement)
							.getPropertyValue('--spacing-12')
							.trim();
						return spacing12 ? parseFloat(spacing12) * REM_TO_PX_FACTOR : 0;
					})()
				: 0)
	);
	const totalBreadcrumbWidth = $derived(breadcrumbCount * breadcrumbWidth);

	// Base panel widths from recipe (900px tablet, 1200px desktop)
	// These match the recipe: sm:w-[900px] lg:w-[1200px]
	const BASE_PANEL_WIDTH_SM = 900; // Tablet width
	const BASE_PANEL_WIDTH_LG = 1200; // Desktop width

	// Calculate panel width classes: base width PLUS breadcrumb space
	// When breadcrumbs exist, ADD breadcrumb width to base widths
	// This makes the TOTAL panel wider, while content stays the same size
	const panelWidthClasses = $derived.by(() => {
		if (!hasBreadcrumbs) {
			return ''; // Use recipe widths (sm:w-[900px] lg:w-[1200px])
		}

		// Calculate widths with breadcrumb space ADDED (extends panel to left)
		const widthSm = BASE_PANEL_WIDTH_SM + totalBreadcrumbWidth;
		const widthLg = BASE_PANEL_WIDTH_LG + totalBreadcrumbWidth;

		// Use Tailwind arbitrary values for responsive widths
		return `sm:w-[${widthSm}px] lg:w-[${widthLg}px]`;
	});


	// Track when panel opens to prevent immediate close from same click event
	let openedAt = $state(0);

	$effect(() => {
		if (isOpen) {
			openedAt = Date.now();
		}
	});

	// Global ESC key handler when panel is open
	// ONLY handle ESC if this panel is the topmost layer (prevents double-pop when multiple panels open)
	$effect(() => {
		if (isOpen && browser) {
			const handleKeydown = (e: KeyboardEvent) => {
				if (e.key === 'Escape') {
					// Check if this panel is the topmost layer
					if (isTopmost()) {
						onClose();
					}
				}
			};

			window.addEventListener('keydown', handleKeydown);
			return () => window.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

<!-- Backdrop - Always show when panel is open -->
{#if isOpen}
	<div
		class={stackedPanelBackdropRecipe()}
		style="z-index: {currentZIndex - 1}; background-color: var(--color-component-overlay-backdrop);"
		onclick={(e) => {
			// Ignore clicks within 100ms of opening (prevents same click that opened panel from closing it)
			const timeSinceOpen = Date.now() - openedAt;
			if (timeSinceOpen < 100) {
				return;
			}

			// Only close if clicking the backdrop itself, not bubbled events
			if (e.target === e.currentTarget) {
				onClose();
			}
		}}
		onkeydown={(e) => {
			// For accessibility - global handler also exists
			if (e.key === 'Escape') {
				if (isTopmost()) {
					onClose();
				}
			}
		}}
		role="button"
		tabindex="-1"
	></div>
{/if}

<!-- Panel -->
<aside
	class={[
		stackedPanelRecipe(),
		isOpen ? 'translate-x-0' : 'translate-x-full',
		panelWidthClasses
	]}
	style="z-index: {currentZIndex}; transition-duration: var(--animation-duration-slow);"
>
	<!-- Breadcrumb Bars (all previous layers) - positioned to LEFT of panel content -->
	{#if hasBreadcrumbs}
		<PanelBreadcrumbs
			{navigationStack}
			{onBreadcrumbClick}
			{iconRenderer}
			currentZIndex={currentZIndex}
		/>
	{/if}
	<!-- Panel Content - Content stays at base width, pushed right by breadcrumb width -->
	<div
		class={stackedPanelContentRecipe()}
		style={hasBreadcrumbs ? `padding-left: ${totalBreadcrumbWidth}px;` : ''}
	>
		{@render children()}
	</div>
</aside>
