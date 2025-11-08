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
	onclick={onclick}
	class="p-control-button-padding rounded-md transition-colors
    {active ? 'bg-control-button-active text-primary' : 'hover:bg-control-button-hover text-secondary'}
    {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  "
>
	{@render children()}
</button>

