<script lang="ts">
	import { Icon, Text } from '$lib/components/atoms';
	import {
		stepperRecipe,
		stepperStepRecipe,
		stepperConnectorRecipe,
		stepperStepButtonRecipe,
		type StepperVariantProps
	} from '$lib/design-system/recipes';

	type StepState = 'current' | 'completed' | 'pending' | 'error';

	interface Step {
		id: string;
		label: string;
	}

	type Props = StepperVariantProps & {
		steps: Step[];
		currentStep: number;
		onStepChange?: (stepIndex: number) => void;
		canNavigateToStep?: (stepIndex: number) => boolean;
		className?: string;
	};

	let {
		variant = 'default',
		steps,
		currentStep,
		onStepChange,
		canNavigateToStep,
		className = 'stepper-outer'
	}: Props = $props();

	// Determine step state
	function getStepState(stepIndex: number): StepState {
		if (stepIndex < currentStep) {
			return 'completed';
		}
		if (stepIndex === currentStep) {
			return 'current';
		}
		return 'pending';
	}

	// Check if step can be navigated to
	function canNavigate(stepIndex: number): boolean {
		if (canNavigateToStep) {
			return canNavigateToStep(stepIndex);
		}
		// Default: can navigate to completed steps or current step
		return stepIndex <= currentStep;
	}

	// Handle step click
	function handleStepClick(stepIndex: number) {
		if (onStepChange && canNavigate(stepIndex)) {
			onStepChange(stepIndex);
		}
	}

	const containerClasses = $derived([stepperRecipe({ variant }), className]);
	const stepSize = $derived(variant === 'compact' ? 'md' : 'xl');
</script>

<div class={containerClasses}>
	{#each steps as step, index (step.id)}
		<!-- Step Cell -->
		{@const stepState = getStepState(index)}
		{@const isDisabled = !canNavigate(index)}
		{@const isFirst = index === 0}
		{@const isLast = index === steps.length - 1}
		{@const connectorPosition = isFirst ? 'first' : isLast ? 'last' : 'middle'}
		{@const connectorState =
			stepState === 'completed' || stepState === 'current' ? 'completed' : 'pending'}
		<div class="stepper-cell relative flex min-w-0 flex-1 items-center justify-center">
			<!-- Step Circle and Label -->
			<button
				type="button"
				onclick={() => handleStepClick(index)}
				disabled={isDisabled}
				class={stepperStepButtonRecipe({ disabled: isDisabled })}
				style="opacity: {isDisabled ? 'var(--opacity-60)' : undefined}; z-index: 1;"
				aria-label={`Step ${index + 1}: ${step.label}`}
				aria-current={index === currentStep ? 'step' : undefined}
			>
				<div
					class={stepperStepRecipe({
						state: stepState,
						size: stepSize
					})}
				>
					{#if stepState === 'completed'}
						<Icon type="check-circle" size={variant === 'compact' ? 'md' : 'lg'} />
					{:else}
						<Text
							variant="body"
							size={variant === 'compact' ? 'sm' : 'lg'}
							weight="medium"
							as="span"
						>
							{index + 1}
						</Text>
					{/if}
				</div>

				<!-- Step Label -->
				<Text
					variant="body"
					size="sm"
					color={stepState === 'current'
						? 'default'
						: stepState === 'error'
							? 'error'
							: 'secondary'}
					weight={stepState === 'current' ? 'medium' : 'normal'}
					as="span"
				>
					{step.label}
				</Text>
			</button>

			<!-- Connector Segment (each cell has its own) -->
			<!-- Last cell also has connector, but it ends at 50% (center) -->
			<div
				class={stepperConnectorRecipe({
					position: connectorPosition,
					state: connectorState,
					size: stepSize
				})}
				aria-hidden="true"
			></div>
		</div>
	{/each}
</div>
