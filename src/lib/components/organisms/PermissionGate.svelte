<script lang="ts">
	import type { LayerType } from '$lib/infrastructure/navigation/constants';
	import { Button } from '$lib/components/atoms';

	interface Props {
		layerType: LayerType;
		resourceId: string;
		onGoBack: () => void;
	}

	let { layerType, resourceId, onGoBack }: Props = $props();

	function handleRequestAccess() {
		// Placeholder - log for now
		console.log(`[PermissionGate] Access requested for ${layerType}:${resourceId}`);
		// Future: Create access request, notify admin
	}
</script>

<div class="gap-content-section p-content-section flex h-full flex-col items-center justify-center">
	<div class="text-icon-xl">🔒</div>
	<h3 class="text-heading-3 text-content-primary">Access Required</h3>
	<p class="text-body text-content-secondary text-center">
		You don't have permission to view this {layerType}.
	</p>
	<div class="gap-button-group flex">
		<Button variant="primary" onclick={handleRequestAccess}>Request Access</Button>
		<Button variant="secondary" onclick={onGoBack}>Go Back</Button>
	</div>
</div>
