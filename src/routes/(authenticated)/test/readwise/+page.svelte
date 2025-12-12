<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { useConvexClient } from 'convex-svelte';
	import { makeFunctionReference } from 'convex/server';
	import type { FunctionReference } from 'convex/server';

	let testResponse = $state<string | null>(null);
	let isTesting = $state(false);
	let error = $state<string | null>(null);

	// Get Convex client
	const convexClient = browser ? useConvexClient() : null;

	// Settings state
	let settings = $state<{
		isLoading: boolean;
		data: { hasReadwiseKey: boolean } | null;
	}>({ isLoading: true, data: null });

	// Load settings
	onMount(async () => {
		if (!browser || !convexClient) {
			settings = { isLoading: false, data: null };
			return;
		}

		try {
			const sessionId = $page.data.sessionId;
			if (!sessionId) {
				settings = { isLoading: false, data: null };
				return;
			}
			const getUserSettings = makeFunctionReference(
				'settings:getUserSettings'
			) as FunctionReference<
				'query',
				'public',
				{ sessionId: string },
				{ hasClaudeKey?: boolean; hasReadwiseKey?: boolean } | null
			>;
			const data = await convexClient.query(getUserSettings, { sessionId });
			settings = {
				isLoading: false,
				data: data ? { hasReadwiseKey: data.hasReadwiseKey || false } : null
			};
		} catch (_e) {
			settings = { isLoading: false, data: null };
		}
	});

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

<div class="px-page py-page h-full overflow-y-auto">
	<div class="mx-auto max-w-4xl">
		<h1 class="text-primary mb-2 text-2xl font-bold">Readwise API Test</h1>
		<p class="text-secondary mb-6">
			Quick test page to validate Readwise API integration. This is a learning/development page.
		</p>

		<!-- API Key Status -->
		<div class="border-border-elevated bg-base mb-6 rounded-lg border p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-primary mb-1 font-medium">API Key Status</p>
					<p class="text-secondary text-sm">
						{#if settings.isLoading}
							Loading...
						{:else if settings.data?.hasReadwiseKey}
							✅ Readwise API key is configured
						{:else}
							⚠️ Readwise API key not configured. Go to Settings to add your API key.
						{/if}
					</p>
				</div>
			</div>
		</div>

		<!-- Test Actions -->
		<div class="border-border-elevated bg-base mb-6 rounded-lg border p-6">
			<p class="text-primary mb-4 font-medium">Test Actions</p>
			<div class="flex flex-wrap gap-3">
				<button
					type="button"
					onclick={testReadwise}
					disabled={isTesting}
					class="text-accent-primary-foreground hover:bg-accent-primary-hover bg-accent-primary rounded-md px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isTesting ? 'Testing...' : 'Test Connection'}
				</button>
				<button
					type="button"
					onclick={testReadwiseHighlights}
					disabled={isTesting}
					class="text-accent-primary-foreground hover:bg-accent-primary-hover bg-accent-primary rounded-md px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isTesting ? 'Fetching...' : 'Fetch Highlights'}
				</button>
				<button
					type="button"
					onclick={testReadwiseBooks}
					disabled={isTesting}
					class="text-accent-primary-foreground hover:bg-accent-primary-hover bg-accent-primary rounded-md px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isTesting ? 'Fetching...' : 'Fetch Books'}
				</button>
			</div>
		</div>

		<!-- Error Display -->
		{#if error}
			<div class="bg-destructive/10 border-destructive mb-6 rounded-lg border p-4">
				<p class="text-destructive font-medium">Error</p>
				<p class="text-destructive mt-1 text-sm">{error}</p>
			</div>
		{/if}

		<!-- Response Display -->
		{#if testResponse}
			<div class="border-border-elevated bg-base rounded-lg border p-6">
				<p class="text-primary mb-3 font-medium">Response</p>
				<pre
					class="border-border bg-base font-code text-secondary overflow-x-auto rounded border p-4 text-sm whitespace-pre-wrap">{testResponse}</pre>
			</div>
		{/if}

		<!-- Instructions -->
		<div class="border-border-elevated bg-base mt-6 rounded-lg border p-6">
			<p class="text-primary mb-2 font-medium">📚 How to Use</p>
			<ul class="text-secondary list-inside list-disc space-y-1 text-sm">
				<li>Click "Test Connection" to verify API key is valid</li>
				<li>Click "Fetch Highlights" to test fetching your highlights</li>
				<li>Click "Fetch Books" to test fetching your books</li>
				<li>This is a quick & dirty test page for development</li>
			</ul>
		</div>
	</div>
</div>
