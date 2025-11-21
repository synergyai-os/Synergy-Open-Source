<script lang="ts" module>
	import { DateRangePicker as BitsDateRangePicker } from 'bits-ui';

	// Re-export all DateRangePicker sub-components
	// Usage: import * as DateRangePicker from '$lib/components/ui/DateRangePicker.svelte'
	// Then: <DateRangePicker.Root> <DateRangePicker.Input> ...

	export const Root = BitsDateRangePicker.Root;
	export const Input = BitsDateRangePicker.Input;
	export const Segment = BitsDateRangePicker.Segment;
	export const Trigger = BitsDateRangePicker.Trigger;
	export const Content = BitsDateRangePicker.Content;
	export const Calendar = BitsDateRangePicker.Calendar;
	export const Label = BitsDateRangePicker.Label;
</script>

<!-- No default export - use module-level exports above -->
