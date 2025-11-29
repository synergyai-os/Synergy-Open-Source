<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AttendeeSelector from './AttendeeSelector.svelte';

	const { Story } = defineMeta({
		component: AttendeeSelector,
		title: 'Modules/Meetings/AttendeeSelector',
		tags: ['autodocs']
	});

	// Mock IDs for Storybook
	const mockOrganizationId = 'org-1';
	const mockSessionId = 'session-1';
</script>

<Story
	name="Empty"
	args={{
		selectedAttendees: [],
		workspaceId: mockOrganizationId,
		sessionId: mockSessionId
	}}
>
	{#snippet template(args)}
		<div class="p-md bg-base">
			<AttendeeSelector
				bind:selectedAttendees={args.selectedAttendees}
				onAttendeesChange={(attendees) => {
					args.selectedAttendees = attendees;
				}}
				workspaceId={args.workspaceId}
				sessionId={args.sessionId}
			/>
		</div>
	{/snippet}
</Story>

<Story
	name="WithSelection"
	args={{
		selectedAttendees: [
			{
				type: 'user',
				id: 'user-1',
				name: 'John Doe',
				email: 'john@example.com'
			},
			{
				type: 'circle',
				id: 'circle-1',
				name: 'Engineering'
			}
		],
		workspaceId: mockOrganizationId,
		sessionId: mockSessionId
	}}
>
	{#snippet template(args)}
		<div class="p-md bg-base">
			<AttendeeSelector
				bind:selectedAttendees={args.selectedAttendees}
				onAttendeesChange={(attendees) => {
					args.selectedAttendees = attendees;
				}}
				workspaceId={args.workspaceId}
				sessionId={args.sessionId}
			/>
		</div>
	{/snippet}
</Story>

<Story
	name="MultipleSelections"
	args={{
		selectedAttendees: [
			{
				type: 'user',
				id: 'user-1',
				name: 'John Doe',
				email: 'john@example.com'
			},
			{
				type: 'user',
				id: 'user-2',
				name: 'Jane Smith',
				email: 'jane@example.com'
			},
			{
				type: 'circle',
				id: 'circle-1',
				name: 'Engineering'
			},
			{
				type: 'circle',
				id: 'circle-2',
				name: 'Product'
			}
		],
		workspaceId: mockOrganizationId,
		sessionId: mockSessionId
	}}
>
	{#snippet template(args)}
		<div class="p-md bg-base">
			<AttendeeSelector
				bind:selectedAttendees={args.selectedAttendees}
				onAttendeesChange={(attendees) => {
					args.selectedAttendees = attendees;
				}}
				workspaceId={args.workspaceId}
				sessionId={args.sessionId}
			/>
		</div>
	{/snippet}
</Story>

<!--
	Note: Mock displays populated attendees (3 users + 3 circles) by default.
	Mock is located at: .storybook/mocks/useAttendeeSelection.svelte.ts
-->
