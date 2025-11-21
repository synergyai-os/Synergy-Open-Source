<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		class?: string;
	};

	let { children, class: className = '', ...rest }: Props = $props();

	const headerClasses = `px-card py-card border-b border-base ${className}`;
</script>

<div class={headerClasses} {...rest}>
	{@render children()}
</div>
