<script lang="ts">
	import { page } from '$app/stores';
	import { resolveRoute } from '$lib/utils/navigation';
	import { ThemeToggle } from '$lib/components/molecules';

	// PARA navigation items
	const paraItems = [
		{
			id: '1-projects',
			label: 'Projects',
			href: '/dev-docs/1-projects',
			description: 'Active work'
		},
		{
			id: '2-areas',
			label: 'Areas',
			href: '/dev-docs/2-areas',
			description: 'Ongoing domains'
		},
		{
			id: '3-resources',
			label: 'Resources',
			href: '/dev-docs/3-resources',
			description: 'Reference materials'
		},
		{
			id: '4-archive',
			label: 'Archive',
			href: '/dev-docs/4-archive',
			description: 'Completed projects'
		}
	];

	// Check if current path matches
	function isActive(item: (typeof paraItems)[0]): boolean {
		const currentPath = $page.url.pathname;
		return currentPath.startsWith(`/dev-docs/${item.id}`);
	}
</script>

<nav class="para-quick-nav" aria-label="PARA Navigation">
	<div class="para-nav-content">
		{#each paraItems as item (item.id)}
			<a
				href={resolveRoute(item.href)}
				class="para-nav-item"
				class:active={isActive(item)}
				aria-current={isActive(item) ? 'page' : undefined}
				aria-label="{item.label} - {item.description}"
			>
				<span class="para-nav-label">{item.label}</span>
				<span class="para-nav-description" aria-hidden="true">{item.description}</span>
			</a>
		{/each}
		<div class="para-nav-actions">
			<ThemeToggle />
		</div>
	</div>
</nav>

<style>
	.para-quick-nav {
		background: var(--color-bg-base);
		border-bottom: 1px solid var(--color-border-base);
		padding: 0.5rem var(--spacing-content-padding);
	}

	.para-nav-content {
		display: flex;
		gap: 0.25rem;
		max-width: 900px;
		margin: 0 auto;
		align-items: center;
		justify-content: space-between;
	}

	.para-nav-actions {
		display: flex;
		align-items: center;
		margin-left: auto;
	}

	.para-nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		text-decoration: none;
		transition: all 0.15s ease;
		position: relative;
		min-width: 80px;
	}

	.para-nav-label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		transition: color 0.15s ease;
		white-space: nowrap;
	}

	.para-nav-description {
		font-size: 0.6875rem;
		color: var(--color-text-tertiary);
		white-space: nowrap;
		display: none;
	}

	/* Hover state */
	.para-nav-item:hover {
		background: var(--color-bg-surface);
	}

	.para-nav-item:hover .para-nav-label {
		color: var(--color-accent-primary);
	}

	.para-nav-item:hover .para-nav-description {
		display: block;
		color: var(--color-text-secondary);
	}

	/* Active state (Linear-style underline) */
	.para-nav-item.active {
		background: transparent;
	}

	.para-nav-item.active .para-nav-label {
		color: var(--color-text-primary);
		font-weight: 600;
	}

	.para-nav-item.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--color-accent-primary);
		border-radius: 2px 2px 0 0;
	}

	/* Mobile responsiveness */
	/* Token: --breakpoint-md (768px) from design-system.json */
	@media (max-width: 768px) {
		.para-quick-nav {
			padding: 0.5rem 1rem;
		}

		.para-nav-content {
			justify-content: space-between;
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
		}

		.para-nav-item {
			padding: 0.5rem 0.75rem;
			min-width: 70px;
			flex-shrink: 0;
		}

		.para-nav-label {
			font-size: 0.75rem;
		}

		.para-nav-description {
			display: none !important; /* Hide descriptions on mobile (no hover) */
		}

		.para-nav-actions {
			flex-shrink: 0;
			margin-left: 0.5rem;
		}
	}
</style>
