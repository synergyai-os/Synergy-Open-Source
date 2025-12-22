<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RoleCard from './RoleCard.svelte';
	import type { Id } from '$lib/convex';

	const fakePersonId = (value: string) => value as unknown as Id<'people'>;

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
			},
			status: {
				control: { type: 'select' },
				options: [undefined, 'draft', 'hiring']
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
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			purpose={args.purpose}
			onClick={args.onClick}
			onEdit={args.onEdit}
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
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			purpose={args.purpose}
			onClick={args.onClick}
			onEdit={args.onEdit}
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
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }],
		members: [
			{
				personId: fakePersonId('person-1'),
				name: 'Alice Johnson',
				email: 'alice.johnson@example.com',
				avatarImage: undefined
			}
		],
		memberMenuItems: (personId) => [
			{ label: 'Edit', onclick: () => console.log(`Edit ${personId}`) },
			{ label: 'Remove', onclick: () => console.log(`Remove ${personId}`), danger: true }
		]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			purpose={args.purpose}
			onClick={args.onClick}
			onEdit={args.onEdit}
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
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }],
		members: [
			{
				personId: fakePersonId('person-1'),
				name: 'Alice Johnson',
				email: 'alice.johnson@example.com',
				avatarImage: undefined
			},
			{
				personId: fakePersonId('person-2'),
				name: 'Bob Williams',
				email: 'bob.williams@example.com'
			},
			{
				personId: fakePersonId('person-3'),
				name: 'Charlie Brown',
				email: 'charlie.brown@example.com'
			}
		],
		memberMenuItems: (personId: Id<'people'>) => [
			{ label: 'Edit', onclick: () => console.log(`Edit ${personId}`) },
			{ label: 'Remove', onclick: () => console.log(`Remove ${personId}`), danger: true }
		]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			purpose={args.purpose}
			onClick={args.onClick}
			onEdit={args.onEdit}
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
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }],
		currentPersonId: fakePersonId('person-randy'),
		members: [
			{
				personId: fakePersonId('person-randy'),
				name: 'Randy Hereman',
				email: 'randy@example.com',
				roleName: 'Circle Lead'
			},
			{
				personId: fakePersonId('person-thomas'),
				name: 'Thomas Wagner',
				email: 'thomas@example.com',
				roleName: 'Facilitator'
			}
		],
		memberMenuItems: (personId: Id<'people'>) => [
			{ label: 'Edit', onclick: () => console.log(`Edit ${personId}`) },
			{ label: 'Remove', onclick: () => console.log(`Remove ${personId}`), danger: true }
		]
	}}
>
	{#snippet template(args)}
		<div class="gap-card flex flex-col">
			<p class="mb-card text-label text-secondary">
				The current user's card (Randy Hereman) is highlighted with the brand teal background.
			</p>
			<RoleCard
				name={args.name}
				isCircle={args.isCircle}
				onClick={args.onClick}
				onEdit={args.onEdit}
				menuItems={args.menuItems}
				currentPersonId={args.currentPersonId}
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
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }],
		members: [
			{
				personId: fakePersonId('person-1'),
				name: 'John Doe',
				email: 'john.doe@example.com',
				scope: 'Lead product development and strategy'
			},
			{
				personId: fakePersonId('person-2'),
				name: 'Jane Smith',
				email: 'jane.smith@example.com',
				scope: 'Manage engineering team operations'
			}
		],
		memberMenuItems: (personId: Id<'people'>) => [
			{ label: 'Edit', onclick: () => console.log(`Edit ${personId}`) },
			{ label: 'Remove', onclick: () => console.log(`Remove ${personId}`), danger: true }
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
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }],
		currentPersonId: fakePersonId('person-randy'),
		members: [
			{
				personId: fakePersonId('person-randy'),
				name: 'Randy Hereman',
				email: 'randy@example.com',
				roleName: 'Circle Lead'
			},
			{
				personId: fakePersonId('person-thomas'),
				name: 'Thomas Wagner',
				email: 'thomas@example.com',
				roleName: 'Facilitator'
			}
		],
		memberMenuItems: (personId: Id<'people'>) => [
			{ label: 'Edit', onclick: () => console.log(`Edit ${personId}`) },
			{ label: 'Remove', onclick: () => console.log(`Remove ${personId}`), danger: true }
		]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			isCircle={args.isCircle}
			onClick={args.onClick}
			onEdit={args.onEdit}
			menuItems={args.menuItems}
			currentPersonId={args.currentPersonId}
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
		members: [
			{
				personId: fakePersonId('person-1'),
				name: 'Alice Johnson',
				email: 'alice.johnson@example.com',
				avatarImage: undefined
			},
			{
				personId: fakePersonId('person-2'),
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
			members={args.members}
		/>
	{/snippet}
</Story>

<Story
	name="EmptyState"
	args={{
		name: 'Members without role',
		isCircle: false,
		onClick: () => console.log('Clicked')
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			isCircle={args.isCircle}
			onClick={args.onClick}
			members={args.members}
		/>
	{/snippet}
</Story>

<Story
	name="DraftStatus"
	args={{
		name: 'Product Manager',
		status: 'draft',
		purpose: 'Own product roadmap and strategy',
		onClick: () => console.log('Clicked'),
		onEdit: () => console.log('Edit clicked'),
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			status={args.status}
			purpose={args.purpose}
			onClick={args.onClick}
			onEdit={args.onEdit}
			menuItems={args.menuItems}
		/>
	{/snippet}
</Story>

<Story
	name="HiringStatus"
	args={{
		name: 'Engineering Lead',
		status: 'hiring',
		purpose: 'Lead the engineering team',
		onClick: () => console.log('Clicked'),
		onEdit: () => console.log('Edit clicked'),
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			status={args.status}
			purpose={args.purpose}
			onClick={args.onClick}
			onEdit={args.onEdit}
			menuItems={args.menuItems}
		/>
	{/snippet}
</Story>

<Story
	name="HiringStatusWithMembers"
	args={{
		name: 'Senior Designer',
		status: 'hiring',
		purpose: 'Lead design initiatives',
		onClick: () => console.log('Clicked'),
		onEdit: () => console.log('Edit clicked'),
		menuItems: [{ label: 'Archive', onclick: () => console.log('Archive') }],
		members: [
			{
				personId: fakePersonId('person-1'),
				name: 'Alice Johnson',
				email: 'alice.johnson@example.com',
				avatarImage: undefined
			}
		],
		memberMenuItems: (personId: Id<'people'>) => [
			{ label: 'Edit', onclick: () => console.log(`Edit ${personId}`) },
			{ label: 'Remove', onclick: () => console.log(`Remove ${personId}`), danger: true }
		]
	}}
>
	{#snippet template(args)}
		<RoleCard
			name={args.name}
			status={args.status}
			purpose={args.purpose}
			onClick={args.onClick}
			onEdit={args.onEdit}
			menuItems={args.menuItems}
			members={args.members}
			memberMenuItems={args.memberMenuItems}
		/>
	{/snippet}
</Story>
