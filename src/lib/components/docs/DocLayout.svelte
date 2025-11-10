<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { untrack } from 'svelte';
	import Breadcrumb from './Breadcrumb.svelte';
	import ParaQuickNav from './ParaQuickNav.svelte';
	import TableOfContents from './TableOfContents.svelte';
	
	type Props = {
		children?: any;
		headings?: { id: string; text: string; level: number }[];
	};
	
	let { children, headings: propHeadings = [] }: Props = $props();
	
	// Extract headings from rendered content (client-side)
	let extractedHeadings = $state<{ id: string; text: string; level: number }[]>([]);
	let lastPathname: string | null = null;
	let isExtracting = false;
	
	// Re-extract headings ONLY when pathname changes (not on hash changes)
	$effect(() => {
		if (!browser) return;
		
		// Prevent race conditions from double-runs (use untracked read)
		if (untrack(() => isExtracting)) {
			console.log('[DocLayout] Already extracting, skipping...');
			return;
		}
		
		// Only track pathname, ignore hash changes
		const currentPath = $page.url.pathname;
		const currentHash = $page.url.hash;
		
		// Skip ONLY if:
		// 1. This is not the first load (lastPathname !== null)
		// 2. Pathname hasn't changed (same page)
		// 3. There IS a hash (actual hash navigation, not page refresh)
		const shouldSkip = untrack(() => 
			lastPathname !== null && currentPath === lastPathname && currentHash
		);
		
		if (shouldSkip) {
			console.log('[DocLayout] Skipping extract (hash-only change):', currentHash);
			return;
		}
		
		console.log('[DocLayout] Extracting headings for:', currentPath, currentHash ? `(with hash: ${currentHash})` : '(no hash)');
		
		// Update tracking variables without triggering re-runs (untracked mutations)
		untrack(() => {
			lastPathname = currentPath;
			isExtracting = true;
		});
		
		// Wait for DOM to fully update with new page content
		const timeoutId = setTimeout(() => {
			// Clear headings inside timeout to prevent race conditions
			extractedHeadings = [];
			
			const headingElements = document.querySelectorAll('.docs-article h1, .docs-article h2, .docs-article h3, .docs-article h4');
			
			// Only extract if we actually found headings
			if (headingElements.length > 0) {
				extractedHeadings = Array.from(headingElements).map((el) => ({
					id: el.id || '',
					text: el.textContent || '',
					level: parseInt(el.tagName.substring(1)) // H1 -> 1, H2 -> 2, etc.
				}));
				
				console.log('[DocLayout] Extracted', extractedHeadings.length, 'headings for', currentPath);
			} else {
				console.log('[DocLayout] No headings found for', currentPath);
			}
			
			untrack(() => {
				isExtracting = false;
			});
		}, 100);
		
		return () => {
			clearTimeout(timeoutId);
			untrack(() => {
				isExtracting = false;
			});
		};
	});
	
	// Use prop headings if provided, otherwise use extracted headings
	const headings = $derived(propHeadings.length > 0 ? propHeadings : extractedHeadings);
</script>

<!-- Sticky Navigation Container (above layout) -->
<div class="sticky-nav-container">
	<ParaQuickNav />
	<div class="breadcrumb-wrapper">
		<Breadcrumb />
	</div>
</div>

<div class="docs-layout bg-base">
	<!-- Floating TOC (Linear-style) - in left margin -->
	<TableOfContents {headings} />
	
	<!-- Main Content Area - Centered, Full Width -->
	<main class="docs-content bg-base">
		<div class="docs-content-inner">
			<!-- Article Content -->
			<article class="docs-article prose">
				{@render children?.()}
			</article>
		</div>
	</main>
</div>

