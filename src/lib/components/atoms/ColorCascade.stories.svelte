<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ColorCascade from './ColorCascade.svelte';

	const { Story } = defineMeta({
		component: ColorCascade,
		title: 'Design System/Tokens/Color Cascade',
		description: 'Demonstrates the 3-layer color cascade architecture. Change `color.brand.primary` in design-system.json to rebrand the entire UI in 10 seconds.'
	});
</script>

<Story name="Color Cascade Architecture">
	{#snippet template()}
		<ColorCascade />
	{/snippet}
</Story>

