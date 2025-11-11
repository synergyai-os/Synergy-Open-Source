<script lang="ts">
	/**
	 * Project Selector Component (Linear-style)
	 *
	 * Atomic component for project selection
	 * Follows pattern: ui-patterns.md#L680 (Atomic Design)
	 */

	type Project = {
		id: string;
		name: string;
		icon?: string;
		color: string;
	};

	type Props = {
		project?: Project;
		onChange?: (project: Project | undefined) => void;
		readonly?: boolean;
	};

	let { project, onChange, readonly = false }: Props = $props();
</script>

<button
	type="button"
	class="inline-flex items-center gap-1.5 rounded-md bg-transparent px-2 py-1 text-sm font-normal text-secondary transition-colors hover:bg-hover-solid"
	disabled={readonly}
	onclick={() => !readonly && onChange?.(project)}
>
	{#if project}
		{#if project.icon}
			<span class="text-base leading-none">{project.icon}</span>
		{:else}
			<div class="h-3 w-3 rounded-sm" style="background-color: {project.color}"></div>
		{/if}
		<span>{project.name}</span>
	{:else}
		<svg class="h-4 w-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
			/>
		</svg>
		<span class="text-tertiary">No project</span>
	{/if}
</button>
