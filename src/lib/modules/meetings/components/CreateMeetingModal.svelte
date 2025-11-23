<script lang="ts">
	/**
	 * CreateMeetingModal - Full meeting creation form
	 * Features: title, template, date/time, duration, recurrence, attendees, privacy
	 *
	 * SYOS-469: Refactored to use useMeetingForm composable - UI only
	 */

	import { Dialog } from 'bits-ui';
	import type { Id } from '$lib/convex';
	import { Button, ToggleGroup } from '$lib/components/atoms';
	import { ToggleSwitch } from '$lib/components/molecules';
	import AttendeeSelector from './AttendeeSelector.svelte';
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

	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
</script>

<Dialog.Root {open} onOpenChange={(value) => !value && onClose()}>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
		/>
		<Dialog.Content
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 max-h-[90vh] w-[min(800px,90vw)] translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-dialog border border-base bg-elevated text-text-primary shadow-card-hover"
		>
			<div class="flex flex-col gap-content-section p-modal-padding">
				<!-- Header -->
				<div class="flex items-center justify-between">
					<Dialog.Title class="text-h2 font-semibold">Add meeting</Dialog.Title>
					<Button
						variant="outline"
						iconOnly
						ariaLabel="Close"
						onclick={onClose}
						class="!border-0 text-text-tertiary hover:text-text-primary"
					>
						<svg class="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</Button>
				</div>

				<!-- Form -->
				<form
					onsubmit={(e) => (e.preventDefault(), form.handleSubmit())}
					class="flex flex-col gap-content-section"
				>
					<div class="grid grid-cols-3 gap-content-section">
						<!-- Left Column (2/3) -->
						<div class="col-span-2 flex flex-col gap-form-section">
							<!-- Title -->
							<div>
								<label
									for="title"
									class="text-body-sm mb-form-field-gap block font-medium text-text-primary"
									>Title</label
								>
								<input
									id="title"
									type="text"
									bind:value={form.title}
									class="w-full rounded-input border border-border-base bg-surface px-input-x py-input-y text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
									placeholder="Meeting title"
								/>
							</div>

							<!-- Template (Optional) -->
							<div>
								<label
									for="template"
									class="text-body-sm mb-form-field-gap block font-medium text-text-primary"
								>
									Template <span class="text-text-tertiary">(optional)</span>
								</label>
								<select
									id="template"
									bind:value={form.selectedTemplateId}
									class="w-full rounded-input border border-border-base bg-surface px-input-x py-input-y text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
								>
									<option value="">
										{form.templates.length === 0
											? 'No templates available (none)'
											: 'None (ad-hoc meeting)'}
									</option>
									{#each form.templates as template (template._id)}
										<option value={template._id}>{template.name}</option>
									{/each}
								</select>
							</div>

							<!-- Circle (Optional) -->
							{#if circles.length > 0}
								<div>
									<label
										for="circle"
										class="text-body-sm mb-form-field-gap block font-medium text-text-primary"
										>Circle (optional)</label
									>
									<select
										id="circle"
										bind:value={form.circleId}
										class="w-full rounded-input border border-border-base bg-surface px-input-x py-input-y text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
									>
										<option value="">Ad-hoc meeting (no circle)</option>
										{#each circles as circle (circle._id)}
											<option value={circle._id}>{circle.name}</option>
										{/each}
									</select>
								</div>
							{/if}

							<!-- Start Date/Time -->
							<div>
								<fieldset class="mb-form-field-gap">
									<legend class="text-body-sm block font-medium text-text-primary"
										>Start date</legend
									>
									<div class="grid grid-cols-3 gap-icon">
										<div class="col-span-1">
											<label for="meeting-start-date" class="sr-only">Date</label>
											<input
												id="meeting-start-date"
												type="date"
												bind:value={form.startDate}
												class="w-full rounded-input border border-border-base bg-surface px-input-x py-input-y text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
											/>
										</div>
										<div class="col-span-1">
											<label for="meeting-start-time" class="sr-only">Time</label>
											<input
												id="meeting-start-time"
												type="time"
												bind:value={form.startTime}
												class="w-full rounded-input border border-border-base bg-surface px-input-x py-input-y text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
											/>
										</div>
										<div class="col-span-1 flex items-center gap-icon">
											<label for="meeting-duration" class="sr-only">Duration (minutes)</label>
											<input
												id="meeting-duration"
												type="number"
												bind:value={form.duration}
												min="5"
												max="480"
												class="w-input-sm rounded-input border border-border-base bg-surface px-input-x py-input-y text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
											/>
											<span class="text-body-sm text-text-secondary">minutes</span>
										</div>
									</div>
								</fieldset>
							</div>

							<!-- Recurrence -->
							<div class="flex flex-col gap-form-section">
								<div class="flex items-center gap-icon">
									<ToggleSwitch
										checked={form.recurrenceEnabled}
										onChange={(checked) => (form.recurrenceEnabled = checked)}
									/>
									<span class="text-body-sm font-medium text-text-primary">Repeat this meeting</span
									>
								</div>

								{#if form.recurrenceEnabled}
									<div
										class="flex flex-col gap-form-section border-l-2 border-accent-primary pl-form-section-gap"
									>
										<!-- Frequency -->
										<div class="flex items-center gap-icon">
											<span class="text-body-sm text-text-secondary">Every</span>
											<input
												type="number"
												bind:value={form.recurrenceInterval}
												min="1"
												max="99"
												class="w-input-xs px-input-x-sm py-input-y-sm text-body-sm rounded-input border border-border-base bg-surface text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
											/>
											<select
												bind:value={form.recurrenceFrequency}
												class="py-input-y-sm text-body-sm rounded-input border border-border-base bg-surface px-input-x text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
											>
												<option value="daily">Day(s)</option>
												<option value="weekly">Week(s)</option>
												<option value="monthly">Month(s)</option>
											</select>
										</div>

										<!-- Days of Week (for weekly and daily) -->
										{#if form.recurrenceFrequency === 'weekly' || form.recurrenceFrequency === 'daily'}
											<div>
												<span class="text-body-sm mb-form-field-gap block text-text-secondary"
													>On</span
												>
												<div class="inline-flex flex-nowrap items-center gap-icon">
													{#if form.recurrenceFrequency === 'weekly'}
														{@const selectedDay = form.recurrenceDaysOfWeek[0] || ''}
														<ToggleGroup.Root
															type="single"
															value={selectedDay}
															onValueChange={(value) => {
																if (value !== null && value !== undefined) {
																	form.recurrenceDaysOfWeek = [value];
																}
															}}
															class="inline-flex flex-nowrap gap-icon"
														>
															{#each dayNames as day, index (index)}
																<ToggleGroup.Item
																	value={index.toString()}
																	class="toggle-group-day data-[state=on]:border-accent-primary data-[state=on]:bg-accent-primary data-[state=on]:text-primary"
																>
																	{day}
																</ToggleGroup.Item>
															{/each}
														</ToggleGroup.Root>
													{:else}
														<ToggleGroup.Root
															type="multiple"
															bind:value={form.recurrenceDaysOfWeek}
															class="inline-flex flex-nowrap gap-icon"
														>
															{#each dayNames as day, index (index)}
																<ToggleGroup.Item
																	value={index.toString()}
																	class="toggle-group-day data-[state=on]:border-accent-primary data-[state=on]:bg-accent-primary data-[state=on]:text-primary"
																>
																	{day}
																</ToggleGroup.Item>
															{/each}
														</ToggleGroup.Root>
													{/if}
												</div>

												<!-- Schedule Helper Messages -->
												{#if form.weeklyScheduleMessage}
													<div
														class="mt-form-field-gap flex items-start gap-icon rounded-card border border-base bg-elevated px-card py-card text-button text-secondary"
													>
														<span class="text-button">💡</span>
														<span>{form.weeklyScheduleMessage}</span>
													</div>
												{:else if form.dailyScheduleMessage}
													<div
														class="mt-form-field-gap flex items-start gap-icon rounded-card border border-base bg-elevated px-card py-card text-button text-secondary"
													>
														<span class="text-button">💡</span>
														<span>{form.dailyScheduleMessage}</span>
													</div>
												{/if}
											</div>
										{/if}

										<!-- Upcoming Meetings Preview -->
										{#if form.upcomingMeetings.length > 0}
											<div>
												<span class="text-body-sm mb-form-field-gap block text-text-secondary"
													>Upcoming {form.upcomingMeetings.length} Meetings</span
												>
												<div class="flex gap-icon">
													{#each form.upcomingMeetings as date (date.getTime())}
														<div
															class="bg-surface-tertiary rounded-card px-input-x py-input-y text-center"
														>
															<div class="text-label font-medium text-accent-primary">
																{date.toLocaleDateString('en-US', { month: 'short' })}
															</div>
															<div class="text-body-sm font-medium text-text-primary">
																{date.getDate()}
															</div>
															<div class="text-label text-text-secondary">
																{date.getFullYear()}
															</div>
														</div>
													{/each}
												</div>
											</div>
										{/if}

										<!-- Info message -->
										<div
											class="flex items-start gap-icon rounded-card border border-base bg-elevated px-card py-card text-button text-secondary"
										>
											<span class="text-button">ℹ️</span>
											<span
												>The recurrence has no end: the next {form.upcomingMeetings.length} meetings
												are shown to preview the pattern. Additional ones will appear as they occur.</span
											>
										</div>
									</div>
								{/if}
							</div>

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
						<div class="flex flex-col gap-form-section">
							<!-- Privacy -->
							<div>
								<fieldset>
									<legend class="text-body-sm mb-form-field-gap block font-medium text-text-primary"
										>Privacy</legend
									>
									<div class="flex flex-col gap-icon">
										<label class="flex items-start gap-icon">
											<input
												type="radio"
												bind:group={form.visibility}
												value="public"
												class="mt-spacing-icon-gap-sm"
											/>
											<div>
												<div class="text-body-sm font-medium text-text-primary">Public</div>
												<div class="text-label text-text-secondary">
													All organization members can see this meeting and access to the report
												</div>
											</div>
										</label>
										<label class="flex items-start gap-icon">
											<input
												type="radio"
												bind:group={form.visibility}
												value="private"
												class="mt-spacing-icon-gap-sm"
											/>
											<div>
												<div class="text-body-sm font-medium text-text-primary">Private</div>
												<div class="text-label text-text-secondary">
													Only invited attendees can see this meeting
												</div>
											</div>
										</label>
									</div>
								</fieldset>
							</div>
						</div>
					</div>

					<!-- Actions -->
					<div
						class="flex justify-end gap-button-group border-t border-border-base pt-content-section"
					>
						<Button variant="outline" type="button" onclick={onClose}>Close</Button>
						<Button variant="primary" type="submit">Schedule</Button>
					</div>
				</form>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
