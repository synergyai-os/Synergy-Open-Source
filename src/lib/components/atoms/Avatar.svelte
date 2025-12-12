<script lang="ts">
	import { avatarRecipe } from '$lib/design-system/recipes';

	type Props = {
		initials: string;
		variant?: 'default' | 'brand';
		color?: string; // Optional: custom background color (overrides variant)
		size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
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

	// Use sizing tokens for width/height to preserve circular shape
	const sizeTokenMap = {
		xxs: '--sizing-avatar-xxs',
		xs: '--sizing-avatar-xs',
		sm: '--sizing-avatar-sm',
		md: '--sizing-avatar-md',
		lg: '--sizing-avatar-lg'
	} as const;
	const avatarSizeStyle = $derived(
		`width: var(${sizeTokenMap[size]}); height: var(${sizeTokenMap[size]});`
	);
	const avatarColorStyle = $derived(color ? `background-color: ${color};` : '');
	const avatarStyle = $derived([avatarColorStyle, avatarSizeStyle].filter((s) => s).join(' '));
</script>

<div class={avatarClasses} style={avatarStyle}>
	{initials}
</div>
