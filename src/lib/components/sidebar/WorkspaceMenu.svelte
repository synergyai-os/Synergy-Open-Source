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
		class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors w-full text-left"
	>
		<div class="flex items-center gap-2 flex-1 min-w-0">
			<!-- Logo placeholder - can be replaced with actual logo -->
			<div class="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
				<span class="text-white text-xs font-bold">A</span>
			</div>
			<span class="font-medium text-white truncate">{workspaceName}</span>
			<svg
				class="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform"
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
			class="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px] py-1 z-50"
			side="bottom"
			align="start"
			sideOffset={4}
		>
			<DropdownMenu.Item
				class="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
				textValue="Settings"
				onSelect={() => onSettings?.()}
			>
				<span>Settings</span>
				<span class="text-xs text-gray-400 ml-4">G then S</span>
			</DropdownMenu.Item>

			<DropdownMenu.Separator class="my-1 border-t border-gray-200" />

			<DropdownMenu.Item
				class="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
				textValue="Log out"
				onSelect={() => onLogout?.()}
			>
				<span class="flex items-center gap-2">
					<span>Log out</span>
					<span class="text-xs text-gray-400 ml-auto">⌘⇧Q</span>
				</span>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>

<style>
	/* Additional custom styles if needed */
</style>

