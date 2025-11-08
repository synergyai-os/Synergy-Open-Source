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

	function getDomain(url?: string): string {
		if (!url) return '';
		try {
			const urlObj = new URL(url);
			return urlObj.hostname.replace('www.', '');
		} catch {
			return url;
		}
	}

	const domain = $derived(getDomain(item.url || item.documentUrl));
</script>

<button
	type="button"
	onclick={onClick}
	class="w-full text-left bg-elevated rounded-md border border-base hover:border-elevated hover:shadow-md transition-all duration-150 cursor-pointer overflow-hidden"
>
	<!-- Optional Image Placeholder (for future) -->
	<!-- Could add imageUrl here if available -->

	<div class="p-6">
		<!-- Title -->
		<h3 class="text-lg font-semibold text-primary mb-2 line-clamp-2 leading-tight">
			{item.title}
		</h3>

		<!-- Snippet/Excerpt -->
		<p class="text-sm text-secondary mb-3 line-clamp-3 leading-relaxed">
			{item.snippet}
		</p>

		<!-- Source/Domain -->
		{#if domain}
			<p class="text-xs text-tertiary mb-3">{domain}</p>
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

