<script lang="ts">
	import HubCard from '$lib/modules/core/components/HubCard.svelte';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { resolveRoute } from '$lib/utils/navigation';

	let visible = $state(false);
	let searchQuery = $state('');

	onMount(() => {
		setTimeout(() => (visible = true), 100);
	});

	// All documentation pages organized by category
	const docsByCategory = [
		{
			id: 'start',
			title: '🚀 START HERE',
			description: 'Essential pages to get up and running',
			pages: [
				{
					icon: '🏠',
					title: 'Home',
					description: 'Overview of SynergyOS and dev-docs',
					href: '/dev-docs',
					badge: 'Start'
				},
				{
					icon: '🔍',
					title: 'Pattern Index',
					description: 'Debug issues in < 2 minutes',
					href: '/dev-docs/2-areas/patterns/INDEX',
					badge: 'Most Used'
				},
				{
					icon: '🚀',
					title: 'Product Vision',
					description: "What we're building & why",
					href: '/marketing-docs/strategy/product-vision-2.0'
				}
			]
		},
		{
			id: 'product',
			title: '📊 PRODUCT & STRATEGY',
			description: 'Vision, metrics, roadmap, and decision-making',
			pages: [
				{
					icon: '💡',
					title: 'Product Principles',
					description: 'How we make decisions',
					href: '/dev-docs/2-areas/product-principles'
				},
				{
					icon: '📊',
					title: 'Metrics & OKRs',
					description: 'Public metrics & success signals',
					href: '/dev-docs/2-areas/metrics'
				},
				{
					icon: '🎯',
					title: 'Product Strategy',
					description: 'Outcome-driven roadmap',
					href: '/marketing-docs/strategy/product-strategy'
				},
				{
					icon: '📝',
					title: 'Product Vision & Plan',
					description: 'Current state & next steps',
					href: '/dev-docs/2-areas/product-vision-and-plan'
				},
				{
					icon: '👥',
					title: 'User Journeys',
					description: 'Target personas & workflows',
					href: '/dev-docs/2-areas/user-journeys'
				}
			]
		},
		{
			id: 'design',
			title: '🎨 DESIGN & UI',
			description: 'Design system, tokens, components, patterns',
			pages: [
				{
					icon: '🎨',
					title: 'Design Tokens',
					description: 'Colors, spacing, typography',
					href: '/dev-docs/2-areas/design-tokens'
				},
				{
					icon: '📐',
					title: 'Design Principles',
					description: 'Visual philosophy & UX',
					href: '/dev-docs/2-areas/design-principles'
				},
				{
					icon: '🧠',
					title: 'Navigation Philosophy',
					description: 'UX psychology & 10-item nav',
					href: '/dev-docs/2-areas/navigation-philosophy',
					badge: 'New'
				},
				{
					icon: '🧩',
					title: 'Component Library',
					description: 'Reusable UI components',
					href: '/dev-docs/2-areas/component-library'
				},
				{
					icon: '🏗️',
					title: 'Component Architecture',
					description: 'Tokens → Utilities → Patterns',
					href: '/dev-docs/2-areas/component-architecture'
				},
				{
					icon: '🎯',
					title: 'UI Patterns',
					description: 'Layout, navigation, forms',
					href: '/dev-docs/2-areas/patterns/ui-patterns'
				}
			]
		},
		{
			id: 'architecture',
			title: '🏗️ ARCHITECTURE & DATA',
			description: 'System design, tech stack, data models',
			pages: [
				{
					icon: '🏗️',
					title: 'Architecture',
					description: 'Tech stack, auth, project structure',
					href: '/dev-docs/2-areas/architecture'
				},
				{
					icon: '📊',
					title: 'Data Models',
					description: 'Database schema & relationships',
					href: '/dev-docs/2-areas/data-models'
				},
				{
					icon: '🔄',
					title: 'Composables Analysis',
					description: 'Svelte 5 composables patterns',
					href: '/dev-docs/2-areas/composables-analysis'
				},
				{
					icon: '🏢',
					title: 'Multi-Tenancy Migration',
					description: 'Orgs/teams architecture',
					href: '/dev-docs/2-areas/multi-tenancy-migration'
				}
			]
		},
		{
			id: 'development',
			title: '💻 DEVELOPMENT WORKFLOW',
			description: 'Git, GitHub, deployment, and development practices',
			pages: [
				{
					icon: '🌿',
					title: 'Git Workflow',
					description: 'Complete guide to Git, GitHub, Vercel, IDE',
					href: '/dev-docs/2-areas/git-workflow',
					badge: 'New'
				},
				{
					icon: '📋',
					title: 'Git Cheat Sheet',
					description: 'Quick reference for daily Git commands',
					href: '/dev-docs/3-resources/git-cheat-sheet',
					badge: 'Cheat Sheet'
				},
				{
					icon: '🚀',
					title: 'Start Me Guide',
					description: 'Get SynergyOS running locally',
					href: '/dev-docs/2-areas/start-me'
				},
				{
					icon: '📦',
					title: 'Deployment Procedures',
					description: 'CI/CD, Vercel, production deployment',
					href: '/dev-docs/3-resources/deployment-procedures'
				}
			]
		},
		{
			id: 'patterns',
			title: '🔍 PATTERNS',
			description: 'Solved problems & best practices',
			pages: [
				{
					icon: '🔍',
					title: 'Pattern Index',
					description: 'Fast symptom lookup table',
					href: '/dev-docs/2-areas/patterns/INDEX',
					badge: 'Debug'
				},
				{
					icon: '⚛️',
					title: 'Svelte Reactivity',
					description: 'Svelte 5 runes & composables',
					href: '/dev-docs/2-areas/patterns/svelte-reactivity'
				},
				{
					icon: '🔌',
					title: 'Convex Integration',
					description: 'Backend patterns & auth',
					href: '/dev-docs/2-areas/patterns/convex-integration'
				},
				{
					icon: '🎨',
					title: 'UI Patterns',
					description: 'Design tokens & layout',
					href: '/dev-docs/2-areas/patterns/ui-patterns'
				},
				{
					icon: '📈',
					title: 'Analytics',
					description: 'PostHog tracking patterns',
					href: '/dev-docs/2-areas/patterns/analytics'
				},
				{
					icon: '🚩',
					title: 'Feature Flags',
					description: 'Progressive rollout strategy',
					href: '/dev-docs/2-areas/patterns/feature-flags'
				}
			]
		},
		{
			id: 'resources',
			title: '📚 RESOURCES',
			description: 'Deployment, testing, workflows, guides',
			pages: [
				{
					icon: '🚀',
					title: 'Trunk-Based Deployment',
					description: 'Ship to production constantly',
					href: '/dev-docs/3-resources/trunk-based-deployment-implementation-summary'
				},
				{
					icon: '🔗',
					title: 'Linear + GitHub Integration',
					description: 'Issue tracking workflow',
					href: '/dev-docs/3-resources/linear-github-integration'
				},
				{
					icon: '🧪',
					title: 'Testing Strategy',
					description: 'Unit, integration, E2E',
					href: '/dev-docs/3-resources/testing-strategy'
				},
				{
					icon: '🚨',
					title: 'Error Handling & Monitoring',
					description: 'Error boundaries & PostHog',
					href: '/dev-docs/3-resources/error-handling-monitoring'
				},
				{
					icon: '📋',
					title: 'Production Checklist',
					description: 'Pre-launch verification',
					href: '/dev-docs/3-resources/production-checklist'
				},
				{
					icon: '📱',
					title: 'Mobile Strategy',
					description: 'iOS/Android deployment',
					href: '/dev-docs/3-resources/mobile-strategy'
				},
				{
					icon: '🔐',
					title: 'Secrets Management',
					description: 'API keys & environment vars',
					href: '/dev-docs/2-areas/secrets-management'
				}
			]
		},
		{
			id: 'contribute',
			title: '🤝 CONTRIBUTE',
			description: 'Join the core team and build with us',
			pages: [
				{
					icon: '🤝',
					title: 'Contributing Guide',
					description: 'How to contribute code',
					href: '/CONTRIBUTING'
				},
				{
					icon: '✅',
					title: 'Validation Framework',
					description: 'How we test assumptions',
					href: '/dev-docs/2-areas/validation-framework'
				},
				{
					icon: '📖',
					title: 'How to Document',
					description: 'Documentation guidelines',
					href: '/dev-docs/2-areas/value-streams/HOW-TO-DOCUMENT'
				}
			]
		}
	];

	// Filtered pages based on search
	let filteredCategories = $derived(() => {
		if (!searchQuery.trim()) return docsByCategory;

		const query = searchQuery.toLowerCase();
		return docsByCategory
			.map((category) => ({
				...category,
				pages: category.pages.filter(
					(page) =>
						page.title.toLowerCase().includes(query) ||
						page.description.toLowerCase().includes(query)
				)
			}))
			.filter((category) => category.pages.length > 0);
	});
