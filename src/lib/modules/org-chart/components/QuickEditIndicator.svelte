<script lang="ts">
	import Text from '$lib/components/atoms/Text.svelte';

	type Props = {
		status: 'idle' | 'saving' | 'saved';
	};

	let { status }: Props = $props();

	const statusText = $derived(() => {
		switch (status) {
			case 'saving':
				return 'Saving...';
			case 'saved':
				return 'Saved';
			default:
				return '';
		}
	});

	const statusColor = $derived(() => {
		switch (status) {
			case 'saving':
				return 'secondary';
			case 'saved':
				return 'success';
			default:
				return 'tertiary';
		}
	});
</script>

{#if status !== 'idle'}
	<div class="px-button flex items-center gap-1 py-1">
		<Text variant="caption" size="sm" color={statusColor}>
			{statusText}
		</Text>
	</div>
{/if}
