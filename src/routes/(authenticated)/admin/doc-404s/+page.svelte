<script lang="ts">
	import type { PageData } from './$types';
	import { Badge, Button } from '$lib/components/ui';
	import { api, type Id } from '$lib/convex';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { browser } from '$app/environment';
	import { toast } from 'svelte-sonner';

	let { data }: { data: PageData } = $props();

	// Get sessionId function
	const getSessionId = () => data.sessionId;
	const sessionId = $derived(getSessionId());

	// Convex client (client-side only)
	const convexClient = browser ? useConvexClient() : null;

	// Queries (client-side only)
	const statsQuery = browser ? useQuery(api.docs.doc404Tracking.getStats, () => ({})) : null;
	const unresolvedQuery = browser
		? useQuery(api.docs.doc404Tracking.listUnresolved, () => ({}))
		: null;
	const allErrorsQuery = browser
		? useQuery(api.docs.doc404Tracking.listAll, () => ({ limit: 500 }))
		: null;

	// Derived data
	const stats = $derived(statsQuery?.data ?? null);
	const unresolved = $derived(unresolvedQuery?.data ?? []);
	const allErrors = $derived(allErrorsQuery?.data ?? []);

	// State
	let searchQuery = $state('');
	let filterResolved = $state<'all' | 'unresolved' | 'resolved'>('unresolved');
	let selectedError: ErrorItem | null = $state(null);
	let resolveNote = $state('');
	let resolving = $state(false);

	type ErrorItem = {
		_id: string;
		url: string;
		referrer?: string | null;
		count: number;
		firstSeenAt: number;
		lastSeenAt: number;
		resolved: boolean;
		resolvedAt?: number | null;
		resolvedBy?: string | null;
		resolutionNote?: string | null;
	};

	// Filtered errors
	const filteredErrors = $derived(() => {
		// Use allErrors for 'all' or 'resolved', unresolved for 'unresolved'
		const source = filterResolved === 'unresolved' ? unresolved : allErrors;

		if (!source || source.length === 0) return [];

		let filtered = source as ErrorItem[];

		// Filter by search
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(e) => e.url.toLowerCase().includes(query) || e.referrer?.toLowerCase().includes(query)
			);
		}

		// Filter by resolved status
		if (filterResolved === 'unresolved') {
			filtered = filtered.filter((e) => !e.resolved);
		} else if (filterResolved === 'resolved') {
			filtered = filtered.filter((e) => e.resolved);
		}

		// Sort by count (most hits first), then by lastSeenAt
		return filtered.sort((a, b) => {
			if (b.count !== a.count) return b.count - a.count;
			return b.lastSeenAt - a.lastSeenAt;
		});
	});

	// Group errors by pattern
	const errorPatterns = $derived(() => {
		if (!filteredErrors()) return [];

		const patterns: Record<string, { pattern: string; count: number; errors: ErrorItem[] }> = {};

		filteredErrors().forEach((error) => {
			// Extract pattern: e.g., "/dev-docs/2-areas/*" or "/dev-docs/*/system-architecture"
			const parts = error.url.split('/');
			let pattern = '';

			if (parts.length >= 4) {
				// Pattern: /dev-docs/2-areas/architecture/system-architecture -> /dev-docs/2-areas/architecture/*
				pattern = parts.slice(0, -1).join('/') + '/*';
			} else {
				pattern = error.url;
			}

			if (!patterns[pattern]) {
				patterns[pattern] = { pattern, count: 0, errors: [] };
			}

			const entry = patterns[pattern];
			entry.count += error.count;
			entry.errors.push(error);
		});

		return Object.values(patterns).sort((a, b) => b.count - a.count);
	});

	// Copy all errors to clipboard (formatted for easy fixing)
	function copyAllErrors() {
		if (!filteredErrors()) return;

		const text = `# Documentation 404 Errors - ${new Date().toISOString()}

Total Errors: ${filteredErrors().length}
Unresolved: ${filteredErrors().filter((e) => !e.resolved).length}
Resolved: ${filteredErrors().filter((e) => e.resolved).length}

## Errors to Fix:

${filteredErrors()
	.filter((e) => !e.resolved)
	.map((e, i) => {
		return `${i + 1}. **${e.url}**
   - Referrer: ${e.referrer || 'Direct access'}
   - Hits: ${e.count}
   - First Seen: ${new Date(e.firstSeenAt).toISOString()}
   - Last Seen: ${new Date(e.lastSeenAt).toISOString()}
   - Status: ${e.resolved ? 'RESOLVED' : 'UNRESOLVED'}
`;
	})
	.join('\n')}

## Resolved Errors:

${filteredErrors()
	.filter((e) => e.resolved)
	.map((e) => {
		return `- **${e.url}** (Resolved: ${e.resolvedAt ? new Date(e.resolvedAt).toISOString() : 'N/A'})
  ${e.resolutionNote ? `  Note: ${e.resolutionNote}` : ''}`;
	})
	.join('\n')}
`;

		if (browser) {
			navigator.clipboard.writeText(text);
			toast.success(`Copied ${filteredErrors().length} error details to clipboard`);
		}
	}

	// Copy single error
	function copyError(error: ErrorItem) {
		const text = `URL: ${error.url}
Referrer: ${error.referrer || 'N/A'}
Hits: ${error.count}
First Seen: ${new Date(error.firstSeenAt).toISOString()}
Last Seen: ${new Date(error.lastSeenAt).toISOString()}
${error.resolved ? `Resolved: ${new Date(error.resolvedAt!).toISOString()}` : 'Status: Unresolved'}
${error.resolutionNote ? `Note: ${error.resolutionNote}` : ''}`;

		if (browser) {
			navigator.clipboard.writeText(text);
			toast.success('Copied error details to clipboard');
		}
	}

	// Resolve error
	async function resolveError(error: ErrorItem) {
		if (!sessionId || !convexClient) {
			toast.error('Not authenticated or client not available');
			return;
		}

		resolving = true;
		try {
			await convexClient.mutation(api.docs.doc404Tracking.resolve404, {
				sessionId,
				id: error._id as Id<'doc404Errors'>,
				note: resolveNote || undefined
			});
			toast.success('Error marked as resolved');
			selectedError = null;
			resolveNote = '';
		} catch (error) {
			toast.error('Failed to resolve error: ' + (error as Error).message);
		} finally {
			resolving = false;
		}
	}

	// Format relative time
	function formatRelativeTime(timestamp: number): string {
		const seconds = Math.floor((Date.now() - timestamp) / 1000);
		if (seconds < 60) return `${seconds}s ago`;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	}
