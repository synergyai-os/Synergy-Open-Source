<script lang="ts">
	import { DropdownMenu } from 'bits-ui';

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
		as="button"
		type="button"
		class="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-gray-800 transition-colors w-full text-left group"
	>
		<div class="flex items-center gap-2.5 flex-1 min-w-0">
			<!-- Logo placeholder - can be replaced with actual logo -->
			<div
				class="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm"
			>
				<span class="text-white text-xs font-semibold">A</span>
			</div>
			<span class="font-medium text-sm text-white truncate">{workspaceName}</span>
			<svg
				class="w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200 group-hover:text-gray-300"
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
			class="bg-white rounded-md shadow-xl border border-gray-200/50 min-w-[220px] py-1.5 z-50"
			side="bottom"
			align="start"
			sideOffset={6}
		>
			<DropdownMenu.Item
				class="px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 cursor-pointer flex items-center justify-between focus:bg-gray-50 outline-none"
				textValue="Settings"
				onSelect={() => {
					onSettings?.();
					open = false;
				}}
			>
				<span class="font-normal">Settings</span>
				<span class="text-xs text-gray-500 ml-4 font-mono">G then S</span>
			</DropdownMenu.Item>

			<DropdownMenu.Separator class="my-1.5 border-t border-gray-100" />

			<DropdownMenu.Item
				class="px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 cursor-pointer focus:bg-gray-50 outline-none"
				textValue="Log out"
				onSelect={() => {
					onLogout?.();
					open = false;
				}}
			>
				<div class="flex items-center justify-between w-full">
					<span class="font-normal">Log out</span>
					<span class="text-xs text-gray-500 ml-4 font-mono">⌘⇧Q</span>
				</div>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>

<style>
	/* Additional custom styles if needed */
</style>

