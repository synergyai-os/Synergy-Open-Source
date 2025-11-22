<script lang="ts" module>
	import { RadioGroup as BitsRadioGroup } from 'bits-ui';

	// Re-export all RadioGroup sub-components
	// Usage: import * as RadioGroup from '$lib/components/ui/RadioGroup.svelte'
	// Then: <RadioGroup.Root> <RadioGroup.Item> with children snippet pattern
	// Example:
	// <RadioGroup.Item value="option1">
	//   {#snippet children({ checked })}
	//     <!-- Custom radio button UI -->
	//   {/snippet}
	// </RadioGroup.Item>

	export const Root = BitsRadioGroup.Root;
	export const Item = BitsRadioGroup.Item;
</script>

<!-- No default export - use module-level exports above -->
