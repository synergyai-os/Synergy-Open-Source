<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		theme: string;
		children: Snippet;
	};

	let { theme, children }: Props = $props();

	// Apply .dark/.light classes (NOT data-theme) to match theme store implementation
	// This ensures Storybook stories use the same theme mechanism as the app
	$effect(() => {
		if (typeof document !== 'undefined') {
			const html = document.documentElement;
			if (theme === 'dark') {
				html.classList.add('dark');
				html.classList.remove('light');
			} else {
				html.classList.add('light');
				html.classList.remove('dark');
			}
		}
	});
</script>

{@render children()}
