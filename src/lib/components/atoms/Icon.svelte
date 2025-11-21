<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { Size } from '../ui/types';

	type Props = WithElementRef<
		{
			size?: Size;
			name?: string; // Optional: For future icon library integration
			children?: Snippet; // For inline SVG
			class?: string;
		},
		HTMLSpanElement
	>;

	let {
		size = 'md',
		name = undefined,
		children = undefined,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	// Apply design tokens based on size
	const sizeClasses: Record<Size, string> = {
		sm: 'icon-sm',
		md: 'icon-md',
		lg: 'icon-lg',
		xl: 'icon-xl'
	};

	const iconClasses = `inline-flex items-center justify-center ${sizeClasses[size]} ${className}`;
</script>

{#if children}
	<span bind:this={ref} class={iconClasses} {...rest}>
		{@render children()}
	</span>
{:else if name}
	<!-- Future: Icon library integration -->
	<span bind:this={ref} class={iconClasses} {...rest} data-icon={name}></span>
{:else}
	<!-- Default: Empty span for layout -->
	<span bind:this={ref} class={iconClasses} {...rest}></span>
{/if}

<!--
	Icon Component - Size Variants with Design Tokens
	
	Usage:
	<Icon size="md">
		<svg>...</svg>
	</Icon>
	
	<Icon size="lg" name="calendar" /> <!-- Future: icon library -->

Design Tokens: - sm: icon-sm (16px) - md: icon-md (20px) - lg: icon-lg (24px) - xl: icon-xl (32px)
Note: Currently supports inline SVG via children. Icon library integration (via name prop) planned
for future. -->
