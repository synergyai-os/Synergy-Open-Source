<script lang="ts" module>
	import { DateRangeField as BitsDateRangeField } from 'bits-ui';

	// Re-export all DateRangeField sub-components
	// Usage: import * as DateRangeField from '$lib/components/ui/DateRangeField.svelte'
	// Then: <DateRangeField.Root> <DateRangeField.Input> ...

	export const Root = BitsDateRangeField.Root;
	export const Input = BitsDateRangeField.Input;
	export const Segment = BitsDateRangeField.Segment;
	export const Label = BitsDateRangeField.Label;
</script>

<!-- No default export - use module-level exports above -->
