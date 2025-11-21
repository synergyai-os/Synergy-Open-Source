<!--
  Error Boundary Component
  
  Wraps potentially unstable components to catch and handle errors gracefully.
  Prevents entire app from crashing when a component fails.
  
  Usage:
    <ErrorBoundary fallback={ErrorFallback}>
      <RiskyNewFeature />
    </ErrorBoundary>
  
  With custom fallback:
    <ErrorBoundary>
      <RiskyComponent />
      {#snippet fallback()}
        <div>Something went wrong. Please refresh.</div>
      {/snippet}
    </ErrorBoundary>
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { reportError } from '$lib/utils/errorReporting';
	import { Button } from '$lib/components/atoms';

	interface Props {
		/** Child components to wrap */
		children: import('svelte').Snippet;
		/** Fallback UI to show when error occurs */
		fallback?: import('svelte').Snippet<[Error]>;
		/** Component name for error tracking */
		componentName?: string;
		/** Feature flag associated with this component (for rollback) */
		featureFlag?: string;
		/** Callback when error occurs */
		onError?: (error: Error) => void;
	}

	let {
		children,
		fallback,
		componentName = 'UnknownComponent',
		featureFlag,
		onError
	}: Props = $props();

	let error = $state<Error | null>(null);
	let errorInfo = $state<string>('');

	// Track if we've already reported this error to prevent duplicates
	let errorReported = false;

	/**
	 * Handle errors caught by the boundary
	 */
	function handleError(err: Error) {
		error = err;
		errorInfo = err.stack || err.message;

		// Report to PostHog (only once)
		if (!errorReported) {
			reportError({
				error: err,
				componentName,
				featureFlag,
				errorBoundary: true,
				context: {
					timestamp: Date.now(),
					userAgent: navigator.userAgent
				}
			});
			errorReported = true;
		}

		// Call custom error handler if provided
		if (onError) {
			onError(err);
		}

		// Log to console in development
		if (import.meta.env.DEV) {
			console.error('ErrorBoundary caught:', {
				component: componentName,
				error: err,
				featureFlag
			});
		}
	}

	/**
	 * Reset error state (for retry functionality)
	 */
	export function resetError() {
		error = null;
		errorInfo = '';
		errorReported = false;
	}

	// Set up global error listener for this component's errors
	onMount(() => {
		const errorHandler = (event: ErrorEvent) => {
			// Only handle errors if we haven't already caught one
			if (!error) {
				event.preventDefault();
				handleError(event.error);
			}
		};

		window.addEventListener('error', errorHandler);

		return () => {
			window.removeEventListener('error', errorHandler);
		};
	});
</script>

{#if error}
	{#if fallback}
		{@render fallback(error)}
	{:else}
		<!-- Default fallback UI -->
		<div class="error-boundary-fallback">
			<div class="error-boundary-content">
				<h2 class="error-boundary-title">Something went wrong</h2>
				<p class="error-boundary-message">
					We've been notified and will fix this issue as soon as possible.
				</p>

				{#if import.meta.env.DEV}
					<!-- Show error details in development -->
					<details class="error-boundary-details">
						<summary>Error Details (dev only)</summary>
						<pre class="error-boundary-stack">{errorInfo}</pre>
					</details>
				{/if}

				<div class="error-boundary-actions">
					<Button variant="primary" onclick={() => resetError()}>Try Again</Button>
					<Button variant="outline" onclick={() => window.location.reload()}>Reload Page</Button>
				</div>
			</div>
		</div>
	{/if}
{:else}
	<!-- Render children normally if no error -->
	{@render children()}
{/if}

<style>
	.error-boundary-fallback {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-content-padding);
		min-height: 300px;
	}

	.error-boundary-content {
		max-width: 500px;
		text-align: center;
	}

	.error-boundary-title {
		font-size: var(--font-size-h2);
		font-weight: var(--font-weight-h2);
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-form-field-gap);
	}

	.error-boundary-message {
		font-size: var(--font-size-button);
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-form-section-gap);
	}

	.error-boundary-details {
		margin-top: var(--spacing-form-field-gap);
		margin-bottom: var(--spacing-form-section-gap);
		text-align: left;
	}

	.error-boundary-details summary {
		cursor: pointer;
		color: var(--color-text-secondary);
		font-size: var(--font-size-badge);
		margin-bottom: var(--spacing-form-field-gap);
	}

	.error-boundary-stack {
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border-base);
		border-radius: var(--border-radius-button);
		padding: var(--spacing-input-x);
		overflow-x: auto;
		font-size: var(--font-size-badge);
		font-family: monospace;
		color: var(--color-error-text);
		max-height: 300px;
	}

	.error-boundary-actions {
		display: flex;
		gap: var(--spacing-icon-gap);
		justify-content: center;
	}
</style>
