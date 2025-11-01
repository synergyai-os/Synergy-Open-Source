<script lang="ts">
	import { useQuery, useMutation } from 'convex-svelte';
	import { api } from '$lib/convex';

	let testResponse = $state<string | null>(null);
	let isTesting = $state(false);
	let error = $state<string | null>(null);

	// Get user settings to check if Readwise API key is configured
	const settings = useQuery(api.settings.getUserSettings);

	async function testReadwise() {
		isTesting = true;
		error = null;
		testResponse = null;

		try {
			// TODO: Call Convex action/mutation to test Readwise API
			// For now, just show a placeholder response
			await new Promise((resolve) => setTimeout(resolve, 1000));
			testResponse = `✅ Readwise API Test Response (placeholder)\n\nThis is a placeholder response. Actual Readwise API integration coming soon.\n\nTest: Fetching highlights and books from Readwise...`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to test Readwise API';
		} finally {
			isTesting = false;
		}
	}

	async function testReadwiseHighlights() {
		isTesting = true;
		error = null;
		testResponse = null;

		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			testResponse = `✅ Readwise Highlights Test (placeholder)\n\nThis would fetch your highlights from Readwise.\n\nTest successful!`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to fetch highlights';
		} finally {
			isTesting = false;
		}
	}

	async function testReadwiseBooks() {
		isTesting = true;
		error = null;
		testResponse = null;

		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			testResponse = `✅ Readwise Books Test (placeholder)\n\nThis would fetch your books from Readwise.\n\nTest successful!`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to fetch books';
		} finally {
			isTesting = false;
		}
	}
</script>

<div class="h-full overflow-y-auto p-inbox-container">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-2xl font-bold text-primary mb-2">Readwise API Test</h1>
		<p class="text-secondary mb-6">
			Quick test page to validate Readwise API integration. This is a learning/development page.
		</p>

		<!-- API Key Status -->
		<div class="bg-base border border-border-elevated rounded-lg p-4 mb-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="font-medium text-primary mb-1">API Key Status</p>
					<p class="text-sm text-secondary">
						{#if settings?.isLoading}
							Loading...
						{:else if settings?.data?.hasReadwiseKey}
							✅ Readwise API key is configured
						{:else}
							⚠️ Readwise API key not configured. Go to Settings to add your API key.
						{/if}
					</p>
				</div>
			</div>
		</div>

		<!-- Test Actions -->
		<div class="bg-base border border-border-elevated rounded-lg p-6 mb-6">
			<p class="font-medium text-primary mb-4">Test Actions</p>
			<div class="flex flex-wrap gap-3">
				<button
					type="button"
					onclick={testReadwise}
					disabled={isTesting}
					class="px-4 py-2 bg-accent-primary text-accent-primary-foreground rounded-md hover:bg-accent-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isTesting ? 'Testing...' : 'Test Connection'}
				</button>
				<button
					type="button"
					onclick={testReadwiseHighlights}
					disabled={isTesting}
					class="px-4 py-2 bg-accent-primary text-accent-primary-foreground rounded-md hover:bg-accent-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isTesting ? 'Fetching...' : 'Fetch Highlights'}
				</button>
				<button
					type="button"
					onclick={testReadwiseBooks}
					disabled={isTesting}
					class="px-4 py-2 bg-accent-primary text-accent-primary-foreground rounded-md hover:bg-accent-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isTesting ? 'Fetching...' : 'Fetch Books'}
				</button>
			</div>
		</div>

		<!-- Error Display -->
		{#if error}
			<div class="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6">
				<p class="text-destructive font-medium">Error</p>
				<p class="text-sm text-destructive mt-1">{error}</p>
			</div>
		{/if}

		<!-- Response Display -->
		{#if testResponse}
			<div class="bg-base border border-border-elevated rounded-lg p-6">
				<p class="font-medium text-primary mb-3">Response</p>
				<pre class="text-sm text-secondary whitespace-pre-wrap font-mono bg-base border border-border rounded p-4 overflow-x-auto">{testResponse}</pre>
			</div>
		{/if}

		<!-- Instructions -->
		<div class="mt-6 bg-base border border-border-elevated rounded-lg p-6">
			<p class="font-medium text-primary mb-2">📚 How to Use</p>
			<ul class="list-disc list-inside space-y-1 text-sm text-secondary">
				<li>Click "Test Connection" to verify API key is valid</li>
				<li>Click "Fetch Highlights" to test fetching your highlights</li>
				<li>Click "Fetch Books" to test fetching your books</li>
				<li>This is a quick & dirty test page for development</li>
			</ul>
		</div>
	</div>
</div>

