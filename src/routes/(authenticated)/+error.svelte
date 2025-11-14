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
	<div class="mx-auto max-w-2xl px-6 py-16">
		<!-- Error Content -->
		<div class="mb-12 text-center">
			<!-- Status Code -->
			<div class="mb-6 inline-block">
				<div class="text-[120px] leading-none font-light text-tertiary">
					{status}
				</div>
			</div>

			{#if status === 404}
				<h1 class="mb-3 text-2xl font-normal text-primary">Page not found</h1>
				<p class="mx-auto max-w-md text-base text-secondary">
					The page you're looking for doesn't exist or has been moved.
				</p>
			{:else if status === 500}
				<h1 class="mb-3 text-2xl font-normal text-primary">Something went wrong</h1>
				<p class="mx-auto max-w-md text-base text-secondary">
					We're working to fix it. Please try again in a moment.
				</p>
			{:else}
				<h1 class="mb-3 text-2xl font-normal text-primary">
					{message}
				</h1>
			{/if}
		</div>

		<!-- Development details (only show in dev mode) -->
		{#if isDev && page.error}
			<div class="mb-8 rounded-md border border-base bg-surface p-4">
				<div class="mb-3 flex items-center gap-icon">
					<span class="text-label font-medium tracking-wider text-tertiary uppercase">
						Development Info
					</span>
				</div>
				{#if page.error?.message}
					<div>
						<span class="mb-1 block text-sm font-medium text-secondary">Message:</span>
						<code
							class="block rounded border border-base bg-base p-2 text-left text-sm break-all text-primary"
						>
							{page.error.message}
						</code>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Action Buttons -->
		<div class="flex flex-col justify-center gap-3 sm:flex-row">
			<button
				onclick={goHome}
				class="rounded-md bg-accent-primary px-6 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover"
			>
				Go to Inbox
			</button>

			<button
				onclick={goBack}
				class="rounded-md border border-base bg-surface px-6 py-2 text-sm font-medium text-primary transition-colors duration-150 hover:bg-hover-solid"
			>
				Go Back
			</button>
		</div>
	</div>
</div>
