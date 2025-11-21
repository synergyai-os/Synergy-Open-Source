<script lang="ts" module>
	import { AspectRatio as BitsAspectRatio } from 'bits-ui';

	// Re-export AspectRatio component
	// Usage: import * as AspectRatio from '$lib/components/ui/AspectRatio.svelte'
	// Then: <AspectRatio.Root ratio={16/9}>

	export const Root = BitsAspectRatio.Root;
</script>

<!-- No default export - use module-level exports above -->
