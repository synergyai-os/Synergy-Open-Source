<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	// Note: AgendaItemView requires complex dependencies including NoteEditor composable,
	// useAgendaNotes composable, and Convex queries which are not available in Storybook.
	// Skipping stories for this component.
	// import AgendaItemView from './AgendaItemView.svelte';

	const { Story } = defineMeta({
		// component: AgendaItemView,
		title: 'Modules/Meetings/AgendaItemView',
		tags: ['autodocs']
	});
</script>

<!-- 
	AgendaItemView requires:
	- $app/environment (browser check)
	- useAgendaNotes composable for notes management
	- NoteEditor component (from core module)
	- ActionItemsList and DecisionsList components (which also require Convex)
	- Complex state management
	These dependencies are not available in Storybook without complex setup.
	Component works correctly in the application context.
-->
