<script lang="ts">
	import * as Tooltip from '$lib/components/atoms/Tooltip.svelte';
	import { tooltipContentRecipe } from '$lib/design-system/recipes';
	import type { Snippet } from 'svelte';

	type Props = {
		reason: string;
		children: Snippet;
	};

	let { reason, children }: Props = $props();
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger>
			{@render children()}
		</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Content class={tooltipContentRecipe()}>
				<p class="text-sm text-primary">{reason}</p>
			</Tooltip.Content>
		</Tooltip.Portal>
	</Tooltip.Root>
</Tooltip.Provider>
