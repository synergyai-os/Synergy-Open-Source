<script lang="ts">
	/**
	 * DESIGN SYSTEM EXCEPTION: Menu item spacing (SYOS-585)
	 *
	 * Menu items use non-standard spacing values that don't fit the base scale:
	 * - spacing.menu.item.x = 0.625rem (10px) - optimal for menu item padding
	 * - spacing.menu.item.y = 0.375rem (6px) - optimal for compact menu design
	 *
	 * These values are hardcoded because they don't reference base tokens.
	 * See: dev-docs/2-areas/design/token-file-split-exception-mapping.md
	 */

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
		class="hover:bg-hover-solid flex size-icon-xl items-center justify-center rounded-button text-primary transition-colors hover:text-primary {className}"
		aria-label="More options"
	>
		{#if trigger}
			{@render trigger()}
		{:else}
			<!-- Default three dots icon -->
			<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
			class="border-base z-50 min-w-[180px] rounded-button border bg-elevated py-1 shadow-card"
			side="bottom"
			align="end"
			sideOffset={4}
		>
			{#each items as item (item.label)}
				<DropdownMenu.Item
					class="hover:bg-hover-solid focus:bg-hover-solid flex cursor-pointer items-center gap-2 px-[0.625rem] py-[0.375rem] text-[0.875rem] transition-colors outline-none {item.danger
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
