<script lang="ts">
	import {
		Button,
		Text,
		Icon,
		Heading,
		FormInput,
		Combobox,
		FormSelect,
		Badge
	} from '$lib/components/atoms';
	import Stepper from '$lib/components/molecules/Stepper.svelte';
	import { DateTimeField } from '$lib/components/molecules';
	import { ToggleSwitch } from '$lib/components/molecules';
	import { ToggleGroup } from '$lib/components/atoms';
	import { toggleGroupRootRecipe, toggleGroupItemRecipe } from '$lib/design-system/recipes';
	import { parseDate, Time } from '@internationalized/date';

	// Mock data for components
	const comboboxOptions = [
		{ value: '1', label: 'Governance' },
		{ value: '2', label: 'Weekly Tactical' },
		{ value: '3', label: 'Daily Standup' }
	];
	let selectedCombobox = $state('');

	const formSelectOptions = [
		{ value: 'daily', label: 'Daily' },
		{ value: 'weekly', label: 'Weekly' },
		{ value: 'monthly', label: 'Monthly' }
	];
	let selectedFormSelect = $state('daily');

	let formInputValue = $state('');
	let dateValue = $state(parseDate('2025-01-15'));
	let timeValue = $state(new Time(14, 30));
	let durationValue = $state(60);
	let toggleSwitchValue = $state(false);
	let toggleGroupValue = $state(['0']);

	const steps = [
		{ id: 'step1', label: 'Step 1' },
		{ id: 'step2', label: 'Step 2' },
		{ id: 'step3', label: 'Step 3' }
	];
</script>

