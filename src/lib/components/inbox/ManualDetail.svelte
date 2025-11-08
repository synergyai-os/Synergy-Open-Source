<script lang="ts">
	import { Button } from 'bits-ui';

	type Props = {
		item: any;
		onClose: () => void;
	};

	let { item, onClose }: Props = $props();


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
		<h2 class="text-xl font-bold text-primary flex-1">Manual Note</h2>
	</div>

	<!-- Source Info -->
	{#if item.sourceData?.bookTitle}
		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
			<p class="text-sm font-semibold text-gray-900">Source</p>
			<p class="text-sm text-gray-700">{item.sourceData.bookTitle}</p>
		</div>
	{/if}

	<!-- Note Text -->
	<div class="mb-6">
		<p class="text-sm font-medium text-gray-600 mb-2">Note</p>
		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
			<p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{item.sourceData?.text || item.text || 'No content'}</p>
		</div>
	</div>

	<!-- Tags -->
	{#if item.tags && item.tags.length > 0}
		<div class="mb-6">
			<p class="text-sm font-medium text-gray-600 mb-2">Tags</p>
			<div class="flex flex-wrap gap-2">
				{#each item.tags as tag}
					<span class="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded">
						{tag}
					</span>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Actions -->
	<div class="space-y-3">
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
			<span>Added {new Date(item.createdAt).toLocaleDateString()}</span>
			<span>ID: {item.id}</span>
		</div>
	</div>
</div>

