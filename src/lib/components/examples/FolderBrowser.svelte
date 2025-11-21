<script lang="ts">
	import StackedPanel from '$lib/components/organisms/StackedPanel.svelte';
	import { useNavigationStack } from '$lib/modules/core/composables/useNavigationStack.svelte';

	// Mock folder hierarchy
	type Folder = {
		id: string;
		name: string;
		parentId: string | null;
	};

	const folders: Folder[] = [
		{ id: 'root', name: 'Documents', parentId: null },
		{ id: 'folder1', name: 'Projects', parentId: 'root' },
		{ id: 'folder2', name: 'Personal', parentId: 'root' },
		{ id: 'folder3', name: 'Work', parentId: 'folder1' },
		{ id: 'file1', name: 'README.md', parentId: 'folder3' }
	];

	const navigationStack = useNavigationStack();

	// Get current folder from stack
	const currentFolderId = $derived(navigationStack.currentLayer?.id ?? 'root');

	const currentFolder = $derived(folders.find((f) => f.id === currentFolderId) ?? folders[0]);

	const isOpen = $derived(navigationStack.depth > 0);

	// Get child folders/files
	const children = $derived(folders.filter((f) => f.parentId === currentFolderId));

	// Check if this panel is topmost
	const isTopmost = () => {
		return navigationStack.currentLayer?.id === currentFolderId;
	};

	function handleOpenFolder(folderId: string) {
		const folder = folders.find((f) => f.id === folderId);
		if (folder) {
			// Use 'circle' type for folder navigation (PanelBreadcrumbs supports 'circle' and 'role')
			// In a real implementation, you'd extend NavigationLayerType to include 'folder'
			navigationStack.push({
				type: 'circle',
				id: folder.id,
				name: folder.name
			});
		}
	}

	function handleClose() {
		const previousLayer = navigationStack.previousLayer;

		if (previousLayer) {
			// Pop current layer
			navigationStack.pop();
			// Navigation stack already updated, no need to re-open
		} else {
			// No previous layer - close everything
			navigationStack.clear();
		}
	}

	function handleBreadcrumbClick(index: number) {
		const targetLayer = navigationStack.getLayer(index);
		if (!targetLayer) return;

		// Jump to that layer in the stack
		navigationStack.jumpTo(index);
		// Navigation stack already updated, no need to re-open
	}

	// Initialize with root folder
	$effect(() => {
		if (navigationStack.depth === 0) {
			navigationStack.push({
				type: 'circle',
				id: 'root',
				name: 'Documents'
			});
		}
	});
</script>

<div class="px-card py-card">
	<h2 class="mb-content-section text-h3 font-semibold text-primary">Folder Browser Example</h2>
	<p class="mb-content-section text-small text-secondary">
		This demonstrates hierarchical panel navigation outside the org chart context.
	</p>

	<StackedPanel
		{isOpen}
		{navigationStack}
		onClose={handleClose}
		onBreadcrumbClick={handleBreadcrumbClick}
		{isTopmost}
	>
		<div class="flex h-full flex-col">
			<!-- Header -->
			<div class="border-b border-base px-inbox-container py-system-content">
				<h3 class="text-h3 font-bold text-primary">{currentFolder.name}</h3>
				{#if currentFolder.parentId}
					<p class="mt-form-field-gap text-small text-secondary">
						Parent: <span class="font-medium"
							>{folders.find((f) => f.id === currentFolder.parentId)?.name}</span
						>
					</p>
				{/if}
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto px-inbox-container py-system-content">
				{#if children.length > 0}
					<div class="space-y-icon">
						{#each children as child (child.id)}
							<button
								type="button"
								class="flex w-full items-center gap-content-section rounded-card bg-surface px-card py-card text-left transition-colors hover:bg-hover-solid"
								onclick={() => handleOpenFolder(child.id)}
							>
								{#if child.id.startsWith('file')}
									<svg
										class="icon-sm text-tertiary"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
								{:else}
									<svg
										class="icon-sm text-tertiary"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
										/>
									</svg>
								{/if}
								<span class="text-small font-medium text-primary">{child.name}</span>
							</button>
						{/each}
					</div>
				{:else}
					<div class="py-readable-quote text-center">
						<p class="text-small text-secondary">This folder is empty</p>
					</div>
				{/if}
			</div>
		</div>
	</StackedPanel>
</div>
