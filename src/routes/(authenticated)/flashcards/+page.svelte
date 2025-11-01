<script lang="ts">
	import { Button } from 'bits-ui';

	type Flashcard = {
		id: string;
		front: string;
		back: string;
		category: string;
		createdAt: Date;
		sourceTitle?: string;
	};

	// Mock flashcard data
	const mockFlashcards: Flashcard[] = $state([
		{
			id: '1',
			front: 'What is the Build-Measure-Learn cycle?',
			back: 'Build-Measure-Learn is the fundamental cycle for building products. Start with an MVP, measure customer behavior, and learn what works.',
			category: 'Product Delivery',
			createdAt: new Date('2024-01-16'),
			sourceTitle: 'The Lean Startup'
		},
		{
			id: '2',
			front: 'What is dual-track agile?',
			back: 'In dual-track agile, the discovery track runs parallel to the delivery track. Discovery focuses on understanding user needs and validating solutions before building.',
			category: 'Product Discovery',
			createdAt: new Date('2024-01-21'),
			sourceTitle: 'Product Discovery Workshop'
		},
		{
			id: '3',
			front: 'What traits define a product champion?',
			back: 'Product champions combine deep user empathy, clear product vision, and relentless execution. They bridge the gap between what users need and what we can build.',
			category: 'Leadership',
			createdAt: new Date('2024-02-02')
		},
		{
			id: '4',
			front: 'How often should you talk to customers?',
			back: 'Talk to at least one customer every week, even when it feels uncomfortable or you think you already know the answer.',
			category: 'Product Discovery',
			createdAt: new Date('2024-02-11'),
			sourceTitle: 'Continuous Discovery Habits'
		},
		{
			id: '5',
			front: 'What is more valuable: understanding "why" or "what" in user behavior?',
			back: 'Understanding the "why" behind user behavior is more valuable than tracking the "what". Focus on motivation and triggers.',
			category: 'Product Discovery',
			createdAt: new Date('2024-02-16'),
			sourceTitle: 'Hooked'
		}
	]);

	// UI State
	let viewMode = $state<'list' | 'study'>('list');
	let selectedCategory = $state<string>('all');
	let flippedCards = $state<Set<string>>(new Set());
	let currentStudyIndex = $state(0);

	// Computed values
	const categories = $derived(
		Array.from(new Set(mockFlashcards.map((f) => f.category))).sort()
	);

	const filteredFlashcards = $derived(
		selectedCategory === 'all'
			? mockFlashcards
			: mockFlashcards.filter((f) => f.category === selectedCategory)
	);

	const currentStudyCard = $derived(filteredFlashcards[currentStudyIndex]);

	// Actions
	function flipCard(cardId: string) {
		if (flippedCards.has(cardId)) {
			flippedCards.delete(cardId);
		} else {
			flippedCards.add(cardId);
		}
		// Force reactivity
		flippedCards = new Set(flippedCards);
	}

	function startStudyMode() {
		viewMode = 'study';
		currentStudyIndex = 0;
		flippedCards.clear();
	}

	function nextCard() {
		if (currentStudyIndex < filteredFlashcards.length - 1) {
			currentStudyIndex++;
			flippedCards.clear();
		}
	}

	function previousCard() {
		if (currentStudyIndex > 0) {
			currentStudyIndex--;
			flippedCards.clear();
		}
	}

	function deleteCard(cardId: string) {
		if (confirm('Delete this flashcard?')) {
			// In real app, this would call a mutation
			const index = mockFlashcards.findIndex((c) => c.id === cardId);
			if (index !== -1) {
				mockFlashcards.splice(index, 1);
			}
		}
	}
</script>

