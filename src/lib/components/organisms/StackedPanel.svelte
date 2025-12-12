<script lang="ts">
	import { browser } from '$app/environment';
	import type { UseNavigationStack } from '$lib/modules/core/composables/useNavigationStack.svelte';
	import type { IconType } from '$lib/components/atoms/iconRegistry';
	import { PanelBreadcrumbs } from '$lib/components/molecules';
	import {
		stackedPanelRecipe,
		stackedPanelBackdropRecipe,
		stackedPanelContentRecipe
	} from '$lib/design-system/recipes';

	/** Context passed to panel content for mobile back button support */
	export interface PanelContext {
		/** True when on mobile viewport (< 640px) */
		isMobile: boolean;
		/** True when there are previous layers to navigate back to */
		canGoBack: boolean;
		/** Navigate back to previous layer (call when back button clicked) */
		onBack: () => void;
	}

	interface StackedPanelProps {
		isOpen: boolean;
		navigationStack: UseNavigationStack;
		onClose: () => void;
		onBreadcrumbClick: (index: number) => void;
		isTopmost: () => boolean; // Function to check if this panel is the topmost layer
		iconRenderer?: (layerType: string) => IconType | null; // Optional icon renderer for breadcrumbs (returns IconType)
		children: import('svelte').Snippet<[PanelContext]>;
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

	// Mobile detection (< 640px = sm breakpoint)
	const MOBILE_BREAKPOINT = 640;
	let isMobile = $state(false);
	$effect(() => {
		if (!browser) return;
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => {
			isMobile = window.innerWidth < MOBILE_BREAKPOINT;
		};
		mql.addEventListener('change', onChange);
		isMobile = window.innerWidth < MOBILE_BREAKPOINT;
		return () => mql.removeEventListener('change', onChange);
	});

	// Breadcrumb calculations
	const breadcrumbCount = $derived(Math.max(0, navigationStack.depth - 1));
	const hasBreadcrumbs = $derived(breadcrumbCount > 0);
	// On mobile: no sidebar breadcrumbs (use back button instead)
	const showSidebarBreadcrumbs = $derived(hasBreadcrumbs && !isMobile);
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
	// Only add breadcrumb width on non-mobile (sidebar breadcrumbs only show on tablet+)
	const totalBreadcrumbWidth = $derived(
		showSidebarBreadcrumbs ? breadcrumbCount * breadcrumbWidth : 0
	);

	// Back button handler for mobile - goes to previous layer (same as clicking last breadcrumb)
	const handleBack = () => {
		if (hasBreadcrumbs) {
			// Click the most recent breadcrumb (last one before current)
			onBreadcrumbClick(breadcrumbCount - 1);
		}
	};

	// Context passed to children for mobile back button support
	const panelContext = $derived({
		isMobile,
		canGoBack: hasBreadcrumbs,
		onBack: handleBack
	} satisfies PanelContext);

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
		'stacked-panel-width'
	]}
	style="z-index: {currentZIndex}; transition-duration: var(--animation-duration-slow); --breadcrumb-extra-width: {totalBreadcrumbWidth}px;"
>
	<!-- Breadcrumb Bars (tablet/desktop only) - positioned to LEFT of panel content -->
	{#if showSidebarBreadcrumbs}
		<PanelBreadcrumbs {navigationStack} {onBreadcrumbClick} {iconRenderer} {currentZIndex} />
	{/if}
	<!-- Panel Content - Content stays at base width, pushed right by breadcrumb width on tablet+ -->
	<div
		class={stackedPanelContentRecipe()}
		style={showSidebarBreadcrumbs ? `padding-left: ${totalBreadcrumbWidth}px;` : ''}
	>
		{@render children(panelContext)}
	</div>
</aside>

<style>
	/* Panel width: mobile-first responsive approach */
	/* Mobile (< 640px): Full width, no breadcrumb extension */
	/* Tablet (640px+): Max 900px + breadcrumb extra width, can shrink below */
	/* Desktop (1024px+): Max 1200px + breadcrumb extra width, can shrink below */
	:global(.stacked-panel-width) {
		/* Mobile: full width (handled by recipe w-full) */
		width: 100%;
	}

	@media (min-width: 640px) {
		:global(.stacked-panel-width) {
			max-width: calc(900px + var(--breadcrumb-extra-width, 0px));
			width: 100%;
		}
	}

	@media (min-width: 1024px) {
		:global(.stacked-panel-width) {
			max-width: calc(1200px + var(--breadcrumb-extra-width, 0px));
			width: 100%;
		}
	}
</style>
