<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { useWorkspaces } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import type {
		WorkspaceSummary,
		WorkspaceInvite,
		WorkspacesModuleAPI
	} from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import { Stepper } from '$lib/components/molecules';

	let { children, data } = $props();

	// Get workspaces context from parent layout, or initialize if not available
	// This ensures the workspaces context is available to onboarding pages
	let workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');

	if (!workspaces) {
		// Initialize workspaces composable if not provided by parent
		workspaces = useWorkspaces({
			userId: () => data.user?.userId,
			sessionId: () => data.sessionId,
			orgFromUrl: () => null,
			initialOrganizations: data.workspaces as unknown as WorkspaceSummary[],
			initialOrganizationInvites: data.workspaceInvites as unknown as WorkspaceInvite[]
		});
		setContext('workspaces', workspaces);
	}

	// Define onboarding steps
	const onboardingSteps = [
		{ id: 'workspace', label: 'Create Workspace' },
		{ id: 'terminology', label: 'Customize Terminology' },
		{ id: 'circle', label: 'Create Circle' },
		{ id: 'invite', label: 'Invite Team' },
		{ id: 'complete', label: 'Complete' }
	];

	// Determine current step based on URL pathname
	const currentStepIndex = $derived(() => {
		if (!browser) return 0;
		const pathname = $page.url.pathname;
		if (pathname === '/onboarding') return 0;
		if (pathname === '/onboarding/terminology') return 1;
		if (pathname === '/onboarding/circle') return 2;
		if (pathname === '/onboarding/invite') return 3;
		if (pathname === '/onboarding/complete') return 4;
		return 0;
	});
</script>

<!-- Onboarding layout: Simple centered content, no sidebar, full page -->
<div class="bg-base p-page flex min-h-full w-full flex-col items-center overflow-y-auto">
	<div class="w-full max-w-2xl" style="margin-top: var(--spacing-20);">
		<!-- Step Indicator -->
		<div style="margin-bottom: var(--spacing-content-sectionGap);">
			<Stepper steps={onboardingSteps} currentStep={currentStepIndex()} variant="default" />
		</div>
	</div>
	<div class="w-full max-w-2xl" style="padding-bottom: var(--spacing-content-sectionGap);">
		{@render children()}
	</div>
</div>
