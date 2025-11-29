<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<!-- Wrapper for Storybook stories with breathing room -->
<!-- Height auto-sizes to content + padding (16px top/bottom, 24px left/right) -->
<div
	data-storybook-wrapper="true"
	style="width: 100%; min-height: fit-content; padding: 16px 24px; margin: 0; box-sizing: border-box;"
>
	{@render children()}
</div>
