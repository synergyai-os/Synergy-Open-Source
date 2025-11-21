<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		class?: string;
	};

	let { children, class: className = '', ...rest }: Props = $props();

	const cardClasses = `bg-elevated border border-base rounded-card shadow-card ${className}`;
</script>

<div class={cardClasses} {...rest}>
	{@render children()}
</div>
