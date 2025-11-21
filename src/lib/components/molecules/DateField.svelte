<script lang="ts" module>
	import { DateField as BitsDateField } from 'bits-ui';

	// Re-export all DateField sub-components
	// Usage: import * as DateField from '$lib/components/ui/DateField.svelte'
	// Then: <DateField.Root> <DateField.Input> <DateField.Segment> ...

	export const Root = BitsDateField.Root;
	export const Input = BitsDateField.Input;
	export const Segment = BitsDateField.Segment;
	export const Label = BitsDateField.Label;
</script>

<!-- No default export - use module-level exports above -->
