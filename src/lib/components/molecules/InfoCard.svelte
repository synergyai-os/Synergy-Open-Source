<script lang="ts">
	/**
	 * InfoCard - Reusable info/alert message card with icon
	 * Used for helper messages, info alerts, and notifications
	 */

	import { Text } from '$lib/components/atoms';
	import { infoCardRecipe } from '$lib/design-system/recipes';

	interface Props {
		icon?: string; // Emoji or icon character (e.g., '💡', 'ℹ️', '⚠️', '❌')
		message: string;
		variant?: 'info' | 'warning' | 'success' | 'error';
		class?: string;
	}

	let { icon, message, variant = 'info', class: className = '' }: Props = $props();

	// Default icon based on variant if not provided
	const defaultIcon = $derived(
		icon ||
			(variant === 'error'
				? '❌'
				: variant === 'warning'
					? '⚠️'
					: variant === 'success'
						? '✅'
						: 'ℹ️')
	);

	// Recipe handles all styling (background, text color, border color)
	const containerClasses = $derived([infoCardRecipe({ variant }), className]);
</script>

<div class={containerClasses}>
	<span class="text-button">{defaultIcon}</span>
	<!-- Text component inherits color from parent container (recipe applies dark color to container) -->
	<Text variant="body" size="sm" color="inherit" as="span">{message}</Text>
</div>
