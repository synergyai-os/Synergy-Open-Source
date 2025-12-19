<script lang="ts">
	import CircleTypeBadge from './CircleTypeBadge.svelte';
	import DecisionModelBadge from './DecisionModelBadge.svelte';
	import type {
		CircleType,
		DecisionModel
	} from '$lib/infrastructure/organizational-model/constants';

	interface Props {
		circleType: CircleType;
		decisionModel: DecisionModel;
	}

	let { circleType, decisionModel }: Props = $props();
</script>

<div class="gap-button flex items-center">
	<CircleTypeBadge {circleType} />
	<DecisionModelBadge {decisionModel} />
</div>
