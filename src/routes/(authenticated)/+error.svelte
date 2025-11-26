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
<div class="bg-base h-full overflow-y-auto">
	<div class="mx-auto max-w-2xl px-content-padding" style="padding-block: var(--spacing-12);">
		<!-- Error Content -->
		<div class="mb-marketing-content text-center">
			<!-- Status Code -->
			<div class="mb-content-section inline-block">
				<div class="text-error-status text-tertiary leading-none font-light">
					{status}
				</div>
			</div>

			{#if status === 404}
				<h1 class="mb-form-section text-h2 text-primary font-normal">Page not found</h1>
				<p class="text-body text-secondary mx-auto max-w-md">
					The page you're looking for doesn't exist or has been moved.
				</p>
			{:else if status === 500}
				<h1 class="mb-form-section text-h2 text-primary font-normal">Something went wrong</h1>
				<p class="text-body text-secondary mx-auto max-w-md">
					We're working to fix it. Please try again in a moment.
				</p>
			{:else}
				<h1 class="mb-form-section text-h2 text-primary font-normal">
					{message}
				</h1>
			{/if}
		</div>

		<!-- Development details (only show in dev mode) -->
		{#if isDev && page.error}
			<div class="p-card border-base bg-surface mb-content-padding rounded-button border">
				<div class="mb-form-section flex items-center gap-2">
					<span class="text-label text-tertiary font-medium tracking-wider uppercase">
						Development Info
					</span>
				</div>
				{#if page.error?.message}
					<div>
						<span class="text-small text-secondary mb-badge-y block font-medium">Message:</span>
						<code
							class="border-base bg-base text-small text-primary block rounded border p-form-field-gap text-left break-all"
						>
							{page.error.message}
						</code>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Action Buttons -->
		<div class="flex flex-col justify-center gap-form-section sm:flex-row">
			<button
				onclick={goHome}
				class="text-small rounded-button bg-accent-primary px-button-x py-button-y font-medium text-white transition-colors duration-150 hover:bg-accent-hover"
			>
				Go to Inbox
			</button>

			<button
				onclick={goBack}
				class="border-base bg-surface text-small text-primary hover:bg-hover-solid rounded-button border px-button-x py-button-y font-medium transition-colors duration-150"
			>
				Go Back
			</button>
		</div>
	</div>
</div>
