<script lang="ts">
	import { Text } from '$lib/components/atoms';

	type Props = {
		accountName: string;
		accountEmail: string;
		class?: string;
	};

	let { accountName, accountEmail, class: className = '' }: Props = $props();
</script>

<div class="px-input py-stack-header {className}">
	<Text variant="body" size="sm" color="default" as="p" class="truncate font-medium">
		{accountName}
	</Text>
	<Text variant="label" size="sm" color="secondary" as="p" class="truncate">
		{accountEmail}
	</Text>
</div>
