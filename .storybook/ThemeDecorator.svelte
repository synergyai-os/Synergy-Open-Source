<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		theme: string;
		children: Snippet;
	};

	let { theme, children }: Props = $props();

	// Set theme attribute reactively when theme changes
	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', theme);
		}
	});
</script>

{@render children()}
