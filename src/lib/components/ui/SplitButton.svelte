<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import Button from './Button.svelte';

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
			class="flex items-center rounded-r-md border-l border-base px-section transition-colors
				{variant === 'primary'
				? 'bg-accent-primary text-white hover:bg-accent-hover'
				: 'bg-elevated text-primary hover:bg-hover-solid'}"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</DropdownMenu.Trigger>
		<DropdownMenu.Portal>
			<DropdownMenu.Content
				class="z-50 min-w-[180px] rounded-md border border-base bg-elevated py-section shadow-lg"
				side="bottom"
				align="end"
				sideOffset={4}
			>
				{#each dropdownItems as item (item.label)}
					<DropdownMenu.Item
						class="flex cursor-pointer items-center px-menu-item py-menu-item text-sm text-primary transition-colors outline-none hover:bg-hover-solid focus:bg-hover-solid"
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
