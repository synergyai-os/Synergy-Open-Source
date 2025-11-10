<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { fade } from 'svelte/transition';

	type Props = {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		onCreateNote?: () => void;
		onCreateFlashcard?: () => void;
		onCreateHighlight?: () => void;
		triggerElement?: HTMLElement;
	};

	let {
		open = false,
		onOpenChange,
		onCreateNote,
		onCreateFlashcard,
		onCreateHighlight,
		triggerElement
	}: Props = $props();

	function handleSelect(action: (() => void) | undefined) {
		return () => {
			if (action) {
				action();
			}
			onOpenChange(false);
		};
	}
</script>

<DropdownMenuPrimitive.Root {open} {onOpenChange}>
	<DropdownMenuPrimitive.Trigger
		class="flex w-full items-center justify-center gap-icon rounded-md bg-sidebar-hover px-header py-nav-item text-sm font-normal text-sidebar-primary transition-all duration-150 hover:bg-sidebar-hover-solid"
	>
		<svg
			class="h-4 w-4"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
		</svg>
		New Item
	</DropdownMenuPrimitive.Trigger>

	<DropdownMenuPrimitive.Content
		class="px-menu-container py-menu-container z-50 min-w-[12rem] rounded-md border border-sidebar bg-sidebar shadow-lg"
		sideOffset={4}
	>
		<!-- Note Option -->
		<DropdownMenuPrimitive.Item
			class="group relative flex cursor-pointer items-center gap-icon rounded-md px-menu-item py-menu-item text-sm text-sidebar-secondary transition-colors outline-none hover:bg-sidebar-hover hover:text-sidebar-primary"
			onSelect={handleSelect(onCreateNote)}
		>
			<svg
				class="h-4 w-4 flex-shrink-0"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
				/>
			</svg>
			<span class="flex-1">Note</span>
			<span class="text-label text-sidebar-tertiary">C</span>
		</DropdownMenuPrimitive.Item>

		<DropdownMenuPrimitive.Separator class="bg-sidebar-divider my-1 h-px" />

		<!-- Flashcard Option -->
		<DropdownMenuPrimitive.Item
			class="group relative flex cursor-pointer items-center gap-icon rounded-md px-menu-item py-menu-item text-sm text-sidebar-secondary transition-colors outline-none hover:bg-sidebar-hover hover:text-sidebar-primary"
			onSelect={handleSelect(onCreateFlashcard)}
		>
			<svg
				class="h-4 w-4 flex-shrink-0"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span class="flex-1">Flashcard</span>
		</DropdownMenuPrimitive.Item>

		<!-- Highlight Option -->
		<DropdownMenuPrimitive.Item
			class="group relative flex cursor-pointer items-center gap-icon rounded-md px-menu-item py-menu-item text-sm text-sidebar-secondary transition-colors outline-none hover:bg-sidebar-hover hover:text-sidebar-primary"
			onSelect={handleSelect(onCreateHighlight)}
		>
			<svg
				class="h-4 w-4 flex-shrink-0"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
				/>
			</svg>
			<span class="flex-1">Highlight</span>
		</DropdownMenuPrimitive.Item>
	</DropdownMenuPrimitive.Content>
</DropdownMenuPrimitive.Root>
