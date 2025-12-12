<script lang="ts">
	import { Card, Text } from '$lib/components/atoms';
	import { inboxCardRecipe } from '$lib/design-system/recipes';
	import { formatRelativeDate } from '$lib/utils/date';

	type InboxItemType = 'readwise_highlight' | 'photo_note' | 'manual_text' | 'note';

	// Inbox item from Convex (with enriched display info)
	type InboxItem = {
		_id: string;
		type: InboxItemType;
		title: string; // Enriched from query
		snippet: string; // Enriched from query
		createdAt?: number; // Timestamp for date display
		icon?: string; // Optional icon (emoji or text) - if not provided, falls back to type-based default
	};

	interface Props {
		item: InboxItem;
		selected?: boolean;
		onClick: () => void;
	}

	let { item, selected = false, onClick }: Props = $props();

	// Fallback function for type-based icons (used when icon prop not provided)
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

	// Use icon from item data if provided, otherwise fall back to type-based icon
	const icon = $derived(item.icon ?? getTypeIcon(item.type));

	// Use recipe for type-safe variant styling
	// Layout primitives (w-full, text-left) stay in component, not recipe
	const inboxCardClasses = $derived(['w-full text-left', inboxCardRecipe({ selected })]);

	// Transition using design token (150ms = fast duration for hovers)
	// WORKAROUND: Animation tokens exist but don't generate CSS variables yet
	// Using inline style with documented token value until utilities are added
	const transitionStyle = 'transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);';
</script>

<Card
	variant="noPadding"
	clickable
	data-inbox-item-id={item._id}
	class={inboxCardClasses}
	style={transitionStyle}
	onclick={(e) => {
		// Clear hover state by blurring
		(e.currentTarget as HTMLElement)?.blur();
		onClick();
	}}
>
	<!-- WORKAROUND: Compact card padding - see missing-styles.md -->
	<div style="padding-inline: var(--spacing-3); padding-block: var(--spacing-2);">
		<div class="gap-fieldGroup flex items-start">
			<!-- Icon (emoji) - from item.icon prop or type-based fallback -->
			<div class="text-body flex-shrink-0 leading-none">{icon}</div>

			<!-- Content - flex-1 to take available space -->
			<div class="min-w-0 flex-1">
				<!-- Title and Date Row -->
				<div class="gap-fieldGroup flex items-center justify-between">
					<Text
						variant="body"
						size="sm"
						color="default"
						as="h3"
						class="truncate leading-tight font-semibold"
					>
						{item.title || 'Untitled'}
					</Text>
					{#if item.createdAt}
						<Text variant="caption" size="sm" color="tertiary" as="span" class="flex-shrink-0">
							{formatRelativeDate(item.createdAt)}
						</Text>
					{/if}
				</div>
				<!-- Snippet - single line, tighter spacing -->
				<Text variant="body" size="sm" color="secondary" class="truncate leading-tight">
					{item.snippet || 'No preview available'}
				</Text>
			</div>
		</div>
	</div>
</Card>
