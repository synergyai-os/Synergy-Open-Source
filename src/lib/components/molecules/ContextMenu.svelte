<script lang="ts" module>
	import { ContextMenu as BitsContextMenu } from 'bits-ui';

	// Re-export all ContextMenu sub-components
	// Usage: import * as ContextMenu from '$lib/components/ui/ContextMenu.svelte'
	// Then: <ContextMenu.Root> <ContextMenu.Trigger> <ContextMenu.Content> ...

	export const Root = BitsContextMenu.Root;
	export const Trigger = BitsContextMenu.Trigger;
	export const Portal = BitsContextMenu.Portal;
	export const Content = BitsContextMenu.Content;
	export const Item = BitsContextMenu.Item;
	export const CheckboxItem = BitsContextMenu.CheckboxItem;
	export const RadioGroup = BitsContextMenu.RadioGroup;
	export const RadioItem = BitsContextMenu.RadioItem;
	export const Group = BitsContextMenu.Group;
	export const Sub = BitsContextMenu.Sub;
	export const SubTrigger = BitsContextMenu.SubTrigger;
	export const SubContent = BitsContextMenu.SubContent;
	export const Separator = BitsContextMenu.Separator;
	export const Arrow = BitsContextMenu.Arrow;
</script>

<!-- No default export - use module-level exports above -->
