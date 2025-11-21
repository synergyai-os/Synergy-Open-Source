<script lang="ts" module>
	import { ScrollArea as BitsScrollArea } from 'bits-ui';

	// Re-export all ScrollArea sub-components
	// Usage: import * as ScrollArea from '$lib/components/ui/ScrollArea.svelte'
	// Then: <ScrollArea.Root> <ScrollArea.Viewport> <ScrollArea.Scrollbar> ...

	export const Root = BitsScrollArea.Root;
	export const Viewport = BitsScrollArea.Viewport;
	export const Scrollbar = BitsScrollArea.Scrollbar;
	export const Thumb = BitsScrollArea.Thumb;
	export const Corner = BitsScrollArea.Corner;
</script>

<!-- No default export - use module-level exports above -->
