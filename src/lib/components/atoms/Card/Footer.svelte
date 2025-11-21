<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		class?: string;
	};

	let { children, class: className = '', ...rest }: Props = $props();

	const footerClasses = `px-card py-card border-t border-base ${className}`;
</script>

<div class={footerClasses} {...rest}>
	{@render children()}
</div>
