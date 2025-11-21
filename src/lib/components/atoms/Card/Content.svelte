<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		class?: string;
	};

	let { children, class: className = '', ...rest }: Props = $props();

	const contentClasses = `px-card py-card ${className}`;
</script>

<div class={contentClasses} {...rest}>
	{@render children()}
</div>
