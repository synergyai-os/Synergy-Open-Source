<script lang="ts">
	/**
	 * TodayMeetingCard - Prominent card for today's meetings
	 * Matches Holaspirit design with large layout and orange Start button
	 */

	import { Button, Text, Heading, Icon, Avatar, Card, Badge } from '$lib/components/atoms';
	import { todayMeetingCardRecipe } from '$lib/design-system/recipes';
	import { DEFAULT_LOCALE } from '$lib/utils/locale';

	interface Meeting {
		title: string;
		startTime: number;
		duration: number;
		visibility: 'public' | 'private';
		startedAt?: number; // Meeting session started
		closedAt?: number; // Meeting session closed
	}

	interface Props {
		meeting: Meeting;
		templateName?: string;
		circleName?: string;
		attendeeAvatars?: Array<{ name: string; color: string }>;
		onStart?: () => void;
		onAddAgendaItem?: () => void;
	}

	let {
		meeting,
		templateName,
		circleName,
		attendeeAvatars = [],
		onStart,
		onAddAgendaItem
	}: Props = $props();

	// Use recipe for variant-specific styling (applied to wrapper, not Card atom)
	const cardClasses = $derived([todayMeetingCardRecipe()]);

	// Check if meeting is in progress
	const isInProgress = $derived(meeting.startedAt !== undefined && meeting.closedAt === undefined);
	const buttonLabel = $derived(isInProgress ? 'Join meeting' : 'Start');

	// Format date for badge
	const startDate = $derived(new Date(meeting.startTime));
	const month = $derived(
		startDate.toLocaleDateString(DEFAULT_LOCALE, { month: 'short' }).replace('.', '')
	);
	const dayOfMonth = $derived(startDate.getDate());
	const dayOfWeek = $derived(startDate.toLocaleDateString(DEFAULT_LOCALE, { weekday: 'long' }));

	// Format time range
	const startTimeStr = $derived(
		startDate.toLocaleTimeString(DEFAULT_LOCALE, {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		})
	);
	const endDate = $derived(new Date(meeting.startTime + meeting.duration * 60 * 1000));
	const endTimeStr = $derived(
		endDate.toLocaleTimeString(DEFAULT_LOCALE, { hour: 'numeric', minute: '2-digit', hour12: true })
	);

	// Privacy icon
	const isPrivate = $derived(meeting.visibility === 'private');

	// Generate initials from name
	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<div class={cardClasses} style="max-width: 18.75rem;">
	<Card variant="premium" padding="md">
		<div class="gap-card flex flex-col">
			<!-- Date + Title Group (4px spacing between date and title) -->
			<div class="flex flex-col" style="gap: var(--spacing-1);">
				<!-- Date Badge -->
				<div class="gap-fieldGroup flex items-center">
					<Text variant="body" size="sm" color="tertiary" weight="medium" as="span"
						>{month}. {dayOfMonth}</Text
					>
					<Text variant="body" size="sm" color="secondary" as="span">{dayOfWeek}</Text>
				</div>

				<!-- Title + Privacy Icon -->
				<div class="gap-fieldGroup flex items-center">
					{#if isPrivate}
						<span class="flex-shrink-0">
							<Icon type="lock" size="sm" color="tertiary" />
						</span>
					{/if}
					<Heading level={3}>{meeting.title}</Heading>
				</div>
				<!-- Template Badge + Time (8px spacing below title) -->
				<div class="gap-fieldGroup mt-fieldGroup flex items-center">
					{#if templateName}
						<Badge variant="default" size="sm">
							{templateName}
						</Badge>
					{/if}
					<Text variant="body" size="sm" color="secondary" weight="medium" as="div">
						{startTimeStr} - {endTimeStr}
					</Text>
				</div>
			</div>

			<!-- Circle Badge (if exists) -->
			{#if circleName}
				<div class="gap-fieldGroup flex items-center">
					<Icon type="circles" size="sm" color="tertiary" />
					<Text variant="body" size="sm" color="secondary" as="span">{circleName}</Text>
				</div>
			{/if}

			<!-- Attendee Avatars (Group variant - overlapping when multiple) -->
			{#if attendeeAvatars.length > 0}
				<div class="flex items-center {attendeeAvatars.length > 1 ? '-space-x-2' : ''}">
					{#each attendeeAvatars.slice(0, 6) as attendee (attendee.name)}
						<Avatar
							initials={getInitials(attendee.name)}
							size="sm"
							variant="brand"
							title={attendee.name}
							class="border-surface border-2"
						/>
					{/each}
					{#if attendeeAvatars.length > 6}
						<Avatar
							initials={`+${attendeeAvatars.length - 6}`}
							size="sm"
							variant="default"
							title="{attendeeAvatars.length - 6} more"
							class="border-surface border-2"
						/>
					{/if}
				</div>
			{/if}

			<!-- Actions -->
			<div class="gap-fieldGroup flex flex-col">
				<!-- Add Agenda Item Button -->
				{#if onAddAgendaItem}
					<Button variant="outline" size="md" onclick={onAddAgendaItem}>
						<Icon type="add" size="md" />
						Add agenda item
					</Button>
				{/if}

				<!-- Start/Join Button (Prominent Primary) -->
				{#if onStart}
					<Button variant="primary" size="md" onclick={onStart}>
						{buttonLabel}
					</Button>
				{/if}
			</div>
		</div>
	</Card>
</div>
