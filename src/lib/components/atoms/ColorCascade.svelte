<!-- Color Cascade Visualization Component -->
<!-- Demonstrates the 3-layer color cascade architecture -->
<!-- Updated to match design-tokens-base.json structure -->

<script lang="ts">
	/**
	 * ColorCascade - Interactive Token Cascade Demo
	 *
	 * Demonstrates how tokens flow:
	 * Base (OKLCH values) → Semantic (references) → Components (CSS vars)
	 *
	 * Change color.brand.primary in design-tokens-base.json to rebrand the entire UI.
	 */
</script>

<div class="space-y-6 rounded-lg bg-base p-6">
	<!-- Header -->
	<div>
		<h2 class="mb-2 text-xl font-semibold text-primary">3-Layer Token Cascade</h2>
		<p class="text-sm text-secondary">
			All semantic tokens reference
			<code class="rounded bg-surface px-1 py-0.5">color.brand.primary</code>. Change it once → All
			UI updates automatically.
		</p>
	</div>

	<!-- Layer 1: Base Tokens (OKLCH Values) -->
	<div class="rounded-md border border-default bg-surface p-4">
		<h3 class="mb-2 font-semibold text-primary">Layer 1: Base Tokens</h3>
		<p class="mb-3 text-sm text-secondary">
			Hardcoded OKLCH values in <code class="rounded bg-elevated px-1 py-0.5"
				>design-tokens-base.json</code
			>
		</p>

		<div class="mb-4">
			<h4 class="mb-2 text-xs font-medium tracking-wide text-tertiary uppercase">Brand Colors</h4>
			<div class="grid grid-cols-3 gap-3">
				<div class="rounded border border-default bg-elevated p-3">
					<div
						class="mb-2 h-12 w-full rounded"
						style="background-color: var(--color-brand-primary);"
					></div>
					<code class="text-xs text-secondary">brand.primary</code>
					<p class="mt-1 text-xs text-tertiary">Deep Teal</p>
				</div>
				<div class="rounded border border-default bg-elevated p-3">
					<div
						class="mb-2 h-12 w-full rounded"
						style="background-color: var(--color-brand-secondary);"
					></div>
					<code class="text-xs text-secondary">brand.secondary</code>
					<p class="mt-1 text-xs text-tertiary">Warm Amber</p>
				</div>
				<div class="rounded border border-default bg-elevated p-3">
					<div
						class="mb-2 h-12 w-full rounded"
						style="background-color: var(--color-status-success);"
					></div>
					<code class="text-xs text-secondary">status.success</code>
					<p class="mt-1 text-xs text-tertiary">Success Green</p>
				</div>
			</div>
		</div>

		<div>
			<h4 class="mb-2 text-xs font-medium tracking-wide text-tertiary uppercase">Neutral Scale</h4>
			<div class="flex gap-1">
				{#each ['0', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950', '1000'] as n}
					<div class="flex flex-col items-center">
						<div
							class="h-8 w-6 rounded-sm border border-default"
							style="background-color: var(--color-neutral-{n});"
						></div>
						<span class="mt-1 text-[8px] text-tertiary">{n}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Layer 2: Semantic Tokens (References) -->
	<div class="rounded-md border border-default bg-surface p-4">
		<h3 class="mb-2 font-semibold text-primary">Layer 2: Semantic Tokens</h3>
		<p class="mb-3 text-sm text-secondary">
			Reference base tokens in
			<code class="rounded bg-elevated px-1 py-0.5">design-tokens-semantic.json</code>
			with light/dark mode variants
		</p>

		<div class="grid grid-cols-2 gap-4">
			<!-- Interactive Colors -->
			<div>
				<h4 class="mb-2 text-xs font-medium tracking-wide text-tertiary uppercase">Interactive</h4>
				<div class="space-y-2">
					<div class="flex items-center gap-2">
						<div
							class="h-6 w-6 rounded"
							style="background-color: var(--color-interactive-primary);"
						></div>
						<code class="text-xs text-secondary">interactive.primary</code>
						<span class="text-xs text-tertiary">→ {`{color.brand.primary}`}</span>
					</div>
					<div class="flex items-center gap-2">
						<div
							class="h-6 w-6 rounded"
							style="background-color: var(--color-interactive-primaryHover);"
						></div>
						<code class="text-xs text-secondary">interactive.primaryHover</code>
						<span class="text-xs text-tertiary">→ {`{color.brand.primaryDark}`}</span>
					</div>
				</div>
			</div>

			<!-- Background Colors -->
			<div>
				<h4 class="mb-2 text-xs font-medium tracking-wide text-tertiary uppercase">Backgrounds</h4>
				<div class="space-y-2">
					<div class="flex items-center gap-2">
						<div
							class="h-6 w-6 rounded border border-default"
							style="background-color: var(--color-bg-base);"
						></div>
						<code class="text-xs text-secondary">bg.base</code>
						<span class="text-xs text-tertiary">→ light: 0 / dark: 950</span>
					</div>
					<div class="flex items-center gap-2">
						<div
							class="h-6 w-6 rounded border border-default"
							style="background-color: var(--color-bg-surface);"
						></div>
						<code class="text-xs text-secondary">bg.surface</code>
						<span class="text-xs text-tertiary">→ light: 0 / dark: 900</span>
					</div>
				</div>
			</div>

			<!-- Text Colors -->
			<div>
				<h4 class="mb-2 text-xs font-medium tracking-wide text-tertiary uppercase">Text</h4>
				<div class="space-y-2">
					<div class="flex items-center gap-2">
						<div
							class="flex h-6 w-6 items-center justify-center rounded bg-base text-xs font-bold"
							style="color: var(--color-text-primary);"
						>
							Aa
						</div>
						<code class="text-xs text-secondary">text.primary</code>
						<span class="text-xs text-tertiary">→ light: 900 / dark: 0</span>
					</div>
					<div class="flex items-center gap-2">
						<div
							class="flex h-6 w-6 items-center justify-center rounded bg-base text-xs font-bold"
							style="color: var(--color-text-secondary);"
						>
							Aa
						</div>
						<code class="text-xs text-secondary">text.secondary</code>
						<span class="text-xs text-tertiary">→ light: 600 / dark: 400</span>
					</div>
				</div>
			</div>

			<!-- Border Colors -->
			<div>
				<h4 class="mb-2 text-xs font-medium tracking-wide text-tertiary uppercase">Borders</h4>
				<div class="space-y-2">
					<div class="flex items-center gap-2">
						<div
							class="h-6 w-6 rounded"
							style="border: 2px solid var(--color-border-default); background: transparent;"
						></div>
						<code class="text-xs text-secondary">border.default</code>
						<span class="text-xs text-tertiary">→ light: 200 / dark: 800</span>
					</div>
					<div class="flex items-center gap-2">
						<div
							class="h-6 w-6 rounded"
							style="border: 2px solid var(--color-border-focus); background: transparent;"
						></div>
						<code class="text-xs text-secondary">border.focus</code>
						<span class="text-xs text-tertiary">→ {`{color.brand.primary}`}</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Layer 3: Components -->
	<div class="rounded-md border border-default bg-surface p-4">
		<h3 class="mb-2 font-semibold text-primary">Layer 3: Components (Utility Classes)</h3>
		<p class="mb-3 text-sm text-secondary">
			Components use semantic tokens via utility classes. They update automatically when tokens
			change.
		</p>

		<div class="grid grid-cols-3 gap-4">
			<!-- Button Example -->
			<div class="rounded border border-default bg-elevated p-3">
				<button
					class="w-full rounded-button bg-accent-primary px-button-x py-button-y text-sm font-medium text-inverse transition-colors hover:bg-accent-hover"
				>
					Primary Button
				</button>
				<code class="mt-2 block text-xs text-tertiary">bg-accent-primary</code>
			</div>

			<!-- Card Example -->
			<div class="rounded-card border border-default bg-surface p-3 shadow-card">
				<p class="text-sm text-primary">Card Content</p>
				<p class="text-xs text-secondary">Secondary text</p>
				<code class="mt-2 block text-xs text-tertiary">bg-surface, shadow-card</code>
			</div>

			<!-- Badge Example -->
			<div class="flex flex-col items-start rounded border border-default bg-elevated p-3">
				<span
					class="inline-flex rounded-badge px-2 py-1 text-xs font-medium"
					style="background-color: var(--color-component-badge-brand-bg); color: var(--color-component-badge-brand-text);"
				>
					Brand Badge
				</span>
				<code class="mt-2 block text-xs text-tertiary">badge.brand.bg/text</code>
			</div>
		</div>
	</div>

	<!-- Rebrand Instructions -->
	<div class="rounded-md border border-strong bg-selected p-4">
		<h3 class="mb-2 font-semibold text-primary">🎨 How to Rebrand (10 Seconds)</h3>
		<ol class="list-inside list-decimal space-y-2 text-sm text-secondary">
			<li>
				Open
				<code class="rounded bg-elevated px-1 py-0.5">design-tokens-base.json</code>
			</li>
			<li>
				Find <code class="rounded bg-elevated px-1 py-0.5">color.brand.primary</code> (line ~11)
			</li>
			<li>
				Change: <code class="rounded bg-elevated px-1 py-0.5">"oklch(55% 0.15 195)"</code>
				(teal) →
				<code class="rounded bg-elevated px-1 py-0.5">"oklch(60% 0.18 250)"</code>
				(blue)
			</li>
			<li>
				Run
				<code class="rounded bg-elevated px-1 py-0.5">npm run tokens:build</code>
			</li>
			<li>Done! All UI elements now use the new color ✅</li>
		</ol>
	</div>

	<!-- Cascade Flow Diagram -->
	<div class="rounded-md border border-default bg-surface p-4">
		<h3 class="mb-3 font-semibold text-primary">Cascade Flow</h3>
		<div class="flex items-center justify-between text-center text-xs">
			<div class="rounded border border-default bg-elevated px-3 py-2">
				<div class="font-semibold text-primary">Base Token</div>
				<code class="text-tertiary">oklch(55% 0.15 195)</code>
			</div>
			<div class="text-secondary">→</div>
			<div class="rounded border border-default bg-elevated px-3 py-2">
				<div class="font-semibold text-primary">Semantic Token</div>
				<code class="text-tertiary">{`{color.brand.primary}`}</code>
			</div>
			<div class="text-secondary">→</div>
			<div class="rounded border border-default bg-elevated px-3 py-2">
				<div class="font-semibold text-primary">CSS Variable</div>
				<code class="text-tertiary">--color-interactive-primary</code>
			</div>
			<div class="text-secondary">→</div>
			<div class="rounded border border-default bg-elevated px-3 py-2">
				<div class="font-semibold text-primary">Utility Class</div>
				<code class="text-tertiary">bg-accent-primary</code>
			</div>
		</div>
	</div>
</div>
