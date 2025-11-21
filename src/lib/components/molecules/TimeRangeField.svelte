<script lang="ts" module>
	import { TimeRangeField as BitsTimeRangeField } from 'bits-ui';

	// Re-export all TimeRangeField sub-components
	// Usage: import * as TimeRangeField from '$lib/components/ui/TimeRangeField.svelte'
	// Then: <TimeRangeField.Root> <TimeRangeField.Input> <TimeRangeField.Segment> ...

	export const Root = BitsTimeRangeField.Root;
	export const Input = BitsTimeRangeField.Input;
	export const Segment = BitsTimeRangeField.Segment;
	export const Label = BitsTimeRangeField.Label;
</script>

<!-- No default export - use module-level exports above -->
