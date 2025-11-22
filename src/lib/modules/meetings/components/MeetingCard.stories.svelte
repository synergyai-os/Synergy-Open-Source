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
		{ name: 'John Doe', color: '#3b82f6' },
		{ name: 'Jane Smith', color: '#10b981' },
		{ name: 'Bob Johnson', color: '#f59e0b' },
		{ name: 'Alice Brown', color: '#ef4444' },
		{ name: 'Charlie Wilson', color: '#8b5cf6' },
		{ name: 'Diana Davis', color: '#ec4899' },
		{ name: 'Eve Miller', color: '#06b6d4' }
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
		<MeetingCard {...args} />
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
		<MeetingCard {...args} />
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
		<MeetingCard {...args} />
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
		<MeetingCard {...args} />
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
		<MeetingCard {...args} />
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
		<MeetingCard {...args} />
	{/snippet}
</Story>
