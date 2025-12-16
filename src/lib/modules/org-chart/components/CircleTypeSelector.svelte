<script lang="ts">
	import { browser } from '$app/environment';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import type { CircleSummary } from '$lib/infrastructure/organizational-model';
	import FormSelect from '$lib/components/atoms/FormSelect.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
	import { toast } from '$lib/utils/toast';
	import {
		CIRCLE_TYPES,
		DEFAULT_CIRCLE_TYPE_LABELS,
		DEFAULT_CIRCLE_TYPE_DESCRIPTIONS,
		getLeadAuthorityLevel,
		getAuthorityUI,
		getLeadLabel,
		type CircleType
	} from '$lib/infrastructure/organizational-model/constants';

	type Props = {
		circle: CircleSummary;
		sessionId: string;
		canEdit: boolean;
	};

	let { circle, sessionId, canEdit }: Props = $props();

	const convexClient = browser ? useConvexClient() : null;

	const options = [
		{
			value: CIRCLE_TYPES.HIERARCHY,
			label: DEFAULT_CIRCLE_TYPE_LABELS[CIRCLE_TYPES.HIERARCHY],
			description: DEFAULT_CIRCLE_TYPE_DESCRIPTIONS[CIRCLE_TYPES.HIERARCHY]
		},
		{
			value: CIRCLE_TYPES.EMPOWERED_TEAM,
			label: DEFAULT_CIRCLE_TYPE_LABELS[CIRCLE_TYPES.EMPOWERED_TEAM],
			description: DEFAULT_CIRCLE_TYPE_DESCRIPTIONS[CIRCLE_TYPES.EMPOWERED_TEAM]
		},
		{
			value: CIRCLE_TYPES.GUILD,
			label: DEFAULT_CIRCLE_TYPE_LABELS[CIRCLE_TYPES.GUILD],
			description: DEFAULT_CIRCLE_TYPE_DESCRIPTIONS[CIRCLE_TYPES.GUILD]
		},
		{
			value: CIRCLE_TYPES.HYBRID,
			label: DEFAULT_CIRCLE_TYPE_LABELS[CIRCLE_TYPES.HYBRID],
			description: DEFAULT_CIRCLE_TYPE_DESCRIPTIONS[CIRCLE_TYPES.HYBRID]
		}
	];

	// Ensure value is always a valid option value - compute synchronously
	function getValidValue(targetValue: string | undefined): string {
		const value = (targetValue ?? CIRCLE_TYPES.HIERARCHY) as string;
		return options.some((o) => o.value === value) ? value : CIRCLE_TYPES.HIERARCHY;
	}

	let circleTypeValue = $state<string>(getValidValue(circle.circleType));

	// Track to detect external changes and prevent sync during user updates
	let lastCircleId = $state<string | null>(null);
	let lastCircleType = $state<string | null>(null);
	let isUserUpdating = $state(false);

	// Sync with circle prop changes (only when circle changes externally)
	$effect(() => {
		// Don't sync if user is currently updating
		if (isUserUpdating) {
			return;
		}

		const currentCircleId = circle.circleId;
		const currentCircleType = circle.circleType ?? 'hierarchy';
		const newValue = getValidValue(circle.circleType);

		// Initialize on first run or if we switched to a different circle
		if (lastCircleId === null || currentCircleId !== lastCircleId) {
			lastCircleId = currentCircleId;
			lastCircleType = currentCircleType;
			circleTypeValue = newValue;
			return;
		}

		// Only sync if the circle's circleType changed externally
		if (currentCircleType !== lastCircleType && circleTypeValue !== newValue) {
			lastCircleType = currentCircleType;
			circleTypeValue = newValue;
		}
	});

	const selectedOption = $derived(options.find((o) => o.value === circleTypeValue));

	// Watch for changes and update backend
	$effect(() => {
		if (
			!convexClient ||
			!sessionId ||
			!canEdit ||
			circleTypeValue === (circle.circleType ?? CIRCLE_TYPES.HIERARCHY)
		) {
			return;
		}

		// Mark that we're updating from user input and update tracking immediately
		// This prevents the sync effect from resetting the value
		isUserUpdating = true;
		lastCircleType = circleTypeValue; // Update immediately to prevent sync

		// Calculate authority change for notification
		const oldType = (circle.circleType ?? CIRCLE_TYPES.HIERARCHY) as CircleType;
		const newType = circleTypeValue as CircleType;
		const oldAuthority = getLeadAuthorityLevel(oldType);
		const newAuthority = getLeadAuthorityLevel(newType);

		convexClient
			.mutation(api.core.circles.index.updateInline, {
				sessionId,
				circleId: circle.circleId,
				updates: {
					circleType: circleTypeValue as CircleSummary['circleType']
				}
			})
			.then(() => {
				// Show authority change notification
				if (oldAuthority !== newAuthority) {
					const oldUI = getAuthorityUI(oldAuthority);
					const newUI = getAuthorityUI(newAuthority);
					const oldLabel = getLeadLabel(oldType);
					const newLabel = getLeadLabel(newType);

					toast.info(
						`Lead authority changed from ${oldUI.emoji} ${oldLabel} to ${newUI.emoji} ${newLabel}`,
						{
							description:
								'You may want to review role items to ensure they align with the new authority level.',
							duration: 5000
						}
					);
				}

				// Allow sync effect to run again after mutation completes
				// Small delay ensures backend update has propagated to reactive queries
				setTimeout(() => {
					isUserUpdating = false;
				}, 50);
			})
			.catch((error) => {
				// Revert on error
				circleTypeValue = circle.circleType ?? CIRCLE_TYPES.HIERARCHY;
				lastCircleType = circle.circleType ?? CIRCLE_TYPES.HIERARCHY;
				isUserUpdating = false;
				toast.error(error instanceof Error ? error.message : 'Failed to update circle type');
			});
	});
</script>

{#if canEdit}
	<div class="space-y-fieldGroup">
		<FormSelect
			id="circle-type-select"
			label="Circle Type"
			bind:value={circleTypeValue}
			{options}
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
		<Text variant="label" color="secondary" class="mb-fieldGroup">Circle Type</Text>
		<Text variant="body" size="sm" color="primary">
			{selectedOption?.label ?? 'Hierarchy'}
		</Text>
		{#if selectedOption}
			<Text variant="body" size="sm" color="secondary">
				{selectedOption.description}
			</Text>
		{/if}
	</div>
{/if}
