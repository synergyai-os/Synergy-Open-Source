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
		LEAD_AUTHORITY,
		DEFAULT_LEAD_AUTHORITY_LABELS,
		type LeadAuthority
	} from '$lib/infrastructure/organizational-model/constants';

	let { data }: { data: { sessionId: string; workspaceId: string } } = $props();

	const convexClient = browser ? useConvexClient() : null;

	// Query org chart settings
	// SYOS-855: Workspace settings moved to features/workspace-settings/
	const orgSettingsQuery =
		browser && data.sessionId && data.workspaceId
			? useQuery(api.features.workspaceSettings.index.getOrgSettings, () => ({
					sessionId: data.sessionId,
					workspaceId: data.workspaceId as Id<'workspaces'>
				}))
			: null;

	const orgSettings = $derived(orgSettingsQuery?.data);
	const isLoading = $derived(orgSettingsQuery?.isLoading ?? false);
	const isAdmin = $derived(orgSettings?.isAdmin ?? false);

	// Default Lead requirement values
	const defaultLeadRequirement: Record<LeadAuthority, boolean> = {
		decides: true,
		facilitates: false,
		convenes: false
	};

	// Derived values from orgSettings
	const leadRequirementByLeadAuthorityValue = $derived<Record<LeadAuthority, boolean>>(
		orgSettings?.leadRequirementByLeadAuthority ?? defaultLeadRequirement
	);

	// Local state for optimistic updates (initialized with defaults)
	// eslint-disable-next-line svelte/prefer-writable-derived
	let leadRequirementByLeadAuthority =
		$state<Record<LeadAuthority, boolean>>(defaultLeadRequirement);
	let isSaving = $state(false);

	// Sync with query data
	$effect(() => {
		leadRequirementByLeadAuthority = leadRequirementByLeadAuthorityValue;
	});

	async function handleToggleLeadRequirement(leadAuthority: LeadAuthority) {
		if (!convexClient || !data.sessionId || !data.workspaceId || isSaving) return;

		const newValue = !leadRequirementByLeadAuthority[leadAuthority];
		const updatedRequirement = {
			...leadRequirementByLeadAuthority,
			[leadAuthority]: newValue
		};
		isSaving = true;

		try {
			await convexClient.mutation(api.features.workspaceSettings.index.updateOrgSettings, {
				sessionId: data.sessionId,
				workspaceId: data.workspaceId as Id<'workspaces'>,
				leadRequirementByLeadAuthority: updatedRequirement
			});

			leadRequirementByLeadAuthority = updatedRequirement;
			const leadAuthorityLabel = DEFAULT_LEAD_AUTHORITY_LABELS[leadAuthority];
			toast.success(
				`Lead requirement ${newValue ? 'enabled' : 'disabled'} for ${leadAuthorityLabel} circles`
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to update settings';
			toast.error(message);
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="max-w-readable px-card-padding py-card-padding mx-auto">
	<Heading level={1} color="primary" class="mb-section">Org Chart Settings</Heading>

	{#if isLoading}
		<div class="py-section flex items-center justify-center">
			<Text variant="body" size="md" color="secondary">Loading settings...</Text>
		</div>
	{:else if !isAdmin}
		<div class="rounded-card border-default bg-surface p-card-padding border">
			<Text variant="body" size="md" color="secondary">
				Only workspace admins can update org chart settings.
			</Text>
		</div>
	{:else if orgSettings}
		<div class="gap-section flex flex-col">
			<!-- Lead Requirement by Circle Type -->
			<div class="rounded-card border-default bg-surface p-card-padding border">
				<Heading level={2} color="primary" class="mb-header">
					Lead Requirement by Circle Type
				</Heading>
				<Text variant="body" size="sm" color="secondary" class="mb-section">
					Configure whether a Lead role is automatically created when creating circles of each type.
					Empowered teams and guilds can operate without a Lead by default.
				</Text>
				<div class="gap-form flex flex-col">
					{#each Object.values(LEAD_AUTHORITY) as leadAuthority (leadAuthority)}
						{@const leadAuthorityLabel = DEFAULT_LEAD_AUTHORITY_LABELS[leadAuthority]}
						{@const isRequired = leadRequirementByLeadAuthority[leadAuthority]}
						<div class="gap-button flex items-start justify-between">
							<div class="flex-1">
								<div class="mb-fieldGroup gap-fieldGroup flex items-center">
									<Switch.Root
										class={switchRootRecipe({
											checked: isRequired,
											disabled: isSaving
										})}
										checked={isRequired}
										onCheckedChange={() => handleToggleLeadRequirement(leadAuthority)}
										disabled={isSaving}
									>
										<Switch.Thumb class={switchThumbRecipe()} />
									</Switch.Root>
									<label
										for="lead-requirement-{leadAuthority}"
										class="text-button text-primary font-medium"
									>
										{leadAuthorityLabel}
									</label>
								</div>
								<Text
									variant="body"
									size="sm"
									color="secondary"
									class="ml-[calc(var(--spacing-button)+var(--spacing-fieldGroup))]"
								>
									{#if isRequired}
										Lead role will be automatically created for new {leadAuthorityLabel.toLowerCase()}
										circles.
									{:else}
										New {leadAuthorityLabel.toLowerCase()} circles can be created without a Lead role.
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
