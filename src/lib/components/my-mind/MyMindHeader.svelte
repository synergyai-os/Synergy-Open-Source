<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import type { InputSourceType } from '../../../../dev-docs/4-archive/mock-data-brain-inputs';

	type SortOption = 'newest' | 'oldest' | 'alphabetical';

	interface Props {
		searchQuery: string;
		onSearchChange: (query: string) => void;
		selectedType: InputSourceType | 'all';
		onTypeFilterChange: (type: InputSourceType | 'all') => void;
		sortOption: SortOption;
		onSortChange: (sort: SortOption) => void;
	}

	let {
		searchQuery,
		onSearchChange,
		selectedType,
		onTypeFilterChange,
		sortOption,
		onSortChange
	}: Props = $props();

	let filterMenuOpen = $state(false);
	let sortMenuOpen = $state(false);

	const sourceTypeLabels: Record<InputSourceType | 'all', string> = {
		all: 'All Types',
		readwise_highlight: 'Highlights',
		readwise_reader_document: 'Articles',
		manual_text: 'Notes',
		web_article: 'Web Articles',
		url_bookmark: 'Bookmarks',
		photo_note: 'Photos',
		screenshot: 'Screenshots',
		email: 'Emails',
		voice_memo: 'Voice Memos',
		code_snippet: 'Code',
		meeting_note: 'Meeting Notes',
		newsletter: 'Newsletters',
		social_media_post: 'Social Posts',
		podcast_transcript: 'Podcasts',
		video_transcript: 'Videos',
		pdf_document: 'PDFs',
		word_document: 'Documents',
		annotation: 'Annotations',
		slack_message: 'Slack',
		calendar_event_note: 'Calendar',
		checklist: 'Checklists'
	};

	const sortLabels: Record<SortOption, string> = {
		newest: 'Newest First',
		oldest: 'Oldest First',
		alphabetical: 'Alphabetical'
	};
</script>

<div class="sticky top-0 z-10 bg-surface border-b border-base px-inbox-header py-system-header flex flex-col flex-shrink-0">
	<!-- Search Bar -->
	<div class="flex items-center gap-icon mb-2">
		<div class="flex-1 relative">
			<input
				type="text"
				placeholder="Search your mind..."
				value={searchQuery}
				oninput={(e) => onSearchChange(e.currentTarget.value)}
				class="w-full px-4 py-2 bg-elevated border border-base rounded-md text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
			/>
			{#if searchQuery}
				<button
					type="button"
					onclick={() => onSearchChange('')}
					class="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors"
					aria-label="Clear search"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			{/if}
		</div>

		<!-- Filter Dropdown -->
		<DropdownMenu.Root bind:open={filterMenuOpen}>
			<DropdownMenu.Trigger
				type="button"
				class="px-4 py-2 bg-elevated border border-base rounded-md hover:bg-hover-solid transition-colors text-sm text-primary flex items-center gap-icon"
			>
				<span>{sourceTypeLabels[selectedType]}</span>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					class="bg-elevated rounded-md shadow-lg border border-base min-w-[180px] py-1 z-50 max-h-[400px] overflow-y-auto"
					side="bottom"
					align="end"
					sideOffset={4}
				>
					{#each Object.entries(sourceTypeLabels) as [type, label]}
						<DropdownMenu.Item
							class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer focus:bg-hover-solid outline-none flex items-center justify-between gap-icon"
							textValue={label}
							onSelect={() => {
								onTypeFilterChange(type as InputSourceType | 'all');
								filterMenuOpen = false;
							}}
						>
							<span>{label}</span>
							{#if selectedType === type}
								<svg
									class="w-4 h-4 text-secondary flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							{/if}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>

		<!-- Sort Dropdown -->
		<DropdownMenu.Root bind:open={sortMenuOpen}>
			<DropdownMenu.Trigger
				type="button"
				class="px-4 py-2 bg-elevated border border-base rounded-md hover:bg-hover-solid transition-colors text-sm text-primary flex items-center gap-icon"
			>
				<span>{sortLabels[sortOption]}</span>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					class="bg-elevated rounded-md shadow-lg border border-base min-w-[180px] py-1 z-50"
					side="bottom"
					align="end"
					sideOffset={4}
				>
					{#each Object.entries(sortLabels) as [option, label]}
						<DropdownMenu.Item
							class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer focus:bg-hover-solid outline-none flex items-center justify-between gap-icon"
							textValue={label}
							onSelect={() => {
								onSortChange(option as SortOption);
								sortMenuOpen = false;
							}}
						>
							<span>{label}</span>
							{#if sortOption === option}
								<svg
									class="w-4 h-4 text-secondary flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							{/if}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	</div>

	<!-- Active Filters Pills -->
	{#if searchQuery || selectedType !== 'all'}
		<div class="flex items-center gap-2 flex-wrap">
			{#if searchQuery}
				<span class="inline-flex items-center gap-1 px-3 py-1 bg-tag text-tag text-sm rounded-full">
					Search: "{searchQuery}"
					<button
						type="button"
						onclick={() => onSearchChange('')}
						class="hover:text-primary transition-colors"
						aria-label="Remove search filter"
					>
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</span>
			{/if}
			{#if selectedType !== 'all'}
				<span class="inline-flex items-center gap-1 px-3 py-1 bg-tag text-tag text-sm rounded-full">
					{sourceTypeLabels[selectedType]}
					<button
						type="button"
						onclick={() => onTypeFilterChange('all')}
						class="hover:text-primary transition-colors"
						aria-label="Remove type filter"
					>
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</span>
			{/if}
		</div>
	{/if}
</div>

