<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PageHeader from './PageHeader.svelte';
	import { Button, Icon } from '$lib/components/atoms';
	import * as DropdownMenu from './DropdownMenu.svelte';

	const { Story } = defineMeta({
		component: PageHeader,
		title: 'Design System/Molecules/PageHeader',
		tags: ['autodocs'],
		argTypes: {
			title: {
				control: { type: 'text' },
				description: 'Page title text'
			},
			sticky: {
				control: { type: 'boolean' },
				description: 'Whether header should be sticky'
			}
		}
	});
</script>

<Story name="Simple Title" args={{ title: 'Meetings' }}>
	{#snippet template(args)}
		<PageHeader {...args} />
	{/snippet}
</Story>

<Story name="Title with Right Actions" args={{ title: 'Inbox' }}>
	{#snippet template(args)}
		<PageHeader {...args}>
			{#snippet right()}
				<Button variant="secondary" size="sm">
					<Icon type="filter" size="md" />
					Filter
				</Button>
				<Button variant="secondary" size="sm">
					<Icon type="sort" size="md" />
					Sort
				</Button>
			{/snippet}
		</PageHeader>
	{/snippet}
</Story>

<Story name="Title with Left and Right Content" args={{ title: 'Inbox' }}>
	{#snippet template(args)}
		<PageHeader {...args}>
			{#snippet left()}
				<Button variant="ghost" size="sm">
					<Icon type="menu" size="md" />
				</Button>
			{/snippet}
			{#snippet right()}
				<Button variant="secondary" size="sm">
					<Icon type="filter" size="md" />
				</Button>
				<Button variant="secondary" size="sm">
					<Icon type="sort" size="md" />
				</Button>
			{/snippet}
		</PageHeader>
	{/snippet}
</Story>

<Story name="Custom Title Slot" args={{}}>
	{#snippet template(args)}
		<PageHeader {...args}>
			{#snippet titleSlot()}
				<span class="flex items-center gap-header">
					<span class="text-sm font-medium text-secondary">Inbox</span>
					<span
						class="min-w-badge rounded-chip px-badge py-badge flex items-center justify-center bg-accent-primary text-center text-label leading-none font-medium text-primary"
					>
						8
					</span>
				</span>
			{/snippet}
			{#snippet right()}
				<Button variant="secondary" size="sm">
					<Icon type="filter" size="md" />
				</Button>
			{/snippet}
		</PageHeader>
	{/snippet}
</Story>

<Story name="Actions Only (No Title)" args={{}}>
	{#snippet template(args)}
		<PageHeader {...args}>
			{#snippet right()}
				<Button variant="primary" size="sm">
					<Icon type="add" size="md" />
					Add Meeting
				</Button>
			{/snippet}
		</PageHeader>
	{/snippet}
</Story>

<Story name="With Dropdown Menu" args={{ title: 'Inbox' }}>
	{#snippet template(args)}
		<PageHeader {...args}>
			{#snippet right()}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button variant="secondary" size="sm" builders={[builder]}>
							<Icon type="more" size="md" />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Item>Sync</DropdownMenu.Item>
						<DropdownMenu.Item>Delete All</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/snippet}
		</PageHeader>
	{/snippet}
</Story>
