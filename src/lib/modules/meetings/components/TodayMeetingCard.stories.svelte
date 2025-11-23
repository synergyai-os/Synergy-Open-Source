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

	const mockMeeting = {
		title: 'Engineering Standup',
		startTime: todayAt2PM,
		duration: 30,
		visibility: 'public'
	};

	const mockMeetingInProgress = {
		...mockMeeting,
		title: 'Active Team Sync',
		startedAt: todayAt2PM - 15 * 60 * 1000 // Started 15 minutes ago
	};

	const mockMeetingPrivate = {
		...mockMeeting,
		title: 'Private Planning Session',
		visibility: 'private'
	};

	const mockAttendeeAvatars = [
		{ name: 'John Doe', color: '#3b82f6' },
		{ name: 'Jane Smith', color: '#10b981' },
		{ name: 'Bob Johnson', color: '#f59e0b' },
		{ name: 'Alice Brown', color: '#ef4444' },
		{ name: 'Charlie Wilson', color: '#8b5cf6' },
		{ name: 'Diana Davis', color: '#ec4899' }
	];
</script>

<Story
	name="Default"
	args={{
		meeting: mockMeeting,
		circleName: 'Engineering Circle',
		attendeeAvatars: mockAttendeeAvatars.slice(0, 3)
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
	name="InProgress"
	args={{
		meeting: mockMeetingInProgress,
		circleName: 'Engineering Circle',
		attendeeAvatars: mockAttendeeAvatars.slice(0, 4),
		onStart: () => console.log('Join clicked')
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
	name="Private"
	args={{
		meeting: mockMeetingPrivate,
		circleName: 'Engineering Circle',
		attendeeAvatars: mockAttendeeAvatars.slice(0, 2)
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
	name="WithManyAttendees"
	args={{
		meeting: mockMeeting,
		circleName: 'Engineering Circle',
		attendeeAvatars: mockAttendeeAvatars
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
	name="WithActions"
	args={{
		meeting: mockMeeting,
		circleName: 'Engineering Circle',
		attendeeAvatars: mockAttendeeAvatars.slice(0, 3),
		onStart: () => console.log('Start clicked'),
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
	name="NoCircle"
	args={{ meeting: mockMeeting, attendeeAvatars: mockAttendeeAvatars.slice(0, 2) }}
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
