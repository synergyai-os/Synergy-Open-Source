<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Stepper from './Stepper.svelte';

	const { Story } = defineMeta({
		component: Stepper,
		title: 'Design System/Molecules/Stepper',
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['default', 'compact']
			},
			currentStep: {
				control: { type: 'number' },
				min: 0,
				max: 2
			}
		}
	});
</script>

<Story
	name="Default"
	args={{
		steps: [
			{ id: '1', label: 'Attendees & Type' },
			{ id: '2', label: 'Date & Time' },
			{ id: '3', label: 'Finalize' }
		],
		currentStep: 0,
		variant: 'default'
	}}
>
	{#snippet template(args)}
		<Stepper
			steps={args.steps}
			currentStep={args.currentStep}
			variant={args.variant}
			onStepChange={(index) => {
				console.log('Step changed to:', index);
			}}
		/>
	{/snippet}
</Story>

<Story
	name="Step 2 Active"
	args={{
		steps: [
			{ id: '1', label: 'Attendees & Type' },
			{ id: '2', label: 'Date & Time' },
			{ id: '3', label: 'Finalize' }
		],
		currentStep: 1,
		variant: 'default'
	}}
>
	{#snippet template(args)}
		<Stepper
			steps={args.steps}
			currentStep={args.currentStep}
			variant={args.variant}
			onStepChange={(index) => {
				console.log('Step changed to:', index);
			}}
		/>
	{/snippet}
</Story>

<Story
	name="Step 3 Active (All Completed)"
	args={{
		steps: [
			{ id: '1', label: 'Attendees & Type' },
			{ id: '2', label: 'Date & Time' },
			{ id: '3', label: 'Finalize' }
		],
		currentStep: 2,
		variant: 'default'
	}}
>
	{#snippet template(args)}
		<Stepper
			steps={args.steps}
			currentStep={args.currentStep}
			variant={args.variant}
			onStepChange={(index) => {
				console.log('Step changed to:', index);
			}}
		/>
	{/snippet}
</Story>

<Story
	name="Compact Variant"
	args={{
		steps: [
			{ id: '1', label: 'Attendees & Type' },
			{ id: '2', label: 'Date & Time' },
			{ id: '3', label: 'Finalize' }
		],
		currentStep: 1,
		variant: 'compact'
	}}
>
	{#snippet template(args)}
		<Stepper
			steps={args.steps}
			currentStep={args.currentStep}
			variant={args.variant}
			onStepChange={(index) => {
				console.log('Step changed to:', index);
			}}
		/>
	{/snippet}
</Story>

<Story
	name="With Navigation Restriction"
	args={{
		steps: [
			{ id: '1', label: 'Attendees & Type' },
			{ id: '2', label: 'Date & Time' },
			{ id: '3', label: 'Finalize' }
		],
		currentStep: 0,
		variant: 'default'
	}}
>
	{#snippet template(args)}
		<Stepper
			steps={args.steps}
			currentStep={args.currentStep}
			variant={args.variant}
			canNavigateToStep={(index) => index <= args.currentStep}
			onStepChange={(index) => {
				console.log('Step changed to:', index);
			}}
		/>
	{/snippet}
</Story>
