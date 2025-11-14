<script lang="ts">
	import type { PageData } from './$types';
	import { marked } from 'marked';

	let { data }: { data: PageData } = $props();

	// Function to generate heading with ID
	function parseMarkdownWithIds(markdown: string): string {
		// Configure marked renderer to add IDs
		const renderer = new marked.Renderer();

		renderer.heading = function ({
			text,
			depth
		}: {
			text: string | { raw?: string };
			depth: number;
		}) {
			// Extract plain text from token
			const plainText = typeof text === 'string' ? text : text.raw || '';

			// Generate slug from heading text
			const slug = plainText
				.toLowerCase()
				.replace(/[^\w\s-]/g, '') // Remove special chars
				.replace(/\s+/g, '-') // Replace spaces with hyphens
				.replace(/-+/g, '-') // Replace multiple hyphens with single
				.trim();

			return `<h${depth} id="${slug}">${plainText}</h${depth}>`;
		};

		return marked.parse(markdown, { renderer, async: false }) as string;
	}

	// Parse markdown to HTML with IDs
	const htmlContent = $derived(parseMarkdownWithIds(data.content));
</script>

<svelte:head>
	<title>{data.title} | Marketing Docs</title>
</svelte:head>

<div class="doc-page">
	<article class="doc-content">
		{@html htmlContent}
	</article>
</div>

<style>
	.doc-page {
		/* Layout handles styling via DocLayout wrapper */
		scroll-behavior: smooth;
	}

	/* Ensure headings have scroll margin for proper positioning */
	.doc-content :global(h1),
	.doc-content :global(h2),
	.doc-content :global(h3),
	.doc-content :global(h4) {
		scroll-margin-top: 2rem;
	}
</style>
