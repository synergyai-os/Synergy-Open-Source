<script lang="ts">
	import { browser } from '$app/environment';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { hexToOKLCH, oklchToHex, generateHoverColor } from '$lib/utils/color-conversion';
	import { validateOrgColor } from '$lib/utils/wcag-validator';
	import FormInput from '$lib/components/atoms/FormInput.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import { toast } from '$lib/utils/toast';
	import type { Id } from '$lib/convex';

	let { data } = $props();

	// State
	let primaryColorHex = $state(
		data.orgBranding ? oklchToHex(data.orgBranding.primaryColor) : '#ff9500'
	);
	let secondaryColorHex = $state(
		data.orgBranding ? oklchToHex(data.orgBranding.secondaryColor) : '#ff9500'
	);
	let error = $state<string | null>(null);
	let warning = $state<string | null>(null);
	let saving = $state(false);

	// Convex client
	const convexClient = browser ? useConvexClient() : null;

	async function handleSave() {
		if (!convexClient) return;

		try {
			saving = true;
			error = null;
			warning = null;

			// Convert hex → OKLCH
			const primaryOKLCH = hexToOKLCH(primaryColorHex);
			const secondaryOKLCH = hexToOKLCH(secondaryColorHex);

			// Validate WCAG contrast (warnings only, don't block)
			const primaryValidation = validateOrgColor(primaryOKLCH);
			const secondaryValidation = validateOrgColor(secondaryOKLCH);

			// Collect warnings (non-blocking)
			const warnings: string[] = [];
			if (primaryValidation.warning) {
				warnings.push(`Primary: ${primaryValidation.warning}`);
			}
			if (secondaryValidation.warning) {
				warnings.push(`Secondary: ${secondaryValidation.warning}`);
			}

			if (warnings.length > 0) {
				warning =
					warnings.join('\n\n') +
					'\n\n' +
					(primaryValidation.suggestion || secondaryValidation.suggestion || '');
			}

			// Save to database
			await convexClient.mutation(api.workspaces.updateBranding, {
				sessionId: data.sessionId,
				workspaceId: data.workspaceId as Id<'workspaces'>,
				primaryColor: primaryOKLCH,
				secondaryColor: secondaryOKLCH
			});

			toast.success('Branding updated successfully');

			// Invalidate Convex queries to refetch branding data
			// Then reload page to apply branding (CSS needs to regenerate)
			if (browser && convexClient) {
				// Small delay to ensure mutation completes before reload
				setTimeout(() => {
					window.location.reload();
				}, 100);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save branding';
			toast.error(error);
		} finally {
			saving = false;
		}
	}

	// Live preview: Generate CSS for preview (use actual org class structure)
	const previewCSS = $derived.by(() => {
		try {
			const primaryOKLCH = hexToOKLCH(primaryColorHex);
			const secondaryOKLCH = hexToOKLCH(secondaryColorHex);
			// Use actual org class structure to match real implementation
			const orgId = data.workspaceId;
			if (!orgId) return '';
			// Generate CSS for the actual org class (matches +layout.svelte)
			// Generate hover color (10% darker)
			const hoverColor = generateHoverColor(primaryOKLCH);
			// Set brand-primary only - accent-primary and accent-hover cascade automatically from brand-primary
			// Use :root.org-{id} for higher specificity than :root alone
			return `:root.org-${orgId} { --color-brand-primary: ${primaryOKLCH}; --color-brand-secondary: ${secondaryOKLCH}; --color-brand-primaryHover: ${hoverColor}; }`;
		} catch {
			return '';
		}
	});

	// Org class for preview div (must match CSS selector)
	const previewOrgClass = $derived(`org-${data.workspaceId}`);
</script>

<svelte:head>
	{#if previewCSS}
		{@html `<style>${previewCSS}</style>`}
	{/if}
</svelte:head>

<div class="max-w-readable mx-auto px-card-padding py-card-padding">
	<h1 class="mb-spacing-section text-heading-xl font-heading">Organization Branding</h1>

	<div
		class="mb-spacing-section border-base overflow-hidden rounded-card border bg-surface p-card-padding"
	>
		<h2 class="mb-spacing-component text-heading-md font-heading">Brand Colors</h2>

		<!-- Primary Color -->
		<div class="mb-spacing-field">
			<FormInput
				id="primaryColor"
				label="Primary Brand Color"
				type="text"
				bind:value={primaryColorHex}
				placeholder="#ff9500"
			/>
			<input
				type="color"
				bind:value={primaryColorHex}
				class="mt-spacing-field h-input border-base rounded-input border"
			/>
		</div>

		<!-- Secondary Color -->
		<div class="mb-spacing-field">
			<FormInput
				id="secondaryColor"
				label="Secondary Brand Color"
				type="text"
				bind:value={secondaryColorHex}
				placeholder="#ff9500"
			/>
			<input
				type="color"
				bind:value={secondaryColorHex}
				class="mt-spacing-field h-input border-base rounded-input border"
			/>
		</div>

		<!-- Warning Message (non-blocking) -->
		{#if warning}
			<div
				class="mb-spacing-component rounded-notification border-accent-primary bg-accent-primary/10 p-notification text-accent-primary border whitespace-pre-line"
			>
				<strong>Note:</strong>
				{warning}
			</div>
		{/if}

		<!-- Error Message (blocking) -->
		{#if error}
			<div
				class="mb-spacing-component rounded-notification bg-error-bg p-notification text-error-text whitespace-pre-line"
			>
				{error}
			</div>
		{/if}

		<!-- Save Button -->
		<Button variant="primary" onclick={handleSave} disabled={saving}>
			{saving ? 'Saving...' : 'Save Branding'}
		</Button>
	</div>

	<!-- Live Preview -->
	<div
		class="{previewOrgClass} border-base overflow-hidden rounded-card border bg-surface p-card-padding"
	>
		<h2 class="mb-spacing-component text-heading-md font-heading">Live Preview</h2>
		<div class="gap-spacing-component flex">
			<Button variant="primary">Primary Button</Button>
			<Button variant="secondary">Secondary Button</Button>
		</div>
		<p class="mt-spacing-component text-primary">
			This preview shows how your brand colors will look in the UI.
		</p>
	</div>
</div>
