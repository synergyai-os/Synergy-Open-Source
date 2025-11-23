<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	// Note: CircleDetailPanel requires UseOrgChart composable with Convex queries
	// which are not available in Storybook. Skipping stories for this component.
	// import CircleDetailPanel from './CircleDetailPanel.svelte';

	const { Story: _Story } = defineMeta({
		// component: CircleDetailPanel,
		title: 'Modules/OrgChart/CircleDetailPanel',
		tags: ['autodocs']
	});
</script>

<!-- 
	CircleDetailPanel requires:
	- UseOrgChart composable with Convex queries
	- StackedPanel organism component
	- Complex state management
	These dependencies are not available in Storybook without complex setup.
	Component works correctly in the application context.
-->
