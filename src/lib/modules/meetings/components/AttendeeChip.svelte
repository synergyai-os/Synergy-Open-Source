<script lang="ts">
	import { Icon, Text, Badge, Button } from '$lib/components/atoms';
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
	// Use Button component with ghost variant (designed for icon-only) and override padding
	// className comes last in Button's merge, so our pl-button-sm overrides px-button-sm from iconOnly
	const closeButtonClasses = $derived('pl-button-sm');
</script>

<div class={containerClasses}>
	<Icon type={attendee.type} size="sm" color="secondary" />
	<Text variant="body" size="sm" color="default" lineHeight="compact" as="span"
		>{attendee.name}</Text
	>
	<Badge variant="primary" size="sm">
		{getTypeLabel(attendee.type)}
	</Badge>
	<Button
		variant="ghost"
		size="sm"
		iconOnly={true}
		ariaLabel={`Remove ${attendee.name}`}
		class={closeButtonClasses}
		style="padding-right: var(--spacing-chip-closeButton-pr);"
		onclick={() => onRemove(attendee)}
	>
		{#snippet children()}
			<Icon type="close" size="sm" />
		{/snippet}
	</Button>
</div>
