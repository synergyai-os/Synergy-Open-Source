<script lang="ts">
	type Props = {
		label?: string;
		children: import('svelte').Snippet;
	};

	let { label, children }: Props = $props();
</script>

<div class="flex flex-col gap-control-item-gap">
	{#if label}
		<span class="text-label text-tertiary uppercase tracking-wider px-1">
			{label}
		</span>
	{/if}
	<div class="flex items-center gap-control-item-gap">
		{@render children()}
	</div>
</div>

