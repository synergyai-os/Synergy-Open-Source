<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	// Note: CircleMembersPanel requires SvelteKit stores ($app/stores) and Convex queries
	// which are not available in Storybook. Skipping stories for this component.
	// import CircleMembersPanel from './circles/CircleMembersPanel.svelte';

	const { Story } = defineMeta({
		// component: CircleMembersPanel,
		title: 'Modules/OrgChart/CircleMembersPanel',
		tags: ['autodocs']
	});
</script>

<!-- 
	CircleMembersPanel requires:
	- $app/stores (page store) for sessionId
	- useQuery from convex-svelte for organization members
	- getContext for organizations API
	These dependencies are not available in Storybook without complex setup.
	Component works correctly in the application context.
-->
