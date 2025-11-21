<script lang="ts" module>
	import { Checkbox as BitsCheckbox } from 'bits-ui';

	// Re-export all Checkbox sub-components
	// Usage: import * as Checkbox from '$lib/components/ui/Checkbox.svelte'
	// Then: <Checkbox.Root> <Checkbox.Input> <Checkbox.Indicator> ...

	export const Root = BitsCheckbox.Root;
</script>

<!-- No default export - use module-level exports above -->
