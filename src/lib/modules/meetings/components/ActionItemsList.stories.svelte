<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ActionItemsList from './ActionItemsList.svelte';

	const { Story } = defineMeta({
		component: ActionItemsList,
		title: 'Modules/Meetings/ActionItemsList',
		tags: ['autodocs']
	});

	// Mock IDs for Storybook
	const mockAgendaItemId = 'agenda-item-1';
	const mockMeetingId = 'meeting-1';
	const mockSessionId = 'session-1';
	const mockOrganizationId = 'org-1';
	const mockCircleId = 'circle-1';
</script>

<Story
	name="WithItems"
	args={{
		agendaItemId: mockAgendaItemId,
		meetingId: mockMeetingId,
		sessionId: mockSessionId,
		organizationId: mockOrganizationId,
		circleId: mockCircleId,
		readonly: false
	}}
>
	{#snippet template(args)}
		<ActionItemsList {...args} />
	{/snippet}
</Story>

<Story
	name="Readonly"
	args={{
		agendaItemId: mockAgendaItemId,
		meetingId: mockMeetingId,
		sessionId: mockSessionId,
		organizationId: mockOrganizationId,
		circleId: mockCircleId,
		readonly: true
	}}
>
	{#snippet template(args)}
		<ActionItemsList {...args} />
	{/snippet}
</Story>

<Story
	name="NoCircle"
	args={{
		agendaItemId: mockAgendaItemId,
		meetingId: mockMeetingId,
		sessionId: mockSessionId,
		organizationId: mockOrganizationId,
		readonly: false
	}}
>
	{#snippet template(args)}
		<ActionItemsList {...args} />
	{/snippet}
</Story>

<!--
	Note: Mock displays populated action items by default.
	To test empty state, temporarily set actionItems: [] in .storybook/mocks/useActionItems.svelte.ts
-->
