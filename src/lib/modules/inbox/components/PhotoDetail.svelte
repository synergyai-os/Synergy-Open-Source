<script lang="ts">
	import { Button } from '$lib/components/atoms';
	import type { InboxItemWithDetails } from '$lib/types/convex';

	type Props = {
		item: InboxItemWithDetails & { type: 'photo_note' };
		onClose: () => void;
	};

	let { item, onClose }: Props = $props();

	let editedText = $state(item.transcribedText || '');

	function handleSkip() {
		alert('Item skipped! (Mock)');
		onClose();
	}
</script>

<div class="px-inbox-container py-inbox-container">
	<!-- Header -->
	<div class="mb-content-padding flex items-center gap-2">
		<Button variant="outline" size="sm" onclick={onClose} ariaLabel="Back to inbox">
			<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			<span class="text-small">Back</span>
		</Button>
		<h2 class="text-h3 flex-1 font-bold text-primary">Photo Note</h2>
	</div>

	<!-- Image -->
	<div class="mb-content-padding">
		<div
			class="border-base flex aspect-video w-full items-center justify-center rounded-card border-2 border-dashed bg-surface"
		>
			<span class="text-tertiary">📷 Image: {item.imageFileId}</span>
		</div>
	</div>

	<!-- Source -->
	{#if item.source}
		<div
			class="mb-marketing-title-to-lead px-inbox-container py-inbox-container rounded-card border border-accent-primary bg-surface"
		>
			<p class="text-small font-semibold text-primary">Source</p>
			<p class="text-small text-secondary">{item.source}</p>
		</div>
	{/if}

	<!-- Transcribed Text (Editable) -->
	<div class="mb-marketing-title-to-lead">
		<p class="mb-marketing-text text-small font-medium text-secondary">Transcribed Text</p>
		<textarea
			bind:value={editedText}
			class="border-base text-small w-full resize-none rounded-card border bg-base px-input-x py-input-y font-code text-primary"
			rows="8"
		></textarea>
		<p class="text-label text-tertiary">You can edit the transcribed text</p>
	</div>

	<!-- Actions -->
	<div class="gap-form-section flex flex-col">
		<Button variant="outline" onclick={handleSkip}>⏭️ Skip</Button>
	</div>

	<!-- Metadata -->
	<div class="mt-content-padding border-base pt-content-padding border-t">
		<div class="flex items-center justify-between text-label text-tertiary">
			<span>Added {new Date(item.createdAt).toLocaleDateString()}</span>
			<span>ID: {item._id}</span>
		</div>
	</div>
</div>
