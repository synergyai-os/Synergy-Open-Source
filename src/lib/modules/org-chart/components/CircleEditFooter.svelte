<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
	import type { UseEditCircleReturn } from '../composables/useEditCircle.svelte';
	import type { LeadAuthority } from '$lib/infrastructure/organizational-model/constants';

	interface Props {
		editCircle: UseEditCircleReturn;
		isDesignPhase: boolean;
		leadAuthority: LeadAuthority;
		isCircleLead: boolean;
		onCancel: () => void;
		onSave: () => Promise<void>;
		onAutoApprove: () => Promise<void>;
		onProposeChange: () => Promise<void>;
	}

	let {
		editCircle,
		isDesignPhase,
		leadAuthority,
		isCircleLead,
		onCancel,
		onSave,
		onAutoApprove,
		onProposeChange
	}: Props = $props();
</script>

<div
	class="border-base py-header gap-button bg-surface px-page sticky bottom-0 z-20 flex items-center justify-end border-t"
>
	{#if editCircle.error}
		<div class="mr-auto">
			<Text variant="body" size="sm" color="error">{editCircle.error}</Text>
		</div>
	{/if}
	<Button variant="outline" onclick={onCancel} disabled={editCircle.isSaving}>Cancel</Button>

	{#if isDesignPhase}
		<!-- Design phase: Direct save for all members -->
		<Button
			variant="primary"
			onclick={onSave}
			disabled={editCircle.isSaving || !editCircle.isDirty}
		>
			{editCircle.isSaving ? 'Saving...' : 'Save'}
		</Button>
	{:else if leadAuthority === 'decides' && isCircleLead}
		<!-- Decides + Circle Lead: Auto-approve flow -->
		<Button
			variant="primary"
			onclick={onAutoApprove}
			disabled={editCircle.isSaving || !editCircle.isDirty}
		>
			{editCircle.isSaving ? 'Saving...' : 'Save'}
		</Button>
	{:else if leadAuthority === 'convenes'}
		<!-- Convenes: View only (no save button) -->
		<Text variant="body" size="sm" color="secondary">Convenes circles cannot be edited</Text>
	{:else}
		<!-- Facilitates or non-lead: Propose Change flow -->
		<Button
			variant="primary"
			onclick={onProposeChange}
			disabled={editCircle.isSaving || !editCircle.isDirty}
		>
			{editCircle.isSaving ? 'Proposing...' : 'Propose Change'}
		</Button>
	{/if}
</div>
