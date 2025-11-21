<script lang="ts" module>
	import { Toggle as BitsToggle } from 'bits-ui';

	// Re-export all Toggle sub-components
	// Usage: import * as Toggle from '$lib/components/ui/Toggle.svelte'
	// Then: <Toggle.Root> <Toggle.Input> ...

	export const Root = BitsToggle.Root;
</script>

<!-- No default export - use module-level exports above -->
