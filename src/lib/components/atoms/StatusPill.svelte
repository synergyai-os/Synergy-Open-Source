<script lang="ts">
	/**
	 * Status Pill Component (Linear-style)
	 *
	 * Atomic component for displaying status with icon and label.
	 * Uses Recipe System (CVA) for type-safe variant management.
	 * See: src/lib/design-system/recipes/statusPill.recipe.ts
	 */

	import {
		statusPillRecipe,
		statusPillIconRecipe,
		type StatusPillVariantProps
	} from '$lib/design-system/recipes';

	type Props = StatusPillVariantProps & {
		status: 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled';
		onChange?: (status: Props['status']) => void;
		readonly?: boolean;
	};

	let { status = 'backlog', onChange, readonly = false }: Props = $props();

	// Status configuration - icon and label mapping
	const statusConfig = {
		backlog: { icon: '○', label: 'Backlog' },
		todo: { icon: '○', label: 'Todo' },
		in_progress: { icon: '◐', label: 'In Progress' },
		done: { icon: '●', label: 'Done' },
		cancelled: { icon: '✕', label: 'Cancelled' }
	};

	const config = $derived(statusConfig[status]);

	// Apply recipe for pill styling
	const pillClasses = $derived(statusPillRecipe({ variant: status }));
	const iconClasses = $derived(statusPillIconRecipe());
</script>

<button
	type="button"
	class={pillClasses}
	disabled={readonly}
	onclick={() => !readonly && onChange?.(status)}
>
	<span class={iconClasses}>{config.icon}</span>
	<span>{config.label}</span>
</button>
