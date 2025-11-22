<script lang="ts" module>
	import { Tooltip as BitsTooltip } from 'bits-ui';

	// Re-export all Tooltip sub-components
	// Usage: import * as Tooltip from '$lib/components/ui/Tooltip.svelte'
	// Then: <Tooltip.Provider> <Tooltip.Root> <Tooltip.Trigger> <Tooltip.Content> ...
	// NOTE: Tooltip.Root MUST be a descendant of Tooltip.Provider

	export const Provider = BitsTooltip.Provider;
	export const Root = BitsTooltip.Root;
	export const Trigger = BitsTooltip.Trigger;
	export const Portal = BitsTooltip.Portal;
	export const Content = BitsTooltip.Content;
	export const Arrow = BitsTooltip.Arrow;
</script>

<!-- No default export - use module-level exports above -->
