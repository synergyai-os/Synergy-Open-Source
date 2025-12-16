<script lang="ts">
	import { browser } from '$app/environment';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import type { CircleSummary } from '$lib/infrastructure/organizational-model';
	import {
		CIRCLE_TYPES,
		DECISION_MODELS,
		type CircleType,
		type DecisionModel
	} from '$lib/infrastructure/organizational-model/constants';
	import FormSelect from '$lib/components/atoms/FormSelect.svelte';
	import Text from '$lib/components/atoms/Text.svelte';

	type Props = {
		circle: CircleSummary;
		sessionId: string;
		canEdit: boolean;
	};

	let { circle, sessionId, canEdit }: Props = $props();

	const convexClient = browser ? useConvexClient() : null;

	const circleType = $derived((circle.circleType ?? CIRCLE_TYPES.HIERARCHY) as CircleType);

	// All available decision model options
	const allOptions = [
		{
			value: DECISION_MODELS.MANAGER_DECIDES,
			label: 'Manager Decides',
			description: 'Single approver (manager/lead)'
		},
		{
			value: DECISION_MODELS.TEAM_CONSENSUS,
			label: 'Team Consensus',
			description: 'All members must agree'
		},
		{ value: DECISION_MODELS.CONSENT, label: 'Consent', description: 'No valid objections (IDM)' },
		{
			value: DECISION_MODELS.COORDINATION_ONLY,
			label: 'Coordination Only',
			description: 'Guild: must approve in home circle'
		}
	] as const;

	// Filter options based on circle type
	const availableOptions = $derived.by(() => {
		switch (circleType) {
			case CIRCLE_TYPES.HIERARCHY:
				return allOptions.filter((o) => o.value === DECISION_MODELS.MANAGER_DECIDES);
			case CIRCLE_TYPES.EMPOWERED_TEAM:
				return allOptions.filter((o) => o.value !== DECISION_MODELS.COORDINATION_ONLY);
			case CIRCLE_TYPES.GUILD:
				return allOptions.filter((o) => o.value === DECISION_MODELS.COORDINATION_ONLY);
			case CIRCLE_TYPES.HYBRID:
				return allOptions.filter((o) => o.value !== DECISION_MODELS.COORDINATION_ONLY);
			default:
				return allOptions;
		}
	});

	// Get a valid value for the current options
	function getValidValue(
		targetValue: string | undefined,
		options: typeof availableOptions
	): string {
		const value = (targetValue ?? DECISION_MODELS.MANAGER_DECIDES) as string;
		return options.some((o) => o.value === value)
			? value
			: (options[0]?.value ?? DECISION_MODELS.MANAGER_DECIDES);
	}

	// Initialize state - will be set properly in effect
	let decisionModelValue = $state<string>(DECISION_MODELS.MANAGER_DECIDES);

	// Track the circle ID and decisionModel to detect external changes
	let lastCircleId = $state<string | null>(null);
	let lastDecisionModel = $state<string | null>(null);
	let lastCircleType = $state<string | null>(null);

	// Track if we're currently updating from user input (prevents sync effect from interfering)
	let isUserUpdating = $state(false);

	// Sync with circle prop changes (only when circle changes, decisionModel changes externally, or circleType changes)
	$effect(() => {
		// Don't sync if user is currently updating
		if (isUserUpdating) {
			return;
		}

		const currentCircleId = circle.circleId;
		const currentDecisionModel = circle.decisionModel ?? DECISION_MODELS.MANAGER_DECIDES;
		const currentCircleType = circleType;
		const currentValue = decisionModelValue;
		const currentOptions = availableOptions;

		// Initialize on first run or if we switched to a different circle
		if (lastCircleId === null || currentCircleId !== lastCircleId) {
			lastCircleId = currentCircleId;
			lastDecisionModel = currentDecisionModel;
			lastCircleType = currentCircleType;
			const validValue = getValidValue(currentDecisionModel, currentOptions);
			decisionModelValue = validValue;
			return;
		}

		// If circle type changed, ensure current value is still valid for new options
		if (currentCircleType !== lastCircleType) {
			lastCircleType = currentCircleType;
			if (!currentOptions.some((o) => o.value === currentValue)) {
				// Current value is invalid for new options, use the circle's decisionModel or first available option
				const validValue = getValidValue(currentDecisionModel, currentOptions);
				decisionModelValue = validValue;
			}
			return;
		}

		// If the circle's decisionModel changed externally (not from our mutation), sync it
		// But only if our current value doesn't match the external value
		if (currentDecisionModel !== lastDecisionModel) {
			lastDecisionModel = currentDecisionModel;
			// Only sync if the external value is different from our current value
			// This prevents interfering with user input while still syncing external changes
			if (currentDecisionModel !== currentValue) {
				const validValue = getValidValue(currentDecisionModel, currentOptions);
				decisionModelValue = validValue;
			}
		}
	});

	const selectedOption = $derived(
		availableOptions.find((o) => o.value === decisionModelValue) ?? availableOptions[0]
	);

	// Watch for changes and update backend
	$effect(() => {
		if (
			!convexClient ||
			!sessionId ||
			!canEdit ||
			decisionModelValue === (circle.decisionModel ?? DECISION_MODELS.MANAGER_DECIDES)
		) {
			return;
		}

		// Mark that we're updating from user input and update tracking immediately
		// This prevents the sync effect from resetting the value
		isUserUpdating = true;
		lastDecisionModel = decisionModelValue; // Update immediately to prevent sync

		convexClient
			.mutation(api.core.circles.index.updateInline, {
				sessionId,
				circleId: circle.circleId,
				updates: {
					decisionModel: decisionModelValue as CircleSummary['decisionModel']
				}
			})
			.then(() => {
				// Allow sync effect to run again after mutation completes
				// Small delay ensures backend update has propagated to reactive queries
				setTimeout(() => {
					isUserUpdating = false;
				}, 50);
			})
			.catch((error) => {
				// Revert on error
				decisionModelValue = circle.decisionModel ?? DECISION_MODELS.MANAGER_DECIDES;
				lastDecisionModel = circle.decisionModel ?? DECISION_MODELS.MANAGER_DECIDES;
				isUserUpdating = false;
				alert(error instanceof Error ? error.message : 'Failed to update decision model');
			});
	});
</script>

{#if canEdit}
	<div class="space-y-fieldGroup">
		<FormSelect
			id="decision-model-select"
			label="Decision Model"
			bind:value={decisionModelValue}
			options={availableOptions}
			disabled={!canEdit}
		/>
		{#if selectedOption}
			<Text variant="body" size="sm" color="secondary">
				{selectedOption.description}
			</Text>
		{/if}
	</div>
{:else}
	<div class="space-y-fieldGroup">
		<Text variant="label" color="secondary" class="mb-fieldGroup">Decision Model</Text>
		<Text variant="body" size="sm" color="primary">
			{selectedOption?.label ?? 'Manager Decides'}
		</Text>
		{#if selectedOption}
			<Text variant="body" size="sm" color="secondary">
				{selectedOption.description}
			</Text>
		{/if}
	</div>
{/if}
