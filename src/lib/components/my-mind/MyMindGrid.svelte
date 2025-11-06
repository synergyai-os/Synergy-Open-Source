<script lang="ts">
	import type { MockInboxItem } from '../../../../dev-docs/mock-data-brain-inputs';
	import ReadwiseHighlightCard from './cards/ReadwiseHighlightCard.svelte';
	import WebArticleCard from './cards/WebArticleCard.svelte';
	import PhotoNoteCard from './cards/PhotoNoteCard.svelte';
	import DefaultCard from './cards/DefaultCard.svelte';

	interface Props {
		items: MockInboxItem[];
		onItemClick: (item: MockInboxItem) => void;
	}

	let { items, onItemClick }: Props = $props();

	function getCardComponent(item: MockInboxItem) {
		switch (item.type) {
			case 'readwise_highlight':
				return ReadwiseHighlightCard;
			case 'web_article':
			case 'readwise_reader_document':
				return WebArticleCard;
			case 'photo_note':
			case 'screenshot':
				return PhotoNoteCard;
			default:
				return DefaultCard;
		}
	}
</script>

<div class="p-6">
	{#if items.length === 0}
		<div class="text-center py-12">
			<p class="text-secondary text-lg mb-2">No items found</p>
			<p class="text-tertiary text-sm">Try adjusting your search or filters</p>
		</div>
	{:else}
		<div
			class="grid gap-4"
			style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));"
		>
			{#each items as item (item._id)}
				{@const CardComponent = getCardComponent(item)}
				<CardComponent item={item} onClick={() => onItemClick(item)} />
			{/each}
		</div>
	{/if}
</div>

