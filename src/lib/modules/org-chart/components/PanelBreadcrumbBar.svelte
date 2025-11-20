<script lang="ts">
	import type { NavigationLayer } from '$lib/modules/core/composables/useNavigationStack.svelte';

	let {
		layer,
		onclick
	}: {
		layer: NavigationLayer;
		onclick: () => void;
	} = $props();
</script>

<button
	type="button"
	class="panel-breadcrumb-bar hover:panel-breadcrumb-bar-hover"
	{onclick}
	aria-label="Go back to {layer.name}"
>
	<span class="panel-breadcrumb-text">{layer.name}</span>
</button>
