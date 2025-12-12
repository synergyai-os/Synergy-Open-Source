<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	// Redirect to inbox as default workspace view
	onMount(() => {
		const slug = $page.params.slug;
		if (slug) {
			goto(`/w/${slug}/inbox`, { replaceState: true });
		}
	});
</script>

<!-- Temporary loading state while redirecting -->
<div class="flex h-screen items-center justify-center">
	<div class="text-secondary">Loading workspace...</div>
</div>
