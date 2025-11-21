<script lang="ts" module>
	import { RadioGroup as BitsRadioGroup } from 'bits-ui';

	// Re-export all RadioGroup sub-components
	// Usage: import * as RadioGroup from '$lib/components/ui/RadioGroup.svelte'
	// Then: <RadioGroup.Root> <RadioGroup.Item> <RadioGroup.Input> ...

	export const Root = BitsRadioGroup.Root;
	export const Item = BitsRadioGroup.Item;
</script>

<!-- No default export - use module-level exports above -->
