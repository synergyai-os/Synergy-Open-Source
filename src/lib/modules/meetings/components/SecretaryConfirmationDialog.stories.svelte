<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	// Note: SecretaryConfirmationDialog requires SvelteKit stores ($app/environment) and Convex mutations
	// which are not available in Storybook. Skipping stories for this component.
	// import SecretaryConfirmationDialog from './SecretaryConfirmationDialog.svelte';

	const { Story } = defineMeta({
		// component: SecretaryConfirmationDialog,
		title: 'Modules/Meetings/SecretaryConfirmationDialog',
		tags: ['autodocs']
	});
</script>

<!-- 
	SecretaryConfirmationDialog requires:
	- $app/environment (browser check)
	- useConvexClient for mutations
	- Toast notifications (svelte-sonner)
	These dependencies are not available in Storybook without complex setup.
	Component works correctly in the application context.
-->
