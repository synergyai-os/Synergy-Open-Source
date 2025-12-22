<script lang="ts">
	/**
	 * Dev Page: PersonSelector Testing
	 *
	 * Purpose: Test PersonSelector component in isolation with real Convex data
	 * Shows all 6 modes with clean layout and state visibility
	 *
	 * URL: /w/{workspace-slug}/dev/people-selector
	 */

	import { browser } from '$app/environment';
	import { useQuery } from 'convex-svelte';
	import PersonSelector from '$lib/components/organisms/PersonSelector.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import Icon from '$lib/components/atoms/Icon.svelte';
	import { api, type Id } from '$lib/convex';
	import { invariant } from '$lib/utils/invariant';

	let { data } = $props();

	// Get context from layout
	const getSessionId = () => data.sessionId as string;
	const getWorkspaceId = () => data.workspaceId as Id<'workspaces'> | undefined;

	// Debug logging
	$effect(() => {
		console.log('🔍 Dev Page Context:', {
			browser,
			sessionId: getSessionId(),
			workspaceId: getWorkspaceId(),
			dataKeys: Object.keys(data)
		});
	});

	// Fetch a circle for circle-specific modes (use root circle or first available)
	// Pattern: Only create query when ALL required params are truly available
	const hasRequiredParams = $derived(
		browser &&
			typeof getSessionId() === 'string' &&
			getSessionId().length > 0 &&
			typeof getWorkspaceId() === 'string' &&
			getWorkspaceId()
	);

	const circlesQuery = hasRequiredParams
		? useQuery(api.core.circles.queries.list, () => {
				const sessionId = getSessionId();
				const workspaceId = getWorkspaceId();
				invariant(sessionId, 'sessionId required');
				invariant(workspaceId, 'workspaceId required');
				return { sessionId, workspaceId };
			})
		: null;

	const circles = $derived(circlesQuery?.data ?? []);
	const testCircleId = $derived(circles.length > 0 ? circles[0].circleId : undefined);
	const testRoleId = $derived(
		circles.length > 0 && circles[0].roles.length > 0 ? circles[0].roles[0].roleId : undefined
	);
	const circlesLoading = $derived(circlesQuery?.isLoading ?? false);
	const circlesError = $derived(circlesQuery?.error ?? null);

	// State for each mode
	let workspaceAllSelected = $state<Id<'people'>[]>([]);
	let circleMembersSelected = $state<Id<'people'>[]>([]);
	let circleAwareSelected = $state<Id<'people'>[]>([]);
	let taskAssigneeSelected = $state<Id<'people'>[]>([]);
	let documentOwnerSelected = $state<Id<'people'>[]>([]);
	let multipleSelected = $state<Id<'people'>[]>([]);
	let iconTriggerSelected = $state<Id<'people'>[]>([]);
	let iconTriggerOpen = $state(false);
	let iconTriggerButtonRef = $state<HTMLElement | null>(null);

	// Loading state
	const isReady = $derived(browser && getSessionId() && getWorkspaceId());
</script>

