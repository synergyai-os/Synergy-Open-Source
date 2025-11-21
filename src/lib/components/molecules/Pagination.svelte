<script lang="ts" module>
	import { Pagination as BitsPagination } from 'bits-ui';

	// Re-export all Pagination sub-components
	// Usage: import * as Pagination from '$lib/components/ui/Pagination.svelte'
	// Then: <Pagination.Root> <Pagination.PrevButton> <Pagination.NextButton> ...

	export const Root = BitsPagination.Root;
	export const PrevButton = BitsPagination.PrevButton;
	export const NextButton = BitsPagination.NextButton;
	export const Page = BitsPagination.Page;
</script>

<!-- No default export - use module-level exports above -->
