<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CategoryHeader from './CategoryHeader.svelte';

	const { Story } = defineMeta({
		component: CategoryHeader,
		title: 'Modules/OrgChart/CategoryHeader',
		tags: ['autodocs'],
		argTypes: {
			title: {
				control: { type: 'text' }
			},
			count: {
				control: { type: 'number' }
			}
		}
	});
</script>

<Story name="Default" args={{ title: 'Roles' }}>
	{#snippet template(args)}
		<CategoryHeader title={args.title} />
	{/snippet}
</Story>

<Story name="WithCount" args={{ title: 'Roles', count: 5 }}>
	{#snippet template(args)}
		<CategoryHeader title={args.title} count={args.count} />
	{/snippet}
</Story>

<Story
	name="WithEdit"
	args={{ title: 'Circles', count: 3, onEdit: () => console.log('Edit clicked') }}
>
	{#snippet template(args)}
		<CategoryHeader title={args.title} count={args.count} onEdit={args.onEdit} />
	{/snippet}
</Story>

<Story
	name="WithAdd"
	args={{ title: 'Members', count: 12, onAdd: () => console.log('Add clicked') }}
>
	{#snippet template(args)}
		<CategoryHeader title={args.title} count={args.count} onAdd={args.onAdd} />
	{/snippet}
</Story>

<Story
	name="WithMenu"
	args={{
		title: 'Teams',
		count: 8,
		menuItems: [
			{ label: 'Export', onclick: () => console.log('Export') },
			{ label: 'Settings', onclick: () => console.log('Settings') }
		]
	}}
>
	{#snippet template(args)}
		<CategoryHeader title={args.title} count={args.count} menuItems={args.menuItems} />
	{/snippet}
</Story>

<Story
	name="WithAllActions"
	args={{
		title: 'Departments',
		count: 6,
		onEdit: () => console.log('Edit'),
		onAdd: () => console.log('Add'),
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }]
	}}
>
	{#snippet template(args)}
		<CategoryHeader
			title={args.title}
			count={args.count}
			onEdit={args.onEdit}
			onAdd={args.onAdd}
			menuItems={args.menuItems}
		/>
	{/snippet}
</Story>
