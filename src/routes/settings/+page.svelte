<script lang="ts">
	import { Switch } from 'bits-ui';
	import { theme, isDark } from '$lib/stores/theme';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { onMount, getContext } from 'svelte';
	import type { FunctionReference, FunctionReturnType } from 'convex/server';
	import type { Id } from '../../../convex/_generated/dataModel';
	import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';

	// Types for Convex hooks
	type UseQueryReturn<Query extends FunctionReference<'query'>> =
		| {
				data: undefined;
				error: undefined;
				isLoading: true;
				isStale: false;
		  }
		| {
				data: undefined;
				error: Error;
				isLoading: false;
				isStale: boolean;
		  }
		| {
				data: FunctionReturnType<Query>;
				error: undefined;
				isLoading: false;
				isStale: boolean;
		  };

	// Mutation function type - returns a function that takes args and returns a promise
	type UseMutationReturn<Mutation extends FunctionReference<'mutation'>> = (
		args: FunctionArgs<Mutation>
	) => Promise<FunctionReturnType<Mutation>>;

	// Helper type for function args
	type FunctionArgs<F extends FunctionReference<any>> =
		F extends FunctionReference<any, any, infer Args> ? Args : never;

	// User settings type (decrypted, as returned from query)
	// Using string literal for Id type since table may not be in generated types yet
	type UserSettings = {
		_id: string;
		userId: string;
		theme?: 'light' | 'dark';
		claudeApiKey?: string; // Encrypted key from query
		readwiseApiKey?: string; // Encrypted key from query
		_creationTime: number;
	};

	// CRITICAL: Convex hooks MUST be called during component initialization (synchronously)
	// Solution: Import convex-svelte at top level and call hooks synchronously
	// Guard with browser check for SSR safety
	// setupConvexAuth already sets up the authenticated client context

	// Import at top level - the module import is safe, hooks are called conditionally
	import { useConvexClient } from 'convex-svelte';

	// Auth is handled by server-side middleware (no client-side auth needed)
	const isAuthenticated = true; // User is always authenticated in this route (protected by server)

	// Call useConvexClient at top level (must be synchronous, during component init)
	// setupConvexAuth should have already set up the authenticated client context
	const convexClient = browser ? useConvexClient() : null;

	// Create function references using makeFunctionReference
	// Import at top level (safe to import, execution is guarded)
	import { makeFunctionReference } from 'convex/server';

	// Get workspace context
	const organizations = getContext<UseOrganizations | undefined>('organizations');
	const activeOrganizationId = $derived(() => organizations?.activeOrganizationId ?? null);
	const organizationSummaries = $derived(() => organizations?.organizations ?? []);
	const currentOrganization = $derived(() => {
		const orgId = activeOrganizationId();
		if (!orgId) return null;
		return organizationSummaries().find((org) => org.organizationId === orgId);
	});
	const workspaceContext = $derived(() => {
		if (currentOrganization()) {
			return { type: 'organization', name: currentOrganization()!.name };
		}
		return { type: 'personal', name: 'Personal Workspace' };
	});

	const settingsApiFunctions = browser
		? {
				// User settings
				getUserSettings: makeFunctionReference('settings:getUserSettings') as any,
				updateClaudeApiKey: makeFunctionReference('settings:updateClaudeApiKey') as any,
				updateReadwiseApiKey: makeFunctionReference('settings:updateReadwiseApiKey') as any,
				updateTheme: makeFunctionReference('settings:updateTheme') as any,
				deleteClaudeApiKey: makeFunctionReference('settings:deleteClaudeApiKey') as any,
				deleteReadwiseApiKey: makeFunctionReference('settings:deleteReadwiseApiKey') as any,
				// Organization settings
				getOrganizationSettings: makeFunctionReference(
					'organizationSettings:getOrganizationSettings'
				) as any,
				updateOrganizationClaudeApiKey: makeFunctionReference(
					'organizationSettings:updateOrganizationClaudeApiKey'
				) as any,
				deleteOrganizationClaudeApiKey: makeFunctionReference(
					'organizationSettings:deleteOrganizationClaudeApiKey'
				) as any
			}
		: null;

	// Load settings using client.query (not useQuery, to keep it simple)
	let userSettings: UserSettings | null = $state(null);

	// Load settings when client is ready and user is authenticated
	onMount(async () => {
		if (!browser || !convexClient || !settingsApiFunctions || !isAuthenticated) {
			return;
		}

		try {
			// Get sessionId from page data (provided by authenticated layout)
			const sessionId = $page.data.sessionId;
			if (!sessionId) {
				console.error('Session ID not available');
				return;
			}
			
			// Load personal settings
			const settings = await convexClient.query(settingsApiFunctions.getUserSettings, { sessionId });
			if (settings) {
				userSettings = settings as UserSettings;

				// SECURITY: NEVER decrypt keys on the client - only track if they exist
				// Keys are encrypted in the database and should NEVER be sent to the client
				// Use boolean flags from query to know if keys exist
				claudeHasKey = settings.hasClaudeKey || false;
				readwiseHasKey = settings.hasReadwiseKey || false;
				// Keep inputs empty - never display actual keys on client
			}

			// Load organization settings if in org workspace
			const orgId = activeOrganizationId();
			if (orgId) {
				const orgSettings = await convexClient.query(settingsApiFunctions.getOrganizationSettings, {
					organizationId: orgId
				});
				if (orgSettings) {
					isOrgAdmin = orgSettings.isAdmin || false;
					// Track if org has Claude key (Readwise is always personal)
					// orgClaudeHasKey will be added below if needed
				}
			}
		} catch (e) {
			// Silently handle errors - user will see empty inputs
		}
	});

	// Mutation functions - created when client and functions are ready
	let updateClaudeApiKeyFn: ((args: { sessionId: string; apiKey: string }) => Promise<string>) | null = $state(null);
	let updateReadwiseApiKeyFn: ((args: { sessionId: string; apiKey: string }) => Promise<string>) | null = $state(null);
	let updateThemeFn: ((args: { sessionId: string; theme: 'light' | 'dark' }) => Promise<string>) | null = $state(null);
	let deleteClaudeApiKeyFn: ((sessionId: string) => Promise<string | null>) | null = $state(null);
	let deleteReadwiseApiKeyFn: ((sessionId: string) => Promise<string | null>) | null = $state(null);

	// Initialize mutations and actions when ready
	$effect(() => {
		if (!browser || !convexClient || !settingsApiFunctions) return;

		// Create action functions for API key updates (they're actions, not mutations, because they validate via HTTP)
		updateClaudeApiKeyFn = ((args: { sessionId: string; apiKey: string }) =>
			convexClient!.action(
				settingsApiFunctions.updateClaudeApiKey,
				args
			)) as typeof updateClaudeApiKeyFn;
		updateReadwiseApiKeyFn = ((args: { sessionId: string; apiKey: string }) =>
			convexClient!.action(
				settingsApiFunctions.updateReadwiseApiKey,
				args
			)) as typeof updateReadwiseApiKeyFn;
		// Theme update is still a mutation (no validation needed)
		updateThemeFn = ((args: { sessionId: string; theme: 'light' | 'dark' }) =>
			convexClient!.mutation(settingsApiFunctions.updateTheme, args)) as typeof updateThemeFn;
		// Delete functions are mutations
		deleteClaudeApiKeyFn = ((sessionId: string) =>
			convexClient!.mutation(
				settingsApiFunctions.deleteClaudeApiKey,
				{ sessionId }
			)) as typeof deleteClaudeApiKeyFn;
		deleteReadwiseApiKeyFn = ((sessionId: string) =>
			convexClient!.mutation(
				settingsApiFunctions.deleteReadwiseApiKey,
				{ sessionId }
			)) as typeof deleteReadwiseApiKeyFn;
	});

	// State for API keys (initialized from Convex)
	// CRITICAL: These are for user input ONLY - we NEVER store or display actual saved keys on the client

	// Personal workspace keys
	let claudeApiKey = $state('');
	let readwiseApiKey = $state('');

	// Organization workspace keys (separate state)
	let orgClaudeApiKey = $state('');
	let orgReadwiseApiKey = $state(''); // User's personal Readwise for org imports
	let isOrgAdmin = $state(false); // Whether user can edit org settings

	// Settings are loaded directly in onMount above, no separate effect needed

	// Validation states - 'idle' | 'validating' | 'valid' | 'invalid'
	let claudeValidationState = $state<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
	let claudeError = $state<string | null>(null);
	let claudeShowCheckmark = $state(false); // Temporary checkmark after validation
	let claudeHasKey = $state(false); // Track if key exists (for delete icon)

	let readwiseValidationState = $state<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
	let readwiseError = $state<string | null>(null);
	let readwiseShowCheckmark = $state(false); // Temporary checkmark after validation
	let readwiseHasKey = $state(false); // Track if key exists (for delete icon)

	// Handle blur validation for Claude API key
	async function handleClaudeKeyBlur() {
		const sessionId = $page.data.sessionId;
		// Only validate if there's a value and we're not already validating
		if (
			!sessionId ||
			!claudeApiKey.trim() ||
			claudeValidationState === 'validating' ||
			!updateClaudeApiKeyFn ||
			!isAuthenticated
		) {
			return;
		}

		claudeValidationState = 'validating';
		claudeError = null;

		try {
			await updateClaudeApiKeyFn({ sessionId, apiKey: claudeApiKey.trim() });
			claudeValidationState = 'valid';
			claudeHasKey = true; // Mark that key exists
			claudeShowCheckmark = true; // Show checkmark temporarily
			// Hide checkmark after 3 seconds
			setTimeout(() => {
				claudeShowCheckmark = false;
			}, 3000);
		} catch (error) {
			claudeValidationState = 'invalid';
			// Extract user-friendly error message (strip all technical details)
			const rawMessage = error instanceof Error ? error.message : String(error);
			// Remove all technical details: Convex prefixes, file paths, line numbers, "Called by client"
			let cleanMessage = rawMessage
				.replace(
					/^\[CONVEX[^\]]+\]\s*\[Request ID:[^\]]+\]\s*Server Error\s*Uncaught Error:\s*/i,
					''
				)
				.replace(/\s*at handler[^]*$/i, '') // Remove "at handler (file:line)"
				.replace(/\s*Called by client.*$/i, '') // Remove "Called by client"
				.replace(/\([^)]+\/[^)]+\.ts:\d+:\d+\)/g, '') // Remove file paths like "(../convex/settings.ts:77:2)"
				.trim();

			// Simplify common error messages
			if (cleanMessage.includes('Invalid') || cleanMessage.includes('invalid')) {
				cleanMessage = 'Invalid API key. Please check your key and try again.';
			} else if (
				cleanMessage.includes('Authentication') ||
				cleanMessage.includes('authentication')
			) {
				cleanMessage = 'Authentication failed. Please verify your API key.';
			} else if (cleanMessage.includes('format')) {
				cleanMessage = 'Invalid API key format.';
			}

			claudeError = cleanMessage || 'Invalid API key. Please check your key and try again.';
		}
	}

	// Handle blur validation for Readwise API key
	async function handleReadwiseKeyBlur() {
		const sessionId = $page.data.sessionId;
		// Only validate if there's a value and we're not already validating
		if (
			!sessionId ||
			!readwiseApiKey.trim() ||
			readwiseValidationState === 'validating' ||
			!updateReadwiseApiKeyFn ||
			!isAuthenticated
		) {
			return;
		}

		readwiseValidationState = 'validating';
		readwiseError = null;

		try {
			await updateReadwiseApiKeyFn({ sessionId, apiKey: readwiseApiKey.trim() });
			readwiseValidationState = 'valid';
			readwiseHasKey = true; // Mark that key exists
			readwiseShowCheckmark = true; // Show checkmark temporarily
			// Hide checkmark after 3 seconds
			setTimeout(() => {
				readwiseShowCheckmark = false;
			}, 3000);
		} catch (error) {
			readwiseValidationState = 'invalid';
			// Extract user-friendly error message (strip all technical details)
			const rawMessage = error instanceof Error ? error.message : String(error);
			// Remove all technical details: Convex prefixes, file paths, line numbers, "Called by client"
			let cleanMessage = rawMessage
				.replace(
					/^\[CONVEX[^\]]+\]\s*\[Request ID:[^\]]+\]\s*Server Error\s*Uncaught Error:\s*/i,
					''
				)
				.replace(/\s*at handler[^]*$/i, '') // Remove "at handler (file:line)"
				.replace(/\s*Called by client.*$/i, '') // Remove "Called by client"
				.replace(/\([^)]+\/[^)]+\.ts:\d+:\d+\)/g, '') // Remove file paths like "(../convex/settings.ts:77:2)"
				.trim();

			// Simplify common error messages
			if (cleanMessage.includes('Invalid') || cleanMessage.includes('invalid')) {
				cleanMessage = 'Invalid API key. Please check your key and try again.';
			} else if (
				cleanMessage.includes('Authentication') ||
				cleanMessage.includes('authentication')
			) {
				cleanMessage = 'Authentication failed. Please verify your API key.';
			} else if (cleanMessage.includes('format')) {
				cleanMessage = 'Invalid API key format.';
			}

			readwiseError = cleanMessage || 'Invalid API key. Please check your key and try again.';
		}
	}

	// Reset validation state when user starts typing
	function handleClaudeKeyInput(value: string) {
		claudeApiKey = value;
		if (claudeValidationState !== 'idle') {
			claudeValidationState = 'idle';
			claudeError = null;
		}
		claudeShowCheckmark = false; // Hide checkmark when typing
		// If input is cleared, key no longer exists
		if (!value.trim()) {
			claudeHasKey = false;
		}
	}

	function handleReadwiseKeyInput(value: string) {
		readwiseApiKey = value;
		if (readwiseValidationState !== 'idle') {
			readwiseValidationState = 'idle';
			readwiseError = null;
		}
		readwiseShowCheckmark = false; // Hide checkmark when typing
		// If input is cleared, key no longer exists
		if (!value.trim()) {
			readwiseHasKey = false;
		}
	}

	// Delete API key handlers
	async function handleDeleteClaudeKey() {
		const sessionId = $page.data.sessionId;
		if (!sessionId || !deleteClaudeApiKeyFn) return;

		try {
			await deleteClaudeApiKeyFn(sessionId);
			claudeApiKey = '';
			claudeHasKey = false;
			claudeShowCheckmark = false;
			claudeValidationState = 'idle';
			claudeError = null;
		} catch (e) {
			// Handle error silently - could show error message here if needed
		}
	}

	async function handleDeleteReadwiseKey() {
		const sessionId = $page.data.sessionId;
		if (!sessionId || !deleteReadwiseApiKeyFn) return;

		try {
			await deleteReadwiseApiKeyFn(sessionId);
			readwiseApiKey = '';
			readwiseHasKey = false;
			readwiseShowCheckmark = false;
			readwiseValidationState = 'idle';
			readwiseError = null;
		} catch (e) {
			// Handle error silently - could show error message here if needed
		}
	}
