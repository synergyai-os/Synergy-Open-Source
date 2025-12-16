<script lang="ts">
	import { getContext } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
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
	let errorMessage = $state<string | null>(null);

	async function handleSkip() {
		console.log('handleSkip called', {
			hasWorkspaces: !!workspaces,
			activeWorkspace: workspaces?.activeWorkspace,
			hasConvexClient: !!convexClient,
			hasSessionId: !!data.sessionId,
			sessionId: data.sessionId,
			isCompleting
		});

		if (isCompleting) {
			console.log('Already completing, ignoring click');
			return;
		}

		// Get workspace ID from data if activeWorkspace is not available
		let workspaceId: string | undefined;
		if (workspaces?.activeWorkspace?.workspaceId) {
			workspaceId = workspaces.activeWorkspace.workspaceId;
		} else if (workspaces?.workspaces && workspaces.workspaces.length > 0) {
			// Fallback: use first workspace
			workspaceId = workspaces.workspaces[0].workspaceId;
		}

		if (!workspaceId) {
			errorMessage = 'Workspace not available. Please refresh the page.';
			console.error('handleSkip: No workspace ID available', { workspaces });
			return;
		}

		if (!convexClient) {
			errorMessage = 'Client not available. Please refresh the page.';
			console.error('handleSkip: convexClient is null');
			return;
		}

		if (!data.sessionId) {
			errorMessage = 'Session not available. Please refresh the page.';
			console.error('handleSkip: sessionId is missing', { data });
			return;
		}

		isCompleting = true;
		errorMessage = null;

		try {
			console.log('Calling updateOnboardingStep mutation...', {
				sessionId: data.sessionId,
				workspaceId,
				step: 'team_invited'
			});

			// Mark team_invited step as skipped (optional step)
			// We mark it as completed even if skipped, since it's optional
			await convexClient.mutation(api.features.onboarding.index.updateOnboardingStep, {
				sessionId: data.sessionId,
				workspaceId: workspaceId as any,
				step: 'team_invited',
				completed: true
			});

			console.log('Mutation successful, invalidating and redirecting...');
			// Invalidate all data to refresh server load functions
			await invalidateAll();
			// Wait a moment for data to refresh
			await new Promise((resolve) => setTimeout(resolve, 200));
			// Move to completion screen
			await goto(resolveRoute('/onboarding/complete'), { invalidateAll: true });
		} catch (error) {
			console.error('Failed to skip invite step:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to skip step';
			// Still redirect even if update fails (optional step)
			console.log('Redirecting anyway (optional step)...');
			await goto(resolveRoute('/onboarding/complete'), { invalidateAll: true });
		} finally {
			isCompleting = false;
		}
	}
</script>

<div class="border-base bg-surface rounded-card p-card-padding border">
	<div class="space-y-6">
		<!-- Header -->
		<div>
			<h1 class="text-primary text-2xl font-semibold">Invite Your Team</h1>
			<p class="text-secondary mt-2 text-sm">
				Team invitations are coming soon! For now, you can skip this step and invite people later
				from your workspace settings.
			</p>
		</div>

		<!-- Coming Soon -->
		<div class="bg-elevated rounded-md p-6 text-center">
			<div class="text-6xl">📨</div>
			<h3 class="text-primary mt-4 font-medium">Coming Soon</h3>
			<p class="text-secondary mt-2 text-sm">
				We're building a great team invitation experience. You'll be able to invite members and
				manage permissions right here.
			</p>
		</div>

		{#if errorMessage}
			<div
				class="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
			>
				{errorMessage}
			</div>
		{/if}

		<!-- Actions -->
		<div class="flex items-center justify-between">
			<button
				type="button"
				onclick={() => goto(resolveRoute('/onboarding/circle'))}
				disabled={isCompleting}
				class="text-secondary hover:text-primary text-sm disabled:opacity-50"
			>
				← Back
			</button>
			<button
				type="button"
				onclick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					console.log('Button clicked!', { isCompleting, event: e });
					handleSkip();
				}}
				disabled={isCompleting}
				class="text-on-solid bg-accent-primary px-button-x py-button-y rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
			>
				{isCompleting ? 'Skipping...' : 'Skip for Now'}
			</button>
		</div>
	</div>
</div>
