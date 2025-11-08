<script lang="ts">
	import { page } from '$app/stores';
	
	const sections = [
		{
			title: '📖 Getting Started',
			items: [
				{ title: 'README', href: '/dev-docs/README' },
				{ title: 'Quick Start', href: '/dev-docs/test' }
			]
		},
		{
			title: '📂 2-areas (Ongoing)',
			items: [
				{ title: 'Product Vision', href: '/dev-docs/2-areas/product-vision-and-plan' },
				{ title: 'Architecture', href: '/dev-docs/2-areas/architecture' },
				{ title: 'Design Tokens', href: '/dev-docs/2-areas/design-tokens' },
				{ title: 'Composables', href: '/dev-docs/2-areas/composables-analysis' }
			]
		},
		{
			title: '🔍 Patterns',
			items: [
				{ title: 'Pattern Index', href: '/dev-docs/2-areas/patterns/INDEX' },
				{ title: 'Svelte Reactivity', href: '/dev-docs/2-areas/patterns/svelte-reactivity' },
				{ title: 'Convex Integration', href: '/dev-docs/2-areas/patterns/convex-integration' },
				{ title: 'UI Patterns', href: '/dev-docs/2-areas/patterns/ui-patterns' },
				{ title: 'Analytics', href: '/dev-docs/2-areas/patterns/analytics' }
			]
		},
		{
			title: '🎯 Value Streams',
			items: [
				{ title: 'Overview', href: '/dev-docs/2-areas/value-streams/README' },
				{ title: 'Documentation System', href: '/dev-docs/2-areas/value-streams/documentation-system/START-HERE' },
				{ title: 'How to Document', href: '/dev-docs/2-areas/value-streams/HOW-TO-DOCUMENT' }
			]
		},
		{
			title: '📚 3-resources (Reference)',
			items: [
				{ title: 'Production Checklist', href: '/dev-docs/3-resources/production-checklist' },
				{ title: 'Testing Strategy', href: '/dev-docs/3-resources/testing-strategy' },
				{ title: 'Mobile Strategy', href: '/dev-docs/3-resources/mobile-strategy' }
			]
		}
	];
	
	// Derive active state based on current path
	function isActive(href: string): boolean {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}
</script>

<nav class="doc-nav">
	<!-- Header -->
	<div class="doc-nav-header">
		<h2 class="font-semibold text-base" style="color: var(--color-sidebar-text-primary)">
			Documentation
		</h2>
	</div>
	
	<!-- Sections -->
	{#each sections as section}
		<div class="doc-section">
			<h3
				class="text-label font-medium mb-2 uppercase tracking-wide"
				style="color: var(--color-sidebar-text-tertiary)"
			>
				{section.title}
			</h3>
			<ul class="doc-list">
				{#each section.items as item}
					<li>
						<a
							href={item.href}
							class="doc-link {isActive(item.href) ? 'active' : ''}"
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
		gap: 1.5rem;
	}
	
	.doc-nav-header {
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-sidebar-border);
	}
	
	.doc-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.doc-list {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}
	
	.doc-link {
		display: block;
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-sidebar-text-secondary);
		transition: all 0.15s ease;
		text-decoration: none;
	}
	
	.doc-link:hover {
		background: var(--color-sidebar-hover);
		color: var(--color-sidebar-text-primary);
	}
	
	.doc-link.active {
		background: var(--color-sidebar-active);
		color: var(--color-sidebar-text-primary);
		font-weight: 500;
	}
</style>

