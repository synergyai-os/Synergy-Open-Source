<script lang="ts" module>
	import { Combobox as BitsCombobox } from 'bits-ui';

	// Re-export all Combobox sub-components
	// Usage: import * as Combobox from '$lib/components/ui/Combobox.svelte'
	// Then: <Combobox.Root> <Combobox.Input> <Combobox.Content> ...

	export const Root = BitsCombobox.Root;
	export const Input = BitsCombobox.Input;
	export const Content = BitsCombobox.Content;
	export const Item = BitsCombobox.Item;
	export const Group = BitsCombobox.Group;
	export const GroupHeading = BitsCombobox.GroupHeading;
	export const Separator = BitsCombobox.Separator;
	export const Arrow = BitsCombobox.Arrow;
</script>

<!-- No default export - use module-level exports above -->
