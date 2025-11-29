<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$lib/utils/navigation';
	import type { WorkspacesModuleAPI } from '$lib/modules/core/workspaces/composables/useWorkspaces.svelte';

	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');

	let orgName = $state('');
	let isCreating = $state(false);
	let errorMessage = $state<string | null>(null);

	async function handleCreate() {
		if (!orgName.trim() || !workspaces) return;

		isCreating = true;
		errorMessage = null;

		try {
			await workspaces.createWorkspace({ name: orgName.trim() });
			// Redirect to /org/circles after successful creation with org context
			// Wait a moment for activeWorkspaceId to be set
			const orgId = workspaces.activeWorkspaceId;
			if (orgId) {
				goto(resolveRoute(`/org/circles?org=${orgId}`));
			} else {
				// Fallback: redirect without org param (will be set from context)
				goto(resolveRoute('/org/circles'));
			}
		} catch (error) {
			console.error('Failed to create workspace:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to create workspace';
		} finally {
			isCreating = false;
		}
	}
</script>

<div class="flex h-screen items-center justify-center bg-base">
	<div class="border-base w-full max-w-md rounded-lg border bg-surface px-page py-page">
		<div class="space-y-6">
			<div>
				<h1 class="text-xl font-semibold text-primary">Create Your Organization</h1>
				<p class="mt-2 text-sm text-secondary">
					Get started by creating your workspace. This will be your workspace for team
					collaboration.
				</p>
			</div>

			<form
				class="space-y-4"
				onsubmit={(event) => {
					event.preventDefault();
					handleCreate();
				}}
			>
				<label class="flex flex-col gap-1">
					<span class="text-sm font-medium text-primary">Organization name</span>
					<input
						class="border-base py-nav-item focus:border-accent-primary w-full rounded-md border bg-elevated px-2 text-sm text-primary focus:outline-none"
						placeholder="e.g. SynergyOS Labs"
						bind:value={orgName}
						required
						minlength={2}
						disabled={isCreating}
					/>
				</label>

				{#if errorMessage}
					<div
						class="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
					>
						{errorMessage}
					</div>
				{/if}

				<div class="flex items-center justify-end gap-2 pt-2">
					<button
						type="submit"
						disabled={isCreating || !orgName.trim()}
						class="text-on-solid bg-accent-primary rounded-md px-button-x py-button-y text-sm font-medium disabled:opacity-50"
					>
						{isCreating ? 'Creating...' : 'Create'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
