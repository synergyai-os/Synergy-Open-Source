<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RoleDetailHeader from './RoleDetailHeader.svelte';

	const { Story } = defineMeta({
		component: RoleDetailHeader,
		title: 'Modules/OrgChart/RoleDetailHeader',
		tags: ['autodocs'],
		argTypes: {
			roleName: {
				control: { type: 'text' }
			}
		}
	});
</script>

<Story
	name="Default"
	args={{ roleName: 'Product Manager', onClose: () => console.log('Close clicked') }}
>
	{#snippet template(args)}
		<RoleDetailHeader
			roleName={args.roleName}
			onClose={args.onClose}
			onEdit={args.onEdit}
			addMenuItems={args.addMenuItems}
			headerMenuItems={args.headerMenuItems}
		/>
	{/snippet}
</Story>

<Story
	name="WithAddMenu"
	args={{
		roleName: 'Engineering Lead',
		onClose: () => console.log('Close'),
		addMenuItems: [
			{ label: 'Add Responsibility', onclick: () => console.log('Add Responsibility') },
			{ label: 'Add Domain', onclick: () => console.log('Add Domain') }
		]
	}}
>
	{#snippet template(args)}
		<RoleDetailHeader
			roleName={args.roleName}
			onClose={args.onClose}
			onEdit={args.onEdit}
			addMenuItems={args.addMenuItems}
			headerMenuItems={args.headerMenuItems}
		/>
	{/snippet}
</Story>

<Story
	name="WithEdit"
	args={{
		roleName: 'Design Lead',
		onClose: () => console.log('Close'),
		onEdit: () => console.log('Edit clicked')
	}}
>
	{#snippet template(args)}
		<RoleDetailHeader
			roleName={args.roleName}
			onClose={args.onClose}
			onEdit={args.onEdit}
			addMenuItems={args.addMenuItems}
			headerMenuItems={args.headerMenuItems}
		/>
	{/snippet}
</Story>

<Story
	name="WithHeaderMenu"
	args={{
		roleName: 'Marketing Lead',
		onClose: () => console.log('Close'),
		headerMenuItems: [
			{ label: 'Export', onclick: () => console.log('Export') },
			{ label: 'Archive', onclick: () => console.log('Archive'), danger: true }
		]
	}}
>
	{#snippet template(args)}
		<RoleDetailHeader
			roleName={args.roleName}
			onClose={args.onClose}
			onEdit={args.onEdit}
			addMenuItems={args.addMenuItems}
			headerMenuItems={args.headerMenuItems}
		/>
	{/snippet}
</Story>

<Story
	name="WithAllActions"
	args={{
		roleName: 'Sales Director',
		onClose: () => console.log('Close'),
		onEdit: () => console.log('Edit'),
		addMenuItems: [
			{ label: 'Add Responsibility', onclick: () => console.log('Add Responsibility') }
		],
		headerMenuItems: [{ label: 'Settings', onclick: () => console.log('Settings') }]
	}}
>
	{#snippet template(args)}
		<RoleDetailHeader
			roleName={args.roleName}
			onClose={args.onClose}
			onEdit={args.onEdit}
			addMenuItems={args.addMenuItems}
			headerMenuItems={args.headerMenuItems}
		/>
	{/snippet}
</Story>
