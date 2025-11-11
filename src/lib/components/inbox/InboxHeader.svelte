<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import InboxFilterMenu from './InboxFilterMenu.svelte';
	import SidebarToggle from '$lib/components/SidebarToggle.svelte';

	type InboxItemType = 'readwise_highlight' | 'photo_note' | 'manual_text';

	interface Props {
		currentFilter: InboxItemType | 'all';
		onFilterChange: (type: InboxItemType | 'all') => void;
		onDeleteAll?: () => void;
		onDeleteAllRead?: () => void;
		onDeleteAllCompleted?: () => void;
		onSortClick?: () => void;
		onSync?: () => void;
		isSyncing?: boolean;
		sidebarCollapsed?: boolean;
		onSidebarToggle?: () => void;
		isMobile?: boolean;
		inboxCount?: number; // Total number of unprocessed items in inbox
	}

	let {
		currentFilter,
		onFilterChange,
		onDeleteAll,
		onDeleteAllRead,
		onDeleteAllCompleted,
		onSortClick,
		onSync,
		isSyncing = false,
		sidebarCollapsed = false,
		onSidebarToggle,
		isMobile = false,
		inboxCount = 0
	}: Props = $props();

	let menuOpen = $state(false);
	let sortMenuOpen = $state(false);
</script>

<div
	class="sticky top-0 z-10 flex h-system-header flex-shrink-0 items-center justify-between border-b border-base bg-surface px-inbox-header py-system-header"
>
	<!-- Left: Title + Sidebar Toggle + Kebab Menu -->
	<div class="flex items-center gap-icon">
		{#if onSidebarToggle && sidebarCollapsed}
			<SidebarToggle {sidebarCollapsed} onToggle={onSidebarToggle} {isMobile} />
		{/if}

		<h2 class="flex items-center gap-2 text-sm font-normal text-secondary">
			Inbox
			{#if inboxCount > 0}
				<span
					class="flex min-w-[20px] items-center justify-center rounded-full bg-accent-primary px-badge py-badge text-center text-label leading-none font-medium text-white"
				>
					{inboxCount}
				</span>
			{/if}
		</h2>

		<!-- Kebab Menu (Delete Actions) -->
		<DropdownMenu.Root bind:open={menuOpen}>
			<DropdownMenu.Trigger
				type="button"
				class="flex h-8 w-8 items-center justify-center rounded-md text-secondary transition-colors hover:bg-hover-solid hover:text-primary"
			>
				<svg
					class="h-4 w-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
					/>
				</svg>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					class="z-50 min-w-[180px] rounded-md border border-base bg-elevated py-1 shadow-lg"
					side="bottom"
					align="start"
					sideOffset={4}
				>
					{#if onSync}
						<DropdownMenu.Item
							class="flex cursor-pointer items-center justify-between px-menu-item py-menu-item text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid disabled:cursor-not-allowed disabled:opacity-50"
							textValue="Sync Readwise Highlights"
							disabled={isSyncing}
							onSelect={() => {
								if (!isSyncing) {
									onSync();
									menuOpen = false;
								}
							}}
						>
							<span class="font-normal"
								>{isSyncing ? 'Syncing...' : 'Sync Readwise Highlights'}</span
							>
							{#if isSyncing}
								<svg
									class="h-4 w-4 animate-spin"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
							{/if}
						</DropdownMenu.Item>

						<DropdownMenu.Separator class="my-1 h-px bg-base" />
					{/if}

					<DropdownMenu.Item
						class="flex cursor-pointer items-center justify-between px-menu-item py-menu-item text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
						textValue="Delete all"
						onSelect={() => {
							onDeleteAll?.();
							menuOpen = false;
						}}
					>
						<span class="font-normal">Delete all</span>
					</DropdownMenu.Item>

					<DropdownMenu.Item
						class="flex cursor-pointer items-center justify-between px-menu-item py-menu-item text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
						textValue="Delete all read"
						onSelect={() => {
							onDeleteAllRead?.();
							menuOpen = false;
						}}
					>
						<span class="font-normal">Delete all read</span>
					</DropdownMenu.Item>

					<DropdownMenu.Item
						class="flex cursor-pointer items-center justify-between px-menu-item py-menu-item text-sm text-primary outline-none hover:bg-hover-solid focus:bg-hover-solid"
						textValue="Delete all for completed issues and reviews"
						onSelect={() => {
							onDeleteAllCompleted?.();
							menuOpen = false;
						}}
					>
						<span class="font-normal">Delete all for completed issues and reviews</span>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	</div>

	<!-- Right: Filter + Sort Icons -->
	<div class="flex items-center gap-icon">
		<!-- Filter Menu -->
		<InboxFilterMenu {currentFilter} {onFilterChange} />

		<!-- Sort Icon -->
		<button
			type="button"
			class="flex h-8 w-8 items-center justify-center rounded-md text-secondary transition-colors hover:bg-hover-solid hover:text-primary"
			onclick={() => onSortClick?.()}
			aria-label="Sort inbox items"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
				/>
			</svg>
		</button>
	</div>
</div>
