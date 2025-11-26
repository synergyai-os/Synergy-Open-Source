<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { Size } from '../types';
	import { getIcon, type IconType } from './iconRegistry';

	type Props = WithElementRef<
		{
			type: IconType;
			size?: Size;
			class?: string;
		},
		HTMLSpanElement
	>;

	let {
		type,
		size = 'md',
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	// Get icon definition from registry
	// Add error handling for development/debugging
	const iconDef = $derived.by(() => {
		try {
			return getIcon(type);
		} catch (error) {
			if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
				console.error(`Icon type "${type}" not found in registry:`, error);
			}
			// Fallback to add icon if type is invalid
			return getIcon('add');
		}
	});

	// Apply semantic design tokens based on size
	const sizeClasses: Record<Size, string> = {
		sm: 'size-icon-sm',
		md: 'size-icon-md',
		lg: 'size-icon-lg',
		xl: 'size-icon-lg' // WORKAROUND: size-icon-xl missing - see missing-styles.md
	};

	const iconClasses = $derived([
		`inline-flex items-center justify-center`,
		sizeClasses[size],
		className
	]);
</script>

<span bind:this={ref} class={iconClasses} {...rest}>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox={iconDef.viewBox ?? '0 0 24 24'}
		stroke="currentColor"
		stroke-width={iconDef.strokeWidth ?? '2'}
		stroke-linecap={iconDef.strokeLinecap ?? 'round'}
		stroke-linejoin={iconDef.strokeLinejoin ?? 'round'}
		class="h-full w-full"
	>
		<path d={iconDef.path} />
	</svg>
</span>

<!--
	Icon Component - Predefined Icon Types with Design Tokens
	
	Usage:
	<Icon type="add" size="md" />
	<Icon type="payment" size="lg" />
	
	Design Tokens: - sm: size-icon-sm (16px) - md: size-icon-md (20px) - lg: size-icon-lg (24px) - xl: size-icon-lg (32px, workaround)
	
	All icons are predefined in iconRegistry.ts to ensure design system consistency.
	Only icons from the registry can be used - no arbitrary SVG children allowed.
-->
