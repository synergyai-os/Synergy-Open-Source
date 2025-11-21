<script lang="ts" module>
	import { LinkPreview as BitsLinkPreview } from 'bits-ui';

	// Re-export all LinkPreview sub-components
	// Usage: import * as LinkPreview from '$lib/components/ui/LinkPreview.svelte'
	// Then: <LinkPreview.Root> <LinkPreview.Trigger> <LinkPreview.Content> ...

	export const Root = BitsLinkPreview.Root;
	export const Trigger = BitsLinkPreview.Trigger;
	export const Content = BitsLinkPreview.Content;
	export const Arrow = BitsLinkPreview.Arrow;
</script>

<!-- No default export - use module-level exports above -->
