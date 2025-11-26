<script lang="ts">
	import { avatarRecipe } from '$lib/design-system/recipes';

	type Props = {
		initials: string;
		variant?: 'default' | 'brand';
		color?: string; // Optional: custom background color (overrides variant)
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	};

	let {
		initials,
		variant = 'default',
		color,
		size = 'md',
		class: className = ''
	}: Props = $props();

	const avatarClasses = $derived([avatarRecipe({ variant, size }), className]);
	
	// Size utilities don't exist - use direct token values for width/height (ensures perfect circle)
	const sizeMap = {
		sm: '2rem', // 32px - Small avatar (from design-tokens-base.json sizing.avatar.sm)
		md: '2.5rem', // 40px - Default avatar (from design-tokens-base.json sizing.avatar.md)
		lg: '3rem' // 48px - Large avatar (from design-tokens-base.json sizing.avatar.lg)
	};
	const avatarSizeStyle = $derived(`width: ${sizeMap[size]}; height: ${sizeMap[size]};`);
	const avatarColorStyle = $derived(color ? `background-color: ${color};` : '');
	const avatarStyle = $derived(
		[avatarColorStyle, avatarSizeStyle].filter((s) => s).join(' ')
	);
</script>

<div class={avatarClasses} style={avatarStyle}>
	{initials}
</div>
