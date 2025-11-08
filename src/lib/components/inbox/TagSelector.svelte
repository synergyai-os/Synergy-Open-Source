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
		comboboxOpen?: boolean; // Expose combobox open state for keyboard shortcuts
		showLabel?: boolean; // Show "TAGS" label (default: true)
	};

	let {
		selectedTagIds = $bindable([]),
		availableTags: _availableTags,
		onTagsChange,
		onCreateTag,
		onCreateTagWithColor,
		tagInputRef = $bindable(null),
		comboboxOpen: _comboboxOpenExternal = $bindable(undefined),
		showLabel = true,
	}: Props = $props();

	// Set defaults for non-bindable props
	if (!onTagsChange) onTagsChange = () => {};
	
	// Create a local reactive state for availableTags that can be updated optimistically
	// Use $derived to always reflect prop changes, with local state for optimistic updates
	let optimisticTags = $state<Tag[]>([]);
	
	// Clean up optimistic tags when they appear in the query (prop updates)
	// This prevents duplicate optimistic tags once the query has refreshed
	$effect(() => {
		if (_availableTags && Array.isArray(_availableTags) && optimisticTags.length > 0) {
			const propTagIds = new Set(_availableTags.map((tag: Tag) => tag._id).filter(Boolean));
			// Remove optimistic tags that are now in the query results
			const stillOptimistic = optimisticTags.filter((tag: Tag) => !propTagIds.has(tag._id));
			if (stillOptimistic.length !== optimisticTags.length) {
				optimisticTags = stillOptimistic;
			}
		}
	});
	
	// Always use prop tags, but merge with optimistic tags
	// This derived state reactively combines the prop tags with locally created optimistic tags
	const availableTags = $derived(() => {
		const baseTags = (_availableTags && Array.isArray(_availableTags)) ? _availableTags : [];
		// Merge with optimistic tags (tags created but not yet in query results)
		const tagsMap = new Map<string, Tag>();
		
		// First add base tags from prop (from Convex query)
		baseTags.forEach((tag: Tag) => {
			if (tag?._id) {
				tagsMap.set(tag._id, tag);
			}
		});
		
		// Then add/override with optimistic tags (newly created tags)
		// This ensures newly created tags appear immediately
		optimisticTags.forEach((tag: Tag) => {
			if (tag?._id) {
				tagsMap.set(tag._id, tag);
			}
		});
		
		const result = Array.from(tagsMap.values());
		
		// Note: Debug logging removed - was too verbose. Add back if needed for debugging.
		
		return result;
	});

	// Use external comboboxOpen if provided, otherwise use internal state
	let comboboxOpenInternal = $state(false);
	
	// Derived value for reading - use external if provided, otherwise internal
	const comboboxOpen = $derived(_comboboxOpenExternal !== undefined ? _comboboxOpenExternal : comboboxOpenInternal);
	
	// Function to update combobox open state (updates the correct source)
	function setComboboxOpen(value: boolean) {
		if (_comboboxOpenExternal !== undefined) {
			_comboboxOpenExternal = value;
		} else {
			comboboxOpenInternal = value;
		}
	}
	
	/**
	 * State synchronization pattern for Bits UI components with external control:
	 * 
	 * 1. External → Internal: When parent sets external state (e.g., 'T' key),
	 *    the effect below syncs it to internal state, which Bits UI reads via bind:open
	 * 
	 * 2. Internal → External: When Bits UI changes state (ESC, click outside, etc.),
	 *    bind:open updates internal, then onOpenChange syncs to external
	 * 
	 * This pattern ensures:
	 * - ESC key works correctly (Bits UI handles it, we sync to external)
	 * - Click outside works correctly (same mechanism)
	 * - External control works (keyboard shortcuts, parent component control)
	 * - No race conditions or infinite loops
	 */
	
	// Handle open state changes from Bits UI (ESC, click outside, etc.)
	// This callback is triggered whenever Bits UI changes the open state via bind:open
	// We use this to sync the change to external state (for parent components)
	function handleOpenChange(newOpen: boolean) {
		// Note: comboboxOpenInternal is already updated by bind:open, we just need to sync external
		if (_comboboxOpenExternal !== undefined && _comboboxOpenExternal !== newOpen) {
			_comboboxOpenExternal = newOpen;
		}
	}
	
	// External → Internal: When external state changes (user presses 'T'), update internal
	// This effect syncs external state changes to internal state
	$effect(() => {
		if (_comboboxOpenExternal !== undefined) {
			const externalValue = _comboboxOpenExternal;
			// Only update if it actually changed (prevent unnecessary updates)
			if (externalValue !== comboboxOpenInternal) {
				comboboxOpenInternal = externalValue;
			}
		}
	});
	let searchValue = $state('');
	let showColorPicker = $state(false);
	let pendingTagName = $state('');
	let colorPickerOpen = $state(false);

	// Get selected tags for display
	const selectedTags = $derived(() => {
		const tags = availableTags(); // Call the derived function
		return selectedTagIds
			.map((id: Id<'tags'>) => tags.find((t: Tag) => t._id === id))
			.filter((t: Tag | undefined): t is Tag => t !== undefined);
	});

	// Note: Debug effect removed. Add back if needed for debugging reactivity issues.

	// Filter available tags based on search
	const filteredTags = $derived(() => {
		const tags = availableTags(); // Call the derived function
		if (!searchValue || searchValue.trim().length === 0) {
			// No search: return all tags
			return tags;
		}

		const searchLower = searchValue.toLowerCase().trim();
		// Filter tags that match the search
		return tags.filter((tag: Tag) =>
			tag.displayName.toLowerCase().includes(searchLower)
		);
	});

	// Group tags by hierarchy (parent tags become group headings)
	const groupedTags = $derived(() => {
		const groups = new Map<Id<'tags'> | 'root', Tag[]>();
		const rootTags: Tag[] = [];
		// Use selectedTagIds directly (source of truth) instead of selectedTags() to ensure
		// all selected IDs are excluded, even if they haven't been resolved in availableTags() yet
		const selectedIds = new Set(selectedTagIds);
		
		// Use all available tags to build the tag map (needed for parent lookup)
		const allTagMap = new Map<Id<'tags'>, Tag>();
		const tags = availableTags(); // Call the derived function
		for (const tag of tags) {
			allTagMap.set(tag._id, tag);
		}
		
		// Filter tags that match search AND are not selected
		const filtered = filteredTags().filter(
			(tag: Tag) => !selectedIds.has(tag._id)
		);

		// Group filtered tags by parent
		for (const tag of filtered) {
			if (tag.parentId && allTagMap.has(tag.parentId)) {
				const parentId = tag.parentId;
				// Only show parent in groups if parent itself is also in filtered results (not selected)
				if (!selectedIds.has(parentId) && filtered.some((t: Tag) => t._id === parentId)) {
					if (!groups.has(parentId)) {
						groups.set(parentId, []);
					}
					groups.get(parentId)!.push(tag);
				} else {
					// Parent is selected or not in filtered, show as root
					rootTags.push(tag);
				}
			} else {
				rootTags.push(tag);
			}
		}

		return { groups, rootTags };
	});

	// Check if search value could be a new tag
	const canCreateTag = $derived(() => {
		const tags = availableTags(); // Call the derived function
		return searchValue.trim().length > 0 &&
			!tags.some((t: Tag) => t.displayName.toLowerCase() === searchValue.trim().toLowerCase());
	});

	// Get parent tag for current search (if matches a parent tag name)
	const getPotentialParent = $derived(() => {
		const tags = availableTags(); // Call the derived function
		const searchLower = searchValue.trim().toLowerCase();
		return tags.find((t: Tag) => t.displayName.toLowerCase() === searchLower);
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
		if (canCreateTag()) { // Call the derived function
			pendingTagName = searchValue.trim();
			showColorPicker = true;
			colorPickerOpen = true;
			focusedColorIndex = 0; // Reset focus to first color
		}
	}

	async function handleColorSelect(color: string) {
		if (!pendingTagName || !onCreateTagWithColor) return;

		try {
			const potentialParent = getPotentialParent();
			const newTagId = await onCreateTagWithColor(pendingTagName, color, potentialParent?._id);
			
			// Add the newly created tag optimistically so it appears immediately
			// This will be replaced when the query refreshes, but ensures immediate UI feedback
			const optimisticTag: Tag = {
				_id: newTagId,
				displayName: pendingTagName,
				color: color,
				parentId: potentialParent?._id,
				level: 0,
			};
			
			// IMPORTANT: Update optimisticTags FIRST, then selectedTagIds
			// This ensures availableTags() includes the tag before selectedTags() tries to find it
			optimisticTags = [...optimisticTags, optimisticTag];
			
			// Add to selected tags AFTER optimistic tag is added
			// This ensures selectedTags() can immediately find the tag in availableTags()
			selectedTagIds = [...selectedTagIds, newTagId];
			
			// Notify parent to save tags to highlight
			onTagsChange(selectedTagIds);
			
			// Clear and close
			searchValue = '';
			showColorPicker = false;
			colorPickerOpen = false;
			pendingTagName = '';
			setComboboxOpen(false);
			
			// Note: availableTags will update automatically via useQuery, replacing the optimistic tag
			// When the query refreshes and includes the new tag, we can remove it from optimisticTags
			// The cleanup effect handles this automatically
		} catch (error) {
			console.error('Failed to create tag:', error);
			// Don't clear search on error so user can try again
		}
	}

	// Auto-focus first color when color picker opens
	let colorPickerRef = $state<HTMLElement | null>(null);
	$effect(() => {
		if (showColorPicker && colorPickerOpen && colorPickerRef) {
			// Focus the container to enable keyboard navigation
			setTimeout(() => {
				colorPickerRef?.focus();
			}, 0);
		}
	});

	function handleInputFocus() {
		setComboboxOpen(true);
	}

	// Handle Enter key in input - create tag if no matches, or create directly if search exists
	function handleInputKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === 'Return') {
			event.preventDefault();
			event.stopPropagation();
			if (!showColorPicker) {
				// If we have a search value and can create a tag, create it
				if (canCreateTag() && searchValue.trim().length > 0) {
					handleCreateTagClick();
				}
				// If search has matches but user presses Enter, select the first match
				else if (groupedTags().rootTags.length > 0 || groupedTags().groups.size > 0) {
					// Optionally: select first tag on Enter
					// For now, just prevent default to keep current behavior
				}
			}
		}
	}

	const inputValue = $derived(() => {
		if (comboboxOpen) return searchValue;
		return '';
	});

	// Track focused color index for keyboard navigation
	let focusedColorIndex = $state(0);
	
	// Auto-focus input when combobox opens (unified, improved effect)
	$effect(() => {
		if (comboboxOpen && !showColorPicker) {
			// Use multiple requestAnimationFrame + setTimeout for better timing with Portal rendering
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setTimeout(() => {
						// Try multiple selectors to find the input
						let input: HTMLInputElement | null = null;
						
						// First try: data attribute selector (more specific)
						const content = document.querySelector('[data-bits-combobox-content]') as HTMLElement | null;
						if (content) {
							input = content.querySelector('input[placeholder="Add tags..."]') as HTMLInputElement | null;
						}
						
						// Fallback: query by placeholder if first attempt failed
						if (!input) {
							input = document.querySelector('input[placeholder="Add tags..."]') as HTMLInputElement | null;
						}
						
						if (input) {
							// Focus and select text, ensure visible
							input.focus();
							input.select();
							input.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
						}
					}, 100); // Reduced delay but with double RAF for better Portal timing
				});
			});
		}
	});
