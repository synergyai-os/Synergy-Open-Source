<script lang="ts">
	import { browser } from '$app/environment';
	
	type Props = {
		headings?: { id: string; text: string; level: number }[];
	};
	
	let { headings = [] }: Props = $props();
	
	let activeId = $state('');
	
	// Scroll tracking for active heading
	$effect(() => {
		if (!browser) return;
		
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						activeId = entry.target.id;
					}
				});
			},
			{ rootMargin: '-100px 0px -66%' }
		);
		
		// Observe all headings
		const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
		headingElements.forEach((el) => observer.observe(el));
		
		return () => {
			headingElements.forEach((el) => observer.unobserve(el));
		};
	});
</script>

<nav class="toc">
	<h4 class="toc-header">On This Page</h4>
	
	{#if headings.length > 0}
		<ul class="toc-list">
			{#each headings as heading}
				<li class="toc-item level-{heading.level}">
					<a
						href="#{heading.id}"
						class="toc-link"
						class:active={activeId === heading.id}
					>
						{heading.text}
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="toc-empty">No headings found</p>
	{/if}
</nav>

<style>
	.toc {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.toc-header {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-tertiary);
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--color-border-base);
	}
	
	.toc-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.toc-item {
		list-style: none;
	}
	
	.toc-link {
		display: block;
		font-size: 0.8125rem;
		line-height: 1.5;
		color: var(--color-text-secondary);
		text-decoration: none;
		border-left: 2px solid transparent;
		padding: 0.25rem 0 0.25rem 0.75rem;
		transition: all 0.15s ease;
	}
	
	.toc-link:hover {
		color: var(--color-text-primary);
		border-left-color: var(--color-border-elevated);
	}
	
	.toc-link.active {
		color: var(--color-accent-primary);
		border-left-color: var(--color-accent-primary);
		font-weight: 500;
	}
	
	/* Indent levels */
	.level-2 .toc-link {
		padding-left: 0.75rem;
	}
	
	.level-3 .toc-link {
		padding-left: 1.5rem;
	}
	
	.level-4 .toc-link {
		padding-left: 2.25rem;
	}
	
	.toc-empty {
		font-size: 0.875rem;
		color: var(--color-text-tertiary);
		font-style: italic;
	}
</style>

