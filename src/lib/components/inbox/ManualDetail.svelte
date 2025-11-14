<script lang="ts">
	import { Button } from 'bits-ui';
	import type { InboxItemWithDetails } from '$lib/types/convex';

	type Props = {
		item: InboxItemWithDetails & { type: 'manual_text' };
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
	<div class="mb-6 flex items-center gap-icon">
		<button
			type="button"
			class="flex items-center gap-icon rounded-md px-nav-item py-nav-item text-secondary transition-colors hover:bg-hover-solid hover:text-primary"
			onclick={onClose}
			aria-label="Back to inbox"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			<span class="text-sm">Back</span>
		</button>
		<h2 class="flex-1 text-xl font-bold text-primary">Manual Note</h2>
	</div>

	<!-- Source Info -->
	{#if item.sourceData?.bookTitle}
		<div class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
			<p class="text-sm font-semibold text-gray-900">Source</p>
			<p class="text-sm text-gray-700">{item.sourceData.bookTitle}</p>
		</div>
	{/if}

	<!-- Note Text -->
	<div class="mb-6">
		<p class="mb-2 text-sm font-medium text-gray-600">Note</p>
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
			<p class="leading-relaxed whitespace-pre-wrap text-gray-700">
				{item.sourceData?.text || item.text || 'No content'}
			</p>
		</div>
	</div>

	<!-- Tags -->
	{#if item.tags && item.tags.length > 0}
		<div class="mb-6">
			<p class="mb-2 text-sm font-medium text-gray-600">Tags</p>
			<div class="flex flex-wrap gap-2">
				{#each item.tags as tag (tag)}
					<span class="rounded bg-gray-100 px-2 py-1 text-sm text-gray-600">
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
			class="w-full rounded-lg bg-gray-200 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
		>
			⏭️ Skip
		</Button.Root>
	</div>

	<!-- Metadata -->
	<div class="mt-6 border-t border-gray-200 pt-6">
		<div class="flex items-center justify-between text-xs text-gray-500">
			<span>Added {new Date(item.createdAt).toLocaleDateString()}</span>
			<span>ID: {item.id}</span>
		</div>
	</div>
</div>
