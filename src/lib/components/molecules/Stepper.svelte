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

	// Track previous step to detect completion transitions
	// eslint-disable-next-line svelte/prefer-writable-derived
	let previousStep = $state(currentStep);

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

	// Check if step was just completed (for animation trigger)
	function wasJustCompleted(stepIndex: number): boolean {
		// Step is completed now AND wasn't completed before
		const isCompleted = stepIndex < currentStep;
		const wasCompleted = stepIndex < previousStep;
		return isCompleted && !wasCompleted;
	}

	// Update previous step when current step changes
	$effect(() => {
		previousStep = currentStep;
	});

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

	// Check if step was just completed (for animation trigger)
	function wasJustCompleted(stepIndex: number): boolean {
		// Step is completed now AND wasn't completed before
		const isCompleted = stepIndex < currentStep;
		const wasCompleted = stepIndex < previousStep;
		return isCompleted && !wasCompleted;
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
	// Default to 'md' (20px) for compact Linear-inspired design, 'lg' for spacious variant
	const stepSize = $derived(variant === 'compact' ? 'md' : 'lg');
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
		{@const justCompleted = wasJustCompleted(index)}
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
					class:stepper-step-completed={justCompleted}
					class:stepper-step-just-completed={justCompleted}
				>
					{#if stepState === 'completed'}
						<Icon
							type="check-circle"
							size={variant === 'compact' ? 'sm' : 'md'}
							class={justCompleted ? 'stepper-checkmark-bounce' : ''}
						/>
					{:else}
						<Text
							variant="body"
							size={variant === 'compact' ? 'sm' : 'base'}
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

<style>
	/* Bounce animation for checkmark when step completes */
	@keyframes stepper-checkmark-bounce {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		50% {
			transform: scale(1.2);
			opacity: 1;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.stepper-checkmark-bounce {
		animation: stepper-checkmark-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	/* Pulse effect for completed step circle */
	@keyframes stepper-step-pulse {
		0% {
			transform: scale(0.8);
			opacity: 0;
		}
		50% {
			transform: scale(1.15);
			opacity: 1;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.stepper-step-just-completed {
		animation: stepper-step-pulse 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}
</style>
