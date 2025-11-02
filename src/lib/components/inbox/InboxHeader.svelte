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
		isMobile = false
	}: Props = $props();

	let menuOpen = $state(false);
	let sortMenuOpen = $state(false);
</script>

<div
	class="sticky top-0 z-10 bg-surface border-b border-base px-inbox-header py-inbox-header flex items-center justify-between flex-shrink-0"
>
	<!-- Left: Title + Sidebar Toggle + Kebab Menu -->
	<div class="flex items-center gap-icon">
		{#if onSidebarToggle && sidebarCollapsed}
			<SidebarToggle
				sidebarCollapsed={sidebarCollapsed}
				onToggle={onSidebarToggle}
				isMobile={isMobile}
			/>
		{/if}

		<h2 class="text-sm font-normal text-secondary">Inbox</h2>

		<!-- Kebab Menu (Delete Actions) -->
		<DropdownMenu.Root bind:open={menuOpen}>
			<DropdownMenu.Trigger
				type="button"
				class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-hover-solid transition-colors text-secondary hover:text-primary"
			>
				<svg
					class="w-4 h-4"
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
					class="bg-elevated rounded-md shadow-lg border border-base min-w-[180px] py-1 z-50"
					side="bottom"
					align="start"
					sideOffset={4}
				>
					{#if onSync}
						<DropdownMenu.Item
							class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer flex items-center justify-between focus:bg-hover-solid outline-none disabled:opacity-50 disabled:cursor-not-allowed"
							textValue="Sync Readwise Highlights"
							disabled={isSyncing}
							onSelect={() => {
								if (!isSyncing) {
									onSync();
									menuOpen = false;
								}
							}}
						>
							<span class="font-normal">{isSyncing ? 'Syncing...' : 'Sync Readwise Highlights'}</span>
							{#if isSyncing}
								<svg
									class="w-4 h-4 animate-spin"
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

						<DropdownMenu.Separator class="h-px bg-base my-1" />
					{/if}

					<DropdownMenu.Item
						class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer flex items-center justify-between focus:bg-hover-solid outline-none"
						textValue="Delete all"
						onSelect={() => {
							onDeleteAll?.();
							menuOpen = false;
						}}
					>
						<span class="font-normal">Delete all</span>
					</DropdownMenu.Item>

					<DropdownMenu.Item
						class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer flex items-center justify-between focus:bg-hover-solid outline-none"
						textValue="Delete all read"
						onSelect={() => {
							onDeleteAllRead?.();
							menuOpen = false;
						}}
					>
						<span class="font-normal">Delete all read</span>
					</DropdownMenu.Item>

					<DropdownMenu.Item
						class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer flex items-center justify-between focus:bg-hover-solid outline-none"
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
		<InboxFilterMenu currentFilter={currentFilter} onFilterChange={onFilterChange} />

		<!-- Sort Icon -->
		<button
			type="button"
			class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-hover-solid transition-colors text-secondary hover:text-primary"
			onclick={() => onSortClick?.()}
			aria-label="Sort inbox items"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
