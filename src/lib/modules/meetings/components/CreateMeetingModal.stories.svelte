<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	// Note: CreateMeetingModal requires SvelteKit stores ($app/environment), Convex queries,
	// and mutations which are not available in Storybook. Skipping stories for this component.
	// import CreateMeetingModal from './CreateMeetingModal.svelte';

	const { Story: _Story } = defineMeta({
		// component: CreateMeetingModal,
		title: 'Modules/Meetings/CreateMeetingModal',
		tags: ['autodocs']
	});
</script>

<!-- 
	CreateMeetingModal requires:
	- $app/environment (browser check)
	- useQuery from convex-svelte for templates
	- useConvexClient for mutations
	- AttendeeSelector component (which also requires Convex)
	- Toast notifications (svelte-sonner)
	- Dialog from bits-ui (which should work, but component needs Convex data)
	These dependencies are not available in Storybook without complex setup.
	Component works correctly in the application context.
-->
