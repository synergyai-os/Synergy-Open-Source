<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import WorkspaceSelector from './WorkspaceSelector.svelte';

	const { Story } = defineMeta({
		component: WorkspaceSelector,
		title: 'Design System/Molecules/WorkspaceSelector',
		tags: ['autodocs'],
		argTypes: {
			avatarImage: {
				control: { type: 'text' },
				description: 'Optional image URL for user avatar'
			},
			initials: {
				control: { type: 'text' },
				description: 'Fallback initials when no avatar image'
			},
			username: {
				control: { type: 'text' },
				description: 'User name (displayed on top line)'
			},
			orgName: {
				control: { type: 'text' },
				description: 'Organization name (displayed on bottom line)'
			},
			showLabels: {
				control: { type: 'boolean' },
				description: 'Show username and orgName labels (collapsed when false)'
			},
			isLoading: {
				control: { type: 'boolean' },
				description: 'Show skeleton loading state'
			},
			variant: {
				control: { type: 'select' },
				options: ['sidebar', 'topbar'],
				description: 'Context variant (affects avatar styling)'
			}
		}
	});
</script>

<Story
	name="Default"
	args={{
		initials: 'JD',
		username: 'John Doe',
		orgName: 'Acme Corp',
		showLabels: true,
		variant: 'sidebar'
	}}
>
	{#snippet template(args)}
		<div class="border-base rounded-button bg-surface w-64 border p-4">
			<WorkspaceSelector
				avatarImage={args.avatarImage}
				initials={args.initials}
				username={args.username}
				orgName={args.orgName}
				showLabels={args.showLabels}
				isLoading={args.isLoading}
				variant={args.variant}
			/>
		</div>
	{/snippet}
</Story>

<Story
	name="With Avatar Image"
	args={{
		avatarImage: 'https://i.pravatar.cc/150?img=12',
		initials: 'JD',
		username: 'Jane Smith',
		orgName: 'Tech Startup',
		showLabels: true,
		variant: 'sidebar'
	}}
>
	{#snippet template(args)}
		<div class="border-base rounded-button bg-surface w-64 border p-4">
			<WorkspaceSelector
				avatarImage={args.avatarImage}
				initials={args.initials}
				username={args.username}
				orgName={args.orgName}
				showLabels={args.showLabels}
				isLoading={args.isLoading}
				variant={args.variant}
			/>
		</div>
	{/snippet}
</Story>

<Story
	name="Collapsed (Icon Only)"
	args={{
		initials: 'T',
		username: 'test',
		orgName: 'Owner',
		showLabels: false,
		variant: 'sidebar'
	}}
>
	{#snippet template(args)}
		<div class="border-base rounded-button bg-surface w-16 border p-2">
			<WorkspaceSelector
				avatarImage={args.avatarImage}
				initials={args.initials}
				username={args.username}
				orgName={args.orgName}
				showLabels={args.showLabels}
				isLoading={args.isLoading}
				variant={args.variant}
			/>
		</div>
	{/snippet}
</Story>

<Story
	name="Loading State"
	args={{
		initials: 'JD',
		username: 'John Doe',
		orgName: 'Acme Corp',
		showLabels: true,
		isLoading: true,
		variant: 'sidebar'
	}}
>
	{#snippet template(args)}
		<div class="border-base rounded-button bg-surface w-64 border p-4">
			<WorkspaceSelector
				avatarImage={args.avatarImage}
				initials={args.initials}
				username={args.username}
				orgName={args.orgName}
				showLabels={args.showLabels}
				isLoading={args.isLoading}
				variant={args.variant}
			/>
		</div>
	{/snippet}
</Story>

<Story
	name="Topbar Variant"
	args={{
		initials: 'JD',
		username: 'John Doe',
		orgName: 'Acme Corp',
		showLabels: true,
		variant: 'topbar'
	}}
>
	{#snippet template(args)}
		<div class="border-base rounded-button bg-surface w-64 border p-4">
			<WorkspaceSelector
				avatarImage={args.avatarImage}
				initials={args.initials}
				username={args.username}
				orgName={args.orgName}
				showLabels={args.showLabels}
				isLoading={args.isLoading}
				variant={args.variant}
			/>
		</div>
	{/snippet}
</Story>

<Story
	name="Long Names"
	args={{
		initials: 'AB',
		username: 'Very Long Username That Might Truncate',
		orgName: 'Extremely Long Organization Name Inc.',
		showLabels: true,
		variant: 'sidebar'
	}}
>
	{#snippet template(args)}
		<div class="border-base rounded-button bg-surface w-64 border p-4">
			<WorkspaceSelector
				avatarImage={args.avatarImage}
				initials={args.initials}
				username={args.username}
				orgName={args.orgName}
				showLabels={args.showLabels}
				isLoading={args.isLoading}
				variant={args.variant}
			/>
		</div>
	{/snippet}
</Story>

<Story
	name="Single Initial"
	args={{ initials: 'T', username: 'test', orgName: 'Owner', showLabels: true, variant: 'sidebar' }}
>
	{#snippet template(args)}
		<div class="border-base rounded-button bg-surface w-64 border p-4">
			<WorkspaceSelector
				avatarImage={args.avatarImage}
				initials={args.initials}
				username={args.username}
				orgName={args.orgName}
				showLabels={args.showLabels}
				isLoading={args.isLoading}
				variant={args.variant}
			/>
		</div>
	{/snippet}
</Story>
