<script lang="ts">
	import { browser } from '$app/environment';
	import { Button, Card, Heading, Icon } from '$lib/components/atoms';

	// Refs for each component
	let buttonRef = $state<HTMLButtonElement | null>(null);
	let cardRef = $state<HTMLDivElement | null>(null);
	let headingRef = $state<HTMLHeadingElement | null>(null);
	let iconRef = $state<HTMLSpanElement | null>(null);

	// Test results
	let buttonTest = $state<string>('');
	let cardTest = $state<string>('');
	let headingTest = $state<string>('');
	let iconTest = $state<string>('');

	function testButton() {
		if (!browser) return;
		if (!buttonRef) {
			buttonTest = '❌ Ref is null';
			return;
		}
		buttonRef.focus();
		buttonTest = `✅ Focused! Tag: ${buttonRef.tagName}, Text: "${buttonRef.textContent?.trim()}"`;
	}

	function testCard() {
		if (!browser) return;
		if (!cardRef) {
			cardTest = '❌ Ref is null';
			return;
		}
		cardRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
		cardTest = `✅ Scrolled! Tag: ${cardRef.tagName}, Classes: "${cardRef.className.split(' ')[0]}"`;
	}

	function testHeading() {
		if (!browser) return;
		if (!headingRef) {
			headingTest = '❌ Ref is null';
			return;
		}
		headingTest = `✅ Works! Tag: ${headingRef.tagName}, Level: ${headingRef.tagName}, Text: "${headingRef.textContent?.trim()}"`;
	}

	function testIcon() {
		if (!browser) return;
		if (!iconRef) {
			iconTest = '❌ Ref is null';
			return;
		}
		iconTest = `✅ Works! Tag: ${iconRef.tagName}, Width: ${iconRef.offsetWidth}px`;
	}
</script>

<div class="bg-base min-h-screen p-8">
	<div class="mx-auto max-w-2xl space-y-12">
		<Heading level={1}>Ref Forwarding Test</Heading>

		<!-- Button Test -->
		<section class="space-y-4">
			<Heading level={2}>1. Button Component</Heading>
			<div class="space-y-3">
				<p class="text-secondary text-sm">Component with ref binding:</p>
				<Button bind:ref={buttonRef} variant="primary" onclick={testButton}
					>Target Button (has ref - click me!)</Button
				>
				<div class="flex items-center gap-3">
					<Button onclick={testButton} variant="secondary">Test Ref → Focus Button</Button>
					{#if buttonTest}
						<span class="text-secondary text-sm">{buttonTest}</span>
					{/if}
				</div>
			</div>
		</section>

		<!-- Card Test -->
		<section class="space-y-4">
			<Heading level={2}>2. Card Component</Heading>
			<div class="space-y-3">
				<p class="text-secondary text-sm">Component with ref binding:</p>
				<Card bind:ref={cardRef} variant="elevated">
					<p>Target Card (has ref)</p>
				</Card>
				<div class="flex items-center gap-3">
					<Button onclick={testCard} variant="secondary">Test Ref → Scroll Card</Button>
					{#if cardTest}
						<span class="text-secondary text-sm">{cardTest}</span>
					{/if}
				</div>
			</div>
		</section>

		<!-- Heading Test -->
		<section class="space-y-4">
			<Heading level={2}>3. Heading Component</Heading>
			<div class="space-y-3">
				<p class="text-secondary text-sm">Component with ref binding:</p>
				<Heading bind:ref={headingRef} level={3}>Target Heading (has ref)</Heading>
				<div class="flex items-center gap-3">
					<Button onclick={testHeading} variant="secondary">Test Ref → Read Heading</Button>
					{#if headingTest}
						<span class="text-secondary text-sm">{headingTest}</span>
					{/if}
				</div>
			</div>
		</section>

		<!-- Icon Test -->
		<section class="space-y-4">
			<Heading level={2}>4. Icon Component</Heading>
			<div class="space-y-3">
				<p class="text-secondary text-sm">Component with ref binding:</p>
				<Icon bind:ref={iconRef} size="lg">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M12 6v6l4 2" />
					</svg>
				</Icon>
				<div class="flex items-center gap-3">
					<Button onclick={testIcon} variant="secondary">Test Ref → Read Icon</Button>
					{#if iconTest}
						<span class="text-secondary text-sm">{iconTest}</span>
					{/if}
				</div>
			</div>
		</section>

		<!-- Icon-Only Button Test -->
		<section class="space-y-4">
			<Heading level={2}>5. Icon-Only Button</Heading>
			<div class="space-y-3">
				<p class="text-secondary text-sm">
					Icon-only buttons should have the same height as text buttons for perfect alignment:
				</p>
				<div class="flex items-center gap-4">
					<!-- Icon-only button (primary) -->
					<Button variant="primary" iconOnly ariaLabel="Download">
						<svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
							/>
						</svg>
					</Button>

					<!-- Icon-only button (outline) -->
					<Button variant="outline" iconOnly ariaLabel="More options">
						<svg class="icon-md" fill="currentColor" viewBox="0 0 20 20">
							<path
								d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
							/>
						</svg>
					</Button>

					<!-- Text button (for comparison) -->
					<Button variant="primary">Text Button</Button>
					<Button variant="secondary">Another Text Button</Button>
				</div>
				<p class="text-secondary text-sm">
					✅ All buttons should align perfectly (same height). Icon buttons use p-button-icon (12px)
					which matches py-button-y (12px) for text buttons.
				</p>
			</div>
		</section>
	</div>
</div>
