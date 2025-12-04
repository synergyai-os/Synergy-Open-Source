<script lang="ts">
	import * as Tooltip from '$lib/components/atoms/Tooltip.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		reason: string;
		children: Snippet;
	};

	let { reason, children }: Props = $props();
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		{@render children()}
	</Tooltip.Trigger>
	<Tooltip.Content>
		<p class="text-sm text-primary">{reason}</p>
	</Tooltip.Content>
</Tooltip.Root>

