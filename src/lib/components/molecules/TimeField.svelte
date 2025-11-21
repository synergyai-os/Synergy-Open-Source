<script lang="ts" module>
	import { TimeField as BitsTimeField } from 'bits-ui';

	// Re-export all TimeField sub-components
	// Usage: import * as TimeField from '$lib/components/ui/TimeField.svelte'
	// Then: <TimeField.Root> <TimeField.Input> <TimeField.Segment> ...

	export const Root = BitsTimeField.Root;
	export const Input = BitsTimeField.Input;
	export const Segment = BitsTimeField.Segment;
	export const Label = BitsTimeField.Label;
</script>

<!-- No default export - use module-level exports above -->