<style>
	/* Sticky Navigation Container (outside layout) */
	.sticky-nav-container {
		position: sticky;
		top: 0;
		z-index: 100;
		background: var(--color-bg-base);
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
	}
	
	.breadcrumb-wrapper {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 var(--spacing-content-padding);
	}
	
	.docs-layout {
		display: flex;
		min-height: calc(100vh - 120px); /* Account for sticky nav */
		width: 100%;
		position: relative;
	}
	
	.docs-content {
		flex: 1;
		display: flex;
		justify-content: center;
		padding: 2rem var(--spacing-content-padding);
		min-width: 0;
		width: 100%;
	}
	
	.docs-content-inner {
		width: 100%;
		max-width: 900px;
	}
	
	.docs-article {
		width: 100%;
	}
	
	/* Typography and content styling for MDX content */
	.docs-article :global(*) {
		color: var(--color-text-primary);
		line-height: var(--line-height-readable);
		letter-spacing: var(--letter-spacing-readable);
	}
	
	/* Headings */
	.docs-article :global(h1) {
		font-size: 2.25rem;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-text-primary);
		margin-bottom: 1.5rem;
		margin-top: 0;
	}
	
	.docs-article :global(h2) {
		font-size: 1.875rem;
		font-weight: 600;
		line-height: 1.3;
		color: var(--color-text-primary);
		margin-top: 3rem;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--color-border-base);
	}
	
	.docs-article :global(h3) {
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1.4;
		color: var(--color-text-primary);
		margin-top: 2rem;
		margin-bottom: 0.75rem;
	}
	
	.docs-article :global(h4) {
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1.5;
		color: var(--color-text-primary);
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
	}
	
	/* Paragraphs */
	.docs-article :global(p) {
		font-size: 1rem;
		line-height: var(--line-height-readable);
		color: var(--color-text-primary);
		margin-bottom: 1.25rem;
	}
	
	/* Links */
	.docs-article :global(a) {
		color: var(--color-accent-primary);
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: all 0.15s ease;
	}
	
	.docs-article :global(a:hover) {
		color: var(--color-accent-hover);
		border-bottom-color: var(--color-accent-hover);
	}
	
	/* Lists */
	.docs-article :global(ul),
	.docs-article :global(ol) {
		margin-bottom: 1.25rem;
		padding-left: 1.5rem;
		line-height: var(--line-height-readable);
	}
	
	.docs-article :global(li) {
		margin-bottom: 0.5rem;
		color: var(--color-text-primary);
	}
	
	.docs-article :global(li > ul),
	.docs-article :global(li > ol) {
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}
	
	/* Blockquotes */
	.docs-article :global(blockquote) {
		margin: 1.5rem 0;
		padding: var(--spacing-readable-quote-y) 1.5rem;
		background: var(--color-bg-surface);
		border-left: 4px solid var(--color-accent-primary);
		border-radius: 0.375rem;
	}
	
	.docs-article :global(blockquote p) {
		margin-bottom: 0;
		color: var(--color-text-secondary);
		font-style: italic;
	}
	
	/* Code blocks */
	.docs-article :global(pre) {
		margin: 1.5rem 0;
		padding: 1.25rem;
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border-base);
		border-radius: 0.5rem;
		overflow-x: auto;
		font-size: 0.875rem;
		line-height: 1.7;
	}
	
	.docs-article :global(pre code) {
		background: transparent;
		padding: 0;
		border: none;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		color: var(--color-text-primary);
	}
	
	/* Inline code */
	.docs-article :global(code) {
		background: var(--color-bg-surface);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		color: var(--color-text-primary);
		border: 1px solid var(--color-border-base);
	}
	
	/* Tables */
	.docs-article :global(table) {
		width: 100%;
		margin: 1.5rem 0;
		border-collapse: collapse;
		font-size: 0.9375rem;
	}
	
	.docs-article :global(th) {
		background: var(--color-bg-surface);
		padding: 0.75rem 1rem;
		text-align: left;
		font-weight: 600;
		color: var(--color-text-primary);
		border: 1px solid var(--color-border-base);
	}
	
	.docs-article :global(td) {
		padding: 0.75rem 1rem;
		border: 1px solid var(--color-border-base);
		color: var(--color-text-primary);
	}
	
	.docs-article :global(tr:nth-child(even)) {
		background: var(--color-bg-surface);
	}
	
	/* Horizontal rules */
	.docs-article :global(hr) {
		margin: 2.5rem 0;
		border: none;
		border-top: 1px solid var(--color-border-base);
	}
	
	/* Checkboxes in lists */
	.docs-article :global(input[type="checkbox"]) {
		margin-right: 0.5rem;
	}
	
	/* Responsive design */
	@media (max-width: 768px) {
		.docs-content {
			padding: 1.5rem 1rem;
		}
	}
</style>

