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
	let editedText = $state(item.sourceData.transcribedText);

	const mockCategories = ['Product Delivery', 'Product Discovery', 'Leadership'];

	async function handleGenerateFlashcard() {
		isLoading = true;
		showFlashcard = false;

		// Simulate AI processing
		await new Promise((resolve) => setTimeout(resolve, 2000));

		generatedFlashcard = {
			front: `What key insight from the ${item.sourceData.source}?`,
			back: editedText,
			explanation: `From ${item.sourceData.source}`
		};

		showFlashcard = true;
		isLoading = false;
	}

	function handleSave() {
		alert('Flashcard saved! (Mock)');
		onClose();
	}

	function handleSkip() {
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
		<h2 class="text-xl font-bold text-primary flex-1">Photo Note</h2>
	</div>

	<!-- Image -->
	<div class="mb-6">
		<div
			class="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
		>
			<span class="text-gray-500">📷 Image: {item.title}</span>
		</div>
	</div>

	<!-- Source -->
	<div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
		<p class="text-sm font-semibold text-purple-900">Source</p>
		<p class="text-sm text-purple-700">{item.sourceData.source}</p>
	</div>

	<!-- Transcribed Text (Editable) -->
	<div class="mb-6">
		<p class="text-sm font-medium text-gray-600 mb-2">Transcribed Text</p>
		<textarea
			bind:value={editedText}
			class="w-full p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm"
			rows="8"
		></textarea>
		<p class="text-xs text-gray-500 mt-1">
			You can edit the text before generating a flashcard
		</p>
	</div>

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

