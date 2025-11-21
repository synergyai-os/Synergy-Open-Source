<script lang="ts" module>
	import { Tooltip as BitsTooltip } from 'bits-ui';

	// Re-export all Tooltip sub-components
	// Usage: import * as Tooltip from '$lib/components/ui/Tooltip.svelte'
	// Then: <Tooltip.Root> <Tooltip.Trigger> <Tooltip.Content> ...

	export const Root = BitsTooltip.Root;
	export const Trigger = BitsTooltip.Trigger;
	export const Portal = BitsTooltip.Portal;
	export const Content = BitsTooltip.Content;
	export const Arrow = BitsTooltip.Arrow;
</script>

<!-- No default export - use module-level exports above -->
