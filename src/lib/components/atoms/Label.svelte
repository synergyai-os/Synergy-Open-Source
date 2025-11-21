<script lang="ts" module>
	import { Label as BitsLabel } from 'bits-ui';

	// Re-export Label component
	// Usage: import * as Label from '$lib/components/ui/Label.svelte'
	// Then: <Label.Root>

	export const Root = BitsLabel.Root;
</script>

<!-- No default export - use module-level exports above -->
