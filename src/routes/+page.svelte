<script lang="ts">
	import { Accordion, Button } from 'bits-ui';
	import { Capacitor } from '@capacitor/core';
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';

	// Auth setup
	const auth = useAuth();
	const isAuthenticated = $derived(auth.isAuthenticated);
	const isLoading = $derived(auth.isLoading);
	const { signIn, signOut } = auth;

	// State for accordion
	let accordionValue = $state<string>('item-1');
	let buttonClickCount = $state(0);

	// Detect the current platform
	let platform = $derived(Capacitor.getPlatform());

	function handleButtonClick() {
		buttonClickCount++;
	}
</script>

<div class="container mx-auto max-w-4xl px-4 py-4 sm:py-8 min-h-screen">
	<!-- Auth Status Banner -->
	<div class="bg-blue-100 border-2 border-blue-500 rounded-lg p-4 mb-6">
		<h3 class="text-xl font-bold text-blue-900 mb-2">🔐 Authentication Status</h3>
		{#if isLoading}
			<p class="text-blue-800">Loading authentication state...</p>
		{:else if isAuthenticated}
			<div class="flex items-center justify-between">
				<p class="text-blue-800 font-medium">✅ You are authenticated!</p>
				<Button.Root
					onclick={() => signOut()}
					class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
				>
					Sign Out
				</Button.Root>
			</div>
		{:else}
			<div class="flex flex-col gap-3">
				<p class="text-blue-800">⚠️ You are not authenticated</p>
				<div class="flex gap-2">
					<a
						href="/login"
						class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
					>
						Sign In
					</a>
					<a
						href="/register"
						class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
					>
						Register
					</a>
				</div>
			</div>
		{/if}
	</div>

	<!-- Quick Navigation -->
	<section class="mb-8">
		<div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 shadow-lg">
			<h3 class="text-xl font-bold text-white mb-4">📚 Quick Navigation</h3>
			<div class="flex flex-wrap gap-3">
				<a
					href="/inbox"
					class="px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
				>
					📮 Inbox
				</a>
				<a
					href="/flashcards"
					class="px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
				>
					🎯 Flashcards
				</a>
			</div>
			<p class="text-indigo-100 text-sm mt-4">
				Try the full inbox workflow with mock data (Phase 1: UI/UX validation)
			</p>
		</div>
	</section>

	<!-- Platform-specific Welcome Message -->
	<section class="mb-8">
		{#if platform === 'ios'}
			<div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 shadow-lg">
				<div class="flex items-center gap-3 mb-2">
					<span class="text-3xl">📱</span>
					<h2 class="text-xl sm:text-2xl font-bold text-white">Welcome to Axon on iOS!</h2>
				</div>
				<p class="text-blue-100 text-base sm:text-lg">
					You're viewing the native iOS experience. Enjoy the full mobile app features!
				</p>
			</div>
		{:else if platform === 'web'}
			<div class="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 shadow-lg">
				<div class="flex items-center gap-3 mb-2">
					<span class="text-3xl">🌐</span>
					<h2 class="text-2xl font-bold text-white">Welcome to Axon on Web!</h2>
				</div>
				<p class="text-green-100 text-lg">
					You're viewing the web version. Accessible from any browser, anywhere!
				</p>
			</div>
		{:else}
			<div class="bg-gray-600 rounded-lg p-6 shadow-lg">
				<div class="flex items-center gap-3 mb-2">
					<span class="text-3xl">📲</span>
					<h2 class="text-2xl font-bold text-white">Welcome to Axon!</h2>
				</div>
				<p class="text-gray-200 text-lg">Platform: {platform}</p>
			</div>
		{/if}
	</section>

	<h1 class="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-gray-900">Bits UI Components Showcase</h1>

	<!-- Button Component -->
	<section class="mb-12">
		<h2 class="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Button</h2>
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
		<h2 class="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Accordion</h2>
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