</script>

<div class="h-screen overflow-y-auto bg-base">
	<div class="mx-auto max-w-4xl p-inbox-container">
		<!-- Page Title -->
		<h1 class="mb-4 text-2xl font-bold text-primary">Settings</h1>

		<!-- Workspace Context Banner -->
		<div class="mb-8 rounded-md border border-accent-primary/20 bg-accent-primary/10 p-4">
			<div class="flex items-start gap-3">
				<svg
					class="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-primary"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<div class="min-w-0 flex-1">
					<p class="mb-1 text-sm font-medium text-accent-primary">
						{#if workspaceContext().type === 'personal'}
							Personal Settings
						{:else}
							Organization Settings: {workspaceContext().name}
						{/if}
					</p>
					<p class="text-sm text-secondary">
						{#if workspaceContext().type === 'personal'}
							These settings apply to your personal workspace only.
						{:else}
							These settings apply to {workspaceContext().name} organization. Switch to personal workspace
							for your personal settings.
						{/if}
					</p>
					<p class="mt-2 text-xs text-tertiary">
						<strong>Coming soon:</strong> Team-specific settings and advanced organization management.
					</p>
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-settings-section">
			<!-- General Section -->
			<section class="rounded-md border border-base bg-elevated">
				<div class="px-inbox-card py-inbox-card">
					<h2 class="mb-6 text-base font-bold text-primary">General</h2>

					<div class="flex flex-col gap-settings-row">
						<!-- Theme Preference -->
						<div class="border-b border-base px-settings-row py-settings-row last:border-b-0">
							<div class="flex items-start justify-between gap-4">
								<div class="min-w-0 flex-1">
									<label for="theme-toggle" class="mb-1 block text-sm font-medium text-primary">
										Interface theme
										<span
											class="ml-2 inline-flex items-center rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200"
										>
											👤 Personal Only
										</span>
									</label>
									<p class="text-sm text-secondary">
										{#if workspaceContext().type === 'organization'}
											Theme preferences are personal. Switch to your personal workspace to change.
										{:else}
											Select your preferred color scheme
										{/if}
									</p>
								</div>
								<div class="flex items-center gap-icon" role="presentation">
									<span class="text-sm text-secondary">
										{$isDark ? 'Dark mode' : 'Light mode'}
									</span>
									{#if $isDark}
										<svg
											class="h-4 w-4 flex-shrink-0 text-secondary"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
											/>
										</svg>
									{:else}
										<svg
											class="h-4 w-4 flex-shrink-0 text-secondary"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
											/>
										</svg>
									{/if}
									<Switch.Root
										id="theme-toggle"
										checked={$isDark}
										disabled={workspaceContext().type === 'organization'}
										onCheckedChange={(checked) => {
											if (workspaceContext().type !== 'organization') {
												theme.setTheme(checked ? 'dark' : 'light');
											}
										}}
										class="relative inline-flex h-4 w-8 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none {workspaceContext()
											.type === 'organization'
											? 'cursor-not-allowed opacity-50'
											: 'cursor-pointer'} {$isDark ? 'bg-gray-900' : 'bg-gray-300'}"
									>
										<Switch.Thumb
											class="pointer-events-none inline-block h-3 w-3 translate-x-0 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4"
										/>
									</Switch.Root>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- AI Section -->
			<section class="rounded-md border border-base bg-elevated">
				<div class="px-inbox-card py-inbox-card">
					<h2 class="mb-6 text-base font-bold text-primary">AI</h2>

					<div class="flex flex-col gap-settings-row">
						<!-- Claude API Key -->
						<div class="border-b border-base px-settings-row py-settings-row last:border-b-0">
							<div class="flex items-start justify-between gap-4">
								<div class="min-w-0 flex-1">
									<label for="claude-key" class="mb-1 block text-sm font-medium text-primary">
										Claude API Key
										{#if workspaceContext().type === 'organization'}
											<span
												class="ml-2 inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
											>
												🏢 Organization
											</span>
											{#if !isOrgAdmin}
												<span
													class="ml-1 inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300"
												>
													🔒 Admin Only
												</span>
											{/if}
										{:else}
											<span
												class="ml-2 inline-flex items-center rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200"
											>
												👤 Personal
											</span>
										{/if}
									</label>
									<p class="text-sm text-secondary">
										{#if workspaceContext().type === 'organization'}
											{#if isOrgAdmin}
												Organization's Claude API key (admin controlled). Cost attributed to
												organization.
											{:else}
												Contact an admin to configure the organization's Claude API key.
											{/if}
										{:else}
											Used for AI-powered flashcard generation from your content (personal use only)
										{/if}
									</p>
								</div>
								<div class="flex flex-shrink-0 flex-col gap-1">
									<div class="relative inline-block">
										<input
											id="claude-key"
											type="password"
											bind:value={claudeApiKey}
											oninput={(e) => handleClaudeKeyInput(e.currentTarget.value)}
											onblur={handleClaudeKeyBlur}
											disabled={claudeValidationState === 'validating' ||
												(workspaceContext().type === 'organization' && !isOrgAdmin)}
											placeholder={workspaceContext().type === 'organization' && !isOrgAdmin
												? 'Contact admin'
												: claudeHasKey
													? '••••••••••••••••'
													: 'sk-...'}
											class="w-64 border bg-base px-3 py-2 pr-10 text-sm {claudeValidationState ===
											'valid'
												? 'border-green-500'
												: claudeValidationState === 'invalid'
													? 'border-red-500'
													: 'border-base'} rounded-md text-primary transition-all placeholder:text-tertiary focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none {claudeValidationState ===
												'validating' ||
											(workspaceContext().type === 'organization' && !isOrgAdmin)
												? 'cursor-not-allowed opacity-50'
												: ''}"
										/>
										<!-- Validation indicator icon / Delete button -->
										{#if claudeValidationState === 'validating'}
											<div class="absolute top-1/2 right-2 -translate-y-1/2">
												<svg
													class="h-4 w-4 animate-spin text-tertiary"
													fill="none"
													viewBox="0 0 24 24"
												>
													<circle
														class="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														stroke-width="4"
													/>
													<path
														class="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
													/>
												</svg>
											</div>
										{:else if claudeShowCheckmark}
											<!-- Temporary checkmark (shows for 3 seconds after validation) -->
											<div class="absolute top-1/2 right-2 -translate-y-1/2">
												<svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
													<path
														fill-rule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
														clip-rule="evenodd"
													/>
												</svg>
											</div>
										{:else if claudeHasKey}
											<!-- Delete button (trash icon) - replaces eye icon for security -->
											<button
												type="button"
												onclick={handleDeleteClaudeKey}
												class="absolute top-1/2 right-2 z-10 -translate-y-1/2 text-secondary transition-colors hover:text-red-500"
												title="Remove API key"
											>
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										{:else if claudeValidationState === 'invalid'}
											<div class="absolute top-1/2 right-2 -translate-y-1/2">
												<svg
													class="h-4 w-4 text-red-500"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</div>
										{/if}
									</div>
									<!-- Success/Error message or Get API key link below input -->
									{#if claudeShowCheckmark}
										<p class="mt-1 max-w-64 text-xs text-green-500">API key is valid and saved</p>
									{:else if claudeValidationState === 'invalid' && claudeError}
										<p class="mt-1 max-w-64 text-xs text-red-500">{claudeError}</p>
									{:else if !claudeHasKey && claudeValidationState !== 'validating'}
										<a
											href="https://console.anthropic.com/settings/keys"
											target="_blank"
											rel="noopener noreferrer"
											class="mt-1 max-w-64 text-xs text-blue-500 underline transition-colors hover:text-blue-600"
										>
											Get API key
										</a>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Sources Section -->
			<section class="rounded-md border border-base bg-elevated">
				<div class="px-inbox-card py-inbox-card">
					<h2 class="mb-6 text-base font-bold text-primary">Sources</h2>

					<div class="flex flex-col gap-settings-row">
						<!-- Readwise API Key -->
						<div class="border-b border-base px-settings-row py-settings-row last:border-b-0">
							<div class="flex items-start justify-between gap-4">
								<div class="min-w-0 flex-1">
									<label for="readwise-key" class="mb-1 block text-sm font-medium text-primary">
										Readwise API Key
										<span
											class="ml-2 inline-flex items-center rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200"
										>
											👤 Personal (User-owned)
										</span>
									</label>
									<p class="text-sm text-secondary">
										{#if workspaceContext().type === 'organization'}
											Your personal Readwise account. Imports will be shared with the organization.
										{:else}
											Import highlights and notes from your personal Readwise account
										{/if}
									</p>
									{#if workspaceContext().type === 'organization'}
										<p class="mt-1 text-xs text-blue-600 dark:text-blue-400">
											💡 Tip: Use the same key across workspaces to sync content everywhere
										</p>
									{/if}
								</div>
								<div class="flex flex-shrink-0 flex-col gap-1">
									<div class="relative inline-block">
										<input
											id="readwise-key"
											type="password"
											bind:value={readwiseApiKey}
											oninput={(e) => handleReadwiseKeyInput(e.currentTarget.value)}
											onblur={handleReadwiseKeyBlur}
											disabled={readwiseValidationState === 'validating'}
											placeholder={readwiseHasKey ? '••••••••••••••••' : 'token_...'}
											class="w-64 border bg-base px-3 py-2 pr-10 text-sm {readwiseValidationState ===
											'valid'
												? 'border-green-500'
												: readwiseValidationState === 'invalid'
													? 'border-red-500'
													: 'border-base'} rounded-md text-primary transition-all placeholder:text-tertiary focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none {readwiseValidationState ===
											'validating'
												? 'cursor-not-allowed opacity-50'
												: ''}"
										/>
										<!-- Validation indicator icon / Delete button -->
										{#if readwiseValidationState === 'validating'}
											<div class="absolute top-1/2 right-2 -translate-y-1/2">
												<svg
													class="h-4 w-4 animate-spin text-tertiary"
													fill="none"
													viewBox="0 0 24 24"
												>
													<circle
														class="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														stroke-width="4"
													/>
													<path
														class="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
													/>
												</svg>
											</div>
										{:else if readwiseShowCheckmark}
											<!-- Temporary checkmark (shows for 3 seconds after validation) -->
											<div class="absolute top-1/2 right-2 -translate-y-1/2">
												<svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
													<path
														fill-rule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
														clip-rule="evenodd"
													/>
												</svg>
											</div>
										{:else if readwiseHasKey}
											<!-- Delete button (trash icon) - replaces eye icon for security -->
											<button
												type="button"
												onclick={handleDeleteReadwiseKey}
												class="absolute top-1/2 right-2 z-10 -translate-y-1/2 text-secondary transition-colors hover:text-red-500"
												title="Remove API key"
											>
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										{:else if readwiseValidationState === 'invalid'}
											<div class="absolute top-1/2 right-2 -translate-y-1/2">
												<svg
													class="h-4 w-4 text-red-500"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</div>
										{/if}
									</div>
									<!-- Success/Error message or Get API key link below input -->
									{#if readwiseShowCheckmark}
										<p class="mt-1 max-w-64 text-xs text-green-500">API key is valid and saved</p>
									{:else if readwiseValidationState === 'invalid' && readwiseError}
										<p class="mt-1 max-w-64 text-xs text-red-500">{readwiseError}</p>
									{:else if !readwiseHasKey && readwiseValidationState !== 'validating'}
										<a
											href="https://readwise.io/access_token"
											target="_blank"
											rel="noopener noreferrer"
											class="mt-1 max-w-64 text-xs text-blue-500 underline transition-colors hover:text-blue-600"
										>
											Get API key
										</a>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	</div>
</div>
