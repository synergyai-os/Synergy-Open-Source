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
		none: { icon: '---', label: 'No priority', color: 'text-tertiary' },
		low: { icon: '▁', label: 'Low', color: 'text-tertiary' },
		medium: { icon: '▃', label: 'Medium', color: 'text-yellow-500' }, // TODO: Add warning token
		high: { icon: '▅', label: 'High', color: 'text-orange-500' }, // TODO: Add warning token
		urgent: { icon: '▇', label: 'Urgent', color: 'text-error' }
	};

	const config = $derived(priorityConfig[priority]);
</script>

<button
	type="button"
	class="inline-flex items-center gap-icon-wide rounded-button bg-transparent px-section py-section text-button font-normal transition-colors hover:bg-hover-solid {config.color}"
	disabled={readonly}
	onclick={() => !readonly && onChange?.(priority)}
>
	<span class="text-body leading-none">{config.icon}</span>
	<span>{config.label}</span>
</button>
