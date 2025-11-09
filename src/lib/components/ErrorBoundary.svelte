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
					userAgent: navigator.userAgent,
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
				featureFlag,
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
					<button 
						class="error-boundary-retry"
						onclick={() => resetError()}
					>
						Try Again
					</button>
					<button 
						class="error-boundary-reload"
						onclick={() => window.location.reload()}
					>
						Reload Page
					</button>
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
		padding: var(--spacing-page);
		min-height: 300px;
	}
	
	.error-boundary-content {
		max-width: 500px;
		text-align: center;
	}
	
	.error-boundary-title {
		font-size: var(--font-size-heading-2);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-stack-sm);
	}
	
	.error-boundary-message {
		font-size: var(--font-size-body);
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-stack-lg);
	}
	
	.error-boundary-details {
		margin-top: var(--spacing-stack-md);
		margin-bottom: var(--spacing-stack-lg);
		text-align: left;
	}
	
	.error-boundary-details summary {
		cursor: pointer;
		color: var(--color-text-secondary);
		font-size: var(--font-size-small);
		margin-bottom: var(--spacing-stack-sm);
	}
	
	.error-boundary-stack {
		background: var(--color-surface-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-inset-md);
		overflow-x: auto;
		font-size: var(--font-size-small);
		font-family: var(--font-family-mono);
		color: var(--color-text-error);
		max-height: 300px;
	}
	
	.error-boundary-actions {
		display: flex;
		gap: var(--spacing-inline-sm);
		justify-content: center;
	}
	
	.error-boundary-retry,
	.error-boundary-reload {
		padding: var(--spacing-inset-button);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-body);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: all 0.2s;
		border: 1px solid var(--color-border);
	}
	
	.error-boundary-retry {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}
	
	.error-boundary-retry:hover {
		background: var(--color-primary-hover);
		border-color: var(--color-primary-hover);
	}
	
	.error-boundary-reload {
		background: transparent;
		color: var(--color-text-primary);
	}
	
	.error-boundary-reload:hover {
		background: var(--color-surface-secondary);
	}
</style>

