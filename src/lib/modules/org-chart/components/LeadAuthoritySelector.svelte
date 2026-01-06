<script lang="ts">
	import { browser } from '$app/environment';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import type { CircleSummary } from '$lib/infrastructure/organizational-model';
	import FormSelect from '$lib/components/atoms/FormSelect.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
	import { toast } from '$lib/utils/toast';
	import {
		LEAD_AUTHORITY,
		DEFAULT_LEAD_AUTHORITY_LABELS,
		DEFAULT_LEAD_AUTHORITY_DESCRIPTIONS,
		getLeadAuthorityLevel,
		getAuthorityUI,
		getLeadLabel,
		type LeadAuthority
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
			value: LEAD_AUTHORITY.DECIDES,
			label: DEFAULT_LEAD_AUTHORITY_LABELS[LEAD_AUTHORITY.DECIDES],
			description: DEFAULT_LEAD_AUTHORITY_DESCRIPTIONS[LEAD_AUTHORITY.DECIDES]
		},
		{
			value: LEAD_AUTHORITY.FACILITATES,
			label: DEFAULT_LEAD_AUTHORITY_LABELS[LEAD_AUTHORITY.FACILITATES],
			description: DEFAULT_LEAD_AUTHORITY_DESCRIPTIONS[LEAD_AUTHORITY.FACILITATES]
		},
		{
			value: LEAD_AUTHORITY.CONVENES,
			label: DEFAULT_LEAD_AUTHORITY_LABELS[LEAD_AUTHORITY.CONVENES],
			description: DEFAULT_LEAD_AUTHORITY_DESCRIPTIONS[LEAD_AUTHORITY.CONVENES]
		}
	];

	// Ensure value is always a valid option value - compute synchronously
	function getValidValue(targetValue: string | undefined): string {
		const value = (targetValue ?? LEAD_AUTHORITY.DECIDES) as string;
		return options.some((o) => o.value === value) ? value : LEAD_AUTHORITY.DECIDES;
	}

	let leadAuthorityValue = $state<string>(getValidValue(circle.leadAuthority));

	// Track to detect external changes and prevent sync during user updates
	let lastCircleId = $state<string | null>(null);
	let lastLeadAuthority = $state<string | null>(null);
	let isUpdating = $state(false);

	// Sync with circle prop changes (only when circle changes externally)
	$effect(() => {
		// Don't sync if user is currently updating
		if (isUpdating) {
			return;
		}

		const currentCircleId = circle.circleId;
		const currentLeadAuthority = circle.leadAuthority ?? 'decides';
		const newValue = getValidValue(circle.leadAuthority);

		// Initialize on first run or if we switched to a different circle
		if (lastCircleId === null || currentCircleId !== lastCircleId) {
			lastCircleId = currentCircleId;
			lastLeadAuthority = currentLeadAuthority;
			leadAuthorityValue = newValue;
			return;
		}

		// Only sync if the circle's leadAuthority changed externally
		if (currentLeadAuthority !== lastLeadAuthority && leadAuthorityValue !== newValue) {
			lastLeadAuthority = currentLeadAuthority;
			leadAuthorityValue = newValue;
		}
	});

	const selectedOption = $derived(options.find((o) => o.value === leadAuthorityValue));

	// Watch for changes and update backend
	$effect(() => {
		if (
			!convexClient ||
			!sessionId ||
			!canEdit ||
			leadAuthorityValue === (circle.leadAuthority ?? LEAD_AUTHORITY.DECIDES)
		) {
			return;
		}

		// Mark that we're updating from user input and update tracking immediately
		// This prevents the sync effect from resetting the value
		isUpdating = true;
		lastLeadAuthority = leadAuthorityValue; // Update immediately to prevent sync

		// Calculate authority change for notification
		const oldAuthority = (circle.leadAuthority ?? LEAD_AUTHORITY.DECIDES) as LeadAuthority;
		const newAuthority = leadAuthorityValue as LeadAuthority;
		const oldAuthorityLevel = getLeadAuthorityLevel(oldAuthority);
		const newAuthorityLevel = getLeadAuthorityLevel(newAuthority);

		convexClient
			.mutation(api.core.circles.index.updateInline, {
				sessionId,
				circleId: circle.circleId,
				updates: {
					leadAuthority: leadAuthorityValue as CircleSummary['leadAuthority']
				}
			})
			.then(() => {
				// Show authority change notification
				if (oldAuthorityLevel !== newAuthorityLevel) {
					const oldUI = getAuthorityUI(oldAuthorityLevel);
					const newUI = getAuthorityUI(newAuthorityLevel);
					const oldLabel = getLeadLabel(oldAuthority);
					const newLabel = getLeadLabel(newAuthority);

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
					isUpdating = false;
				}, 50);
			})
			.catch((error) => {
				// Revert on error
				leadAuthorityValue = circle.leadAuthority ?? LEAD_AUTHORITY.DECIDES;
				lastLeadAuthority = circle.leadAuthority ?? LEAD_AUTHORITY.DECIDES;
				isUpdating = false;
				toast.error(error instanceof Error ? error.message : 'Failed to update lead authority');
			});
	});
</script>

{#if canEdit}
	<div class="space-y-fieldGroup">
		<FormSelect
			id="lead-authority-select"
			label="Lead Authority"
			bind:value={leadAuthorityValue}
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
		<Text variant="label" color="secondary" class="mb-fieldGroup">Lead Authority</Text>
		<Text variant="body" size="sm" color="primary">
			{selectedOption?.label ?? 'Decides'}
		</Text>
		{#if selectedOption}
			<Text variant="body" size="sm" color="secondary">
				{selectedOption.description}
			</Text>
		{/if}
	</div>
{/if}
