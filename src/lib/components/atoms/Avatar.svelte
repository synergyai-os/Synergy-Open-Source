<script lang="ts">
	type Props = {
		initials: string;
		color?: string; // Optional: custom background color
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	};

	let { initials, color, size = 'md', class: className = '' }: Props = $props();

	const sizeClasses = {
		sm: 'size-avatar-sm text-label',
		md: 'size-avatar-md text-button',
		lg: 'size-avatar-lg text-body'
	};
</script>

<div
	class="flex flex-shrink-0 items-center justify-center rounded-avatar bg-accent-primary font-semibold text-primary {sizeClasses[
		size
	]} {className}"
	style={color ? `background-color: ${color}` : ''}
>
	{initials}
</div>
