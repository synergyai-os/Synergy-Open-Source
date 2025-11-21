<script lang="ts" module>
	import { Meter as BitsMeter } from 'bits-ui';

	// Re-export Meter component
	// Usage: import * as Meter from '$lib/components/ui/Meter.svelte'
	// Then: <Meter.Root>

	export const Root = BitsMeter.Root;
</script>

<!-- No default export - use module-level exports above -->
