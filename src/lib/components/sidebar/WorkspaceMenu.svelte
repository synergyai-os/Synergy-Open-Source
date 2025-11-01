<script lang="ts">
	import { DropdownMenu, Switch } from 'bits-ui';
	import { theme, isDark } from '$lib/stores/theme';

	type Props = {
		workspaceName?: string;
		onSettings?: () => void;
		onLogout?: () => void;
	};

	let { workspaceName = 'Axon', onSettings, onLogout }: Props = $props();

	let open = $state(false);
</script>

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger
		type="button"
		class="flex items-center gap-icon-wide px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover-solid transition-colors w-full text-left group"
	>
		<div class="flex items-center gap-icon-wide flex-1 min-w-0">
			<!-- Logo placeholder - can be replaced with actual logo -->
			<div
				class="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm"
			>
				<span class="text-white text-xs font-semibold">A</span>
			</div>
			<span class="font-medium text-sm text-sidebar-primary truncate">{workspaceName}</span>
			<svg
				class="w-3.5 h-3.5 text-sidebar-secondary flex-shrink-0 transition-transform duration-200 group-hover:text-sidebar-primary"
				class:rotate-180={open}
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</div>
	</DropdownMenu.Trigger>

	<DropdownMenu.Portal>
		<DropdownMenu.Content
			class="bg-white rounded-md shadow-lg border border-gray-200/60 min-w-[180px] py-1 z-50"
			side="bottom"
			align="start"
			sideOffset={4}
		>
			<DropdownMenu.Item
				class="px-menu-item py-menu-item text-sm text-gray-900 hover:bg-gray-50 cursor-pointer flex items-center justify-between focus:bg-gray-50 outline-none"
				textValue="Settings"
				onSelect={() => {
					onSettings?.();
					open = false;
				}}
			>
				<span class="font-normal">Settings</span>
				<span class="text-label text-gray-400 ml-3 font-mono">G then S</span>
			</DropdownMenu.Item>

			<div
				class="px-menu-item py-menu-item flex items-center justify-between gap-3"
				onclick={(e) => e.stopPropagation()}
				role="presentation"
			>
				<div class="flex items-center gap-icon flex-1">
					<span class="text-sm font-normal text-gray-900">
						{$isDark ? 'Dark mode' : 'Light mode'}
					</span>
					{#if $isDark}
						<svg
							class="w-3.5 h-3.5 text-gray-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
							/>
						</svg>
					{:else}
						<svg
							class="w-3.5 h-3.5 text-gray-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
					{/if}
				</div>
				<Switch.Root
					checked={$isDark}
					onCheckedChange={(checked) => {
						theme.setTheme(checked ? 'dark' : 'light');
					}}
					class="relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {$isDark ? 'bg-gray-900' : 'bg-gray-300'}"
				>
					<Switch.Thumb
						class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0 data-[state=checked]:translate-x-4"
					/>
				</Switch.Root>
			</div>

			<DropdownMenu.Separator class="my-1 border-t border-gray-100" />

			<DropdownMenu.Item
				class="px-menu-item py-menu-item text-sm text-gray-900 hover:bg-gray-50 cursor-pointer focus:bg-gray-50 outline-none"
				textValue="Log out"
				onSelect={() => {
					onLogout?.();
					open = false;
				}}
			>
				<div class="flex items-center justify-between w-full">
					<span class="font-normal">Log out</span>
					<span class="text-label text-gray-400 ml-3 font-mono">⌘⇧Q</span>
				</div>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>

<style>
	/* Additional custom styles if needed */
</style>

