<script lang="ts">
	import { mockBrainInputs, type MockInboxItem, type InputSourceType } from '../../../../dev-docs/mock-data-brain-inputs';
	import MyMindHeader from '$lib/components/my-mind/MyMindHeader.svelte';
	import MyMindGrid from '$lib/components/my-mind/MyMindGrid.svelte';
	import MyMindItemDetail from '$lib/components/my-mind/MyMindItemDetail.svelte';

	type SortOption = 'newest' | 'oldest' | 'alphabetical';

	// State
	let searchQuery = $state('');
	let selectedType = $state<InputSourceType | 'all'>('all');
	let sortOption = $state<SortOption>('newest');
	let selectedItem = $state<MockInboxItem | null>(null);
	let detailOpen = $state(false);

	// Filtered and sorted items
	const filteredItems = $derived(() => {
		let items = [...mockBrainInputs];

		// Filter by type
		if (selectedType !== 'all') {
			items = items.filter((item) => item.type === selectedType);
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			items = items.filter((item) => {
				const searchableText = [
					item.title,
					item.snippet,
					...(item.tags || []),
					item.text || '',
					item.url || '',
					item.author || '',
					item.sourceTitle || ''
				]
					.join(' ')
					.toLowerCase();
				return searchableText.includes(query);
			});
		}

		// Sort
		switch (sortOption) {
			case 'newest':
				items.sort((a, b) => b.createdAt - a.createdAt);
				break;
			case 'oldest':
				items.sort((a, b) => a.createdAt - b.createdAt);
				break;
			case 'alphabetical':
				items.sort((a, b) => a.title.localeCompare(b.title));
				break;
		}

		return items;
	});

	function handleItemClick(item: MockInboxItem) {
		selectedItem = item;
		detailOpen = true;
	}

	function handleCloseDetail() {
		detailOpen = false;
		selectedItem = null;
	}
</script>

<div class="h-full overflow-hidden flex flex-col bg-surface">
	<!-- Header -->
	<MyMindHeader
		{searchQuery}
		onSearchChange={(q) => (searchQuery = q)}
		{selectedType}
		onTypeFilterChange={(t) => (selectedType = t)}
		{sortOption}
		onSortChange={(s) => (sortOption = s)}
	/>

	<!-- Grid Content -->
	<div class="flex-1 overflow-y-auto">
		<MyMindGrid items={filteredItems()} onItemClick={handleItemClick} />
	</div>

	<!-- Detail Modal -->
	<MyMindItemDetail item={selectedItem} open={detailOpen} onClose={handleCloseDetail} />
</div>
