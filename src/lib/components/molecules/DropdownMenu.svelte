<script lang="ts" module>
	import { DropdownMenu as BitsDropdownMenu } from 'bits-ui';

	// Re-export all DropdownMenu sub-components
	// Usage: import * as DropdownMenu from '$lib/components/ui/DropdownMenu.svelte'
	// Then: <DropdownMenu.Root> <DropdownMenu.Trigger> <DropdownMenu.Content> ...

	export const Root = BitsDropdownMenu.Root;
	export const Trigger = BitsDropdownMenu.Trigger;
	export const Portal = BitsDropdownMenu.Portal;
	export const Content = BitsDropdownMenu.Content;
	export const Item = BitsDropdownMenu.Item;
	export const CheckboxItem = BitsDropdownMenu.CheckboxItem;
	export const RadioGroup = BitsDropdownMenu.RadioGroup;
	export const RadioItem = BitsDropdownMenu.RadioItem;
	export const Group = BitsDropdownMenu.Group;
	export const Sub = BitsDropdownMenu.Sub;
	export const SubTrigger = BitsDropdownMenu.SubTrigger;
	export const SubContent = BitsDropdownMenu.SubContent;
	export const Separator = BitsDropdownMenu.Separator;
	export const Arrow = BitsDropdownMenu.Arrow;
</script>

<!-- No default export - use module-level exports above -->
