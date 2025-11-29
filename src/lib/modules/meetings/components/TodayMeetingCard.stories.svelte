<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TodayMeetingCard from './TodayMeetingCard.svelte';

	const { Story } = defineMeta({
		component: TodayMeetingCard,
		title: 'Modules/Meetings/TodayMeetingCard',
		tags: ['autodocs']
	});

	// Mock meeting data for today
	// Use Date.now() and manual calculation instead of mutable Date object
	const today = Date.now();
	const todayAt2PM = today - (today % (24 * 60 * 60 * 1000)) + 14 * 60 * 60 * 1000; // 2 PM today

	const mockMeetingPublic = {
		title: 'Engineering Standup',
		startTime: todayAt2PM,
		duration: 30,
		visibility: 'public'
	};

	const mockMeetingPrivate = {
		...mockMeetingPublic,
		title: 'Private Planning Session',
		visibility: 'private'
	};

	const mockMeetingInProgress = {
		...mockMeetingPublic,
		title: 'Active Team Sync',
		startedAt: todayAt2PM - 15 * 60 * 1000 // Started 15 minutes ago
	};

	const mockAttendeeAvatars = [
		{ name: 'John Doe', color: 'var(--color-accent-primary)' },
		{ name: 'Jane Smith', color: 'var(--color-success-text)' },
		{ name: 'Bob Johnson', color: 'var(--color-warning-text)' },
		{ name: 'Alice Brown', color: 'var(--color-error-text)' },
		{ name: 'Charlie Wilson', color: 'var(--color-code-function)' },
		{ name: 'Diana Davis', color: 'var(--color-accent-primary)' }
	];

	const mockAttendeeAvatarsLarge = [
		...mockAttendeeAvatars,
		{ name: 'Eve Miller', color: 'var(--color-accent-primary)' },
		{ name: 'Frank Garcia', color: 'var(--color-success-text)' },
		{ name: 'Grace Lee', color: 'var(--color-warning-text)' },
		{ name: 'Henry Taylor', color: 'var(--color-error-text)' },
		{ name: 'Ivy Martinez', color: 'var(--color-code-function)' }
	];
</script>

<!-- ============================================================================
	AS ORGANIZER - I created this meeting, I can start it and add agenda items
	(Anyone can add agenda items - collaborative by design)
============================================================================ -->

<Story
	name="AsOrganizer - Public Meeting"
	args={{
		meeting: mockMeetingPublic,
		circleName: 'Engineering Circle',
		attendeeAvatars: mockAttendeeAvatars.slice(0, 3),
		onStart: () => console.log('Start meeting clicked'),
		onAddAgendaItem: () => console.log('Add agenda item clicked')
	}}
