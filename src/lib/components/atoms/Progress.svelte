<script lang="ts" module>
	import { Progress as BitsProgress } from 'bits-ui';

	// Re-export Progress component
	// Usage: import * as Progress from '$lib/components/ui/Progress.svelte'
	// Then: <Progress.Root>

	export const Root = BitsProgress.Root;
</script>

<!-- No default export - use module-level exports above -->
