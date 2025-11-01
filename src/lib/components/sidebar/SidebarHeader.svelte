<script lang="ts">
	import WorkspaceMenu from './WorkspaceMenu.svelte';

	type Props = {
		workspaceName?: string;
		onSettings?: () => void;
		onLogout?: () => void;
		onSearch?: () => void;
		onEdit?: () => void;
		isMobile?: boolean;
		sidebarCollapsed?: boolean;
		onToggleCollapse?: () => void;
		isHovered?: boolean;
		isPinned?: boolean;
		onTogglePin?: () => void;
	};

	let {
		workspaceName = 'Axon',
		onSettings,
		onLogout,
		onSearch,
		onEdit,
		isMobile = false,
		sidebarCollapsed = false,
		onToggleCollapse,
		isHovered = false,
		isPinned = false,
		onTogglePin
	}: Props = $props();
</script>

<!-- Sticky Header -->
<div class="sticky top-0 bg-gray-900 border-b border-gray-800 z-10">
	<div class="p-3">
		<div class="flex items-center gap-2">
			<!-- Collapse Toggle (only when not collapsed on desktop, or on mobile) -->
			{#if (!sidebarCollapsed || isMobile) && onToggleCollapse}
				<button
					type="button"
					onclick={() => onToggleCollapse()}
					class="text-gray-400 hover:text-white transition-colors flex-shrink-0"
					aria-label="Toggle sidebar"
				>
					{sidebarCollapsed ? '☰' : '✕'}
				</button>
			{/if}

			<!-- Workspace Menu with Logo and Name -->
			{#if !sidebarCollapsed || isMobile}
				<div class="flex-1 min-w-0">
					<WorkspaceMenu {workspaceName} {onSettings} {onLogout} />
				</div>

				<!-- Action Icons (Search and Edit) -->
				<div class="flex items-center gap-1">
					<button
						type="button"
						onclick={() => onSearch?.()}
						class="p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
						aria-label="Search"
					>
						<svg
							class="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</button>
					<button
						type="button"
						onclick={() => onEdit?.()}
						class="p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
						aria-label="Edit"
					>
						<svg
							class="w-5 h-5"
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
					</button>
				</div>

				<!-- Pin/Unpin button -->
				{#if isHovered && onTogglePin && !isMobile}
					<button
						type="button"
						onclick={() => onTogglePin()}
						class="text-gray-400 hover:text-white transition-colors flex-shrink-0"
						aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
					>
						📌
					</button>
				{/if}
			{/if}
		</div>
	</div>
</div>

<style>
	/* Sticky positioning is handled by the sticky class */
</style>

