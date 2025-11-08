<script lang="ts">
	import type { MockInboxItem } from '../../../../../dev-docs/4-archive/mock-data-brain-inputs';

	interface Props {
		item: MockInboxItem;
		onClick: () => void;
	}

	let { item, onClick }: Props = $props();

	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
		return `${Math.floor(diffDays / 365)} years ago`;
	}
</script>

<button
	type="button"
	onclick={onClick}
	class="w-full text-left bg-elevated rounded-md border border-base hover:border-elevated hover:shadow-md transition-all duration-150 cursor-pointer overflow-hidden"
>
	<!-- Image Placeholder -->
	<div class="w-full aspect-square bg-surface flex items-center justify-center">
		<svg
			class="w-16 h-16 text-tertiary opacity-50"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
			/>
		</svg>
	</div>

	<div class="p-4">
		<!-- Title -->
		<h3 class="text-sm font-semibold text-primary mb-2 line-clamp-1">
			{item.title}
		</h3>

		<!-- OCR Text or Caption -->
		{#if item.transcribedText}
			<p class="text-xs text-secondary mb-2 line-clamp-2">
				{item.transcribedText}
			</p>
		{:else if item.snippet}
			<p class="text-xs text-secondary mb-2 line-clamp-2">
				{item.snippet}
			</p>
		{/if}

		<!-- Source indicator -->
		{#if item.source}
			<p class="text-xs text-tertiary mb-2">{item.source}</p>
		{/if}

		<!-- Timestamp -->
		<p class="text-xs text-tertiary">{formatDate(item.createdAt)}</p>
	</div>
</button>

