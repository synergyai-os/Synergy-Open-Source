<script lang="ts" module>
	import { RangeCalendar as BitsRangeCalendar } from 'bits-ui';

	// Re-export all RangeCalendar sub-components
	// Usage: import * as RangeCalendar from '$lib/components/ui/RangeCalendar.svelte'
	// Then: <RangeCalendar.Root> <RangeCalendar.Header> <RangeCalendar.Grid> ...

	export const Root = BitsRangeCalendar.Root;
	export const Header = BitsRangeCalendar.Header;
	export const Heading = BitsRangeCalendar.Heading;
	export const Grid = BitsRangeCalendar.Grid;
	export const GridHead = BitsRangeCalendar.GridHead;
	export const HeadCell = BitsRangeCalendar.HeadCell;
	export const GridBody = BitsRangeCalendar.GridBody;
	export const GridRow = BitsRangeCalendar.GridRow;
	export const Cell = BitsRangeCalendar.Cell;
	export const Day = BitsRangeCalendar.Day;
	export const PrevButton = BitsRangeCalendar.PrevButton;
	export const NextButton = BitsRangeCalendar.NextButton;
</script>

<!-- No default export - use module-level exports above -->
