<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$lib/utils/navigation';
	import { parseConvexError } from '$lib/utils/parseConvexError';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';
	import Icon from '$lib/components/atoms/Icon.svelte';

	let { data }: { data: PageData } = $props();

	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const convexClient = browser ? useConvexClient() : null;

	import { CIRCLE_TYPES as CIRCLE_TYPE_CONSTANTS } from '$lib/infrastructure/organizational-model/constants';

	// Circle type options with descriptions
	const CIRCLE_TYPES = [
		{
			value: CIRCLE_TYPE_CONSTANTS.HIERARCHY,
			label: 'Hierarchy',
			description: 'Traditional: manager decides directly',
			icon: '👑',
			rootEligible: true
		},
		{
			value: CIRCLE_TYPE_CONSTANTS.EMPOWERED_TEAM,
			label: 'Empowered Team',
			description: 'Agile: team decides by consent, lead breaks ties',
			icon: '🤝',
			rootEligible: true
		},
		{
			value: CIRCLE_TYPE_CONSTANTS.GUILD,
			label: 'Guild',
			description: 'Coordination only: advisory, no binding authority',
			icon: '🌱',
			rootEligible: false
		},
		{
			value: CIRCLE_TYPE_CONSTANTS.HYBRID,
			label: 'Hybrid',
			description: 'Mixed: manager uses consent process for decisions',
			icon: '⚖️',
			rootEligible: true
		}
	];

	import type { CircleType } from '$lib/infrastructure/organizational-model/constants';

	// State
	let circleName = $state('');
	let circleType = $state<CircleType>(CIRCLE_TYPE_CONSTANTS.HIERARCHY);
	let isCreating = $state(false);
	let isLoading = $state(false);
	let errorMessage = $state<string | null>(null);

	// Computed: Can submit form?
	const canSubmit = $derived(() => {
		return (
			!isCreating &&
			!!circleName.trim() &&
			!!circleType &&
			circleType !== CIRCLE_TYPE_CONSTANTS.GUILD // Guild cannot be root circle
		);
	});

	async function handleContinue() {
		// Validation: Block if form is invalid
		if (!canSubmit()) {
			if (!circleName.trim()) {
				errorMessage = 'Circle name is required';
			} else if (!circleType || circleType === CIRCLE_TYPE_CONSTANTS.GUILD) {
				errorMessage = 'Please select a valid circle type (Guild cannot be used as root circle)';
			}
			return;
		}

		const sessionId = data.sessionId;
		const activeWorkspace = workspaces?.activeWorkspace;

		if (!activeWorkspace || !convexClient || !sessionId) {
			errorMessage = 'Session or workspace not available';
			return;
		}

		isCreating = true;
		errorMessage = null;

		try {
			// Create root circle with user's choices
			// This triggers workspace seeding (custom fields, meeting templates, roles)
			await convexClient.mutation(api.core.circles.index.create, {
				sessionId,
				workspaceId: activeWorkspace.workspaceId,
				name: circleName.trim(),
				circleType: circleType
			});

			// Mark circle creation steps as completed
			await convexClient.mutation(api.features.onboarding.index.updateOnboardingStep, {
				sessionId,
				workspaceId: activeWorkspace.workspaceId,
				step: 'root_circle_created',
				completed: true
			});

			await convexClient.mutation(api.features.onboarding.index.updateOnboardingStep, {
				sessionId,
				workspaceId: activeWorkspace.workspaceId,
				step: 'governance_chosen',
				completed: true
			});

			// Only redirect after success
			goto(resolveRoute('/onboarding/invite'));
		} catch (error) {
			console.error('Failed to create circle:', error);
			errorMessage = parseConvexError(error);
		} finally {
			isCreating = false;
		}
	}
</script>

<div class="border-base bg-surface rounded-card p-card-padding border">
	<div class="space-y-6">
		<!-- Header -->
		<div>
			<h1 class="text-primary text-2xl font-semibold">Configure Your Root Circle</h1>
			<p class="text-secondary mt-2 text-sm">
				Every organization starts with a root circle. Name it and choose how decisions will be made.
			</p>
		</div>

		<!-- Circle Name -->
		<div>
			<label class="text-primary mb-2 block text-sm font-medium">Circle Name</label>
			<input
				type="text"
				bind:value={circleName}
				placeholder="e.g., General Circle, Core Team, Leadership"
				class="border-base py-nav-item bg-elevated text-primary focus:border-accent-primary w-full rounded-md border px-3 text-sm focus:outline-none"
				required
			/>
		</div>

		<!-- Circle Type Selection -->
		<div>
			<label class="text-primary mb-2 block text-sm font-medium">Circle Type</label>
			<p class="text-secondary mb-3 text-xs">
				Choose how this circle will operate. Each sub-circle can have its own type, and you can
				change this later.
			</p>

			<div class="space-y-2">
				{#each CIRCLE_TYPES as type (type.value)}
					{#if type.rootEligible}
						<button
							type="button"
							onclick={() => (circleType = type.value)}
							class="w-full cursor-pointer rounded-md p-3 text-left transition-all duration-200 {circleType ===
							type.value
								? 'border-focus bg-selected border-2'
								: 'border-default bg-surface hover:bg-hover hover:border-focus border'}"
						>
							<div class="flex items-start gap-3">
								<span class="text-2xl">{type.icon}</span>
								<div class="flex-1">
									<div class="text-primary flex items-center gap-2 text-sm font-medium">
										{type.label}
										{#if circleType === type.value}
											<Icon type="check" size="sm" color="primary" />
										{/if}
									</div>
									<p class="text-secondary mt-1 text-xs">{type.description}</p>
								</div>
							</div>
						</button>
					{/if}
				{/each}
			</div>

			<!-- Info note -->
			<div class="bg-elevated mt-3 rounded-md p-3 text-xs">
				<p class="text-secondary">
					<strong class="text-primary">Note:</strong> Guild circles cannot be used as root circles because
					they're advisory-only. Each sub-circle you create can use any type, including Guild.
				</p>
			</div>
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
				onclick={() => goto(resolveRoute('/onboarding/terminology'))}
				class="text-secondary hover:text-primary text-sm"
			>
				← Back
			</button>
			<button
				type="button"
				onclick={handleContinue}
				disabled={isCreating || !canSubmit()}
				class="text-on-solid bg-accent-primary px-button-x py-button-y rounded-md text-sm font-medium disabled:opacity-50"
			>
				{isCreating ? 'Creating...' : 'Create Circle'}
			</button>
		</div>
	</div>
</div>
