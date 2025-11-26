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
		<h2 class="flex-1 text-h3 font-bold text-primary">Manual Note</h2>
	</div>

	<!-- Source Info -->
	{#if item.bookTitle}
		<div
			class="mb-marketing-title-to-lead rounded-card border border-base bg-surface px-inbox-container py-inbox-container"
		>
			<p class="text-small font-semibold text-primary">Source</p>
			<p class="text-small text-secondary">{item.bookTitle}</p>
		</div>
	{/if}

	<!-- Note Text -->
	<div class="mb-marketing-title-to-lead">
		<p class="mb-marketing-text text-small font-medium text-secondary">Note</p>
		<div class="rounded-card border border-base bg-surface px-inbox-container py-inbox-container">
			<p class="leading-relaxed whitespace-pre-wrap text-secondary">
				{item.text || 'No content'}
			</p>
		</div>
	</div>

	<!-- Actions -->
	<div class="flex flex-col gap-form-section">
		<Button variant="outline" onclick={handleSkip}>⏭️ Skip</Button>
	</div>

	<!-- Metadata -->
	<div class="mt-content-padding border-t border-base pt-content-padding">
		<div class="flex items-center justify-between text-label text-tertiary">
			<span>Added {new Date(item.createdAt).toLocaleDateString()}</span>
			<span>ID: {item._id}</span>
		</div>
	</div>
</div>
