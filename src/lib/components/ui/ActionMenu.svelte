<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import type { Snippet } from 'svelte';

	type MenuItem = {
		label: string;
		icon?: Snippet;
		onclick: () => void;
		danger?: boolean;
	};

	type Props = {
		items: MenuItem[];
		trigger?: Snippet; // Optional custom trigger
		class?: string;
	};

	let { items, trigger, class: className = '' }: Props = $props();

	let menuOpen = $state(false);
</script>

<DropdownMenu.Root bind:open={menuOpen}>
	<DropdownMenu.Trigger
		type="button"
		class="flex h-8 w-8 items-center justify-center rounded-md text-secondary transition-colors hover:bg-hover-solid hover:text-primary {className}"
		aria-label="More options"
	>
		{#if trigger}
			{@render trigger()}
		{:else}
			<!-- Default three dots icon -->
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
				/>
			</svg>
		{/if}
	</DropdownMenu.Trigger>

	<DropdownMenu.Portal>
		<DropdownMenu.Content
			class="z-50 min-w-[180px] rounded-md border border-base bg-elevated py-section shadow-lg"
			side="bottom"
			align="end"
			sideOffset={4}
		>
			{#each items as item (item.label)}
				<DropdownMenu.Item
					class="flex cursor-pointer items-center gap-icon px-menu-item py-menu-item text-sm transition-colors outline-none hover:bg-hover-solid focus:bg-hover-solid {item.danger
						? 'text-error'
						: 'text-primary'}"
					textValue={item.label}
					onSelect={() => {
						item.onclick();
						menuOpen = false;
					}}
				>
					{#if item.icon}
						{@render item.icon()}
					{/if}
					<span>{item.label}</span>
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
