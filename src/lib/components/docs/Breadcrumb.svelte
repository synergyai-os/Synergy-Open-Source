<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { resolveRoute } from '$lib/utils/navigation';

	// Utility: Strip PARA numbering (1-, 2-, 3-, 4-) from folder names
	function cleanParaName(name: string): string {
		return name.replace(/^\d+-/, '');
	}

	// Map URL segments to readable names
	const segmentMap: Record<string, string> = {
		'dev-docs': 'Documentation',
		'marketing-docs': 'Marketing',
		'2-areas': 'Core Areas',
		'3-resources': 'Resources',
		patterns: 'Patterns',
		strategy: 'Strategy',
		audience: 'Audience',
		opportunities: 'Opportunities',
		'value-streams': 'Value Streams',
		'design-tokens': 'Design Tokens',
		'component-library': 'Component Library',
		'ui-patterns': 'UI Patterns',
		'user-journeys': 'User Journeys',
		architecture: 'Architecture',
		'data-models': 'Data Models',
		'multi-tenancy-migration': 'Multi-Tenancy',
		'composables-analysis': 'Composables',
		INDEX: 'Pattern Index',
		'svelte-reactivity': 'Svelte Reactivity',
		'convex-integration': 'Convex Integration',
		analytics: 'Analytics',
		'feature-flags': 'Feature Flags',
		metrics: 'Metrics & OKRs',
		'product-vision-2.0': 'Product Vision 2.0',
		'product-vision-and-plan': 'Original Vision',
		'product-strategy': 'Product Strategy',
		'target-personas': 'Target Personas',
		'marketplace-strategy': 'Marketplace',
		'validation-framework': 'Validation Framework',
		'confidentiality-guidelines': 'Confidentiality Rules',
		'testing-strategy': 'Testing Strategy',
		'production-checklist': 'Production Checklist',
		'mobile-strategy': 'Mobile Strategy',
		'deployment-procedures': 'Deployment Procedures',
		'git-workflow': 'Git Workflow',
		'linear-github-integration': 'Linear Integration',
		'error-handling-monitoring': 'Error Handling',
		'design-principles': 'Design Principles',
		'navigation-philosophy': 'Navigation Philosophy',
		'start-me': 'Start Here'
	};

	// Generate breadcrumbs from current path
	const breadcrumbs = $derived.by(() => {
		const path = $page.url.pathname;
		const segments = path.split('/').filter(Boolean);

		return segments.map((segment, index) => {
			const href = '/' + segments.slice(0, index + 1).join('/');

			// Clean PARA prefix first, then check mapping
			const cleanSegment = cleanParaName(segment);
			const label =
				segmentMap[cleanSegment] ||
				segmentMap[segment] || // Keep original check for backwards compat
				cleanSegment.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

			return { label, href };
		});
	});

	// Check for reduced motion preference
	let prefersReducedMotion = false;
	if (typeof window !== 'undefined') {
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mediaQuery.matches;
	}
</script>

{#if breadcrumbs.length > 0}
	<nav aria-label="Breadcrumb" class="breadcrumb-nav">
		<ol class="breadcrumb-list">
			<!-- Home link -->
			<li
				class="breadcrumb-item"
				in:fly={{ x: -10, duration: prefersReducedMotion ? 0 : 250, delay: 0, easing: quintOut }}
			>
				<a href={resolveRoute('/')} class="breadcrumb-link">
					<svg
						class="breadcrumb-home-icon"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
						<polyline points="9 22 9 12 15 12 15 22"></polyline>
					</svg>
					<span class="sr-only">Home</span>
				</a>
			</li>

			<!-- Dynamic breadcrumbs -->
			{#each breadcrumbs as crumb, index}
				<li
					class="breadcrumb-item"
					in:fly={{
						x: -10,
						duration: prefersReducedMotion ? 0 : 250,
						delay: prefersReducedMotion ? 0 : (index + 1) * 40,
						easing: quintOut
					}}
				>
					<span class="breadcrumb-separator" aria-hidden="true">/</span>
					{#if index === breadcrumbs.length - 1}
						<!-- Current page (not a link) -->
						<span class="breadcrumb-current" aria-current="page">
							{crumb.label}
						</span>
					{:else}
						<!-- Intermediate links -->
						<a href={resolveRoute(crumb.href)} class="breadcrumb-link">
							{crumb.label}
						</a>
					{/if}
				</li>
			{/each}
		</ol>
	</nav>
{/if}

<style lang="postcss">
	.breadcrumb-nav {
		padding: 1rem 0;
		border-bottom: 1px solid var(--color-border-base);
		background: var(--color-bg-base);
	}

	.breadcrumb-list {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.breadcrumb-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.breadcrumb-separator {
		font-size: 0.875rem;
		color: var(--color-text-tertiary);
		user-select: none;
	}

	.breadcrumb-link {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		text-decoration: none;
		transition: color 0.15s ease;
		line-height: 1;
	}

	.breadcrumb-link:hover {
		color: var(--color-accent-primary);
	}

	.breadcrumb-home-icon {
		flex-shrink: 0;
	}

	.breadcrumb-current {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		line-height: 1;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	/* Responsive: Simplify on mobile */
	@media (max-width: 768px) {
		.breadcrumb-nav {
			padding: 0.75rem 0 1rem 0;
		}

		.breadcrumb-link,
		.breadcrumb-current,
		.breadcrumb-separator {
			font-size: 0.8125rem;
		}
	}
</style>
