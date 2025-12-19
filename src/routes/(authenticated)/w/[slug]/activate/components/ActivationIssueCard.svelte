<script lang="ts">
	import { Button, Icon, Text } from '$lib/components/atoms';
	import { cardRecipe } from '$lib/design-system/recipes';

	interface Props {
		code: string;
		message: string;
		entityName: string;
		actionUrl: string; // Kept for backward compatibility (not used in UI currently)
		onFixClick: () => void; // New: callback for stacked navigation
	}

	let { code, message, entityName, actionUrl: _actionUrl, onFixClick }: Props = $props();

	// Map issue codes to icons and colors
	const iconMap: Record<string, { icon: string; color: 'error' | 'warning' }> = {
		'GOV-01': { icon: 'user', color: 'error' },
		'GOV-02': { icon: 'file-text', color: 'error' },
		'GOV-03': { icon: 'check-square', color: 'error' },
		'ORG-01': { icon: 'circle', color: 'error' },
		'ORG-10': { icon: 'alert-triangle', color: 'error' }
	};

	const iconConfig = iconMap[code] ?? { icon: 'alert-circle', color: 'error' as const };
</script>

<div
	class={cardRecipe({ padding: 'md' })}
	style="border-color: var(--color-status-error); border-width: 1px;"
>
	<div class="gap-form flex items-start justify-between">
		<!-- Left: Icon + Content -->
		<div class="gap-form flex items-start">
			<div style="margin-top: var(--spacing-1);">
				<Icon type={iconConfig.icon} size="md" color={iconConfig.color} />
			</div>

			<div class="gap-fieldGroup flex flex-col">
				<!-- Code + Entity Name -->
				<div class="gap-fieldGroup flex items-center">
					<Text variant="label" size="sm" color="error" weight="medium" as="span">
						{code}
					</Text>
					{#if entityName}
						<Text variant="label" size="sm" color="default" weight="medium" as="span">
							{entityName}
						</Text>
					{/if}
				</div>

				<!-- Issue Message -->
				<Text variant="body" size="sm" color="default" as="p">
					{message}
				</Text>
			</div>
		</div>

		<!-- Right: Action Button -->
		<Button variant="secondary" size="sm" onclick={onFixClick}>Fix →</Button>
	</div>
</div>
