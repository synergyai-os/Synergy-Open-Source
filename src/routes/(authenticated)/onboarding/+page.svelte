<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$lib/utils/navigation';
	import { parseConvexError } from '$lib/utils/parseConvexError';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import { InfoCard } from '$lib/components/molecules';
	import { browser } from '$app/environment';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const convexClient = browser ? useConvexClient() : null;

	let orgName = $state('');
	let isCreating = $state(false);
	let errorMessage = $state<string | null>(null);

	async function handleCreate() {
		if (!orgName.trim() || !workspaces) return;

		isCreating = true;
		errorMessage = null;

		try {
			await workspaces.createWorkspace({ name: orgName.trim() });

			// Mark workspace creation step as completed
			// Get the active workspace after creation
			const activeWorkspace = workspaces.activeWorkspace;
			if (activeWorkspace?.workspaceId && convexClient && data?.sessionId) {
				try {
					await convexClient.mutation(api.features.onboarding.index.updateOnboardingStep, {
						sessionId: data.sessionId,
						workspaceId: activeWorkspace.workspaceId,
						step: 'workspace_created',
						completed: true
					});
				} catch (stepError) {
					// Don't fail workspace creation if step update fails
					console.warn('Failed to update onboarding step:', stepError);
				}
			}

			// SYOS-891: Redirect to onboarding flow instead of directly to workspace
			// Only redirect on success - errors will be caught and displayed
			goto(resolveRoute('/onboarding/terminology'));
		} catch (error) {
			console.error('Failed to create workspace:', error);
			// Extract user-friendly error message, removing all technical details
			errorMessage = parseConvexError(error);
			// Don't redirect - stay on page to show error
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
					<InfoCard variant="error" message={errorMessage} />
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
