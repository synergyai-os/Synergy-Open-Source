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
		backlog: { icon: '○', label: 'Backlog', color: 'text-gray-500' },
		todo: { icon: '○', label: 'Todo', color: 'text-gray-500' },
		in_progress: { icon: '◐', label: 'In Progress', color: 'text-blue-500' },
		done: { icon: '●', label: 'Done', color: 'text-green-500' },
		cancelled: { icon: '✕', label: 'Cancelled', color: 'text-gray-400' }
	};
	
	const config = $derived(statusConfig[status]);
</script>

<button
	type="button"
	class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-normal bg-transparent hover:bg-hover-solid transition-colors {config.color}"
	disabled={readonly}
	onclick={() => !readonly && onChange?.(status)}
>
	<span class="text-base leading-none">{config.icon}</span>
	<span>{config.label}</span>
</button>