</script>

<svelte:head>
	<title>All Documentation - SynergyOS</title>
</svelte:head>

<div class="hub-page">
	{#if visible}
		<header class="hub-header" in:fade={{ duration: 300 }}>
			<h1 class="hub-title">📚 All Documentation</h1>
			<p class="hub-description">
				Browse by category or search for specific topics. Use <kbd>Cmd+K</kbd> for fast access.
			</p>
		</header>

		<div class="hub-search" in:fly={{ y: 20, duration: 300, delay: 100, easing: quintOut }}>
			<svg
				class="search-icon"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<circle cx="11" cy="11" r="8"></circle>
				<path d="m21 21-4.35-4.35"></path>
			</svg>
			<input
				type="text"
				class="search-input"
				placeholder="Search documentation..."
				bind:value={searchQuery}
			/>
			{#if searchQuery}
				<button class="search-clear" onclick={() => (searchQuery = '')} aria-label="Clear search">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			{/if}
		</div>

		<div class="hub-content">
			{#each filteredCategories() as category, categoryIndex (category.id)}
				<section
					class="hub-section"
					in:fly={{ y: 30, duration: 300, delay: 200 + categoryIndex * 50, easing: quintOut }}
				>
					<div class="hub-section-header">
						<h2 class="hub-section-title">{category.title}</h2>
						<p class="hub-section-description">{category.description}</p>
					</div>

					<div class="hub-grid">
						{#each category.pages as page (page.href)}
							<HubCard
								icon={page.icon}
								title={page.title}
								description={page.description}
								href={page.href.startsWith('http') ||
								page.href.startsWith('#') ||
								page.href === '/CONTRIBUTING'
									? page.href
									: resolveRoute(page.href)}
								badge={page.badge}
							/>
						{/each}
					</div>
				</section>
			{/each}

			{#if filteredCategories().length === 0}
				<div class="hub-empty" in:fade={{ duration: 300 }}>
					<div class="hub-empty-icon">🔍</div>
					<h3 class="hub-empty-title">No results found</h3>
					<p class="hub-empty-description">
						Try a different search term or <button
							class="link-button"
							onclick={() => (searchQuery = '')}>browse all docs</button
						>
					</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.hub-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 4rem var(--spacing-content-padding);
	}

	.hub-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.hub-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: 1rem;
		letter-spacing: -0.02em;
	}

	.hub-description {
		font-size: 1.125rem;
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.6;
	}

	.hub-description kbd {
		display: inline-block;
		padding: 0.125rem 0.375rem;
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border-base);
		border-radius: 0.25rem;
		font-size: 0.875rem;
		font-family: monospace;
		color: var(--color-text-primary);
	}

	.hub-search {
		position: relative;
		max-width: 600px;
		margin: 0 auto 4rem auto;
	}

	.search-icon {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-text-tertiary);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 0.875rem 3rem 0.875rem 3rem;
		background: var(--color-bg-surface);
		border: 2px solid var(--color-border-base);
		border-radius: 0.75rem;
		font-size: 1rem;
		color: var(--color-text-primary);
		transition: all 0.2s ease;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.search-input::placeholder {
		color: var(--color-text-tertiary);
	}

	.search-clear {
		position: absolute;
		right: 1rem;
		top: 50%;
		transform: translateY(-50%);
		background: transparent;
		border: none;
		color: var(--color-text-tertiary);
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
	}

	.search-clear:hover {
		background: var(--color-bg-hover);
		color: var(--color-text-primary);
	}

	.hub-content {
		display: flex;
		flex-direction: column;
		gap: 4rem;
	}

	.hub-section {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.hub-section-header {
		border-bottom: 2px solid var(--color-border-base);
		padding-bottom: 1rem;
	}

	.hub-section-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 0.5rem 0;
		letter-spacing: -0.01em;
	}

	.hub-section-description {
		font-size: 0.9375rem;
		color: var(--color-text-secondary);
		margin: 0;
	}

	.hub-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	.hub-empty {
		text-align: center;
		padding: 4rem 2rem;
	}

	.hub-empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	.hub-empty-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
	}

	.hub-empty-description {
		font-size: 1rem;
		color: var(--color-text-secondary);
		margin: 0;
	}

	.link-button {
		background: none;
		border: none;
		color: var(--color-accent-primary);
		text-decoration: underline;
		cursor: pointer;
		font-size: inherit;
		padding: 0;
	}

	.link-button:hover {
		color: var(--color-accent-hover);
	}

	/* Token: --breakpoint-md (768px) from design-system.json */
	@media (max-width: 768px) {
		.hub-page {
			padding: 2rem 1.5rem;
		}

		.hub-title {
			font-size: 2rem;
		}

		.hub-description {
			font-size: 1rem;
		}

		.hub-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.search-input,
		.search-clear {
			transition: none;
		}
	}
</style>
