<script lang="ts">
	import DocSidebar from './DocSidebar.svelte';
	import TableOfContents from './TableOfContents.svelte';
	
	type Props = {
		children?: any;
		headings?: { id: string; text: string; level: number }[];
	};
	
	let { children, headings = [] }: Props = $props();
</script>

<div class="docs-layout">
	<!-- Sidebar -->
	<aside class="docs-sidebar bg-sidebar border-r border-base">
		<DocSidebar />
	</aside>
	
	<!-- Main Content -->
	<main class="docs-content bg-primary">
		<article class="docs-article">
			{@render children?.()}
		</article>
	</main>
	
	<!-- Table of Contents -->
	<aside class="docs-toc bg-surface border-l border-base">
		<TableOfContents {headings} />
	</aside>
</div>

<style>
	.docs-layout {
		display: grid;
		grid-template-columns: 240px 1fr 200px;
		min-height: 100vh;
	}
	
	.docs-sidebar {
		position: sticky;
		top: 0;
		height: 100vh;
		overflow-y: auto;
		padding: var(--spacing-content);
	}
	
	.docs-content {
		padding: var(--spacing-section) var(--spacing-content);
		max-width: 900px;
		margin: 0 auto;
		width: 100%;
	}
	
	.docs-toc {
		position: sticky;
		top: 0;
		height: 100vh;
		overflow-y: auto;
		padding: var(--spacing-content);
	}
	
	@media (max-width: 1024px) {
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
	}
</style>

