<script lang="ts">
	/**
	 * CreateMeetingModal - Full meeting creation form
	 * Features: title, template, date/time, duration, recurrence, attendees, privacy
	 *
	 * SYOS-469: Refactored to use useMeetingForm composable - UI only
	 */

	import type { Id } from '$lib/convex';
	import { Button, Text, Icon, Heading, FormInput, Combobox } from '$lib/components/atoms';
	import * as Dialog from '$lib/components/organisms/Dialog.svelte';
	import AttendeeSelector from './AttendeeSelector.svelte';
	import RecurrenceField from './RecurrenceField.svelte';
	import { useMeetingForm } from '../composables/useMeetingForm.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		organizationId: string;
		sessionId: string;
		circles?: Array<{ _id: Id<'circles'>; name: string }>;
	}

	let { open = $bindable(), onClose, organizationId, sessionId, circles = [] }: Props = $props();

	// Use composable for all logic
	const form = useMeetingForm({
		organizationId: () => organizationId,
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

	// Prepare template options for FormSelect
	const templateOptions = $derived(() => {
		const options = [
			{
				value: '',
				label:
					form.templates.length === 0 ? 'No templates available (none)' : 'None (ad-hoc meeting)'
			}
		];
		return [...options, ...form.templates.map((t) => ({ value: t._id, label: t.name }))];
	});
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
			class="max-w-dialog-wide rounded-dialog border-base shadow-card-hover p-modal data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 max-h-[90vh] w-[min(100%,90vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border bg-elevated"
		>
			<div class="flex flex-col gap-content-sectionGap card-padding">
				<!-- Header -->
				<div class="flex items-center justify-between">
					<Dialog.Title>
						<Heading level="2">Add meeting</Heading>
					</Dialog.Title>
					<Button variant="ghost" iconOnly ariaLabel="Close" onclick={onClose}>
						<Icon type="close" size="md" />
					</Button>
				</div>

				<!-- Form -->
				<form
					onsubmit={(e) => (e.preventDefault(), form.handleSubmit())}
					class="flex flex-col gap-content-sectionGap"
				>
					<div class="grid grid-cols-3 gap-content-sectionGap">
						<!-- Left Column (2/3) -->
						<div class="col-span-2 flex flex-col gap-form-sectionGap">
							<!-- Title -->
							<FormInput
								id="title"
								label="Title"
								type="text"
								bind:value={form.title}
								placeholder="Meeting title"
							/>

							<!-- Template (Optional) -->
							<Combobox
								id="template"
								label="Template (optional)"
								bind:value={form.selectedTemplateId}
								options={templateOptions()}
								allowDeselect={true}
								showLabel={true}
							/>

							<!-- Start Date/Time -->
							<div>
								<fieldset class="mb-fieldGroup">
									<legend>
										<Text
											variant="body"
											size="sm"
											color="default"
											as="span"
											class="block font-medium"
										>
											Start date
										</Text>
									</legend>
									<div
										class="grid grid-cols-3 gap-fieldGroup"
										style="margin-top: var(--spacing-form-gap);"
									>
										<div class="col-span-1">
											<FormInput id="meeting-start-date" type="date" bind:value={form.startDate} />
										</div>
										<div class="col-span-1">
											<FormInput id="meeting-start-time" type="time" bind:value={form.startTime} />
										</div>
										<div class="col-span-1 flex items-center gap-fieldGroup">
											<FormInput
												id="meeting-duration"
												type="number"
												bind:value={form.duration}
												min="5"
												max="480"
												class="w-input-sm"
											/>
											<Text variant="body" size="sm" color="secondary" as="span">minutes</Text>
										</div>
									</div>
								</fieldset>
							</div>

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

							<!-- Attendees -->
							<AttendeeSelector
								bind:selectedAttendees={form.selectedAttendees}
								onAttendeesChange={(attendees) => {
									form.selectedAttendees = attendees;
								}}
								organizationId={organizationId as Id<'organizations'>}
								{sessionId}
							/>
						</div>

						<!-- Right Column (1/3) -->
						<div class="flex flex-col gap-form-sectionGap">
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
													All organization members can see this meeting and access to the report
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
					</div>

					<!-- Actions -->
					<div
						class="border-border-base flex justify-end gap-fieldGroup border-t"
						style="padding-top: var(--spacing-content-sectionGap);"
					>
						<Button variant="outline" type="button" onclick={onClose}>Close</Button>
						<Button variant="primary" type="submit">Schedule</Button>
					</div>
				</form>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