<!-- Main Content -->
<div class="h-full overflow-y-auto bg-surface">
		{#if viewMode === 'list'}
			<div class="p-6">
				<h2 class="text-2xl font-bold text-gray-900 mb-6">
					Flashcards ({filteredFlashcards.length})
				</h2>

				<!-- Flashcard Grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each filteredFlashcards as card}
						<div class="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-gray-400 transition-colors">
							<!-- Card Header -->
							<div class="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
								<span class="text-xs font-medium text-gray-600">{card.category}</span>
								<button
									type="button"
									class="text-gray-400 hover:text-red-600"
									onclick={() => deleteCard(card.id)}
								>
									🗑️
								</button>
							</div>

							<!-- Card Content -->
							<button
								type="button"
								class="w-full p-6 text-left cursor-pointer hover:bg-gray-50 transition-colors"
								onclick={() => flipCard(card.id)}
							>
								<!-- Front -->
								{#if !flippedCards.has(card.id)}
									<div>
										<p class="text-sm font-medium text-gray-500 mb-2">Front</p>
										<p class="text-lg font-semibold text-gray-900">{card.front}</p>
									</div>
								{:else}
									<!-- Back -->
									<div>
										<p class="text-sm font-medium text-gray-500 mb-2">Back</p>
										<p class="text-base text-gray-700 leading-relaxed">{card.back}</p>
										{#if card.sourceTitle}
											<p class="text-xs text-gray-400 mt-3">
												from {card.sourceTitle}
											</p>
										{/if}
									</div>
								{/if}
							</button>

							<!-- Flip Indicator -->
							<div class="px-4 py-2 bg-gray-50 border-t border-gray-200">
								<p class="text-xs text-center text-gray-500">
									Click to {flippedCards.has(card.id) ? 'see front' : 'flip card'}
								</p>
							</div>
						</div>
					{/each}
				</div>

				{#if filteredFlashcards.length === 0}
					<div class="text-center py-12">
						<p class="text-gray-500">No flashcards yet. Generate some from your inbox! 📚</p>
					</div>
				{/if}
			</div>
		{:else if viewMode === 'study'}
			<!-- Study Mode -->
			<div class="max-w-2xl mx-auto p-6">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-2xl font-bold text-gray-900">Study Mode</h2>
					<Button.Root
						onclick={() => (viewMode = 'list')}
						class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
					>
						← Back to List
					</Button.Root>
				</div>

				{#if currentStudyCard}
					<!-- Progress -->
					<div class="mb-6">
						<div class="flex items-center justify-between text-sm text-gray-600 mb-2">
							<span>Card {currentStudyIndex + 1} of {filteredFlashcards.length}</span>
							<span>
								{Math.round(((currentStudyIndex + 1) / filteredFlashcards.length) * 100)}%
							</span>
						</div>
						<div class="w-full bg-gray-200 rounded-full h-2">
							<div
								class="bg-blue-600 h-2 rounded-full transition-all duration-300"
								style="width: {((currentStudyIndex + 1) / filteredFlashcards.length) * 100}%"
							></div>
						</div>
					</div>

					<!-- Flashcard -->
					<div class="bg-white rounded-lg border-2 border-gray-300 shadow-lg min-h-[400px]">
						{#if !flippedCards.has(currentStudyCard.id)}
							<!-- Front -->
							<div class="p-12 text-center">
								<div class="text-sm text-gray-500 mb-4">{currentStudyCard.category}</div>
								<h3 class="text-2xl font-bold text-gray-900 leading-relaxed">
									{currentStudyCard.front}
								</h3>
							</div>
						{:else}
							<!-- Back -->
							<div class="p-12">
								<div class="text-sm text-gray-500 mb-4">
									{currentStudyCard.category}
									{#if currentStudyCard.sourceTitle}
										• {currentStudyCard.sourceTitle}
									{/if}
								</div>
								<p class="text-lg text-gray-700 leading-relaxed">{currentStudyCard.back}</p>
							</div>
						{/if}

						<!-- Flip Button -->
						<div class="p-6 border-t border-gray-200 text-center">
							<Button.Root
								onclick={() => flipCard(currentStudyCard.id)}
								class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
							>
								{flippedCards.has(currentStudyCard.id) ? 'Show Front' : 'Show Answer'}
							</Button.Root>
						</div>
					</div>

					<!-- Navigation -->
					<div class="flex items-center justify-between mt-6">
						<Button.Root
							onclick={previousCard}
							disabled={currentStudyIndex === 0}
							class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
						>
							← Previous
						</Button.Root>

						<Button.Root
							onclick={nextCard}
							disabled={currentStudyIndex === filteredFlashcards.length - 1}
							class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
						>
							Next →
						</Button.Root>
					</div>
				{/if}
			</div>
		{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>

