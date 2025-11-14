<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { useConvexClient } from 'convex-svelte';
	import { makeFunctionReference } from 'convex/server';
	import type { FunctionReference } from 'convex/server';
	import { resolveRoute } from '$lib/utils/navigation';

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

			const generateFlashcardAction = makeFunctionReference(
				'generateFlashcard:generateFlashcard'
			) as FunctionReference<
				'action',
				'public',
				{ sessionId: string; text: string; sourceTitle?: string; sourceAuthor?: string },
				{ success: boolean; flashcard?: { question: string; answer: string } }
			>;
			const sessionId = $page.data.sessionId;
			if (!sessionId) {
				throw new Error('Session ID is required');
			}
			const result = await convexClient.action(generateFlashcardAction, {
				sessionId,
				text: testInput.trim()
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
	<div class="mx-auto max-w-4xl p-inbox-container">
		<!-- Page Header -->
		<div class="mb-6">
			<h1 class="mb-2 text-2xl font-bold text-primary">Claude Flashcard Generator</h1>
			<p class="text-sm font-normal text-secondary">
				Test Claude API integration by generating flashcards from your text input
			</p>
		</div>

		<!-- API Key Status Card -->
		<div class="mb-6 rounded-md border border-border-elevated bg-elevated p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="mb-1 text-sm font-medium text-primary">API Key Status</p>
					<p class="text-sm text-secondary">
						{#if settings.isLoading}
							Loading...
						{:else if settings.data?.hasClaudeKey}
							<span class="text-green-600 dark:text-green-400">✅ Claude API key is configured</span
							>
						{:else}
							<span class="text-orange-600 dark:text-orange-400"
								>⚠️ Claude API key not configured.</span
							>
							<a href={resolveRoute('/settings')} class="ml-1 text-accent-primary hover:underline"
								>Go to Settings</a
							>
						{/if}
					</p>
				</div>
			</div>
		</div>

		<!-- Input Form Card -->
		<div class="mb-6 rounded-md border border-border-elevated bg-elevated p-6">
			<label for="test-input" class="mb-2 block text-sm font-medium text-primary">
				Input Text
			</label>
			<p class="mb-3 text-xs text-tertiary">
				Enter any text you want to convert into a flashcard question and answer
			</p>
			<textarea
				id="test-input"
				bind:value={testInput}
				placeholder="Example: The Build-Measure-Learn cycle is a fundamental concept in lean startup methodology..."
				class="border-border placeholder-secondary w-full resize-none rounded-md border bg-base px-3 py-2 text-primary transition-all focus:border-transparent focus:ring-2 focus:ring-accent-primary focus:outline-none"
				rows="6"
				disabled={isGenerating}
			></textarea>
			<button
				type="button"
				onclick={generateFlashcard}
				disabled={isGenerating || !testInput.trim() || !settings.data?.hasClaudeKey}
				class="hover:bg-accent-primary-hover mt-4 rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isGenerating ? 'Generating...' : 'Generate Flashcard'}
			</button>
		</div>

		<!-- Error Display -->
		{#if error}
			<div
				class="mb-6 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
			>
				<p class="mb-1 text-sm font-medium text-red-900 dark:text-red-200">Error</p>
				<p class="text-sm text-red-700 dark:text-red-300">{error}</p>
			</div>
		{/if}

		<!-- Flashcard Display -->
		{#if flashcard}
			<div class="mb-6 overflow-hidden rounded-md border border-border-elevated bg-elevated">
				<!-- Flashcard Header -->
				<div class="border-border border-b bg-surface px-6 py-4">
					<p class="text-sm font-medium text-primary">Generated Flashcard</p>
				</div>

				<!-- Flashcard Content -->
				<div class="space-y-6 p-6">
					<!-- Question -->
					<div>
						<p class="mb-2 text-xs font-medium tracking-wider text-tertiary uppercase">Question</p>
						<div class="border-border rounded-md border bg-base p-4">
							<p class="text-base leading-relaxed text-primary">{flashcard.question}</p>
						</div>
					</div>

					<!-- Answer -->
					<div>
						<p class="mb-2 text-xs font-medium tracking-wider text-tertiary uppercase">Answer</p>
						<div class="border-border rounded-md border bg-base p-4">
							<p class="text-base leading-relaxed whitespace-pre-wrap text-primary">
								{flashcard.answer}
							</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Instructions Card -->
		<div class="rounded-md border border-border-elevated bg-surface p-6">
			<p class="mb-3 text-sm font-medium text-primary">📚 How to Use</p>
			<ul class="space-y-2 text-sm text-secondary">
				<li class="flex items-start gap-2">
					<span class="mt-1 text-tertiary">•</span>
					<span
						>Enter any text (notes, article excerpts, book highlights, etc.) in the input field</span
					>
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-1 text-tertiary">•</span>
					<span>Click "Generate Flashcard" to send the text to Claude API</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-1 text-tertiary">•</span>
					<span
						>Claude will create a question and answer format optimized for learning and retention</span
					>
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-1 text-tertiary">•</span>
					<span>The generated flashcard will appear below once processing is complete</span>
				</li>
			</ul>
		</div>
	</div>
</div>
