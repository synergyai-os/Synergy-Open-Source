<script lang="ts">
	import { DropdownMenu } from 'bits-ui';

	interface Props {
		onDeleteAll?: () => void;
		onDeleteAllRead?: () => void;
		onDeleteAllCompleted?: () => void;
		onFilterClick?: () => void;
		onSortClick?: () => void;
	}

	let {
		onDeleteAll,
		onDeleteAllRead,
		onDeleteAllCompleted,
		onFilterClick,
		onSortClick
	}: Props = $props();

	let menuOpen = $state(false);
	let filterMenuOpen = $state(false);
	let sortMenuOpen = $state(false);
</script>

<div
	class="sticky top-0 z-10 bg-surface border-b border-base px-inbox-header py-inbox-header flex items-center justify-between flex-shrink-0"
>
	<!-- Left: Title + Kebab Menu -->
	<div class="flex items-center gap-icon">
		<h2 class="text-xl font-bold text-primary">Inbox</h2>

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
					class="bg-elevated rounded-md shadow-lg border border-base min-w-[240px] py-1 z-50"
					side="bottom"
					align="start"
					sideOffset={4}
				>
					<DropdownMenu.Item
						class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer focus:bg-hover-solid outline-none flex items-center gap-icon"
						textValue="Delete all"
						onSelect={() => {
							onDeleteAll?.();
							menuOpen = false;
						}}
					>
						<svg
							class="w-4 h-4 text-secondary"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
						<span>Delete all</span>
					</DropdownMenu.Item>

					<DropdownMenu.Item
						class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer focus:bg-hover-solid outline-none flex items-center gap-icon"
						textValue="Delete all read"
						onSelect={() => {
							onDeleteAllRead?.();
							menuOpen = false;
						}}
					>
						<svg
							class="w-4 h-4 text-secondary"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
						<span>Delete all read</span>
					</DropdownMenu.Item>

					<DropdownMenu.Item
						class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer focus:bg-hover-solid outline-none flex items-center gap-icon"
						textValue="Delete all for completed issues and reviews"
						onSelect={() => {
							onDeleteAllCompleted?.();
							menuOpen = false;
						}}
					>
						<svg
							class="w-4 h-4 text-secondary"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
						<span>Delete all for completed issues and reviews</span>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	</div>

	<!-- Right: Filter + Sort Icons -->
	<div class="flex items-center gap-icon">
		<!-- Filter Icon -->
		<button
			type="button"
			class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-hover-solid transition-colors text-secondary hover:text-primary"
			onclick={() => onFilterClick?.()}
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
				/>
			</svg>
		</button>

		<!-- Sort Icon -->
		<button
			type="button"
			class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-hover-solid transition-colors text-secondary hover:text-primary"
			onclick={() => onSortClick?.()}
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
