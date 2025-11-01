<script lang="ts">
	type InboxItemType = 'readwise_highlight' | 'photo_note' | 'manual_text';

	type InboxItem = {
		id: string;
		type: InboxItemType;
		title: string;
		snippet: string;
		sourceData: any;
		tags: string[];
		createdAt: Date;
		processed: boolean;
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
			default:
				return '📝';
		}
	}
</script>

<button
	type="button"
	class="w-full text-left bg-elevated rounded-md transition-all duration-150 border"
	class:border-2={selected}
	class:border-selected={selected}
	class:border-base={!selected}
	class:hover:bg-hover-solid={!selected}
	class:hover:border-elevated={!selected}
	onclick={onClick}
>
	<div class="px-inbox-card py-inbox-card">
		<div class="flex items-start gap-inbox-icon">
			<!-- Icon -->
			<div class="text-xl flex-shrink-0 leading-none">{getTypeIcon(item.type)}</div>

			<!-- Content -->
			<div class="flex-1 min-w-0">
				<h3 class="font-semibold text-primary truncate text-sm leading-tight">{item.title}</h3>
				<p class="text-secondary text-xs mt-0.5 line-clamp-2 leading-relaxed">
					{item.snippet}
				</p>
				{#if item.tags.length > 0}
					<div class="flex items-center gap-1 mt-1.5">
						<!-- Tags -->
						<div class="flex flex-wrap gap-1">
							{#each item.tags.slice(0, 2) as tag}
								<span class="bg-tag text-tag text-label px-badge py-badge rounded">
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
