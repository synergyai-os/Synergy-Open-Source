<script lang="ts" module>
	import { Checkbox as BitsCheckbox } from 'bits-ui';

	// Re-export all Checkbox sub-components
	// Usage: import * as Checkbox from '$lib/components/ui/Checkbox.svelte'
	// Then: <Checkbox.Root> with children snippet pattern
	// Example:
	// <Checkbox.Root>
	//   {#snippet children({ checked, indeterminate })}
	//     <!-- Custom checkbox UI -->
	//   {/snippet}
	// </Checkbox.Root>

	export const Root = BitsCheckbox.Root;
	export const Group = BitsCheckbox.Group;
	export const GroupLabel = BitsCheckbox.GroupLabel;
</script>

<!-- No default export - use module-level exports above -->
