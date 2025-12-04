<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { useConvexClient } from 'convex-svelte';
	import { useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { Button, Heading, Switch } from '$lib/components/atoms';
	import { switchRootRecipe, switchThumbRecipe } from '$lib/design-system/recipes';
	import { toast } from '$lib/utils/toast';
	import Text from '$lib/components/atoms/Text.svelte';

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

	let allowQuickChanges = $state(orgSettings?.allowQuickChanges ?? false);
	let isSaving = $state(false);

	// Sync with query data
	$effect(() => {
		if (orgSettings?.allowQuickChanges !== undefined) {
			allowQuickChanges = orgSettings.allowQuickChanges;
		}
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

			<!-- Other Settings (Future) -->
			<div class="rounded-card border border-default bg-surface p-card-padding">
				<Text variant="body" size="md" color="secondary">
					Additional org chart settings coming soon.
				</Text>
			</div>
		</div>
	{/if}
</div>
