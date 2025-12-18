<script lang="ts">
	import Badge from '$lib/components/atoms/Badge.svelte';
	import type { CircleSummary } from '$lib/infrastructure/organizational-model';
	import {
		DECISION_MODELS,
		DEFAULT_DECISION_MODEL_LABELS,
		type DecisionModel
	} from '$lib/infrastructure/organizational-model/constants';

	type Props = {
		decisionModel: CircleSummary['decisionModel'];
	};

	let { decisionModel }: Props = $props();

	const effectiveDecisionModel = $derived(
		(decisionModel ?? DECISION_MODELS.MANAGER_DECIDES) as DecisionModel
	);

	const badgeConfig = $derived.by(() => {
		switch (effectiveDecisionModel) {
			case DECISION_MODELS.MANAGER_DECIDES:
				return { variant: 'default' as const, icon: '👤' };
			case DECISION_MODELS.TEAM_CONSENSUS:
				return { variant: 'primary' as const, icon: '🤝' };
			case DECISION_MODELS.CONSENT:
				return { variant: 'success' as const, icon: '✅' };
			case DECISION_MODELS.COORDINATION_ONLY:
				return { variant: 'warning' as const, icon: '🔗' };
		}
	});
</script>

<Badge variant={badgeConfig.variant} size="sm">
	<span class="mr-1">{badgeConfig.icon}</span>
	{DEFAULT_DECISION_MODEL_LABELS[effectiveDecisionModel]}
</Badge>
