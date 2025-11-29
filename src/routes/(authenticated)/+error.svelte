<script lang="ts">
	import { page } from '$app/state';
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$lib/utils/navigation';

	// Check if we're in development mode
	let isDev = $derived(dev);

	// Get the status and error message
	let status = $derived(page.status);
	let message = $derived(page.error?.message || 'An error occurred');

	function goHome() {
		goto(resolveRoute('/inbox'));
	}

	function goBack() {
		history.back();
	}
</script>

<!-- Main Content -->
<div class="h-full overflow-y-auto bg-base">
	<div class="mx-auto max-w-2xl px-page" style="padding-block: var(--spacing-12);">
		<!-- Error Content -->
		<div class="mb-marketing-content text-center">
			<!-- Status Code -->
			<div class="mb-content-section inline-block">
				<div class="text-error-status leading-none font-light text-tertiary">
					{status}
				</div>
			</div>

			{#if status === 404}
				<h1 class="mb-form-section text-h2 font-normal text-primary">Page not found</h1>
				<p class="mx-auto max-w-md text-body text-secondary">
					The page you're looking for doesn't exist or has been moved.
				</p>
			{:else if status === 500}
				<h1 class="mb-form-section text-h2 font-normal text-primary">Something went wrong</h1>
				<p class="mx-auto max-w-md text-body text-secondary">
					We're working to fix it. Please try again in a moment.
				</p>
			{:else}
				<h1 class="mb-form-section text-h2 font-normal text-primary">
					{message}
				</h1>
			{/if}
		</div>

		<!-- Development details (only show in dev mode) -->
		{#if isDev && page.error}
			<div class="p-card border-base mb-content-padding rounded-button border bg-surface">
				<div class="mb-form-section flex items-center gap-2">
					<span class="text-label font-medium tracking-wider text-tertiary uppercase">
						Development Info
					</span>
				</div>
				{#if page.error?.message}
					<div>
						<span class="text-small mb-badge-y block font-medium text-secondary">Message:</span>
						<code
							class="border-base text-small p-form-field-gap block rounded border bg-base text-left break-all text-primary"
						>
							{page.error.message}
						</code>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Action Buttons -->
		<div class="gap-form-section flex flex-col justify-center sm:flex-row">
			<button
				onclick={goHome}
				class="text-small bg-accent-primary hover:bg-accent-hover rounded-button px-button-x py-button-y font-medium text-white transition-colors duration-150"
			>
				Go to Inbox
			</button>

			<button
				onclick={goBack}
				class="border-base text-small hover:bg-hover-solid rounded-button border bg-surface px-button-x py-button-y font-medium text-primary transition-colors duration-150"
			>
				Go Back
			</button>
		</div>
	</div>
</div>
