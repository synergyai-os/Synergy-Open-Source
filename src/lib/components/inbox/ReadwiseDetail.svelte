<script lang="ts">
	import { Button, DropdownMenu } from 'bits-ui';
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
	let loadingMessage = $state('');
	let generatedFlashcard = $state<any | null>(null);
	let showFlashcard = $state(false);
	let selectedCategory = $state<string>('');
	let headerMenuOpen = $state(false);

	const mockCategories = ['Product Delivery', 'Product Discovery', 'Leadership'];

	async function handleGenerateFlashcard() {
		isLoading = true;
		showFlashcard = false;
		loadingMessage = 'Analyzing highlight...';

		// Simulate AI processing with progress messages
		await new Promise((resolve) => setTimeout(resolve, 800));
		loadingMessage = 'Generating flashcard question...';
		
		await new Promise((resolve) => setTimeout(resolve, 700));
		loadingMessage = 'Creating answer content...';
		
		await new Promise((resolve) => setTimeout(resolve, 500));

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
		loadingMessage = '';
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

<div class="flex flex-col h-full">
	<!-- Sticky Header - Linear Style -->
	<div
		class="sticky top-0 z-10 bg-surface border-b border-base px-inbox-header py-system-header h-system-header flex items-center justify-between flex-shrink-0"
	>
		<!-- Left: Back Button + Title -->
		<div class="flex items-center gap-icon">
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
			<h2 class="text-sm font-normal text-secondary">Readwise Highlight</h2>
		</div>

		<!-- Right: Actions Menu -->
		<div class="flex items-center gap-icon">
			<DropdownMenu.Root bind:open={headerMenuOpen}>
				<DropdownMenu.Trigger
					type="button"
					class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-hover-solid transition-colors text-secondary hover:text-primary"
					aria-label="More options"
				>
					<svg
						class="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
						/>
					</svg>
				</DropdownMenu.Trigger>

				<DropdownMenu.Portal>
					<DropdownMenu.Content
						class="bg-elevated rounded-md shadow-lg border border-base min-w-[180px] py-1 z-50"
						side="bottom"
						align="end"
						sideOffset={4}
					>
						<DropdownMenu.Item
							class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer flex items-center justify-between focus:bg-hover-solid outline-none"
							textValue="Generate Flashcard"
							onSelect={() => {
								if (!isLoading && !showFlashcard) {
									handleGenerateFlashcard();
								}
								headerMenuOpen = false;
							}}
						>
							<span class="font-normal">✨ Generate Flashcard</span>
						</DropdownMenu.Item>

						<DropdownMenu.Separator class="h-px bg-base my-1" />

						<DropdownMenu.Item
							class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer flex items-center justify-between focus:bg-hover-solid outline-none"
							textValue="Skip"
							onSelect={() => {
								handleSkip();
								headerMenuOpen = false;
							}}
						>
							<span class="font-normal">⏭️ Skip</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Portal>
			</DropdownMenu.Root>
		</div>
	</div>

	<!-- Two-Column Layout: Main Content + Sidebar -->
	<div class="flex flex-1 overflow-hidden">
		<!-- Main Content Area - Hero Highlight Text -->
		<div class="flex-1 overflow-y-auto">
			<div class="max-w-3xl mx-auto px-inbox-container py-inbox-container">
				<!-- Hero Highlight Text - Always Visible, Top Priority -->
				{#if item?.highlight}
					<div class="mb-12">
						<p class="text-2xl text-primary leading-relaxed font-normal">
							{item.highlight.text}
						</p>
					</div>
				{/if}

				<!-- Loading State (in main content, below highlight) -->
				{#if isLoading}
					<div class="mb-8 p-inbox-container bg-elevated border border-base rounded-lg">
						<div class="flex flex-col items-center gap-4 py-6">
							<!-- Loading Spinner -->
							<svg
								class="w-8 h-8 animate-spin text-accent-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
							<!-- Loading Message -->
							<div class="flex flex-col items-center gap-1">
								<p class="text-sm font-medium text-primary">{loadingMessage}</p>
								<p class="text-xs text-tertiary">This may take a few seconds...</p>
							</div>
						</div>
					</div>
				{/if}

				<!-- Generated Flashcard (appears below highlight in main content) -->
				{#if showFlashcard && generatedFlashcard && !isLoading}
					<div
						class="mb-8 border-2 border-accent-primary rounded-lg p-inbox-container bg-elevated transition-all duration-300"
						style="animation: fadeIn 0.3s ease-in"
					>
						<h3 class="font-semibold text-primary mb-4">Generated Flashcard</h3>
						
						<!-- Front -->
						<div class="mb-4">
							<p class="text-sm font-medium text-secondary mb-2">Front</p>
							<textarea
								bind:value={generatedFlashcard.front}
								class="w-full p-inbox-container border border-base rounded-lg resize-none bg-base text-primary"
								rows="3"
							></textarea>
						</div>

						<!-- Back -->
						<div class="mb-4">
							<p class="text-sm font-medium text-secondary mb-2">Back</p>
							<textarea
								bind:value={generatedFlashcard.back}
								class="w-full p-inbox-container border border-base rounded-lg resize-none bg-base text-primary"
								rows="5"
							></textarea>
						</div>

						<!-- Category Selector -->
						<div class="mb-4">
							<p class="text-sm font-medium text-secondary mb-2">Category</p>
							<select
								bind:value={selectedCategory}
								class="w-full p-inbox-container border border-base rounded-lg bg-base text-primary"
							>
								<option value="">Select category...</option>
								{#each mockCategories as category}
									<option value={category}>{category}</option>
								{/each}
							</select>
						</div>

						<!-- Save Button -->
						<Button.Root
							onclick={handleSave}
							class="w-full bg-accent-primary text-white py-3 px-4 rounded-lg hover:bg-accent-hover transition-all duration-150 font-medium"
						>
							✓ Save Flashcard
						</Button.Root>
					</div>
				{/if}
			</div>
		</div>

		<!-- Right Sidebar - Metadata & Actions -->
		<div class="w-64 border-l border-base bg-surface overflow-y-auto flex-shrink-0">
			<div class="p-inbox-container space-y-6">
				<!-- Source Info -->
				{#if item?.source}
					<div>
						<p class="text-xs font-medium text-secondary uppercase tracking-wider mb-2">Source</p>
						<div class="space-y-1">
							<h3 class="text-sm font-semibold text-primary">{item.source.title}</h3>
							{#if item.author}
								<p class="text-xs text-secondary">by {item.author.displayName}</p>
							{:else if item.authors && item.authors.length > 0}
								<p class="text-xs text-secondary">
									by {item.authors.map((a: any) => a?.displayName).filter(Boolean).join(', ')}
								</p>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Actions (Sidebar) -->
				<div>
					<p class="text-xs font-medium text-secondary uppercase tracking-wider mb-2">Actions</p>
					<div class="space-y-2">
						{#if !showFlashcard && !isLoading}
							<Button.Root
								onclick={handleGenerateFlashcard}
								disabled={isLoading}
								class="w-full bg-accent-primary text-white py-2 px-3 rounded-lg hover:bg-accent-hover transition-all duration-150 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
							>
								✨ Generate Flashcard
							</Button.Root>
						{/if}

						{#if !isLoading}
							<Button.Root
								onclick={handleSkip}
								class="w-full bg-hover-solid text-secondary py-2 px-3 rounded-lg hover:bg-hover transition-all duration-150 text-sm font-medium"
							>
								⏭️ Skip
							</Button.Root>
						{/if}
					</div>
				</div>

				<!-- Tags -->
				{#if item?.tags && item.tags.length > 0}
					<div>
						<p class="text-xs font-medium text-secondary uppercase tracking-wider mb-2">Tags</p>
						<div class="flex flex-wrap gap-2">
							{#each item.tags as tag}
								<span class="bg-tag text-tag text-xs px-badge py-badge rounded">
									{tag.displayName || tag.name}
								</span>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Note -->
				{#if item?.highlight?.note}
					<div>
						<p class="text-xs font-medium text-secondary uppercase tracking-wider mb-2">Note</p>
						<p class="text-xs text-secondary leading-relaxed">{item.highlight.note}</p>
					</div>
				{/if}

				<!-- External Link -->
				{#if item?.highlight?.externalUrl}
					<div>
						<p class="text-xs font-medium text-secondary uppercase tracking-wider mb-2">Links</p>
						<a
							href={item.highlight.externalUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="text-xs text-primary hover:text-secondary flex items-center gap-icon transition-colors"
						>
							<span>View in Readwise</span>
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

				<!-- Metadata (Collapsed by default, subtle) -->
				{#if item?.createdAt}
					<div class="pt-6 border-t border-base">
						<div class="flex flex-col gap-1">
							<span class="text-xs text-tertiary">Added {new Date(item.createdAt).toLocaleDateString()}</span>
							{#if item?._id}
								<span class="text-xs text-tertiary font-mono">ID: {item._id}</span>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>

