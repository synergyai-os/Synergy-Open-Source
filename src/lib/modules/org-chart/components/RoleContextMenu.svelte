<script lang="ts">
	import { browser } from '$app/environment';
	import { type Id } from '$lib/convex';
	import * as ContextMenu from '$lib/components/molecules/ContextMenu.svelte';
	import { contextMenuContentRecipe, contextMenuItemRecipe } from '$lib/design-system/recipes';
	import AssignPersonDialog from './AssignPersonDialog.svelte';

	type Props = {
		roleId: Id<'circleRoles'>;
		roleName: string;
		workspaceId: Id<'workspaces'>;
		onLeftClick?: (e: MouseEvent) => void;
	};

	let { roleId, roleName, workspaceId, onLeftClick }: Props = $props();

	let showAssignPersonDialog = $state(false);
</script>

{#if browser}
	<ContextMenu.Root>
		<ContextMenu.Trigger
			class="h-full w-full rounded-full"
			style="pointer-events: all;"
			onclick={(e) => {
				// For left-clicks, forward to role's click handler
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
					class="pointer-events-none absolute inset-0 bg-radial-[at_50%_0%] from-[var(--gradient-overlay-from)] via-[var(--gradient-overlay-via)] to-transparent"
					aria-hidden="true"
				></div>

				<!-- Content with relative positioning -->
				<div class="relative">
					<ContextMenu.Item
						class={contextMenuItemRecipe()}
						onSelect={() => {
							showAssignPersonDialog = true;
						}}
					>
						<span class="mr-2">👤</span>
						<span>Assign Person to Role</span>
					</ContextMenu.Item>
				</div>
			</ContextMenu.Content>
		</ContextMenu.Portal>
	</ContextMenu.Root>

	<AssignPersonDialog
		bind:open={showAssignPersonDialog}
		type="role"
		entityId={roleId}
		entityName={roleName}
		{workspaceId}
		onSuccess={() => {
			// Refresh org chart data - queries will auto-refresh
		}}
	/>
{/if}
