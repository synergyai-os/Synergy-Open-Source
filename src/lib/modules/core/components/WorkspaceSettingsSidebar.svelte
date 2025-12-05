<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { resolveRoute } from '$lib/utils/navigation';
	import { Icon, Text } from '$lib/components/atoms';
	import { sidebarRecipe } from '$lib/design-system/recipes';

	type Props = {
		workspaceSlug: string;
		isMobile?: boolean;
	};

	let { workspaceSlug, isMobile: _isMobile = false }: Props = $props();

	// Get current pathname reactively (safely handle SSR)
	const currentPath = $derived(browser ? $page.url.pathname : '');

	// Helper function to check if a path is active
	function isActive(path: string): boolean {
		if (!browser) return false;
		return currentPath === path;
	}

	// Build workspace-scoped settings routes
	const settingsBase = `/w/${workspaceSlug}/settings`;
	const generalPath = resolveRoute(settingsBase);
	const orgChartPath = resolveRoute(`${settingsBase}/org-chart`);
	const rolesPath = resolveRoute(`${settingsBase}/roles`);

	// Simple back button - goes to previous page in history
	function handleBack() {
		if (browser) {
			if (window.history.length > 1) {
				window.history.back();
			} else {
				// Fallback to inbox if no history
				goto(resolveRoute(`/w/${workspaceSlug}/inbox`));
			}
		}
	}
</script>

<!-- Settings Sidebar - Fixed width, no collapse/resize functionality -->
<aside
	class="pointer-events-auto {sidebarRecipe()}"
	style="background-color: var(--color-component-sidebar-bg); border-color: var(--color-component-sidebar-border); z-index: var(--zIndex-sticky);"
>
	<!-- Simple Back Button Header -->
	<div
		class="h-system-header border-sidebar bg-sidebar px-header py-system-header sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b"
	>
		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={handleBack}
				class="group text-sidebar-secondary hover:text-sidebar-primary flex items-center gap-2 transition-colors"
			>
				<!-- Back Arrow Icon -->
				<svg
					class="icon-sm flex-shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 19l-7-7m0 0l7-7m-7 7h18"
					/>
				</svg>
				<span class="text-sm font-medium">Back</span>
			</button>
		</div>
	</div>

	<!-- Navigation - Scrollable area -->
	<nav
		class="flex-1 overflow-y-auto"
		style="padding-inline: var(--spacing-2); padding-block: var(--spacing-2);"
	>
		<!-- Settings Section -->
		<div style="padding-inline: var(--spacing-2); padding-block: var(--spacing-1);">
			<Text
				variant="label"
				size="sm"
				color="tertiary"
				class="mb-fieldGroup font-medium tracking-wider uppercase"
			>
				Settings
			</Text>
			<div class="space-y-form-field-gap">
				<!-- General Settings -->
				<a
					href={generalPath}
					class="group py-nav-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary px-nav-item flex items-center gap-fieldGroup rounded-card transition-all duration-150"
					class:bg-sidebar-hover={isActive(generalPath)}
				>
					<Icon type="settings" size="sm" color="default" class="flex-shrink-0" />
					<Text variant="body" size="sm" color="inherit" as="span" class="font-normal">
						General
					</Text>
				</a>

				<!-- Org Chart Settings -->
				<a
					href={orgChartPath}
					class="group py-nav-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary px-nav-item flex items-center gap-fieldGroup rounded-card transition-all duration-150"
					class:bg-sidebar-hover={isActive(orgChartPath)}
				>
					<Icon type="orgChart" size="sm" color="default" class="flex-shrink-0" />
					<Text variant="body" size="sm" color="inherit" as="span" class="font-normal">
						Org Chart
					</Text>
				</a>

				<!-- Roles Settings -->
				<a
					href={rolesPath}
					class="group py-nav-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary px-nav-item flex items-center gap-fieldGroup rounded-card transition-all duration-150"
					class:bg-sidebar-hover={isActive(rolesPath)}
				>
					<Icon type="lock" size="sm" color="default" class="flex-shrink-0" />
					<Text variant="body" size="sm" color="inherit" as="span" class="font-normal">Roles</Text>
				</a>
			</div>
		</div>
	</nav>
</aside>
