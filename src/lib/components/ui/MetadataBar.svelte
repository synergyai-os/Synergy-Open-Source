<script lang="ts">
	/**
	 * Metadata Bar Component (Linear-style)
	 * 
	 * Wrapper component for displaying metadata pills in a horizontal row
	 * Follows pattern: ui-patterns.md#L680 (Atomic Design)
	 */
	
	import { type Snippet } from 'svelte';
	
	type Props = {
		children: Snippet;
		class?: string;
	};
	
	let { children, class: className = '' }: Props = $props();
</script>

<div class="flex items-center gap-2 flex-wrap {className}">
	{@render children()}
</div>

