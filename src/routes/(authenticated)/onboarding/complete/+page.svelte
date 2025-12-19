<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$lib/utils/navigation';
	import { parseConvexError } from '$lib/utils/parseConvexError';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const convexClient = browser ? useConvexClient() : null;

	let isCompleting = $state(false);
	let isLoading = $state(true);
	let completionError = $state<string | null>(null);
	let validationError = $state<string | null>(null);
	let canComplete = $state(false);

	// Track active workspace reactively so effect re-runs when it becomes available
	const activeWorkspace = $derived(workspaces?.activeWorkspace);

	// Validate prerequisites before allowing completion
	$effect(() => {
		// Check if dependencies are ready
		if (!browser || !convexClient || !activeWorkspace || !data.sessionId) {
			// Dependencies not ready yet - set loading to false so we can show appropriate state
			// The effect will re-run when activeWorkspace becomes available
			isLoading = false;
			if (!activeWorkspace && workspaces) {
				// Workspaces context exists but activeWorkspace not set yet
				validationError = 'Workspace not loaded yet. Please wait...';
			} else if (!workspaces) {
				validationError = 'Workspaces context not available. Please refresh the page.';
			}
			return;
		}

		// All dependencies ready - run validation
		async function validatePrerequisites() {
			try {
				isLoading = true;
				validationError = null;

				// Check that root circle exists and is properly configured
				const circles = await convexClient.query(api.core.circles.index.list, {
					sessionId: data.sessionId,
					workspaceId: activeWorkspace.workspaceId
				});

				const rootCircle = circles.find((c) => !c.parentCircleId);
				if (!rootCircle) {
					validationError = 'Root circle not found. Please complete the circle setup step first.';
					canComplete = false;
					return;
				}

				if (!rootCircle.name || !rootCircle.name.trim()) {
					validationError =
						'Root circle must have a name. Please complete the circle setup step first.';
					canComplete = false;
					return;
				}

				if (!rootCircle.circleType) {
					validationError =
						'Root circle must have a circle type selected. Please complete the circle setup step first.';
					canComplete = false;
					return;
				}

				// All prerequisites met
				canComplete = true;
			} catch (error) {
				console.error('Failed to validate prerequisites:', error);
				validationError = parseConvexError(error);
				canComplete = false;
			} finally {
				isLoading = false;
			}
		}

		validatePrerequisites();
	});

	async function completeSetup() {
		if (!canComplete || !activeWorkspace || !convexClient) {
			if (validationError) {
				completionError = validationError;
			} else {
				completionError = 'Please complete all previous steps before finishing setup.';
			}
			return;
		}

		isCompleting = true;
		completionError = null;

		try {
			// Complete workspace setup
			await convexClient.mutation(api.features.onboarding.index.completeWorkspaceSetup, {
				sessionId: data.sessionId,
				workspaceId: activeWorkspace.workspaceId
			});

			// Wait a moment for the mutation to complete
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Redirect to workspace
			const slug = activeWorkspace.slug;
			if (slug) {
				goto(resolveRoute(`/w/${slug}/chart`));
			}
		} catch (error) {
			console.error('Failed to complete setup:', error);
			completionError = parseConvexError(error);
			isCompleting = false;
		}
	}

	// Load on mount but don't auto-complete - let user click button
	// This prevents errors from auto-running and gives user control
	onMount(() => {
		// Page loaded, ready for user to complete setup
	});
</script>

<div class="border-base bg-surface rounded-card p-card-padding border">
	<div class="space-y-6">
		{#if isCompleting}
			<!-- Completing State -->
			<div class="text-center">
				<div class="mb-header">
					<div
						class="bg-accent-primary/10 border-accent-primary text-accent-primary mx-auto flex size-20 items-center justify-center rounded-full border-4"
					>
						<svg class="size-icon-xl animate-spin" fill="none" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					</div>
				</div>
				<h1 class="text-primary mb-2 text-2xl font-semibold">Setting Up Your Workspace...</h1>
				<p class="text-secondary text-sm">
					We're finishing the setup process. You'll be redirected to your workspace in a moment.
				</p>
			</div>
		{:else if completionError}
			<!-- Error State -->
			<div class="text-center">
				<div class="mb-header">
					<div
						class="mx-auto flex size-20 items-center justify-center rounded-full border-4 border-red-500 bg-red-50 text-red-500 dark:bg-red-900/20"
					>
						<svg class="size-icon-xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</div>
				</div>
				<h1 class="text-primary mb-2 text-2xl font-semibold">Setup Failed</h1>
				<p class="text-secondary mb-4 text-sm">{completionError}</p>
				<button
					type="button"
					onclick={completeSetup}
					class="text-on-solid bg-accent-primary px-button-x py-button-y rounded-md text-sm font-medium"
				>
					Try Again
				</button>
			</div>
		{:else if isLoading}
			<!-- Loading State -->
			<div class="text-center">
				<div class="mb-header">
					<div
						class="bg-accent-primary/10 border-accent-primary text-accent-primary mx-auto flex size-20 items-center justify-center rounded-full border-4"
					>
						<svg class="size-icon-xl animate-spin" fill="none" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					</div>
				</div>
				<h1 class="text-primary mb-2 text-2xl font-semibold">Validating Setup...</h1>
				<p class="text-secondary text-sm">Checking that all steps are completed...</p>
			</div>
		{:else if validationError}
			<!-- Validation Error State -->
			<div class="text-center">
				<div class="mb-header">
					<div
						class="mx-auto flex size-20 items-center justify-center rounded-full border-4 border-yellow-500 bg-yellow-50 text-yellow-500 dark:bg-yellow-900/20"
					>
						<svg class="size-icon-xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
				</div>
				<h1 class="text-primary mb-2 text-2xl font-semibold">Setup Incomplete</h1>
				<p class="text-secondary mb-4 text-sm">{validationError}</p>
				<div class="flex justify-center gap-2">
					<button
						type="button"
						onclick={() => goto(resolveRoute('/onboarding/circle'))}
						class="text-on-solid bg-accent-primary px-button-x py-button-y rounded-md text-sm font-medium"
					>
						Go to Circle Setup
					</button>
				</div>
			</div>
		{:else}
			<!-- Initial State - User clicks to complete -->
			<div class="text-center">
				<div class="mb-header">
					<div
						class="bg-accent-primary/10 border-accent-primary text-accent-primary mx-auto flex size-20 items-center justify-center rounded-full border-4"
					>
						<svg class="size-icon-xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
				</div>
				<h1 class="text-primary mb-2 text-2xl font-semibold">You're Almost Done!</h1>
				<p class="text-secondary mb-6 text-sm">
					Complete your workspace setup to start using SynergyOS.
				</p>
				<button
					type="button"
					onclick={completeSetup}
					disabled={isCompleting || !canComplete}
					class="text-on-solid bg-accent-primary px-button-x py-button-y rounded-md text-sm font-medium disabled:opacity-50"
				>
					{isCompleting ? 'Completing...' : 'Complete Setup'}
				</button>
			</div>
		{/if}
	</div>
</div>
