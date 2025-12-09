<script lang="ts">
	/**
	 * ProposalEvolutionList Component
	 *
	 * Displays the proposed changes (evolutions) in a proposal.
	 * Shows before → after values with change type indicators.
	 */
	import { Icon, Button } from '$lib/components/atoms';
	import type { ProposalEvolution } from '$lib/modules/org-chart/composables/useProposals.svelte';

	type Props = {
		evolutions: ProposalEvolution[];
		/** Allow removing evolutions (only in draft mode) */
		editable?: boolean;
		onRemove?: (evolutionId: string) => void;
		class?: string;
	};

	let { evolutions, editable = false, onRemove, class: className = '' }: Props = $props();

	// Parse JSON value for display
	function parseValue(value: string | undefined): string {
		if (!value) return '(empty)';
		try {
			const parsed = JSON.parse(value);
			if (typeof parsed === 'string') return parsed;
			if (typeof parsed === 'object') return JSON.stringify(parsed, null, 2);
			return String(parsed);
		} catch {
			return value;
		}
	}

	// Get icon and color for change type
	function getChangeTypeConfig(changeType: 'add' | 'update' | 'remove') {
		switch (changeType) {
			case 'add':
				return { icon: 'plus', color: 'text-success', label: 'Add' };
			case 'update':
				return { icon: 'edit', color: 'text-warning', label: 'Change' };
			case 'remove':
				return { icon: 'trash', color: 'text-error', label: 'Remove' };
		}
	}

	const sortedEvolutions = $derived([...evolutions].sort((a, b) => a.order - b.order));
</script>

{#if sortedEvolutions.length === 0}
	<div class="py-stack-item text-center text-body text-secondary">
		No proposed changes yet. Add changes to describe what you want to modify.
	</div>
{:else}
	<div class="flex flex-col gap-content {className}">
		{#each sortedEvolutions as evolution (evolution._id)}
			{@const config = getChangeTypeConfig(evolution.changeType)}
			<div
				class="
				bg-surface-alt rounded-card border border-default
				inset-sm
			"
			>
				<!-- Header: Field label + change type -->
				<div class="flex items-center justify-between mb-header">
					<div class="flex items-center gap-fieldGroup">
						<span class={config.color}>
							<Icon name={config.icon} size="sm" />
						</span>
						<span class="text-body font-medium text-primary">
							{evolution.fieldLabel}
						</span>
						<span class="text-small text-tertiary">({config.label})</span>
					</div>

					{#if editable && onRemove}
						<Button
							variant="ghost"
							size="sm"
							onclick={() => onRemove(evolution._id)}
							aria-label="Remove this change"
						>
							<Icon name="x" size="sm" />
						</Button>
					{/if}
				</div>

				<!-- Change content -->
				<div class="text-body">
					{#if evolution.changeType === 'add'}
						<!-- Add: Only show new value -->
						<div class="bg-success/10 border-success/20 rounded-input border px-input py-input">
							<span class="text-small font-mono text-success"
								>+ {parseValue(evolution.afterValue)}</span
							>
						</div>
					{:else if evolution.changeType === 'remove'}
						<!-- Remove: Only show old value -->
						<div class="bg-error/10 border-error/20 rounded-input border px-input py-input">
							<span class="text-small font-mono text-error line-through"
								>- {parseValue(evolution.beforeValue)}</span
							>
						</div>
					{:else}
						<!-- Update: Show before → after -->
						<div class="flex flex-col gap-fieldGroup">
							<div class="bg-error/10 border-error/20 rounded-input border px-input py-input">
								<span class="text-small font-mono text-error"
									>- {parseValue(evolution.beforeValue)}</span
								>
							</div>
							<div class="bg-success/10 border-success/20 rounded-input border px-input py-input">
								<span class="text-small font-mono text-success"
									>+ {parseValue(evolution.afterValue)}</span
								>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}
