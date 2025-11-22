<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	// Note: DecisionsList requires SvelteKit stores ($app/environment) and Convex queries
	// which are not available in Storybook. Skipping stories for this component.
	// import DecisionsList from './DecisionsList.svelte';

	const { Story } = defineMeta({
		// component: DecisionsList,
		title: 'Modules/Meetings/DecisionsList',
		tags: ['autodocs']
	});
</script>

<!-- 
	DecisionsList requires:
	- $app/environment (browser check)
	- useQuery from convex-svelte for decisions
	- useConvexClient for mutations
	These dependencies are not available in Storybook without complex setup.
	Component works correctly in the application context.
-->
