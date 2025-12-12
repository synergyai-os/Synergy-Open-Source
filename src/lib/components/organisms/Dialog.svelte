<script lang="ts" module>
	import { Dialog as BitsDialog } from 'bits-ui';

	// Re-export sub-components
	export const Root = BitsDialog.Root;
	export const Trigger = BitsDialog.Trigger;
	export const Close = BitsDialog.Close;
	export const Title = BitsDialog.Title;
	export const Description = BitsDialog.Description;
	export const Portal = BitsDialog.Portal;
	export const Overlay = BitsDialog.Overlay;
	export const Content = BitsDialog.Content; // Export raw Content for direct use
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { DialogVariant } from '../types';
	import { browser } from '$app/environment';

	type Props = {
		variant?: DialogVariant;
		responsive?: boolean; // Auto-fullscreen on mobile (<sm breakpoint)
		children: Snippet;
		class?: string;
	};

	let {
		variant = 'default',
		responsive = true,
		children,
		class: className = '',
		...rest
	}: Props = $props();

	// Check if mobile (<sm breakpoint) for responsive behavior
	// Uses CSS variable --breakpoint-sm from design-system.json
	let isMobile = $state(false);

	$effect(() => {
		if (!browser) return;

		const checkMobile = () => {
			// Read breakpoint from CSS variable (--breakpoint-sm: 640px)
			const breakpointSm = getComputedStyle(document.documentElement)
				.getPropertyValue('--breakpoint-sm')
				.trim();
			const breakpointValue = breakpointSm ? parseInt(breakpointSm, 10) : 640; // Fallback to 640px
			isMobile = window.innerWidth < breakpointValue;
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	});

	// Determine if fullscreen (explicit variant or responsive mobile)
	const isFullscreen = $derived(variant === 'fullscreen' || (responsive && isMobile));

	// Fix: Use function to avoid state reference warning
	const getDialogClasses = () => {
		if (isFullscreen) {
			return `fixed inset-0 z-[100] w-full h-full rounded-dialog-fullscreen overflow-y-auto bg-elevated border border-base shadow-card-hover p-modal ${className}`;
		}

		const variantClass = variant === 'wide' ? 'max-w-dialog-wide' : 'max-w-dialog-default';

		// BitsDialog.Content needs positioning for centered dialogs
		// z-[100] ensures dialog is above StackedPanel (which uses z-60+)
		return `fixed top-[50%] left-[50%] z-[100] max-h-[90vh] w-[min(100%,90vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-dialog ${variantClass} bg-elevated border border-base shadow-card-hover p-modal ${className}`;
	};
</script>

<BitsDialog.Content class={getDialogClasses()} {...rest}>
	{@render children()}
</BitsDialog.Content>
