<script lang="ts">
	/**
	 * Badge Component
	 *
	 * Displays a badge with semantic variants using design tokens.
	 * Used for status indicators, labels, and tags.
	 */

	type Variant = 'system' | 'custom' | 'default';

	type Props = {
		variant?: Variant;
		children: import('svelte').Snippet;
		class?: string;
	};

	let { variant = 'default', children, class: customClass = '' }: Props = $props();

	const variantClasses: Record<Variant, string> = {
		system: 'bg-accent-primary/10 text-accent-primary border-accent-primary/20',
		custom: 'bg-tag text-tag border-base',
		default: 'bg-tag text-tag border-base'
	};
</script>

<span
	class="inline-flex items-center rounded-badge border px-badge py-badge text-badge font-medium {variantClasses[
		variant
	]} {customClass}"
>
	{@render children()}
</span>
