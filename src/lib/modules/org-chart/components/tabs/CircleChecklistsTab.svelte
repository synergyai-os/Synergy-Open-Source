<script lang="ts">
	import { getContext } from 'svelte';
	import { CIRCLE_DETAIL_KEY, type CircleDetailContext } from '../CircleDetailContext.svelte';
	import { EmptyState } from '$lib/components/molecules';

	// Get shared context (available for future use when tabs get real content)
	const ctx = getContext<CircleDetailContext>(CIRCLE_DETAIL_KEY);
	const circle = $derived(ctx.circle());
</script>

<EmptyState
	icon="check-circle"
	title="No checklists yet"
	description="Checklists and task lists for this circle will appear here. This feature will be available in a future update."
/>
