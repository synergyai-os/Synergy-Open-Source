<script lang="ts" module>
	import { Collapsible as BitsCollapsible } from 'bits-ui';

	// Re-export all Collapsible sub-components
	// Usage: import * as Collapsible from '$lib/components/ui/Collapsible.svelte'
	// Then: <Collapsible.Root> <Collapsible.Trigger> <Collapsible.Content> ...

	export const Root = BitsCollapsible.Root;
	export const Trigger = BitsCollapsible.Trigger;
	export const Content = BitsCollapsible.Content;
</script>

<!-- No default export - use module-level exports above -->
