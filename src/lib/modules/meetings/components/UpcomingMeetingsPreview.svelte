<script lang="ts">
	/**
	 * UpcomingMeetingsPreview - Displays upcoming meeting dates in a grid
	 * Shows date cards for recurring meeting preview
	 */

	import { Text } from '$lib/components/atoms';

	interface Props {
		dates: Date[];
		class?: string;
	}

	let { dates, class: className = '' }: Props = $props();
</script>

{#if dates.length > 0}
	<div class={className}>
		<Text variant="body" size="sm" color="secondary" as="span" class="mb-fieldGroup block">
			Upcoming {dates.length} Meetings
		</Text>
		<div class="flex gap-fieldGroup">
			{#each dates as date (date.getTime())}
				<div class="bg-surface-tertiary rounded-card px-input-x py-input-y text-center">
					<Text variant="label" color="info" as="div" class="font-medium">
						{date.toLocaleDateString('en-US', { month: 'short' })}
					</Text>
					<Text variant="body" size="sm" color="default" as="div" class="font-medium">
						{date.getDate()}
					</Text>
					<Text variant="label" color="secondary" as="div">
						{date.getFullYear()}
					</Text>
				</div>
			{/each}
		</div>
	</div>
{/if}
