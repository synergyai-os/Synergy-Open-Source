<script lang="ts">
	import Badge from '$lib/components/atoms/Badge.svelte';
	import type { ProposalStatus } from '$lib/modules/org-chart/composables/useProposals.svelte';

	type Props = {
		status: ProposalStatus;
		size?: 'sm' | 'md' | 'lg';
	};

	let { status, size = 'sm' }: Props = $props();

	const badgeConfig = $derived.by(() => {
		switch (status) {
			case 'draft':
				return {
					variant: 'default' as const,
					label: 'Draft',
					icon: '📝'
				};
			case 'submitted':
				return {
					variant: 'primary' as const,
					label: 'Submitted',
					icon: '📤'
				};
			case 'in_meeting':
				return {
					variant: 'warning' as const,
					label: 'In Meeting',
					icon: '🗣️'
				};
			case 'objections':
				return {
					variant: 'error' as const,
					label: 'Objections',
					icon: '⚠️'
				};
			case 'integrated':
				return {
					variant: 'primary' as const,
					label: 'Integrated',
					icon: '🔄'
				};
			case 'approved':
				return {
					variant: 'success' as const,
					label: 'Approved',
					icon: '✅'
				};
			case 'rejected':
				return {
					variant: 'error' as const,
					label: 'Rejected',
					icon: '❌'
				};
			case 'withdrawn':
				return {
					variant: 'default' as const,
					label: 'Withdrawn',
					icon: '↩️'
				};
			default:
				return {
					variant: 'default' as const,
					label: status,
					icon: '❓'
				};
		}
	});
</script>

<Badge variant={badgeConfig.variant} {size}>
	<span class="mr-1">{badgeConfig.icon}</span>
	{badgeConfig.label}
</Badge>
