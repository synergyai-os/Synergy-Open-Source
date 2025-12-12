<script lang="ts">
	type Props = {
		label?: string;
		children: import('svelte').Snippet;
	};

	let { label, children }: Props = $props();
</script>

<div class="flex flex-col" style="gap: var(--spacing-1);">
	{#if label}
		<span class="text-label text-tertiary tracking-wider uppercase">
			{label}
		</span>
	{/if}
	<div class="flex items-center" style="gap: var(--spacing-1);">
		{@render children()}
	</div>
</div>
