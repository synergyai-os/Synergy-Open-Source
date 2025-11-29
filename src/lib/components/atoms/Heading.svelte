<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { HeadingLevel } from '../types';
	import { headingRecipe } from '$lib/design-system/recipes';

	type Props = WithElementRef<
		{
			level?: HeadingLevel;
			color?: 'primary' | 'secondary' | 'tertiary';
			children: Snippet;
			class?: string;
		},
		HTMLHeadingElement
	>;

	let {
		level = 1,
		color = 'primary',
		children,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const headingClasses = $derived([headingRecipe({ level, color }), className]);
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
	<Heading level={3} color="secondary">Subsection</Heading>
	<Heading level={5} color="secondary" class="mb-form-section">Section Label</Heading>
	
	Design Tokens:
	- Level 1: text-4xl (36px, 700 weight)
	- Level 2: text-3xl (28px, 600 weight)
	- Level 3: text-2xl (20px, 600 weight)
	- Level 4: text-xl (18px, 500 weight)
	- Level 5: text-sm (14px, 600 weight)
	- Level 6: text-sm (14px, 500 weight)
	- Color: primary (default), secondary, tertiary
-->
