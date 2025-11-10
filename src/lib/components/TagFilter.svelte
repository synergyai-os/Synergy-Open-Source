<script lang="ts">
	import type { Id } from '../../../convex/_generated/dataModel';

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
	};

	let { selectedTagIds = $bindable([]), availableTags, onTagsChange }: Props = $props();

	// Toggle tag selection
	function toggleTag(tagId: Id<'tags'>) {
		const newSelection = selectedTagIds.includes(tagId)
			? selectedTagIds.filter((id) => id !== tagId)
			: [...selectedTagIds, tagId];
		onTagsChange(newSelection);
	}

	// Get selected tags for display
	const selectedTags = $derived(() => {
		return selectedTagIds
			.map((id) => availableTags.find((t) => t._id === id))
			.filter((t): t is Tag => t !== undefined);
	});

	// Group tags by hierarchy for display
	const groupedTags = $derived(() => {
		const groups = new Map<Id<'tags'> | 'root', Tag[]>();
		const rootTags: Tag[] = [];
		const selectedIds = new Set(selectedTagIds);

		// Build tag map for parent lookup
		const tagMap = new Map<Id<'tags'>, Tag>();
		for (const tag of availableTags) {
			tagMap.set(tag._id, tag);
		}

		// Group tags by parent
		for (const tag of availableTags) {
			if (selectedIds.has(tag._id)) continue; // Skip selected tags (shown as badges)

			if (tag.parentId) {
				const parent = tagMap.get(tag.parentId);
				if (parent) {
					if (!groups.has(tag.parentId)) {
						groups.set(tag.parentId, []);
					}
					groups.get(tag.parentId)!.push(tag);
				}
			} else {
				rootTags.push(tag);
			}
		}

		return { rootTags, groups, tagMap };
	});

	// Clear all selected tags
	function clearAll() {
		onTagsChange([]);
	}
</script>

<div class="flex flex-col gap-icon">
	<!-- Selected Tags (Badges) -->
	{#if selectedTags().length > 0}
		<div class="flex flex-wrap items-center gap-icon">
			<span class="text-label tracking-wider text-secondary uppercase">Filtered by:</span>
			{#each selectedTags() as tag}
				<button
					type="button"
					onclick={() => toggleTag(tag._id)}
					class="inline-flex items-center gap-icon rounded-md px-badge py-badge text-label font-medium transition-colors hover:opacity-80"
					style="background-color: {tag.color}20; color: {tag.color}; border: 1px solid {tag.color}40;"
					title="Click to remove filter"
				>
					{tag.displayName}
					<svg
						class="h-3 w-3"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			{/each}
			<button
				type="button"
				onclick={clearAll}
				class="text-label text-secondary transition-colors hover:text-primary"
			>
				Clear all
			</button>
		</div>
	{/if}

	<!-- Available Tags (Hierarchical List) -->
	{#if (selectedTags().length === 0 || groupedTags().rootTags.length > 0 || groupedTags().groups.size > 0) && (groupedTags().rootTags.length > 0 || groupedTags().groups.size > 0)}
		<div class="gap-section flex flex-col">
			{#if selectedTags().length === 0}
				<span class="text-label tracking-wider text-secondary uppercase">Filter by tag:</span>
			{/if}

			<!-- Root Tags -->
			{#if groupedTags().rootTags.length > 0}
				<div class="flex flex-wrap gap-icon">
					{#each groupedTags().rootTags as tag}
						<button
							type="button"
							onclick={() => toggleTag(tag._id)}
							class="inline-flex items-center rounded-md border border-base px-badge py-badge text-label font-medium transition-colors hover:opacity-80"
							style="background-color: {tag.color}20; color: {tag.color};"
							title="Click to filter by this tag"
						>
							{tag.displayName}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Child Tags (Grouped by Parent) -->
			{#each Array.from(groupedTags().groups.entries()) as [parentId, children]}
				{@const parent = parentId !== 'root' ? groupedTags().tagMap.get(parentId) : undefined}
				{#if parent}
					<div class="gap-section flex flex-col pl-indent">
						<span class="text-label text-secondary">{parent.displayName}:</span>
						<div class="flex flex-wrap gap-icon">
							{#each children as tag}
								<button
									type="button"
									onclick={() => toggleTag(tag._id)}
									class="inline-flex items-center rounded-md border border-base px-badge py-badge text-label font-medium transition-colors hover:opacity-80"
									style="background-color: {tag.color}20; color: {tag.color};"
									title="Click to filter by this tag"
								>
									{tag.displayName}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
