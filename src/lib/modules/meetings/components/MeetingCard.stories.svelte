<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MeetingCard from './MeetingCard.svelte';

	const { Story } = defineMeta({
		component: MeetingCard,
		title: 'Modules/Meetings/MeetingCard',
		tags: ['autodocs']
	});

	// Mock meeting data
	const mockMeeting = {
		_id: 'meeting-1',
		title: 'Engineering Standup',
		startTime: Date.now() + 24 * 60 * 60 * 1000, // Tomorrow
		duration: 30,
		visibility: 'public',
		circleId: 'circle-1',
		attendeeCount: 5
	};

	const mockMeetingPrivate = {
		...mockMeeting,
		_id: 'meeting-2',
		title: 'Private Planning Session',
		visibility: 'private'
	};

	const mockMeetingRecurring = {
		...mockMeeting,
		_id: 'meeting-3',
		title: 'Weekly Team Sync',
		recurrence: {
			frequency: 'weekly',
			interval: 1,
			daysOfWeek: [1] // Monday
		}
	};

	const mockAttendeeAvatars = [
		{ name: 'John Doe', color: 'var(--color-accent-primary)' },
		{ name: 'Jane Smith', color: 'var(--color-success-text)' },
		{ name: 'Bob Johnson', color: 'var(--color-warning-text)' },
		{ name: 'Alice Brown', color: 'var(--color-error-text)' },
		{ name: 'Charlie Wilson', color: 'var(--color-syntax-function)' },
		{ name: 'Diana Davis', color: 'var(--color-accent-primary)' },
		{ name: 'Eve Miller', color: 'var(--color-accent-primary)' }
	];
</script>

<Story
	name="Default"
	args={{
		meeting: mockMeeting,
		circleName: 'Engineering Circle',
		organizationName: 'Acme Corp',
		attendeeAvatars: mockAttendeeAvatars.slice(0, 3)
	}}
>
	{#snippet template(args)}
		<MeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			organizationName={args.organizationName}
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
		organizationName: 'Acme Corp',
		attendeeAvatars: mockAttendeeAvatars
	}}
>
	{#snippet template(args)}
		<MeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			organizationName={args.organizationName}
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
		organizationName: 'Acme Corp',
		attendeeAvatars: mockAttendeeAvatars.slice(0, 2)
	}}
>
	{#snippet template(args)}
		<MeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			organizationName={args.organizationName}
			attendeeAvatars={args.attendeeAvatars}
			onStart={args.onStart}
			onAddAgendaItem={args.onAddAgendaItem}
		/>
	{/snippet}
</Story>

<Story
	name="Recurring"
	args={{
		meeting: mockMeetingRecurring,
		circleName: 'Engineering Circle',
		organizationName: 'Acme Corp',
		attendeeAvatars: mockAttendeeAvatars.slice(0, 4)
	}}
>
	{#snippet template(args)}
		<MeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			organizationName={args.organizationName}
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
		organizationName: 'Acme Corp',
		attendeeAvatars: mockAttendeeAvatars.slice(0, 3),
		onStart: () => console.log('Start clicked'),
		onAddAgendaItem: () => console.log('Add agenda item clicked')
	}}
>
	{#snippet template(args)}
		<MeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			organizationName={args.organizationName}
			attendeeAvatars={args.attendeeAvatars}
			onStart={args.onStart}
			onAddAgendaItem={args.onAddAgendaItem}
		/>
	{/snippet}
</Story>

<Story
	name="NoCircle"
	args={{
		meeting: mockMeeting,
		organizationName: 'Acme Corp',
		attendeeAvatars: mockAttendeeAvatars.slice(0, 2)
	}}
>
	{#snippet template(args)}
		<MeetingCard
			meeting={args.meeting}
			circleName={args.circleName}
			organizationName={args.organizationName}
			attendeeAvatars={args.attendeeAvatars}
			onStart={args.onStart}
			onAddAgendaItem={args.onAddAgendaItem}
		/>
	{/snippet}
</Story>
