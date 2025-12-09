<script lang="ts">
	import Badge from '$lib/components/atoms/Badge.svelte';
	import type { CircleSummary } from '$lib/infrastructure/organizational-model';

	type Props = {
		circleType: CircleSummary['circleType'];
	};

	let { circleType }: Props = $props();

	const effectiveType = $derived(circleType ?? 'hierarchy');

	const badgeConfig = $derived.by(() => {
		switch (effectiveType) {
			case 'hierarchy':
				return {
					variant: 'default' as const,
					label: 'Hierarchy',
					icon: '👔'
				};
			case 'empowered_team':
				return {
					variant: 'primary' as const,
					label: 'Empowered Team',
					icon: '🚀'
				};
			case 'guild':
				return {
					variant: 'warning' as const,
					label: 'Guild',
					icon: '🤝'
				};
			case 'hybrid':
				return {
					variant: 'success' as const,
					label: 'Hybrid',
					icon: '⚖️'
				};
		}
	});
</script>

<Badge variant={badgeConfig.variant} size="sm">
	<span class="mr-1">{badgeConfig.icon}</span>
	{badgeConfig.label}
</Badge>
