<script lang="ts">
	import { getContext } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { resolveRoute } from '$lib/utils/navigation';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { browser } from '$app/environment';
	import { FormInput, Button } from '$lib/components/atoms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const convexClient = browser ? useConvexClient() : null;

	let isCompleting = $state(false);
	let errorMessage = $state<string | null>(null);

	// Design team invites (5 slots)
	let invites = $state([
		{ name: '', email: '' },
		{ name: '', email: '' },
		{ name: '', email: '' },
		{ name: '', email: '' },
		{ name: '', email: '' }
	]);

	async function handleContinue() {
		if (isCompleting) return;

		// Get workspace ID
		let workspaceId: string | undefined;
		if (workspaces?.activeWorkspace?.workspaceId) {
			workspaceId = workspaces.activeWorkspace.workspaceId;
		} else if (workspaces?.workspaces && workspaces.workspaces.length > 0) {
			workspaceId = workspaces.workspaces[0].workspaceId;
		}

		if (!workspaceId) {
			errorMessage = 'Workspace not available. Please refresh the page.';
			return;
		}

		if (!convexClient) {
			errorMessage = 'Client not available. Please refresh the page.';
			return;
		}

		if (!data.sessionId) {
			errorMessage = 'Session not available. Please refresh the page.';
			return;
		}

		isCompleting = true;
		errorMessage = null;

		try {
			// Mark team_invited step as completed (optional step)
			await convexClient.mutation(api.features.onboarding.index.updateOnboardingStep, {
				sessionId: data.sessionId,
				workspaceId: workspaceId as Id<'workspaces'>,
				step: 'team_invited',
				completed: true
			});

			// Invalidate and move to next step
			await invalidateAll();
			await new Promise((resolve) => setTimeout(resolve, 200));
			await goto(resolveRoute('/onboarding/terminology'), { invalidateAll: true });
		} catch (error) {
			console.error('Failed to continue:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to continue';
			// Still redirect (optional step)
			await goto(resolveRoute('/onboarding/terminology'), { invalidateAll: true });
		} finally {
			isCompleting = false;
		}
	}
</script>

<div class="border-base bg-surface rounded-card p-card-padding border">
	<div class="gap-content-sectionGap flex flex-col">
		<!-- Header -->
		<div>
			<h1 class="text-primary text-2xl font-semibold">Your Workspace is in Design Mode</h1>
			<p class="text-secondary mt-2 text-sm">
				Before inviting everyone, bring in 2–5 key people to help design your workspace. Together,
				you'll build the structure and customize it to fit your organization.
			</p>
		</div>

		<!-- Two-Phase Cards -->
		<div class="gap-content-subsectionGap flex flex-col">
			<!-- Design Phase (Current) -->
			<div class="bg-elevated rounded-md p-4">
				<div class="gap-content-subsectionGap flex flex-col">
					<div class="flex items-start gap-3">
						<div class="text-2xl">👥</div>
						<div class="flex-1">
							<h3 class="text-primary font-medium">Design Phase (You are here)</h3>
							<p class="text-secondary mt-1 text-sm">
								Build your org structure, define roles, and customize terminology with a small core
								team.
							</p>
						</div>
					</div>

					<!-- Coming Soon Notice -->
					<div class="bg-surface border-brand rounded-md border-l-4 p-3">
						<p class="text-secondary text-sm">
							<span class="font-medium">Coming soon:</span> Invite your design team directly from this
							page. For now, you can invite them later from workspace settings.
						</p>
					</div>

					<!-- Invite Inputs (Disabled for now) -->
					<div class="gap-form-section-gap flex flex-col opacity-50">
						{#each invites as invite, i (i)}
							<div class="grid grid-cols-2 gap-3">
								<FormInput placeholder="Name" value={invite.name} disabled={true} size="sm" />
								<FormInput
									type="email"
									placeholder="Email address"
									value={invite.email}
									disabled={true}
									size="sm"
								/>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Launch Phase (Next) -->
			<div class="border-base rounded-md border p-4">
				<div class="flex items-start gap-3">
					<div class="text-2xl">🚀</div>
					<div class="flex-1">
						<h3 class="text-primary font-medium">Launch Phase (Next step)</h3>
						<p class="text-secondary mt-1 text-sm">
							Once your workspace is ready, invite everyone with a single link from workspace
							settings.
						</p>
					</div>
				</div>
			</div>
		</div>

		{#if errorMessage}
			<div class="bg-status-errorBg text-status-error rounded-md p-3 text-sm">
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
			<Button variant="primary" size="md" onclick={handleContinue} disabled={isCompleting}>
				{isCompleting ? 'Continuing...' : 'Continue Setup'}
			</Button>
		</div>
	</div>
</div>
