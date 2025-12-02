<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RoleMemberItem from './RoleMemberItem.svelte';

	const { Story } = defineMeta({
		component: RoleMemberItem,
		title: 'Modules/OrgChart/RoleMemberItem',
		tags: ['autodocs'],
		argTypes: {
			name: {
				control: { type: 'text' }
			},
			email: {
				control: { type: 'text' }
			},
			scope: {
				control: { type: 'text' }
			}
		}
	});
</script>

<Story
	name="Default"
	args={{
		userId: 'user-1',
		name: 'John Doe',
		email: 'john.doe@example.com',
		onClick: () => console.log('Clicked')
	}}
>
	{#snippet template(args)}
		<RoleMemberItem
			userId={args.userId}
			name={args.name}
			email={args.email}
			avatarImage={args.avatarImage}
			scope={args.scope}
			selected={args.selected}
			menuItems={args.menuItems}
			onClick={args.onClick}
		/>
	{/snippet}
</Story>

<Story
	name="WithScope"
	args={{
		userId: 'user-2',
		name: 'Jane Smith',
		email: 'jane.smith@example.com',
		scope: 'Lead product development and strategy',
		onClick: () => console.log('Clicked')
	}}
>
	{#snippet template(args)}
		<RoleMemberItem
			userId={args.userId}
			name={args.name}
			email={args.email}
			avatarImage={args.avatarImage}
			scope={args.scope}
			selected={args.selected}
			menuItems={args.menuItems}
			onClick={args.onClick}
		/>
	{/snippet}
</Story>

<Story
	name="WithMenu"
	args={{
		userId: 'user-3',
		name: 'Bob Johnson',
		email: 'bob.johnson@example.com',
		scope: 'Manage engineering team',
		menuItems: [
			{ label: 'Edit', onclick: () => console.log('Edit') },
			{ label: 'Remove', onclick: () => console.log('Remove'), danger: true }
		],
		onClick: () => console.log('Clicked')
	}}
>
	{#snippet template(args)}
		<RoleMemberItem
			userId={args.userId}
			name={args.name}
			email={args.email}
			avatarImage={args.avatarImage}
			scope={args.scope}
			selected={args.selected}
			menuItems={args.menuItems}
			onClick={args.onClick}
		/>
	{/snippet}
</Story>

<Story
	name="WithAvatar"
	args={{
		userId: 'user-4',
		name: 'Alice Williams',
		email: 'alice.williams@example.com',
		avatarImage: 'https://i.pravatar.cc/150?img=12',
		onClick: () => console.log('Clicked')
	}}
>
	{#snippet template(args)}
		<RoleMemberItem
			userId={args.userId}
			name={args.name}
			email={args.email}
			avatarImage={args.avatarImage}
			scope={args.scope}
			selected={args.selected}
			menuItems={args.menuItems}
			onClick={args.onClick}
		/>
	{/snippet}
</Story>

<Story
	name="Selected"
	args={{
		userId: 'user-5',
		name: 'Charlie Brown',
		email: 'charlie.brown@example.com',
		scope: 'Own product roadmap and strategy',
		selected: true,
		onClick: () => console.log('Clicked')
	}}
>
	{#snippet template(args)}
		<div class="flex flex-col gap-4">
			<RoleMemberItem
				userId={args.userId}
				name={args.name}
				email={args.email}
				avatarImage={args.avatarImage}
				scope={args.scope}
				selected={true}
				menuItems={args.menuItems}
				onClick={args.onClick}
			/>
			<RoleMemberItem
				userId="user-6"
				name="Unselected Member"
				email="unselected@example.com"
				selected={false}
				onClick={() => console.log('Unselected clicked')}
			/>
		</div>
	{/snippet}
</Story>

<Story
	name="EmailOnly"
	args={{
		userId: 'user-7',
		email: 'emailonly@example.com',
		onClick: () => console.log('Clicked')
	}}
>
	{#snippet template(args)}
		<RoleMemberItem
			userId={args.userId}
			name={args.name}
			email={args.email}
			avatarImage={args.avatarImage}
			scope={args.scope}
			selected={args.selected}
			menuItems={args.menuItems}
			onClick={args.onClick}
		/>
	{/snippet}
</Story>