<div class="bg-base flex h-full flex-col overflow-y-auto">
	<!-- Header -->
	<header
		class="h-system-header border-base py-system-header bg-surface px-page flex flex-shrink-0 items-center justify-between border-b"
	>
		<div>
			<h1 class="text-button text-primary font-medium">PersonSelector Dev Testing</h1>
			<p class="text-label text-secondary">Test all modes with real data</p>
		</div>
	</header>

	<!-- Content -->
	<main class="px-page py-page gap-section flex flex-col">
		{#if !isReady}
			<div class="text-secondary text-center">Loading workspace context...</div>
		{:else}
			<!-- Debug Info (moved to top) -->
			<section class="border-base bg-surface rounded-card border p-6">
				<h2 class="text-button text-primary mb-2 font-medium">Debug Info</h2>
				<div class="text-label text-secondary gap-fieldGroup flex flex-col font-mono text-xs">
					<div>
						Workspace ID: <span class="text-primary">{getWorkspaceId() || 'undefined'}</span>
					</div>
					<div>
						Session ID: <span class="text-primary"
							>{getSessionId() ? '✓ Present' : '✗ Missing'}</span
						>
					</div>
					<div class="border-subtle mt-2 border-t pt-2">
						<div>
							Circles Query Status: <span class="text-primary"
								>{circlesQuery ? 'Created' : 'Not Created'}</span
							>
						</div>
						<div>
							Circles Loading: <span class="text-primary">{circlesLoading ? 'Yes' : 'No'}</span>
						</div>
						<div>
							Circles Error: <span class="text-primary"
								>{circlesError ? circlesError.toString() : 'None'}</span
							>
						</div>
						<div>
							Circles Data: <span class="text-primary"
								>{circlesQuery?.data ? 'Present' : 'Undefined'}</span
							>
						</div>
						<div>Circles Available: <span class="text-primary">{circles.length}</span></div>
						<div>
							Test Circle ID: <span class="text-primary">{testCircleId || 'undefined'}</span>
						</div>
						<div>
							Test Role ID: <span class="text-primary">{testRoleId || 'undefined'}</span>
						</div>
					</div>
				</div>
			</section>

			<!-- Debug/Status Banner -->
			{#if circlesLoading}
				<div class="border-base bg-surface text-secondary rounded-card border p-4 text-center">
					Loading circles data...
				</div>
			{:else if circlesError}
				<div class="border-base bg-surface text-error rounded-card border p-4 text-center">
					Error loading circles: {circlesError.toString()}
				</div>
			{:else if !testCircleId}
				<div class="border-base bg-surface text-warning rounded-card border p-4 text-center">
					⚠️ No circles found in workspace. Circle-specific modes will be disabled.
				</div>
			{/if}
			<!-- Mode 1: workspace-all -->
			<section class="border-base bg-surface rounded-card border p-6">
				<div class="mb-4">
					<h2 class="text-button text-primary mb-1 font-medium">Mode: workspace-all</h2>
					<p class="text-label text-secondary mb-2">All workspace members (default)</p>
					<p class="text-label text-tertiary">
						Selected: {workspaceAllSelected.length > 0 ? workspaceAllSelected.join(', ') : 'None'}
					</p>
				</div>
				<PersonSelector
					mode="workspace-all"
					workspaceId={getWorkspaceId()}
					sessionId={getSessionId()}
					bind:selectedPersonIds={workspaceAllSelected}
					placeholder="Select workspace member..."
				/>
			</section>

			<!-- Mode 2: circle-members -->
			<section class="border-base bg-surface rounded-card border p-6">
				<div class="mb-4">
					<h2 class="text-button text-primary mb-1 font-medium">Mode: circle-members</h2>
					<p class="text-label text-secondary mb-2">
						Only members of specific circle
						{#if testCircleId}
							(testing with: {testCircleId})
						{:else}
							<span class="text-warning">(requires circle - disabled)</span>
						{/if}
					</p>
					<p class="text-label text-tertiary">
						Selected: {circleMembersSelected.length > 0 ? circleMembersSelected.join(', ') : 'None'}
					</p>
				</div>
				{#if testCircleId}
					<PersonSelector
						mode="circle-members"
						workspaceId={getWorkspaceId()}
						sessionId={getSessionId()}
						circleId={testCircleId}
						bind:selectedPersonIds={circleMembersSelected}
						placeholder="Select circle member..."
					/>
				{:else}
					<div class="text-tertiary text-center text-sm">Requires a circle to be available</div>
				{/if}
			</section>

			<!-- Mode 3: circle-aware -->
			<section class="border-base bg-surface rounded-card border p-6">
				<div class="mb-4">
					<h2 class="text-button text-primary mb-1 font-medium">Mode: circle-aware</h2>
					<p class="text-label text-secondary mb-2">
						All workspace, show circle badges
						{#if !testCircleId}
							<span class="text-warning">(requires circle - disabled)</span>
						{/if}
					</p>
					<p class="text-label text-tertiary">
						Selected: {circleAwareSelected.length > 0 ? circleAwareSelected.join(', ') : 'None'}
					</p>
				</div>
				{#if testCircleId}
					<PersonSelector
						mode="circle-aware"
						workspaceId={getWorkspaceId()}
						sessionId={getSessionId()}
						circleId={testCircleId}
						bind:selectedPersonIds={circleAwareSelected}
						placeholder="Select person (circle-aware)..."
					/>
				{:else}
					<div class="text-tertiary text-center text-sm">Requires a circle to be available</div>
				{/if}
			</section>

			<!-- Mode 4: task-assignee -->
			<section class="border-base bg-surface rounded-card border p-6">
				<div class="mb-4">
					<h2 class="text-button text-primary mb-1 font-medium">Mode: task-assignee</h2>
					<p class="text-label text-secondary mb-2">Person-only, no placeholders</p>
					<p class="text-label text-tertiary">
						Selected: {taskAssigneeSelected.length > 0 ? taskAssigneeSelected.join(', ') : 'None'}
					</p>
				</div>
				<PersonSelector
					mode="task-assignee"
					workspaceId={getWorkspaceId()}
					sessionId={getSessionId()}
					bind:selectedPersonIds={taskAssigneeSelected}
					placeholder="Select task assignee..."
				/>
			</section>

			<!-- Mode 5: document-owner -->
			<section class="border-base bg-surface rounded-card border p-6">
				<div class="mb-4">
					<h2 class="text-button text-primary mb-1 font-medium">Mode: document-owner</h2>
					<p class="text-label text-secondary mb-2">Same as task-assignee (semantic alias)</p>
					<p class="text-label text-tertiary">
						Selected: {documentOwnerSelected.length > 0 ? documentOwnerSelected.join(', ') : 'None'}
					</p>
				</div>
				<PersonSelector
					mode="document-owner"
					workspaceId={getWorkspaceId()}
					sessionId={getSessionId()}
					bind:selectedPersonIds={documentOwnerSelected}
					placeholder="Select document owner..."
				/>
			</section>

			<!-- Mode 6: Multiple selection -->
			<section class="border-base bg-surface rounded-card border p-6">
				<div class="mb-4">
					<h2 class="text-button text-primary mb-1 font-medium">Multiple Selection</h2>
					<p class="text-label text-secondary mb-2">
						workspace-all mode with multiple={true}
					</p>
					<p class="text-label text-tertiary">
						Selected: {multipleSelected.length > 0 ? multipleSelected.join(', ') : 'None'}
					</p>
				</div>
				<PersonSelector
					mode="workspace-all"
					workspaceId={getWorkspaceId()}
					sessionId={getSessionId()}
					bind:selectedPersonIds={multipleSelected}
					multiple={true}
					placeholder="Select multiple people..."
				/>
			</section>

			<!-- Mode 7: Icon Trigger (External) -->
			<section class="border-base bg-surface rounded-card border p-6">
				<div class="mb-4">
					<h2 class="text-button text-primary mb-1 font-medium">Mode: Icon Trigger (External)</h2>
					<p class="text-label text-secondary mb-2">
						Icon button triggers popup — mimics RoleCard pattern
					</p>
					<p class="text-label text-tertiary">
						Selected: {iconTriggerSelected.length > 0 ? iconTriggerSelected.join(', ') : 'None'}
					</p>
				</div>

				<div class="relative inline-block">
					<div bind:this={iconTriggerButtonRef}>
						<Button
							variant="ghost"
							size="sm"
							iconOnly
							onclick={() => {
								iconTriggerOpen = true;
							}}
							ariaLabel="Add person"
						>
							<Icon type="user-plus" size="sm" />
						</Button>
					</div>

					<PersonSelector
						mode="workspace-all"
						triggerStyle="external"
						workspaceId={getWorkspaceId()}
						sessionId={getSessionId()}
						bind:selectedPersonIds={iconTriggerSelected}
						bind:open={iconTriggerOpen}
						anchorElement={iconTriggerButtonRef}
						placeholder="Select person..."
					/>
				</div>
				<div class="text-tertiary text-label mt-2">
					Debug: iconTriggerOpen = {iconTriggerOpen ? 'TRUE' : 'FALSE'}
				</div>
			</section>
		{/if}
	</main>
</div>
