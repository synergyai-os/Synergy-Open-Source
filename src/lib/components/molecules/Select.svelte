<script lang="ts" module>
	import { Select as BitsSelect } from 'bits-ui';

	// Re-export all Select sub-components
	// Usage: import * as Select from '$lib/components/ui/Select.svelte'
	// Then: <Select.Root> <Select.Trigger> <Select.Content> ...

	export const Root = BitsSelect.Root;
	export const Trigger = BitsSelect.Trigger;
	export const Portal = BitsSelect.Portal;
	export const Content = BitsSelect.Content;
	export const Item = BitsSelect.Item;
	export const Group = BitsSelect.Group;
	export const GroupHeading = BitsSelect.GroupHeading;
</script>

<!-- No default export - use module-level exports above -->
