<script lang="ts">
	import { Combobox, DropdownMenu } from 'bits-ui';
	import { TAG_COLORS, DEFAULT_TAG_COLOR } from '$lib/utils/tagConstants';
	import type { Id } from '../../../../convex/_generated/dataModel';

	type Tag = {
		_id: Id<'tags'>;
		displayName: string;
		color: string;
		parentId?: Id<'tags'>;
		level?: number;
	};

	type Props = {
		selectedTagIds: Id<'tags'>[];
		availableTags: Tag[];
		onTagsChange: (tagIds: Id<'tags'>[]) => void;
		onCreateTag?: (displayName: string, color: string) => Promise<Id<'tags'>>;
		onCreateTagWithColor?: (displayName: string, color: string, parentId?: Id<'tags'>) => Promise<Id<'tags'>>;
		tagInputRef?: HTMLElement | null;
	};

	let {
		selectedTagIds = $bindable([]),
		availableTags,
		onTagsChange,
		onCreateTag,
		onCreateTagWithColor,
		tagInputRef = $bindable(null),
	}: Props = $props();

	// Set defaults for non-bindable props
	if (!availableTags) availableTags = [];
	if (!onTagsChange) onTagsChange = () => {};

	let comboboxOpen = $state(false);
	let searchValue = $state('');
	let showColorPicker = $state(false);
	let pendingTagName = $state('');
	let colorPickerOpen = $state(false);

	// Get selected tags for display
	const selectedTags = $derived(() => {
		return selectedTagIds
			.map((id: Id<'tags'>) => availableTags.find((t: Tag) => t._id === id))
			.filter((t: Tag | undefined): t is Tag => t !== undefined);
	});

	// Filter available tags based on search
	const filteredTags = $derived(() => {
		if (!searchValue) return availableTags;

		const searchLower = searchValue.toLowerCase();
		const selected = selectedTags();
		return availableTags.filter(
			(tag: Tag) =>
				tag.displayName.toLowerCase().includes(searchLower) ||
				selected.some((st: Tag) => st._id === tag._id)
		);
	});

	// Group tags by hierarchy (parent tags become group headings)
	const groupedTags = $derived(() => {
		const groups = new Map<Id<'tags'> | 'root', Tag[]>();
		const rootTags: Tag[] = [];
		const tagMap = new Map<Id<'tags'>, Tag>();
		const filtered = filteredTags();
		const selected = selectedTags();

		// Build tag map
		for (const tag of filtered) {
			tagMap.set(tag._id, tag);
		}

		// Group by parent
		for (const tag of filtered) {
			if (!selected.some((st: Tag) => st._id === tag._id)) {
				// Only show non-selected tags in dropdown
				if (tag.parentId && tagMap.has(tag.parentId)) {
					const parentId = tag.parentId;
					if (!groups.has(parentId)) {
						groups.set(parentId, []);
					}
					groups.get(parentId)!.push(tag);
				} else {
					rootTags.push(tag);
				}
			}
		}

		return { groups, rootTags };
	});

	// Check if search value could be a new tag
	const canCreateTag = $derived(
		searchValue.trim().length > 0 &&
			!availableTags.some((t: Tag) => t.displayName.toLowerCase() === searchValue.trim().toLowerCase())
	);

	// Get parent tag for current search (if matches a parent tag name)
	const getPotentialParent = $derived(() => {
		const searchLower = searchValue.trim().toLowerCase();
		return availableTags.find((t: Tag) => t.displayName.toLowerCase() === searchLower);
	});

	function handleTagToggle(tagId: Id<'tags'>) {
		if (selectedTagIds.includes(tagId)) {
			selectedTagIds = selectedTagIds.filter((id: Id<'tags'>) => id !== tagId);
		} else {
			selectedTagIds = [...selectedTagIds, tagId];
		}
		onTagsChange(selectedTagIds);
	}

	function handleCreateTagClick() {
		if (canCreateTag) {
			pendingTagName = searchValue.trim();
			showColorPicker = true;
			colorPickerOpen = true;
		}
	}

	async function handleColorSelect(color: string) {
		if (!pendingTagName || !onCreateTagWithColor) return;

		try {
			const potentialParent = getPotentialParent();
			const newTagId = await onCreateTagWithColor(pendingTagName, color, potentialParent?._id);
			selectedTagIds = [...selectedTagIds, newTagId];
			onTagsChange(selectedTagIds);
			searchValue = '';
			showColorPicker = false;
			colorPickerOpen = false;
			pendingTagName = '';
		} catch (error) {
			console.error('Failed to create tag:', error);
		}
	}

	function handleInputFocus() {
		comboboxOpen = true;
	}

	const inputValue = $derived(() => {
		if (comboboxOpen) return searchValue;
		return '';
	});
