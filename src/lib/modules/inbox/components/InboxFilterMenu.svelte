<script lang="ts">
	import { DropdownMenu } from 'bits-ui';

	type InboxItemType = 'readwise_highlight' | 'photo_note' | 'manual_text';

	interface Props {
		currentFilter: InboxItemType | 'all';
		onFilterChange: (type: InboxItemType | 'all') => void;
	}

	let { currentFilter, onFilterChange }: Props = $props();

	let menuOpen = $state(false);

	function handleFilterSelect(type: InboxItemType | 'all') {
		onFilterChange(type);
		menuOpen = false;
	}
</script>

<DropdownMenu.Root bind:open={menuOpen}>
	<DropdownMenu.Trigger
		type="button"
		class="icon-xl hover:bg-hover-solid flex items-center justify-center rounded-button text-secondary transition-colors hover:text-primary"
		aria-label="Filter inbox items"
	>
		<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
			/>
		</svg>
	</DropdownMenu.Trigger>

	<DropdownMenu.Portal>
		<DropdownMenu.Content
			class="min-w-dropdown border-base py-badge z-50 rounded-button border bg-elevated shadow-card"
			side="bottom"
			align="end"
			sideOffset={4}
		>
			<DropdownMenu.Item
				class="px-menu-item py-menu-item text-small hover:bg-hover-solid focus:bg-hover-solid flex cursor-pointer items-center justify-between text-primary outline-none"
				textValue="All"
				onSelect={() => handleFilterSelect('all')}
			>
				<span class="font-normal">All</span>
				{#if currentFilter === 'all'}
					<svg
						class="icon-sm flex-shrink-0 text-secondary"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				{/if}
			</DropdownMenu.Item>

			<DropdownMenu.Item
				class="px-menu-item py-menu-item text-small hover:bg-hover-solid focus:bg-hover-solid flex cursor-pointer items-center justify-between text-primary outline-none"
				textValue="Readwise"
				onSelect={() => handleFilterSelect('readwise_highlight')}
			>
				<span class="font-normal">Readwise</span>
				{#if currentFilter === 'readwise_highlight'}
					<svg
						class="icon-sm flex-shrink-0 text-secondary"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				{/if}
			</DropdownMenu.Item>

			<DropdownMenu.Item
				class="px-menu-item py-menu-item text-small hover:bg-hover-solid focus:bg-hover-solid flex cursor-pointer items-center justify-between text-primary outline-none"
				textValue="Photos"
				onSelect={() => handleFilterSelect('photo_note')}
			>
				<span class="font-normal">Photos</span>
				{#if currentFilter === 'photo_note'}
					<svg
						class="icon-sm flex-shrink-0 text-secondary"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				{/if}
			</DropdownMenu.Item>

			<DropdownMenu.Item
				class="px-menu-item py-menu-item text-small hover:bg-hover-solid focus:bg-hover-solid flex cursor-pointer items-center justify-between text-primary outline-none"
				textValue="Manual"
				onSelect={() => handleFilterSelect('manual_text')}
			>
				<span class="font-normal">Manual</span>
				{#if currentFilter === 'manual_text'}
					<svg
						class="icon-sm flex-shrink-0 text-secondary"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				{/if}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
