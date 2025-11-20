<script lang="ts">
	import { page } from '$app/stores';
	import DocLayout from '$lib/modules/docs/components/DocLayout.svelte';

	// Check if we're on the homepage (don't apply DocLayout wrapper)
	$: isHomepage = $page.url.pathname === '/dev-docs' || $page.url.pathname === '/dev-docs/';

	// TODO: Extract headings from MDX for TOC
	const headings: { id: string; text: string; level: number }[] = [];
</script>

{#if isHomepage}
	<!-- Homepage gets full-width design without DocLayout -->
	<slot />
{:else}
	<!-- All other pages use DocLayout with sidebar + TOC -->
	<DocLayout {headings}>
		<slot />
	</DocLayout>
{/if}
