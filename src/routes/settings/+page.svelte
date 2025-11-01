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
		claudeApiKey?: string;
		readwiseApiKey?: string;
		_creationTime: number;
	};

	// Client-only: Convex hooks only work in browser
	type ConvexSvelte = typeof import('convex-svelte');
	type ConvexClient = import('convex/browser').ConvexClient;
	type ConvexApi = typeof import('$lib/convex').api;
	
	let useQuery: ConvexSvelte['useQuery'] | null = $state(null);
	let useConvexClient: (() => ConvexClient) | null = $state(null);
	let api: ConvexApi | null = $state(null);
	
	// Query result type (will be properly typed once Convex generates API types)
	let userSettings: UseQueryReturn<any> | null = $state(null);
	
	// Mutation function types (return table IDs as strings)
	let updateClaudeApiKeyFn: ((args: { apiKey: string }) => Promise<string>) | null = $state(null);
	let updateReadwiseApiKeyFn: ((args: { apiKey: string }) => Promise<string>) | null = $state(null);
	let updateThemeFn: ((args: { theme: 'light' | 'dark' }) => Promise<string>) | null = $state(null);

	// Initialize Convex only in browser
	onMount(async () => {
		if (!browser) return;

		const convexSvelte = await import('convex-svelte');
		useQuery = convexSvelte.useQuery;
		useConvexClient = convexSvelte.useConvexClient;
		api = (await import('$lib/convex')).api;

		// Initialize queries and mutations
		// Note: TypeScript may not see api.settings until Convex dev server generates types
		// Using runtime checks for safety
		if (useQuery && api && 'settings' in api) {
			const settingsApi = (api as any).settings;
			userSettings = useQuery(settingsApi.getUserSettings, () => ({})) as typeof userSettings;
		}
		if (useConvexClient && api && 'settings' in api) {
			const client = useConvexClient();
			const settingsApi = (api as any).settings;
			// Create mutation functions using client.mutation (proper pattern from docs)
			updateClaudeApiKeyFn = ((args: { apiKey: string }) => 
				client.mutation(settingsApi.updateClaudeApiKey, args)) as typeof updateClaudeApiKeyFn;
			updateReadwiseApiKeyFn = ((args: { apiKey: string }) => 
				client.mutation(settingsApi.updateReadwiseApiKey, args)) as typeof updateReadwiseApiKeyFn;
			updateThemeFn = ((args: { theme: 'light' | 'dark' }) => 
				client.mutation(settingsApi.updateTheme, args)) as typeof updateThemeFn;
		}
	});

	// State for API keys (initialized from Convex)
	let claudeApiKey = $state('');
	let readwiseApiKey = $state('');
	let showClaudeKey = $state(false);
	let showReadwiseKey = $state(false);

	// Initialize from Convex data
	$effect(() => {
		if (browser && userSettings && !userSettings.isLoading && userSettings.data) {
			const settings = userSettings.data as UserSettings | null;
			if (settings) {
				claudeApiKey = settings.claudeApiKey || '';
				readwiseApiKey = settings.readwiseApiKey || '';
			}
		}
	});

	// Auto-save states
	let claudeSaving = $state(false);
	let claudeSaved = $state(false);
	let claudeError = $state<string | null>(null);
	let readwiseSaving = $state(false);
	let readwiseSaved = $state(false);
	let readwiseError = $state<string | null>(null);

	// Debounce timers
	let claudeDebounceTimer: ReturnType<typeof setTimeout> | null = null;
	let readwiseDebounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Auto-save handlers with 500ms debounce
	async function handleClaudeKeyChange(value: string) {
		claudeApiKey = value;
		claudeSaved = false;
		claudeError = null;

		if (claudeDebounceTimer) {
			clearTimeout(claudeDebounceTimer);
		}

		// Don't attempt to save if mutation not ready
		if (!updateClaudeApiKeyFn) {
			return;
		}

		claudeSaving = true;
		claudeDebounceTimer = setTimeout(async () => {
			// Double-check mutation is available
			if (!updateClaudeApiKeyFn) {
				claudeSaving = false;
				claudeError = 'Not ready to save. Please wait...';
				return;
			}
			try {
				await updateClaudeApiKeyFn({ apiKey: value });
				claudeSaving = false;
				claudeSaved = true;
				claudeError = null;
				setTimeout(() => {
					claudeSaved = false;
				}, 2000);
			} catch (error) {
				claudeSaving = false;
				claudeError = error instanceof Error ? error.message : 'Failed to save';
				console.error('Failed to save Claude API key:', error);
			}
		}, 500);
	}

	async function handleReadwiseKeyChange(value: string) {
		readwiseApiKey = value;
		readwiseSaved = false;
		readwiseError = null;

		if (readwiseDebounceTimer) {
			clearTimeout(readwiseDebounceTimer);
		}

		// Don't attempt to save if mutation not ready
		if (!updateReadwiseApiKeyFn) {
			return;
		}

		readwiseSaving = true;
		readwiseDebounceTimer = setTimeout(async () => {
			// Double-check mutation is available
			if (!updateReadwiseApiKeyFn) {
				readwiseSaving = false;
				readwiseError = 'Not ready to save. Please wait...';
				return;
			}
			try {
				await updateReadwiseApiKeyFn({ apiKey: value });
				readwiseSaving = false;
				readwiseSaved = true;
				readwiseError = null;
				setTimeout(() => {
					readwiseSaved = false;
				}, 2000);
			} catch (error) {
				readwiseSaving = false;
				readwiseError = error instanceof Error ? error.message : 'Failed to save';
				console.error('Failed to save Readwise API key:', error);
			}
		}, 500);
	}

	// Cleanup timers
	$effect(() => {
		return () => {
			if (claudeDebounceTimer) clearTimeout(claudeDebounceTimer);
			if (readwiseDebounceTimer) clearTimeout(readwiseDebounceTimer);
		};
	});
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
								<div class="flex items-center gap-icon flex-shrink-0">
									<div class="relative">
										<input
											id="claude-key"
											type={showClaudeKey ? 'text' : 'password'}
											bind:value={claudeApiKey}
											oninput={(e) => handleClaudeKeyChange(e.currentTarget.value)}
											placeholder="sk-..."
											class="w-64 px-3 py-2 text-sm bg-base border border-base rounded-md text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
										<button
											type="button"
											onclick={() => (showClaudeKey = !showClaudeKey)}
											class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
										>
											{#if showClaudeKey}
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
														d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
													/>
												</svg>
											{:else}
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
														d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
													/>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
													/>
												</svg>
											{/if}
										</button>
									</div>
									{#if claudeSaving}
										<span class="text-label text-tertiary">Saving...</span>
									{:else if claudeSaved}
										<span class="text-label text-green-600">Saved</span>
									{:else if claudeError}
										<span class="text-label text-red-600" title={claudeError}>
											Error: {claudeError}
										</span>
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
								<div class="flex items-center gap-icon flex-shrink-0">
									<div class="relative">
										<input
											id="readwise-key"
											type={showReadwiseKey ? 'text' : 'password'}
											bind:value={readwiseApiKey}
											oninput={(e) => handleReadwiseKeyChange(e.currentTarget.value)}
											placeholder="token_..."
											class="w-64 px-3 py-2 text-sm bg-base border border-base rounded-md text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
										<button
											type="button"
											onclick={() => (showReadwiseKey = !showReadwiseKey)}
											class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
										>
											{#if showReadwiseKey}
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
														d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
													/>
												</svg>
											{:else}
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
														d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
													/>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
													/>
												</svg>
											{/if}
										</button>
									</div>
									{#if readwiseSaving}
										<span class="text-label text-tertiary">Saving...</span>
									{:else if readwiseSaved}
										<span class="text-label text-green-600">Saved</span>
									{:else if readwiseError}
										<span class="text-label text-red-600" title={readwiseError}>
											Error: {readwiseError}
										</span>
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

