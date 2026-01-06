<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { LoadingOverlay, Text } from '$lib/components/atoms';
	import ActivationIssueCard from './components/ActivationIssueCard.svelte';
	import ReadyState from './components/ReadyState.svelte';
	import SuccessState from './components/SuccessState.svelte';
	import { toast } from '$lib/utils/toast';
	import { invariant } from '$lib/utils/invariant';
	import type { PageData } from './$types';
	import { getStackedNavigation } from '$lib/composables/useStackedNavigation.svelte';
	import { useOrgChart } from '$lib/modules/org-chart/composables/useOrgChart.svelte';
	import CircleDetailPanel from '$lib/modules/org-chart/components/CircleDetailPanel.svelte';
	import RoleDetailPanel from '$lib/modules/org-chart/components/RoleDetailPanel.svelte';
	import type { Id } from '$lib/convex/_generated/dataModel';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// State management
	let isActivating = $state(false);
	let isActivated = $state(false);

	// Get shared navigation from context (used by CircleDetailPanel/RoleDetailPanel)
	getStackedNavigation();

	// Initialize org chart for panel navigation
	const orgChart = browser
		? useOrgChart({
				sessionId: () => data.sessionId,
				workspaceId: () => data.workspaceId
			})
		: null;

	// Fetch activation issues
	const getSessionId = () => data.sessionId;
	const getWorkspaceId = () => data.workspaceId;

	const issuesQuery =
		browser && getSessionId() && getWorkspaceId()
			? useQuery(api.core.workspaces.index.getActivationIssues, () => {
					const sessionId = getSessionId();
					const workspaceId = getWorkspaceId();
					// These invariant calls are validated by outer check, just for TypeScript narrowing
					invariant(sessionId, 'sessionId required');
					invariant(workspaceId, 'workspaceId required');
					return { sessionId: sessionId!, workspaceId: workspaceId! };
				})
			: null;

	// DEBUG: Log issues query state for troubleshooting
	$effect(() => {
		console.log('🔍 Activation Issues Query Debug:', {
			isLoading: issuesQuery?.isLoading,
			data: issuesQuery?.data,
			error: issuesQuery?.error,
			sessionId: data.sessionId,
			workspaceId: data.workspaceId,
			workspaceSlug: data.workspaceSlug
		});
	});

	// Convex client for mutations
	const convexClient = browser ? useConvexClient() : null;

	// Derived states
	const isLoading = $derived(issuesQuery?.isLoading ?? true);
	const issues = $derived(issuesQuery?.data ?? []);
	const hasIssues = $derived(issues.length > 0);
	const isReady = $derived(!isLoading && !hasIssues && !isActivated);

	// Navigation helpers
	function handleFixIssue(issue: (typeof issues)[number]) {
		if (!orgChart) return;

		// Open appropriate panel based on action type
		switch (issue.actionType) {
			case 'edit_circle':
				if (issue.circleId) {
					orgChart.selectCircle(issue.circleId as Id<'circles'>);
				}
				break;
			case 'edit_role':
				if (issue.roleId) {
					orgChart.selectRole(issue.roleId as Id<'circleRoles'>);
				}
				break;
			case 'assign_lead':
			case 'create_root':
				// These actions don't open panels - keep fallback URL behavior
				toast.info('This action requires manual setup. Please visit the org chart.');
				break;
		}
	}

	// Activate handler
	async function handleActivate() {
		if (!convexClient) {
			toast.error('Convex client not available');
			return;
		}

		const sessionId = getSessionId();
		const workspaceId = getWorkspaceId();

		if (!sessionId || !workspaceId) {
			toast.error('Missing session or workspace ID');
			return;
		}

		isActivating = true;

		try {
			await convexClient.mutation(api.core.workspaces.index.activate, {
				sessionId,
				workspaceId
			});
			isActivated = true;
			toast.success('Workspace activated successfully!');
		} catch (error) {
			console.error('Activation failed:', error);
			const errorMessage = error instanceof Error ? error.message : 'Failed to activate workspace';
			toast.error(errorMessage);
		} finally {
			isActivating = false;
		}
	}
</script>

<svelte:head>
	<title>Activate Workspace - {data.workspaceSlug}</title>
</svelte:head>

<div class="bg-base flex h-full flex-col overflow-auto">
	<!-- Page Header -->
	<div
		class="border-subtle bg-surface sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b"
		style="height: 2.5rem; padding-inline: var(--spacing-4); padding-block: var(--spacing-2);"
	>
		<Text variant="label" size="sm" color="secondary" weight="normal" as="h2">
			Workspace Activation
		</Text>
	</div>

	<!-- Content Area -->
	<div class="flex-1 overflow-auto" style="padding: var(--spacing-6);">
		<div class="mx-auto" style="max-width: 800px;">
			{#if isLoading}
				<!-- Loading State -->
				<div class="flex items-center justify-center" style="padding: var(--spacing-16);">
					<LoadingOverlay visible={true} message="Checking activation requirements..." />
				</div>
			{:else if isActivated}
				<!-- Success State -->
				<SuccessState workspaceSlug={data.workspaceSlug} />
			{:else if isReady}
				<!-- Ready State (no issues) -->
				<ReadyState onActivate={handleActivate} {isActivating} />
			{:else if hasIssues}
				<!-- Has Issues State -->
				<div class="gap-section flex flex-col">
					<!-- Header -->
					<div class="gap-fieldGroup flex flex-col">
						<Text
							variant="heading"
							size="lg"
							color="default"
							weight="semibold"
							as="h1"
							class="text-center"
						>
							Resolve Issues to Activate
						</Text>
						<Text variant="body" size="md" color="secondary" as="p" class="text-center">
							Fix the following issues before activating your workspace. Each issue blocks the
							transition from design mode to active mode.
						</Text>
					</div>

					<!-- Issues List -->
					<div class="gap-form flex flex-col">
						{#each issues as issue (issue.id)}
							<ActivationIssueCard
								code={issue.code}
								message={issue.message}
								entityName={issue.entityName}
								actionUrl={issue.actionUrl}
								onFixClick={() => handleFixIssue(issue)}
							/>
						{/each}
					</div>

					<!-- Help Text -->
					<div class="border-subtle border-t" style="padding-top: var(--spacing-4);">
						<Text variant="body" size="sm" color="secondary" as="p" class="text-center">
							Need help? Check our
							<a href="/docs/activation" class="text-accent-primary hover:underline">
								activation guide
							</a>
							for more information.
						</Text>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Stacked Panels for Issue Fixing -->
	{#if orgChart}
		<CircleDetailPanel {orgChart} />
		<RoleDetailPanel {orgChart} />
	{/if}
</div>
