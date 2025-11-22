<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CircleDetailHeader from './CircleDetailHeader.svelte';

	const { Story } = defineMeta({
		component: CircleDetailHeader,
		title: 'Modules/OrgChart/CircleDetailHeader',
		tags: ['autodocs'],
		argTypes: {
			circleName: {
				control: { type: 'text' }
			}
		}
	});
</script>

<Story
	name="Default"
	args={{ circleName: 'Engineering Circle', onClose: () => console.log('Close clicked') }}
>
	{#snippet template(args)}
		<CircleDetailHeader {...args} />
	{/snippet}
</Story>

<Story
	name="WithAddMenu"
	args={{
		circleName: 'Product Circle',
		onClose: () => console.log('Close'),
		addMenuItems: [
			{ label: 'Add Role', onclick: () => console.log('Add Role') },
			{ label: 'Add Member', onclick: () => console.log('Add Member') }
		]
	}}
>
	{#snippet template(args)}
		<CircleDetailHeader {...args} />
	{/snippet}
</Story>

<Story
	name="WithEdit"
	args={{
		circleName: 'Marketing Circle',
		onClose: () => console.log('Close'),
		onEdit: () => console.log('Edit clicked')
	}}
>
	{#snippet template(args)}
		<CircleDetailHeader {...args} />
	{/snippet}
</Story>

<Story
	name="WithHeaderMenu"
	args={{
		circleName: 'Sales Circle',
		onClose: () => console.log('Close'),
		headerMenuItems: [
			{ label: 'Export', onclick: () => console.log('Export') },
			{ label: 'Archive', onclick: () => console.log('Archive'), danger: true }
		]
	}}
>
	{#snippet template(args)}
		<CircleDetailHeader {...args} />
	{/snippet}
</Story>

<Story
	name="WithAllActions"
	args={{
		circleName: 'Operations Circle',
		onClose: () => console.log('Close'),
		onEdit: () => console.log('Edit'),
		addMenuItems: [{ label: 'Add Role', onclick: () => console.log('Add Role') }],
		headerMenuItems: [{ label: 'Settings', onclick: () => console.log('Settings') }]
	}}
>
	{#snippet template(args)}
		<CircleDetailHeader {...args} />
	{/snippet}
</Story>
