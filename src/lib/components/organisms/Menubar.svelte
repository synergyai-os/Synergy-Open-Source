<script lang="ts" module>
	import { Menubar as BitsMenubar } from 'bits-ui';

	// Re-export all Menubar sub-components
	// Usage: import * as Menubar from '$lib/components/ui/Menubar.svelte'
	// Then: <Menubar.Root> <Menubar.Menu> <Menubar.Trigger> ...

	export const Root = BitsMenubar.Root;
	export const Menu = BitsMenubar.Menu;
	export const Trigger = BitsMenubar.Trigger;
	export const Portal = BitsMenubar.Portal;
	export const Content = BitsMenubar.Content;
	export const Item = BitsMenubar.Item;
	export const CheckboxItem = BitsMenubar.CheckboxItem;
	export const RadioGroup = BitsMenubar.RadioGroup;
	export const RadioItem = BitsMenubar.RadioItem;
	export const Group = BitsMenubar.Group;
	export const Sub = BitsMenubar.Sub;
	export const SubTrigger = BitsMenubar.SubTrigger;
	export const SubContent = BitsMenubar.SubContent;
	export const Separator = BitsMenubar.Separator;
	export const Arrow = BitsMenubar.Arrow;
</script>

<!-- No default export - use module-level exports above -->
