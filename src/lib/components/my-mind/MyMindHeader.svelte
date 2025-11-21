<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { Chip } from '$lib/components/ui';
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

<div
	class="sticky top-0 z-10 flex flex-shrink-0 flex-col border-b border-base bg-surface px-inbox-header py-system-header"
>
	<!-- Search Bar -->
	<div class="mb-content-section flex items-center gap-icon">
		<div class="relative flex-1">
			<input
				type="text"
				placeholder="Search your mind..."
				value={searchQuery}
				oninput={(e) => onSearchChange(e.currentTarget.value)}
				class="w-full rounded-input border border-base bg-elevated px-input-x py-input-y text-primary transition-all placeholder:text-tertiary focus:border-transparent focus:ring-2 focus:ring-accent-primary focus:outline-none"
			/>
			{#if searchQuery}
				<button
					type="button"
					onclick={() => onSearchChange('')}
					class="absolute top-1/2 right-content-section -translate-y-1/2 text-tertiary transition-colors hover:text-primary"
					aria-label="Clear search"
				>
					<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
				class="flex items-center gap-icon rounded-button border border-base bg-elevated px-input-x py-input-y text-small text-primary transition-colors hover:bg-hover-solid"
			>
				<span>{sourceTypeLabels[selectedType]}</span>
				<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
					class="z-50 max-h-[400px] min-w-[180px] overflow-y-auto rounded-button border border-base bg-elevated py-badge shadow-card"
					side="bottom"
					align="end"
					sideOffset={4}
				>
					{#each Object.entries(sourceTypeLabels) as [type, label] (type)}
						<DropdownMenu.Item
							class="flex cursor-pointer items-center justify-between gap-icon px-menu-item py-menu-item text-small text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
							textValue={label}
							onSelect={() => {
								onTypeFilterChange(type as InputSourceType | 'all');
								filterMenuOpen = false;
							}}
						>
							<span>{label}</span>
							{#if selectedType === type}
								<svg
									class="icon-sm flex-shrink-0 text-secondary"
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
				class="flex items-center gap-icon rounded-button border border-base bg-elevated px-input-x py-input-y text-small text-primary transition-colors hover:bg-hover-solid"
			>
				<span>{sortLabels[sortOption]}</span>
				<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
					class="z-50 min-w-[180px] rounded-button border border-base bg-elevated py-badge shadow-card"
					side="bottom"
					align="end"
					sideOffset={4}
				>
					{#each Object.entries(sortLabels) as [option, label] (option)}
						<DropdownMenu.Item
							class="flex cursor-pointer items-center justify-between gap-icon px-menu-item py-menu-item text-small text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
							textValue={label}
							onSelect={() => {
								onSortChange(option as SortOption);
								sortMenuOpen = false;
							}}
						>
							<span>{label}</span>
							{#if sortOption === option}
								<svg
									class="icon-sm flex-shrink-0 text-secondary"
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
		<div class="flex flex-wrap items-center gap-icon">
			{#if searchQuery}
				<Chip label="Search: {searchQuery}" variant="default" onDelete={() => onSearchChange('')} />
			{/if}
			{#if selectedType !== 'all'}
				<Chip
					label={sourceTypeLabels[selectedType]}
					variant="default"
					onDelete={() => onTypeFilterChange('all')}
				/>
			{/if}
		</div>
	{/if}
</div>
