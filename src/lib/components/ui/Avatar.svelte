<script lang="ts">
	type Props = {
		initials: string;
		color?: string; // Optional: custom background color
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	};

	let { initials, color, size = 'md', class: className = '' }: Props = $props();

	const sizeClasses = {
		sm: 'h-8 w-8 text-xs',
		md: 'h-10 w-10 text-sm',
		lg: 'h-12 w-12 text-base'
	};
</script>

<div
	class="flex flex-shrink-0 items-center justify-center rounded-full bg-accent-primary font-semibold text-white {sizeClasses[
		size
	]} {className}"
	style={color ? `background-color: ${color}` : ''}
>
	{initials}
</div>
