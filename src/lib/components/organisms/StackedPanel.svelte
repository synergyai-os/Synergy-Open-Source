<script lang="ts">
	import { browser } from '$app/environment';
	import type { UseNavigationStack } from '$lib/modules/core/composables/useNavigationStack.svelte';
	import { PanelBreadcrumbs } from '$lib/components/molecules';

	interface StackedPanelProps {
		isOpen: boolean;
		navigationStack: UseNavigationStack;
		onClose: () => void;
		onBreadcrumbClick: (index: number) => void;
		isTopmost: () => boolean; // Function to check if this panel is the topmost layer
		children: import('svelte').Snippet;
	}

	let {
		isOpen,
		navigationStack,
		onClose,
		onBreadcrumbClick,
		isTopmost,
		children
	}: StackedPanelProps = $props();

	const currentZIndex = $derived(navigationStack.currentLayer?.zIndex ?? 60);

	// Breadcrumb calculations
	const breadcrumbCount = $derived(Math.max(0, navigationStack.depth - 1));
	const hasBreadcrumbs = $derived(breadcrumbCount > 0);
	// Read breadcrumb width from design token (48px = 3rem)
	// Technical constant (not design value): rem-to-px conversion factor
	const REM_TO_PX_FACTOR = 16; // Standard browser rem base (not a design token)
	// Initialize breadcrumb width from token (read once when component mounts)
	let breadcrumbWidthPx = $state(0);
	$effect(() => {
		if (!browser) return;
		const tokenValue = getComputedStyle(document.documentElement)
			.getPropertyValue('--spacing-panel-breadcrumb-width')
			.trim();
		if (tokenValue) {
			// Convert rem to pixels using standard browser rem base
			const remValue = parseFloat(tokenValue);
			breadcrumbWidthPx = remValue * REM_TO_PX_FACTOR;
		} else {
			// Fallback: read from base spacing token (spacing.12 = 3rem = 48px)
			const spacing12Value = getComputedStyle(document.documentElement)
				.getPropertyValue('--spacing-12')
				.trim();
			if (spacing12Value) {
				const remValue = parseFloat(spacing12Value);
				breadcrumbWidthPx = remValue * REM_TO_PX_FACTOR;
			}
		}
	});
	// Use token value, or calculate from spacing-12 token as fallback
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
		class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
		style="z-index: {currentZIndex - 1};"
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
	class="panel-stack-base shadow-card sm:w-[900px] lg:w-[1200px]"
	class:panel-stack-offset={hasBreadcrumbs}
	class:translate-x-0={isOpen}
	class:translate-x-full={!isOpen}
	style="z-index: {currentZIndex}; {hasBreadcrumbs
		? `width: calc(100% - ${totalBreadcrumbWidth}px); max-width: calc(100vw - ${totalBreadcrumbWidth}px);`
		: ''}"
>
	<!-- Breadcrumb Bars (all previous layers) -->
	{#if hasBreadcrumbs}
		<PanelBreadcrumbs {navigationStack} {onBreadcrumbClick} />
	{/if}
	<!-- Panel Content - Add left padding equal to total breadcrumb width -->
	<div
		class="flex h-full flex-col"
		style={hasBreadcrumbs ? `padding-left: ${totalBreadcrumbWidth}px;` : ''}
	>
		{@render children()}
	</div>
</aside>
