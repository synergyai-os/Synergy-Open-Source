<script lang="ts">
	import { Button } from 'bits-ui';

	type Props = {
		item: any;
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
	{#if item.sourceData?.source}
		<div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
			<p class="text-sm font-semibold text-purple-900">Source</p>
			<p class="text-sm text-purple-700">{item.sourceData.source}</p>
		</div>
	{/if}

	<!-- Transcribed Text (Editable) -->
	<div class="mb-6">
		<p class="text-sm font-medium text-gray-600 mb-2">Transcribed Text</p>
		<textarea
			bind:value={editedText}
			class="w-full p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm"
			rows="8"
		></textarea>
		<p class="text-xs text-gray-500 mt-1">
			You can edit the transcribed text
		</p>
	</div>

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

