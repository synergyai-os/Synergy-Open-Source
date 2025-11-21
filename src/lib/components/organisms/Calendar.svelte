<script lang="ts" module>
	import { Calendar as BitsCalendar } from 'bits-ui';

	// Re-export all Calendar sub-components
	// Usage: import * as Calendar from '$lib/components/ui/Calendar.svelte'
	// Then: <Calendar.Root> <Calendar.Header> <Calendar.Grid> ...

	export const Root = BitsCalendar.Root;
	export const Header = BitsCalendar.Header;
	export const Heading = BitsCalendar.Heading;
	export const Grid = BitsCalendar.Grid;
	export const GridHead = BitsCalendar.GridHead;
	export const HeadCell = BitsCalendar.HeadCell;
	export const GridBody = BitsCalendar.GridBody;
	export const GridRow = BitsCalendar.GridRow;
	export const Cell = BitsCalendar.Cell;
	export const Day = BitsCalendar.Day;
	export const PrevButton = BitsCalendar.PrevButton;
	export const NextButton = BitsCalendar.NextButton;
</script>

<!-- No default export - use module-level exports above -->
