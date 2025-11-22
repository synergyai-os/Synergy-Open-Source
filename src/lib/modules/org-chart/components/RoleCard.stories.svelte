<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RoleCard from './RoleCard.svelte';

	const { Story } = defineMeta({
		component: RoleCard,
		title: 'Modules/OrgChart/RoleCard',
		tags: ['autodocs'],
		argTypes: {
			name: {
				control: { type: 'text' }
			},
			purpose: {
				control: { type: 'text' }
			},
			fillerCount: {
				control: { type: 'number' }
			}
		}
	});
</script>

<Story name="Default" args={{ name: 'Product Manager', onClick: () => console.log('Clicked') }}>
	{#snippet template(args)}
		<RoleCard {...args} />
	{/snippet}
</Story>

<Story
	name="WithPurpose"
	args={{
		name: 'Engineering Lead',
		purpose: 'Lead the engineering team',
		onClick: () => console.log('Clicked')
	}}
>
	{#snippet template(args)}
		<RoleCard {...args} />
	{/snippet}
</Story>

<Story
	name="WithFillers"
	args={{ name: 'Designer', fillerCount: 3, onClick: () => console.log('Clicked') }}
>
	{#snippet template(args)}
		<RoleCard {...args} />
	{/snippet}
</Story>

<Story
	name="WithEdit"
	args={{
		name: 'Marketing Lead',
		purpose: 'Drive marketing strategy',
		onClick: () => console.log('Clicked'),
		onEdit: () => console.log('Edit clicked')
	}}
>
	{#snippet template(args)}
		<RoleCard {...args} />
	{/snippet}
</Story>

<Story
	name="WithMenu"
	args={{
		name: 'Operations Manager',
		purpose: 'Manage daily operations',
		onClick: () => console.log('Clicked'),
		menuItems: [
			{ label: 'Edit', onclick: () => console.log('Edit') },
			{ label: 'Delete', onclick: () => console.log('Delete'), danger: true }
		]
	}}
>
	{#snippet template(args)}
		<RoleCard {...args} />
	{/snippet}
</Story>

<Story
	name="WithAllActions"
	args={{
		name: 'Sales Director',
		purpose: 'Lead sales team',
		onClick: () => console.log('Clicked'),
		onEdit: () => console.log('Edit'),
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }]
	}}
>
	{#snippet template(args)}
		<RoleCard {...args} />
	{/snippet}
</Story>
