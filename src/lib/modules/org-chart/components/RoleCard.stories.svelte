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
			scope: {
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
		<RoleCard
			name={args.name}
			scope={args.scope}
			fillerCount={args.fillerCount}
			onClick={args.onClick}
			onEdit={args.onEdit}
			menuItems={args.menuItems}
		/>
	{/snippet}
</Story>

<Story
	name="WithScope"
	args={{
		name: 'Engineering Lead',
		scope: 'Lead the engineering team',
		onClick: () => console.log('Clicked')
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			scope={args.scope}
			fillerCount={args.fillerCount}
			onClick={args.onClick}
			onEdit={args.onEdit}
			menuItems={args.menuItems}
		/>
	{/snippet}
</Story>

<Story
	name="WithFillers"
	args={{ name: 'Designer', fillerCount: 3, onClick: () => console.log('Clicked') }}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			scope={args.scope}
			fillerCount={args.fillerCount}
			onClick={args.onClick}
			onEdit={args.onEdit}
			menuItems={args.menuItems}
		/>
	{/snippet}
</Story>

<Story
	name="WithEdit"
	args={{
		name: 'Marketing Lead',
		scope: 'Drive marketing strategy',
		onClick: () => console.log('Clicked'),
		onEdit: () => console.log('Edit clicked')
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			scope={args.scope}
			fillerCount={args.fillerCount}
			onClick={args.onClick}
			onEdit={args.onEdit}
			menuItems={args.menuItems}
		/>
	{/snippet}
</Story>

<Story
	name="WithMenu"
	args={{
		name: 'Operations Manager',
		scope: 'Manage daily operations',
		onClick: () => console.log('Clicked'),
		menuItems: [
			{ label: 'Edit', onclick: () => console.log('Edit') },
			{ label: 'Delete', onclick: () => console.log('Delete'), danger: true }
		]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			scope={args.scope}
			fillerCount={args.fillerCount}
			onClick={args.onClick}
			onEdit={args.onEdit}
			menuItems={args.menuItems}
		/>
	{/snippet}
</Story>

<Story
	name="WithAllActions"
	args={{
		name: 'Sales Director',
		scope: 'Lead sales team',
		onClick: () => console.log('Clicked'),
		onEdit: () => console.log('Edit'),
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			scope={args.scope}
			fillerCount={args.fillerCount}
			onClick={args.onClick}
			onEdit={args.onEdit}
			menuItems={args.menuItems}
		/>
	{/snippet}
</Story>

<Story
	name="Selected"
	args={{
		name: 'Product Manager',
		scope: 'Own product roadmap and strategy',
		selected: true,
		onClick: () => console.log('Clicked')
	}}
>
	{#snippet template(args)}
		<div class="flex flex-col gap-4">
			<RoleCard
				name={args.name}
				scope={args.scope}
				selected={true}
				onClick={args.onClick}
			/>
			<RoleCard
				name="Unselected Card"
				scope="For comparison"
				selected={false}
				onClick={() => console.log('Unselected clicked')}
			/>
		</div>
	{/snippet}
</Story>

<Story
	name="Expandable"
	args={{
		name: 'Engineering Lead',
		scope: 'Lead the engineering team',
		expanded: false,
		onClick: () => console.log('Clicked'),
		onToggleExpand: () => console.log('Toggle expand')
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			scope={args.scope}
			expanded={args.expanded}
			onClick={args.onClick}
			onToggleExpand={args.onToggleExpand}
		/>
	{/snippet}
</Story>

<Story
	name="Expanded"
	args={{
		name: 'Engineering Lead',
		scope: 'Lead the engineering team',
		expanded: true,
		onClick: () => console.log('Clicked'),
		onToggleExpand: () => console.log('Toggle expand')
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			scope={args.scope}
			expanded={args.expanded}
			onClick={args.onClick}
			onToggleExpand={args.onToggleExpand}
		/>
	{/snippet}
</Story>