<div class="gap-section px-page py-page flex flex-col">
	<Heading level="1">Design System Test Page</Heading>
	<Text>All components from CreateMeetingModal displayed vertically with 'md' size</Text>

	<Heading level="2">Approved</Heading>

	<!-- Heading -->
	<div class="gap-fieldGroup flex flex-col">
		<Text variant="label" color="tertiary">Heading</Text>
		<Heading level="3">Add meeting</Heading>
	</div>

	<Heading level="2" color="secondary">Not Approved</Heading>

	<!-- Stepper -->
	<div class="gap-fieldGroup flex flex-col">
		<Text variant="label" color="tertiary">Stepper</Text>
		<Stepper {steps} currentStep={1} onStepChange={() => {}} canNavigateToStep={() => true} />
	</div>

	<!-- Combobox -->
	<div class="gap-fieldGroup flex flex-col">
		<Text variant="label" color="tertiary">Combobox</Text>
		<Combobox
			id="test-combobox"
			label="Meeting Type"
			bind:value={selectedCombobox}
			options={comboboxOptions}
			size="md"
			showLabel={true}
			required={true}
		/>
	</div>

	<!-- FormInput -->
	<div class="gap-fieldGroup flex flex-col">
		<Text variant="label" color="tertiary">FormInput</Text>
		<FormInput
			id="test-input"
			label="Meeting Title"
			type="text"
			bind:value={formInputValue}
			placeholder="Meeting title"
			required={true}
		/>
	</div>

	<!-- DateTimeField -->
	<div class="gap-fieldGroup flex flex-col">
		<Text variant="label" color="tertiary">DateTimeField</Text>
		<DateTimeField
			id="test-datetime"
			bind:date={dateValue}
			bind:time={timeValue}
			bind:duration={durationValue}
			required={true}
		/>
	</div>

	<!-- FormSelect -->
	<div class="gap-fieldGroup flex flex-col">
		<Text variant="label" color="tertiary">FormSelect</Text>
		<FormSelect
			id="test-select"
			label="Frequency"
			bind:value={selectedFormSelect}
			options={formSelectOptions}
			required={true}
		/>
	</div>

	<!-- ToggleSwitch -->
	<div class="gap-fieldGroup flex flex-col">
		<Text variant="label" color="tertiary">ToggleSwitch</Text>
		<div class="gap-fieldGroup flex items-center">
			<ToggleSwitch checked={toggleSwitchValue} onChange={(val) => (toggleSwitchValue = val)} />
			<Text variant="body" size="sm" color="default">Repeat this meeting</Text>
		</div>
	</div>

	<!-- ToggleGroup -->
	<div class="gap-fieldGroup flex flex-col">
		<Text variant="label" color="tertiary">ToggleGroup</Text>
		<ToggleGroup.Root type="multiple" bind:value={toggleGroupValue} class={toggleGroupRootRecipe()}>
			<ToggleGroup.Item value="0" class={toggleGroupItemRecipe()}>Mon</ToggleGroup.Item>
			<ToggleGroup.Item value="1" class={toggleGroupItemRecipe()}>Tue</ToggleGroup.Item>
			<ToggleGroup.Item value="2" class={toggleGroupItemRecipe()}>Wed</ToggleGroup.Item>
			<ToggleGroup.Item value="3" class={toggleGroupItemRecipe()}>Thu</ToggleGroup.Item>
			<ToggleGroup.Item value="4" class={toggleGroupItemRecipe()}>Fri</ToggleGroup.Item>
		</ToggleGroup.Root>
	</div>

	<!-- Buttons -->
	<div class="gap-fieldGroup flex flex-col">
		<Text variant="label" color="tertiary">Buttons</Text>
		<div class="gap-fieldGroup flex flex-wrap items-center">
			<Button variant="primary" size="md">Primary</Button>
			<Button variant="outline" size="md">Outline</Button>
			<Button variant="ghost" size="md">Ghost</Button>
			<Button variant="primary" iconOnly ariaLabel="Close" size="md">
				<Icon type="close" size="md" />
			</Button>
		</div>
	</div>

	<!-- Badge -->
	<div class="gap-fieldGroup flex flex-col">
		<Text variant="label" color="tertiary">Badge</Text>
		<div class="gap-fieldGroup flex flex-wrap items-center">
			<Badge variant="primary" size="md">Primary</Badge>
			<Badge variant="neutral" size="md">Neutral</Badge>
		</div>
	</div>

	<!-- Text Variants -->
	<div class="gap-fieldGroup flex flex-col">
		<Text variant="label" color="tertiary">Text Variants</Text>
		<div class="gap-fieldGroup flex flex-col">
			<Text variant="body" size="base" color="default">Body text (base)</Text>
			<Text variant="body" size="sm" color="default">Body text (sm)</Text>
			<Text variant="label" color="default">Label text</Text>
			<Text variant="caption" color="secondary">Caption text</Text>
			<Text variant="body" size="sm" color="secondary">Secondary text</Text>
			<Text variant="body" size="sm" color="tertiary">Tertiary text</Text>
			<Text variant="label" color="error">Error text</Text>
		</div>
	</div>

	<!-- Radio Buttons (Privacy section) -->
	<div class="gap-fieldGroup flex flex-col">
		<Text variant="label" color="tertiary">Radio Buttons</Text>
		<fieldset>
			<legend>
				<Text variant="body" size="sm" color="default">Privacy</Text>
			</legend>
			<div class="gap-fieldGroup flex flex-col">
				<label class="gap-fieldGroup flex items-start">
					<input type="radio" name="privacy" value="public" class="mt-fieldGroup" />
					<div>
						<Text variant="body" size="sm" color="default">Public</Text>
						<Text variant="label" color="secondary">
							All workspace members can see this meeting
						</Text>
					</div>
				</label>
				<label class="gap-fieldGroup flex items-start">
					<input type="radio" name="privacy" value="private" class="mt-fieldGroup" />
					<div>
						<Text variant="body" size="sm" color="default">Private</Text>
						<Text variant="label" color="secondary">
							Only invited attendees can see this meeting
						</Text>
					</div>
				</label>
			</div>
		</fieldset>
	</div>
</div>
