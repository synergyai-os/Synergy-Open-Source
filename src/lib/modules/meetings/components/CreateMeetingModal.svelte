<script lang="ts">
	/**
	 * CreateMeetingModal - 3-step stepper wizard for meeting creation
	 * Step 1: Attendees & Meeting Type
	 * Step 2: Date, Time & Recurrence
	 * Step 3: Finalize (Title, Review)
	 */

	import type { Id } from '$lib/convex';
	import { Button, Text, Icon, Heading, FormInput, Combobox } from '$lib/components/atoms';
	import Stepper from '$lib/components/molecules/Stepper.svelte';
	import { DateTimeField } from '$lib/components/molecules';
	import * as Dialog from '$lib/components/organisms/Dialog.svelte';
	import AttendeeSelector from './AttendeeSelector.svelte';
	import RecurrenceField from './RecurrenceField.svelte';
	import { useMeetingForm } from '../composables/useMeetingForm.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		workspaceId: string;
		sessionId: string;
		circles?: Array<{ _id: Id<'circles'>; name: string }>;
	}

	let { open = $bindable(), onClose, workspaceId, sessionId, circles = [] }: Props = $props();

	// Use composable for all logic
	const form = useMeetingForm({
		workspaceId: () => workspaceId,
		sessionId: () => sessionId,
		circles: () => circles,
		onSuccess: onClose
	});

	// Set default date/time when modal opens
	$effect(() => {
		if (open) {
			form.initializeDefaultDateTime();
		}
	});

	// Prepare template options for Combobox (meeting types)
	const templateOptions = $derived(() => {
		return form.templates.map((t) => ({ value: t._id, label: t.name }));
	});

	// Prepare circle options for Combobox
	const circleOptions = $derived(() => {
		return circles.map((c) => ({ value: c._id, label: c.name }));
	});

	// Get selected circle name for display
	const selectedCircleName = $derived(() => {
		if (!form.circleId) return null;
		return circles.find((c) => c._id === form.circleId)?.name ?? null;
	});

	// Check if governance template is selected without circle (soft validation hint)
	const showGovernanceHint = $derived(() => {
		if (!form.selectedTemplateId || form.circleId) return false;
		const selectedTemplate = form.templates.find((t) => t._id === form.selectedTemplateId);
		// Check for "Governance" or "Consent Meeting" template names (per AD-8)
		return selectedTemplate?.name === 'Governance' || selectedTemplate?.name === 'Consent Meeting';
	});

	// Stepper steps configuration
	const steps = [
		{ id: 'attendees-type', label: 'Attendees & Type' },
		{ id: 'date-time', label: 'Date & Time' },
		{ id: 'finalize', label: 'Finalize' }
	];

	// Handle step navigation
	function handleStepChange(stepIndex: number) {
		form.goToStep(stepIndex);
	}
</script>

