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
	
	function getInitials(name: string): string {
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<button
	type="button"
	class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-normal bg-transparent hover:bg-hover-solid transition-colors text-secondary"
	disabled={readonly}
	onclick={() => !readonly && onChange?.(assignee)}
>
	{#if assignee}
		{#if assignee.avatar}
			<img src={assignee.avatar} alt={assignee.name} class="w-5 h-5 rounded-full" />
		{:else}
			<div
				class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-white"
				style="background-color: {assignee.color}"
			>
				{assignee.initials}
			</div>
		{/if}
		<span>{assignee.name}</span>
	{:else}
		<div class="w-5 h-5 rounded-full bg-base"></div>
		<span class="text-tertiary">Unassigned</span>
	{/if}
</button>

