<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import InboxHeader from './InboxHeader.svelte';

	const { Story } = defineMeta({
		component: InboxHeader,
		title: 'Modules/Inbox/InboxHeader',
		tags: ['autodocs']
	});
</script>

<Story name="Default" args={{ currentFilter: 'all', onFilterChange: () => {}, inboxCount: 0 }}>
	{#snippet template(args)}
		<InboxHeader
			currentFilter={args.currentFilter}
			onFilterChange={args.onFilterChange}
			inboxCount={args.inboxCount}
		/>
	{/snippet}
</Story>

<Story name="With Count" args={{ currentFilter: 'all', onFilterChange: () => {}, inboxCount: 5 }}>
	{#snippet template(args)}
		<InboxHeader
			currentFilter={args.currentFilter}
			onFilterChange={args.onFilterChange}
			inboxCount={args.inboxCount}
		/>
	{/snippet}
</Story>

<Story
	name="Filtered"
	args={{ currentFilter: 'readwise_highlight', onFilterChange: () => {}, inboxCount: 3 }}
>
	{#snippet template(args)}
		<InboxHeader
			currentFilter={args.currentFilter}
			onFilterChange={args.onFilterChange}
			inboxCount={args.inboxCount}
		/>
	{/snippet}
</Story>

<Story
	name="With Sync"
	args={{
		currentFilter: 'all',
		onFilterChange: () => {},
		onSync: () => {},
		isSyncing: false,
		inboxCount: 10
	}}
>
	{#snippet template(args)}
		<InboxHeader
			currentFilter={args.currentFilter}
			onFilterChange={args.onFilterChange}
			onSync={args.onSync}
			isSyncing={args.isSyncing}
			inboxCount={args.inboxCount}
		/>
	{/snippet}
</Story>

<Story
	name="Syncing"
	args={{
		currentFilter: 'all',
		onFilterChange: () => {},
		onSync: () => {},
		isSyncing: true,
		inboxCount: 10
	}}
>
	{#snippet template(args)}
		<InboxHeader
			currentFilter={args.currentFilter}
			onFilterChange={args.onFilterChange}
			onSync={args.onSync}
			isSyncing={args.isSyncing}
			inboxCount={args.inboxCount}
		/>
	{/snippet}
</Story>

<Story
	name="With Sidebar Toggle"
	args={{
		currentFilter: 'all',
		onFilterChange: () => {},
		sidebarCollapsed: true,
		onSidebarToggle: () => {},
		inboxCount: 5
	}}
>
	{#snippet template(args)}
		<InboxHeader
			currentFilter={args.currentFilter}
			onFilterChange={args.onFilterChange}
			sidebarCollapsed={args.sidebarCollapsed}
			onSidebarToggle={args.onSidebarToggle}
			inboxCount={args.inboxCount}
		/>
	{/snippet}
</Story>

<Story
	name="Mobile"
	args={{
		currentFilter: 'all',
		onFilterChange: () => {},
		isMobile: true,
		sidebarCollapsed: true,
		onSidebarToggle: () => {},
		inboxCount: 3
	}}
>
	{#snippet template(args)}
		<InboxHeader
			currentFilter={args.currentFilter}
			onFilterChange={args.onFilterChange}
			isMobile={args.isMobile}
			sidebarCollapsed={args.sidebarCollapsed}
			onSidebarToggle={args.onSidebarToggle}
			inboxCount={args.inboxCount}
		/>
	{/snippet}
</Story>
