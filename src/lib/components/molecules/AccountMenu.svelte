<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { Icon, Text } from '$lib/components/atoms';

	type Props = {
		accountEmail: string;
		onCreateWorkspace?: (targetUserId: string) => void;
		onJoinWorkspace?: (targetUserId: string) => void;
		onLogout?: (targetUserId: string) => void;
		targetUserId: string;
		onClose?: () => void;
		class?: string;
	};

	let {
		accountEmail: _accountEmail,
		onCreateWorkspace,
		onJoinWorkspace,
		onLogout,
		targetUserId,
		onClose,
		class: className = ''
	}: Props = $props();

	// State for nested menu
	let menuOpen = $state(false);
</script>

<DropdownMenu.Root open={menuOpen} onOpenChange={(open) => (menuOpen = open)}>
	<DropdownMenu.Trigger
		type="button"
		class="size-icon-md rounded-button text-tertiary hover:bg-subtle hover:text-primary flex items-center justify-center transition-all duration-200 {className}"
		onclick={(e) => {
			e.stopPropagation(); // Prevent parent menu from closing
		}}
	>
		<!-- WORKAROUND: more-options icon missing from registry - see missing-styles.md -->
		<svg
			class="icon-sm"
			style="width: 16px; height: 16px;"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
			/>
		</svg>
	</DropdownMenu.Trigger>
	<DropdownMenu.Portal>
		<DropdownMenu.Content
			class="border-base rounded-modal bg-surface py-inset-xs relative min-w-[180px] overflow-hidden border shadow-md"
			style="z-index: var(--zIndex-popover);"
			side="right"
			align="start"
			sideOffset={4}
			onInteractOutside={(e) => {
				e.stopPropagation(); // Prevent parent menu from closing
			}}
		>
			<!-- Subtle gradient background matching main dropdown -->
			<div
				class="pointer-events-none absolute inset-0 bg-radial-[at_50%_0%] from-[oklch(55%_0.12_195_/_0.05)] via-[oklch(55%_0.06_195_/_0.02)] to-transparent"
				aria-hidden="true"
			></div>
			<div class="relative">
				<DropdownMenu.Item
					class="rounded-button px-input py-stack-item hover:bg-subtle focus:bg-subtle mx-1 cursor-pointer transition-all duration-200 outline-none"
					textValue="Create workspace"
					onSelect={() => {
						menuOpen = false;
						onCreateWorkspace?.(targetUserId);
						onClose?.();
					}}
				>
					<div class="gap-header flex items-center">
						<Icon type="add" size="sm" color="primary" />
						<Text variant="body" size="sm" color="default" as="span">Create workspace</Text>
					</div>
				</DropdownMenu.Item>
				<DropdownMenu.Item
					class="rounded-button px-input py-stack-item hover:bg-subtle focus:bg-subtle mx-1 cursor-pointer transition-all duration-200 outline-none"
					textValue="Join workspace"
					onSelect={() => {
						menuOpen = false;
						onJoinWorkspace?.(targetUserId);
						onClose?.();
					}}
				>
					<div class="gap-header flex items-center">
						<Icon type="add" size="sm" color="secondary" />
						<Text variant="body" size="sm" color="default" as="span">Join workspace</Text>
					</div>
				</DropdownMenu.Item>
				<DropdownMenu.Separator class="border-base my-stack-divider border-t" />
				<DropdownMenu.Item
					class="rounded-button px-input py-stack-item hover:bg-subtle focus:bg-subtle mx-1 cursor-pointer transition-all duration-200 outline-none"
					textValue="Log out"
					onSelect={() => {
						menuOpen = false;
						onLogout?.(targetUserId);
						onClose?.();
					}}
				>
					<div class="gap-header flex items-center">
						<!-- WORKAROUND: logout icon missing from registry - see missing-styles.md -->
						<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
						<Text variant="body" size="sm" color="error" as="span">Log out</Text>
					</div>
				</DropdownMenu.Item>
			</div>
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
