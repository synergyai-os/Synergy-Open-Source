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
			isCircle: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story
	name="Default"
	args={{
		name: 'Product Manager',
		onClick: () => console.log('Clicked'),
		onEdit: () => console.log('Edit clicked'),
		onAddMember: () => console.log('Add member clicked'),
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			purpose={args.purpose}
			onClick={args.onClick}
			onEdit={args.onEdit}
			onAddMember={args.onAddMember}
			menuItems={args.menuItems}
		/>
	{/snippet}
</Story>

<Story
	name="WithPurpose"
	args={{
		name: 'Engineering Lead',
		purpose: 'Lead the engineering team',
		onClick: () => console.log('Clicked'),
		onEdit: () => console.log('Edit clicked'),
		onAddMember: () => console.log('Add member clicked'),
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			purpose={args.purpose}
			onClick={args.onClick}
			onEdit={args.onEdit}
			onAddMember={args.onAddMember}
			menuItems={args.menuItems}
		/>
	{/snippet}
</Story>

<Story
	name="WithMember"
	args={{
		name: 'Product Manager',
		purpose: 'Own product roadmap and strategy',
		onClick: () => console.log('Clicked'),
		onEdit: () => console.log('Edit clicked'),
		onAddMember: () => console.log('Add member clicked'),
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }],
		members: [
			{
				userId: 'user-1',
				name: 'Alice Johnson',
				email: 'alice.johnson@example.com',
				avatarImage: 'https://i.pravatar.cc/150?img=12'
			}
		],
		memberMenuItems: (userId) => [
			{ label: 'Edit', onclick: () => console.log(`Edit ${userId}`) },
			{ label: 'Remove', onclick: () => console.log(`Remove ${userId}`), danger: true }
		]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			purpose={args.purpose}
			onClick={args.onClick}
			onEdit={args.onEdit}
			onAddMember={args.onAddMember}
			menuItems={args.menuItems}
			members={args.members}
			memberMenuItems={args.memberMenuItems}
		/>
	{/snippet}
</Story>

<Story
	name="WithMembers"
	args={{
		name: 'Product Manager',
		purpose: 'Own product roadmap and strategy',
		onClick: () => console.log('Clicked'),
		onEdit: () => console.log('Edit clicked'),
		onAddMember: () => console.log('Add member clicked'),
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }],
		members: [
			{
				userId: 'user-1',
				name: 'Alice Johnson',
				email: 'alice.johnson@example.com',
				avatarImage: 'https://i.pravatar.cc/150?img=12'
			},
			{
				userId: 'user-2',
				name: 'Bob Williams',
				email: 'bob.williams@example.com'
			},
			{
				userId: 'user-3',
				name: 'Charlie Brown',
				email: 'charlie.brown@example.com'
			}
		],
		memberMenuItems: (userId) => [
			{ label: 'Edit', onclick: () => console.log(`Edit ${userId}`) },
			{ label: 'Remove', onclick: () => console.log(`Remove ${userId}`), danger: true }
		]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			purpose={args.purpose}
			onClick={args.onClick}
			onEdit={args.onEdit}
			onAddMember={args.onAddMember}
			menuItems={args.menuItems}
			members={args.members}
			memberMenuItems={args.memberMenuItems}
		/>
	{/snippet}
</Story>

<Story
	name="CurrentUserHighlighted"
	args={{
		name: 'Active Platforms',
		isCircle: true,
		onClick: () => console.log('Clicked'),
		onEdit: () => console.log('Edit clicked'),
		onAddMember: () => console.log('Add member clicked'),
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }],
		currentUserId: 'randy-hereman',
		members: [
			{
				userId: 'randy-hereman',
				name: 'Randy Hereman',
				email: 'randy@example.com',
				roleName: 'Circle Lead'
			},
			{
				userId: 'thomas-wagner',
				name: 'Thomas Wagner',
				email: 'thomas@example.com',
				roleName: 'Facilitator'
			}
		],
		memberMenuItems: (userId) => [
			{ label: 'Edit', onclick: () => console.log(`Edit ${userId}`) },
			{ label: 'Remove', onclick: () => console.log(`Remove ${userId}`), danger: true }
		]
	}}
>
	{#snippet template(args)}
		<div class="flex flex-col gap-card">
			<p class="mb-card text-label text-secondary">
				The current user's card (Randy Hereman) is highlighted with the brand teal background.
			</p>
			<RoleCard
				name={args.name}
				isCircle={args.isCircle}
				onClick={args.onClick}
				onEdit={args.onEdit}
				onAddMember={args.onAddMember}
				menuItems={args.menuItems}
				currentUserId={args.currentUserId}
				members={args.members}
				memberMenuItems={args.memberMenuItems}
			/>
		</div>
	{/snippet}
</Story>

<Story
	name="MembersWithScope"
	args={{
		name: 'Engineering Lead',
		onClick: () => console.log('Clicked'),
		onEdit: () => console.log('Edit clicked'),
		onAddMember: () => console.log('Add member clicked'),
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }],
		members: [
			{
				userId: 'user-1',
				name: 'John Doe',
				email: 'john.doe@example.com',
				scope: 'Lead product development and strategy'
			},
			{
				userId: 'user-2',
				name: 'Jane Smith',
				email: 'jane.smith@example.com',
				scope: 'Manage engineering team operations'
			}
		],
		memberMenuItems: (userId) => [
			{ label: 'Edit', onclick: () => console.log(`Edit ${userId}`) },
			{ label: 'Remove', onclick: () => console.log(`Remove ${userId}`), danger: true }
		]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			purpose={args.purpose}
			isCircle={args.isCircle}
			onClick={args.onClick}
			onEdit={args.onEdit}
			onAddMember={args.onAddMember}
			menuItems={args.menuItems}
			members={args.members}
			memberMenuItems={args.memberMenuItems}
		/>
	{/snippet}
</Story>

<Story
	name="CircleWithMembers"
	args={{
		name: 'Active Platforms',
		isCircle: true,
		onClick: () => console.log('Clicked'),
		onEdit: () => console.log('Edit clicked'),
		onAddMember: () => console.log('Add member clicked'),
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }],
		currentUserId: 'randy-hereman',
		members: [
			{
				userId: 'randy-hereman',
				name: 'Randy Hereman',
				email: 'randy@example.com',
				roleName: 'Circle Lead'
			},
			{
				userId: 'thomas-wagner',
				name: 'Thomas Wagner',
				email: 'thomas@example.com',
				roleName: 'Facilitator'
			}
		],
		memberMenuItems: (userId) => [
			{ label: 'Edit', onclick: () => console.log(`Edit ${userId}`) },
			{ label: 'Remove', onclick: () => console.log(`Remove ${userId}`), danger: true }
		]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			isCircle={args.isCircle}
			onClick={args.onClick}
			onEdit={args.onEdit}
			onAddMember={args.onAddMember}
			menuItems={args.menuItems}
			currentUserId={args.currentUserId}
			members={args.members}
			memberMenuItems={args.memberMenuItems}
		/>
	{/snippet}
</Story>

<Story
	name="MembersWithoutRole"
	args={{
		name: 'Members without role',
		isCircle: false,
		onClick: () => console.log('Clicked'),
		onAddMember: () => console.log('Add member clicked'),
		members: [
			{
				userId: 'user-1',
				name: 'Alice Johnson',
				email: 'alice.johnson@example.com',
				avatarImage: 'https://i.pravatar.cc/150?img=12'
			},
			{
				userId: 'user-2',
				name: 'Bob Williams',
				email: 'bob.williams@example.com'
			}
		]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			isCircle={args.isCircle}
			onClick={args.onClick}
			onAddMember={args.onAddMember}
			members={args.members}
		/>
	{/snippet}
</Story>

<Story
	name="EmptyState"
	args={{
		name: 'Members without role',
		isCircle: false,
		onClick: () => console.log('Clicked'),
		onAddMember: () => console.log('Add member clicked')
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			isCircle={args.isCircle}
			onClick={args.onClick}
			onAddMember={args.onAddMember}
			members={args.members}
		/>
	{/snippet}
</Story>
