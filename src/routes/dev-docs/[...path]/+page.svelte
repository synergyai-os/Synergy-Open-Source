<script lang="ts">
	import type { PageData } from './$types';
	import { marked } from 'marked';
	import { sanitizeHtml } from '$lib/utils/htmlSanitize';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { processMermaidInHtml } from '$lib/utils/mermaidProcessor';
	import { resolveRoute } from '$lib/utils/navigation';

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

{#if data.isDirectory && data.files}
	<div class="doc-page">
		<article class="doc-content">
			<header class="directory-header">
				<h1 class="directory-title">{data.title}</h1>
				<p class="directory-description">
					Browse all documentation files in this directory ({data.files.length} file{data.files
						.length !== 1
						? 's'
						: ''})
				</p>
			</header>

			<div class="directory-grid">
				{#each data.files as file (file.path)}
					<a href={resolveRoute(file.href)} class="directory-card">
						<div class="card-icon">
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
								<polyline points="14 2 14 8 20 8"></polyline>
								<line x1="16" y1="13" x2="8" y2="13"></line>
								<line x1="16" y1="17" x2="8" y2="17"></line>
								<polyline points="10 9 9 9 8 9"></polyline>
							</svg>
						</div>
						<div class="card-content">
							<h3 class="card-title">{file.title}</h3>
							<p class="card-path">{file.displayName}</p>
						</div>
						<div class="card-arrow">
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<polyline points="9 18 15 12 9 6"></polyline>
							</svg>
						</div>
					</a>
				{/each}
			</div>
		</article>
	</div>
{:else}
	<div class="doc-page">
		<article class="doc-content">
			{@html htmlContent}
		</article>
	</div>
{/if}

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

	/* Directory listing styles */
	.directory-header {
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 2px solid var(--color-border-base);
	}

	.directory-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 0.75rem 0;
		letter-spacing: -0.02em;
	}

	.directory-description {
		font-size: 1.125rem;
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.6;
	}

	.directory-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	.directory-card {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1.5rem;
		background: var(--color-bg-surface);
		border: 2px solid var(--color-border-base);
		border-radius: 0.75rem;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.directory-card:hover {
		border-color: var(--color-accent-primary);
		background: var(--color-bg-hover);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.card-icon {
		flex-shrink: 0;
		color: var(--color-accent-primary);
		margin-top: 0.125rem;
	}

	.card-content {
		flex: 1;
		min-width: 0;
	}

	.card-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 0.25rem 0;
		line-height: 1.4;
	}

	.card-path {
		font-size: 0.875rem;
		color: var(--color-text-tertiary);
		margin: 0;
		font-family: monospace;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.card-arrow {
		flex-shrink: 0;
		color: var(--color-text-tertiary);
		margin-top: 0.125rem;
		transition: transform 0.2s ease;
	}

	.directory-card:hover .card-arrow {
		transform: translateX(4px);
		color: var(--color-accent-primary);
	}

	@media (max-width: 768px) {
		.directory-grid {
			grid-template-columns: 1fr;
		}

		.directory-title {
			font-size: 2rem;
		}

		.directory-description {
			font-size: 1rem;
		}
	}
</style>
