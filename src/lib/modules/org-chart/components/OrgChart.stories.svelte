<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	// Note: OrgChart requires UseOrgChart composable with Convex queries and D3.js
	// which are not available in Storybook. Skipping stories for this component.
	// import OrgChart from './OrgChart.svelte';

	const { Story: _Story } = defineMeta({
		// component: OrgChart,
		title: 'Modules/OrgChart/OrgChart',
		tags: ['autodocs']
	});
</script>

<!-- 
	OrgChart requires:
	- UseOrgChart composable with Convex queries
	- D3.js for visualization (d3-hierarchy, d3-zoom, d3-selection, d3-transition, d3-interpolate)
	- Complex SVG rendering and interaction
	These dependencies are not available in Storybook without complex setup.
	Component works correctly in the application context.
-->
