<script lang="ts">
	import Icon from '$lib/components/atoms/Icon.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	interface Props {
		title?: string;
		message: string;
		onRetry?: () => void;
	}

	let { title = 'Something went wrong', message, onRetry }: Props = $props();
</script>

<div class="flex h-full items-center justify-center">
	<div class="flex flex-col items-center gap-content text-center">
		<Icon type="alert-circle" size="lg" color="error" />
		<Text variant="body" size="md" color="error" weight="medium" as="p">
			{title}
		</Text>
		<Text variant="body" size="md" color="secondary" as="p">
			{message}
		</Text>
		{#if onRetry}
			<Button variant="primary" size="md" onclick={onRetry} class="mt-fieldGroup">
				Retry
			</Button>
		{/if}
	</div>
</div>

