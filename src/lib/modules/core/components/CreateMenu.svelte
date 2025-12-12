<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

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
		triggerElement: _triggerElement
	}: Props = $props();

	function handleSelect(action: (() => void) | undefined) {
		return () => {
			action?.();
			onOpenChange(false);
		};
	}
</script>

<DropdownMenuPrimitive.Root {open} {onOpenChange}>
	<DropdownMenuPrimitive.Trigger
		class="bg-sidebar-hover px-header py-nav-item text-small text-sidebar-primary hover:bg-sidebar-hover-solid rounded-button flex w-full items-center justify-center gap-2 font-normal transition-all duration-150"
	>
		<svg
			class="icon-sm"
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
		class="px-menu-container py-menu-container border-sidebar bg-sidebar rounded-button shadow-card z-50 min-w-[12rem] border"
		sideOffset={4}
	>
		<!-- Note Option -->
		<DropdownMenuPrimitive.Item
			class="group px-menu-item py-menu-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary rounded-button relative flex cursor-pointer items-center gap-2 transition-colors outline-none"
			onSelect={handleSelect(onCreateNote)}
		>
			<svg
				class="icon-sm flex-shrink-0"
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
			<span class="text-sidebar-tertiary text-label">C</span>
		</DropdownMenuPrimitive.Item>

		<DropdownMenuPrimitive.Separator class="bg-sidebar-divider my-form-field-gap h-px" />

		<!-- Flashcard Option -->
		<DropdownMenuPrimitive.Item
			class="group px-menu-item py-menu-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary rounded-button relative flex cursor-pointer items-center gap-2 transition-colors outline-none"
			onSelect={handleSelect(onCreateFlashcard)}
		>
			<svg
				class="icon-sm flex-shrink-0"
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
			class="group px-menu-item py-menu-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary rounded-button relative flex cursor-pointer items-center gap-2 transition-colors outline-none"
			onSelect={handleSelect(onCreateHighlight)}
		>
			<svg
				class="icon-sm flex-shrink-0"
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
