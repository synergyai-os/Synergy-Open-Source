<script lang="ts">
	import type { PageData } from './$types';
	import { marked } from 'marked';
	import { browser } from '$app/environment';
	
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
		renderer.heading = function({ text, depth }: any) {
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
		renderer.link = function({ href, text, title }: any) {
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
					
					// Make relative links explicit for browser resolution
					// Preserve ./ and ../ prefixes, otherwise prepend ./
					const finalPath = cleanPath.startsWith('./') || cleanPath.startsWith('../') 
						? cleanPath 
						: './' + cleanPath;
					
					// Reconstruct href
					href = `${finalPath}${cleanHash}`;
				}
			}
			
			// Build the link HTML
			const titleAttr = title ? ` title="${title}"` : '';
			return `<a href="${href}"${titleAttr}>${text}</a>`;
		};
		
		return marked.parse(markdown, { renderer, async: false }) as string;
	}
	
	// Parse markdown to HTML with IDs
	const htmlContent = $derived(parseMarkdownWithIds(data.content));
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
	
	.doc-content {
		/* Typography styling inherited from DocLayout's .docs-article */
	}
	
	/* Ensure headings have scroll margin for proper positioning */
	.doc-content :global(h1),
	.doc-content :global(h2),
	.doc-content :global(h3),
	.doc-content :global(h4) {
		scroll-margin-top: 2rem;
	}
</style>

