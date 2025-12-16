<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$lib/utils/navigation';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const convexClient = browser ? useConvexClient() : null;

	let isCompleting = $state(false);

	async function handleContinue() {
		if (!workspaces?.activeWorkspace || !convexClient) return;

		isCompleting = true;

		try {
			await convexClient.mutation(api.features.onboarding.index.completeUserOnboarding, {
				sessionId: data.sessionId,
				workspaceId: workspaces.activeWorkspace.workspaceId
			});

			// Redirect to workspace
			const slug = workspaces.activeWorkspace.slug;
			if (slug) {
				goto(resolveRoute(`/w/${slug}/circles`));
			}
		} catch (error) {
			console.error('Failed to complete onboarding:', error);
		} finally {
			isCompleting = false;
		}
	}
</script>

<div class="border-base bg-surface rounded-card p-card-padding border">
	<div class="space-y-6">
		<!-- Header -->
		<div>
			<h1 class="text-primary text-2xl font-semibold">Welcome!</h1>
			<p class="text-secondary mt-2 text-sm">
				You've been invited to join this workspace. Let's get you started.
			</p>
		</div>

		<!-- Coming Soon -->
		<div class="bg-elevated rounded-md p-6 text-center">
			<div class="text-6xl">👋</div>
			<h3 class="text-primary mt-4 font-medium">User Onboarding Coming Soon</h3>
			<p class="text-secondary mt-2 text-sm">
				We're building a personalized onboarding experience for new members. For now, click continue
				to get started with your workspace!
			</p>
		</div>

		<!-- Actions -->
		<div class="flex items-center justify-end">
			<button
				type="button"
				onclick={handleContinue}
				disabled={isCompleting}
				class="text-on-solid bg-accent-primary px-button-x py-button-y rounded-md text-sm font-medium disabled:opacity-50"
			>
				{isCompleting ? 'Getting Started...' : 'Continue to Workspace'}
			</button>
		</div>
	</div>
</div>
