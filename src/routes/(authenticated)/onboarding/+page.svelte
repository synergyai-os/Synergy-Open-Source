<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$lib/utils/navigation';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';

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
			// Redirect to /w/:slug/circles after successful creation
			// Wait a moment for activeWorkspace to be updated with slug
			const checkSlug = () => {
				const slug = workspaces?.activeWorkspace?.slug;
				if (slug) {
					goto(resolveRoute(`/w/${slug}/circles`));
				} else {
					// Retry after a short delay
					setTimeout(checkSlug, 50);
				}
			};
			checkSlug();
		} catch (error) {
			console.error('Failed to create workspace:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to create workspace';
		} finally {
			isCreating = false;
		}
	}
</script>

<div class="bg-base flex h-screen items-center justify-center">
	<div class="border-base bg-surface px-page py-page w-full max-w-md rounded-lg border">
		<div class="space-y-6">
			<div>
				<h1 class="text-primary text-xl font-semibold">Create Your Organization</h1>
				<p class="text-secondary mt-2 text-sm">
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
					<span class="text-primary text-sm font-medium">Organization name</span>
					<input
						class="border-base py-nav-item bg-elevated text-primary focus:border-accent-primary w-full rounded-md border px-2 text-sm focus:outline-none"
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
						class="text-on-solid bg-accent-primary px-button-x py-button-y rounded-md text-sm font-medium disabled:opacity-50"
					>
						{isCreating ? 'Creating...' : 'Create'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
