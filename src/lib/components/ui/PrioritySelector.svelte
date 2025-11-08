<script lang="ts">
	/**
	 * Priority Selector Component (Linear-style)
	 * 
	 * Atomic component for priority levels
	 * Follows pattern: ui-patterns.md#L680 (Atomic Design)
	 */
	
	type Props = {
		priority: 'none' | 'low' | 'medium' | 'high' | 'urgent';
		onChange?: (priority: Props['priority']) => void;
		readonly?: boolean;
	};
	
	let { priority = 'none', onChange, readonly = false }: Props = $props();
	
	const priorityConfig = {
		none: { icon: '---', label: 'No priority', color: 'text-gray-400' },
		low: { icon: '▁', label: 'Low', color: 'text-gray-500' },
		medium: { icon: '▃', label: 'Medium', color: 'text-yellow-500' },
		high: { icon: '▅', label: 'High', color: 'text-orange-500' },
		urgent: { icon: '▇', label: 'Urgent', color: 'text-red-500' }
	};
	
	const config = $derived(priorityConfig[priority]);
</script>

<button
	type="button"
	class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-normal bg-transparent hover:bg-hover-solid transition-colors {config.color}"
	disabled={readonly}
	onclick={() => !readonly && onChange?.(priority)}
>
	<span class="text-base leading-none">{config.icon}</span>
	<span>{config.label}</span>
</button>

