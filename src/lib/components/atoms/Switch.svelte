<script lang="ts" module>
	import { Switch as BitsSwitch } from 'bits-ui';

	// Re-export all Switch sub-components
	// Usage: import * as Switch from '$lib/components/ui/Switch.svelte'
	// Then: <Switch.Root> <Switch.Thumb> <Switch.Input> ...

	export const Root = BitsSwitch.Root;
	export const Thumb = BitsSwitch.Thumb;
</script>

<!-- No default export - use module-level exports above -->
