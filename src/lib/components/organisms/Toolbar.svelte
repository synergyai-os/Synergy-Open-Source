<script lang="ts" module>
	import { Toolbar as BitsToolbar } from 'bits-ui';

	// Re-export all Toolbar sub-components
	// Usage: import * as Toolbar from '$lib/components/ui/Toolbar.svelte'
	// Then: <Toolbar.Root> <Toolbar.Button> <Toolbar.Link> ...

	export const Root = BitsToolbar.Root;
	export const Button = BitsToolbar.Button;
	export const Link = BitsToolbar.Link;
	export const Group = BitsToolbar.Group;
</script>

<!-- No default export - use module-level exports above -->
