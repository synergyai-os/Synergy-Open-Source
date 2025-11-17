<script lang="ts">
	/**
	 * TodayMeetingCard - Prominent card for today's meetings
	 * Matches Holaspirit design with large layout and orange Start button
	 */

	interface Meeting {
		title: string;
		startTime: number;
		duration: number;
		visibility: 'public' | 'circle' | 'private';
		startedAt?: number; // Meeting session started
		closedAt?: number; // Meeting session closed
	}

	interface Props {
		meeting: Meeting;
		circleName?: string;
		attendeeAvatars?: Array<{ name: string; color: string }>;
		onStart?: () => void;
		onAddAgendaItem?: () => void;
	}

	let { meeting, circleName, attendeeAvatars = [], onStart, onAddAgendaItem }: Props = $props();

	// Check if meeting is in progress
	const isInProgress = $derived(meeting.startedAt !== undefined && meeting.closedAt === undefined);
	const buttonLabel = $derived(isInProgress ? 'Join meeting' : 'Start');

	// Format date for badge
	const startDate = $derived(new Date(meeting.startTime));
	const month = $derived(
		startDate.toLocaleDateString('en-US', { month: 'short' }).replace('.', '')
	);
	const dayOfMonth = $derived(startDate.getDate());
	const dayOfWeek = $derived(startDate.toLocaleDateString('en-US', { weekday: 'long' }));

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

<div
	class="bg-surface-base group flex w-full max-w-[300px] flex-col gap-inbox-list rounded-lg border border-border-base px-inbox-card py-inbox-card shadow-sm transition-shadow hover:shadow-md"
>
	<!-- Date Badge (Top) -->
	<div class="flex items-center gap-icon text-sm">
		<div class="font-medium text-text-tertiary">{month}. {dayOfMonth}</div>
		<div class="text-text-secondary">{dayOfWeek}</div>
	</div>

	<!-- Title + Privacy Icon -->
	<div class="flex items-center gap-icon">
		{#if isPrivate}
			<svg
				class="h-4 w-4 flex-shrink-0 text-text-tertiary"
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
		<h3 class="font-semibold text-text-primary">{meeting.title}</h3>
	</div>

	<!-- Time -->
	<div class="text-sm font-medium text-text-secondary">
		{startTimeStr} - {endTimeStr}
	</div>

	<!-- Circle Badge (if exists) -->
	{#if circleName}
		<div class="flex items-center gap-icon">
			<svg class="h-4 w-4 flex-shrink-0 text-text-tertiary" fill="currentColor" viewBox="0 0 20 20">
				<path
					d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
				/>
			</svg>
			<span class="text-sm text-text-secondary">{circleName}</span>
		</div>
	{/if}

	<!-- Attendee Avatars -->
	{#if attendeeAvatars.length > 0}
		<div class="flex items-center gap-inbox-icon">
			{#each attendeeAvatars.slice(0, 6) as attendee (attendee.name)}
				<div
					class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium text-white"
					style="background-color: {attendee.color}"
					title={attendee.name}
				>
					{getInitials(attendee.name)}
				</div>
			{/each}
			{#if attendeeAvatars.length > 6}
				<div
					class="bg-surface-tertiary flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium text-text-secondary"
					title="{attendeeAvatars.length - 6} more"
				>
					+{attendeeAvatars.length - 6}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Actions -->
	<div class="mt-4 flex flex-col gap-button-group">
		<!-- Add Agenda Item Button -->
		{#if onAddAgendaItem}
			<button
				onclick={onAddAgendaItem}
				class="hover:bg-surface-hover flex items-center justify-center gap-icon rounded-md border border-border-base px-button-x py-button-y text-sm text-text-secondary transition-colors"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
				Add agenda item
			</button>
		{/if}

		<!-- Start/Join Button (Prominent Primary) -->
		{#if onStart}
			<button
				onclick={onStart}
				class="rounded-md bg-accent-primary px-button-x py-button-y text-base font-medium text-white shadow-sm transition-colors hover:bg-accent-hover"
			>
				{buttonLabel}
			</button>
		{/if}
	</div>
</div>
