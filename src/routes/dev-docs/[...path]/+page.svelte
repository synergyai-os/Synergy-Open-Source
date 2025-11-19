<script lang="ts">
	import type { PageData } from './$types';
	import { marked } from 'marked';
	import { sanitizeHtml } from '$lib/utils/htmlSanitize';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { processMermaidInHtml } from '$lib/utils/mermaidProcessor';

	let { data }: { data: PageData } = $props();

	// Utility: Strip PARA numbering (1-, 2-, 3-, 4-) from folder/file names and capitalize
	function cleanParaName(name: string): string {
		const cleaned = name.replace(/^\d+-/, '').replace(/\/$/, '');
		// Capitalize first letter
		return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
	}

	// Function to generate heading with ID
	function parseMarkdownWithIds(markdown: string): string {
		// Configure marked renderer to add IDs
		const renderer = new marked.Renderer();

		// Custom heading renderer with line-number-aware IDs
		renderer.heading = function ({
			text,
			depth
		}: {
			text: string | { raw?: string };
			depth: number;
		}) {
			// Extract plain text from token
			let plainText = typeof text === 'string' ? text : text.raw || '';

			// Check if heading starts with #L[NUMBER]: pattern (line-numbered sections)
			const lineNumberMatch = plainText.match(/^#L(\d+):/);

			// Clean PARA prefix from heading text (strip "1-", "2-", etc. and trailing slashes)
			const displayText = cleanParaName(plainText);

			let id: string;
			if (lineNumberMatch) {
				// Use simple line number as ID (e.g., #L10: Title → id="l10")
				id = `l${lineNumberMatch[1]}`;
			} else {
				// Generate slug from heading text for regular headings
				id = plainText
					.toLowerCase()
					.replace(/[^\w\s-]/g, '') // Remove special chars
					.replace(/\s+/g, '-') // Replace spaces with hyphens
					.replace(/-+/g, '-') // Replace multiple hyphens with single
					.trim();
			}

			return `<h${depth} id="${id}">${displayText}</h${depth}>`;
		};

		// Custom link renderer to transform .md links to proper routes
		renderer.link = function ({
			href,
			text,
			title
		}: {
			href: string;
			text: string;
			title?: string | null;
		}) {
			// Only transform relative .md links (internal docs)
			if (href && !href.startsWith('http') && !href.startsWith('/')) {
				// Handle .md file links
				if (href.includes('.md')) {
					// Extract path and hash
					const [path, hash] = href.split('#');

					// Remove .md extension
					const cleanPath = path.replace(/\.md$/, '');

					// Transform hash to lowercase if it exists (e.g., #L10 → #l10)
					const cleanHash = hash ? `#${hash.toLowerCase()}` : '';

					// Get current path from data.path to resolve relative links correctly
					const currentPath = data.path || '';
					const currentDir = currentPath.substring(
						0,
						currentPath.lastIndexOf('/') || currentPath.length
					);

					// Resolve relative paths: same directory or subdirectory
					let finalPath: string;
					if (cleanPath.startsWith('../')) {
						// Parent directory - resolve relative to current file's directory
						// e.g., currentPath = "/2-areas/architecture/multi-tenancy", cleanPath = "../system-architecture"
						// We need to go up from "multi-tenancy" to "architecture", then append "system-architecture"
						// currentDir = "/2-areas/architecture" (parent of file), so we start from currentPath's parent
						let resolvedPath = currentDir; // Start from parent directory of current file
						let remainingPath = cleanPath;

						// Count how many ../ segments we have
						let upLevels = 0;
						while (remainingPath.startsWith('../')) {
							upLevels++;
							remainingPath = remainingPath.substring(3); // Remove '../'
						}

						// Go up the required number of levels from currentDir
						// Note: currentDir is already one level up from the file, so we go up (upLevels - 1) more times
						for (let i = 0; i < upLevels - 1; i++) {
							const lastSlashIndex = resolvedPath.lastIndexOf('/');
							if (lastSlashIndex > 0) {
								resolvedPath = resolvedPath.substring(0, lastSlashIndex);
							} else {
								resolvedPath = '';
								break;
							}
						}

						// Append remaining path
						if (resolvedPath && remainingPath) {
							finalPath = `${resolvedPath}/${remainingPath}`;
						} else if (remainingPath) {
							finalPath = remainingPath;
						} else {
							finalPath = resolvedPath;
						}
					} else if (cleanPath.startsWith('./')) {
						// Explicit relative - same directory
						finalPath = currentDir
							? `${currentDir}/${cleanPath.substring(2)}`
							: cleanPath.substring(2);
					} else {
						// Same directory - construct full path
						// e.g., currentPath = "/2-areas/architecture", cleanPath = "system-architecture"
						// result = "/2-areas/architecture/system-architecture"
						finalPath = currentDir ? `${currentDir}/${cleanPath}` : cleanPath;
					}

					// Reconstruct href with absolute path
					// Check if path goes outside dev-docs (e.g., to marketing-docs)
					if (finalPath.startsWith('marketing-docs/')) {
						href = `/${finalPath}${cleanHash}`;
					} else {
						href = `/dev-docs${finalPath}${cleanHash}`;
					}
				}
			}

			// Build the link HTML
			const titleAttr = title ? ` title="${title}"` : '';
			return `<a href="${href}"${titleAttr}>${text}</a>`;
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
	<title>{data.title} | Dev Docs</title>
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