</script>

<div class="space-y-2">
	<!-- Section Header -->
	<div class="flex items-center justify-between mb-2">
		<p class="text-label font-medium text-secondary uppercase tracking-wider">Tags</p>
		{#if selectedTags().length > 0}
			<button
				type="button"
				class="w-6 h-6 flex items-center justify-center rounded-md hover:bg-hover-solid transition-colors text-secondary hover:text-primary"
				onclick={() => {
					comboboxOpen = !comboboxOpen;
				}}
				aria-label="Add tag"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
			</button>
		{/if}
	</div>

	<!-- Tag Pills Display -->
	{#if selectedTags().length > 0}
		<div class="flex flex-wrap gap-2 mb-2">
			{#each selectedTags() as tag}
				<button
					type="button"
					class="inline-flex items-center gap-icon px-badge py-badge rounded bg-tag text-tag text-label hover:opacity-80 transition-opacity"
					onclick={() => handleTagToggle(tag._id)}
					aria-label={`Remove tag ${tag.displayName}`}
				>
					<!-- Colored dot -->
					<div
						class="w-2 h-2 rounded-full flex-shrink-0"
						style="background-color: {tag.color || DEFAULT_TAG_COLOR}"
					></div>
					<span>{tag.displayName}</span>
				</button>
			{/each}
			<!-- Add button inline -->
			<button
				type="button"
				class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-hover-solid transition-colors text-secondary hover:text-primary"
				onclick={() => {
					comboboxOpen = !comboboxOpen;
				}}
				aria-label="Add tag"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
			</button>
		</div>
	{/if}

	<!-- Fixed Input Field (Linear style) -->
	<div class="relative">
		<Combobox.Root
			type="multiple"
			bind:value={selectedTagIds as any}
			bind:open={comboboxOpen}
			onValueChange={(values) => {
				selectedTagIds = values as Id<'tags'>[];
				onTagsChange(selectedTagIds);
			}}
		>
			<div class="relative" bind:this={tagInputRef}>
				<Combobox.Input
					defaultValue={searchValue}
					oninput={(e) => {
						searchValue = e.currentTarget.value;
						comboboxOpen = true;
					}}
					onfocus={handleInputFocus}
					placeholder="Change or add tags..."
					class="w-full px-menu-item py-menu-item text-sm text-primary bg-base border border-base rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary pr-8"
					aria-label="Tag selector input"
				/>
				<!-- Keyboard shortcut indicator -->
				<div
					class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1"
					aria-label="Keyboard shortcut: T"
				>
					<span class="text-label text-tertiary bg-elevated px-1 py-0.5 rounded border border-base">T</span>
				</div>
			</div>

			<Combobox.Portal>
				<Combobox.Content
					class="bg-elevated rounded-md shadow-lg border border-base min-w-[280px] max-h-[320px] overflow-y-auto py-1 z-50"
					side="bottom"
					align="start"
					sideOffset={4}
				>
					<!-- Selected Tags Section -->
					{#if selectedTags().length > 0}
						<div class="px-menu-item py-menu-item">
							<p class="text-label font-medium text-tertiary uppercase tracking-wider mb-1">Selected</p>
							<div class="space-y-0.5">
								{#each selectedTags() as tag}
									<button
										type="button"
										class="w-full px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer flex items-center gap-icon focus:bg-hover-solid outline-none text-left"
										onclick={() => handleTagToggle(tag._id)}
										aria-label={`Toggle tag ${tag.displayName}`}
									>
										<svg
											class="w-4 h-4 text-accent-primary flex-shrink-0"
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
										<div
											class="w-2 h-2 rounded-full flex-shrink-0"
											style="background-color: {tag.color || DEFAULT_TAG_COLOR}"
										></div>
										<span class="flex-1">{tag.displayName}</span>
									</button>
								{/each}
							</div>
						</div>
						{#if selectedTags().length > 0 && (groupedTags().rootTags.length > 0 || groupedTags().groups.size > 0)}
							<div class="h-px bg-base my-1"></div>
						{/if}
					{/if}

					<!-- Available Tags -->
					{#if groupedTags().rootTags.length > 0 || groupedTags().groups.size > 0}
						<div class="px-menu-item py-menu-item">
							{#each groupedTags().rootTags as tag}
								{@const isSelected = selectedTagIds.includes(tag._id)}
								<button
									type="button"
									class="w-full px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer flex items-center gap-icon focus:bg-hover-solid outline-none text-left"
									onclick={() => handleTagToggle(tag._id)}
									aria-label={`Select tag ${tag.displayName}`}
								>
									{#if isSelected}
										<svg
											class="w-4 h-4 text-accent-primary flex-shrink-0"
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
									{:else}
										<div class="w-4 h-4 flex-shrink-0"></div>
									{/if}
									<div
										class="w-2 h-2 rounded-full flex-shrink-0"
										style="background-color: {tag.color || DEFAULT_TAG_COLOR}"
									></div>
									<span class="flex-1">{tag.displayName}</span>
								</button>
							{/each}

							<!-- Grouped tags by parent -->
							{#each Array.from(groupedTags().groups.entries()) as [parentId, tags]}
								{@const parentTag = availableTags.find((t: Tag) => t._id === parentId)}
								{#if parentTag}
									<div class="mt-2">
										<p class="text-label font-medium text-tertiary uppercase tracking-wider mb-1 px-menu-item">
											{parentTag.displayName}
										</p>
										{#each tags as tag}
											{@const isSelected = selectedTagIds.includes(tag._id)}
											<button
												type="button"
												class="w-full px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer flex items-center gap-icon focus:bg-hover-solid outline-none text-left"
												onclick={() => handleTagToggle(tag._id)}
												aria-label={`Select tag ${tag.displayName}`}
											>
												{#if isSelected}
													<svg
														class="w-4 h-4 text-accent-primary flex-shrink-0"
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
												{:else}
													<div class="w-4 h-4 flex-shrink-0"></div>
												{/if}
												<div
													class="w-2 h-2 rounded-full flex-shrink-0"
													style="background-color: {tag.color || DEFAULT_TAG_COLOR}"
												></div>
												<span class="flex-1">{tag.displayName}</span>
											</button>
										{/each}
									</div>
								{/if}
							{/each}
						</div>
					{/if}

					<!-- Create New Tag Option -->
					{#if canCreateTag && onCreateTagWithColor}
						{#if showColorPicker && colorPickerOpen}
							<div class="border-t border-base mt-1 pt-1">
								<p class="px-menu-item py-menu-item text-label font-medium text-secondary mb-1">
									Pick a color for label
								</p>
								{#each TAG_COLORS as color}
									<button
										type="button"
										class="w-full px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer flex items-center gap-icon focus:bg-hover-solid outline-none text-left"
										onclick={() => handleColorSelect(color.hex)}
										aria-label={`Select color ${color.name}`}
									>
										<div
											class="w-2 h-2 rounded-full flex-shrink-0"
											style="background-color: {color.hex}"
										></div>
										<span class="flex-1">{color.name}</span>
									</button>
								{/each}
							</div>
						{:else}
							<div class="border-t border-base mt-1 pt-1">
								<button
									type="button"
									class="w-full px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer flex items-center gap-icon focus:bg-hover-solid outline-none text-left"
									onclick={handleCreateTagClick}
									aria-label={`Create new tag: ${searchValue.trim()}`}
								>
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
											d="M12 4v16m8-8H4"
										/>
									</svg>
									<span class="flex-1">Create new tag: '{searchValue.trim()}'</span>
								</button>
							</div>
						{/if}
					{/if}

					<!-- Empty state -->
					{#if !canCreateTag && filteredTags().length === 0 && selectedTags().length === 0}
						<div class="px-menu-item py-menu-item text-sm text-tertiary text-center">
							No tags found
						</div>
					{/if}
				</Combobox.Content>
			</Combobox.Portal>
		</Combobox.Root>
	</div>
</div>