</script>

<svelte:head>
	<title>Documentation 404 Tracking - Admin</title>
</svelte:head>

<div class="flex h-full flex-col">
	<!-- Header -->
	<header class="border-b border-sidebar px-inbox-container py-system-content">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-h2 font-bold text-primary">Documentation 404 Tracking</h1>
				<p class="mt-form-field-gap text-small text-secondary">
					Track and resolve broken links in documentation
				</p>
			</div>
			{#if filteredErrors().length > 0}
				<Button onclick={copyAllErrors} variant="secondary">Copy All Errors</Button>
			{/if}
		</div>
	</header>

	<!-- Stats -->
	{#if stats}
		<div class="border-b border-sidebar px-inbox-container py-system-content">
			<div class="grid grid-cols-1 gap-content-section md:grid-cols-5">
				<div class="rounded-card border border-sidebar bg-surface px-card py-card">
					<p class="text-label text-tertiary">Total Errors</p>
					<p class="mt-form-field-gap text-h2 font-semibold text-primary">
						{stats.total || 0}
					</p>
				</div>
				<div class="rounded-card border border-sidebar bg-surface px-card py-card">
					<p class="text-label text-tertiary">Unresolved</p>
					<p
						class="mt-form-field-gap text-h2 font-semibold text-primary"
						style="color: var(--color-error, #ef4444);"
					>
						{stats.unresolved || 0}
					</p>
				</div>
				<div class="rounded-card border border-sidebar bg-surface px-card py-card">
					<p class="text-label text-tertiary">Resolved</p>
					<p
						class="mt-form-field-gap text-h2 font-semibold text-primary"
						style="color: var(--color-success, #10b981);"
					>
						{stats.resolved || 0}
					</p>
				</div>
				<div class="rounded-card border border-sidebar bg-surface px-card py-card">
					<p class="text-label text-tertiary">Total Hits</p>
					<p class="mt-form-field-gap text-h2 font-semibold text-primary">
						{stats.totalHits || 0}
					</p>
				</div>
				<div class="rounded-card border border-sidebar bg-surface px-card py-card">
					<p class="text-label text-tertiary">Unresolved Hits</p>
					<p
						class="mt-form-field-gap text-h2 font-semibold text-primary"
						style="color: var(--color-error, #ef4444);"
					>
						{stats.unresolvedHits || 0}
					</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Patterns Section -->
	{#if errorPatterns().length > 0}
		<div class="border-b border-sidebar px-inbox-container py-system-content">
			<h2 class="mb-content-section text-h3 font-semibold text-primary">Error Patterns</h2>
			<div class="space-y-form-field-gap">
				{#each errorPatterns().slice(0, 5) as pattern (pattern.pattern)}
					<div
						class="flex items-center justify-between rounded-card border border-sidebar bg-surface px-card py-card"
					>
						<div>
							<code class="text-small text-primary">{pattern.pattern}</code>
							<p class="mt-form-field-gap text-label text-secondary">
								{pattern.errors.length} unique {pattern.errors.length === 1 ? 'error' : 'errors'}, {pattern.count}
								total hits
							</p>
						</div>
						<span
							class="bg-error/10 inline-flex items-center rounded border border-error px-badge py-badge text-label font-medium text-error"
						>
							{pattern.count} hits
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Filters -->
	<div class="border-b border-sidebar px-inbox-container py-system-content">
		<div class="flex items-center gap-content-section">
			<div class="flex-1">
				<input
					type="text"
					placeholder="Search URLs or referrers..."
					bind:value={searchQuery}
					class="w-full rounded-input border border-sidebar bg-surface px-input-x py-input-y text-small text-primary placeholder:text-tertiary focus:border-accent-primary focus:outline-none"
				/>
			</div>
			<div class="flex gap-icon">
				<button
					onclick={() => (filterResolved = 'all')}
					class="rounded-button px-button-x py-button-y text-small transition-colors {filterResolved ===
					'all'
						? 'bg-accent-primary text-primary'
						: 'bg-surface text-secondary hover:bg-hover-solid'}"
				>
					All
				</button>
				<button
					onclick={() => (filterResolved = 'unresolved')}
					class="rounded-button px-button-x py-button-y text-small transition-colors {filterResolved ===
					'unresolved'
						? 'bg-accent-primary text-primary'
						: 'bg-surface text-secondary hover:bg-hover-solid'}"
				>
					Unresolved
				</button>
				<button
					onclick={() => (filterResolved = 'resolved')}
					class="rounded-button px-button-x py-button-y text-small transition-colors {filterResolved ===
					'resolved'
						? 'bg-accent-primary text-primary'
						: 'bg-surface text-secondary hover:bg-hover-solid'}"
				>
					Resolved
				</button>
			</div>
		</div>
	</div>

	<!-- Errors List -->
	<main class="flex-1 overflow-y-auto px-inbox-container py-system-content">
		{#if !browser || unresolvedQuery?.isLoading}
			<div class="flex items-center justify-center py-12">
				<p class="text-secondary">Loading...</p>
			</div>
		{:else if filteredErrors().length === 0}
			<div class="flex flex-col items-center justify-center py-readable-quote">
				<p class="text-h3 text-secondary">No errors found</p>
				<p class="mt-form-field-gap text-small text-tertiary">
					{#if filterResolved === 'unresolved'}
						All documentation links are working! 🎉
					{:else}
						Try adjusting your filters
					{/if}
				</p>
			</div>
		{:else}
			<div class="space-y-form-field-gap">
				{#each filteredErrors() as error (error._id)}
					<div
						class="rounded-card border border-sidebar bg-surface px-card py-card transition-colors hover:bg-hover-solid"
					>
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<div class="flex items-center gap-icon">
									<code class="text-small font-medium text-primary">{error.url}</code>
									{#if !error.resolved}
										<span
											class="bg-error/10 inline-flex items-center rounded border border-error px-badge py-badge text-label font-medium text-error"
										>
											Unresolved
										</span>
									{:else}
										<span
											class="bg-success/10 inline-flex items-center rounded border border-success px-badge py-badge text-label font-medium text-success"
										>
											Resolved
										</span>
									{/if}
									<Badge variant="default">{error.count} hits</Badge>
								</div>

								{#if error.referrer}
									<p class="mt-form-field-gap text-label text-secondary">
										From: <code class="text-tertiary">{error.referrer}</code>
									</p>
								{/if}

								<div
									class="mt-form-field-gap flex items-center gap-content-section text-label text-tertiary"
								>
									<span>First: {formatRelativeTime(error.firstSeenAt)}</span>
									<span>Last: {formatRelativeTime(error.lastSeenAt)}</span>
									{#if error.resolved && error.resolvedAt}
										<span style="color: var(--color-success, #10b981);"
											>Resolved: {formatRelativeTime(error.resolvedAt)}</span
										>
									{/if}
								</div>

								{#if error.resolutionNote}
									<p class="mt-form-field-gap text-label text-secondary">
										Note: {error.resolutionNote}
									</p>
								{/if}
							</div>

							<div class="ml-content-section flex items-center gap-icon">
								<button
									onclick={() => copyError(error)}
									class="rounded-button px-button-x py-button-y text-small text-secondary hover:bg-hover-solid hover:text-primary"
								>
									Copy
								</button>
								{#if !error.resolved}
									<Button variant="primary" onclick={() => (selectedError = error)}>Resolve</Button>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>

<!-- Resolve Modal -->
{#if selectedError}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		role="button"
		tabindex="-1"
		onclick={() => (selectedError = null)}
		onkeydown={(e) => {
			if (e.key === 'Escape' || e.key === 'Enter') {
				selectedError = null;
			}
		}}
	>
		<div
			class="w-full max-w-md rounded-card border border-sidebar bg-surface px-card py-card"
			role="dialog"
			aria-modal="true"
			aria-labelledby="resolve-error-title"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<h2 id="resolve-error-title" class="text-h3 font-semibold text-primary">Resolve Error</h2>
			<p class="mt-form-field-gap text-small text-secondary">
				<code>{selectedError.url}</code>
			</p>

			<div class="mt-content-section">
				<label for="resolve-note" class="block text-small font-medium text-primary"
					>Resolution Note</label
				>
				<textarea
					id="resolve-note"
					bind:value={resolveNote}
					placeholder="How was this fixed? (optional)"
					class="mt-form-field-gap w-full rounded-input border border-sidebar bg-surface px-input-x py-input-y text-small text-primary placeholder:text-tertiary focus:border-accent-primary focus:outline-none"
					rows="3"
				></textarea>
			</div>

			<div class="mt-settings-section flex justify-end gap-icon">
				<Button variant="secondary" onclick={() => (selectedError = null)}>Cancel</Button>
				<button
					onclick={() => {
						if (selectedError) {
							resolveError(selectedError);
						}
					}}
					disabled={resolving || !selectedError}
					class="inline-flex items-center justify-center gap-icon rounded-button bg-accent-primary px-button-x py-button-y text-small font-semibold text-primary transition-all duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
				>
					{resolving ? 'Resolving...' : 'Mark as Resolved'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	code {
		font-family:
			ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
		font-size: 0.875em;
		background: var(--color-bg-base);
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
	}
</style>
