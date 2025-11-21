<script lang="ts" module>
	import { Popover as BitsPopover } from 'bits-ui';

	// Re-export all Popover sub-components
	// Usage: import * as Popover from '$lib/components/ui/Popover.svelte'
	// Then: <Popover.Root> <Popover.Trigger> <Popover.Content> ...

	export const Root = BitsPopover.Root;
	export const Trigger = BitsPopover.Trigger;
	export const Portal = BitsPopover.Portal;
	export const Content = BitsPopover.Content;
	export const Close = BitsPopover.Close;
	export const Arrow = BitsPopover.Arrow;
</script>

<!-- No default export - use module-level exports above -->
