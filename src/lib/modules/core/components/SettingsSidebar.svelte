<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import SettingsSidebarHeader from '$lib/modules/core/components/SettingsSidebarHeader.svelte';
	import { resolveRoute } from '$lib/utils/navigation';

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
	class="flex h-full flex-col overflow-hidden border-r border-sidebar bg-sidebar text-sidebar-primary"
	style="width: 286px; flex-shrink: 0;"
>
	<!-- Header with Back Button -->
	<SettingsSidebarHeader
		onBack={() => {
			goto(resolveRoute('/inbox'));
		}}
	/>

	<!-- Navigation - Scrollable area -->
	<nav class="flex-1 overflow-y-auto px-nav-container py-nav-container">
		<!-- Settings Section -->
		<div class="px-section py-section">
			<p class="mb-1.5 text-label font-medium tracking-wider text-sidebar-tertiary uppercase">
				Settings
			</p>
			<div class="space-y-0.5">
				<a
					href={resolveRoute('/settings')}
					class="group flex items-center gap-icon rounded-card px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:bg-sidebar-hover={isActive('/settings')}
				>
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
							d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
					<span class="font-normal">General</span>
				</a>

				<a
					href={resolveRoute('/settings/account')}
					class="group flex items-center gap-icon rounded-card px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:bg-sidebar-hover={isActive('/settings/account')}
				>
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
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
					<span class="font-normal">Account</span>
				</a>

				<a
					href={resolveRoute('/settings/integrations')}
					class="group flex items-center gap-icon rounded-card px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:bg-sidebar-hover={isActive('/settings/integrations')}
				>
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
							d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					<span class="font-normal">Integrations</span>
				</a>

				<a
					href={resolveRoute('/settings/notifications')}
					class="group flex items-center gap-icon rounded-card px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:bg-sidebar-hover={isActive('/settings/notifications')}
				>
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
							d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
						/>
					</svg>
					<span class="font-normal">Notifications</span>
				</a>

				<a
					href={resolveRoute('/settings/privacy')}
					class="group flex items-center gap-icon rounded-card px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:bg-sidebar-hover={isActive('/settings/privacy')}
				>
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
							d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
						/>
					</svg>
					<span class="font-normal">Privacy & Security</span>
				</a>
			</div>
		</div>

		<!-- Preferences Section -->
		<div class="my-2 border-t border-sidebar"></div>
		<div class="px-section py-section">
			<p class="mb-1.5 text-label font-medium tracking-wider text-sidebar-tertiary uppercase">
				Preferences
			</p>
			<div class="space-y-0.5">
				<a
					href={resolveRoute('/settings/appearance')}
					class="group flex items-center gap-icon rounded-card px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:bg-sidebar-hover={isActive('/settings/appearance')}
				>
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
							d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
						/>
					</svg>
					<span class="font-normal">Appearance</span>
				</a>

				<a
					href={resolveRoute('/settings/keyboard')}
					class="group flex items-center gap-icon rounded-card px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:bg-sidebar-hover={isActive('/settings/keyboard')}
				>
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
							d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
						/>
					</svg>
					<span class="font-normal">Keyboard Shortcuts</span>
				</a>

				<a
					href={resolveRoute('/settings/data')}
					class="group flex items-center gap-icon rounded-card px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:bg-sidebar-hover={isActive('/settings/data')}
				>
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
							d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
						/>
					</svg>
					<span class="font-normal">Data & Storage</span>
				</a>
			</div>
		</div>

		<!-- Advanced Section -->
		<div class="my-2 border-t border-sidebar"></div>
		<div class="px-section py-section">
			<p class="mb-1.5 text-label font-medium tracking-wider text-sidebar-tertiary uppercase">
				Advanced
			</p>
			<div class="space-y-0.5">
				<a
					href={resolveRoute('/settings/billing')}
					class="group flex items-center gap-icon rounded-card px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:bg-sidebar-hover={isActive('/settings/billing')}
				>
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
							d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v4a3 3 0 003 3z"
						/>
					</svg>
					<span class="font-normal">Billing</span>
				</a>

				<a
					href={resolveRoute('/settings/api')}
					class="group flex items-center gap-icon rounded-card px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:bg-sidebar-hover={isActive('/settings/api')}
				>
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
							d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
						/>
					</svg>
					<span class="font-normal">API Keys</span>
				</a>

				<a
					href={resolveRoute('/settings/permissions-test')}
					class="group flex items-center gap-icon rounded-card px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:bg-sidebar-hover={isActive('/settings/permissions-test')}
				>
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
							d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
						/>
					</svg>
					<span class="font-normal">Permission Test</span>
				</a>
			</div>
		</div>
	</nav>
</aside>
