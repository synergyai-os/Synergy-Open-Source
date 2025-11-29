<script lang="ts">
	/**
	 * PageHeader Component
	 *
	 * Sticky page header with consistent spacing and divider.
	 * Provides flexible slots for title, left actions, and right content.
	 *
	 * Usage:
	 * <PageHeader>
	 *   <snippet:title>Page Title</snippet:title>
	 *   <snippet:right>Actions</snippet:right>
	 * </PageHeader>
	 *
	 * Or with left actions:
	 * <PageHeader>
	 *   <snippet:left>Toggle</snippet:left>
	 *   <snippet:title>Page Title</snippet:title>
	 *   <snippet:right>Actions</snippet:right>
	 * </PageHeader>
	 */

	import type { Snippet } from 'svelte';
	import { Text } from '$lib/components/atoms';

	type Props = {
		title?: string;
		titleSlot?: Snippet;
		left?: Snippet;
		right?: Snippet;
		sticky?: boolean;
		class?: string;
	};

	let { title, titleSlot, left, right, sticky = true, class: className = '' }: Props = $props();
</script>

<!-- WORKAROUND: Header padding and z-index tokens missing - see missing-styles.md -->
<div
	class="flex flex-shrink-0 items-center justify-between border-b border-subtle bg-elevated {sticky
		? 'sticky top-0'
		: ''} {className}"
	style="height: 2.5rem; padding-inline: var(--spacing-4); padding-block: var(--spacing-2); {sticky
		? 'z-index: var(--zIndex-dropdown);'
		: ''}"
>
	<!-- Left: Optional left content + Title -->
	<div class="flex items-center gap-header">
		{#if left}
			{@render left()}
		{/if}

		{#if titleSlot}
			{@render titleSlot()}
		{:else if title}
			<Text variant="label" size="sm" color="secondary" weight="normal" as="h2">
				{title}
			</Text>
		{/if}
	</div>

	<!-- Right: Optional right content -->
	{#if right}
		<div class="flex items-center gap-header">
			{@render right()}
		</div>
	{/if}
</div>
