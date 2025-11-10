<script lang="ts">
	type Props = {
		active?: boolean;
		disabled?: boolean;
		title?: string;
		onclick?: () => void;
		children: import('svelte').Snippet;
	};

	let { active = false, disabled = false, title, onclick, children }: Props = $props();
</script>

<button
	type="button"
	{disabled}
	{title}
	{onclick}
	class="rounded-md p-control-button-padding transition-colors
    {active
		? 'bg-control-button-active text-primary'
		: 'text-secondary hover:bg-control-button-hover'}
    {disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
  "
>
	{@render children()}
</button>
