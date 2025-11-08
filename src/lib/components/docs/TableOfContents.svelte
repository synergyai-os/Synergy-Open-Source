<script lang="ts">
	type Props = {
		headings?: { id: string; text: string; level: number }[];
	};
	
	let { headings = [] }: Props = $props();
	
	let activeId = $state('');
	
	// TODO: Implement scroll tracking for active heading
</script>

<nav class="toc">
	<h4 class="text-sidebar-secondary font-medium text-label mb-3">On This Page</h4>
	
	{#if headings.length > 0}
		<ul class="toc-list">
			{#each headings as heading}
				<li class="toc-item level-{heading.level}">
					<a
						href="#{heading.id}"
						class="toc-link text-sidebar-primary hover:text-primary transition-colors"
						class:active={activeId === heading.id}
					>
						{heading.text}
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-sidebar-tertiary text-sm">No headings found</p>
	{/if}
</nav>

<style>
	.toc {
		display: flex;
		flex-direction: column;
	}
	
	.toc-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}
	
	.toc-item {
		list-style: none;
	}
	
	.toc-link {
		display: block;
		font-size: var(--font-size-sm);
		padding: var(--spacing-xs) 0;
		text-decoration: none;
		border-left: 2px solid transparent;
		padding-left: var(--spacing-sm);
	}
	
	.toc-link:hover,
	.toc-link.active {
		border-left-color: var(--color-accent);
	}
	
	.level-2 {
		padding-left: var(--spacing-sm);
	}
	
	.level-3 {
		padding-left: var(--spacing-md);
	}
	
	.level-4 {
		padding-left: var(--spacing-lg);
	}
</style>