>
	{#snippet template(args)}
		<TodayMeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			attendeeAvatars={args.attendeeAvatars}
			onStart={args.onStart}
			onAddAgendaItem={args.onAddAgendaItem}
		/>
	{/snippet}
</Story>

<Story
	name="AsOrganizer - Private Meeting"
	args={{
		meeting: mockMeetingPrivate,
		circleName: 'Engineering Circle',
		attendeeAvatars: mockAttendeeAvatars.slice(0, 2),
		onStart: () => console.log('Start meeting clicked'),
		onAddAgendaItem: () => console.log('Add agenda item clicked')
	}}
>
	{#snippet template(args)}
		<TodayMeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			attendeeAvatars={args.attendeeAvatars}
			onStart={args.onStart}
			onAddAgendaItem={args.onAddAgendaItem}
		/>
	{/snippet}
</Story>

<Story
	name="AsOrganizer - Many Attendees"
	args={{
		meeting: mockMeetingPublic,
		circleName: 'Engineering Circle',
		attendeeAvatars: mockAttendeeAvatars,
		onStart: () => console.log('Start meeting clicked'),
		onAddAgendaItem: () => console.log('Add agenda item clicked')
	}}
>
	{#snippet template(args)}
		<TodayMeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			attendeeAvatars={args.attendeeAvatars}
			onStart={args.onStart}
			onAddAgendaItem={args.onAddAgendaItem}
		/>
	{/snippet}
</Story>

<Story
	name="AsOrganizer - Attendees Overflow"
	args={{
		meeting: mockMeetingPublic,
		circleName: 'Engineering Circle',
		attendeeAvatars: mockAttendeeAvatarsLarge,
		onStart: () => console.log('Start meeting clicked'),
		onAddAgendaItem: () => console.log('Add agenda item clicked')
	}}
>
	{#snippet template(args)}
		<TodayMeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			attendeeAvatars={args.attendeeAvatars}
			onStart={args.onStart}
			onAddAgendaItem={args.onAddAgendaItem}
		/>
	{/snippet}
</Story>

<Story
	name="AsOrganizer - Ad-Hoc Meeting"
	args={{
		meeting: mockMeetingPublic,
		attendeeAvatars: mockAttendeeAvatars.slice(0, 2),
		onStart: () => console.log('Start meeting clicked'),
		onAddAgendaItem: () => console.log('Add agenda item clicked')
	}}
>
	{#snippet template(args)}
		<TodayMeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			attendeeAvatars={args.attendeeAvatars}
			onStart={args.onStart}
			onAddAgendaItem={args.onAddAgendaItem}
		/>
	{/snippet}
</Story>

<!-- ============================================================================
	AS ATTENDEE - I'm invited to this meeting, I can start/join and add agenda items
	(Anyone can add agenda items - collaborative by design)
============================================================================ -->

<Story
	name="AsAttendee - Public Meeting"
	args={{
		meeting: mockMeetingPublic,
		circleName: 'Engineering Circle',
		attendeeAvatars: mockAttendeeAvatars.slice(0, 3),
		onStart: () => console.log('Start meeting clicked'),
		onAddAgendaItem: () => console.log('Add agenda item clicked')
	}}
>
	{#snippet template(args)}
		<TodayMeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			attendeeAvatars={args.attendeeAvatars}
			onStart={args.onStart}
			onAddAgendaItem={args.onAddAgendaItem}
		/>
	{/snippet}
</Story>

<Story
	name="AsAttendee - Private Meeting"
	args={{
		meeting: mockMeetingPrivate,
		circleName: 'Engineering Circle',
		attendeeAvatars: mockAttendeeAvatars.slice(0, 2),
		onStart: () => console.log('Start meeting clicked'),
		onAddAgendaItem: () => console.log('Add agenda item clicked')
	}}
>
	{#snippet template(args)}
		<TodayMeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			attendeeAvatars={args.attendeeAvatars}
			onStart={args.onStart}
			onAddAgendaItem={args.onAddAgendaItem}
		/>
	{/snippet}
</Story>

<Story
	name="AsAttendee - Many Attendees"
	args={{
		meeting: mockMeetingPublic,
		circleName: 'Engineering Circle',
		attendeeAvatars: mockAttendeeAvatars,
		onStart: () => console.log('Start meeting clicked'),
		onAddAgendaItem: () => console.log('Add agenda item clicked')
	}}
>
	{#snippet template(args)}
		<TodayMeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			attendeeAvatars={args.attendeeAvatars}
			onStart={args.onStart}
			onAddAgendaItem={args.onAddAgendaItem}
		/>
	{/snippet}
</Story>

<!-- ============================================================================
	IN PROGRESS - Meeting has started, shows "Join meeting" button only
	(Agenda items cannot be added once meeting is in progress)
============================================================================ -->

<Story
	name="InProgress - As Organizer"
	args={{
		meeting: mockMeetingInProgress,
		circleName: 'Engineering Circle',
		attendeeAvatars: mockAttendeeAvatars.slice(0, 4),
		onStart: () => console.log('Join meeting clicked')
	}}
>
	{#snippet template(args)}
		<TodayMeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			attendeeAvatars={args.attendeeAvatars}
			onStart={args.onStart}
			onAddAgendaItem={args.onAddAgendaItem}
		/>
	{/snippet}
</Story>

<Story
	name="InProgress - As Attendee"
	args={{
		meeting: mockMeetingInProgress,
		circleName: 'Engineering Circle',
		attendeeAvatars: mockAttendeeAvatars.slice(0, 4),
		onStart: () => console.log('Join meeting clicked')
	}}
>
	{#snippet template(args)}
		<TodayMeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			attendeeAvatars={args.attendeeAvatars}
			onStart={args.onStart}
			onAddAgendaItem={args.onAddAgendaItem}
		/>
	{/snippet}
</Story>

<!-- ============================================================================
	EDGE CASES - Special scenarios
============================================================================ -->

<Story
	name="EdgeCase - Single Attendee"
	args={{
		meeting: mockMeetingPublic,
		circleName: 'Engineering Circle',
		attendeeAvatars: mockAttendeeAvatars.slice(0, 1),
		onStart: () => console.log('Start meeting clicked'),
		onAddAgendaItem: () => console.log('Add agenda item clicked')
	}}
>
	{#snippet template(args)}
		<TodayMeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			attendeeAvatars={args.attendeeAvatars}
			onStart={args.onStart}
			onAddAgendaItem={args.onAddAgendaItem}
		/>
	{/snippet}
</Story>

<Story
	name="EdgeCase - No Attendees"
	args={{
		meeting: mockMeetingPublic,
		circleName: 'Engineering Circle',
		attendeeAvatars: [],
		onStart: () => console.log('Start meeting clicked'),
		onAddAgendaItem: () => console.log('Add agenda item clicked')
	}}
>
	{#snippet template(args)}
		<TodayMeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			attendeeAvatars={args.attendeeAvatars}
			onStart={args.onStart}
			onAddAgendaItem={args.onAddAgendaItem}
		/>
	{/snippet}
</Story>
