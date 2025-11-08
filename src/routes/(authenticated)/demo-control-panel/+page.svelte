<script lang="ts">
	import * as ControlPanel from '$lib/components/control-panel';

	// Demo state
	let toolbarBold = $state(false);
	let toolbarItalic = $state(false);
	let toolbarCode = $state(false);
	
	let popoverOpen = $state(false);
	let popoverOption1 = $state(false);
	let popoverOption2 = $state(true);
	
	let embeddedActive = $state(false);
</script>

<div class="min-h-screen bg-base p-8">
	<div class="max-w-4xl mx-auto space-y-8">
		<!-- Header -->
		<div>
			<h1 class="text-3xl font-bold text-primary mb-2">Control Panel Component System</h1>
			<p class="text-secondary">
				Demo page showcasing all control panel variants, button states, and design tokens.
			</p>
		</div>

		<!-- Toolbar Variant -->
		<section class="space-y-4">
			<div>
				<h2 class="text-xl font-semibold text-primary mb-1">Toolbar Variant</h2>
				<p class="text-sm text-secondary">Fixed header with border-bottom (like notes editor)</p>
			</div>
			
			<div class="bg-elevated border border-base rounded-md overflow-hidden">
				<ControlPanel.Root variant="toolbar">
					<ControlPanel.Group>
						<ControlPanel.Button
							active={toolbarBold}
							onclick={() => (toolbarBold = !toolbarBold)}
							title="Bold"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"
								/>
							</svg>
						</ControlPanel.Button>

						<ControlPanel.Button
							active={toolbarItalic}
							onclick={() => (toolbarItalic = !toolbarItalic)}
							title="Italic"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<line x1="19" y1="4" x2="10" y2="4" stroke-width="2" />
								<line x1="14" y1="20" x2="5" y2="20" stroke-width="2" />
								<line x1="15" y1="4" x2="9" y2="20" stroke-width="2" />
							</svg>
						</ControlPanel.Button>

						<ControlPanel.Button
							active={toolbarCode}
							onclick={() => (toolbarCode = !toolbarCode)}
							title="Code"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
								/>
							</svg>
						</ControlPanel.Button>
					</ControlPanel.Group>

					<ControlPanel.Divider />

					<ControlPanel.Group>
						<ControlPanel.Button title="Undo">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
								/>
							</svg>
						</ControlPanel.Button>

						<ControlPanel.Button title="Redo">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
								/>
							</svg>
						</ControlPanel.Button>
					</ControlPanel.Group>
				</ControlPanel.Root>

				<div class="p-8 text-secondary">
					<p>Toolbar content area below the control panel...</p>
				</div>
			</div>

			<div class="text-sm text-secondary space-y-1">
				<p><strong>State:</strong></p>
				<p>Bold: {toolbarBold ? '✅ Active' : '⬜ Inactive'}</p>
				<p>Italic: {toolbarItalic ? '✅ Active' : '⬜ Inactive'}</p>
				<p>Code: {toolbarCode ? '✅ Active' : '⬜ Inactive'}</p>
			</div>
		</section>

		<!-- Popover Variant -->
		<section class="space-y-4">
			<div>
				<h2 class="text-xl font-semibold text-primary mb-1">Popover Variant</h2>
				<p class="text-sm text-secondary">Contextual floating panel (Notion-like)</p>
			</div>

			<div class="bg-elevated border border-base rounded-md p-8">
				<ControlPanel.Root variant="popover" bind:open={popoverOpen}>
					{#snippet trigger()}
						<button
							class="px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-hover transition-colors"
						>
							{popoverOpen ? 'Close Settings' : 'Open Settings'}
						</button>
					{/snippet}

					<ControlPanel.Group label="Options">
						<ControlPanel.Button
							active={popoverOption1}
							onclick={() => (popoverOption1 = !popoverOption1)}
							title="Option 1"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</ControlPanel.Button>

						<ControlPanel.Button
							active={popoverOption2}
							onclick={() => (popoverOption2 = !popoverOption2)}
							title="Option 2"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</ControlPanel.Button>
					</ControlPanel.Group>

					<ControlPanel.Divider />

					<ControlPanel.Group label="Actions">
						<ControlPanel.Button title="Save">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
								/>
							</svg>
						</ControlPanel.Button>
					</ControlPanel.Group>
				</ControlPanel.Root>
			</div>

			<div class="text-sm text-secondary space-y-1">
				<p><strong>State:</strong></p>
				<p>Popover Open: {popoverOpen ? '✅ Yes' : '⬜ No'}</p>
				<p>Option 1: {popoverOption1 ? '✅ Active' : '⬜ Inactive'}</p>
				<p>Option 2: {popoverOption2 ? '✅ Active' : '⬜ Inactive'}</p>
				<p class="text-tertiary italic">Try pressing ESC to close the popover</p>
			</div>
		</section>

		<!-- Embedded Variant -->
		<section class="space-y-4">
			<div>
				<h2 class="text-xl font-semibold text-primary mb-1">Embedded Variant</h2>
				<p class="text-sm text-secondary">Inline controls (sidebar actions, settings panels)</p>
			</div>

			<div class="bg-elevated border border-base rounded-md p-8">
				<div class="space-y-4">
					<h3 class="text-label text-tertiary uppercase tracking-wider">Actions</h3>
					
					<ControlPanel.Root variant="embedded">
						<ControlPanel.Button
							active={embeddedActive}
							onclick={() => (embeddedActive = !embeddedActive)}
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
							<span class="text-sm">Toggle View</span>
						</ControlPanel.Button>
					</ControlPanel.Root>
				</div>
			</div>

			<div class="text-sm text-secondary space-y-1">
				<p><strong>State:</strong></p>
				<p>View Active: {embeddedActive ? '✅ Active' : '⬜ Inactive'}</p>
			</div>
		</section>

		<!-- Button States Demo -->
		<section class="space-y-4">
			<div>
				<h2 class="text-xl font-semibold text-primary mb-1">Button States</h2>
				<p class="text-sm text-secondary">
					Hover, active, and disabled states using design tokens
				</p>
			</div>

			<div class="bg-elevated border border-base rounded-md p-8">
				<ControlPanel.Root variant="embedded">
					<ControlPanel.Group>
						<ControlPanel.Button title="Normal Button">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 4v16m8-8H4"
								/>
							</svg>
						</ControlPanel.Button>

						<ControlPanel.Button active={true} title="Active Button">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</ControlPanel.Button>

						<ControlPanel.Button disabled={true} title="Disabled Button">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</ControlPanel.Button>
					</ControlPanel.Group>
				</ControlPanel.Root>
			</div>

			<div class="text-sm text-secondary">
				<p class="text-tertiary italic">
					Hover over buttons to see hover states. Active button uses selected state. Disabled
					button is grayed out.
				</p>
			</div>
		</section>

		<!-- Design Tokens Reference -->
		<section class="space-y-4">
			<div>
				<h2 class="text-xl font-semibold text-primary mb-1">Design Tokens</h2>
				<p class="text-sm text-secondary">All control panels use semantic design tokens</p>
			</div>

			<div class="bg-elevated border border-base rounded-md p-6 space-y-4">
				<div>
					<h3 class="font-semibold text-primary mb-2">Spacing Tokens</h3>
					<ul class="text-sm text-secondary space-y-1">
						<li><code>p-control-panel-padding</code> - Panel container padding (12px)</li>
						<li><code>gap-control-group</code> - Gap between groups (8px)</li>
						<li><code>gap-control-item-gap</code> - Gap between buttons (4px)</li>
						<li><code>p-control-button-padding</code> - Button padding (8px)</li>
					</ul>
				</div>

				<div>
					<h3 class="font-semibold text-primary mb-2">Color Tokens</h3>
					<ul class="text-sm text-secondary space-y-1">
						<li><code>bg-control</code> - Panel background (adapts to theme)</li>
						<li><code>border-control-border</code> - Panel border</li>
						<li><code>bg-control-button-hover</code> - Button hover state</li>
						<li><code>bg-control-button-active</code> - Active button state</li>
					</ul>
				</div>
			</div>
		</section>

		<!-- Documentation Link -->
		<section class="bg-accent-primary/10 border border-accent-primary/20 rounded-md p-6">
			<h3 class="font-semibold text-primary mb-2">Documentation</h3>
			<p class="text-sm text-secondary mb-4">
				For full documentation, see:
			</p>
			<ul class="text-sm text-secondary space-y-1">
				<li>
					• <strong>Pattern:</strong>
					<code>dev-docs/patterns/ui-patterns.md#L620</code>
				</li>
				<li>
					• <strong>Tokens:</strong>
					<code>dev-docs/design-tokens.md</code> (Control Panel section)
				</li>
				<li>
					• <strong>Components:</strong>
					<code>src/lib/components/control-panel/</code>
				</li>
			</ul>
		</section>
	</div>
</div>

