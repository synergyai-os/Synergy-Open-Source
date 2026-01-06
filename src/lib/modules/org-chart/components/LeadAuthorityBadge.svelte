<script lang="ts">
	import Badge from '$lib/components/atoms/Badge.svelte';
	import type { CircleSummary } from '$lib/infrastructure/organizational-model';

	type Props = {
		leadAuthority: CircleSummary['leadAuthority'];
	};

	let { leadAuthority }: Props = $props();

	const effectiveAuthority = $derived(leadAuthority ?? 'decides');

	const badgeConfig = $derived.by(() => {
		switch (effectiveAuthority) {
			case 'decides':
				return {
					variant: 'default' as const,
					label: 'Decides',
					icon: '👔'
				};
			case 'facilitates':
				return {
					variant: 'primary' as const,
					label: 'Facilitates',
					icon: '🤝'
				};
			case 'convenes':
				return {
					variant: 'warning' as const,
					label: 'Convenes',
					icon: '🌱'
				};
		}
	});
</script>

<Badge variant={badgeConfig.variant} size="sm">
	<span class="mr-1">{badgeConfig.icon}</span>
	{badgeConfig.label}
</Badge>
