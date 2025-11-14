<script lang="ts">
	import { resolve } from '$app/paths';

	interface Props {
		icon: string;
		title: string;
		description: string;
		href: string;
		badge?: string;
	}

	let { icon, title, description, href, badge }: Props = $props();
</script>

<a {href} class="hub-card">
	<div class="hub-card-icon">{icon}</div>
	<div class="hub-card-content">
		<h3 class="hub-card-title">
			{title}
			{#if badge}
				<span class="hub-card-badge">{badge}</span>
			{/if}
		</h3>
		<p class="hub-card-description">{description}</p>
	</div>
	<svg
		class="hub-card-arrow"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
	>
		<path d="M5 12h14M12 5l7 7-7 7" />
	</svg>
</a>

<style>
	.hub-card {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1.5rem;
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border-base);
		border-radius: 0.75rem;
		text-decoration: none;
		transition: all 0.2s ease;
	}

	.hub-card:hover {
		border-color: var(--color-accent-primary);
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
	}

	.hub-card-icon {
		font-size: 2.5rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.hub-card-content {
		flex: 1;
		min-width: 0;
	}

	.hub-card-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 0.25rem 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.hub-card-badge {
		font-size: 0.625rem;
		padding: 0.25rem 0.5rem;
		background: var(--color-accent-primary);
		color: white;
		border-radius: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 700;
	}

	.hub-card-description {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin: 0;
	}

	.hub-card-arrow {
		opacity: 0;
		transform: translateX(-4px);
		transition: all 0.2s ease;
		color: var(--color-accent-primary);
		flex-shrink: 0;
		margin-top: 0.25rem;
	}

	.hub-card:hover .hub-card-arrow {
		opacity: 1;
		transform: translateX(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.hub-card {
			transition: none;
		}

		.hub-card:hover {
			transform: none;
		}

		.hub-card-arrow {
			transition: none;
		}
	}
</style>
