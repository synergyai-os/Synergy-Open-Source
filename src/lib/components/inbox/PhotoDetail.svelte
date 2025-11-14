<script lang="ts">
	import { Button } from 'bits-ui';
	import type { InboxItemWithDetails } from '$lib/types/convex';

	type Props = {
		item: InboxItemWithDetails & { type: 'photo_note' };
		onClose: () => void;
	};

	let { item, onClose }: Props = $props();

	let editedText = $state(item.sourceData?.transcribedText || item.transcribedText || '');

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
		<h2 class="flex-1 text-xl font-bold text-primary">Photo Note</h2>
	</div>

	<!-- Image -->
	<div class="mb-6">
		<div
			class="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-200"
		>
			<span class="text-gray-500">📷 Image: {item.title}</span>
		</div>
	</div>

	<!-- Source -->
	{#if item.sourceData?.source}
		<div class="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
			<p class="text-sm font-semibold text-purple-900">Source</p>
			<p class="text-sm text-purple-700">{item.sourceData.source}</p>
		</div>
	{/if}

	<!-- Transcribed Text (Editable) -->
	<div class="mb-6">
		<p class="mb-2 text-sm font-medium text-gray-600">Transcribed Text</p>
		<textarea
			bind:value={editedText}
			class="w-full resize-none rounded-lg border border-gray-300 p-3 font-mono text-sm"
			rows="8"
		></textarea>
		<p class="mt-1 text-xs text-gray-500">You can edit the transcribed text</p>
	</div>

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
