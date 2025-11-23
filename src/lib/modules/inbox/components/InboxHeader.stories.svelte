<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import InboxHeader from './InboxHeader.svelte';

	const { Story } = defineMeta({
		component: InboxHeader,
		title: 'Modules/Inbox/InboxHeader',
		tags: ['autodocs']
	});
</script>

<Story
	name="Default"
	args={{ currentFilter: 'all', onFilterChange: () => {}, inboxCount: 0 }}
	play={async ({ canvasElement }) => {
		// Verify header renders with title
		if (!canvasElement.textContent?.includes('Inbox')) {
			throw new Error('Header title "Inbox" not found');
		}

		// Verify no count badge when count is 0
		const countBadge = canvasElement.querySelector('[class*="bg-accent-primary"]');
		if (countBadge) {
			throw new Error('Count badge should not be displayed when inboxCount is 0');
		}
	}}
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
	name="With Count"
	args={{ currentFilter: 'all', onFilterChange: () => {}, inboxCount: 5 }}
	play={async ({ canvasElement, args }) => {
		// Verify count badge displays correct number
		if (!canvasElement.textContent?.includes('Inbox')) {
			throw new Error('Header title "Inbox" not found');
		}
		if (!canvasElement.textContent?.includes(String(args.inboxCount))) {
			throw new Error(`Count badge should display "${args.inboxCount}"`);
		}
	}}
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
	name="Filtered"
	args={{ currentFilter: 'readwise_highlight', onFilterChange: () => {}, inboxCount: 3 }}
	play={async ({ canvasElement, args }) => {
		// Verify header renders with filter applied
		if (!canvasElement.textContent?.includes('Inbox')) {
			throw new Error('Header title "Inbox" not found');
		}
		if (!canvasElement.textContent?.includes(String(args.inboxCount))) {
			throw new Error(`Count badge should display "${args.inboxCount}"`);
		}
	}}
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
	play={async ({ canvasElement }) => {
		// Verify sync functionality is available (kebab menu button should be present)
		const kebabButton = canvasElement.querySelector('button[type="button"]');
		if (!kebabButton) {
			throw new Error('Kebab menu button not found - sync functionality unavailable');
		}
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
	play={async ({ canvasElement, userEvent }) => {
		// Verify syncing state is displayed
		if (!canvasElement.textContent?.includes('Inbox')) {
			throw new Error('Header title "Inbox" not found');
		}
		// Open the dropdown menu to see syncing state
		const kebabButton = canvasElement.querySelector('button[type="button"]');
		if (!kebabButton) {
			throw new Error('Kebab menu button not found');
		}
		await userEvent.click(kebabButton);
		// Wait for menu portal to render (Bits UI uses portals)
		await new Promise((resolve) => setTimeout(resolve, 200));
		// Check for syncing text in document body (portal renders outside canvasElement)
		const hasSyncingText = document.body.textContent?.includes('Syncing');
		// Check for disabled menu item (Bits UI uses aria-disabled or disabled attribute)
		const syncItem =
			document.querySelector('[textValue="Sync Readwise Highlights"]') ||
			document.querySelector('[aria-disabled="true"]') ||
			document.querySelector('button[disabled]');
		if (!hasSyncingText && !syncItem) {
			throw new Error('Syncing state not displayed - no disabled button or "Syncing" text found');
		}
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
	play={async ({ canvasElement }) => {
		// Verify sidebar toggle button is visible when collapsed
		if (!canvasElement.textContent?.includes('Inbox')) {
			throw new Error('Header title "Inbox" not found');
		}
		// SidebarToggle component should be rendered
		const sidebarToggle = canvasElement.querySelector(
			'button[aria-label*="sidebar" i], button[aria-label*="menu" i]'
		);
		if (!sidebarToggle) {
			throw new Error('Sidebar toggle button not found');
		}
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
	play={async ({ canvasElement, args }) => {
		// Verify mobile layout renders correctly
		if (!canvasElement.textContent?.includes('Inbox')) {
			throw new Error('Header title "Inbox" not found');
		}
		if (!canvasElement.textContent?.includes(String(args.inboxCount))) {
			throw new Error(`Count badge should display "${args.inboxCount}"`);
		}
		// Sidebar toggle should be visible on mobile
		const sidebarToggle = canvasElement.querySelector('button');
		if (!sidebarToggle) {
			throw new Error('Sidebar toggle button not found on mobile layout');
		}
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
