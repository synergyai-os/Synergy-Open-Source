<script lang="ts">
	import DocSidebar from './DocSidebar.svelte';
	import TableOfContents from './TableOfContents.svelte';
	
	type Props = {
		children?: any;
		headings?: { id: string; text: string; level: number }[];
	};
	
	let { children, headings = [] }: Props = $props();
</script>

<div class="docs-layout bg-base">
	<!-- Sidebar Navigation -->
	<aside class="docs-sidebar bg-sidebar border-r border-sidebar">
		<DocSidebar />
	</aside>
	
	<!-- Main Content Area -->
	<main class="docs-content bg-base">
		<article class="docs-article prose">
			{@render children?.()}
		</article>
	</main>
	
	<!-- Table of Contents (Right Rail) -->
	<aside class="docs-toc bg-surface border-l border-base">
		<TableOfContents {headings} />
	</aside>
</div>

<style>
	.docs-layout {
		display: grid;
		grid-template-columns: 260px 1fr 220px;
		min-height: 100vh;
		width: 100%;
	}
	
	.docs-sidebar {
		position: sticky;
		top: 0;
		height: 100vh;
		overflow-y: auto;
		padding: var(--spacing-content-padding);
	}
	
	.docs-content {
		padding: 3rem var(--spacing-content-padding);
		max-width: 800px;
		margin: 0 auto;
		width: 100%;
	}
	
	/* Typography and content styling for MDX content */
	.docs-article {
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
	
	.docs-toc {
		position: sticky;
		top: 0;
		height: 100vh;
		overflow-y: auto;
		padding: var(--spacing-content-padding);
	}
	
	/* Responsive design */
	@media (max-width: 1280px) {
		.docs-layout {
			grid-template-columns: 240px 1fr;
		}
		
		.docs-toc {
			display: none;
		}
	}
	
	@media (max-width: 768px) {
		.docs-layout {
			grid-template-columns: 1fr;
		}
		
		.docs-sidebar {
			display: none;
		}
		
		.docs-content {
			padding: 2rem 1.5rem;
		}
	}
</style>

