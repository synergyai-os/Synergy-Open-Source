<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OrganizationItem from './OrganizationItem.svelte';

	const { Story } = defineMeta({
		component: OrganizationItem,
		title: 'Design System/Molecules/OrganizationItem',
		tags: ['autodocs'],
		argTypes: {
			isActive: {
				control: { type: 'boolean' },
				description: 'Whether this workspace is currently active'
			}
		}
	});
</script>

<Story
	name="Default"
	args={{
		workspace: {
			workspaceId: 'org-1',
			name: 'Saprolab',
			initials: 'S',
			role: 'owner'
		},
		isActive: false
	}}
>
	{#snippet template(args)}
		<OrganizationItem {...args} />
	{/snippet}
</Story>

<Story
	name="Active"
	args={{
		workspace: {
			workspaceId: 'org-1',
			name: 'Saprolab',
			initials: 'S',
			role: 'owner'
		},
		isActive: true
	}}
>
	{#snippet template(args)}
		<OrganizationItem {...args} />
	{/snippet}
</Story>

<Story
	name="Member Role"
	args={{
		workspace: {
			workspaceId: 'org-2',
			name: 'PurposePilot',
			initials: 'P',
			role: 'member'
		},
		isActive: false
	}}
>
	{#snippet template(args)}
		<OrganizationItem {...args} />
	{/snippet}
</Story>
