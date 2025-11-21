<script lang="ts" module>
	import { Command as BitsCommand } from 'bits-ui';

	// Re-export all Command sub-components
	// Usage: import * as Command from '$lib/components/ui/Command.svelte'
	// Then: <Command.Root> <Command.Input> <Command.List> ...

	export const Root = BitsCommand.Root;
	export const Input = BitsCommand.Input;
	export const List = BitsCommand.List;
	export const Empty = BitsCommand.Empty;
	export const Group = BitsCommand.Group;
	export const Item = BitsCommand.Item;
	export const Separator = BitsCommand.Separator;
	export const Loading = BitsCommand.Loading;
</script>

<!-- No default export - use module-level exports above -->
