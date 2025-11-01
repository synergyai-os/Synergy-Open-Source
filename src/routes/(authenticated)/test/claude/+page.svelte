<script lang="ts">
	import { useQuery, useMutation } from 'convex-svelte';
	import { api } from '$lib/convex';

	let testInput = $state('');
	let testResponse = $state<string | null>(null);
	let isTesting = $state(false);
	let error = $state<string | null>(null);

	// Get user settings to check if Claude API key is configured
	const settings = useQuery(api.settings.getUserSettings);

	async function testClaude() {
		if (!testInput.trim()) {
			error = 'Please enter some text to test';
			return;
		}

		isTesting = true;
		error = null;
		testResponse = null;

		try {
			// TODO: Call Convex action/mutation to test Claude API
			// For now, just show a placeholder response
			await new Promise((resolve) => setTimeout(resolve, 1000));
			testResponse = `✅ Claude API Test Response (placeholder)\n\nInput: ${testInput}\n\nThis is a placeholder response. Actual Claude API integration coming soon.`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to test Claude API';
		} finally {
			isTesting = false;
		}
	}
</script>

<div class="h-full overflow-y-auto p-inbox-container">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-2xl font-bold text-primary mb-2">Claude API Test</h1>
		<p class="text-secondary mb-6">
			Quick test page to validate Claude API integration. This is a learning/development page.
		</p>

		<!-- API Key Status -->
		<div class="bg-base border border-border-elevated rounded-lg p-4 mb-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="font-medium text-primary mb-1">API Key Status</p>
					<p class="text-sm text-secondary">
						{#if settings?.isLoading}
							Loading...
						{:else if settings?.data?.hasClaudeKey}
							✅ Claude API key is configured
						{:else}
							⚠️ Claude API key not configured. Go to Settings to add your API key.
						{/if}
					</p>
				</div>
			</div>
		</div>

		<!-- Test Form -->
		<div class="bg-base border border-border-elevated rounded-lg p-6 mb-6">
			<label for="test-input" class="block text-sm font-medium text-primary mb-2">
				Test Input
			</label>
			<textarea
				id="test-input"
				bind:value={testInput}
				placeholder="Enter some text to test Claude API..."
				class="w-full px-3 py-2 bg-base border border-border rounded-md text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent resize-none"
				rows="4"
			></textarea>
			<button
				type="button"
				onclick={testClaude}
				disabled={isTesting || !testInput.trim()}
				class="mt-4 px-4 py-2 bg-accent-primary text-accent-primary-foreground rounded-md hover:bg-accent-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isTesting ? 'Testing...' : 'Test Claude API'}
			</button>
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
				<li>Enter any text in the test input field</li>
				<li>Click "Test Claude API" to send a request</li>
				<li>The response will show if the integration is working</li>
				<li>This is a quick & dirty test page for development</li>
			</ul>
		</div>
	</div>
</div>