</script>

<div class="space-y-2">
	<!-- Section Header -->
	{#if showLabel}
		<p class="text-label font-medium text-secondary uppercase tracking-wider mb-2">Tags</p>
	{/if}

	<!-- Tag Pills Display (shown when tags exist) -->
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
			<!-- Add button inline (only + icon when tags exist) -->
			<button
				type="button"
				class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-hover-solid transition-colors text-secondary hover:text-primary"
				onclick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					setComboboxOpen(true);
				}}
				aria-label="Add tag"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
			</button>
		</div>
	{/if}

	<!-- Combobox with trigger button -->
	<div class="relative">
		<Combobox.Root
			type="multiple"
			bind:value={selectedTagIds as any}
			bind:open={comboboxOpenInternal}
			onOpenChange={handleOpenChange}
			onValueChange={(values) => {
				selectedTagIds = values as Id<'tags'>[];
				onTagsChange(selectedTagIds);
			}}
		>
			{#if selectedTags().length > 0}
				<!-- Anchor element when tags exist (for + button) - inside Combobox.Root -->
				<div class="relative" bind:this={tagInputRef} aria-hidden="true">
					<!-- Empty div for anchoring - no input needed -->
				</div>
			{:else}
				<!-- Empty state: "Add Tags" trigger button -->
				<div class="relative" bind:this={tagInputRef}>
					<button
						type="button"
						class="w-full px-menu-item py-menu-item text-sm text-secondary hover:text-primary bg-base border border-base rounded-md hover:bg-hover-solid transition-colors flex items-center gap-icon text-left"
						onclick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setComboboxOpen(true);
						}}
						aria-label="Add Tags"
					>
						<!-- Tag icon -->
						<svg
							class="w-4 h-4 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
							/>
						</svg>
						<span>Add Tags</span>
					</button>
				</div>
			{/if}

			<Combobox.Portal>
				<Combobox.Content
					class="bg-elevated rounded-md shadow-lg border border-base min-w-[280px] max-h-[320px] overflow-y-auto py-1 z-50"
					side="bottom"
					align="start"
					sideOffset={4}
					customAnchor={tagInputRef}
				>
					<!-- Input field inside dropdown (like Linear) -->
					<div class="relative px-menu-item py-menu-item border-b border-base mb-1">
						<Combobox.Input
							defaultValue={searchValue}
							oninput={(e) => {
								searchValue = e.currentTarget.value;
								setComboboxOpen(true);
							}}
							onkeydown={handleInputKeyDown}
							onfocus={handleInputFocus}
							placeholder="Add tags..."
							class="w-full px-menu-item py-menu-item text-sm text-primary bg-base border border-base rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary pr-8"
							aria-label="Tag selector input"
						/>
						<!-- Keyboard shortcut indicator -->
						<div
							class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1"
							aria-label="Keyboard shortcut: T"
						>
							<span class="text-label text-tertiary bg-elevated px-1 py-0.5 rounded border border-base">T</span>
						</div>
					</div>
					<!-- Selected Tags Section -->
					{@const isCreatingNewTag = canCreateTag() && searchValue.trim().length > 0}
					{#if selectedTags().length > 0 && !isCreatingNewTag}
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
					{@const hasFilteredTags = groupedTags().rootTags.length > 0 || groupedTags().groups.size > 0}
					{@const allTags = availableTags()}
					{@const hasUnselectedTags = allTags.some((tag: Tag) => !selectedTagIds.includes(tag._id))}
					{@const shouldShowAvailableSection = hasUnselectedTags || searchValue.trim().length > 0}
					{#if shouldShowAvailableSection}
						<div class="px-menu-item py-menu-item">
							<p class="text-label font-medium text-tertiary uppercase tracking-wider mb-1">Available Tags</p>
							{#if hasFilteredTags}
								{#each groupedTags().rootTags as tag}
									<button
										type="button"
										class="w-full px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer flex items-center gap-icon focus:bg-hover-solid outline-none text-left"
										onclick={() => handleTagToggle(tag._id)}
										aria-label={`Select tag ${tag.displayName}`}
									>
										<div class="w-4 h-4 flex-shrink-0"></div>
										<div
											class="w-2 h-2 rounded-full flex-shrink-0"
											style="background-color: {tag.color || DEFAULT_TAG_COLOR}"
										></div>
										<span class="flex-1">{tag.displayName}</span>
									</button>
								{/each}

							<!-- Grouped tags by parent -->
							{#each Array.from(groupedTags().groups.entries()) as [parentId, tags]}
								{@const parentTag = allTags.find((t: Tag) => t._id === parentId)}
								{#if parentTag}
									<div class="mt-2">
										<p class="text-label font-medium text-tertiary uppercase tracking-wider mb-1 px-menu-item">
											{parentTag.displayName}
										</p>
										{#each tags as tag}
											<button
												type="button"
												class="w-full px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer flex items-center gap-icon focus:bg-hover-solid outline-none text-left"
												onclick={() => handleTagToggle(tag._id)}
												aria-label={`Select tag ${tag.displayName}`}
											>
												<div class="w-4 h-4 flex-shrink-0"></div>
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
							{:else if searchValue.trim().length > 0}
								<!-- Show "No tags match" when search yields no results -->
								<div class="px-menu-item py-menu-item text-sm text-tertiary text-center">
									No tags match "{searchValue}"
								</div>
							{/if}
						</div>
					{/if}

					<!-- Create New Tag Option -->
					{#if canCreateTag() && onCreateTagWithColor && searchValue.trim().length > 0}
						{#if shouldShowAvailableSection || selectedTags().length > 0}
							<div class="h-px bg-base my-1"></div>
						{/if}
						{#if showColorPicker && colorPickerOpen}
							<div class="border-t border-base mt-1 pt-1">
								<p class="px-menu-item py-menu-item text-label font-medium text-secondary mb-1">
									Pick a color for label
								</p>
								<div
									role="listbox"
									tabindex="0"
									bind:this={colorPickerRef}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === 'Return') {
											e.preventDefault();
											if (TAG_COLORS[focusedColorIndex]) {
												handleColorSelect(TAG_COLORS[focusedColorIndex].hex);
											}
										} else if (e.key === 'ArrowDown') {
											e.preventDefault();
											focusedColorIndex = Math.min(focusedColorIndex + 1, TAG_COLORS.length - 1);
										} else if (e.key === 'ArrowUp') {
											e.preventDefault();
											focusedColorIndex = Math.max(focusedColorIndex - 1, 0);
										} else if (e.key === 'Escape') {
											e.preventDefault();
											showColorPicker = false;
											colorPickerOpen = false;
											searchValue = '';
											setComboboxOpen(false);
										}
									}}
								>
									{#each TAG_COLORS as color, index}
										<button
											type="button"
											class="w-full px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer flex items-center gap-icon focus:bg-hover-solid outline-none text-left"
											class:bg-hover-solid={focusedColorIndex === index}
											onclick={() => handleColorSelect(color.hex)}
											onfocus={() => {
												focusedColorIndex = index;
											}}
											aria-label={`Select color ${color.name}`}
											tabindex={index === focusedColorIndex ? 0 : -1}
										>
											<div
												class="w-2 h-2 rounded-full flex-shrink-0"
												style="background-color: {color.hex}"
											></div>
											<span class="flex-1">{color.name}</span>
										</button>
									{/each}
								</div>
							</div>
						{:else}
							<div class="border-t border-base mt-1 pt-1">
								<button
									type="button"
									class="w-full px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer flex items-center gap-icon focus:bg-hover-solid outline-none text-left"
									onclick={handleCreateTagClick}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === 'Return') {
											e.preventDefault();
											handleCreateTagClick();
										}
									}}
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

					<!-- Empty state (only show when no create option, no matches, no available section, and no selected tags) -->
					{@const tags = availableTags()}
					{#if !canCreateTag() && !shouldShowAvailableSection && selectedTags().length === 0}
						{#if tags.length === 0}
							<div class="px-menu-item py-menu-item text-sm text-tertiary text-center">
								No tags yet. Create your first tag!
							</div>
						{/if}
					{/if}
				</Combobox.Content>
			</Combobox.Portal>
		</Combobox.Root>
	</div>
</div>

