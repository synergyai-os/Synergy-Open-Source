<script lang="ts">
	import DocLayout from '$lib/components/docs/DocLayout.svelte';
	
	// TODO: Extract headings from MDX for TOC
	const headings: { id: string; text: string; level: number }[] = [];
</script>

<DocLayout {headings}>
	<slot />
</DocLayout>

