<script lang="ts">
	import { Switch, Text, Heading, Icon, Badge } from '$lib/components/atoms';
	import { switchRootRecipe, switchThumbRecipe } from '$lib/design-system/recipes';
	import { setTheme, isDark as isDarkFn } from '$lib/stores/theme.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { FunctionReference } from 'convex/server';
	import type { Id } from '$convex/_generated/dataModel';

	// Get workspace name from parent layout data
	const workspaceName = $derived(() => {
		const workspace = ($page.data as { workspace?: { name?: string } }).workspace;
		return workspace?.name ?? 'Workspace';
	});

	// CRITICAL: Convex hooks MUST be called during component initialization (synchronously)
	// Import at top level - the module import is safe, hooks are called conditionally
	import { useConvexClient } from 'convex-svelte';

	// Auth is handled by server-side middleware (no client-side auth needed)
	const isAuthenticated = true; // User is always authenticated in this route (protected by server)

	// Call useConvexClient at top level (must be synchronous, during component init)
	const convexClient = browser ? useConvexClient() : null;

	// Create function references using makeFunctionReference
	// Import at top level (safe to import, execution is guarded)
	import { makeFunctionReference } from 'convex/server';

	let { data }: { data: { sessionId: string; workspaceId: string } } = $props();

	const settingsApiFunctions = browser
		? {
				// User settings
				getUserSettings: makeFunctionReference(
					'core/workspaces/settings:getUserSettings'
				) as FunctionReference<
					'query',
					'public',
					{ sessionId: string },
					{ hasClaudeKey: boolean; hasReadwiseKey: boolean; theme: string } | null
				>,
				updateClaudeApiKey: makeFunctionReference(
					'core/workspaces/settings:updateClaudeApiKey'
				) as FunctionReference<
					'action',
					'public',
					{ sessionId: string; apiKey: string },
					Id<'users'>
				>,
				updateReadwiseApiKey: makeFunctionReference(
					'core/workspaces/settings:updateReadwiseApiKey'
				) as FunctionReference<
					'action',
					'public',
					{ sessionId: string; apiKey: string },
					Id<'users'>
				>,
				updateTheme: makeFunctionReference(
					'core/workspaces/settings:updateTheme'
				) as FunctionReference<
					'mutation',
					'public',
					{ sessionId: string; theme: string },
					Id<'userSettings'>
				>,
				removeClaudeApiKey: makeFunctionReference(
					'core/workspaces/settings:removeClaudeApiKey'
				) as FunctionReference<'action', 'public', { sessionId: string }, Id<'users'>>,
				removeReadwiseApiKey: makeFunctionReference(
					'core/workspaces/settings:removeReadwiseApiKey'
				) as FunctionReference<'action', 'public', { sessionId: string }, Id<'users'>>
			}
		: null;

	// Create reactive isDark derived value (since isDark() is a function, not a store)
	const isDark = $derived.by(() => {
		return isDarkFn();
	});

	// Load settings when client is ready and user is authenticated
	onMount(async () => {
		if (!browser || !convexClient || !settingsApiFunctions || !isAuthenticated) {
			return;
		}

		try {
			const sessionId = data.sessionId;
			if (!sessionId) {
				console.error('Session ID not available');
				return;
			}

			// Load personal settings
			const settings = await convexClient.query(settingsApiFunctions.getUserSettings, {
				sessionId
			});
			if (settings) {
				// SECURITY: NEVER decrypt keys on the client - only track if they exist
				claudeHasKey = settings.hasClaudeKey || false;
				readwiseHasKey = settings.hasReadwiseKey || false;
				// Keep inputs empty - never display actual keys on client
			}
		} catch (_e) {
			// Silently handle errors - user will see empty inputs
		}
	});

	// Mutation functions - created when client and functions are ready
	let updateClaudeApiKeyFn:
		| ((args: { sessionId: string; apiKey: string }) => Promise<string>)
		| null = $state(null);
	let updateReadwiseApiKeyFn:
		| ((args: { sessionId: string; apiKey: string }) => Promise<string>)
		| null = $state(null);
	let removeClaudeApiKeyFn: ((sessionId: string) => Promise<string | null>) | null = $state(null);
	let removeReadwiseApiKeyFn: ((sessionId: string) => Promise<string | null>) | null = $state(null);

	// Initialize mutations and actions when ready
	$effect(() => {
		if (!browser || !convexClient || !settingsApiFunctions) return;

		// Create action functions for API key updates
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
		// Remove functions are actions
		removeClaudeApiKeyFn = ((sessionId: string) =>
			convexClient!.action(settingsApiFunctions.removeClaudeApiKey, {
				sessionId
			})) as typeof removeClaudeApiKeyFn;
		removeReadwiseApiKeyFn = ((sessionId: string) =>
			convexClient!.action(settingsApiFunctions.removeReadwiseApiKey, {
				sessionId
			})) as typeof removeReadwiseApiKeyFn;
	});

	// State for API keys (initialized from Convex)
	// CRITICAL: These are for user input ONLY - we NEVER store or display actual saved keys on the client
	let claudeApiKey = $state('');
	let readwiseApiKey = $state('');

	// Validation states - 'idle' | 'validating' | 'valid' | 'invalid'
	let claudeValidationState = $state<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
	let claudeError = $state<string | null>(null);
	let claudeShowCheckmark = $state(false);
	let claudeHasKey = $state(false);

	let readwiseValidationState = $state<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
	let readwiseError = $state<string | null>(null);
	let readwiseShowCheckmark = $state(false);
	let readwiseHasKey = $state(false);

	// Handle blur validation for Claude API key
	async function handleClaudeKeyBlur() {
		const sessionId = data.sessionId;
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
			claudeHasKey = true;
			claudeShowCheckmark = true;
			setTimeout(() => {
				claudeShowCheckmark = false;
			}, 3000);
		} catch (error) {
			claudeValidationState = 'invalid';
			const rawMessage = error instanceof Error ? error.message : String(error);
			let cleanMessage = rawMessage
				.replace(
					/^\[CONVEX[^\]]+\]\s*\[Request ID:[^\]]+\]\s*Server Error\s*Uncaught Error:\s*/i,
					''
				)
				.replace(/\s*at handler[^]*$/i, '')
				.replace(/\s*Called by client.*$/i, '')
				.replace(/\([^)]+\/[^)]+\.ts:\d+:\d+\)/g, '')
				.trim();

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
		const sessionId = data.sessionId;
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
			readwiseHasKey = true;
			readwiseShowCheckmark = true;
			setTimeout(() => {
				readwiseShowCheckmark = false;
			}, 3000);
		} catch (error) {
			readwiseValidationState = 'invalid';
			const rawMessage = error instanceof Error ? error.message : String(error);
			let cleanMessage = rawMessage
				.replace(
					/^\[CONVEX[^\]]+\]\s*\[Request ID:[^\]]+\]\s*Server Error\s*Uncaught Error:\s*/i,
					''
				)
				.replace(/\s*at handler[^]*$/i, '')
				.replace(/\s*Called by client.*$/i, '')
				.replace(/\([^)]+\/[^)]+\.ts:\d+:\d+\)/g, '')
				.trim();

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
		claudeShowCheckmark = false;
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
		readwiseShowCheckmark = false;
		if (!value.trim()) {
			readwiseHasKey = false;
		}
	}

	// Delete API key handlers
	async function handleRemoveClaudeKey() {
		const sessionId = data.sessionId;
		if (!sessionId || !removeClaudeApiKeyFn) return;

		try {
			await removeClaudeApiKeyFn(sessionId);
			claudeApiKey = '';
			claudeHasKey = false;
			claudeShowCheckmark = false;
			claudeValidationState = 'idle';
			claudeError = null;
		} catch (_e) {
			// Handle error silently
		}
	}

	async function handleRemoveReadwiseKey() {
		const sessionId = data.sessionId;
		if (!sessionId || !removeReadwiseApiKeyFn) return;

		try {
			await removeReadwiseApiKeyFn(sessionId);
			readwiseApiKey = '';
			readwiseHasKey = false;
			readwiseShowCheckmark = false;
			readwiseValidationState = 'idle';
			readwiseError = null;
		} catch (_e) {
			// Handle error silently
		}
	}
