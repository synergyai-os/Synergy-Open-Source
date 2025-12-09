<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import SettingsSidebarHeader from '$lib/modules/core/components/SettingsSidebarHeader.svelte';
	import { resolveRoute } from '$lib/utils/navigation';
	import { Icon, Text } from '$lib/components/atoms';

	type Props = {
		isMobile?: boolean;
	};

	let { isMobile: _isMobile = false }: Props = $props();

	// Get current pathname reactively (safely handle SSR)
	const currentPath = $derived(browser ? $page.url.pathname : '');

	// Helper function to check if a path is active
	function isActive(path: string): boolean {
		if (!browser) return false;
		return currentPath === path;
	}
</script>

<!-- Settings Sidebar - Fixed width, no collapse/resize functionality -->
<aside
	class="w-settings-sidebar border-sidebar bg-sidebar text-sidebar-primary flex h-full flex-shrink-0 flex-col overflow-hidden border-r"
>
	<!-- Header with Back Button -->
	<SettingsSidebarHeader
		onBack={() => {
			goto(resolveRoute('/auth/redirect'));
		}}
	/>

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
				<a
					href={resolveRoute('/settings')}
					class="group py-nav-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary px-nav-item flex items-center gap-fieldGroup rounded-card transition-all duration-150"
					class:bg-sidebar-hover={isActive('/settings')}
				>
					<Icon type="settings" size="sm" color="default" class="flex-shrink-0" />
					<Text variant="body" size="sm" color="inherit" as="span" class="font-normal">
						General
					</Text>
				</a>

				<a
					href={resolveRoute('/settings/account')}
					class="group py-nav-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary px-nav-item flex items-center gap-fieldGroup rounded-card transition-all duration-150"
					class:bg-sidebar-hover={isActive('/settings/account')}
				>
					<Icon type="user" size="sm" color="default" class="flex-shrink-0" />
					<Text variant="body" size="sm" color="inherit" as="span" class="font-normal">
						Account
					</Text>
				</a>

				<a
					href={resolveRoute('/settings/integrations')}
					class="group py-nav-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary px-nav-item flex items-center gap-fieldGroup rounded-card transition-all duration-150"
					class:bg-sidebar-hover={isActive('/settings/integrations')}
				>
					<Icon type="code" size="sm" color="default" class="flex-shrink-0" />
					<Text variant="body" size="sm" color="inherit" as="span" class="font-normal">
						Integrations
					</Text>
				</a>

				<a
					href={resolveRoute('/settings/notifications')}
					class="group py-nav-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary px-nav-item flex items-center gap-fieldGroup rounded-card transition-all duration-150"
					class:bg-sidebar-hover={isActive('/settings/notifications')}
				>
					<Icon type="bell" size="sm" color="default" class="flex-shrink-0" />
					<Text variant="body" size="sm" color="inherit" as="span" class="font-normal">
						Notifications
					</Text>
				</a>

				<a
					href={resolveRoute('/settings/privacy')}
					class="group py-nav-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary px-nav-item flex items-center gap-fieldGroup rounded-card transition-all duration-150"
					class:bg-sidebar-hover={isActive('/settings/privacy')}
				>
					<Icon type="lock" size="sm" color="default" class="flex-shrink-0" />
					<Text variant="body" size="sm" color="inherit" as="span" class="font-normal">
						Privacy & Security
					</Text>
				</a>
			</div>
		</div>

		<!-- Preferences Section -->
		<div class="my-section-divider border-sidebar border-t"></div>
		<div style="padding-inline: var(--spacing-2); padding-block: var(--spacing-1);">
			<Text
				variant="label"
				size="sm"
				color="tertiary"
				class="mb-fieldGroup font-medium tracking-wider uppercase"
			>
				Preferences
			</Text>
			<div class="space-y-form-field-gap">
				<a
					href={resolveRoute('/settings/appearance')}
					class="group py-nav-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary px-nav-item flex items-center gap-fieldGroup rounded-card transition-all duration-150"
					class:bg-sidebar-hover={isActive('/settings/appearance')}
				>
					<Icon type="sun" size="sm" color="default" class="flex-shrink-0" />
					<Text variant="body" size="sm" color="inherit" as="span" class="font-normal">
						Appearance
					</Text>
				</a>

				<a
					href={resolveRoute('/settings/keyboard')}
					class="group py-nav-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary px-nav-item flex items-center gap-fieldGroup rounded-card transition-all duration-150"
					class:bg-sidebar-hover={isActive('/settings/keyboard')}
				>
					<Icon type="keyboard" size="sm" color="default" class="flex-shrink-0" />
					<Text variant="body" size="sm" color="inherit" as="span" class="font-normal">
						Keyboard Shortcuts
					</Text>
				</a>

				<a
					href={resolveRoute('/settings/data')}
					class="group py-nav-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary px-nav-item flex items-center gap-fieldGroup rounded-card transition-all duration-150"
					class:bg-sidebar-hover={isActive('/settings/data')}
				>
					<Icon type="database" size="sm" color="default" class="flex-shrink-0" />
					<Text variant="body" size="sm" color="inherit" as="span" class="font-normal">
						Data & Storage
					</Text>
				</a>
			</div>
		</div>

		<!-- Advanced Section -->
		<div class="my-section-divider border-sidebar border-t"></div>
		<div style="padding-inline: var(--spacing-2); padding-block: var(--spacing-1);">
			<Text
				variant="label"
				size="sm"
				color="tertiary"
				class="mb-fieldGroup font-medium tracking-wider uppercase"
			>
				Advanced
			</Text>
			<div class="space-y-form-field-gap">
				<a
					href={resolveRoute('/settings/billing')}
					class="group py-nav-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary px-nav-item flex items-center gap-fieldGroup rounded-card transition-all duration-150"
					class:bg-sidebar-hover={isActive('/settings/billing')}
				>
					<Icon type="payment" size="sm" color="default" class="flex-shrink-0" />
					<Text variant="body" size="sm" color="inherit" as="span" class="font-normal">
						Billing
					</Text>
				</a>

				<a
					href={resolveRoute('/settings/api')}
					class="group py-nav-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary px-nav-item flex items-center gap-fieldGroup rounded-card transition-all duration-150"
					class:bg-sidebar-hover={isActive('/settings/api')}
				>
					<Icon type="code" size="sm" color="default" class="flex-shrink-0" />
					<Text variant="body" size="sm" color="inherit" as="span" class="font-normal">
						API Keys
					</Text>
				</a>

				<a
					href={resolveRoute('/settings/permissions-test')}
					class="group py-nav-item text-small text-sidebar-secondary hover:bg-sidebar-hover hover:text-sidebar-primary px-nav-item flex items-center gap-fieldGroup rounded-card transition-all duration-150"
					class:bg-sidebar-hover={isActive('/settings/permissions-test')}
				>
					<Icon type="lock" size="sm" color="default" class="flex-shrink-0" />
					<Text variant="body" size="sm" color="inherit" as="span" class="font-normal">
						Permission Test
					</Text>
				</a>
			</div>
		</div>
	</nav>
</aside>
