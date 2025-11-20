<script lang="ts">
	/**
	 * MeetingCard - Display meeting info in list view
	 * Matches Holaspirit design: date badge, title, time, circle, attendees, actions
	 */

	import type { Id } from '$lib/convex';
	import { downloadICS } from '$lib/utils/calendar';

	interface Meeting {
		_id: Id<'meetings'> | string; // Allow string for generated recurring instances
		title: string;
		startTime: number;
		duration: number;
		visibility: 'public' | 'circle' | 'private';
		circleId?: Id<'circles'> | string;
		recurrence?: {
			frequency: 'daily' | 'weekly' | 'monthly';
			interval: number;
			daysOfWeek?: number[];
			endDate?: number;
		};
		attendeeCount?: number;
	}

	interface Props {
		meeting: Meeting;
		circleName?: string;
		organizationName?: string;
		attendeeAvatars?: Array<{ name: string; color: string }>;
		onStart?: () => void;
		onAddAgendaItem?: () => void;
	}

	let {
		meeting,
		circleName,
		organizationName,
		attendeeAvatars = [],
		onStart,
		onAddAgendaItem
	}: Props = $props();

	// Format date for badge
	const startDate = $derived(new Date(meeting.startTime));
	const dayOfMonth = $derived(startDate.getDate());
	const dayOfWeek = $derived(
		startDate.toLocaleDateString('en-US', { weekday: 'short' }).replace('.', '')
	);

	// Format time range
	const startTimeStr = $derived(
		startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
	);
	const endDate = $derived(new Date(meeting.startTime + meeting.duration * 60 * 1000));
	const endTimeStr = $derived(
		endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
	);

	// Privacy icon
	const isPrivate = $derived(meeting.visibility === 'private');
	const hasRecurrence = $derived(!!meeting.recurrence);

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
</script>

<div
	class="group gap-spacing-card-gap border-border-subtle py-spacing-card-padding-y hover:bg-surface-hover flex border-b transition-colors"
>
	<!-- Date Badge (Left) -->
	<div class="flex w-20 flex-col items-center justify-start pt-2">
		<div class="text-sm text-text-tertiary">{dayOfWeek}</div>
		<div class="text-2xl font-medium text-text-primary">{dayOfMonth}</div>
	</div>

	<!-- Meeting Info (Center) -->
	<div class="flex-1 space-y-2 py-2">
		<!-- Title + Privacy Icon + Recurrence -->
		<div class="flex items-center gap-2">
			{#if isPrivate}
				<svg
					class="h-4 w-4 text-text-tertiary"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
					/>
				</svg>
			{/if}
			<h3 class="text-base font-medium text-text-primary">{meeting.title}</h3>
			{#if hasRecurrence}
				<svg
					class="h-4 w-4 text-text-tertiary"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
			{/if}
		</div>

		<!-- Time -->
		<div class="text-sm text-text-secondary">
			{startTimeStr} - {endTimeStr}
		</div>

		<!-- Circle Badge (if exists) -->
		{#if circleName}
			<div class="flex items-center gap-1.5">
				<svg class="h-4 w-4 text-text-tertiary" fill="currentColor" viewBox="0 0 20 20">
					<path
						d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
					/>
				</svg>
				<span class="text-sm text-text-secondary">{circleName}</span>
			</div>
		{/if}

		<!-- Attendee Avatars -->
		{#if attendeeAvatars.length > 0}
			<div class="flex items-center gap-1">
				{#each attendeeAvatars.slice(0, 6) as attendee (attendee.name)}
					<div
						class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-white"
						style="background-color: {attendee.color}"
						title={attendee.name}
					>
						{getInitials(attendee.name)}
					</div>
				{/each}
				{#if attendeeAvatars.length > 6}
					<div
						class="bg-surface-tertiary flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-text-secondary"
						title="{attendeeAvatars.length - 6} more"
					>
						+{attendeeAvatars.length - 6}
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Actions (Right) -->
	<div class="flex items-center gap-2 py-2">
		<!-- Download Calendar -->
		<button
			onclick={handleDownloadCalendar}
			class="border-border-subtle hover:bg-surface-hover rounded-md border p-1.5 text-text-secondary transition-colors"
			title="Download .ics file"
			aria-label="Download calendar event"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
				/>
			</svg>
		</button>

		{#if onAddAgendaItem}
			<button
				onclick={onAddAgendaItem}
				class="border-border-subtle hover:bg-surface-hover rounded-md border px-3 py-1.5 text-sm text-text-secondary transition-colors"
			>
				+ Add agenda item
			</button>
		{/if}
		{#if onStart}
			<button
				onclick={onStart}
				class="bg-accent-orange hover:bg-accent-orange-hover rounded-md px-4 py-1.5 text-sm font-medium text-white transition-colors"
			>
				Start
			</button>
		{/if}
		<button
			class="rounded-md p-1.5 text-text-tertiary transition-colors hover:text-text-secondary"
			aria-label="More options"
		>
			<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
				<path
					d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
				/>
			</svg>
		</button>
	</div>
</div>
