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
	class="inline-flex items-center gap-2-wide rounded-button bg-transparent px-2 py-1 text-button font-normal text-secondary transition-colors hover:bg-hover-solid"
	disabled={readonly}
	onclick={() => !readonly && onChange?.(assignee)}
>
	{#if assignee}
		{#if assignee.avatar}
			<img src={assignee.avatar} alt={assignee.name} class="icon-md rounded-avatar" />
		{:else}
			<div
				class="flex icon-md items-center justify-center rounded-avatar text-label font-medium text-primary"
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
