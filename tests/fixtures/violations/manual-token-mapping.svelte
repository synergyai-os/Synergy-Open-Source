<!-- Test fixture: Manual token mapping in CSS component with recipe -->
<!-- Expected: Should flag manual mapping when recipe exists -->

<script lang="ts">
	import { buttonRecipe } from '$lib/design-system/recipes/button.recipe';

	type Props = {
		size?: 'sm' | 'md' | 'lg';
	};

	let { size = 'md' }: Props = $props();

	// ❌ Violation: Manual token mapping instead of using recipe
	const classes = $derived(
		size === 'sm' ? 'h-button-sm px-button-x-sm' : size === 'md' ? 'h-button-md px-button-x' : 'h-button-lg px-button-x-lg'
	);
</script>

<button class={classes}>
	<slot />
</button>

