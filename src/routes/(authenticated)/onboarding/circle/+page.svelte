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

	import { LEAD_AUTHORITY } from '$lib/infrastructure/organizational-model/constants';

	// Lead authority options with descriptions
	const LEAD_AUTHORITIES = [
		{
			value: LEAD_AUTHORITY.DECIDES,
			label: 'Leader Decides',
			description: 'Traditional management - the leader has final say on decisions',
			icon: '👔',
			rootEligible: true
		},
		{
			value: LEAD_AUTHORITY.FACILITATES,
			label: 'Team Decides Together',
			description: 'Collaborative - the team makes decisions together with the leader facilitating',
			icon: '🤝',
			rootEligible: true
		},
		{
			value: LEAD_AUTHORITY.CONVENES,
			label: 'Advisory Only',
			description: 'Community of practice - no decision authority, used for knowledge sharing',
			icon: '🌱',
			rootEligible: false
		}
	];

	import type { LeadAuthority } from '$lib/infrastructure/organizational-model/constants';

	// State
	let circleName = $state('');
	let purpose = $state('');
	let leadAuthority = $state<LeadAuthority>(LEAD_AUTHORITY.DECIDES);
	let isCreating = $state(false);
	let _isLoading = $state(false);
	let errorMessage = $state<string | null>(null);

	// Auto-populate circle name with workspace name on mount
	$effect(() => {
		if (workspaces?.activeWorkspace && !circleName.trim()) {
			circleName = workspaces.activeWorkspace.name;
		}
	});

	// Computed: Can submit form?
	const canSubmit = $derived(() => {
		return (
			!isCreating &&
			!!circleName.trim() &&
			!!purpose.trim() &&
			!!leadAuthority &&
			leadAuthority !== LEAD_AUTHORITY.CONVENES // Convenes cannot be root circle
		);
	});

	async function handleContinue() {
		// Validation: Block if form is invalid
		if (!canSubmit()) {
			if (!circleName.trim()) {
				errorMessage = 'Organization name is required';
			} else if (!purpose.trim()) {
				errorMessage = 'Purpose is required';
			} else if (!leadAuthority || leadAuthority === LEAD_AUTHORITY.CONVENES) {
				errorMessage =
					'Please select a valid decision-making model (Advisory Only cannot be used for top-level organization)';
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
				purpose: purpose.trim() || undefined,
				leadAuthority: leadAuthority
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
			<h1 class="text-primary text-2xl font-semibold">Set Up Your Organization</h1>
			<p class="text-secondary mt-2 text-sm">
				Define your organization's purpose and how decisions will be made at the top level.
			</p>
		</div>

		<!-- Organization Name -->
		<div>
			<label class="text-primary mb-2 block text-sm font-medium">Organization Name</label>
			<input
				type="text"
				bind:value={circleName}
				placeholder="e.g., General Circle, Core Team, Leadership"
				class="border-base py-nav-item bg-elevated text-primary focus:border-accent-primary w-full rounded-md border px-3 text-sm focus:outline-none"
				required
			/>
			<p class="text-secondary mt-1 text-xs">
				This is your top-level organizational unit. You can use the same name as your workspace or
				choose something different.
			</p>
		</div>

		<!-- Purpose -->
		<div>
			<label class="text-primary mb-2 block text-sm font-medium"> Purpose </label>
			<textarea
				bind:value={purpose}
				placeholder="e.g., Build innovative software that empowers teams to work better together"
				rows="3"
				class="border-base py-nav-item bg-elevated text-primary focus:border-accent-primary w-full resize-none rounded-md border px-3 text-sm focus:outline-none"
				required
			></textarea>
			<p class="text-secondary mt-1 text-xs">
				Your organization's mission or reason for existing. This helps align everyone on what you're
				working toward. <strong class="text-primary">Note: You can change this at any time.</strong>
			</p>
		</div>

		<!-- Lead Authority Selection -->
		<div>
			<label class="text-primary mb-2 block text-sm font-medium">Decision-Making Model</label>
			<p class="text-secondary mb-3 text-xs">
				How will decisions be made at the top level of your organization? You can change this later,
				and sub-circles can use different models.
			</p>

			<div class="space-y-2">
				{#each LEAD_AUTHORITIES as authority (authority.value)}
					{#if authority.rootEligible}
						<button
							type="button"
							onclick={() => (leadAuthority = authority.value)}
							class="w-full cursor-pointer rounded-md p-3 text-left transition-all duration-200 {leadAuthority ===
							authority.value
								? 'border-focus bg-selected border-2'
								: 'border-default bg-surface hover:bg-hover hover:border-focus border'}"
						>
							<div class="flex items-start gap-3">
								<span class="text-2xl">{authority.icon}</span>
								<div class="flex-1">
									<div class="text-primary flex items-center gap-2 text-sm font-medium">
										{authority.label}
										{#if leadAuthority === authority.value}
											<Icon type="check" size="sm" color="primary" />
										{/if}
									</div>
									<p class="text-secondary mt-1 text-xs">{authority.description}</p>
								</div>
							</div>
						</button>
					{/if}
				{/each}
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
				{isCreating ? 'Setting up...' : 'Continue'}
			</button>
		</div>
	</div>
</div>
