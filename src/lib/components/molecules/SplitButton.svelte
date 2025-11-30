<script lang="ts">
	/**
	 * DESIGN SYSTEM EXCEPTION: Menu item spacing and typography (SYOS-585)
	 *
	 * Menu items use non-standard spacing and typography values:
	 * - spacing.menu.item.x = 0.625rem (10px) - optimal for menu item padding
	 * - spacing.menu.item.y = 0.375rem (6px) - optimal for compact menu design
	 * - typography.fontSize.button = 0.875rem (14px) - button text size
	 *
	 * These values are hardcoded because they don't reference base tokens.
	 * See: dev-docs/2-areas/design/token-file-split-exception-mapping.md
	 */

	import { DropdownMenu } from 'bits-ui';
	import { Button } from '$lib/components/atoms';

	type DropdownItem = {
		label: string;
		onclick: () => void;
	};

	type Props = {
		primaryLabel: string;
		primaryOnclick: () => void;
		dropdownItems: DropdownItem[];
		variant?: 'primary' | 'secondary';
		class?: string;
	};

	let {
		primaryLabel,
		primaryOnclick,
		dropdownItems,
		variant = 'primary',
		class: className = ''
	}: Props = $props();

	let dropdownOpen = $state(false);
</script>

<div class="inline-flex {className}">
	<Button {variant} onclick={primaryOnclick} class="rounded-r-none">
		{primaryLabel}
	</Button>
	<DropdownMenu.Root bind:open={dropdownOpen}>
		<DropdownMenu.Trigger
			type="button"
			class="rounded-r-button border-base flex items-center border-l px-2 transition-colors
				{variant === 'primary'
				? 'bg-accent-primary text-primary hover:bg-accent-hover'
				: 'hover:bg-hover-solid bg-elevated text-primary'}"
		>
			<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</DropdownMenu.Trigger>
		<DropdownMenu.Portal>
			<DropdownMenu.Content
				class="border-base z-50 min-w-[180px] rounded-button border bg-elevated py-1 shadow-card"
				side="bottom"
				align="end"
				sideOffset={4}
			>
				{#each dropdownItems as item (item.label)}
					<DropdownMenu.Item
						class="hover:bg-hover-solid focus:bg-hover-solid flex cursor-pointer items-center px-[0.625rem] py-[0.375rem] text-[0.875rem] text-primary transition-colors outline-none"
						textValue={item.label}
						onSelect={() => {
							item.onclick();
							dropdownOpen = false;
						}}
					>
						<span>{item.label}</span>
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Portal>
	</DropdownMenu.Root>
</div>
