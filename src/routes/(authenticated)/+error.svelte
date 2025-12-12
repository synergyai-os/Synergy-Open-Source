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
		goto(resolveRoute('/auth/redirect'));
	}

	function goBack() {
		history.back();
	}
</script>

<!-- Main Content -->
<div class="bg-base h-full overflow-y-auto">
	<div class="px-page mx-auto max-w-2xl" style="padding-block: var(--spacing-12);">
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
			<div class="p-card border-base mb-content-padding rounded-button bg-surface border">
				<div class="mb-form-section flex items-center gap-2">
					<span class="text-label text-tertiary font-medium tracking-wider uppercase">
						Development Info
					</span>
				</div>
				{#if page.error?.message}
					<div>
						<span class="text-small mb-badge-y text-secondary block font-medium">Message:</span>
						<code
							class="border-base text-small p-form-field-gap bg-base text-primary block rounded border text-left break-all"
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
				class="text-small rounded-button bg-accent-primary px-button-x py-button-y hover:bg-accent-hover font-medium text-white transition-colors duration-150"
			>
				Go to Inbox
			</button>

			<button
				onclick={goBack}
				class="border-base text-small hover:bg-hover-solid rounded-button bg-surface px-button-x py-button-y text-primary border font-medium transition-colors duration-150"
			>
				Go Back
			</button>
		</div>
	</div>
</div>
