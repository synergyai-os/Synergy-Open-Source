<script lang="ts">
	/**
	 * Status Pill Component (Linear-style)
	 *
	 * Atomic component for displaying status with icon and label
	 * Follows pattern: ui-patterns.md#L680 (Atomic Design)
	 */

	type Props = {
		status: 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled';
		onChange?: (status: Props['status']) => void;
		readonly?: boolean;
	};

	let { status = 'backlog', onChange, readonly = false }: Props = $props();

	const statusConfig = {
		backlog: { icon: '○', label: 'Backlog', color: 'text-tertiary' },
		todo: { icon: '○', label: 'Todo', color: 'text-tertiary' },
		in_progress: { icon: '◐', label: 'In Progress', color: 'text-accent-primary' },
		done: { icon: '●', label: 'Done', color: 'text-success' },
		cancelled: { icon: '✕', label: 'Cancelled', color: 'text-tertiary' }
	};

	const config = $derived(statusConfig[status]);
</script>

<button
	type="button"
	class="gap-2-wide text-button hover:bg-hover-solid inline-flex items-center rounded-button bg-transparent px-2 py-1 font-normal transition-colors {config.color}"
	disabled={readonly}
	onclick={() => !readonly && onChange?.(status)}
>
	<span class="text-body leading-none">{config.icon}</span>
	<span>{config.label}</span>
</button>
