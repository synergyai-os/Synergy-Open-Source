<script lang="ts">
	import { Switch } from 'bits-ui';
	import { theme, isDark } from '$lib/stores/theme';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import type { FunctionReference, FunctionReturnType } from 'convex/server';
	import type { Id } from '../../../convex/_generated/dataModel';

	// Types for Convex hooks
	type UseQueryReturn<Query extends FunctionReference<'query'>> = {
		data: undefined;
		error: undefined;
		isLoading: true;
		isStale: false;
	} | {
		data: undefined;
		error: Error;
		isLoading: false;
		isStale: boolean;
	} | {
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
	type FunctionArgs<F extends FunctionReference<any>> = F extends FunctionReference<any, any, infer Args> ? Args : never;

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
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	
	// Get auth status to check if user is authenticated
	const auth = useAuth();
	const isAuthenticated = $derived(auth.isAuthenticated);
	
	// Call useConvexClient at top level (must be synchronous, during component init)
	// setupConvexAuth should have already set up the authenticated client context
	const convexClient = browser ? useConvexClient() : null;
	
	// Create function references using makeFunctionReference
	// Import at top level (safe to import, execution is guarded)
	import { makeFunctionReference } from 'convex/server';
	
	const settingsApiFunctions = browser ? {
		getUserSettings: makeFunctionReference('settings:getUserSettings') as any,
		updateClaudeApiKey: makeFunctionReference('settings:updateClaudeApiKey') as any,
		updateReadwiseApiKey: makeFunctionReference('settings:updateReadwiseApiKey') as any,
		updateTheme: makeFunctionReference('settings:updateTheme') as any,
		deleteClaudeApiKey: makeFunctionReference('settings:deleteClaudeApiKey') as any,
		deleteReadwiseApiKey: makeFunctionReference('settings:deleteReadwiseApiKey') as any,
		// CRITICAL: decryptApiKey removed - we NEVER decrypt keys on the client for security
	} : null;

	// Load settings using client.query (not useQuery, to keep it simple)
	let userSettings: UserSettings | null = $state(null);
	
		// Load settings when client is ready and user is authenticated
		onMount(async () => {
			if (!browser || !convexClient || !settingsApiFunctions || !isAuthenticated) {
				return;
			}
			
			try {
				const settings = await convexClient.query(settingsApiFunctions.getUserSettings, {});
				if (settings) {
					userSettings = settings as UserSettings;
					
					// SECURITY: NEVER decrypt keys on the client - only track if they exist
					// Keys are encrypted in the database and should NEVER be sent to the client
					// Use boolean flags from query to know if keys exist
					claudeHasKey = settings.hasClaudeKey || false;
					readwiseHasKey = settings.hasReadwiseKey || false;
					// Keep inputs empty - never display actual keys on client
				}
			} catch (e) {
				// Silently handle errors - user will see empty inputs
			}
		});
	
	// Mutation functions - created when client and functions are ready
	let updateClaudeApiKeyFn: ((args: { apiKey: string }) => Promise<string>) | null = $state(null);
	let updateReadwiseApiKeyFn: ((args: { apiKey: string }) => Promise<string>) | null = $state(null);
	let updateThemeFn: ((args: { theme: 'light' | 'dark' }) => Promise<string>) | null = $state(null);
	let deleteClaudeApiKeyFn: (() => Promise<string | null>) | null = $state(null);
	let deleteReadwiseApiKeyFn: (() => Promise<string | null>) | null = $state(null);

	// Initialize mutations and actions when ready
	$effect(() => {
		if (!browser || !convexClient || !settingsApiFunctions) return;
		
		// Create action functions for API key updates (they're actions, not mutations, because they validate via HTTP)
		updateClaudeApiKeyFn = ((args: { apiKey: string }) => 
			convexClient!.action(settingsApiFunctions.updateClaudeApiKey, args)) as typeof updateClaudeApiKeyFn;
		updateReadwiseApiKeyFn = ((args: { apiKey: string }) => 
			convexClient!.action(settingsApiFunctions.updateReadwiseApiKey, args)) as typeof updateReadwiseApiKeyFn;
		// Theme update is still a mutation (no validation needed)
		updateThemeFn = ((args: { theme: 'light' | 'dark' }) => 
			convexClient!.mutation(settingsApiFunctions.updateTheme, args)) as typeof updateThemeFn;
		// Delete functions are mutations
		deleteClaudeApiKeyFn = (() => 
			convexClient!.mutation(settingsApiFunctions.deleteClaudeApiKey, {})) as typeof deleteClaudeApiKeyFn;
		deleteReadwiseApiKeyFn = (() => 
			convexClient!.mutation(settingsApiFunctions.deleteReadwiseApiKey, {})) as typeof deleteReadwiseApiKeyFn;
	});

	// State for API keys (initialized from Convex)
	// CRITICAL: These are for user input ONLY - we NEVER store or display actual saved keys on the client
	let claudeApiKey = $state('');
	let readwiseApiKey = $state('');
	// Eye icons removed - we never show API keys on the client for security

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
		// Only validate if there's a value and we're not already validating
		if (!claudeApiKey.trim() || claudeValidationState === 'validating' || !updateClaudeApiKeyFn || !isAuthenticated) {
			return;
		}

		claudeValidationState = 'validating';
		claudeError = null;

		try {
			await updateClaudeApiKeyFn({ apiKey: claudeApiKey.trim() });
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
				.replace(/^\[CONVEX[^\]]+\]\s*\[Request ID:[^\]]+\]\s*Server Error\s*Uncaught Error:\s*/i, '')
				.replace(/\s*at handler[^]*$/i, '') // Remove "at handler (file:line)"
				.replace(/\s*Called by client.*$/i, '') // Remove "Called by client"
				.replace(/\([^)]+\/[^)]+\.ts:\d+:\d+\)/g, '') // Remove file paths like "(../convex/settings.ts:77:2)"
				.trim();
			
			// Simplify common error messages
			if (cleanMessage.includes('Invalid') || cleanMessage.includes('invalid')) {
				cleanMessage = 'Invalid API key. Please check your key and try again.';
			} else if (cleanMessage.includes('Authentication') || cleanMessage.includes('authentication')) {
				cleanMessage = 'Authentication failed. Please verify your API key.';
			} else if (cleanMessage.includes('format')) {
				cleanMessage = 'Invalid API key format.';
			}
			
			claudeError = cleanMessage || 'Invalid API key. Please check your key and try again.';
		}
	}

	// Handle blur validation for Readwise API key
	async function handleReadwiseKeyBlur() {
		// Only validate if there's a value and we're not already validating
		if (!readwiseApiKey.trim() || readwiseValidationState === 'validating' || !updateReadwiseApiKeyFn || !isAuthenticated) {
			return;
		}

		readwiseValidationState = 'validating';
		readwiseError = null;

		try {
			await updateReadwiseApiKeyFn({ apiKey: readwiseApiKey.trim() });
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
				.replace(/^\[CONVEX[^\]]+\]\s*\[Request ID:[^\]]+\]\s*Server Error\s*Uncaught Error:\s*/i, '')
				.replace(/\s*at handler[^]*$/i, '') // Remove "at handler (file:line)"
				.replace(/\s*Called by client.*$/i, '') // Remove "Called by client"
				.replace(/\([^)]+\/[^)]+\.ts:\d+:\d+\)/g, '') // Remove file paths like "(../convex/settings.ts:77:2)"
				.trim();
			
			// Simplify common error messages
			if (cleanMessage.includes('Invalid') || cleanMessage.includes('invalid')) {
				cleanMessage = 'Invalid API key. Please check your key and try again.';
			} else if (cleanMessage.includes('Authentication') || cleanMessage.includes('authentication')) {
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
		if (!deleteClaudeApiKeyFn) return;
		
		try {
			await deleteClaudeApiKeyFn();
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
		if (!deleteReadwiseApiKeyFn) return;
		
		try {
			await deleteReadwiseApiKeyFn();
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

<div class="h-screen bg-base overflow-y-auto">
	<div class="max-w-4xl mx-auto p-inbox-container">
		<!-- Page Title -->
		<h1 class="text-2xl font-bold text-primary mb-8">Settings</h1>

		<div class="flex flex-col gap-settings-section">
			<!-- General Section -->
			<section class="bg-elevated rounded-md border border-base">
				<div class="px-inbox-card py-inbox-card">
					<h2 class="text-base font-bold text-primary mb-6">General</h2>

					<div class="flex flex-col gap-settings-row">
						<!-- Theme Preference -->
						<div class="px-settings-row py-settings-row border-b border-base last:border-b-0">
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1 min-w-0">
									<label for="theme-toggle" class="block text-sm font-medium text-primary mb-1">
										Interface theme
									</label>
									<p class="text-sm text-secondary">
										Select your preferred color scheme
									</p>
								</div>
								<div class="flex items-center gap-icon" role="presentation">
									<span class="text-sm text-secondary">
										{$isDark ? 'Dark mode' : 'Light mode'}
									</span>
									{#if $isDark}
										<svg
											class="w-4 h-4 text-secondary flex-shrink-0"
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
											class="w-4 h-4 text-secondary flex-shrink-0"
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
										onCheckedChange={(checked) => {
											theme.setTheme(checked ? 'dark' : 'light');
										}}
										class="relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {$isDark ? 'bg-gray-900' : 'bg-gray-300'}"
									>
										<Switch.Thumb
											class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0 data-[state=checked]:translate-x-4"
										/>
									</Switch.Root>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- AI Section -->
			<section class="bg-elevated rounded-md border border-base">
				<div class="px-inbox-card py-inbox-card">
					<h2 class="text-base font-bold text-primary mb-6">AI</h2>

					<div class="flex flex-col gap-settings-row">
						<!-- Claude API Key -->
						<div class="px-settings-row py-settings-row border-b border-base last:border-b-0">
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1 min-w-0">
									<label for="claude-key" class="block text-sm font-medium text-primary mb-1">
										Claude API Key
									</label>
									<p class="text-sm text-secondary">
										Used for AI-powered flashcard generation from your content
									</p>
								</div>
								<div class="flex flex-col gap-1 flex-shrink-0">
									<div class="relative inline-block">
										<input
											id="claude-key"
											type="password"
											bind:value={claudeApiKey}
											oninput={(e) => handleClaudeKeyInput(e.currentTarget.value)}
											onblur={handleClaudeKeyBlur}
											disabled={claudeValidationState === 'validating'}
											placeholder={claudeHasKey ? '••••••••••••••••' : 'sk-...'}
											class="w-64 px-3 py-2 pr-10 text-sm bg-base border {claudeValidationState === 'valid'
												? 'border-green-500'
												: claudeValidationState === 'invalid'
													? 'border-red-500'
													: 'border-base'} rounded-md text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all {claudeValidationState === 'validating'
												? 'opacity-50 cursor-not-allowed'
												: ''}"
										/>
										<!-- Validation indicator icon / Delete button -->
										{#if claudeValidationState === 'validating'}
											<div class="absolute right-2 top-1/2 -translate-y-1/2">
												<svg
													class="w-4 h-4 text-tertiary animate-spin"
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
											<div class="absolute right-2 top-1/2 -translate-y-1/2">
												<svg
													class="w-5 h-5 text-green-500"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
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
												class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-red-500 transition-colors z-10"
												title="Remove API key"
											>
												<svg
													class="w-4 h-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										{:else if claudeValidationState === 'invalid'}
											<div class="absolute right-2 top-1/2 -translate-y-1/2">
												<svg
													class="w-4 h-4 text-red-500"
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
										<p class="text-xs text-green-500 mt-1 max-w-64">API key is valid and saved</p>
									{:else if claudeValidationState === 'invalid' && claudeError}
										<p class="text-xs text-red-500 mt-1 max-w-64">{claudeError}</p>
									{:else if !claudeHasKey && claudeValidationState !== 'validating'}
										<a
											href="https://console.anthropic.com/settings/keys"
											target="_blank"
											rel="noopener noreferrer"
											class="text-xs text-blue-500 hover:text-blue-600 mt-1 max-w-64 underline transition-colors"
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
			<section class="bg-elevated rounded-md border border-base">
				<div class="px-inbox-card py-inbox-card">
					<h2 class="text-base font-bold text-primary mb-6">Sources</h2>

					<div class="flex flex-col gap-settings-row">
						<!-- Readwise API Key -->
						<div class="px-settings-row py-settings-row border-b border-base last:border-b-0">
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1 min-w-0">
									<label
										for="readwise-key"
										class="block text-sm font-medium text-primary mb-1"
									>
										Readwise API Key
									</label>
									<p class="text-sm text-secondary">
										Import highlights and notes from your Readwise account
									</p>
								</div>
								<div class="flex flex-col gap-1 flex-shrink-0">
									<div class="relative inline-block">
										<input
											id="readwise-key"
											type="password"
											bind:value={readwiseApiKey}
											oninput={(e) => handleReadwiseKeyInput(e.currentTarget.value)}
											onblur={handleReadwiseKeyBlur}
											disabled={readwiseValidationState === 'validating'}
											placeholder={readwiseHasKey ? '••••••••••••••••' : 'token_...'}
											class="w-64 px-3 py-2 pr-10 text-sm bg-base border {readwiseValidationState === 'valid'
												? 'border-green-500'
												: readwiseValidationState === 'invalid'
													? 'border-red-500'
													: 'border-base'} rounded-md text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all {readwiseValidationState === 'validating'
												? 'opacity-50 cursor-not-allowed'
												: ''}"
										/>
										<!-- Validation indicator icon / Delete button -->
										{#if readwiseValidationState === 'validating'}
											<div class="absolute right-2 top-1/2 -translate-y-1/2">
												<svg
													class="w-4 h-4 text-tertiary animate-spin"
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
											<div class="absolute right-2 top-1/2 -translate-y-1/2">
												<svg
													class="w-5 h-5 text-green-500"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
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
												class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-red-500 transition-colors z-10"
												title="Remove API key"
											>
												<svg
													class="w-4 h-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										{:else if readwiseValidationState === 'invalid'}
											<div class="absolute right-2 top-1/2 -translate-y-1/2">
												<svg
													class="w-4 h-4 text-red-500"
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
										<p class="text-xs text-green-500 mt-1 max-w-64">API key is valid and saved</p>
									{:else if readwiseValidationState === 'invalid' && readwiseError}
										<p class="text-xs text-red-500 mt-1 max-w-64">{readwiseError}</p>
									{:else if !readwiseHasKey && readwiseValidationState !== 'validating'}
										<a
											href="https://readwise.io/access_token"
											target="_blank"
											rel="noopener noreferrer"
											class="text-xs text-blue-500 hover:text-blue-600 mt-1 max-w-64 underline transition-colors"
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

