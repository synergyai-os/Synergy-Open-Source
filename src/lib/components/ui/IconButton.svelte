<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		icon: Snippet;
		onclick?: (e?: MouseEvent) => void;
		title?: string;
		ariaLabel: string;
		variant?: 'ghost' | 'solid';
		disabled?: boolean;
		class?: string;
	};

	let {
		icon,
		onclick,
		title,
		ariaLabel,
		variant = 'ghost',
		disabled = false,
		class: className = ''
	}: Props = $props();
</script>

<button
	type="button"
	{onclick}
	{title}
	{disabled}
	aria-label={ariaLabel}
	class="flex h-8 w-8 items-center justify-center rounded-md transition-colors
		{variant === 'ghost'
		? 'text-secondary hover:bg-hover-solid hover:text-primary'
		: 'bg-surface text-primary hover:bg-hover-solid'}
		{disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
		{className}"
>
	{@render icon()}
</button>
