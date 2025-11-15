<script lang="ts">
	type InboxItemType = 'readwise_highlight' | 'photo_note' | 'manual_text' | 'note';

	// Inbox item from Convex (with enriched display info)
	type InboxItem = {
		_id: string;
		type: InboxItemType;
		title: string; // Enriched from query
		snippet: string; // Enriched from query
		tags: string[]; // Enriched from query
	};

	interface Props {
		item: InboxItem;
		selected?: boolean;
		onClick: () => void;
	}

	let { item, selected = false, onClick }: Props = $props();

	function getTypeIcon(type: InboxItemType): string {
		switch (type) {
			case 'readwise_highlight':
				return '📚';
			case 'photo_note':
				return '📷';
			case 'manual_text':
				return '✍️';
			case 'note':
				return '📝';
			default:
				return '📋';
		}
	}
</script>

<button
	type="button"
	data-inbox-item-id={item._id}
	class="w-full rounded-md border bg-elevated text-left transition-all duration-150 outline-none"
	class:border-2={selected}
	class:border-selected={selected}
	class:border-base={!selected}
	class:hover:bg-hover-solid={!selected}
	class:hover:border-elevated={!selected}
	class:focus-visible:ring-2={!selected}
	class:focus-visible:ring-accent-primary={!selected}
	class:focus-visible:ring-offset-2={!selected}
	onclick={(e) => {
		// Clear hover state by blurring
		(e.currentTarget as HTMLElement)?.blur();
		onClick();
	}}
>
	<div class="px-inbox-card py-inbox-card">
		<div class="flex items-start gap-inbox-icon">
			<!-- Icon -->
			<div class="flex-shrink-0 text-xl leading-none">{getTypeIcon(item.type)}</div>

			<!-- Content -->
			<div class="min-w-0 flex-1">
				<h3 class="truncate text-sm leading-tight font-semibold text-primary">
					{item.title || 'Untitled'}
				</h3>
				<p class="mt-0.5 line-clamp-2 text-xs leading-relaxed text-secondary">
					{item.snippet || 'No preview available'}
				</p>
				{#if item.tags && item.tags.length > 0}
					<div class="mt-1.5 flex items-center gap-1">
						<!-- Tags -->
						<div class="flex flex-wrap gap-1">
							{#each item.tags.slice(0, 2) as tag (tag)}
								<span class="rounded bg-tag px-badge py-badge text-label text-tag">
									{tag}
								</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</button>
