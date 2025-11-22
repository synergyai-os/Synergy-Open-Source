<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	// Note: SecretarySelector requires SvelteKit stores ($app/environment) and Convex mutations
	// which are not available in Storybook. Skipping stories for this component.
	// import SecretarySelector from './SecretarySelector.svelte';

	const { Story } = defineMeta({
		// component: SecretarySelector,
		title: 'Modules/Meetings/SecretarySelector',
		tags: ['autodocs']
	});
</script>

<!-- 
	SecretarySelector requires:
	- $app/environment (browser check)
	- useConvexClient for mutations
	- Toast notifications (svelte-sonner)
	These dependencies are not available in Storybook without complex setup.
	Component works correctly in the application context.
-->
