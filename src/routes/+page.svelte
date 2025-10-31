<script lang="ts">
	import { Accordion, Button } from 'bits-ui';

	// State for accordion
	let accordionValue = $state<string>('item-1');
	let buttonClickCount = $state(0);

	function handleButtonClick() {
		buttonClickCount++;
	}
</script>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<h1 class="text-4xl font-bold mb-8 text-gray-900">Bits UI Components Showcase</h1>

	<!-- Button Component -->
	<section class="mb-12">
		<h2 class="text-2xl font-semibold mb-4 text-gray-800">Button</h2>
		<div class="flex gap-4 items-center">
			<Button.Root
				onclick={handleButtonClick}
				class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
			>
				Click me! (Count: {buttonClickCount})
			</Button.Root>
			<Button.Root
				disabled
				class="px-6 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50"
			>
				Disabled Button
			</Button.Root>
		</div>
	</section>

	<!-- Accordion Component -->
	<section class="mb-12">
		<h2 class="text-2xl font-semibold mb-4 text-gray-800">Accordion</h2>
		<Accordion.Root type="single" bind:value={accordionValue} class="space-y-2">
			<Accordion.Item value="item-1" class="border border-gray-300 rounded-lg overflow-hidden">
				<Accordion.Header>
					<Accordion.Trigger
						class="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
					>
						<span class="font-medium">What is Bits UI?</span>
						<span class="text-gray-500" aria-hidden="true">▼</span>
					</Accordion.Trigger>
				</Accordion.Header>
				<Accordion.Content class="px-4 py-3 bg-white">
					<p class="text-gray-700">
						Bits UI is a headless component library for Svelte. It provides accessible,
						unstyled components that you can style however you want with Tailwind CSS or
						your own styles.
					</p>
				</Accordion.Content>
			</Accordion.Item>

			<Accordion.Item value="item-2" class="border border-gray-300 rounded-lg overflow-hidden">
				<Accordion.Header>
					<Accordion.Trigger
						class="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
					>
						<span class="font-medium">Why use headless components?</span>
						<span class="text-gray-500" aria-hidden="true">▼</span>
					</Accordion.Trigger>
				</Accordion.Header>
				<Accordion.Content class="px-4 py-3 bg-white">
					<p class="text-gray-700">
						Headless components give you full control over styling while handling all the
						complex accessibility and behavior logic. Perfect for custom design systems!
					</p>
				</Accordion.Content>
			</Accordion.Item>

			<Accordion.Item value="item-3" class="border border-gray-300 rounded-lg overflow-hidden">
				<Accordion.Header>
					<Accordion.Trigger
						class="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
					>
						<span class="font-medium">Built with Svelte 5</span>
						<span class="text-gray-500" aria-hidden="true">▼</span>
					</Accordion.Trigger>
				</Accordion.Header>
				<Accordion.Content class="px-4 py-3 bg-white">
					<p class="text-gray-700">
						Bits UI is built specifically for Svelte 5, using the latest runes ($state,
						$derived) and component patterns. It's modern, performant, and type-safe!
					</p>
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</section>
</div>
