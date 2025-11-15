<script lang="ts">
	import { page } from '$app/stores';
	import { resolveRoute } from '$lib/utils/navigation';

	const statusCode = $derived($page.status);
	const message = $derived($page.error?.message || 'Page not found');
</script>

<svelte:head>
	<title>{statusCode} - Dev Docs</title>
</svelte:head>

<div class="error-page">
	<div class="error-content">
		<h1 class="error-code">{statusCode}</h1>
		<h2 class="error-title">Documentation Not Found</h2>
		<p class="error-message">{message}</p>

		<div class="error-actions">
			<a href={resolveRoute('/dev-docs/README')} class="btn-primary"> ← Back to Docs Home </a>
			<a href={resolveRoute('/dev-docs/2-areas/patterns/INDEX')} class="btn-secondary">
				View Pattern Index
			</a>
		</div>

		<details class="error-debug">
			<summary>Debug Info</summary>
			<pre>{JSON.stringify($page.error, null, 2)}</pre>
		</details>
	</div>
</div>

<style>
	.error-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: var(--spacing-content-padding);
	}

	.error-content {
		max-width: 600px;
		text-align: center;
	}

	.error-code {
		font-size: 4rem;
		font-weight: 700;
		color: var(--color-text-tertiary);
		margin: 0 0 1rem 0;
		line-height: 1;
	}

	.error-title {
		font-size: 1.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 1rem 0;
	}

	.error-message {
		font-size: 1rem;
		color: var(--color-text-secondary);
		margin: 0 0 2rem 0;
		line-height: var(--line-height-readable);
	}

	.error-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 2rem;
	}

	.btn-primary,
	.btn-secondary {
		display: inline-flex;
		align-items: center;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-size: 0.9375rem;
		font-weight: 500;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.btn-primary {
		background: var(--color-accent-primary);
		color: white;
	}

	.btn-primary:hover {
		background: var(--color-accent-hover);
	}

	.btn-secondary {
		background: var(--color-bg-surface);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border-base);
	}

	.btn-secondary:hover {
		background: var(--color-bg-hover-solid);
	}

	.error-debug {
		margin-top: 2rem;
		padding: 1rem;
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border-base);
		border-radius: 0.5rem;
		text-align: left;
	}

	.error-debug summary {
		cursor: pointer;
		font-weight: 500;
		color: var(--color-text-secondary);
		user-select: none;
	}

	.error-debug summary:hover {
		color: var(--color-text-primary);
	}

	.error-debug pre {
		margin-top: 1rem;
		padding: 1rem;
		background: var(--color-bg-base);
		border-radius: 0.375rem;
		font-size: 0.8125rem;
		color: var(--color-text-primary);
		overflow-x: auto;
	}
</style>
