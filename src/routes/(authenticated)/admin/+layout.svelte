<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	let { children, data }: { children: import('svelte').Snippet; data: { isAdmin?: boolean } } =
		$props();

	const currentPath = $derived(browser ? $page.url.pathname : '');
	const isAdmin = $derived(data?.isAdmin ?? false);
	const isErrorPage = $derived(browser ? $page.status >= 400 : false);

	// Only show sidebar if user is admin AND not showing error page
	const showSidebar = $derived(isAdmin && !isErrorPage);

	const navItems = [
		{ href: '/admin', label: 'Dashboard', icon: 'bar-chart' },
		{ href: '/admin/rbac', label: 'RBAC', icon: 'lock' },
		{ href: '/admin/users', label: 'Users', icon: 'users' },
		{ href: '/admin/feature-flags', label: 'Feature Flags', icon: 'flag' },
		{ href: '/admin/doc-404s', label: 'Doc 404s', icon: 'file-x' },
		{ href: '/admin/settings', label: 'Settings', icon: 'settings' }
	];

	// Icon SVG paths
	const iconPaths: Record<string, string> = {
		'bar-chart':
			'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
		lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
		users:
			'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
		flag: 'M3 3h2v18H3V3zm4 0h14v2H7V3zm0 4h14v2H7V7zm0 4h14v2H7v-2zm0 4h14v2H7v-2z',
		settings:
			'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
		'file-x':
			'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
	};
</script>

<div class="flex h-screen overflow-hidden">
	<!-- Sidebar - Only show if user is admin and not showing error page -->
	{#if showSidebar}
		<aside class="w-64 border-r border-sidebar bg-sidebar">
			<nav class="p-4">
				<h2 class="mb-4 text-lg font-semibold text-sidebar-primary">Admin</h2>
				<ul class="space-y-1">
					{#each navItems as item (item.href)}
						<li>
							<a
								href={item.href}
								class="flex items-center gap-icon rounded px-nav-item py-menu-item text-sm transition-colors {currentPath ===
								item.href
									? 'bg-hover-solid text-sidebar-primary'
									: 'text-sidebar-secondary hover:bg-hover-solid hover:text-sidebar-primary'}"
							>
								<svg
									class="h-4 w-4 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d={iconPaths[item.icon]}
									/>
								</svg>
								<span>{item.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</aside>
	{/if}

	<!-- Main Content -->
	<main class="flex-1 overflow-y-auto">
		{@render children()}
	</main>
</div>
