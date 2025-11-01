<script lang="ts">
	import { Button } from 'bits-ui';

	type Props = {
		item: any;
		onClose: () => void;
	};

	let { item, onClose }: Props = $props();

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
		generatedFlashcard = {
			front: `What is ${item.sourceData.highlightText.split('.').slice(0, 1)[0]}?`,
			back: item.sourceData.highlightText,
			explanation: `From ${item.sourceData.bookTitle} by ${item.sourceData.author}`
		};

		showFlashcard = true;
		isLoading = false;
	}

	function handleSave() {
		// In real app, this would save to database and mark inbox item as processed
		alert('Flashcard saved! (Mock)');
		onClose();
	}

	function handleSkip() {
		// Mark as skipped without processing
		alert('Item skipped! (Mock)');
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
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
		<h3 class="font-semibold text-blue-900 mb-1">{item.sourceData.bookTitle}</h3>
		<p class="text-sm text-blue-700">by {item.sourceData.author}</p>
	</div>

	<!-- Highlight Text -->
	<div class="mb-6">
		<p class="text-gray-700 leading-relaxed">{item.sourceData.highlightText}</p>
	</div>

	<!-- Readwise Tags -->
	<div class="mb-6">
		<p class="text-sm font-medium text-gray-600 mb-2">Tags</p>
		<div class="flex flex-wrap gap-2">
			{#each item.sourceData.readwiseTags as tag}
				<span class="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded">
					{tag}
				</span>
			{/each}
		</div>
	</div>

	<!-- Note -->
	{#if item.sourceData.note}
		<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
			<p class="text-sm font-medium text-yellow-900 mb-1">Note</p>
			<p class="text-sm text-yellow-800">{item.sourceData.note}</p>
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
	<div class="mt-6 pt-6 border-t border-gray-200">
		<div class="flex items-center justify-between text-xs text-gray-500">
			<span>Added {item.createdAt.toLocaleDateString()}</span>
			<span>ID: {item.id}</span>
		</div>
	</div>
</div>

