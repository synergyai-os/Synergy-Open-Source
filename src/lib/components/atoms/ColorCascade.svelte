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

<div class="bg-base space-y-6 rounded-lg p-6">
	<!-- Header -->
	<div>
		<h2 class="text-primary mb-2 text-xl font-semibold">3-Layer Token Cascade</h2>
		<p class="text-secondary text-sm">
			All semantic tokens reference
			<code class="bg-surface rounded px-1 py-0.5">color.brand.primary</code>. Change it once → All
			UI updates automatically.
		</p>
	</div>

	<!-- Layer 1: Base Tokens (OKLCH Values) -->
	<div class="border-default bg-surface rounded-md border p-4">
		<h3 class="text-primary mb-2 font-semibold">Layer 1: Base Tokens</h3>
		<p class="text-secondary mb-3 text-sm">
			Hardcoded OKLCH values in <code class="bg-elevated rounded px-1 py-0.5"
				>design-tokens-base.json</code
			>
		</p>

		<div class="mb-4">
			<h4 class="text-tertiary mb-2 text-xs font-medium tracking-wide uppercase">Brand Colors</h4>
			<div class="grid grid-cols-3 gap-3">
				<div class="border-default bg-elevated rounded border p-3">
					<div
						class="mb-2 h-12 w-full rounded"
						style="background-color: var(--color-brand-primary);"
					></div>
					<code class="text-secondary text-xs">brand.primary</code>
					<p class="text-tertiary mt-1 text-xs">Deep Teal</p>
				</div>
				<div class="border-default bg-elevated rounded border p-3">
					<div
						class="mb-2 h-12 w-full rounded"
						style="background-color: var(--color-brand-secondary);"
					></div>
					<code class="text-secondary text-xs">brand.secondary</code>
					<p class="text-tertiary mt-1 text-xs">Warm Amber</p>
				</div>
				<div class="border-default bg-elevated rounded border p-3">
					<div
						class="mb-2 h-12 w-full rounded"
						style="background-color: var(--color-status-success);"
					></div>
					<code class="text-secondary text-xs">status.success</code>
					<p class="text-tertiary mt-1 text-xs">Success Green</p>
				</div>
			</div>
		</div>

		<div>
			<h4 class="text-tertiary mb-2 text-xs font-medium tracking-wide uppercase">Neutral Scale</h4>
			<div class="flex gap-1">
				{#each ['0', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950', '1000'] as n (n)}
					<div class="flex flex-col items-center">
						<div
							class="border-default h-8 w-6 rounded-sm border"
							style="background-color: var(--color-neutral-{n});"
						></div>
						<span class="text-tertiary mt-1 text-[8px]">{n}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Layer 2: Semantic Tokens (References) -->
	<div class="border-default bg-surface rounded-md border p-4">
		<h3 class="text-primary mb-2 font-semibold">Layer 2: Semantic Tokens</h3>
		<p class="text-secondary mb-3 text-sm">
			Reference base tokens in
			<code class="bg-elevated rounded px-1 py-0.5">design-tokens-semantic.json</code>
			with light/dark mode variants
		</p>

		<div class="grid grid-cols-2 gap-4">
			<!-- Interactive Colors -->
			<div>
				<h4 class="text-tertiary mb-2 text-xs font-medium tracking-wide uppercase">Interactive</h4>
				<div class="space-y-2">
					<div class="flex items-center gap-2">
						<div
							class="h-6 w-6 rounded"
							style="background-color: var(--color-interactive-primary);"
						></div>
						<code class="text-secondary text-xs">interactive.primary</code>
						<span class="text-tertiary text-xs">→ {`{color.brand.primary}`}</span>
					</div>
					<div class="flex items-center gap-2">
						<div
							class="h-6 w-6 rounded"
							style="background-color: var(--color-interactive-primaryHover);"
						></div>
						<code class="text-secondary text-xs">interactive.primaryHover</code>
						<span class="text-tertiary text-xs">→ {`{color.brand.primaryDark}`}</span>
					</div>
				</div>
			</div>

			<!-- Background Colors -->
			<div>
				<h4 class="text-tertiary mb-2 text-xs font-medium tracking-wide uppercase">Backgrounds</h4>
				<div class="space-y-2">
					<div class="flex items-center gap-2">
						<div
							class="border-default h-6 w-6 rounded border"
							style="background-color: var(--color-bg-base);"
						></div>
						<code class="text-secondary text-xs">bg.base</code>
						<span class="text-tertiary text-xs">→ light: 0 / dark: 950</span>
					</div>
					<div class="flex items-center gap-2">
						<div
							class="border-default h-6 w-6 rounded border"
							style="background-color: var(--color-bg-surface);"
						></div>
						<code class="text-secondary text-xs">bg.surface</code>
						<span class="text-tertiary text-xs">→ light: 0 / dark: 900</span>
					</div>
				</div>
			</div>

			<!-- Text Colors -->
			<div>
				<h4 class="text-tertiary mb-2 text-xs font-medium tracking-wide uppercase">Text</h4>
				<div class="space-y-2">
					<div class="flex items-center gap-2">
						<div
							class="bg-base flex h-6 w-6 items-center justify-center rounded text-xs font-bold"
							style="color: var(--color-text-primary);"
						>
							Aa
						</div>
						<code class="text-secondary text-xs">text.primary</code>
						<span class="text-tertiary text-xs">→ light: 900 / dark: 0</span>
					</div>
					<div class="flex items-center gap-2">
						<div
							class="bg-base flex h-6 w-6 items-center justify-center rounded text-xs font-bold"
							style="color: var(--color-text-secondary);"
						>
							Aa
						</div>
						<code class="text-secondary text-xs">text.secondary</code>
						<span class="text-tertiary text-xs">→ light: 600 / dark: 400</span>
					</div>
				</div>
			</div>

			<!-- Border Colors -->
			<div>
				<h4 class="text-tertiary mb-2 text-xs font-medium tracking-wide uppercase">Borders</h4>
				<div class="space-y-2">
					<div class="flex items-center gap-2">
						<div
							class="h-6 w-6 rounded"
							style="border: 2px solid var(--color-border-default); background: transparent;"
						></div>
						<code class="text-secondary text-xs">border.default</code>
						<span class="text-tertiary text-xs">→ light: 200 / dark: 800</span>
					</div>
					<div class="flex items-center gap-2">
						<div
							class="h-6 w-6 rounded"
							style="border: 2px solid var(--color-border-focus); background: transparent;"
						></div>
						<code class="text-secondary text-xs">border.focus</code>
						<span class="text-tertiary text-xs">→ {`{color.brand.primary}`}</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Layer 3: Components -->
	<div class="border-default bg-surface rounded-md border p-4">
		<h3 class="text-primary mb-2 font-semibold">Layer 3: Components (Utility Classes)</h3>
		<p class="text-secondary mb-3 text-sm">
			Components use semantic tokens via utility classes. They update automatically when tokens
			change.
		</p>

		<div class="grid grid-cols-3 gap-4">
			<!-- Button Example -->
			<div class="border-default bg-elevated rounded border p-3">
				<button
					class="rounded-button bg-accent-primary px-button-x py-button-y text-inverse hover:bg-accent-hover w-full text-sm font-medium transition-colors"
				>
					Primary Button
				</button>
				<code class="text-tertiary mt-2 block text-xs">bg-accent-primary</code>
			</div>

			<!-- Card Example -->
			<div class="rounded-card border-default bg-surface shadow-card border p-3">
				<p class="text-primary text-sm">Card Content</p>
				<p class="text-secondary text-xs">Secondary text</p>
				<code class="text-tertiary mt-2 block text-xs">bg-surface, shadow-card</code>
			</div>

			<!-- Badge Example -->
			<div class="border-default bg-elevated flex flex-col items-start rounded border p-3">
				<span
					class="rounded-badge inline-flex px-2 py-1 text-xs font-medium"
					style="background-color: var(--color-component-badge-brand-bg); color: var(--color-component-badge-brand-text);"
				>
					Brand Badge
				</span>
				<code class="text-tertiary mt-2 block text-xs">badge.brand.bg/text</code>
			</div>
		</div>
	</div>

	<!-- Rebrand Instructions -->
	<div class="border-strong bg-selected rounded-md border p-4">
		<h3 class="text-primary mb-2 font-semibold">🎨 How to Rebrand (10 Seconds)</h3>
		<ol class="text-secondary list-inside list-decimal space-y-2 text-sm">
			<li>
				Open
				<code class="bg-elevated rounded px-1 py-0.5">design-tokens-base.json</code>
			</li>
			<li>
				Find <code class="bg-elevated rounded px-1 py-0.5">color.brand.primary</code> (line ~11)
			</li>
			<li>
				Change: <code class="bg-elevated rounded px-1 py-0.5">"oklch(55% 0.15 195)"</code>
				(teal) →
				<code class="bg-elevated rounded px-1 py-0.5">"oklch(60% 0.18 250)"</code>
				(blue)
			</li>
			<li>
				Run
				<code class="bg-elevated rounded px-1 py-0.5">npm run tokens:build</code>
			</li>
			<li>Done! All UI elements now use the new color ✅</li>
		</ol>
	</div>

	<!-- Cascade Flow Diagram -->
	<div class="border-default bg-surface rounded-md border p-4">
		<h3 class="text-primary mb-3 font-semibold">Cascade Flow</h3>
		<div class="flex items-center justify-between text-center text-xs">
			<div class="border-default bg-elevated rounded border px-3 py-2">
				<div class="text-primary font-semibold">Base Token</div>
				<code class="text-tertiary">oklch(55% 0.15 195)</code>
			</div>
			<div class="text-secondary">→</div>
			<div class="border-default bg-elevated rounded border px-3 py-2">
				<div class="text-primary font-semibold">Semantic Token</div>
				<code class="text-tertiary">{`{color.brand.primary}`}</code>
			</div>
			<div class="text-secondary">→</div>
			<div class="border-default bg-elevated rounded border px-3 py-2">
				<div class="text-primary font-semibold">CSS Variable</div>
				<code class="text-tertiary">--color-interactive-primary</code>
			</div>
			<div class="text-secondary">→</div>
			<div class="border-default bg-elevated rounded border px-3 py-2">
				<div class="text-primary font-semibold">Utility Class</div>
				<code class="text-tertiary">bg-accent-primary</code>
			</div>
		</div>
	</div>
</div>