<Dialog.Root {open} onOpenChange={(value) => !value && onClose()}>
	<Dialog.Portal>
		<!--
			Dialog Overlay
			- Uses bg-black/50 for backdrop color (matches other modals)
			- z-50 matches other modals (overlay and content both z-50)
			- Animation classes are Bits UI data attributes (framework-specific, acceptable)
		-->
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
		/>
		<!--
			Dialog Content
			- Uses Dialog.Content directly (Bits UI component) with custom styling
			- Animation classes are Bits UI data attributes (framework-specific, acceptable)
		-->
		<Dialog.Content
			class="border-base shadow-card-hover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 max-h-[90vh] w-[min(520px,90vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-modal border bg-elevated card-padding"
		>
			<div class="flex flex-col gap-form">
				<!-- Header -->
				<div class="flex items-center justify-between">
					<Dialog.Title>
						<Heading level="3">Add meeting</Heading>
					</Dialog.Title>
					<Button variant="ghost" iconOnly ariaLabel="Close" onclick={onClose}>
						<Icon type="close" size="md" />
					</Button>
				</div>

				<!-- Stepper -->
				<Stepper
					{steps}
					currentStep={form.currentStep}
					onStepChange={handleStepChange}
					canNavigateToStep={form.canNavigateToStep}
				/>

				<!-- Form -->
				<form
					onsubmit={(e) => (e.preventDefault(), form.handleSubmit())}
					class="flex flex-col gap-form"
				>
					<!-- Step 1: Attendees & Meeting Type -->
					{#if form.currentStep === 0}
						<div class="flex flex-col gap-form">
							<!-- Meeting Type (Required) -->
							<div>
								<Combobox
									id="meeting-type"
									label="Meeting Type"
									bind:value={form.selectedTemplateId}
									options={templateOptions()}
									size="md"
									allowDeselect={false}
									showLabel={true}
									required={true}
								/>
								{#if form.stepErrors[0].length > 0 && form.stepErrors[0].some( (e) => e.includes('type') )}
									<Text variant="label" color="error" as="div" class="mt-fieldGroup">
										{form.stepErrors[0].find((e) => e.includes('type'))}
									</Text>
								{/if}
							</div>

							<!-- Circle (Optional - for governance meetings) -->
							<div>
								<Combobox
									id="meeting-circle"
									label="Circle"
									bind:value={form.circleId}
									options={circleOptions()}
									size="md"
									allowDeselect={true}
									showLabel={true}
									required={false}
									placeholder="Select a circle (optional)"
								/>
								<Text variant="label" color="secondary" as="p" class="mt-fieldGroup">
									Link this meeting to a circle for governance features (e.g., proposal import).
									Leave empty for ad-hoc meetings.
								</Text>
								{#if showGovernanceHint()}
									<Text variant="label" color="warning" as="p" class="mt-fieldGroup">
										⚠️ Governance meetings typically require a circle for proposal import.
									</Text>
								{/if}
							</div>

							<!-- Attendees -->
							<div>
								<AttendeeSelector
									bind:selectedAttendees={form.selectedAttendees}
									onAttendeesChange={(attendees) => {
										form.selectedAttendees = attendees;
									}}
									workspaceId={workspaceId as Id<'workspaces'>}
									{sessionId}
								/>
								{#if form.stepErrors[0].length > 0 && form.stepErrors[0].some( (e) => e.includes('attendee') )}
									<Text variant="label" color="error" as="div" class="mt-fieldGroup">
										{form.stepErrors[0].find((e) => e.includes('attendee'))}
									</Text>
								{/if}
							</div>

							<!-- Privacy -->
							<div>
								<fieldset>
									<legend>
										<Text
											variant="body"
											size="sm"
											color="default"
											as="span"
											class="mb-fieldGroup block font-medium"
										>
											Privacy
										</Text>
									</legend>
									<div class="flex flex-col gap-fieldGroup">
										<label class="flex items-start gap-fieldGroup">
											<input
												type="radio"
												bind:group={form.visibility}
												value="public"
												class="mt-fieldGroup"
											/>
											<div>
												<Text variant="body" size="sm" color="default" as="div" class="font-medium"
													>Public</Text
												>
												<Text variant="label" color="secondary" as="div">
													All workspace members can see this meeting and access to the report
												</Text>
											</div>
										</label>
										<label class="flex items-start gap-fieldGroup">
											<input
												type="radio"
												bind:group={form.visibility}
												value="private"
												class="mt-fieldGroup"
											/>
											<div>
												<Text variant="body" size="sm" color="default" as="div" class="font-medium"
													>Private</Text
												>
												<Text variant="label" color="secondary" as="div">
													Only invited attendees can see this meeting
												</Text>
											</div>
										</label>
									</div>
								</fieldset>
							</div>
						</div>
					{/if}

					<!-- Step 2: Date, Time & Recurrence -->
					{#if form.currentStep === 1}
						<div class="flex flex-col gap-form">
							<!-- Start Date/Time with natural language format -->
							<DateTimeField
								id="meeting-datetime"
								bind:date={form.startDate}
								bind:time={form.startTime}
								bind:duration={form.duration}
								required={true}
								dateError={form.stepErrors[1].find((e) => e.includes('date')) || null}
								timeError={form.stepErrors[1].find((e) => e.includes('time')) || null}
								durationError={form.stepErrors[1].find((e) => e.includes('Duration')) || null}
							/>

							<!-- Recurrence -->
							<RecurrenceField
								enabled={form.recurrenceEnabled}
								frequency={form.recurrenceFrequency}
								interval={form.recurrenceInterval}
								daysOfWeek={form.recurrenceDaysOfWeek}
								upcomingMeetings={form.upcomingMeetings}
								weeklyScheduleMessage={form.weeklyScheduleMessage}
								dailyScheduleMessage={form.dailyScheduleMessage}
								onEnabledChange={(enabled) => {
									form.recurrenceEnabled = enabled;
								}}
								onFrequencyChange={(frequency) => {
									form.recurrenceFrequency = frequency;
								}}
								onIntervalChange={(interval) => {
									form.recurrenceInterval = interval;
								}}
								onDaysOfWeekChange={(days) => {
									form.recurrenceDaysOfWeek = days;
								}}
							/>
							{#if form.stepErrors[1].some((e) => e.includes('recurrence') || e.includes('day'))}
								<Text variant="label" color="error" as="div">
									{form.stepErrors[1].find((e) => e.includes('recurrence') || e.includes('day'))}
								</Text>
							{/if}
						</div>
					{/if}

					<!-- Step 3: Finalize -->
					{#if form.currentStep === 2}
						<div class="flex flex-col gap-form">
							<!-- Title -->
							<div>
								<FormInput
									id="title"
									label="Meeting Title"
									type="text"
									bind:value={form.title}
									placeholder="Meeting title"
									required={true}
								/>
								{#if form.stepErrors[2].length > 0}
									<Text variant="label" color="error" as="div" class="mt-fieldGroup">
										{form.stepErrors[2][0]}
									</Text>
								{/if}
							</div>

							<!-- Summary Preview -->
							<div class="border-base rounded-card border bg-surface inset-md">
								<Text
									variant="body"
									size="sm"
									color="default"
									as="div"
									class="mb-fieldGroup font-medium"
								>
									Summary
								</Text>
								<div class="flex flex-col gap-fieldGroup">
									<div>
										<Text variant="label" color="secondary" as="span">Type:</Text>
										<Text variant="body" size="sm" color="default" as="span">
											{form.templates.find((t) => t._id === form.selectedTemplateId)?.name ||
												'Not selected'}
										</Text>
									</div>
									<div>
										<Text variant="label" color="secondary" as="span">Circle:</Text>
										<Text variant="body" size="sm" color="default" as="span">
											{selectedCircleName() ?? 'None (ad-hoc meeting)'}
										</Text>
									</div>
									<div>
										<Text variant="label" color="secondary" as="span">Attendees:</Text>
										<Text variant="body" size="sm" color="default" as="span">
											{form.selectedAttendees.length === 0
												? 'None'
												: form.selectedAttendees.map((a) => a.name).join(', ')}
										</Text>
									</div>
									<div>
										<Text variant="label" color="secondary" as="span">Date & Time:</Text>
										<Text variant="body" size="sm" color="default" as="span">
											{#if form.startDate && form.startTime}
												{form.startDate.month}/{form.startDate.day}/{form.startDate.year} at {String(
													form.startTime.hour
												).padStart(2, '0')}:{String(form.startTime.minute).padStart(2, '0')}
											{:else}
												Not set
											{/if}
										</Text>
									</div>
									<div>
										<Text variant="label" color="secondary" as="span">Duration:</Text>
										<Text variant="body" size="sm" color="default" as="span">
											{form.duration} minutes
										</Text>
									</div>
									{#if form.recurrenceEnabled}
										<div>
											<Text variant="label" color="secondary" as="span">Recurrence:</Text>
											<Text variant="body" size="sm" color="default" as="span">
												{form.recurrenceFrequency} (every {form.recurrenceInterval})
											</Text>
										</div>
									{/if}
									<div>
										<Text variant="label" color="secondary" as="span">Privacy:</Text>
										<Text variant="body" size="sm" color="default" as="span">
											{form.visibility === 'public' ? 'Public' : 'Private'}
										</Text>
									</div>
								</div>
							</div>
						</div>
					{/if}

					<!-- Actions -->
					<div
						class="border-border-base flex justify-between gap-fieldGroup border-t"
						style="padding-top: var(--spacing-form-sectionGap);"
					>
						<div>
							{#if form.currentStep > 0}
								<Button variant="outline" type="button" onclick={form.previousStep}>Back</Button>
							{/if}
						</div>
						<div class="flex gap-fieldGroup">
							<Button variant="outline" type="button" onclick={onClose}>Close</Button>
							{#if form.currentStep < 2}
								<Button variant="primary" type="button" onclick={form.nextStep}>Next</Button>
							{:else}
								<Button variant="primary" type="submit">Schedule</Button>
							{/if}
						</div>
					</div>
				</form>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
