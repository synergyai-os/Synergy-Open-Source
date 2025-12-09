<script lang="ts">
	import { browser } from '$app/environment';
	import { useConvexClient } from 'convex-svelte';
	import { useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { Heading, Switch } from '$lib/components/atoms';
	import { switchRootRecipe, switchThumbRecipe } from '$lib/design-system/recipes';
	import { toast } from '$lib/utils/toast';
	import Text from '$lib/components/atoms/Text.svelte';
	import {
		CIRCLE_TYPES,
		DEFAULT_CIRCLE_TYPE_LABELS,
		type CircleType
	} from '$lib/infrastructure/organizational-model/constants';

	let { data }: { data: { sessionId: string; workspaceId: string } } = $props();

	const convexClient = browser ? useConvexClient() : null;

	// Query org chart settings
	const orgSettingsQuery =
		browser && data.sessionId && data.workspaceId
			? useQuery(api.workspaceSettings.getOrgSettings, () => ({
					sessionId: data.sessionId,
					workspaceId: data.workspaceId as Id<'workspaces'>
				}))
			: null;

	const orgSettings = $derived(orgSettingsQuery?.data);
	const isLoading = $derived(orgSettingsQuery?.isLoading ?? false);
	const isAdmin = $derived(orgSettings?.isAdmin ?? false);

	// Default Lead requirement values
	const defaultLeadRequirement: Record<CircleType, boolean> = {
		hierarchy: true,
		empowered_team: false,
		guild: false,
		hybrid: true
	};

	// Derived values from orgSettings
	const allowQuickChangesValue = $derived(orgSettings?.allowQuickChanges ?? false);
	const leadRequirementByCircleTypeValue = $derived<Record<CircleType, boolean>>(
		orgSettings?.leadRequirementByCircleType ?? defaultLeadRequirement
	);

	// Local state for optimistic updates (initialized with defaults)
	let allowQuickChanges = $state(false);
	let leadRequirementByCircleType = $state<Record<CircleType, boolean>>(defaultLeadRequirement);
	let isSaving = $state(false);

	// Sync with query data
	$effect(() => {
		allowQuickChanges = allowQuickChangesValue;
		leadRequirementByCircleType = leadRequirementByCircleTypeValue;
	});

	async function handleToggleAllowQuickChanges() {
		if (!convexClient || !data.sessionId || !data.workspaceId || isSaving) return;

		const newValue = !allowQuickChanges;
		isSaving = true;

		try {
			await convexClient.mutation(api.workspaceSettings.updateOrgSettings, {
				sessionId: data.sessionId,
				workspaceId: data.workspaceId as Id<'workspaces'>,
				allowQuickChanges: newValue
			});

			allowQuickChanges = newValue;
			toast.success(
				newValue
					? 'Quick edits enabled for Org Designers'
					: 'Quick edits disabled. All changes require proposals.'
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to update settings';
			toast.error(message);
			// Revert on error
			allowQuickChanges = !newValue;
		} finally {
			isSaving = false;
		}
	}

	async function handleToggleLeadRequirement(circleType: CircleType) {
		if (!convexClient || !data.sessionId || !data.workspaceId || isSaving) return;

		const newValue = !leadRequirementByCircleType[circleType];
		const updatedRequirement = {
			...leadRequirementByCircleType,
			[circleType]: newValue
		};
		isSaving = true;

		try {
			await convexClient.mutation(api.workspaceSettings.updateOrgSettings, {
				sessionId: data.sessionId,
				workspaceId: data.workspaceId as Id<'workspaces'>,
				leadRequirementByCircleType: updatedRequirement
			});

			leadRequirementByCircleType = updatedRequirement;
			const circleTypeLabel = DEFAULT_CIRCLE_TYPE_LABELS[circleType];
			toast.success(
				`Lead requirement ${newValue ? 'enabled' : 'disabled'} for ${circleTypeLabel} circles`
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to update settings';
			toast.error(message);
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="max-w-readable mx-auto px-card-padding py-card-padding">
	<Heading level={1} color="primary" class="mb-section">Org Chart Settings</Heading>

	{#if isLoading}
		<div class="py-section flex items-center justify-center">
			<Text variant="body" size="md" color="secondary">Loading settings...</Text>
		</div>
	{:else if !isAdmin}
		<div class="rounded-card border border-default bg-surface p-card-padding">
			<Text variant="body" size="md" color="secondary">
				Only workspace admins can update org chart settings.
			</Text>
		</div>
	{:else if orgSettings}
		<div class="flex flex-col gap-section">
			<!-- Allow Quick Changes Toggle -->
			<div class="rounded-card border border-default bg-surface p-card-padding">
				<div class="flex items-start justify-between gap-button">
					<div class="flex-1">
						<div class="mb-fieldGroup flex items-center gap-fieldGroup">
							<Switch.Root
								class={switchRootRecipe({ checked: allowQuickChanges, disabled: isSaving })}
								checked={allowQuickChanges}
								onCheckedChange={handleToggleAllowQuickChanges}
								disabled={isSaving}
							>
								<Switch.Thumb class={switchThumbRecipe()} />
							</Switch.Root>
							<label for="allow-quick-changes" class="text-button font-medium text-primary">
								Allow Quick Changes
							</label>
						</div>
						<Text
							variant="body"
							size="sm"
							color="secondary"
							class="ml-[calc(var(--spacing-button)+var(--spacing-fieldGroup))]"
						>
							When enabled, users with the Org Designer role can edit circles and roles inline
							without creating proposals. When disabled, all changes must go through the proposal
							workflow.
						</Text>
					</div>
				</div>
			</div>

			<!-- Lead Requirement by Circle Type -->
			<div class="rounded-card border border-default bg-surface p-card-padding">
				<Heading level={2} color="primary" class="mb-header">
					Lead Requirement by Circle Type
				</Heading>
				<Text variant="body" size="sm" color="secondary" class="mb-section">
					Configure whether a Lead role is automatically created when creating circles of each type.
					Empowered teams and guilds can operate without a Lead by default.
				</Text>
				<div class="flex flex-col gap-form">
					{#each Object.values(CIRCLE_TYPES) as circleType (circleType)}
						{@const circleTypeLabel = DEFAULT_CIRCLE_TYPE_LABELS[circleType]}
						{@const isRequired = leadRequirementByCircleType[circleType]}
						<div class="flex items-start justify-between gap-button">
							<div class="flex-1">
								<div class="mb-fieldGroup flex items-center gap-fieldGroup">
									<Switch.Root
										class={switchRootRecipe({
											checked: isRequired,
											disabled: isSaving
										})}
										checked={isRequired}
										onCheckedChange={() => handleToggleLeadRequirement(circleType)}
										disabled={isSaving}
									>
										<Switch.Thumb class={switchThumbRecipe()} />
									</Switch.Root>
									<label
										for="lead-requirement-{circleType}"
										class="text-button font-medium text-primary"
									>
										{circleTypeLabel}
									</label>
								</div>
								<Text
									variant="body"
									size="sm"
									color="secondary"
									class="ml-[calc(var(--spacing-button)+var(--spacing-fieldGroup))]"
								>
									{#if isRequired}
										Lead role will be automatically created for new {circleTypeLabel.toLowerCase()}
										circles.
									{:else}
										New {circleTypeLabel.toLowerCase()} circles can be created without a Lead role.
									{/if}
								</Text>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
