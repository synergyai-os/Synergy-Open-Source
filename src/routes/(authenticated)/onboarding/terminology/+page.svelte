<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolveRoute } from '$lib/utils/navigation';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import { useConvexClient } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { browser } from '$app/environment';

	let { data } = $props();

	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const convexClient = browser ? useConvexClient() : null;
	const getSessionId = () => data.sessionId;

	// Terminology presets
	const PRESETS = {
		holacracy: {
			name: 'Holacracy (Default)',
			circle: 'Circle',
			circleLead: 'Circle Lead',
			facilitator: 'Facilitator',
			secretary: 'Secretary',
			tension: 'Tension',
			proposal: 'Proposal'
		},
		traditional: {
			name: 'Traditional',
			circle: 'Department',
			circleLead: 'Director',
			facilitator: 'Facilitator',
			secretary: 'Secretary',
			tension: 'Issue',
			proposal: 'Proposal'
		},
		agile: {
			name: 'Agile',
			circle: 'Squad',
			circleLead: 'Lead',
			facilitator: 'Scrum Master',
			secretary: 'Secretary',
			tension: 'Impediment',
			proposal: 'Proposal'
		},
		flat: {
			name: 'Flat',
			circle: 'Team',
			circleLead: 'Coordinator',
			facilitator: 'Facilitator',
			secretary: 'Secretary',
			tension: 'Opportunity',
			proposal: 'Proposal'
		}
	};

	// State
	let selectedPreset = $state<keyof typeof PRESETS>('holacracy');
	let customTerms = $state({
		circle: PRESETS.holacracy.circle,
		circleLead: PRESETS.holacracy.circleLead,
		facilitator: PRESETS.holacracy.facilitator,
		secretary: PRESETS.holacracy.secretary,
		tension: PRESETS.holacracy.tension,
		proposal: PRESETS.holacracy.proposal
	});
	let isSaving = $state(false);
	let errorMessage = $state<string | null>(null);

	// Apply preset
	function applyPreset(preset: keyof typeof PRESETS) {
		selectedPreset = preset;
		const presetData = PRESETS[preset];
		customTerms = {
			circle: presetData.circle,
			circleLead: presetData.circleLead,
			facilitator: presetData.facilitator,
			secretary: presetData.secretary,
			tension: presetData.tension,
			proposal: presetData.proposal
		};
	}

	async function handleContinue() {
		if (!workspaces?.activeWorkspace || !convexClient) return;

		const sessionId = getSessionId();
		if (!sessionId) {
			errorMessage = 'Session not available';
			return;
		}

		isSaving = true;
		errorMessage = null;

		try {
			// Save terminology
			await convexClient.mutation(api.core.workspaces.index.updateDisplayNames, {
				sessionId,
				workspaceId: workspaces.activeWorkspace.workspaceId as Id<'workspaces'>,
				displayNames: customTerms
			});

			// Mark terminology step as completed
			await convexClient.mutation(api.features.onboarding.index.updateOnboardingStep, {
				sessionId,
				workspaceId: workspaces.activeWorkspace.workspaceId as Id<'workspaces'>,
				step: 'terminology_customized',
				completed: true
			});

			// Proceed to circle creation
			goto(resolveRoute('/onboarding/circle'));
		} catch (error) {
			console.error('Failed to save terminology:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to save terminology';
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="border-base bg-surface rounded-card p-card-padding border">
	<div class="space-y-6">
		<!-- Header -->
		<div>
			<h1 class="text-primary text-2xl font-semibold">Customize Your Terminology</h1>
			<p class="text-secondary mt-2 text-sm">
				Choose terms that match your organization's language. You can change these anytime in
				settings.
			</p>
		</div>

		<!-- Presets -->
		<div>
			<div class="text-primary mb-2 block text-sm font-medium">Quick Presets</div>
			<div class="grid grid-cols-2 gap-2">
				{#each Object.entries(PRESETS) as [key, preset] (key)}
					<button
						type="button"
						onclick={() => applyPreset(key as keyof typeof PRESETS)}
						class="border-base hover:border-accent-primary py-nav-item rounded-md border px-3 text-left text-sm transition-colors {selectedPreset ===
						key
							? 'border-accent-primary bg-accent-primary/10'
							: 'bg-surface'}"
					>
						{preset.name}
					</button>
				{/each}
			</div>
		</div>

		<!-- Custom Terms -->
		<div class="space-y-4">
			<div>
				<label for="circle-input" class="text-primary mb-1 block text-sm font-medium">
					Circle <span class="text-secondary">(default: Circle)</span>
				</label>
				<input
					id="circle-input"
					type="text"
					bind:value={customTerms.circle}
					class="border-base py-nav-item bg-elevated text-primary focus:border-accent-primary w-full rounded-md border px-3 text-sm focus:outline-none"
					placeholder="Circle"
				/>
			</div>

			<div>
				<label for="circle-lead-input" class="text-primary mb-1 block text-sm font-medium">
					Circle Lead <span class="text-secondary">(default: Circle Lead)</span>
				</label>
				<input
					id="circle-lead-input"
					type="text"
					bind:value={customTerms.circleLead}
					class="border-base py-nav-item bg-elevated text-primary focus:border-accent-primary w-full rounded-md border px-3 text-sm focus:outline-none"
					placeholder="Circle Lead"
				/>
			</div>

			<div>
				<label for="facilitator-input" class="text-primary mb-1 block text-sm font-medium">
					Facilitator <span class="text-secondary">(default: Facilitator)</span>
				</label>
				<input
					id="facilitator-input"
					type="text"
					bind:value={customTerms.facilitator}
					class="border-base py-nav-item bg-elevated text-primary focus:border-accent-primary w-full rounded-md border px-3 text-sm focus:outline-none"
					placeholder="Facilitator"
				/>
			</div>

			<div>
				<label for="secretary-input" class="text-primary mb-1 block text-sm font-medium">
					Secretary <span class="text-secondary">(default: Secretary)</span>
				</label>
				<input
					id="secretary-input"
					type="text"
					bind:value={customTerms.secretary}
					class="border-base py-nav-item bg-elevated text-primary focus:border-accent-primary w-full rounded-md border px-3 text-sm focus:outline-none"
					placeholder="Secretary"
				/>
			</div>

			<div>
				<label for="tension-input" class="text-primary mb-1 block text-sm font-medium">
					Tension <span class="text-secondary">(default: Tension)</span>
				</label>
				<input
					id="tension-input"
					type="text"
					bind:value={customTerms.tension}
					class="border-base py-nav-item bg-elevated text-primary focus:border-accent-primary w-full rounded-md border px-3 text-sm focus:outline-none"
					placeholder="Tension"
				/>
			</div>

			<div>
				<label for="proposal-input" class="text-primary mb-1 block text-sm font-medium">
					Proposal <span class="text-secondary">(default: Proposal)</span>
				</label>
				<input
					id="proposal-input"
					type="text"
					bind:value={customTerms.proposal}
					class="border-base py-nav-item bg-elevated text-primary focus:border-accent-primary w-full rounded-md border px-3 text-sm focus:outline-none"
					placeholder="Proposal"
				/>
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
		<div class="flex items-center justify-end gap-2">
			<button
				type="button"
				onclick={handleContinue}
				disabled={isSaving}
				class="text-on-solid bg-accent-primary px-button-x py-button-y rounded-md text-sm font-medium disabled:opacity-50"
			>
				{isSaving ? 'Saving...' : 'Continue'}
			</button>
		</div>
	</div>
</div>
