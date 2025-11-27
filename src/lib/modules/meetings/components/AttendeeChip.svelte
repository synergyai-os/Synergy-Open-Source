<script lang="ts">
	import { Icon, Text, Badge } from '$lib/components/atoms';
	import { attendeeChipRecipe, type AttendeeChipVariantProps } from '$lib/design-system/recipes';
	import type { Attendee } from '../composables/useAttendeeSelection.svelte';

	type Props = AttendeeChipVariantProps & {
		attendee: Attendee;
		onRemove: (attendee: Attendee) => void;
		getTypeLabel: (type: 'user' | 'circle') => string;
		class?: string;
	};

	let {
		attendee,
		onRemove,
		getTypeLabel,
		variant = 'default',
		class: className = ''
	}: Props = $props();

	const containerClasses = $derived([attendeeChipRecipe({ variant }), className]);
</script>

<div class={containerClasses}>
	<Icon type={attendee.type} size="sm" color="secondary" />
	<Text variant="body" size="sm" color="default" as="span">{attendee.name}</Text>
	<Badge variant="primary" size="sm">
		{getTypeLabel(attendee.type)}
	</Badge>
	<button
		type="button"
		onclick={() => onRemove(attendee)}
		class="rounded-button px-button-sm py-button-sm text-tertiary transition-colors hover:text-primary"
		aria-label={`Remove ${attendee.name}`}
	>
		<Icon type="close" size="sm" />
	</button>
</div>
