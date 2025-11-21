<script lang="ts" module>
	import { RatingGroup as BitsRatingGroup } from 'bits-ui';

	// Re-export all RatingGroup sub-components
	// Usage: import * as RatingGroup from '$lib/components/ui/RatingGroup.svelte'
	// Then: <RatingGroup.Root> <RatingGroup.Item> ...

	export const Root = BitsRatingGroup.Root;
	export const Item = BitsRatingGroup.Item;
</script>

<!-- No default export - use module-level exports above -->
