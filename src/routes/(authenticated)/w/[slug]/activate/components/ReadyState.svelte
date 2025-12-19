<script lang="ts">
	import { Button, Icon, Text } from '$lib/components/atoms';

	interface Props {
		onActivate: () => void;
		isActivating?: boolean;
	}

	let { onActivate, isActivating = false }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center" style="padding: var(--spacing-16);">
	<!-- Success Icon -->
	<div style="margin-bottom: var(--spacing-6);">
		<div
			class="bg-status-success-subtle flex items-center justify-center rounded-full"
			style="width: 80px; height: 80px;"
		>
			<Icon type="check-circle" size="xl" color="success" />
		</div>
	</div>

	<!-- Heading -->
	<Text variant="heading" size="lg" color="default" weight="semibold" as="h1" class="mb-header">
		Your workspace is ready to activate!
	</Text>

	<!-- Description -->
	<Text variant="body" size="md" color="secondary" as="p" class="mb-section text-center">
		All governance requirements have been met. Once you activate, all changes will be tracked in the
		history log.
	</Text>

	<!-- Activate Button -->
	<Button variant="primary" size="md" onclick={onActivate} disabled={isActivating}>
		{isActivating ? 'Activating...' : 'Activate Workspace'}
	</Button>
</div>
