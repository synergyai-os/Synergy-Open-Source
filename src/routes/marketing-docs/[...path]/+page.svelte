<script lang="ts">
	import type { PageData } from './$types';
	import { marked } from 'marked';
	import { sanitizeHtml } from '$lib/utils/htmlSanitize';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { processMermaidInHtml } from '$lib/utils/mermaidProcessor';

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

	// Parse markdown to HTML with IDs and sanitize
	const rawHtml = $derived(sanitizeHtml(parseMarkdownWithIds(data.content)));

	// Process Mermaid diagrams client-side
	let htmlContent = $state('');
	let lastProcessedHtml = $state('');

	onMount(async () => {
		if (browser && rawHtml) {
			htmlContent = await processMermaidInHtml(rawHtml);
			lastProcessedHtml = rawHtml;
		} else {
			htmlContent = rawHtml;
		}
	});

	// Update when content changes
	$effect(() => {
		if (browser && rawHtml && rawHtml !== lastProcessedHtml) {
			processMermaidInHtml(rawHtml).then((processed) => {
				htmlContent = processed;
				lastProcessedHtml = rawHtml;
			});
		} else if (!browser) {
			htmlContent = rawHtml;
		}
	});
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

	/* Mermaid diagram styling */
	.doc-content :global(.mermaid-container) {
		margin: 1.5rem 0;
		overflow-x: auto;
		display: flex;
		justify-content: center;
	}

	.doc-content :global(.mermaid-container svg) {
		max-width: 100%;
		height: auto;
	}

	.doc-content :global(.mermaid-error) {
		margin: 1.5rem 0;
		padding: 1rem;
		background: var(--color-surface-error, #fee);
		border: 1px solid var(--color-border-error, #fcc);
		border-radius: 0.25rem;
		color: var(--color-text-error, #c00);
	}

	.doc-content :global(.mermaid-error pre) {
		margin: 0;
		white-space: pre-wrap;
		font-size: 0.875rem;
	}
</style>
