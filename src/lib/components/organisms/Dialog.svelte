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
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { DialogVariant } from '../ui/types';
	import { browser } from '$app/environment';

	type Props = {
		variant?: DialogVariant;
		responsive?: boolean; // Auto-fullscreen on mobile (<640px)
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

	// Check if mobile (<640px) for responsive behavior
	let isMobile = $state(false);

	$effect(() => {
		if (!browser) return;

		const checkMobile = () => {
			isMobile = window.innerWidth < 640;
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
		const variantClass = isFullscreen
			? 'fixed inset-0 w-full h-full rounded-none overflow-y-auto'
			: variant === 'wide'
				? 'max-w-dialog-wide rounded-dialog'
				: 'max-w-dialog-default rounded-dialog';

		return `bg-elevated border border-base shadow-card-hover p-modal ${variantClass} ${className}`;
	};
</script>

<BitsDialog.Content class={getDialogClasses()} {...rest}>
	{@render children()}
</BitsDialog.Content>
