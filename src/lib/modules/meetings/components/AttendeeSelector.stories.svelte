<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	// Note: AttendeeSelector requires SvelteKit stores ($app/environment) and Convex queries
	// which are not available in Storybook. Skipping stories for this component.
	// import AttendeeSelector from './AttendeeSelector.svelte';

	const { Story } = defineMeta({
		// component: AttendeeSelector,
		title: 'Modules/Meetings/AttendeeSelector',
		tags: ['autodocs']
	});
</script>

<!-- 
	AttendeeSelector requires:
	- $app/environment (browser check)
	- useQuery from convex-svelte for users and circles
	- Combobox from bits-ui (which should work, but component needs Convex data)
	These dependencies are not available in Storybook without complex setup.
	Component works correctly in the application context.
-->
