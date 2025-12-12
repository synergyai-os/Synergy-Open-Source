<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import { getIcon, type IconType } from './iconRegistry';
	import { iconRecipe, type IconVariantProps } from '$lib/design-system/recipes';

	type Props = WithElementRef<
		IconVariantProps & {
			type: IconType;
		},
		HTMLSpanElement
	>;

	let {
		type,
		size = 'md',
		color = 'default',
		ref = $bindable(null),
		class: className = '',
		...rest
	}: Props = $props();

	// Get icon definition from registry
	// Add error handling for development/debugging
	const iconDef = $derived.by(() => {
		if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && !type) {
			console.warn(`Icon component called with undefined/null/empty type`);
		}
		let def = getIcon(type);
		if (!def) {
			if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
				console.error(`Icon type "${type}" not found in registry`);
			}
			// Fallback to add icon if type is invalid
			def = getIcon('add');
			if (!def) {
				// Last resort fallback
				def = {
					path: 'M12 4v16m8-8H4',
					viewBox: '0 0 24 24',
					strokeWidth: '2',
					strokeLinecap: 'round',
					strokeLinejoin: 'round'
				};
			}
		}
		return def;
	});

	// Apply design tokens using recipe system
	// Merge recipe classes with custom className using array syntax
	const iconClasses = $derived([iconRecipe({ size, color }), className]);
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
	
	Design Tokens: - sm: size-icon-sm (16px) - md: size-icon-md (20px) - lg: size-icon-lg (24px) - xl: size-icon-xl (40px) - xxl: size-icon-xxl (56px)
	
	All icons are predefined in iconRegistry.ts to ensure design system consistency.
	Only icons from the registry can be used - no arbitrary SVG children allowed.
-->
