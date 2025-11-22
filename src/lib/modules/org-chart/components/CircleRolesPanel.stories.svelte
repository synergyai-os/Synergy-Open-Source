<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	// Note: CircleRolesPanel requires SvelteKit stores ($app/stores) and Convex queries
	// which are not available in Storybook. Skipping stories for this component.
	// import CircleRolesPanel from './circles/CircleRolesPanel.svelte';

	const { Story } = defineMeta({
		// component: CircleRolesPanel,
		title: 'Modules/OrgChart/CircleRolesPanel',
		tags: ['autodocs']
	});
</script>

<!-- 
	CircleRolesPanel requires:
	- $app/stores (page store) for sessionId
	- useQuery from convex-svelte for role fillers
	These dependencies are not available in Storybook without complex setup.
	Component works correctly in the application context.
-->
