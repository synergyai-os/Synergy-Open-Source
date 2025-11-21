<script lang="ts">
	import { Card, Text } from '$lib/components/ui';
	import { formatRelativeDate } from '$lib/utils/date';

	type InboxItemType = 'readwise_highlight' | 'photo_note' | 'manual_text' | 'note';

	// Inbox item from Convex (with enriched display info)
	type InboxItem = {
		_id: string;
		type: InboxItemType;
		title: string; // Enriched from query
		snippet: string; // Enriched from query
		createdAt?: number; // Timestamp for date display
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

	// InboxCard-specific styling: selected state, hover background
	// Use noPadding variant to control padding ourselves, then add border conditionally
	const baseClasses = 'w-full text-left transition-all duration-150';
	// Selected: blue border (border-2 border-selected), unselected: subtle border with hover
	// Use $derived to ensure reactivity when selected prop changes
	const borderClasses = $derived(
		selected
			? 'border-2 border-selected bg-selected/10'
			: 'border border-base hover:bg-hover-solid hover:border-elevated'
	);
	const inboxCardClasses = $derived(`${baseClasses} ${borderClasses}`);
</script>

<Card
	variant="noPadding"
	clickable
	data-inbox-item-id={item._id}
	class={inboxCardClasses}
	onclick={(e) => {
		// Clear hover state by blurring
		(e.currentTarget as HTMLElement)?.blur();
		onClick();
	}}
>
	<div class="px-inbox-card py-inbox-card-compact">
		<div class="flex items-start gap-inbox-icon">
			<!-- Icon (emoji) - smaller size -->
			<div class="flex-shrink-0 text-body leading-none">{getTypeIcon(item.type)}</div>

			<!-- Content - flex-1 to take available space -->
			<div class="min-w-0 flex-1">
				<!-- Title and Date Row -->
				<div class="flex items-center justify-between gap-inbox-icon">
					<Text variant="body" size="sm" as="h3" class="truncate leading-tight font-semibold">
						{item.title || 'Untitled'}
					</Text>
					{#if item.createdAt}
						<Text variant="caption" size="sm" as="span" class="flex-shrink-0 text-tertiary">
							{formatRelativeDate(item.createdAt)}
						</Text>
					{/if}
				</div>
				<!-- Snippet - single line, tighter spacing -->
				<Text variant="body" size="sm" class="truncate leading-tight text-secondary">
					{item.snippet || 'No preview available'}
				</Text>
			</div>
		</div>
	</div>
</Card>
