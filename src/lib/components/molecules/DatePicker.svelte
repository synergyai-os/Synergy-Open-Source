<script lang="ts" module>
	import { DatePicker as BitsDatePicker } from 'bits-ui';

	// Re-export all DatePicker sub-components
	// Usage: import * as DatePicker from '$lib/components/ui/DatePicker.svelte'
	// Then: <DatePicker.Root> <DatePicker.Input> <DatePicker.Calendar> ...

	export const Root = BitsDatePicker.Root;
	export const Input = BitsDatePicker.Input;
	export const Segment = BitsDatePicker.Segment;
	export const Trigger = BitsDatePicker.Trigger;
	export const Content = BitsDatePicker.Content;
	export const Calendar = BitsDatePicker.Calendar;
	export const Label = BitsDatePicker.Label;
</script>

<!-- No default export - use module-level exports above -->
