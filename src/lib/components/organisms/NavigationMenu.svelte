<script lang="ts" module>
	import { NavigationMenu as BitsNavigationMenu } from 'bits-ui';

	// Re-export all NavigationMenu sub-components
	// Usage: import * as NavigationMenu from '$lib/components/ui/NavigationMenu.svelte'
	// Then: <NavigationMenu.Root> <NavigationMenu.List> <NavigationMenu.Item> ...

	export const Root = BitsNavigationMenu.Root;
	export const List = BitsNavigationMenu.List;
	export const Item = BitsNavigationMenu.Item;
	export const Trigger = BitsNavigationMenu.Trigger;
	export const Content = BitsNavigationMenu.Content;
	export const Link = BitsNavigationMenu.Link;
	export const Viewport = BitsNavigationMenu.Viewport;
	export const Indicator = BitsNavigationMenu.Indicator;
</script>

<!-- No default export - use module-level exports above -->
