<script lang="ts">
	const sections = [
		{
			title: '📖 Getting Started',
			items: [
				{ title: 'README', href: '/docs/README' },
				{ title: 'Quick Start', href: '/dev-docs/test' }
			]
		},
		{
			title: '📂 2-areas (Ongoing)',
			items: [
				{ title: 'Product Vision', href: '/docs/2-areas/product-vision-and-plan' },
				{ title: 'Architecture', href: '/docs/2-areas/architecture' },
				{ title: 'Design Tokens', href: '/docs/2-areas/design-tokens' },
				{ title: 'Composables', href: '/docs/2-areas/composables-analysis' }
			]
		},
		{
			title: '🔍 Patterns',
			items: [
				{ title: 'Pattern Index', href: '/docs/2-areas/patterns/INDEX' },
				{ title: 'Svelte Reactivity', href: '/docs/2-areas/patterns/svelte-reactivity' },
				{ title: 'Convex Integration', href: '/docs/2-areas/patterns/convex-integration' },
				{ title: 'UI Patterns', href: '/docs/2-areas/patterns/ui-patterns' },
				{ title: 'Analytics', href: '/docs/2-areas/patterns/analytics' }
			]
		},
		{
			title: '🎯 Value Streams',
			items: [
				{ title: 'Overview', href: '/docs/2-areas/value-streams/README' },
				{ title: 'Documentation System', href: '/docs/2-areas/value-streams/documentation-system/README' },
				{ title: 'How to Document', href: '/docs/2-areas/value-streams/HOW-TO-DOCUMENT' }
			]
		},
		{
			title: '📚 3-resources (Reference)',
			items: [
				{ title: 'Production Checklist', href: '/docs/3-resources/production-checklist' },
				{ title: 'Testing Strategy', href: '/docs/3-resources/testing-strategy' },
				{ title: 'Mobile Strategy', href: '/docs/3-resources/mobile-strategy' }
			]
		}
	];
</script>

<nav class="doc-nav">
	<div class="doc-nav-header">
		<h2 class="text-sidebar-primary font-semibold text-sm">Documentation</h2>
	</div>
	
	{#each sections as section}
		<div class="doc-section">
			<h3 class="text-sidebar-secondary text-label font-medium mb-2">
				{section.title}
			</h3>
			<ul class="space-y-1">
				{#each section.items as item}
					<li>
						<a
							href={item.href}
							class="block px-nav-item py-1 rounded-md text-sidebar-primary hover:bg-hover-subtle transition-colors text-sm"
						>
							{item.title}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>

<style>
	.doc-nav {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-section);
	}
	
	.doc-nav-header {
		padding-bottom: var(--spacing-md);
		border-bottom: 1px solid var(--color-border);
	}
	
	.doc-section {
		display: flex;
		flex-direction: column;
	}
</style>

