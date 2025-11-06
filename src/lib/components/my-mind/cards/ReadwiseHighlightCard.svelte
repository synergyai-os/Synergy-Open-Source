<script lang="ts">
	import type { MockInboxItem } from '../../../../../dev-docs/mock-data-brain-inputs';

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

	const sourceInfo = $derived(
		item.author && item.sourceTitle
			? `From "${item.sourceTitle}" by ${item.author}`
			: item.sourceTitle
				? `From "${item.sourceTitle}"`
				: ''
	);
</script>

<button
	type="button"
	onclick={onClick}
	class="w-full text-left bg-elevated rounded-md border border-base hover:border-elevated hover:shadow-md transition-all duration-150 cursor-pointer overflow-hidden"
>
	<div class="p-6">
		<!-- Quote Icon (Optional, subtle) -->
		<div class="mb-4">
			<svg
				class="w-8 h-8 text-tertiary opacity-30"
				fill="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"
				/>
			</svg>
		</div>

		<!-- Highlight Text -->
		<p class="text-lg leading-readable tracking-readable text-primary mb-4">
			{item.snippet || item.title}
		</p>

		<!-- Source Attribution -->
		{#if sourceInfo}
			<p class="text-sm text-secondary mb-3">{sourceInfo}</p>
		{/if}

		<!-- Tags -->
		{#if item.tags && item.tags.length > 0}
			<div class="flex flex-wrap gap-1 mb-3">
				{#each item.tags.slice(0, 3) as tag}
					<span class="bg-tag text-tag text-label px-badge py-badge rounded">
						{tag}
					</span>
				{/each}
			</div>
		{/if}

		<!-- Timestamp -->
		<p class="text-xs text-tertiary">{formatDate(item.createdAt)}</p>
	</div>
</button>

