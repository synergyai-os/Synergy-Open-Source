<script lang="ts" module>
	import { DatePicker as BitsDatePicker } from 'bits-ui';

	// Re-export all DatePicker sub-components
	// Usage: import * as DatePicker from '$lib/components/molecules/DatePicker.svelte'
	// Then: <DatePicker.Root> <DatePicker.Input> <DatePicker.Calendar> ...

	export const Root = BitsDatePicker.Root;
	export const Input = BitsDatePicker.Input;
	export const Segment = BitsDatePicker.Segment;
	export const Trigger = BitsDatePicker.Trigger;
	export const Portal = BitsDatePicker.Portal;
	export const Content = BitsDatePicker.Content;
	export const Calendar = BitsDatePicker.Calendar;
	export const Label = BitsDatePicker.Label;

	// Calendar sub-components (exposed through DatePicker.Calendar)
	export const Header = BitsDatePicker.Header;
	export const Heading = BitsDatePicker.Heading;
	export const PrevButton = BitsDatePicker.PrevButton;
	export const NextButton = BitsDatePicker.NextButton;
	export const Grid = BitsDatePicker.Grid;
	export const GridHead = BitsDatePicker.GridHead;
	export const GridRow = BitsDatePicker.GridRow;
	export const HeadCell = BitsDatePicker.HeadCell;
	export const GridBody = BitsDatePicker.GridBody;
	export const Cell = BitsDatePicker.Cell;
	export const Day = BitsDatePicker.Day;
</script>

<!-- No default export - use module-level exports above -->
