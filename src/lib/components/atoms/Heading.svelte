<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { HeadingLevel } from '../ui/types';

	type Props = WithElementRef<
		{
			level?: HeadingLevel;
			children: Snippet;
			class?: string;
		},
		HTMLHeadingElement
	>;

	let {
		level = 1,
		children,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	// Apply design tokens based on level
	const levelClasses: Record<HeadingLevel, string> = {
		1: 'text-h1',
		2: 'text-h2',
		3: 'text-h3',
		4: 'text-body font-semibold',
		5: 'text-small font-semibold',
		6: 'text-small font-medium'
	};

	const headingClasses = `${levelClasses[level]} text-primary ${className}`;
</script>

{#if level === 1}
	<h1 bind:this={ref} class={headingClasses} {...rest}>{@render children()}</h1>
{:else if level === 2}
	<h2 bind:this={ref} class={headingClasses} {...rest}>{@render children()}</h2>
{:else if level === 3}
	<h3 bind:this={ref} class={headingClasses} {...rest}>{@render children()}</h3>
{:else if level === 4}
	<h4 bind:this={ref} class={headingClasses} {...rest}>{@render children()}</h4>
{:else if level === 5}
	<h5 bind:this={ref} class={headingClasses} {...rest}>{@render children()}</h5>
{:else}
	<h6 bind:this={ref} class={headingClasses} {...rest}>{@render children()}</h6>
{/if}

<!--
	Heading Component - Dynamic Heading with Design Tokens
	
	Usage:
	<Heading level={1}>Page Title</Heading>
	<Heading level={2}>Section Title</Heading>
	<Heading level={3} class="custom-class">Subsection</Heading>
	
	Design Tokens:
	- Level 1: text-h1 (36px, 700 weight)
	- Level 2: text-h2 (28px, 600 weight)
	- Level 3: text-h3 (20px, 600 weight)
	- Level 4-6: text-body/small with font weights
	- Color: text-primary (adapts to light/dark mode)
-->
