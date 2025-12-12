<script lang="ts">
	import { Button } from '$lib/components/atoms';
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

<div class="px-inbox-container py-inbox-container">
	<!-- Header -->
	<div class="mb-content-padding flex items-center gap-2">
		<Button variant="outline" size="sm" onclick={onClose} ariaLabel="Back to inbox">
			<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			<span class="text-small">Back</span>
		</Button>
		<h2 class="text-h3 text-primary flex-1 font-bold">Manual Note</h2>
	</div>

	<!-- Source Info -->
	{#if item.bookTitle}
		<div
			class="mb-marketing-title-to-lead border-base px-inbox-container py-inbox-container rounded-card bg-surface border"
		>
			<p class="text-small text-primary font-semibold">Source</p>
			<p class="text-small text-secondary">{item.bookTitle}</p>
		</div>
	{/if}

	<!-- Note Text -->
	<div class="mb-marketing-title-to-lead">
		<p class="mb-marketing-text text-small text-secondary font-medium">Note</p>
		<div class="border-base px-inbox-container py-inbox-container rounded-card bg-surface border">
			<p class="text-secondary leading-relaxed whitespace-pre-wrap">
				{item.text || 'No content'}
			</p>
		</div>
	</div>

	<!-- Actions -->
	<div class="gap-form-section flex flex-col">
		<Button variant="outline" onclick={handleSkip}>⏭️ Skip</Button>
	</div>

	<!-- Metadata -->
	<div class="mt-content-padding border-base pt-content-padding border-t">
		<div class="text-label text-tertiary flex items-center justify-between">
			<span>Added {new Date(item.createdAt).toLocaleDateString()}</span>
			<span>ID: {item._id}</span>
		</div>
	</div>
</div>
