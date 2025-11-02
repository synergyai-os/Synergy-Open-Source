<script lang="ts">
	import { Button } from 'bits-ui';
	import { browser } from '$app/environment';
	import { useConvexClient } from 'convex-svelte';
	import { makeFunctionReference } from 'convex/server';
	import { api } from '$lib/convex';

	type Props = {
		inboxItemId?: string; // Inbox item ID (if using real data)
		item: any; // Item from getInboxItemWithDetails query
		onClose: () => void;
	};

	let { inboxItemId, item, onClose }: Props = $props();
	
	const convexClient = browser ? useConvexClient() : null;
	const markProcessedApi = browser ? makeFunctionReference('inbox:markProcessed') as any : null;

	let isLoading = $state(false);
	let generatedFlashcard = $state<any | null>(null);
	let showFlashcard = $state(false);
	let selectedCategory = $state<string>('');

	const mockCategories = ['Product Delivery', 'Product Discovery', 'Leadership'];

	async function handleGenerateFlashcard() {
		isLoading = true;
		showFlashcard = false;

		// Simulate AI processing delay
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Mock flashcard data
		const highlightText = item?.highlight?.text || item?.sourceData?.highlightText || '';
		const sourceTitle = item?.source?.title || item?.sourceData?.bookTitle || 'Unknown';
		const authorName = item?.author?.displayName || item?.sourceData?.author || 'Unknown';
		
		generatedFlashcard = {
			front: `What is ${highlightText.split('.').slice(0, 1)[0]}?`,
			back: highlightText,
			explanation: `From ${sourceTitle} by ${authorName}`
		};

		showFlashcard = true;
		isLoading = false;
	}

	async function handleSave() {
		// TODO: Save flashcard to database
		// For now, mark inbox item as processed
		if (browser && convexClient && markProcessedApi && inboxItemId) {
			try {
				await convexClient.mutation(markProcessedApi, { inboxItemId: inboxItemId as any });
			} catch (error) {
				console.error('Failed to mark as processed:', error);
			}
		}
		onClose();
	}

	async function handleSkip() {
		// Mark as processed without generating flashcard
		if (browser && convexClient && markProcessedApi && inboxItemId) {
			try {
				await convexClient.mutation(markProcessedApi, { inboxItemId: inboxItemId as any });
			} catch (error) {
				console.error('Failed to mark as processed:', error);
			}
		}
		onClose();
	}
</script>

<div class="p-6">
	<!-- Header -->
	<div class="flex items-center gap-icon mb-6">
		<button
			type="button"
			class="flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-hover-solid transition-colors text-secondary hover:text-primary"
			onclick={onClose}
			aria-label="Back to inbox"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 19l-7-7 7-7"
				/>
			</svg>
			<span class="text-sm">Back</span>
		</button>
		<h2 class="text-xl font-bold text-primary flex-1">Readwise Highlight</h2>
	</div>

	<!-- Book Info -->
	{#if item?.source}
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
			<h3 class="font-semibold text-blue-900 mb-1">{item.source.title}</h3>
			{#if item.author}
				<p class="text-sm text-blue-700">by {item.author.displayName}</p>
			{:else if item.authors && item.authors.length > 0}
				<p class="text-sm text-blue-700">
					by {item.authors.map((a: any) => a?.displayName).filter(Boolean).join(', ')}
				</p>
			{/if}
		</div>
	{/if}

	<!-- Highlight Text -->
	{#if item?.highlight}
		<div class="mb-6">
			<p class="text-gray-700 leading-relaxed">{item.highlight.text}</p>
		</div>
	{/if}

	<!-- Tags -->
	{#if item?.tags && item.tags.length > 0}
		<div class="mb-6">
			<p class="text-sm font-medium text-gray-600 mb-2">Tags</p>
			<div class="flex flex-wrap gap-2">
				{#each item.tags as tag}
					<span class="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded">
						{tag.displayName || tag.name}
					</span>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Note -->
	{#if item?.highlight?.note}
		<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
			<p class="text-sm font-medium text-yellow-900 mb-1">Note</p>
			<p class="text-sm text-yellow-800">{item.highlight.note}</p>
		</div>
	{/if}

	<!-- External Link -->
	{#if item?.highlight?.externalUrl}
		<div class="mb-6">
			<a
				href={item.highlight.externalUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
			>
				<span>View in Readwise</span>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
					/>
				</svg>
			</a>
		</div>
	{/if}

	<!-- Generated Flashcard -->
	{#if showFlashcard && generatedFlashcard}
		<div class="border-2 border-green-500 rounded-lg p-6 mb-6 bg-green-50">
			<h3 class="font-semibold text-green-900 mb-4">Generated Flashcard</h3>
			
			<!-- Front -->
			<div class="mb-4">
				<p class="text-sm font-medium text-gray-600 mb-2">Front</p>
				<textarea
					bind:value={generatedFlashcard.front}
					class="w-full p-3 border border-gray-300 rounded-lg resize-none"
					rows="3"
				></textarea>
			</div>

			<!-- Back -->
			<div class="mb-4">
				<p class="text-sm font-medium text-gray-600 mb-2">Back</p>
				<textarea
					bind:value={generatedFlashcard.back}
					class="w-full p-3 border border-gray-300 rounded-lg resize-none"
					rows="5"
				></textarea>
			</div>

			<!-- Category Selector -->
			<div class="mb-4">
				<p class="text-sm font-medium text-gray-600 mb-2">Category</p>
				<select
					bind:value={selectedCategory}
					class="w-full p-2 border border-gray-300 rounded-lg"
				>
					<option value="">Select category...</option>
					{#each mockCategories as category}
						<option value={category}>{category}</option>
					{/each}
				</select>
			</div>
		</div>
	{/if}

	<!-- Actions -->
	<div class="space-y-3">
		{#if !showFlashcard}
			<Button.Root
				onclick={handleGenerateFlashcard}
				disabled={isLoading}
				class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoading ? 'Generating...' : '✨ Generate Flashcard'}
			</Button.Root>
		{/if}

		{#if showFlashcard}
			<Button.Root
				onclick={handleSave}
				class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
			>
				✓ Save Flashcard
			</Button.Root>
		{/if}

		<Button.Root
			onclick={handleSkip}
			class="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
		>
			⏭️ Skip
		</Button.Root>
	</div>

	<!-- Metadata -->
	{#if item?.createdAt}
		<div class="mt-6 pt-6 border-t border-gray-200">
			<div class="flex items-center justify-between text-xs text-gray-500">
				<span>Added {new Date(item.createdAt).toLocaleDateString()}</span>
				{#if item?._id}
					<span>ID: {item._id}</span>
				{/if}
			</div>
		</div>
	{/if}
</div>

