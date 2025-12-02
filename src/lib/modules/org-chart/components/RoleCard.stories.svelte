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
			},
			isCircle: {
				control: { type: 'boolean' }
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
		<div class="flex flex-col gap-card">
			<RoleCard name={args.name} scope={args.scope} selected={true} onClick={args.onClick} />
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
		onToggleExpand: () => console.log('Toggle expand'),
		members: [
			{
				userId: 'user-1',
				name: 'John Doe',
				email: 'john.doe@example.com'
			},
			{
				userId: 'user-2',
				name: 'Jane Smith',
				email: 'jane.smith@example.com'
			}
		],
		onAddMember: () => console.log('Add member clicked')
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			scope={args.scope}
			expanded={args.expanded}
			onClick={args.onClick}
			onToggleExpand={args.onToggleExpand}
			members={args.members}
			onAddMember={args.onAddMember}
		/>
	{/snippet}
</Story>

<Story
	name="WithMembers"
	args={{
		name: 'Product Manager',
		scope: 'Own product roadmap and strategy',
		expanded: true,
		onClick: () => console.log('Clicked'),
		onToggleExpand: () => console.log('Toggle expand'),
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
		onAddMember: () => console.log('Add member clicked'),
		memberMenuItems: (userId) => [
			{ label: 'Edit', onclick: () => console.log(`Edit ${userId}`) },
			{ label: 'Remove', onclick: () => console.log(`Remove ${userId}`), danger: true }
		]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			scope={args.scope}
			expanded={args.expanded}
			onClick={args.onClick}
			onToggleExpand={args.onToggleExpand}
			members={args.members}
			onAddMember={args.onAddMember}
			memberMenuItems={args.memberMenuItems}
		/>
	{/snippet}
</Story>

<Story
	name="CurrentUserHighlighted"
	args={{
		name: 'Circle Lead',
		isCircle: true,
		expanded: true,
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
				scope: 'How we work and the performance of the circle'
			},
			{
				userId: 'thomas-wagner',
				name: 'Thomas Wagner',
				email: 'thomas@example.com'
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
				expanded={args.expanded}
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
		expanded: true,
		onClick: () => console.log('Clicked'),
		onToggleExpand: () => console.log('Toggle expand'),
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
			scope={args.scope}
			expanded={args.expanded}
			isCircle={args.isCircle}
			onClick={args.onClick}
			onToggleExpand={args.onToggleExpand}
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
		name: 'Circle Lead',
		isCircle: true,
		expanded: true,
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
				scope: 'How we work and the performance of the circle'
			},
			{
				userId: 'thomas-wagner',
				name: 'Thomas Wagner',
				email: 'thomas@example.com'
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
			expanded={args.expanded}
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
