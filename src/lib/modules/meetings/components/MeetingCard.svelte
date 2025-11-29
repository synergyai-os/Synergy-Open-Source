<script lang="ts">
	/**
	 * MeetingCard - Display meeting info in list view
	 * Matches Holaspirit design: date badge, title, time, circle, attendees, actions
	 */

	import type { Id } from '$lib/convex';
	import { downloadICS } from '$lib/utils/calendar';
	import { Button, Text, Icon, Avatar } from '$lib/components/atoms';
	import { meetingCardRecipe } from '$lib/design-system/recipes';
	import { DEFAULT_LOCALE } from '$lib/utils/locale';

	interface Meeting {
		_id: Id<'meetings'> | string; // Allow string for generated recurring instances
		title: string;
		startTime: number;
		duration: number;
		visibility: 'public' | 'private';
		circleId?: Id<'circles'> | string;
		recurrence?: {
			frequency: 'daily' | 'weekly' | 'monthly';
			interval: number;
			daysOfWeek?: number[];
			endDate?: number;
		};
		attendeeCount?: number;
		closedAt?: number; // Meeting session closed timestamp
	}

	interface Props {
		meeting: Meeting;
		circleName?: string;
		organizationName?: string;
		attendeeAvatars?: Array<{ name: string; color: string }>;
		onStart?: () => void;
		onAddAgendaItem?: () => void;
		onShowReport?: () => void;
	}

	let {
		meeting,
		circleName,
		organizationName,
		attendeeAvatars = [],
		onStart,
		onAddAgendaItem,
		onShowReport
	}: Props = $props();

	// Format date for badge
	const startDate = $derived(new Date(meeting.startTime));
	const dayOfMonth = $derived(startDate.getDate());
	const dayOfWeek = $derived(
		startDate.toLocaleDateString(DEFAULT_LOCALE, { weekday: 'short' }).replace('.', '')
	);

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
	const hasRecurrence = $derived(!!meeting.recurrence);

	// Check if meeting is closed
	const isClosed = $derived(!!meeting.closedAt);

	// Generate initials from name
	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	// Download calendar event
	function handleDownloadCalendar() {
		downloadICS(meeting, organizationName);
	}

	// Use recipe for container styling with closed variant
	const containerClasses = $derived([meetingCardRecipe({ closed: isClosed })]);
</script>

<div class={containerClasses}>
	<!-- Date Badge (Left) -->
	<!-- WORKAROUND: Date badge width - see missing-styles.md -->
	<div class="flex flex-col items-center justify-center" style="width: var(--spacing-20);">
		<Text variant="body" size="sm" color="tertiary" as="div">{dayOfWeek}</Text>
		<Text variant="body" size="lg" color="default" weight="medium" as="div">{dayOfMonth}</Text>
	</div>

	<!-- Meeting Info (Center) -->
	<!-- WORKAROUND: Card row vertical padding - see missing-styles.md -->
	<div class="flex-1" style="padding-block: var(--spacing-card-padding);">
		<!-- Title + Privacy Icon + Recurrence -->
		<div class="flex items-center gap-fieldGroup">
			{#if isPrivate}
				<Icon type="lock" size="sm" color="tertiary" />
			{/if}
			<Text variant="body" size="base" color="default" weight="medium" as="h3">{meeting.title}</Text
			>
			{#if hasRecurrence}
				<Icon type="recurrence" size="sm" color="tertiary" />
			{/if}
		</div>

		<!-- Time -->
		<Text variant="body" size="sm" color="secondary" as="div">
			{startTimeStr} - {endTimeStr}
		</Text>

		<!-- Circle Badge (if exists) -->
		{#if circleName}
			<div class="flex items-center gap-fieldGroup">
				<Icon type="circles" size="sm" color="tertiary" />
				<Text variant="body" size="sm" color="secondary" as="span">{circleName}</Text>
			</div>
		{/if}

		<!-- Attendee Avatars -->
		{#if attendeeAvatars.length > 0}
			<div class="flex items-center gap-fieldGroup">
				{#each attendeeAvatars.slice(0, 6) as attendee (attendee.name)}
					<Avatar
						initials={getInitials(attendee.name)}
						size="sm"
						variant="brand"
						title={attendee.name}
					/>
				{/each}
				{#if attendeeAvatars.length > 6}
					<Avatar
						initials={`+${attendeeAvatars.length - 6}`}
						size="sm"
						variant="default"
						title="{attendeeAvatars.length - 6} more"
					/>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Actions (Right) -->
	<!-- WORKAROUND: Card row vertical padding - see missing-styles.md -->
	<div
		class="flex items-center gap-fieldGroup"
		style="padding-block: var(--spacing-card-padding); padding-inline-end: var(--spacing-header-gap);"
	>
		{#if isClosed}
			<!-- Closed state: Show Report button -->
			{#if onShowReport}
				<Button variant="outline" onclick={onShowReport}>
					<Icon type="document" size="sm" />
					Show Report
				</Button>
			{/if}
		{:else}
			<!-- Active state: Download, Add agenda item, Start buttons -->
			<!-- Download Calendar -->
			<Button
				variant="outline"
				iconOnly
				ariaLabel="Download calendar event"
				onclick={handleDownloadCalendar}
			>
				<Icon type="download" size="md" />
			</Button>

			{#if onAddAgendaItem}
				<Button variant="outline" onclick={onAddAgendaItem}>
					<Icon type="add" size="sm" />
					Add agenda item
				</Button>
			{/if}
			{#if onStart}
				<Button variant="primary" onclick={onStart}>Start</Button>
			{/if}
		{/if}
		<!-- More options menu (always visible) -->
		<button
			type="button"
			class="flex cursor-pointer items-center justify-center rounded-button text-secondary transition-colors hover:bg-hover hover:text-primary"
			style="padding-block: var(--spacing-1);"
			aria-label="More options"
		>
			<Icon type="more" size="md" />
		</button>
	</div>
</div>
