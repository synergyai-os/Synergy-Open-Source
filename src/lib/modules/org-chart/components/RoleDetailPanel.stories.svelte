<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	// Note: RoleDetailPanel requires UseOrgChart composable with Convex queries
	// which are not available in Storybook. Skipping stories for this component.
	// import RoleDetailPanel from './RoleDetailPanel.svelte';

	const { Story } = defineMeta({
		// component: RoleDetailPanel,
		title: 'Modules/OrgChart/RoleDetailPanel',
		tags: ['autodocs']
	});
</script>

<!-- 
	RoleDetailPanel requires:
	- UseOrgChart composable with Convex queries
	- StackedPanel organism component
	- Complex state management
	These dependencies are not available in Storybook without complex setup.
	Component works correctly in the application context.
-->