</script>

<div class="bg-base h-full overflow-y-auto">
	<div class="px-page py-page mx-auto max-w-4xl">
		<!-- Page Title -->
		<Heading level={1} class="mb-section">Settings</Heading>

		<!-- Workspace Context Banner -->
		<div
			class="border-accent-primary/20 bg-accent-primary/10 rounded-card card-padding mb-header border"
		>
			<div class="gap-fieldGroup flex items-start">
				<Icon type="info" size="md" color="accent-primary" class="flex-shrink-0" />
				<div class="min-w-0 flex-1">
					<Text variant="body" size="sm" color="accent-primary" class="mb-fieldGroup font-medium">
						Workspace Settings: {workspaceName()}
					</Text>
					<Text variant="body" size="sm" color="secondary" class="mb-fieldGroup">
						These settings apply to {workspaceName()} workspace. Personal settings (theme, API keys)
						are managed within this workspace context.
					</Text>
				</div>
			</div>
		</div>

		<div class="gap-section flex flex-col">
			<!-- General Section -->
			<section class="border-base rounded-card bg-elevated border">
				<div class="card-padding">
					<Heading level={2} class="mb-header">General</Heading>

					<div class="gap-form flex flex-col">
						<!-- Theme Preference -->
						<div class="border-base card-padding border-b last:border-b-0">
							<div class="gap-form flex items-start justify-between">
								<div class="min-w-0 flex-1">
									<label for="theme-toggle" class="mb-fieldGroup block">
										<Text variant="body" size="sm" color="primary" as="span" class="font-medium">
											Interface theme
											<Badge
												variant="default"
												size="sm"
												style="margin-left: var(--spacing-fieldGroup-gap);"
											>
												👤 Personal Only
											</Badge>
										</Text>
									</label>
									<Text variant="body" size="sm" color="secondary">
										Theme preferences are personal and apply across all workspaces.
									</Text>
								</div>
								<div class="gap-fieldGroup flex items-center" role="presentation">
									<Text variant="body" size="sm" color="secondary">
										{isDark ? 'Dark mode' : 'Light mode'}
									</Text>
									<Icon
										type={isDark ? 'moon' : 'sun'}
										size="sm"
										color="secondary"
										class="flex-shrink-0"
									/>
									<Switch.Root
										id="theme-toggle"
										checked={isDark}
										onCheckedChange={(checked) => {
											setTheme(checked ? 'dark' : 'light');
										}}
										class={switchRootRecipe({ checked: isDark })}
									>
										<Switch.Thumb class={switchThumbRecipe()} />
									</Switch.Root>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- AI Section -->
			<section class="border-base rounded-card bg-elevated border">
				<div class="card-padding">
					<Heading level={2} class="mb-header">AI</Heading>

					<div class="gap-form flex flex-col">
						<!-- Claude API Key -->
						<div class="border-base card-padding border-b last:border-b-0">
							<div class="gap-form flex items-start justify-between">
								<div class="min-w-0 flex-1">
									<label for="claude-key" class="mb-fieldGroup block">
										<Text variant="body" size="sm" color="primary" as="span" class="font-medium">
											Claude API Key
											<Badge
												variant="default"
												size="sm"
												style="margin-left: var(--spacing-fieldGroup-gap);"
											>
												👤 Personal
											</Badge>
										</Text>
									</label>
									<Text variant="body" size="sm" color="secondary">
										Used for AI-powered flashcard generation from your content (personal use within
										workspace).
									</Text>
								</div>
								<div class="gap-fieldGroup flex flex-shrink-0 flex-col">
									<div class="relative inline-block">
										<input
											id="claude-key"
											type="password"
											bind:value={claudeApiKey}
											oninput={(e) => handleClaudeKeyInput(e.currentTarget.value)}
											onblur={handleClaudeKeyBlur}
											disabled={claudeValidationState === 'validating'}
											placeholder={claudeHasKey ? '••••••••••••••••' : 'sk-...'}
											style="width: 16rem;"
											class="text-small bg-base px-input py-input pr-input-iconRight border {claudeValidationState ===
											'valid'
												? 'border-success'
												: claudeValidationState === 'invalid'
													? 'border-error'
													: 'border-base'} focus:ring-accent-primary rounded-card text-primary placeholder:text-tertiary transition-all focus:border-transparent focus:ring-2 focus:outline-none {claudeValidationState ===
											'validating'
												? 'opacity-disabled cursor-not-allowed'
												: ''}"
										/>
										<!-- Validation indicator icon / Delete button -->
										{#if claudeValidationState === 'validating'}
											<div
												class="absolute top-1/2 -translate-y-1/2"
												style="right: var(--spacing-fieldGroup-gap);"
											>
												<svg
													class="icon-sm text-tertiary animate-spin"
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
											<div
												class="absolute top-1/2 -translate-y-1/2"
												style="right: var(--spacing-fieldGroup-gap);"
											>
												<svg class="icon-md text-success" fill="currentColor" viewBox="0 0 20 20">
													<path
														fill-rule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
														clip-rule="evenodd"
													/>
												</svg>
											</div>
										{:else if claudeHasKey}
											<button
												type="button"
												onclick={handleRemoveClaudeKey}
												class="text-secondary hover:text-error absolute top-1/2 z-10 -translate-y-1/2 transition-colors"
												style="right: var(--spacing-fieldGroup-gap);"
												title="Remove API key"
											>
												<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										{:else if claudeValidationState === 'invalid'}
											<div
												class="absolute top-1/2 -translate-y-1/2"
												style="right: var(--spacing-fieldGroup-gap);"
											>
												<svg
													class="icon-sm text-error"
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
										<Text
											variant="label"
											size="sm"
											color="success"
											class="mt-fieldGroup"
											style="max-width: 16rem;"
										>
											API key is valid and saved
										</Text>
									{:else if claudeValidationState === 'invalid' && claudeError}
										<Text
											variant="label"
											size="sm"
											color="error"
											class="mt-fieldGroup"
											style="max-width: 16rem;"
										>
											{claudeError}
										</Text>
									{:else if !claudeHasKey && claudeValidationState !== 'validating'}
										<a
											href="https://console.anthropic.com/settings/keys"
											target="_blank"
											rel="noopener noreferrer"
											class="mt-fieldGroup"
											style="max-width: 16rem;"
										>
											<Text
												variant="label"
												size="sm"
												color="accent-primary"
												class="hover:text-accent-hover underline transition-colors"
											>
												Get API key
											</Text>
										</a>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Sources Section -->
			<section class="border-base rounded-card bg-elevated border">
				<div class="card-padding">
					<Heading level={2} class="mb-header">Sources</Heading>

					<div class="gap-form flex flex-col">
						<!-- Readwise API Key -->
						<div class="border-base card-padding border-b last:border-b-0">
							<div class="gap-form flex items-start justify-between">
								<div class="min-w-0 flex-1">
									<label for="readwise-key" class="mb-fieldGroup block">
										<Text variant="body" size="sm" color="primary" as="span" class="font-medium">
											Readwise API Key
											<Badge
												variant="default"
												size="sm"
												style="margin-left: var(--spacing-fieldGroup-gap);"
											>
												👤 Personal (User-owned)
											</Badge>
										</Text>
									</label>
									<Text variant="body" size="sm" color="secondary" class="mb-fieldGroup">
										Your personal Readwise account. Imports will be shared with the workspace.
									</Text>
									<Text variant="label" size="sm" color="accent-primary" class="mt-fieldGroup">
										💡 Tip: Use the same key across workspaces to sync content everywhere
									</Text>
								</div>
								<div class="gap-fieldGroup flex flex-shrink-0 flex-col">
									<div class="relative inline-block">
										<input
											id="readwise-key"
											type="password"
											bind:value={readwiseApiKey}
											oninput={(e) => handleReadwiseKeyInput(e.currentTarget.value)}
											onblur={handleReadwiseKeyBlur}
											disabled={readwiseValidationState === 'validating'}
											placeholder={readwiseHasKey ? '••••••••••••••••' : 'token_...'}
											style="width: 16rem;"
											class="text-small bg-base px-input py-input pr-input-iconRight border {readwiseValidationState ===
											'valid'
												? 'border-success'
												: readwiseValidationState === 'invalid'
													? 'border-error'
													: 'border-base'} focus:ring-accent-primary rounded-card text-primary placeholder:text-tertiary transition-all focus:border-transparent focus:ring-2 focus:outline-none {readwiseValidationState ===
											'validating'
												? 'opacity-disabled cursor-not-allowed'
												: ''}"
										/>
										<!-- Validation indicator icon / Delete button -->
										{#if readwiseValidationState === 'validating'}
											<div
												class="absolute top-1/2 -translate-y-1/2"
												style="right: var(--spacing-fieldGroup-gap);"
											>
												<svg
													class="icon-sm text-tertiary animate-spin"
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
											<div
												class="absolute top-1/2 -translate-y-1/2"
												style="right: var(--spacing-fieldGroup-gap);"
											>
												<svg class="icon-md text-success" fill="currentColor" viewBox="0 0 20 20">
													<path
														fill-rule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
														clip-rule="evenodd"
													/>
												</svg>
											</div>
										{:else if readwiseHasKey}
											<button
												type="button"
												onclick={handleRemoveReadwiseKey}
												class="text-secondary hover:text-error absolute top-1/2 z-10 -translate-y-1/2 transition-colors"
												style="right: var(--spacing-fieldGroup-gap);"
												title="Remove API key"
											>
												<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										{:else if readwiseValidationState === 'invalid'}
											<div
												class="absolute top-1/2 -translate-y-1/2"
												style="right: var(--spacing-fieldGroup-gap);"
											>
												<svg
													class="icon-sm text-error"
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
										<Text
											variant="label"
											size="sm"
											color="success"
											class="mt-fieldGroup"
											style="max-width: 16rem;"
										>
											API key is valid and saved
										</Text>
									{:else if readwiseValidationState === 'invalid' && readwiseError}
										<Text
											variant="label"
											size="sm"
											color="error"
											class="mt-fieldGroup"
											style="max-width: 16rem;"
										>
											{readwiseError}
										</Text>
									{:else if !readwiseHasKey && readwiseValidationState !== 'validating'}
										<a
											href="https://readwise.io/access_token"
											target="_blank"
											rel="noopener noreferrer"
											class="mt-fieldGroup"
											style="max-width: 16rem;"
										>
											<Text
												variant="label"
												size="sm"
												color="accent-primary"
												class="hover:text-accent-hover underline transition-colors"
											>
												Get API key
											</Text>
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
