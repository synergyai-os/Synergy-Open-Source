<script lang="ts">
	/**
	 * Assignee Selector Component (Linear-style)
	 *
	 * Atomic component for user assignment with avatar
	 * Follows pattern: ui-patterns.md#L680 (Atomic Design)
	 */

	type Assignee = {
		id: string;
		name: string;
		avatar?: string;
		initials: string;
		color: string;
	};

	type Props = {
		assignee?: Assignee;
		onChange?: (assignee: Assignee | undefined) => void;
		readonly?: boolean;
	};

	let { assignee, onChange, readonly = false }: Props = $props();

	// TODO: Re-enable when needed for dynamic initials generation
	// function _getInitials(name: string): string {
	// 	return name
	// 		.split(' ')
	// 		.map((n) => n[0])
	// 		.join('')
	// 		.toUpperCase()
	// 		.slice(0, 2);
	// }
</script>

<button
	type="button"
	class="gap-2-wide text-button hover:bg-hover-solid inline-flex items-center rounded-button bg-transparent px-2 py-1 font-normal text-secondary transition-colors"
	disabled={readonly}
	onclick={() => !readonly && onChange?.(assignee)}
>
	{#if assignee}
		{#if assignee.avatar}
			<img src={assignee.avatar} alt={assignee.name} class="icon-md rounded-avatar" />
		{:else}
			<div
				class="icon-md flex items-center justify-center rounded-avatar text-label font-medium text-primary"
				style="background-color: {assignee.color}"
			>
				{assignee.initials}
			</div>
		{/if}
		<span>{assignee.name}</span>
	{:else}
		<div class="icon-md rounded-avatar bg-base"></div>
		<span class="text-tertiary">Unassigned</span>
	{/if}
</button>
