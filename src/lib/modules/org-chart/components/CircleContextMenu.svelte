<script lang="ts">
	import { browser } from '$app/environment';
	import { type Id } from '$lib/convex';
	import * as ContextMenu from '$lib/components/molecules/ContextMenu.svelte';
	import {
		contextMenuContentRecipe,
		contextMenuItemRecipe,
		contextMenuSeparatorRecipe
	} from '$lib/design-system/recipes';
	import AddRoleDialog from './AddRoleDialog.svelte';
	import AddCircleDialog from './AddCircleDialog.svelte';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$lib/utils/navigation';

	type Props = {
		circleId: Id<'circles'>;
		circleName: string;
		workspaceId: Id<'workspaces'>;
		workspaceSlug: string;
		onRoleCreated?: () => void;
		onCircleCreated?: () => void;
		onLeftClick?: (e: MouseEvent) => void;
	};

	let {
		circleId,
		circleName,
		workspaceId,
		workspaceSlug,
		onRoleCreated,
		onCircleCreated,
		onLeftClick
	}: Props = $props();

	let showAddRoleDialog = $state(false);
	let showAddCircleDialog = $state(false);

	function handleImportToCircle() {
		// Navigate to import page with targetCircleId query param
		goto(resolveRoute(`/w/${workspaceSlug}/chart/import?targetCircleId=${circleId}`));
	}
</script>

{#if browser}
	<ContextMenu.Root>
		<ContextMenu.Trigger
			class="h-full w-full rounded-full"
			style="pointer-events: all;"
			onclick={(e) => {
				// For left-clicks, forward to circle's click handler
				if (e.button === 0 && onLeftClick) {
					onLeftClick(e);
				}
			}}
			oncontextmenu={(e) => {
				// Stop propagation on right-click to prevent default browser context menu
				e.stopPropagation();
			}}
		>
			<!-- Invisible trigger area for right-click context menu -->
		</ContextMenu.Trigger>

		<ContextMenu.Portal>
			<!-- Gradient overlay for premium look -->
			<ContextMenu.Content
				class={[contextMenuContentRecipe(), 'relative overflow-hidden']}
				sideOffset={4}
			>
				<!-- Gradient overlay -->
				<div
					class="pointer-events-none absolute inset-0 bg-radial-[at_50%_0%] from-[oklch(55%_0.12_195_/_0.05)] via-[oklch(55%_0.06_195_/_0.02)] to-transparent"
					aria-hidden="true"
				></div>

				<!-- Content with relative positioning -->
				<div class="relative">
					<ContextMenu.Item
						class={contextMenuItemRecipe()}
						onSelect={() => {
							showAddRoleDialog = true;
						}}
					>
						<span class="mr-2">➕</span>
						<span>Add Role Here</span>
					</ContextMenu.Item>

					<ContextMenu.Item
						class={contextMenuItemRecipe()}
						onSelect={() => {
							showAddCircleDialog = true;
						}}
					>
						<span class="mr-2">⭕</span>
						<span>Add Sub-Circle Here</span>
					</ContextMenu.Item>

					<ContextMenu.Separator class={contextMenuSeparatorRecipe()} />

					<ContextMenu.Item class={contextMenuItemRecipe()} onSelect={handleImportToCircle}>
						<span class="mr-2">📤</span>
						<span>Import to This Circle</span>
					</ContextMenu.Item>
				</div>
			</ContextMenu.Content>
		</ContextMenu.Portal>
	</ContextMenu.Root>

	<AddRoleDialog
		bind:open={showAddRoleDialog}
		{circleId}
		{circleName}
		{workspaceId}
		onSuccess={onRoleCreated}
	/>

	<AddCircleDialog
		bind:open={showAddCircleDialog}
		parentCircleId={circleId}
		parentCircleName={circleName}
		{workspaceId}
		onSuccess={onCircleCreated}
	/>
{/if}
