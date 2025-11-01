<script lang="ts">
	import { page } from '$app/state';
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';

	// Check if we're in development mode
	let isDev = $derived(dev);
	
	// Get the status and error message
	let status = $derived(page.status);
	let message = $derived(page.error?.message || 'An error occurred');
	
	function goHome() {
		goto('/inbox');
	}
	
	function goBack() {
		history.back();
	}
</script>

<!-- Main Content -->
<div class="h-full overflow-y-auto bg-base">
	<div class="max-w-2xl mx-auto py-16 px-6">
		<!-- Error Content -->
		<div class="text-center mb-12">
			<!-- Status Code -->
			<div class="inline-block mb-6">
				<div class="text-[120px] font-light text-tertiary leading-none">
					{status}
				</div>
			</div>
			
			{#if status === 404}
				<h1 class="text-2xl font-normal text-primary mb-3">
					Page not found
				</h1>
				<p class="text-base text-secondary max-w-md mx-auto">
					The page you're looking for doesn't exist or has been moved.
				</p>
			{:else if status === 500}
				<h1 class="text-2xl font-normal text-primary mb-3">
					Something went wrong
				</h1>
				<p class="text-base text-secondary max-w-md mx-auto">
					We're working to fix it. Please try again in a moment.
				</p>
			{:else}
				<h1 class="text-2xl font-normal text-primary mb-3">
					{message}
				</h1>
			{/if}
		</div>

		<!-- Development details (only show in dev mode) -->
		{#if isDev && page.error}
			<div class="mb-8 p-4 bg-surface rounded-md border border-base">
				<div class="flex items-center gap-icon mb-3">
					<span class="text-label font-medium text-tertiary uppercase tracking-wider">
						Development Info
					</span>
				</div>
				{#if page.error?.message}
					<div>
						<span class="text-sm font-medium text-secondary block mb-1">Message:</span>
						<code class="block text-sm text-primary break-all text-left p-2 bg-base rounded border border-base">
							{page.error.message}
						</code>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Action Buttons -->
		<div class="flex flex-col sm:flex-row gap-3 justify-center">
			<button
				onclick={goHome}
				class="px-6 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-hover transition-colors duration-150 font-medium text-sm"
			>
				Go to Inbox
			</button>
			
			<button
				onclick={goBack}
				class="px-6 py-2 bg-surface border border-base text-primary rounded-md hover:bg-hover-solid transition-colors duration-150 font-medium text-sm"
			>
				Go Back
			</button>
		</div>
	</div>
</div>

