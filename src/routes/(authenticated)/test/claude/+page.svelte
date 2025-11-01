<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { makeFunctionReference } from 'convex/server';

	let testInput = $state('');
	let flashcard = $state<{ question: string; answer: string } | null>(null);
	let isGenerating = $state(false);
	let error = $state<string | null>(null);

	// Get Convex client
	const convexClient = browser ? useConvexClient() : null;
	
	// Settings state
	let settings = $state<{
		isLoading: boolean;
		data: { hasClaudeKey: boolean } | null;
	}>({ isLoading: true, data: null });

	// Load settings
	onMount(async () => {
		if (!browser || !convexClient) {
			settings = { isLoading: false, data: null };
			return;
		}

		try {
			const getUserSettings = makeFunctionReference('settings:getUserSettings');
			const data = await convexClient.query(getUserSettings, {});
			settings = {
				isLoading: false,
				data: data ? { hasClaudeKey: data.hasClaudeKey || false } : null
			};
		} catch (e) {
			settings = { isLoading: false, data: null };
		}
	});

	async function generateFlashcard() {
		if (!testInput.trim()) {
			error = 'Please enter some text to generate a flashcard from';
			return;
		}

		if (!settings.data?.hasClaudeKey) {
			error = 'Claude API key is not configured. Please add your API key in Settings first.';
			return;
		}

		isGenerating = true;
		error = null;
		flashcard = null;

		try {
			if (!convexClient) {
				throw new Error('Convex client not available');
			}

			const generateFlashcardAction = makeFunctionReference('generateFlashcard:generateFlashcard');
			const result = await convexClient.action(generateFlashcardAction, {
				text: testInput,
			});

			if (result.success && result.flashcard) {
				flashcard = result.flashcard;
			} else {
				throw new Error('Failed to generate flashcard');
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to generate flashcard';
		} finally {
			isGenerating = false;
		}
	}
</script>

<div class="h-full overflow-y-auto bg-base">
	<div class="max-w-4xl mx-auto p-inbox-container">
		<!-- Page Header -->
		<div class="mb-6">
			<h1 class="text-2xl font-bold text-primary mb-2">Claude Flashcard Generator</h1>
			<p class="text-sm font-normal text-secondary">
				Test Claude API integration by generating flashcards from your text input
			</p>
		</div>

		<!-- API Key Status Card -->
		<div class="bg-elevated border border-border-elevated rounded-md p-4 mb-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-primary mb-1">API Key Status</p>
					<p class="text-sm text-secondary">
						{#if settings.isLoading}
							Loading...
						{:else if settings.data?.hasClaudeKey}
							<span class="text-green-600 dark:text-green-400">✅ Claude API key is configured</span>
						{:else}
							<span class="text-orange-600 dark:text-orange-400">⚠️ Claude API key not configured.</span>
							<a href="/settings" class="text-accent-primary hover:underline ml-1">Go to Settings</a>
						{/if}
					</p>
				</div>
			</div>
		</div>

		<!-- Input Form Card -->
		<div class="bg-elevated border border-border-elevated rounded-md p-6 mb-6">
			<label for="test-input" class="block text-sm font-medium text-primary mb-2">
				Input Text
			</label>
			<p class="text-xs text-tertiary mb-3">
				Enter any text you want to convert into a flashcard question and answer
			</p>
			<textarea
				id="test-input"
				bind:value={testInput}
				placeholder="Example: The Build-Measure-Learn cycle is a fundamental concept in lean startup methodology..."
				class="w-full px-3 py-2 bg-base border border-border rounded-md text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent resize-none transition-all"
				rows="6"
				disabled={isGenerating}
			></textarea>
			<button
				type="button"
				onclick={generateFlashcard}
				disabled={isGenerating || !testInput.trim() || !settings.data?.hasClaudeKey}
				class="mt-4 px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
			>
				{isGenerating ? 'Generating...' : 'Generate Flashcard'}
			</button>
		</div>

		<!-- Error Display -->
		{#if error}
			<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
				<p class="text-sm font-medium text-red-900 dark:text-red-200 mb-1">Error</p>
				<p class="text-sm text-red-700 dark:text-red-300">{error}</p>
			</div>
		{/if}

		<!-- Flashcard Display -->
		{#if flashcard}
			<div class="bg-elevated border border-border-elevated rounded-md overflow-hidden mb-6">
				<!-- Flashcard Header -->
				<div class="bg-surface border-b border-border px-6 py-4">
					<p class="text-sm font-medium text-primary">Generated Flashcard</p>
				</div>

				<!-- Flashcard Content -->
				<div class="p-6 space-y-6">
					<!-- Question -->
					<div>
						<p class="text-xs font-medium text-tertiary uppercase tracking-wider mb-2">Question</p>
						<div class="bg-base border border-border rounded-md p-4">
							<p class="text-base text-primary leading-relaxed">{flashcard.question}</p>
						</div>
					</div>

					<!-- Answer -->
					<div>
						<p class="text-xs font-medium text-tertiary uppercase tracking-wider mb-2">Answer</p>
						<div class="bg-base border border-border rounded-md p-4">
							<p class="text-base text-primary leading-relaxed whitespace-pre-wrap">{flashcard.answer}</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Instructions Card -->
		<div class="bg-surface border border-border-elevated rounded-md p-6">
			<p class="text-sm font-medium text-primary mb-3">📚 How to Use</p>
			<ul class="space-y-2 text-sm text-secondary">
				<li class="flex items-start gap-2">
					<span class="text-tertiary mt-1">•</span>
					<span>Enter any text (notes, article excerpts, book highlights, etc.) in the input field</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-tertiary mt-1">•</span>
					<span>Click "Generate Flashcard" to send the text to Claude API</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-tertiary mt-1">•</span>
					<span>Claude will create a question and answer format optimized for learning and retention</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-tertiary mt-1">•</span>
					<span>The generated flashcard will appear below once processing is complete</span>
				</li>
			</ul>
		</div>
	</div>
</div>
